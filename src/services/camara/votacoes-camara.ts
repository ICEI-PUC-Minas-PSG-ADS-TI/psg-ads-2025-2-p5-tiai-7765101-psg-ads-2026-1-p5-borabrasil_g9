import { camaraFetch } from "./camara-client";
import type {
  CamaraVotacaoListaResponse,
  CamaraVotacao,
  CamaraVotosResponse,
  CamaraVoto,
  CamaraOrientacoesResponse,
  CamaraOrientacao,
} from "../types/camara.types";

export async function listarVotacoesCamara(
  params?: Record<string, string>,
): Promise<CamaraVotacao[]> {
  const data = await camaraFetch<CamaraVotacaoListaResponse>(
    "/votacoes",
    params,
  );
  return data.dados;
}

export async function obterVotosPorVotacao(
  votacaoId: string,
): Promise<CamaraVoto[]> {
  const data = await camaraFetch<CamaraVotosResponse>(
    `/votacoes/${votacaoId}/votos`,
  );
  return data.dados;
}

export async function obterOrientacoesPorVotacao(
  votacaoId: string,
): Promise<CamaraOrientacao[]> {
  const data = await camaraFetch<CamaraOrientacoesResponse>(
    `/votacoes/${votacaoId}/orientacoes`,
  );
  return data.dados;
}
