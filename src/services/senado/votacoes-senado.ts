import { senadoFetch } from "./senado-client";
import type {
  SenadoVotacaoListaResponse,
  SenadoVotacao,
  SenadoOrientacaoBancadaResponse,
  SenadoOrientacao,
} from "../types/senado.types";

export async function listarVotacoesSenado(
  params?: Record<string, string>,
): Promise<SenadoVotacao[]> {
  const data = await senadoFetch<SenadoVotacaoListaResponse>(
    "/votacao",
    params,
  );
  const votacoes = data?.ListaVotacoes?.Votacoes?.Votacao ?? [];
  return Array.isArray(votacoes) ? votacoes : [votacoes];
}

export async function obterOrientacaoBancada(
  data: string,
): Promise<SenadoOrientacao[]> {
  const response = await senadoFetch<SenadoOrientacaoBancadaResponse>(
    `/plenario/votacao/orientacaoBancada/${data}`,
  );
  const orientacoes =
    response?.OrientacaoBancada?.Orientacoes?.Orientacao ?? [];
  return Array.isArray(orientacoes) ? orientacoes : [orientacoes];
}
