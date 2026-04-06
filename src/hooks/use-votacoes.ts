"use client";

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import {
  listarVotacoesSenado,
  obterOrientacaoBancada,
} from "@/services/senado/votacoes-senado";
import {
  listarVotacoesCamara,
  obterVotosPorVotacao,
  obterOrientacoesPorVotacao,
} from "@/services/camara/votacoes-camara";
import type { SenadoVotacao, SenadoOrientacao } from "@/services/types/senado.types";
import type { CamaraVotacao, CamaraVoto, CamaraOrientacao } from "@/services/types/camara.types";

export function useVotacoesSenado(
  params?: Record<string, string>,
  options?: Omit<UseQueryOptions<SenadoVotacao[]>, "queryKey" | "queryFn">,
) {
  return useQuery<SenadoVotacao[]>({
    queryKey: ["votacoes", "senado", params ?? {}],
    queryFn: () => listarVotacoesSenado(params),
    ...options,
  });
}

export function useOrientacaoBancadaSenado(
  data: string,
  options?: Omit<UseQueryOptions<SenadoOrientacao[]>, "queryKey" | "queryFn">,
) {
  return useQuery<SenadoOrientacao[]>({
    queryKey: ["orientacao", "senado", data],
    queryFn: () => obterOrientacaoBancada(data),
    enabled: !!data,
    ...options,
  });
}

export function useVotacoesCamara(
  params?: Record<string, string>,
  options?: Omit<UseQueryOptions<CamaraVotacao[]>, "queryKey" | "queryFn">,
) {
  return useQuery<CamaraVotacao[]>({
    queryKey: ["votacoes", "camara", params ?? {}],
    queryFn: () => listarVotacoesCamara(params),
    ...options,
  });
}

export function useVotosCamara(
  votacaoId: string,
  options?: Omit<UseQueryOptions<CamaraVoto[]>, "queryKey" | "queryFn">,
) {
  return useQuery<CamaraVoto[]>({
    queryKey: ["votos", "camara", votacaoId],
    queryFn: () => obterVotosPorVotacao(votacaoId),
    enabled: !!votacaoId,
    ...options,
  });
}

export function useOrientacoesCamara(
  votacaoId: string,
  options?: Omit<UseQueryOptions<CamaraOrientacao[]>, "queryKey" | "queryFn">,
) {
  return useQuery<CamaraOrientacao[]>({
    queryKey: ["orientacoes", "camara", votacaoId],
    queryFn: () => obterOrientacoesPorVotacao(votacaoId),
    enabled: !!votacaoId,
    ...options,
  });
}
