"use client";

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import {
  listarDeputados,
  obterDeputado,
} from "@/services/camara/deputados";
import type {
  CamaraDeputadoResumo,
  CamaraDeputadoDetalhe,
} from "@/services/types/camara.types";

export function useDeputados(
  params?: Record<string, string>,
  options?: Omit<
    UseQueryOptions<CamaraDeputadoResumo[]>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery<CamaraDeputadoResumo[]>({
    queryKey: ["deputados", params ?? {}],
    queryFn: () => listarDeputados(params),
    ...options,
  });
}

export function useDeputado(
  id: number,
  options?: Omit<
    UseQueryOptions<CamaraDeputadoDetalhe>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery<CamaraDeputadoDetalhe>({
    queryKey: ["deputado", id],
    queryFn: () => obterDeputado(id),
    enabled: !!id,
    ...options,
  });
}
