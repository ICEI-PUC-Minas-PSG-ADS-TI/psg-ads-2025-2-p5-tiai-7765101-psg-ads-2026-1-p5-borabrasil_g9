"use client";

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { obterPresencasPlenario } from "@/services/senado/plenario";
import type { SenadoPresencaParlamentar } from "@/services/types/senado.types";

export function usePresencaSenado(
  dataInicio: string,
  dataFim: string,
  options?: Omit<
    UseQueryOptions<SenadoPresencaParlamentar[]>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery<SenadoPresencaParlamentar[]>({
    queryKey: ["presenca", "senado", dataInicio, dataFim],
    queryFn: () => obterPresencasPlenario(dataInicio, dataFim),
    enabled: !!dataInicio && !!dataFim,
    ...options,
  });
}
