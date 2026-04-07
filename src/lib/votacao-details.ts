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

export function extrairNumeroVotacao(descricao: string): string | null {
  // Tentar extrair número de diferentes formatos
  const patterns = [
    /Projeto de Lei\s+n?º\s+(\d+)/i,
    /Projeto de Lei Complementar\s+n?º\s+(\d+)/i,
    /Medida Provisória\s+n?º\s+(\d+)/i,
    /Proposta de Emenda à Constituição\s+n?º\s+(\d+)/i,
    /Projeto de Lei\s+n?º\s+(\d+)/i,
    /PL\s+n?º\s+(\d+)/i,
    /PLC\s+n?º\s+(\d+)/i,
    /MP\s+n?º\s+(\d+)/i,
    /PEC\s+n?º\s+(\d+)/i
  ];
  
  for (const pattern of patterns) {
    const match = descricao.match(pattern);
    if (match) {
      return match[1];
    }
  }
  
  return null;
}

export function extrairTituloProjeto(descricao: string): string | null {
  // Tentar extrair título completo após o número
  const patterns = [
    /Projeto de Lei\s+n?º\s+\d+\s+(.+?)(?:\s+-\s+|$)/i,
    /Projeto de Lei Complementar\s+n?º\s+\d+\s+(.+?)(?:\s+-\s+|$)/i,
    /Medida Provisória\s+n?º\s+\d+\s+(.+?)(?:\s+-\s+|$)/i,
    /Proposta de Emenda à Constituição\s+n?º\s+\d+\s+(.+?)(?:\s+-\s+|$)/i,
    /PL\s+n?º\s+\d+\s+(.+?)(?:\s+-\s+|$)/i,
    /PLC\s+n?º\s+\d+\s+(.+?)(?:\s+-\s+|$)/i,
    /MP\s+n?º\s+\d+\s+(.+?)(?:\s+-\s+|$)/i,
    /PEC\s+n?º\s+\d+\s+(.+?)(?:\s+-\s+|$)/i
  ];
  
  for (const pattern of patterns) {
    const match = descricao.match(pattern);
    if (match) {
      return match[1].trim();
    }
  }
  
  return null;
}

