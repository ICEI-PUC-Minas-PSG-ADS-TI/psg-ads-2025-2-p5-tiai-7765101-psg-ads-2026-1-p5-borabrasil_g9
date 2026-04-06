import type { DadosCoerencia } from "../types";

// Calcula coerência partidária: compara voto do parlamentar com orientação de bancada
export function calcularCoerenciaPartidaria(
  votos: Array<{ voto: string; orientacaoPartido: string | null }>,
): DadosCoerencia {
  let totalVotos = 0;
  let votosAlinhados = 0;

  for (const v of votos) {
    if (!v.orientacaoPartido) continue;
    if (v.orientacaoPartido === "Liberado") continue;

    totalVotos++;

    const votoNorm = normalizeVoto(v.voto);
    const orientacaoNorm = normalizeVoto(v.orientacaoPartido);

    if (votoNorm === orientacaoNorm) {
      votosAlinhados++;
    }
  }

  return { totalVotos, votosAlinhados };
}

function normalizeVoto(voto: string): string {
  const v = voto.trim().toLowerCase();
  if (v === "sim") return "sim";
  if (v === "não" || v === "nao") return "nao";
  if (v === "abstenção" || v === "abstencao") return "abstencao";
  if (v === "obstrução" || v === "obstrucao") return "obstrucao";
  return v;
}

export function calcularPercentualCoerencia(coerencia: DadosCoerencia): number {
  if (coerencia.totalVotos === 0) return 0;
  return Math.round((coerencia.votosAlinhados / coerencia.totalVotos) * 100);
}
