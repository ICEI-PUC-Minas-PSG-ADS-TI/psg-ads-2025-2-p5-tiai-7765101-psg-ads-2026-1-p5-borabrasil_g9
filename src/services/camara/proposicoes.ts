import { camaraFetch } from "./camara-client";
import type {
  CamaraProposicaoListaResponse,
  CamaraProposicaoResumo,
  CamaraProposicaoDetalheResponse,
  CamaraProposicaoDetalhe,
  CamaraProposicaoTemasResponse,
  CamaraProposicaoTema,
} from "../types/camara.types";

export async function listarProposicoes(
  params?: Record<string, string>,
): Promise<CamaraProposicaoResumo[]> {
  const data = await camaraFetch<CamaraProposicaoListaResponse>(
    "/proposicoes",
    params,
  );
  return data.dados;
}

export async function obterProposicao(
  id: number,
): Promise<CamaraProposicaoDetalhe> {
  const data = await camaraFetch<CamaraProposicaoDetalheResponse>(
    `/proposicoes/${id}`,
  );
  return data.dados;
}

export async function obterTemasProposicao(
  id: number,
): Promise<CamaraProposicaoTema[]> {
  const data = await camaraFetch<CamaraProposicaoTemasResponse>(
    `/proposicoes/${id}/temas`,
  );
  return data.dados;
}
