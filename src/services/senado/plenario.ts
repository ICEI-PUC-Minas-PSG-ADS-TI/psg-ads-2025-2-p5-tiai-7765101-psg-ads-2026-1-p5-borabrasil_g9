import { senadoFetch } from "./senado-client";
import type {
  SenadoPresencaResponse,
  SenadoPresencaParlamentar,
} from "../types/senado.types";

export async function obterPresencasPlenario(
  dataInicio: string,
  dataFim: string,
): Promise<SenadoPresencaParlamentar[]> {
  const data = await senadoFetch<SenadoPresencaResponse>(
    `/plenario/lista/presenca/${dataInicio}/${dataFim}`,
  );
  const parlamentares =
    data?.ListaPresencas?.Parlamentares?.Parlamentar ?? [];
  return Array.isArray(parlamentares) ? parlamentares : [parlamentares];
}
