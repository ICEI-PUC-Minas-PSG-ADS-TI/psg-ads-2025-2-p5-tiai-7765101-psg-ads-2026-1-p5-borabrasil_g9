"use client";

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import {
  listarProposicoes,
  obterProposicao,
  obterTemasProposicao,
} from "@/services/camara/proposicoes";
import type {
  CamaraProposicaoResumo,
  CamaraProposicaoDetalhe,
  CamaraProposicaoTema,
} from "@/services/types/camara.types";

export function useProposicoes(
  params?: Record<string, string>,
  options?: Omit<
    UseQueryOptions<CamaraProposicaoResumo[]>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery<CamaraProposicaoResumo[]>({
    queryKey: ["proposicoes", params ?? {}],
    queryFn: () => listarProposicoes(params),
    ...options,
  });
}

export function useProposicao(
  id: number,
  options?: Omit<
    UseQueryOptions<CamaraProposicaoDetalhe>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery<CamaraProposicaoDetalhe>({
    queryKey: ["proposicao", id],
    queryFn: () => obterProposicao(id),
    enabled: !!id,
    ...options,
  });
}

export function useTemasProposicao(
  id: number,
  options?: Omit<
    UseQueryOptions<CamaraProposicaoTema[]>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery<CamaraProposicaoTema[]>({
    queryKey: ["proposicao", id, "temas"],
    queryFn: () => obterTemasProposicao(id),
    enabled: !!id,
    ...options,
  });
}
