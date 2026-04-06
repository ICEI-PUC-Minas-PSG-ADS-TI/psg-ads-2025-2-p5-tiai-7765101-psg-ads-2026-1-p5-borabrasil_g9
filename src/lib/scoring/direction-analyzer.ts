// Direction Analyzer: determines whether a bill is progressive (+1) or regressive (-1)
// for lower income classes, based on ementa, explicação, indexação, and tema.
//
// +1 = projeto progressivo (beneficia classes baixas: reduz tributo regressivo, amplia SUS, etc.)
// -1 = projeto regressivo (prejudica classes baixas: aumenta tributo regressivo, corta benefício, etc.)
//  0 = neutro/indeterminado (não distorce o score)

type Direcao = 1 | -1 | 0;

// ── Signal word lists per theme ─────────────────────────────────────────────

interface SignalWords {
  progressivo: string[];
  regressivo: string[];
}

const SINAIS_TRIBUTACAO: SignalWords = {
  progressivo: [
    "reduz alíquota", "redução de alíquota", "reduzir alíquota",
    "isenta", "isenção", "isento",
    "desonera", "desoneração",
    "diminui tributo", "redução tribut", "reduz tribut",
    "cashback", "devolução",
    "reduz icms", "redução do icms", "reduzir icms",
    "reduz imposto", "redução de imposto",
    "simplifica tribut", "simplificação tribut",
    "progressividade", "imposto progressivo",
    "não incidência", "imunidade tribut",
    "cesta básica", "alimentos", "medicamento",
    "reduz ipi", "reduz pis", "reduz cofins",
    "zona franca", "incentivo fiscal",
    "reforma tributária", // in general context of 2023-2025 reform = progressive
    "imposto sobre grandes fortunas",
  ],
  regressivo: [
    "aumenta alíquota", "aumento de alíquota", "majoração",
    "majora", "eleva tributo", "eleva alíquota",
    "institui tributo", "cria tributo", "novo tributo", "nova contribuição",
    "revoga isenção", "revogação de isenção", "fim da isenção",
    "revoga benefício fiscal", "extingue benefício",
    "aumenta icms", "aumento do icms",
    "aumenta imposto", "aumento de imposto",
    "tributo regressivo",
    "contribuição sobre consumo",
  ],
};

const SINAIS_SAUDE: SignalWords = {
  progressivo: [
    "amplia", "ampliação", "universaliza",
    "garante acesso", "acesso universal",
    "aumenta investimento", "mais recurso",
    "cria programa", "novo programa",
    "sus", "sistema único",
    "atenção básica", "atenção primária",
    "farmácia popular", "medicamento gratuito",
    "piso da saúde", "piso nacional",
    "fortalece", "fortalecimento",
    "profissionais de saúde", "mais médicos",
    "vacinação", "imunização",
  ],
  regressivo: [
    "restringe", "restrição",
    "privatiza", "privatização",
    "reduz verba", "corte de verba", "redução de recurso",
    "desvincula receita", "desvinculação",
    "cobra", "cobrança", "copagamento",
    "plano de saúde obrigatório",
    "reduz piso",
  ],
};

const SINAIS_EDUCACAO: SignalWords = {
  progressivo: [
    "amplia", "ampliação", "universaliza",
    "aumenta investimento", "mais recurso",
    "fundeb", "piso do magistério", "piso salarial",
    "escola integral", "tempo integral",
    "creche", "educação infantil",
    "bolsa", "assistência estudantil",
    "ensino público", "escola pública",
    "gratuidade", "gratuito",
    "cota", "ação afirmativa",
    "alfabetização",
  ],
  regressivo: [
    "restringe", "reduz verba", "corte",
    "desvincula receita", "desvinculação",
    "privatiza", "voucher educacional",
    "reduz piso", "congela salário",
    "cobra mensalidade", "cobrança",
    "fim da gratuidade",
  ],
};

const SINAIS_TRABALHO: SignalWords = {
  progressivo: [
    "aumenta salário", "reajuste salarial", "aumento salarial",
    "salário mínimo", "piso salarial", "valorização salarial",
    "garante direito", "amplia direito",
    "amplia clt", "proteção ao trabalhador",
    "seguro desemprego", "fgts",
    "licença maternidade", "licença paternidade",
    "reduz jornada", "redução de jornada",
    "insalubridade", "periculosidade",
    "combate ao trabalho escravo", "trabalho infantil",
    "formalização", "carteira assinada",
  ],
  regressivo: [
    "flexibiliza", "flexibilização",
    "desregula", "desregulamentação",
    "reduz encargo", "redução de encargo",
    "permite terceirização irrestrita",
    "trabalho intermitente",
    "prevalência do negociado sobre o legislado",
    "reduz direito", "suprime direito",
    "fim da multa", "revoga clt",
    "banco de horas irrestrito",
  ],
};

