import type { PilarScore, VotoComTema } from "../types";
import { getCategoriaServico, getPesoServico, isServicoEssencial } from "../weights/services-weights";

// Pilar 2: Impacto em Serviços Essenciais
// Lógica: tema → categoria de serviço essencial → peso → cruza com voto
export function calcularImpactoServicos(votos: VotoComTema[]): PilarScore {
  if (votos.length === 0) {
    return { valor: 50, detalhes: "Sem votos disponíveis para cálculo", votosConsiderados: 0 };
  }

  let somaImpacto = 0;
  let votosConsiderados = 0;

  for (const v of votos) {
    if (!v.temaCategoria) continue;
    if (v.voto !== "Sim" && v.voto !== "Não") continue;
    if (!isServicoEssencial(v.temaCategoria)) continue;

    const categoriaServico = getCategoriaServico(v.temaCategoria);
    if (!categoriaServico) continue;

    const peso = getPesoServico(categoriaServico);

    const direcao = v.direcaoImpacto ?? 0;
    if (direcao === 0) continue;

    const votoMult = v.voto === "Sim" ? 1 : -1;
    somaImpacto += peso * votoMult * direcao;
    votosConsiderados++;
  }

  if (votosConsiderados === 0) {
    return { valor: 50, detalhes: "Nenhum voto em serviços essenciais encontrado", votosConsiderados: 0 };
  }

  const maxPossivel = votosConsiderados;
  const normalizado = ((somaImpacto / maxPossivel) + 1) / 2;
  const valor = Math.round(Math.max(0, Math.min(100, normalizado * 100)));

  return {
    valor,
    detalhes: `${votosConsiderados} votos em serviços essenciais analisados`,
    votosConsiderados,
  };
}
