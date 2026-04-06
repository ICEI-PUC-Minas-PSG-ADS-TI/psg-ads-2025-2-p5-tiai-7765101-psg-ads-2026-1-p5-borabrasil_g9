"use client";

import { useMemo } from "react";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { calcularScoreCompleto, type DadosScoring } from "@/lib/scoring/aggregator";
import type { ScoreCompleto, FaixaRenda, Parlamentar } from "@/services/types/scoring.types";
import type { VotoComTema, DadosPresenca, DadosCoerencia } from "@/lib/scoring/types";

interface UseScoringOptions {
  parlamentar: Parlamentar;
  votos: VotoComTema[];
  presenca: DadosPresenca | null;
  coerencia: DadosCoerencia | null;
  faixaRenda?: FaixaRenda;
}

export function useScoring({ parlamentar, votos, presenca, coerencia, faixaRenda }: UseScoringOptions) {
  const score = useMemo(() => {
    const dados: DadosScoring = {
      parlamentar,
      votos,
      presenca,
      coerencia,
      faixaRenda,
    };
    return calcularScoreCompleto(dados);
  }, [parlamentar, votos, presenca, coerencia, faixaRenda]);

  return score;
}

// Hook for when data is fetched async and wrapped in a query
export function useScoringQuery(
  parlamentarId: string,
  fetchFn: () => Promise<DadosScoring>,
  options?: Omit<UseQueryOptions<ScoreCompleto>, "queryKey" | "queryFn">,
) {
  return useQuery<ScoreCompleto>({
    queryKey: ["scoring", parlamentarId],
    queryFn: async () => {
      const dados = await fetchFn();
      return calcularScoreCompleto(dados);
    },
    enabled: !!parlamentarId,
    ...options,
  });
}