export function gerarResumoVotacao(descricao: string): string {
  const numero = extrairNumeroVotacao(descricao);
  const titulo = extrairTituloProjeto(descricao);
  
  // Identificar tipo de votação
  if (descricao.includes("Rejeitado o Requerimento")) {
    return numero ? `Requerimento nº ${numero} rejeitado` : "Requerimento rejeitado";
  } else if (descricao.includes("Aprovado")) {
    if (descricao.includes("Projeto de Lei Complementar")) {
      if (titulo) {
        return numero ? `PLC nº ${numero}: ${titulo} - Aprovado` : `Projeto de Lei Complementar: ${titulo} - Aprovado`;
      }
      return numero ? `Projeto de Lei Complementar nº ${numero} aprovado` : "Projeto de Lei Complementar aprovado";
    } else if (descricao.includes("Medida Provisória")) {
      if (titulo) {
        return numero ? `MP nº ${numero}: ${titulo} - Aprovada` : `Medida Provisória: ${titulo} - Aprovada`;
      }
      return numero ? `Medida Provisória nº ${numero} aprovada` : "Medida Provisória aprovada";
    } else if (descricao.includes("Proposta de Emenda")) {
      if (titulo) {
        return numero ? `PEC nº ${numero}: ${titulo} - Aprovada` : `Proposta de Emenda: ${titulo} - Aprovada`;
      }
      return numero ? `PEC nº ${numero} aprovada` : "Proposta de Emenda à Constituição aprovada";
    } else {
      if (titulo) {
        return numero ? `PL nº ${numero}: ${titulo} - Aprovado` : `Projeto de Lei: ${titulo} - Aprovado`;
      }
      return numero ? `Projeto de Lei nº ${numero} aprovado` : "Projeto de Lei aprovado";
    }
  } else if (descricao.includes("Rejeitada")) {
    if (descricao.includes("Projeto de Lei Complementar")) {
      if (titulo) {
        return numero ? `PLC nº ${numero}: ${titulo} - Rejeitado` : `Projeto de Lei Complementar: ${titulo} - Rejeitado`;
      }
      return numero ? `Projeto de Lei Complementar nº ${numero} rejeitado` : "Projeto de Lei Complementar rejeitado";
    } else if (descricao.includes("Medida Provisória")) {
      if (titulo) {
        return numero ? `MP nº ${numero}: ${titulo} - Rejeitada` : `Medida Provisória: ${titulo} - Rejeitada`;
      }
      return numero ? `Medida Provisória nº ${numero} rejeitada` : "Medida Provisória rejeitada";
    } else if (descricao.includes("Proposta de Emenda")) {
      if (titulo) {
        return numero ? `PEC nº ${numero}: ${titulo} - Rejeitada` : `Proposta de Emenda: ${titulo} - Rejeitada`;
      }
      return numero ? `PEC nº ${numero} rejeitada` : "Proposta de Emenda à Constituição rejeitada";
    } else {
      if (titulo) {
        return numero ? `PL nº ${numero}: ${titulo} - Rejeitado` : `Projeto de Lei: ${titulo} - Rejeitado`;
      }
      return numero ? `Projeto de Lei nº ${numero} rejeitado` : "Projeto de Lei rejeitado";
    }
  } else if (descricao.includes("Mantido o texto")) {
    if (descricao.includes("Projeto de Lei Complementar")) {
      if (titulo) {
        return numero ? `PLC nº ${numero}: ${titulo} - Texto mantido` : `Projeto de Lei Complementar: ${titulo} - Texto mantido`;
      }
      return numero ? `Texto mantido - PLC nº ${numero}` : "Texto mantido";
    } else if (descricao.includes("Medida Provisória")) {
      if (titulo) {
        return numero ? `MP nº ${numero}: ${titulo} - Texto mantido` : `Medida Provisória: ${titulo} - Texto mantido`;
      }
      return numero ? `Texto mantido - MP nº ${numero}` : "Texto mantido";
    } else if (descricao.includes("Proposta de Emenda")) {
      if (titulo) {
        return numero ? `PEC nº ${numero}: ${titulo} - Texto mantido` : `Proposta de Emenda: ${titulo} - Texto mantido`;
      }
      return numero ? `Texto mantido - PEC nº ${numero}` : "Texto mantido";
    } else {
      if (titulo) {
        return numero ? `PL nº ${numero}: ${titulo} - Texto mantido` : `Projeto de Lei: ${titulo} - Texto mantido`;
      }
      return numero ? `Texto mantido - PL nº ${numero}` : "Texto mantido";
    }
  } else if (descricao.includes("Suprimido o texto")) {
    if (descricao.includes("Projeto de Lei Complementar")) {
      if (titulo) {
        return numero ? `PLC nº ${numero}: ${titulo} - Texto suprimido` : `Projeto de Lei Complementar: ${titulo} - Texto suprimido`;
      }
      return numero ? `Texto suprimido - PLC nº ${numero}` : "Texto suprimido";
    } else if (descricao.includes("Medida Provisória")) {
      if (titulo) {
        return numero ? `MP nº ${numero}: ${titulo} - Texto suprimido` : `Medida Provisória: ${titulo} - Texto suprimido`;
      }
      return numero ? `Texto suprimido - MP nº ${numero}` : "Texto suprimido";
    } else if (descricao.includes("Proposta de Emenda")) {
      if (titulo) {
        return numero ? `PEC nº ${numero}: ${titulo} - Texto suprimido` : `Proposta de Emenda: ${titulo} - Texto suprimido`;
      }
      return numero ? `Texto suprimido - PEC nº ${numero}` : "Texto suprimido";
    } else {
      if (titulo) {
        return numero ? `PL nº ${numero}: ${titulo} - Texto suprimido` : `Projeto de Lei: ${titulo} - Texto suprimido`;
      }
      return numero ? `Texto suprimido - PL nº ${numero}` : "Texto suprimido";
    }
  } else {
    // Extrair primeira frase como resumo
    const primeiraFrase = descricao.split('.')[0];
    return numero ? `${primeiraFrase} - Projeto nº ${numero}` : primeiraFrase;
  }
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
  const numero = extrairNumeroVotacao(votacao.descricao);
  const titulo = extrairTituloProjeto(votacao.descricao);
  
  if (votacao.casa === "senado") {
    if (numero) {
      // URL de busca no Senado Federal que realmente funciona
      return `https://www25.senado.leg.br/web/atividade/materias/-/materia/pesquisa?numero=${numero}`;
    }
    // Fallback: página de busca geral
    return "https://www25.senado.leg.br/web/atividade/materias";
  } else {
    // Câmara dos Deputados
    if (numero) {
      // URL da Câmara para proposições - formato correto
      return `https://www.camara.leg.br/proposicoesWeb/fasesDaProposicao?numero=${numero}`;
    }
    // Fallback: página de proposições
    return "https://www.camara.leg.br/proposicoesWeb";
  }
}

export function criarDetalheVotacao(
  voto: any,
  votoParlamentar: "Sim" | "Não" | "Abstenção" | "Outro"
): DetalheVotacao {
  const numero = extrairNumeroVotacao(voto.descricao);
  const resumo = gerarResumoVotacao(voto.descricao);
  
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
    resumo,
    explicacao: gerarExplicacaoVoto({ ...voto, votoParlamentar, casa: "senado" })
  };
}
