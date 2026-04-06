import type { PilarScore, VotoComTema } from "../types";
import { getPesoEconomico } from "../weights/economic-weights";
import { getCategoriaServico, getPesoServico } from "../weights/services-weights";

// Pilar 5: Custo-Benefício Legislativo
// nota = impacto / custo_normalizado
// Parlamentar que vota SIM em PLs com alta nota sobe, quem vota SIM em baixa nota desce
export function calcularCustoBeneficio(
  votos: VotoComTema[],
  custosPorProposicao?: Record<string, number | null>,
): PilarScore {
  if (votos.length === 0) {
    return { valor: 50, detalhes: "Sem votos disponíveis para cálculo", votosConsiderados: 0 };
  }

  let somaImpacto = 0;
  let votosConsiderados = 0;

  for (const v of votos) {
    if (!v.temaCategoria) continue;
    if (v.voto !== "Sim" && v.voto !== "Não") continue;

    // Calcular impacto social combinado (pilar 1 + pilar 2)
    const pesoEcon = getPesoEconomico(v.temaCategoria);
    const catServico = getCategoriaServico(v.temaCategoria);
    const pesoServ = catServico ? getPesoServico(catServico) : 0;
    const impactoSocial = (pesoEcon + pesoServ) / 2;

    if (impactoSocial === 0) continue;

    // Obter custo orçamentário normalizado (0-1)
    const custoNorm = custosPorProposicao?.[v.proposicaoId] ?? null;

    let notaPL: number;
    if (custoNorm !== null && custoNorm > 0) {
      notaPL = impactoSocial / custoNorm;
    } else {
      // Sem dados de custo: usar impacto social puro
      notaPL = impactoSocial;
    }

    const direcao = v.direcaoImpacto ?? 0;
    if (direcao === 0) continue;

    const votoMult = v.voto === "Sim" ? 1 : -1;
    somaImpacto += notaPL * votoMult * direcao;
    votosConsiderados++;
  }

  if (votosConsiderados === 0) {
    return { valor: 50, detalhes: "Nenhum voto com dados de custo-benefício", votosConsiderados: 0 };
  }

  const maxPossivel = votosConsiderados;
  const normalizado = ((somaImpacto / maxPossivel) + 1) / 2;
  const valor = Math.round(Math.max(0, Math.min(100, normalizado * 100)));

  return {
    valor,
    detalhes: `${votosConsiderados} votos analisados para custo-benefício`,
    votosConsiderados,
  };
}