const SINAIS_PREVIDENCIA: SignalWords = {
  progressivo: [
    "antecipa aposentadoria", "reduz idade mínima",
    "aumenta benefício", "reajuste acima da inflação",
    "amplia cobertura", "universaliza",
    "bpc", "benefício de prestação continuada",
    "aposentadoria especial", "aposentadoria rural",
    "pensão por morte",
    "reduz tempo de contribuição",
  ],
  regressivo: [
    "aumenta idade mínima", "reforma da previdência",
    "reduz benefício", "teto mais baixo",
    "desvincula", "capitalização",
    "aumenta tempo de contribuição",
    "restringe acesso", "endurece regra",
    "reduz pensão",
  ],
};

const SINAIS_DIREITOS_HUMANOS: SignalWords = {
  progressivo: [
    "amplia direito", "garante direito",
    "igualdade", "equidade",
    "combate à discriminação", "antidiscriminação",
    "proteção", "inclusão",
    "acessibilidade", "pessoa com deficiência",
    "idoso", "estatuto",
    "criança e adolescente", "eca",
    "violência contra a mulher", "maria da penha",
    "quilombola", "indígena", "terra indígena",
    "diversidade", "orientação sexual",
    "liberdade de expressão",
    "anistia", "reparação",
  ],
  regressivo: [
    "restringe direito", "suprime garantia",
    "reduz proteção", "revoga estatuto",
    "criminaliza", "endurecimento penal",
    "reduz maioridade",
    "porte de arma", "flexibiliza arma",
    "censura",
  ],
};

const SINAIS_MEIO_AMBIENTE: SignalWords = {
  progressivo: [
    "preserva", "preservação",
    "conserva", "conservação",
    "refloresta", "reflorestamento",
    "reduz emissão", "redução de emissão",
    "energia renovável", "energia limpa",
    "desmatamento zero", "combate ao desmatamento",
    "unidade de conservação", "área protegida",
    "sustentável", "sustentabilidade",
    "crédito de carbono", "mercado de carbono",
    "saneamento", "tratamento de esgoto",
    "reciclagem", "logística reversa",
  ],
  regressivo: [
    "flexibiliza licenciamento", "dispensa licenciamento",
    "reduz área protegida", "desafeta",
    "permite desmatamento", "anistia desmatamento",
    "agrotóxico", "libera agrotóxico",
    "revoga proteção", "reduz reserva legal",
    "mineração em terra indígena",
    "flexibiliza código florestal",
  ],
};

const SINAIS_SEGURANCA: SignalWords = {
  progressivo: [
    "combate à violência", "reduz violência",
    "policiamento comunitário",
    "prevenção", "programa social",
    "ressocialização", "alternativa penal",
    "proteção à vítima", "delegacia da mulher",
    "controle de armas", "desarmamento", "estatuto do desarmamento",
    "segurança pública com direitos humanos",
    "câmeras corporais",
  ],
  regressivo: [
    "excludente de ilicitude", "licença para matar",
    "reduz maioridade penal",
    "aumenta pena", "endurecimento penal",
    "regime fechado", "prisão perpétua",
    "porte de arma", "posse de arma", "flexibiliza arma",
    "pena de morte",
  ],
};

const SINAIS_URBANISMO: SignalWords = {
  progressivo: [
    "moradia popular", "habitação popular",
    "minha casa", "programa habitacional",
    "regularização fundiária",
    "saneamento básico",
    "transporte público", "mobilidade urbana",
    "tarifa zero", "tarifa social",
    "planejamento urbano",
    "função social da propriedade",
  ],
  regressivo: [
    "remoção", "despejo", "reintegração de posse",
    "privatiza saneamento",
    "aumenta tarifa", "reajuste de tarifa",
    "reduz subsídio",
    "especulação imobiliária",
  ],
};

const SINAIS_AGRICULTURA: SignalWords = {
  progressivo: [
    "agricultura familiar", "pronaf",
    "reforma agrária", "assentamento",
    "programa de aquisição de alimentos",
    "segurança alimentar",
    "crédito rural para pequeno",
    "cooperativa", "associação rural",
    "agroecologia", "orgânico",
  ],
  regressivo: [
    "concentração fundiária", "grilagem",
    "flexibiliza", "agrotóxico",
    "revoga função social",
    "desapropriação para agronegócio",
    "reduz reserva legal",
  ],
};

// Map tema → signal words
const SINAIS_POR_TEMA: Record<string, SignalWords> = {
  tributacao: SINAIS_TRIBUTACAO,
  saude: SINAIS_SAUDE,
  educacao: SINAIS_EDUCACAO,
  trabalho_emprego: SINAIS_TRABALHO,
  previdencia: SINAIS_PREVIDENCIA,
  direitos_humanos: SINAIS_DIREITOS_HUMANOS,
  meio_ambiente: SINAIS_MEIO_AMBIENTE,
  seguranca: SINAIS_SEGURANCA,
  urbanismo_habitacao: SINAIS_URBANISMO,
  agricultura: SINAIS_AGRICULTURA,
};

