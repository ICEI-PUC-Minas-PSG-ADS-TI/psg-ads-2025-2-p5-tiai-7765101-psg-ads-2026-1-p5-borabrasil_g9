export interface ParlamentarDados {
  nome: string;
  casa: "senado" | "camara";
  uf?: string;
  partido?: string;
  codigo?: string | number;
}

export function gerarUrlPerfilOficial(parlamentar: ParlamentarDados): string {
  if (parlamentar.casa === "senado") {
    // Senado Federal: https://www25.senado.leg.br/web/senadores/senador/-/perfil/
    if (parlamentar.codigo) {
      return `https://www25.senado.leg.br/web/senadores/senador/-/perfil/${parlamentar.codigo}`;
    }
    // Fallback: busca por nome
    return `https://www25.senado.leg.br/web/senadores/senadores`;
  } else {
    // Câmara dos Deputados: https://www.camara.leg.br/deputados/{id}
    if (parlamentar.codigo) {
      return `https://www.camara.leg.br/deputados/${parlamentar.codigo}`;
    }
    // Fallback: busca por nome
    const nomeFormatado = encodeURIComponent(parlamentar.nome.toLowerCase().replace(/\s+/g, '-'));
    return `https://www.camara.leg.br/deputados/pesquisa?nome=${nomeFormatado}`;
  }
}

export function gerarUrlListaParlamentares(casa: "senado" | "camara"): string {
  if (casa === "senado") {
    return "https://www25.senado.leg.br/web/senadores/senadores";
  } else {
    return "https://www.camara.leg.br/deputados";
  }
}

export function gerarUrlProposicao(id: string, casa: "senado" | "camara"): string {
  if (casa === "senado") {
    return `https://www25.senado.leg.br/web/atividade/materias/-/materia/${id}`;
  } else {
    return `https://www.camara.leg.br/proposicoesWeb/fasesDaProposicao?detalhe=true&idProposicao=${id}`;
  }
}

// Função auxiliar para extrair código do ID interno do sistema
export function extrairCodigoParlamentar(idInterno: string): { casa: "senado" | "camara", codigo: string | number } | null {
  const partes = idInterno.split("-");
  if (partes.length !== 2) return null;
  
  const [casa, codigo] = partes;
  if (casa !== "senado" && casa !== "camara") return null;
  
  return {
    casa: casa as "senado" | "camara",
    codigo: casa === "senado" ? codigo : parseInt(codigo, 10)
  };
}
