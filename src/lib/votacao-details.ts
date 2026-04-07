export interface DetalheVotacao {
  id: string;
  descricao: string;
  tema: string;
  impacto: 1 | -1 | 0;
  data: string;
  casa: "senado" | "camara";
  resultado: {
    sim: number;
    nao: number;
    abstencao: number;
    total: number;
  };
  votoParlamentar: "Sim" | "Não" | "Abstenção" | "Outro";
  urlOficial?: string;
  resumo: string;
  explicacao: string;
}

export function gerarExplicacaoVoto(voto: DetalheVotacao): string {
  const { votoParlamentar, impacto, tema, descricao, resultado } = voto;
  
  let explicacao = `O parlamentar votou **${votoParlamentar}** `;
  
  // Explicar o que foi votado
  if (descricao.includes("Rejeitado o Requerimento")) {
    explicacao += `em um requerimento que foi **rejeitado**. `;
    explicacao += `Requerimentos são pedidos formais para urgentar votações, adiar discussões ou solicitar informações.`;
  } else if (descricao.includes("Aprovado")) {
    explicacao += `em uma proposta que foi **aprovada**. `;
    explicacao += `Esta medida altera a legislação vigente.`;
  } else if (descricao.includes("Rejeitada")) {
    explicacao += `em uma proposta que foi **rejeitada**. `;
    explicacao += `A proposta não avançou no processo legislativo.`;
  } else {
    explicacao += `em uma votação. `;
  }
  
  // Adicionar resultado se disponível
  if (resultado && resultado.sim !== undefined && resultado.nao !== undefined) {
    explicacao += `Resultado: ${resultado.sim} Sim, ${resultado.nao} Não.`;
  }
  
  // Explicar o impacto
  if (impacto === 1) {
    explicacao += ` Este voto é considerado **progressivo** (↑) por favorecer políticas sociais, direitos humanos ou distribuição de renda.`;
  } else if (impacto === -1) {
    explicacao += ` Este voto é considerado **regressivo** (↓) por impactar negativamente políticas sociais ou aumentar desigualdades.`;
  } else {
    explicacao += ` Este voto é considerado **neutro** (—) por ter impacto ambíguo ou técnico.`;
  }
  
  // Adicionar contexto do tema
  const contextoTema = getContextoTema(tema);
  if (contextoTema) {
    explicacao += ` ${contextoTema}`;
  }
  
  return explicacao;
}

function getContextoTema(tema: string): string {
  const contextos: Record<string, string> = {
    "tributacao": "Votações sobre tributação envolvem impostos, taxas e política fiscal, impactando diretamente o bolso dos cidadãos e a economia.",
    "saude": "Votações sobre saúde determinam financiamento do SUS, programas de prevenção e acesso a tratamentos médicos.",
    "educacao": "Votações sobre educação definem orçamento para escolas, universidades, bolsas de estudo e políticas educacionais.",
    "previdencia": "Votações sobre previdência envolvem aposentadorias, pensões e a sustentabilidade do sistema previdenciário.",
    "seguranca": "Votações sobre segurança pública abordam forças policiais, sistema prisional e políticas de combate ao crime.",
    "energia": "Votações sobre energia definem políticas para petróleo, eletricidade, fontes renováveis e tarifas.",
    "meio ambiente": "Votações sobre meio ambiente envolvem proteção de ecossistemas, mudanças climáticas e sustentabilidade.",
    "direitos humanos": "Votações sobre direitos humanos abordam igualdade, discriminação, minorias e garantias fundamentais.",
    "economia": "Votações sobre economia envolvem políticas monetárias, fiscais e desenvolvimento econômico.",
    "administracao": "Votações sobre administração pública tratam da organização do governo e serviços públicos.",
    "emprego": "Votações sobre emprego abordam políticas de trabalho, geração de emprego e direitos trabalhistas.",
    "infraestrutura": "Votações sobre infraestrutura definem investimentos em transportes, logística e obras públicas."
  };
  
  return contextos[tema] || "";
}

export function gerarUrlOficial(votacao: DetalheVotacao): string {
  if (votacao.casa === "senado") {
    // Tentar extrair ID numérico da proposição
    const match = votacao.descricao.match(/Projeto de Lei\s+n?º\s+(\d+)/);
    if (match) {
      return `https://www25.senado.leg.br/web/atividade/materias/-/materia/votacao/${match[1]}`;
    }
    return "https://www25.senado.leg.br/web/atividade/materias";
  } else {
    // Câmara dos Deputados
    const match = votacao.descricao.match(/Projeto de Lei\s+n?º\s+(\d+)/);
    if (match) {
      return `https://www.camara.leg.br/proposicoesWeb/fasesDaProposicao?detalhe=true&idProposicao=${match[1]}`;
    }
    return "https://www.camara.leg.br/proposicoesWeb";
  }
}

export function criarDetalheVotacao(
  voto: any,
  votoParlamentar: "Sim" | "Não" | "Abstenção" | "Outro"
): DetalheVotacao {
  return {
    id: voto.proposicaoId,
    descricao: voto.descricao,
    tema: voto.temaCategoria || "geral",
    impacto: voto.direcaoImpacto || 0,
    data: new Date().toISOString(), // Poderia vir dos dados
    casa: "senado", // Default, poderia ser detectado
    resultado: {
      sim: 0, // Poderia vir dos dados
      nao: 0,
      abstencao: 0,
      total: 0
    },
    votoParlamentar,
    urlOficial: gerarUrlOficial({ ...voto, casa: "senado" }),
    resumo: voto.descricao.split('.')[0] + '.',
    explicacao: gerarExplicacaoVoto({ ...voto, votoParlamentar, casa: "senado" })
  };
}
