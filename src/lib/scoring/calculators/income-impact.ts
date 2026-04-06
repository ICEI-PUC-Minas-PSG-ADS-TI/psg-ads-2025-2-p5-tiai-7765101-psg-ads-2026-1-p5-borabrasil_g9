import type { PilarScore, VotoComTema, FaixaRenda } from "../types";
import { getPesoRenda } from "../weights/income-weights";

// Pilar 4: Benefício por Faixa de Renda
// Lógica: PL → vetor de pesos por faixa de renda → usuário informa faixa → soma
export function calcularImpactoRenda(
  votos: VotoComTema[],
  faixaRenda: FaixaRenda,
): PilarScore {
  if (votos.length === 0) {
    return { valor: 50, detalhes: "Sem votos disponíveis para cálculo", votosConsiderados: 0 };
  }

  let somaImpacto = 0;
  let votosConsiderados = 0;

  for (const v of votos) {
    if (!v.temaCategoria) continue;
    if (v.voto !== "Sim" && v.voto !== "Não") continue;

    const peso = getPesoRenda(v.temaCategoria, faixaRenda);
    if (peso === 0) continue;

    const direcao = v.direcaoImpacto ?? 0;
    // Skip bills with unknown direction — they would distort scores
    if (direcao === 0) continue;

    // votoMult: Sim = +1, Não = -1
    // direcao: +1 = progressive bill, -1 = regressive bill
    // Result: Sim on progressive = positive, Não on regressive = positive
    const votoMult = v.voto === "Sim" ? 1 : -1;
    somaImpacto += peso * votoMult * direcao;
    votosConsiderados++;
  }

  if (votosConsiderados === 0) {
    return {
      valor: 50,
      detalhes: `Nenhum voto com impacto para faixa ${faixaRenda}`,
      votosConsiderados: 0,
    };
  }

  const maxPossivel = votosConsiderados;
  const normalizado = ((somaImpacto / maxPossivel) + 1) / 2;
  const valor = Math.round(Math.max(0, Math.min(100, normalizado * 100)));

  return {
    valor,
    detalhes: `${votosConsiderados} votos analisados para faixa ${faixaRenda}`,
    votosConsiderados,
  };
}

// Calcula o score para todas as faixas de renda
export function calcularImpactoTodasFaixas(
  votos: VotoComTema[],
): Record<FaixaRenda, PilarScore> {
  return {
    classe_e: calcularImpactoRenda(votos, "classe_e"),
    classe_d: calcularImpactoRenda(votos, "classe_d"),
    classe_c: calcularImpactoRenda(votos, "classe_c"),
    classe_b: calcularImpactoRenda(votos, "classe_b"),
    classe_a: calcularImpactoRenda(votos, "classe_a"),
  };
}
