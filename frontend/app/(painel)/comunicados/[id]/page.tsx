"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { API_URL } from "@/lib/api";

// Tipagem baseada no retorno real do ComunicadoService
type Comunicado = {
	id: number;
	titulo: string;
	conteudo: string;
	publicado_em: string;
	atualizado_em: string;
	autor: {
		id: number;
		nome: string;
	};
};

export default function ComunicadoDetalhePage() {
	const params = useParams(); // Pega o [id] da URL
	const comunicadoId = params.id;

	const [comunicado, setComunicado] = useState<Comunicado | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [erro, setErro] = useState("");

	// estado para guardar se é admin ou não
	const [isAdmin, setIsAdmin] = useState(false);

	useEffect(() => {
		// Lê o localStorage para saber o cargo do usuário
		const usuarioStorage = localStorage.getItem("defesa-civil.usuario");
		if (usuarioStorage) {
			try {
				const usuario = JSON.parse(usuarioStorage);
				setIsAdmin(usuario?.cargo === "ADMIN");
			} catch (error) {
				console.error("Erro ao ler usuário do localStorage", error);
			}
		}

		if (comunicadoId) {
			carregarComunicado();
		}
	}, [comunicadoId]);

	async function carregarComunicado() {
		setIsLoading(true);
		setErro("");
		try {
			const token = localStorage.getItem("defesa-civil.token");
			const res = await fetch(`${API_URL}/comunicados/${comunicadoId}`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			if (res.status === 404) {
				throw new Error("Comunicado não encontrado.");
			}

			if (!res.ok) {
				throw new Error("Falha ao carregar o comunicado.");
			}

			const data = await res.json();
			setComunicado(data);
		} catch (error: any) {
			setErro(error.message || "Não foi possível carregar o comunicado. Tente novamente mais tarde.");
		} finally {
			setIsLoading(false);
		}
	}

	// Formata a data que vem do banco (ISO) para o padrão brasileiro
	const formatarData = (dataIso: string) => {
		const data = new Date(dataIso);
		return new Intl.DateTimeFormat("pt-BR", {
			day: "2-digit",
			month: "long",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		}).format(data);
	};

	// Verifica se o comunicado foi editado após a publicação
	const foiEditado =
		comunicado != null &&
		new Date(comunicado.atualizado_em).getTime() -
			new Date(comunicado.publicado_em).getTime() >
			1000;

	return (
		<div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl mx-auto">

			{/* Cabeçalho / Voltar */}
			<div className="flex flex-col gap-2">
				<Link
					href="/comunicados"
					className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-[#003882] transition-colors w-fit"
				>
					<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
						<path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
					</svg>
					Voltar para comunicados
				</Link>
			</div>

			{isLoading ? (
				<div className="flex h-64 items-center justify-center text-slate-500">
					Carregando comunicado...
				</div>
			) : erro ? (
				<div className="flex flex-col gap-4">
					<div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
						{erro}
					</div>
					<Link
						href="/comunicados"
						className="w-fit rounded-lg bg-[#003882] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#002456]"
					>
						Ver todos os comunicados
					</Link>
				</div>
			) : comunicado ? (
				<article className="overflow-hidden rounded-xl border border-[#e2e8f0] bg-white shadow-sm">

					{/* Faixa institucional (bandeira de Pernambuco) */}
					<div className="flex h-1.5 w-full">
						<div className="h-full w-1/4 bg-[#003882]"></div>
						<div className="h-full w-1/4 bg-[#E1001A]"></div>
						<div className="h-full w-1/4 bg-[#FFD100]"></div>
						<div className="h-full w-1/4 bg-[#009B3A]"></div>
					</div>

					<div className="p-6 md:p-8 space-y-6">

						{/* Metadados */}
						<div className="flex flex-wrap items-center gap-3">
							<span className="inline-flex items-center rounded-full border border-[#bfdbfe] bg-[#eff6ff] px-2.5 py-0.5 text-xs font-semibold text-[#003882]">
								INFORMATIVO
							</span>
							<time className="flex items-center gap-1.5 text-sm text-[#64748b]">
								<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
								</svg>
								{formatarData(comunicado.publicado_em)}
							</time>
							<span className="text-sm text-slate-400">•</span>
							<span className="text-sm font-medium text-slate-600">
								Por {comunicado.autor.nome}
							</span>
						</div>

						{/* Título */}
						<h1 className="text-2xl font-bold leading-tight tracking-tight text-[#0f172a] sm:text-3xl">
							{comunicado.titulo}
						</h1>

						<div className="h-px w-full bg-slate-100"></div>

						{/* Conteúdo */}
						<div className="whitespace-pre-wrap text-base leading-relaxed text-[#475569]">
							{comunicado.conteudo}
						</div>

						{/* Aviso de edição */}
						{foiEditado && (
							<p className="flex items-center gap-1.5 text-xs italic text-slate-400">
								<svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
									<path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
								</svg>
								Editado em {formatarData(comunicado.atualizado_em)}
							</p>
						)}
					</div>

					{/* Rodapé com ação de admin */}
					{isAdmin && (
						<div className="flex justify-end border-t border-slate-100 bg-slate-50 p-5">
							<Link
								href={`/comunicados/${comunicado.id}/editar`}
								className="flex items-center gap-1.5 rounded-md bg-blue-50 px-4 py-2 text-sm font-semibold text-[#003882] transition-colors hover:bg-blue-100 hover:text-[#002456]"
							>
								<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
								</svg>
								Editar aviso
							</Link>
						</div>
					)}
				</article>
			) : null}
		</div>
	);
}
