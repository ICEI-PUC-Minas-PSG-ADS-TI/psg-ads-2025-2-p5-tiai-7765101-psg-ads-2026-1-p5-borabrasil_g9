import incomeBrackets from "@/data/income-brackets.json";
import type { FaixaRenda } from "@/services/types/scoring.types";

const vetores = incomeBrackets.vetoresPorTema as Record<
  string,
  Record<FaixaRenda, number>
>;

const faixas = incomeBrackets.faixas as Record<
  FaixaRenda,
  { descricao: string; limiteInferior: number; limiteSuperior: number | null; populacaoPercentual: number }
>;

export function getPesoRenda(
  temaCategoria: string,
  faixa: FaixaRenda,
): number {
  const vetor = vetores[temaCategoria];
  if (!vetor) return 0;
  return vetor[faixa] ?? 0;
}

export function getVetorRenda(
  temaCategoria: string,
): Record<FaixaRenda, number> | null {
  return vetores[temaCategoria] ?? null;
}

export function getDescricaoFaixa(faixa: FaixaRenda): string {
  return faixas[faixa]?.descricao ?? faixa;
}

export function getTodasFaixas(): typeof faixas {
  return faixas;
}
