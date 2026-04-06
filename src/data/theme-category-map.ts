import type { MapaTema } from "@/services/types/scoring.types";

// Mapeamento dos ~62 temas oficiais da Câmara para categorias Bora Brasil
export const CAMARA_THEME_MAP: Record<number, string> = {
  // Economia e Tributação
  40: "tributacao",
  46: "economia",
  34: "industria_comercio",
  48: "trabalho_emprego",
  // Saúde
  43: "saude",
  // Educação
  41: "educacao",
  // Meio Ambiente
  42: "meio_ambiente",
  // Segurança
  44: "seguranca",
  // Direitos Humanos
  51: "direitos_humanos",
  // Administração Pública
  37: "administracao",
  // Agricultura
  32: "agricultura",
  // Ciência e Tecnologia
  33: "ciencia_tecnologia",
  // Comunicações
  35: "comunicacoes",
  // Defesa
  36: "defesa",
  // Energia
  38: "energia",
  // Finanças
  39: "financas",
  // Relações Exteriores
  45: "relacoes_exteriores",
  // Transporte
  49: "transporte",
  // Urbanismo e Habitação
  50: "urbanismo_habitacao",
  // Previdência
  62: "previdencia",
};

// Mapeamento de classificações do Senado para categorias Bora Brasil
// Inclui DescricaoClasse, DescricaoClasseHierarquica e AssuntoGeral/AssuntoEspecifico
export const SENADO_CLASS_MAP: Record<string, string> = {
  // DescricaoClasse (from Classificacoes[])
  "Direito Tributário": "tributacao",
  "Direito Econômico": "economia",
  "Direito do Trabalho": "trabalho_emprego",
  "Direito da Saúde": "saude",
  "Direito Educacional": "educacao",
  "Direito Ambiental": "meio_ambiente",
  "Direito Penal": "seguranca",
  "Direitos e Garantias Fundamentais": "direitos_humanos",
  "Direito Administrativo": "administracao",
  "Direito Agrário": "agricultura",
  "Direito da Seguridade Social": "previdencia",
  "Direito Financeiro": "financas",
  "Direito Urbanístico": "urbanismo_habitacao",
  // DescricaoClasseHierarquica top-level segments
  "Tributação e Orçamento": "tributacao",
  "Tributos": "tributacao",
  "Orçamento": "financas",
  "Economia e Desenvolvimento": "economia",
  "Política Econômica": "economia",
  "Desenvolvimento Regional": "economia",
  "Trabalho e Emprego": "trabalho_emprego",
  "Relações de Trabalho": "trabalho_emprego",
  "Saúde": "saude",
  "Educação": "educacao",
  "Educação, Cultura e Esportes": "educacao",
  "Meio Ambiente": "meio_ambiente",
  "Recursos Naturais": "meio_ambiente",
  "Segurança Pública": "seguranca",
  "Defesa e Segurança": "seguranca",
  "Direitos Humanos e Minorias": "direitos_humanos",
  "Cidadania e Direitos Humanos": "direitos_humanos",
  "Administração Pública": "administracao",
  "Agropecuária": "agricultura",
  "Agricultura e Pecuária": "agricultura",
  "Previdência Social": "previdencia",
  "Previdência e Assistência Social": "previdencia",
  "Assistência Social": "previdencia",
  "Ciência, Tecnologia e Inovação": "ciencia_tecnologia",
  "Ciência e Tecnologia": "ciencia_tecnologia",
  "Comunicações": "comunicacoes",
  "Defesa Nacional": "defesa",
  "Forças Armadas": "defesa",
  "Energia": "energia",
  "Minas e Energia": "energia",
  "Infraestrutura": "transporte",
  "Transportes": "transporte",
  "Viação e Transportes": "transporte",
  "Desenvolvimento Urbano": "urbanismo_habitacao",
  "Habitação": "urbanismo_habitacao",
  "Saneamento": "urbanismo_habitacao",
  "Indústria e Comércio": "industria_comercio",
  "Comércio Exterior": "industria_comercio",
  "Relações Exteriores": "relacoes_exteriores",
  // AssuntoGeral.Descricao
  "Social": "direitos_humanos",
  "Econômico": "economia",
  "Jurídico": "administracao",
  "Administrativo": "administracao",
  "Honorífico": "administracao",
};

// Resolve Senado classificação to Bora Brasil category.
// Accepts DescricaoClasse, DescricaoClasseHierarquica, or AssuntoGeral strings.
// For hierarchical strings like "Infraestrutura / Minas e Energia", tries
// the full string first, then each segment.
export function resolverClassificacaoSenado(texto: string): string | null {
  if (!texto) return null;
  // Direct match
  const direct = SENADO_CLASS_MAP[texto];
  if (direct) return direct;
  // Try splitting hierarchical (e.g., "Infraestrutura / Minas e Energia")
  const parts = texto.split(/\s*\/\s*/);
  for (const part of parts) {
    const trimmed = part.trim();
    const match = SENADO_CLASS_MAP[trimmed];
    if (match) return match;
  }
  return null;
}

// Todas as categorias unificadas Bora Brasil
export const CATEGORIAS_BORA_BRASIL = [
  "tributacao",
  "economia",
  "industria_comercio",
  "trabalho_emprego",
  "saude",
  "educacao",
  "meio_ambiente",
  "seguranca",
  "direitos_humanos",
  "administracao",
  "agricultura",
  "ciencia_tecnologia",
  "comunicacoes",
  "defesa",
  "energia",
  "financas",
  "relacoes_exteriores",
  "transporte",
  "urbanismo_habitacao",
  "previdencia",
] as const;

export type CategoriaBoraBrasil = (typeof CATEGORIAS_BORA_BRASIL)[number];

export function getCategoriaBoraBrasil(
  codigoTema: number | string,
  casa: "senado" | "camara",
): string | null {
  if (casa === "camara") {
    return CAMARA_THEME_MAP[Number(codigoTema)] ?? null;
  }
  return SENADO_CLASS_MAP[String(codigoTema)] ?? null;
}
