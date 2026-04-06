import type { PilarScore, DadosPresenca, DadosCoerencia } from "../types";

// Pilar 3: Presença, Coerência e Responsabilidade
// Composto por: % presença (40%), % coerência partidária (30%), % coerência temática (30%)
export function calcularPresencaCoerencia(
  presenca: DadosPresenca | null,
  coerencia: DadosCoerencia | null,
): PilarScore {
  let votosConsiderados = 0;
  const componentes: string[] = [];

  // Componente 1: Presença (40% do pilar)
  let notaPresenca = 50;
  if (presenca && presenca.totalSessoes > 0) {
    notaPresenca = Math.round(
      (presenca.presencas / presenca.totalSessoes) * 100,
    );
    votosConsiderados += presenca.totalSessoes;
    componentes.push(`Presença: ${notaPresenca}% (${presenca.presencas}/${presenca.totalSessoes})`);
  } else {
    componentes.push("Presença: sem dados");
  }

  // Componente 2: Coerência partidária (30% do pilar)
  let notaCoerencia = 50;
  if (coerencia && coerencia.totalVotos > 0) {
    notaCoerencia = Math.round(
      (coerencia.votosAlinhados / coerencia.totalVotos) * 100,
    );
    votosConsiderados += coerencia.totalVotos;
    componentes.push(`Coerência: ${notaCoerencia}% (${coerencia.votosAlinhados}/${coerencia.totalVotos})`);
  } else {
    componentes.push("Coerência: sem dados");
  }

  // Componente 3: Coerência temática (30% do pilar) — usa presença como proxy por ora
  const notaTematica = notaPresenca > 75 ? 70 : notaPresenca > 50 ? 50 : 30;
  componentes.push(`Coerência temática (estimada): ${notaTematica}%`);

  const valor = Math.round(
    notaPresenca * 0.4 + notaCoerencia * 0.3 + notaTematica * 0.3,
  );

  return {
    valor: Math.max(0, Math.min(100, valor)),
    detalhes: componentes.join(" | "),
    votosConsiderados,
  };
}
