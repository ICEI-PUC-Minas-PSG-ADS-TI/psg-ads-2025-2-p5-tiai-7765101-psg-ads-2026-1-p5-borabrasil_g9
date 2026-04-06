// ─── Senadores ───────────────────────────────────────────────
export interface SenadoSenadorListaResponse {
  ListaParlamentarEmExercicio: {
    Parlamentares: {
      Parlamentar: SenadoSenadorResumo[];
    };
  };
}

export interface SenadoSenadorResumo {
  IdentificacaoParlamentar: {
    CodigoParlamentar: string;
    NomeParlamentar: string;
    NomeCompletoParlamentar: string;
    SexoParlamentar: string;
    FormaTratamento: string;
    UrlFotoParlamentar: string;
    UrlPaginaParlamentar: string;
    EmailParlamentar: string;
    SiglaPartidoParlamentar: string;
    UfParlamentar: string;
  };
  Mandato?: {
    CodigoMandato: string;
    UfParlamentar: string;
    PrimeiraLegislaturaDoMandato: {
      NumeroLegislatura: string;
      DataInicio: string;
      DataFim: string;
    };
    SegundaLegislaturaDoMandato: {
      NumeroLegislatura: string;
      DataInicio: string;
      DataFim: string;
    };
  };
}

// ─── Detalhes do Senador ─────────────────────────────────────
export interface SenadoSenadorDetalheResponse {
  DetalheParlamentar: {
    Parlamentar: SenadoSenadorDetalhe;
  };
}

export interface SenadoSenadorDetalhe {
  IdentificacaoParlamentar: {
    CodigoParlamentar: string;
    NomeParlamentar: string;
    NomeCompletoParlamentar: string;
    SexoParlamentar: string;
    FormaTratamento: string;
    UrlFotoParlamentar: string;
    UrlPaginaParlamentar: string;
    EmailParlamentar: string;
    SiglaPartidoParlamentar: string;
    UfParlamentar: string;
  };
  DadosBasicosParlamentar: {
    DataNascimento: string;
    Naturalidade: string;
    UfNaturalidade: string;
  };
  FiliacaoAtual?: {
    SiglaPartido: string;
    NomePartido: string;
    DataFiliacao: string;
  };
  Mandatos?: {
    Mandato: SenadoMandato[];
  };
}

export interface SenadoMandato {
  CodigoMandato: string;
  UfParlamentar: string;
  DescricaoParticipacao: string;
  PrimeiraLegislaturaDoMandato: {
    NumeroLegislatura: string;
    DataInicio: string;
    DataFim: string;
  };
  SegundaLegislaturaDoMandato: {
    NumeroLegislatura: string;
    DataInicio: string;
    DataFim: string;
  };
}

// ─── Votações Senado ─────────────────────────────────────────
export interface SenadoVotacaoListaResponse {
  ListaVotacoes?: {
    Votacoes?: {
      Votacao: SenadoVotacao[];
    };
  };
}

export interface SenadoVotacao {
  CodigoSessaoVotacao: string;
  SiglaMateria: string;
  NumeroMateria: string;
  AnoMateria: string;
  DescricaoVotacao: string;
  Resultado: string;
  DataSessao: string;
  HoraInicio: string;
  Votos?: {
    VotoParlamentar: SenadoVotoParlamentar[];
  };
}

export interface SenadoVotoParlamentar {
  CodigoParlamentar: string;
  NomeParlamentar: string;
  SiglaPartido: string;
  SiglaUf: string;
  SiglaVoto: "Sim" | "Não" | "Abstenção" | "NCom" | "AP" | "MIS" | "P-NRV" | "REP" | string;
}

// ─── Orientação de Bancada ───────────────────────────────────
export interface SenadoOrientacaoBancadaResponse {
  OrientacaoBancada?: {
    Orientacoes?: {
      Orientacao: SenadoOrientacao[];
    };
  };
}

export interface SenadoOrientacao {
  CodigoSessaoVotacao: string;
  SiglaPartido: string;
  DescricaoOrientacao: string;
  SiglaOrientacao: "Sim" | "Não" | "Liberado" | "Obstrução" | string;
}

// ─── Presença Plenário ───────────────────────────────────────
export interface SenadoPresencaResponse {
  ListaPresencas?: {
    Parlamentares?: {
      Parlamentar: SenadoPresencaParlamentar[];
    };
  };
}

export interface SenadoPresencaParlamentar {
  CodigoParlamentar: string;
  NomeParlamentar: string;
  SiglaPartido: string;
  UfParlamentar: string;
  QuantidadeSessoes: string;
  QuantidadePresenca: string;
  QuantidadeAusenciaJustificada: string;
  QuantidadeAusenciaNaoJustificada: string;
}

// ─── Processos / Matérias ────────────────────────────────────
export interface SenadoProcessoResponse {
  DetalheMateria?: {
    Materia: SenadoMateria;
  };
}

export interface SenadoMateria {
  IdentificacaoMateria: {
    CodigoMateria: string;
    SiglaCasaIdentificacaoMateria: string;
    NomeCasaIdentificacaoMateria: string;
    SiglaSubtipoMateria: string;
    DescricaoSubtipoMateria: string;
    NumeroMateria: string;
    AnoMateria: string;
  };
  EmentaMateria: string;
  ExplicacaoEmentaMateria: string;
  Autoria?: {
    Autor: {
      NomeAutor: string;
      CodigoParlamentar: string;
      SiglaPartido: string;
      UfAutor: string;
    }[];
  };
  Classificacoes?: {
    Classificacao: {
      CodigoClassificacao: string;
      DescricaoClassificacao: string;
    }[];
  };
  SituacaoAtual?: {
    Autuacoes?: {
      Situacao: {
        CodigoSituacao: string;
        DescricaoSituacao: string;
        DataSituacao: string;
      }[];
    };
  };
}
