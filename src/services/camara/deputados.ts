import { camaraFetch } from "./camara-client";
import type {
  CamaraDeputadoListaResponse,
  CamaraDeputadoResumo,
  CamaraDeputadoDetalheResponse,
  CamaraDeputadoDetalhe,
  CamaraDespesaResponse,
  CamaraDespesa,
} from "../types/camara.types";

export async function listarDeputados(
  params?: Record<string, string>,
): Promise<CamaraDeputadoResumo[]> {
  const data = await camaraFetch<CamaraDeputadoListaResponse>(
    "/deputados",
    params,
  );
  return data.dados;
}

export async function obterDeputado(
  id: number,
): Promise<CamaraDeputadoDetalhe> {
  const data = await camaraFetch<CamaraDeputadoDetalheResponse>(
    `/deputados/${id}`,
  );
  return data.dados;
}

export async function listarDespesasDeputado(
  id: number,
  params?: Record<string, string>,
): Promise<CamaraDespesa[]> {
  const data = await camaraFetch<CamaraDespesaResponse>(
    `/deputados/${id}/despesas`,
    params,
  );
  return data.dados;
}
