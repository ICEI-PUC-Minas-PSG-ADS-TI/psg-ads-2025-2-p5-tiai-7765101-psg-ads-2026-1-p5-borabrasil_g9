"use client";

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import {
  listarSenadoresAtuais,
  obterSenador,
} from "@/services/senado/senadores";
import type {
  SenadoSenadorResumo,
  SenadoSenadorDetalhe,
} from "@/services/types/senado.types";

export function useSenadoresAtuais(
  options?: Omit<
    UseQueryOptions<SenadoSenadorResumo[]>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery<SenadoSenadorResumo[]>({
    queryKey: ["senadores", "atuais"],
    queryFn: listarSenadoresAtuais,
    ...options,
  });
}

export function useSenador(
  codigo: string,
  options?: Omit<
    UseQueryOptions<SenadoSenadorDetalhe>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery<SenadoSenadorDetalhe>({
    queryKey: ["senador", codigo],
    queryFn: () => obterSenador(codigo),
    enabled: !!codigo,
    ...options,
  });
}
