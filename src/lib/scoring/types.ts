export type { 
  PilarScore, 
  ScoreCompleto, 
  RegraEconomica, 
  CategoriaServico, 
  PesoServico, 
  FaixaRenda, 
  VetorRenda, 
  CustoBeneficio,
  TipoVoto,
  VotoUnificado,
  Parlamentar,
  Casa,
} from "@/services/types/scoring.types";

export interface VotoComTema {
  voto: "Sim" | "Não" | "Abstenção" | "Outro";
  temaCategoria: string | null;
  proposicaoId: string;
  descricao: string;
  direcaoImpacto: 1 | -1 | 0;
}

export interface DadosPresenca {
  totalSessoes: number;
  presencas: number;
  ausenciasJustificadas: number;
  ausenciasNaoJustificadas: number;
}

export interface DadosCoerencia {
  totalVotos: number;
  votosAlinhados: number;
}
