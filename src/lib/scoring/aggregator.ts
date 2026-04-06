import type { PilarScore, ScoreCompleto, Parlamentar, FaixaRenda } from "./types";
import type { VotoComTema, DadosPresenca, DadosCoerencia } from "./types";
import { calcularImpactoEconomico } from "./calculators/economic-impact";
import { calcularImpactoServicos } from "./calculators/services-impact";
import { calcularPresencaCoerencia } from "./calculators/attendance";
import { calcularImpactoRenda } from "./calculators/income-impact";
import { calcularCustoBeneficio } from "./calculators/cost-benefit";

// Pesos de cada pilar no score geral (somam 1)
const PESOS_PILARES = {
  economico: 0.25,
  servicos: 0.25,
  presenca: 0.20,
  renda: 0.15,
  custoBeneficio: 0.15,
};

export interface DadosScoring {
  parlamentar: Parlamentar;
  votos: VotoComTema[];
  presenca: DadosPresenca | null;
  coerencia: DadosCoerencia | null;
  faixaRenda?: FaixaRenda;
  custosPorProposicao?: Record<string, number | null>;
}

export function calcularScoreCompleto(dados: DadosScoring): ScoreCompleto {
  const faixa = dados.faixaRenda ?? "classe_e";

  const pilar1 = calcularImpactoEconomico(dados.votos);
  const pilar2 = calcularImpactoServicos(dados.votos);
  const pilar3 = calcularPresencaCoerencia(dados.presenca, dados.coerencia);
  const pilar4 = calcularImpactoRenda(dados.votos, faixa);
  const pilar5 = calcularCustoBeneficio(dados.votos, dados.custosPorProposicao);

  const scoreGeral = Math.round(
    pilar1.valor * PESOS_PILARES.economico +
    pilar2.valor * PESOS_PILARES.servicos +
    pilar3.valor * PESOS_PILARES.presenca +
    pilar4.valor * PESOS_PILARES.renda +
    pilar5.valor * PESOS_PILARES.custoBeneficio,
  );

  return {
    parlamentarId: dados.parlamentar.id,
    parlamentar: dados.parlamentar,
    pilar1_economico: pilar1,
    pilar2_servicos: pilar2,
    pilar3_presenca: pilar3,
    pilar4_renda: pilar4,
    pilar5_custoBeneficio: pilar5,
    scoreGeral: Math.max(0, Math.min(100, scoreGeral)),
    ultimaAtualizacao: new Date().toISOString(),
  };
}

export function getCorScore(score: number): string {
  if (score >= 75) return "text-green-600 dark:text-green-400";
  if (score >= 50) return "text-yellow-600 dark:text-yellow-400";
  return "text-red-600 dark:text-red-400";
}

export function getLabelScore(score: number): string {
  if (score >= 75) return "Excelente";
  if (score >= 50) return "Bom";
  return "Ruim";
}

export function getBgCorScore(score: number): string {
  if (score >= 75) return "bg-green-100 dark:bg-green-900/30";
  if (score >= 50) return "bg-yellow-100 dark:bg-yellow-900/30";
  return "bg-red-100 dark:bg-red-900/30";
}