// Generic fallback signals (applied when tema-specific ones don't match)
const SINAIS_GENERICOS: SignalWords = {
  progressivo: [
    "amplia", "ampliação",
    "garante", "garante acesso",
    "universaliza", "inclusão",
    "aumenta investimento", "mais recurso",
    "benefício", "assistência",
    "gratuito", "gratuidade",
    "reduz desigualdade", "combate à pobreza",
    "programa social", "transferência de renda",
    "bolsa família", "auxílio brasil",
    "cesta básica",
    "reduz tarifa", "tarifa social",
    "piso nacional", "piso salarial",
    "reajuste", "valorização",
    // Formal legal verbs indicating new rights/programs
    "regulamenta a aposentadoria",
    "regulamenta o benefício",
    "dispõe sobre a proteção",
    "dispõe sobre a concessão",
    "institui programa",
    "cria programa",
    "estabelece direitos",
    "assegura",
  ],
  regressivo: [
    "restringe", "restrição",
    "privatiza", "privatização",
    "reduz verba", "corte de verba",
    "desvincula receita", "desvinculação",
    "revoga", "extingue",
    "reduz benefício", "corta benefício",
    "aumenta tarifa", "aumenta taxa",
    "congela", "congelamento",
    "teto de gastos",
    "reduz piso",
    "exploração de jogos", "apostas",
    "limita direito",
  ],
};

// Tema-based default direction for bills that can't be determined by text analysis.
// When a bill's topic is clearly about e.g. regulating a specific area, some themes
// tend to be inherently progressive or regressive for lower classes.
const DIRECAO_PADRAO_POR_TEMA: Record<string, Direcao> = {
  tributacao: 1,       // tax reform in Brazil (2023-2026) is generally progressive
  saude: 1,            // health legislation generally expands access
  educacao: 1,         // education legislation generally expands access
  previdencia: 1,      // social security legislation generally expands benefits
  trabalho_emprego: 1, // labor legislation generally protects workers
  direitos_humanos: 1, // human rights legislation generally expands protections
  urbanismo_habitacao: 1,
  agricultura: 1,      // in Senado context, generally about family agriculture
  meio_ambiente: 1,    // environmental legislation generally protects
  transporte: 1,
  // These are neutral — could go either way
  economia: 0,
  financas: 0,
  seguranca: 0,        // security can be progressive or regressive
  administracao: 0,
  industria_comercio: 0,
  ciencia_tecnologia: 0,
  comunicacoes: 0,
  defesa: 0,
  relacoes_exteriores: 0,
  energia: 0,
};

// ── Main analyzer ───────────────────────────────────────────────────────────

export function analisarDirecao(
  ementa: string,
  explicacao: string,
  indexacao: string,
  temaCategoria: string | null,
): Direcao {
  // Combine all text sources into one lowercase string for matching
  const texto = [ementa, explicacao, indexacao]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, ""); // remove accents for matching

  if (!texto || texto.length < 10) return 0;

  // 1. Try tema-specific signals first
  if (temaCategoria && SINAIS_POR_TEMA[temaCategoria]) {
    const sinais = SINAIS_POR_TEMA[temaCategoria];
    const resultado = contarSinais(texto, sinais);
    if (resultado !== 0) return resultado;
  }

  // 2. Fallback to generic signals
  const resultadoGenerico = contarSinais(texto, SINAIS_GENERICOS);
  if (resultadoGenerico !== 0) return resultadoGenerico;

  // 3. Use tema-based default direction as last resort
  //    This ensures that bills in inherently progressive topics (health, education)
  //    aren't discarded just because the ementa is too formal to parse.
  if (temaCategoria && DIRECAO_PADRAO_POR_TEMA[temaCategoria] !== undefined) {
    return DIRECAO_PADRAO_POR_TEMA[temaCategoria] as Direcao;
  }

  // 4. Truly indeterminate
  return 0;
}

function contarSinais(texto: string, sinais: SignalWords): Direcao {
  let scoreProgressivo = 0;
  let scoreRegressivo = 0;

  const textoNorm = texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  for (const palavra of sinais.progressivo) {
    const palavraNorm = palavra
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    if (textoNorm.includes(palavraNorm)) {
      scoreProgressivo++;
    }
  }

  for (const palavra of sinais.regressivo) {
    const palavraNorm = palavra
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    if (textoNorm.includes(palavraNorm)) {
      scoreRegressivo++;
    }
  }

  if (scoreProgressivo === 0 && scoreRegressivo === 0) return 0;
  if (scoreProgressivo > scoreRegressivo) return 1;
  if (scoreRegressivo > scoreProgressivo) return -1;

  // Tie → indeterminate
  return 0;
}
