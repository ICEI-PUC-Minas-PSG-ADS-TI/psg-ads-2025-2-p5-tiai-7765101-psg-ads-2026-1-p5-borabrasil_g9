"use client";

import { useQuery } from "@tanstack/react-query";

interface VotoComTemaAPI {
  voto: string;
  temaCategoria: string | null;
  proposicaoId: string;
  descricao: string;
  direcaoImpacto: 1 | -1 | 0;
}

export interface PresencaData {
  totalSessoes: number;
  presencas: number;
  ausenciasJustificadas: number;
  ausenciasNaoJustificadas: number;
}

export interface CoerenciaData {
  totalVotos: number;
  votosAlinhados: number;
}

export interface ParlamentarVotos {
  id: string;
  nome: string;
  siglaPartido: string;
  siglaUf: string;
  urlFoto: string;
  casa: "senado" | "camara";
  votos: VotoComTemaAPI[];
  presenca?: PresencaData;
  coerencia?: CoerenciaData;
}

interface SimuladorResponse {
  data: Record<string, ParlamentarVotos>;
  fromCache: boolean;
  totalParlamentares: number;
  totalVotacoes?: number;
  temasResolvidos?: number;
}

async function fetchEndpoint(url: string): Promise<Record<string, ParlamentarVotos>> {
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      (body as { error?: string }).error || `Erro ${res.status}`,
    );
  }
  const json = (await res.json()) as SimuladorResponse;
  return json.data;
}

export function useSimuladorVotos() {
  return useQuery<Record<string, ParlamentarVotos>>({
    queryKey: ["simulador", "votos", "merged"],
    queryFn: async () => {
      // Fetch Senado + Câmara in parallel, merging into a single map
      const [senado, camara] = await Promise.all([
        fetchEndpoint("/api/simulador/votos"),
        fetchEndpoint("/api/simulador/votos-camara").catch(() => ({} as Record<string, ParlamentarVotos>)),
      ]);
      return { ...senado, ...camara };
    },
    staleTime: 10 * 60 * 1000, // 10min — data is expensive to compute
    gcTime: 60 * 60 * 1000, // 1h
  });
}
