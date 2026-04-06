// ─── Deputados ───────────────────────────────────────────────
export interface CamaraDeputadoListaResponse {
  dados: CamaraDeputadoResumo[];
  links: CamaraLink[];
}

export interface CamaraDeputadoResumo {
  id: number;
  uri: string;
  nome: string;
  siglaPartido: string;
  uriPartido: string;
  siglaUf: string;
  idLegislatura: number;
  urlFoto: string;
  email: string;
}

export interface CamaraDeputadoDetalheResponse {
  dados: CamaraDeputadoDetalhe;
}

export interface CamaraDeputadoDetalhe {
  id: number;
  uri: string;
  nomeCivil: string;
  ultimoStatus: {
    id: number;
    uri: string;
    nome: string;
    siglaPartido: string;
    uriPartido: string;
    siglaUf: string;
    idLegislatura: number;
    urlFoto: string;
    email: string;
    data: string;
    nomeEleitoral: string;
    gabinete: {
      nome: string;
      predio: string;
      sala: string;
      andar: string;
      telefone: string;
      email: string;
    };
    situacao: string;
    condicaoEleitoral: string;
    descricaoStatus: string;
  };
  cpf: string;
  sexo: string;
  urlWebsite: string;
  dataNascimento: string;
  dataFalecimento: string | null;
  ufNascimento: string;
  municipioNascimento: string;
  escolaridade: string;
}

// ─── Votações Câmara ─────────────────────────────────────────
export interface CamaraVotacaoListaResponse {
  dados: CamaraVotacao[];
  links: CamaraLink[];
}

export interface CamaraVotacao {
  id: string;
  uri: string;
  data: string;
  dataHoraRegistro: string;
  siglaOrgao: string;
  uriOrgao: string;
  uriEvento: string;
  proposicaoObjeto: string;
  uriProposicaoObjeto: string;
  descricao: string;
  aprovacao: boolean;
}

export interface CamaraVotosResponse {
  dados: CamaraVoto[];
  links: CamaraLink[];
}

export interface CamaraVoto {
  tipoVoto: "Sim" | "Não" | "Abstenção" | "Obstrução" | "Art. 17" | string;
  dataRegistroVoto: string;
  deputado_: {
    id: number;
    uri: string;
    nome: string;
    siglaPartido: string;
    uriPartido: string;
    siglaUf: string;
    idLegislatura: number;
    urlFoto: string;
  };
}

// ─── Orientações de Bancada ──────────────────────────────────
export interface CamaraOrientacoesResponse {
  dados: CamaraOrientacao[];
  links: CamaraLink[];
}

export interface CamaraOrientacao {
  orientacao: "Sim" | "Não" | "Liberado" | "Obstrução" | string;
  codTipoLideranca: string;
  siglaPartidoBloco: string;
  uriPartidoBloco: string;
  nomePublicacao: string;
  codPartidoBloco: number;
}

// ─── Proposições ─────────────────────────────────────────────
export interface CamaraProposicaoListaResponse {
  dados: CamaraProposicaoResumo[];
  links: CamaraLink[];
}

export interface CamaraProposicaoResumo {
  id: number;
  uri: string;
  siglaTipo: string;
  codTipo: number;
  numero: number;
  ano: number;
  ementa: string;
}

export interface CamaraProposicaoDetalheResponse {
  dados: CamaraProposicaoDetalhe;
}

export interface CamaraProposicaoDetalhe {
  id: number;
  uri: string;
  siglaTipo: string;
  codTipo: number;
  numero: number;
  ano: number;
  ementa: string;
  dataApresentacao: string;
  uriOrgaoNumerador: string;
  statusProposicao: {
    dataHora: string;
    sequencia: number;
    siglaOrgao: string;
    uriOrgao: string;
    regime: string;
    descricaoTramitacao: string;
    codTipoTramitacao: string;
    descricaoSituacao: string;
    codSituacao: number;
    despacho: string;
    url: string;
  };
  uriAutores: string;
  descricaoTipo: string;
  ementaDetalhada: string;
  keywords: string;
  uriPropPrincipal: string;
  uriPropAnterior: string;
  uriPropPosterior: string;
  urlInteiroTeor: string;
  urnFinal: string;
  texto: string;
  justificativa: string;
}

export interface CamaraProposicaoTema {
  codTema: number;
  tema: string;
  relevancia: number;
}

export interface CamaraProposicaoTemasResponse {
  dados: CamaraProposicaoTema[];
  links: CamaraLink[];
}

// ─── Despesas ────────────────────────────────────────────────
export interface CamaraDespesaResponse {
  dados: CamaraDespesa[];
  links: CamaraLink[];
}

export interface CamaraDespesa {
  ano: number;
  mes: number;
  tipoDespesa: string;
  codDocumento: number;
  tipoDocumento: string;
  codTipoDocumento: number;
  dataDocumento: string;
  numDocumento: string;
  valorDocumento: number;
  urlDocumento: string;
  nomeFornecedor: string;
  cnpjCpfFornecedor: string;
  valorLiquido: number;
  valorGlosa: number;
  numRessarcimento: string;
  codLote: number;
  parcela: number;
}

// ─── Comum ───────────────────────────────────────────────────
export interface CamaraLink {
  rel: string;
  href: string;
}
