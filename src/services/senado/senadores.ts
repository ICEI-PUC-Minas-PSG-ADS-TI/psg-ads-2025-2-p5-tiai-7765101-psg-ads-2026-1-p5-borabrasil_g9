import { senadoFetch } from "./senado-client";
import type {
  SenadoSenadorListaResponse,
  SenadoSenadorDetalheResponse,
  SenadoSenadorResumo,
  SenadoSenadorDetalhe,
} from "../types/senado.types";

export async function listarSenadoresAtuais(): Promise<SenadoSenadorResumo[]> {
  const data = await senadoFetch<SenadoSenadorListaResponse>(
    "/senador/lista/atual",
  );
  const parlamentares =
    data?.ListaParlamentarEmExercicio?.Parlamentares?.Parlamentar ?? [];
  return Array.isArray(parlamentares) ? parlamentares : [parlamentares];
}

export async function obterSenador(
  codigo: string,
): Promise<SenadoSenadorDetalhe> {
  const data = await senadoFetch<SenadoSenadorDetalheResponse>(
    `/senador/${codigo}`,
  );
  return data.DetalheParlamentar.Parlamentar;
}
