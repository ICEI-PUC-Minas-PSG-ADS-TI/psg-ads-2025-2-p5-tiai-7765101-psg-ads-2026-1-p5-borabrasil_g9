import type { PilarScore, VotoComTema } from "../types";
import { getPesoEconomico } from "../weights/economic-weights";

// Pilar 1: Impacto Econômico Direto
// Lógica: tema do PL → lookup peso econômico → multiplica por voto (+1 Sim, -1 Não) → acumula
export function calcularImpactoEconomico(votos: VotoComTema[]): PilarScore {
  if (votos.length === 0) {
    return { valor: 50, detalhes: "Sem votos disponíveis para cálculo", votosConsiderados: 0 };
  }

  let somaImpacto = 0;
  let votosConsiderados = 0;

  for (const v of votos) {
    if (!v.temaCategoria) continue;
    if (v.voto !== "Sim" && v.voto !== "Não") continue;

    const peso = getPesoEconomico(v.temaCategoria);
    if (peso === 0) continue;

    const direcao = v.direcaoImpacto ?? 0;
    if (direcao === 0) continue;

    const votoMult = v.voto === "Sim" ? 1 : -1;
    somaImpacto += peso * votoMult * direcao;
    votosConsiderados++;
  }

  if (votosConsiderados === 0) {
    return { valor: 50, detalhes: "Nenhum voto com peso econômico encontrado", votosConsiderados: 0 };
  }

  // Normalizar para 0–100
  // soma máxima possível = votosConsiderados * 1 (peso max)
  // soma mínima possível = votosConsiderados * -1
  const maxPossivel = votosConsiderados;
  const normalizado = ((somaImpacto / maxPossivel) + 1) / 2; // 0 a 1
  const valor = Math.round(Math.max(0, Math.min(100, normalizado * 100)));

  return {
    valor,
    detalhes: `${votosConsiderados} votos analisados com impacto econômico`,
    votosConsiderados,
  };
}
