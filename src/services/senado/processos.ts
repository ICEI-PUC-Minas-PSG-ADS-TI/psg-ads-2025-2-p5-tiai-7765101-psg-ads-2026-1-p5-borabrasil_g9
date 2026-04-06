import { senadoFetch } from "./senado-client";
import type {
  SenadoProcessoResponse,
  SenadoMateria,
} from "../types/senado.types";

export async function obterMateria(id: string): Promise<SenadoMateria> {
  const data = await senadoFetch<SenadoProcessoResponse>(`/processo/${id}`);
  if (!data?.DetalheMateria?.Materia) {
    throw new Error(`Matéria ${id} não encontrada`);
  }
  return data.DetalheMateria.Materia;
}
