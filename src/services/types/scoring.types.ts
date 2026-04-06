// ─── Parlamentar Unificado ───────────────────────────────────
export type Casa = "senado" | "camara";

export interface Parlamentar {
  id: string;
  nome: string;
  nomeCompleto: string;
  partido: string;
  uf: string;
  foto: string;
  email: string;
  casa: Casa;
}

// ─── Voto Unificado ─────────────────────────────────────────
export type TipoVoto = "Sim" | "Não" | "Abstenção" | "Obstrução" | "Ausente" | "Outro";

export interface VotoUnificado {
  parlamentarId: string;
  votacaoId: string;
  voto: TipoVoto;
  data: string;
  proposicaoId: string;
  descricao: string;
}

// ─── Proposição Unificada ────────────────────────────────────
export interface ProposicaoUnificada {
  id: string;
  sigla: string;
  numero: number;
  ano: number;
  ementa: string;
  temas: string[];
  casa: Casa;
}

// ─── Presença ────────────────────────────────────────────────
export interface PresencaResumo {
  parlamentarId: string;
  totalSessoes: number;
  presencas: number;
  ausenciasJustificadas: number;
  ausenciasNaoJustificadas: number;
  percentualPresenca: number;
}

// ─── Coerência ───────────────────────────────────────────────
export interface CoerenciaResumo {
  parlamentarId: string;
  totalVotos: number;
  votosAlinhados: number;
  percentualCoerencia: number;
}

// ─── Scoring: 5 Pilares ─────────────────────────────────────
export interface PilarScore {
  valor: number; // 0–100
  detalhes: string;
  votosConsiderados: number;
}

export interface ScoreCompleto {
  parlamentarId: string;
  parlamentar: Parlamentar;
  pilar1_economico: PilarScore;
  pilar2_servicos: PilarScore;
  pilar3_presenca: PilarScore;
  pilar4_renda: PilarScore;
  pilar5_custoBeneficio: PilarScore;
  scoreGeral: number; // média ponderada 0–100
  ultimaAtualizacao: string;
}

// ─── Pesos Econômicos ────────────────────────────────────────
export interface RegraEconomica {
  temaId: string;
  descricao: string;
  peso: number; // -1 a +1
  categoria: "tributacao" | "inflacao" | "emprego" | "credito" | "comercio" | "regulacao";
}

// ─── Matriz de Serviços ──────────────────────────────────────
export type CategoriaServico =
  | "saude"
  | "educacao"
  | "saneamento"
  | "transporte"
  | "seguranca_alimentar"
  | "habitacao"
  | "assistencia_social";

export interface PesoServico {
  temaId: string;
  categoria: CategoriaServico;
  peso: number; // 0 a 1
}

// ─── Faixas de Renda (Classes Sociais IBGE/ABEP – SM 2026 = R$ 1.621) ──
export type FaixaRenda =
  | "classe_e"   // até 2 SM (até R$ 3.242)
  | "classe_d"   // 2 a 4 SM (R$ 3.242 – R$ 6.484)
  | "classe_c"   // 4 a 10 SM (R$ 6.484 – R$ 16.210)
  | "classe_b"   // 10 a 20 SM (R$ 16.210 – R$ 32.420)
  | "classe_a";  // acima de 20 SM (R$ 32.420+)

export interface VetorRenda {
  temaId: string;
  pesos: Record<FaixaRenda, number>; // -1 a +1 por faixa
}

// ─── Custo-Benefício ─────────────────────────────────────────
export interface CustoBeneficio {
  proposicaoId: string;
  impactoSocial: number;
  custoOrcamentario: number | null; // null = sem dados
  nota: number | null;
}

// ─── Mapeamento de Temas ─────────────────────────────────────
export interface MapaTema {
  codigoOriginal: string | number;
  nomeOriginal: string;
  casa: Casa;
  categoriaBoraBrasil: string;
}
