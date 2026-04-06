import { NextResponse } from "next/server";
import { getCached, setCache, isStale } from "@/lib/cache";
import { analisarDirecao } from "@/lib/scoring/direction-analyzer";

// Câmara bulk downloads for deputy voting data.
// Real-time Câmara API returns 0 votos for recent votações,
// so we use the bulk JSON files which are updated daily.

const CAMARA_DOWNLOADS = "https://dadosabertos.camara.leg.br/arquivos";
const CACHE_KEY = "simulador:votos:camara:v2";
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24h — bulk data updates daily
const BULK_CACHE_TTL = 24 * 60 * 60 * 1000;
const ANO = "2024"; // Most recent complete year (2025 bulk is truncated)

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// ── Câmara theme → our scoring tema mapping ─────────────────────────────
const CAMARA_TEMA_MAP: Record<string, string> = {
  "Saúde": "saude",
  "Educação": "educacao",
  "Trabalho e Emprego": "emprego",
  "Previdência e Assistência Social": "previdencia",
  "Finanças Públicas e Orçamento": "tributacao",
  "Economia": "economia",
  "Defesa e Segurança": "seguranca",
  "Direitos Humanos e Minorias": "direitos_humanos",
  "Meio Ambiente e Desenvolvimento Sustentável": "meio_ambiente",
  "Energia, Recursos Hídricos e Minerais": "energia",
  "Administração Pública": "administracao",
  "Direito Penal e Processual Penal": "seguranca",
  "Cidades e Desenvolvimento Urbano": "infraestrutura",
  "Viação, Transporte e Mobilidade": "infraestrutura",
  "Indústria, Comércio e Serviços": "economia",
  "Agricultura, Pecuária, Pesca e Extrativismo": "economia",
  "Comunicações": "administracao",
  "Ciência, Tecnologia e Inovação": "educacao",
  "Direito e Defesa do Consumidor": "direitos_humanos",
  "Direito e Justiça": "administracao",
  "Direito Civil e Processual Civil": "administracao",
  "Política, Partidos e Eleições": "administracao",
  "Relações Internacionais e Comércio Exterior": "economia",
  "Estrutura Fundiária": "direitos_humanos",
  "Direito Constitucional": "administracao",
  "Homenagens e Datas Comemorativas": "administracao",
  "Arte, Cultura e Religião": "educacao",
  "Esporte e Lazer": "educacao",
  "Turismo": "economia",
  "Processo Legislativo e Atuação Parlamentar": "administracao",
  "Ciências Sociais e Humanas": "educacao",
  "Ciências Exatas e da Terra": "educacao",
};

// Committee name → tema mapping (extracted from descriptions)
const COMISSAO_TEMA_MAP: Record<string, string> = {
  "saúde": "saude",
  "educação": "educacao",
  "trabalho": "emprego",
  "previdência": "previdencia",
  "seguridade social": "previdencia",
  "segurança": "seguranca",
  "defesa": "seguranca",
  "direitos humanos": "direitos_humanos",
  "meio ambiente": "meio_ambiente",
  "minas e energia": "energia",
  "finanças e tributação": "tributacao",
  "tributação": "tributacao",
  "orçamento": "tributacao",
  "economia": "economia",
  "desenvolvimento econômico": "economia",
  "agricultura": "economia",
  "viação": "infraestrutura",
  "transporte": "infraestrutura",
  "desenvolvimento urbano": "infraestrutura",
  "ciência e tecnologia": "educacao",
  "relações exteriores": "economia",
  "consumidor": "direitos_humanos",
  "criança": "direitos_humanos",
  "idoso": "direitos_humanos",
  "pessoa com deficiência": "direitos_humanos",
};

// Keyword fallback for votação descriptions (same as Senado route)
const KEYWORD_TEMA_MAP: Array<{ tema: string; keywords: string[] }> = [
  { tema: "previdencia", keywords: ["previdência", "aposentadoria", "pensão", "inss", "benefício previdenciário"] },
  { tema: "saude", keywords: ["saúde", "sus", "medicamento", "hospital", "sanitário", "epidemia", "pandemia", "vacinação"] },
  { tema: "seguranca", keywords: ["segurança", "polícia", "penal", "crime", "arma", "prisão", "penitenciário", "drogas"] },
  { tema: "direitos_humanos", keywords: ["direitos humanos", "indígena", "quilombola", "racismo", "lgbtq", "criança", "adolescente", "idoso", "deficiente", "acessibilidade"] },
  { tema: "energia", keywords: ["energia", "elétric", "petróleo", "gás natural", "mineração", "combustível", "renovável"] },
  { tema: "educacao", keywords: ["educação", "ensino", "escola", "universidade", "professor", "fundeb", "estudante"] },
  { tema: "meio_ambiente", keywords: ["meio ambiente", "ambiental", "desmatamento", "clima", "floresta", "biodiversidade", "poluição"] },
  { tema: "emprego", keywords: ["trabalho", "emprego", "salário", "trabalhador", "CLT", "sindic", "férias", "jornada"] },
  { tema: "tributacao", keywords: ["tribut", "imposto", "fiscal", "orçament", "receita", "contribuição", "ICMS", "IPI", "ISS", "reforma tributária"] },
  { tema: "economia", keywords: ["econôm", "banco", "crédito", "financ", "câmbio", "inflação", "PIB", "dívida pública"] },
  { tema: "infraestrutura", keywords: ["infraestrutura", "transporte", "rodovia", "ferrovia", "saneamento", "habitação", "moradia"] },
  { tema: "administracao", keywords: ["administração", "servidor", "licitação", "concurso", "funcionalismo"] },
];

function classificarTemaFallback(texto: string): string | null {
  const lower = texto.toLowerCase();
  for (const entry of KEYWORD_TEMA_MAP) {
    for (const kw of entry.keywords) {
      if (lower.includes(kw.toLowerCase())) return entry.tema;
    }
  }
  return null;
}

// Extract PL/PLP/PEC references from description text → [(tipo, numero, ano)]
function extrairReferenciasPL(texto: string): Array<{ tipo: string; numero: number; ano: number }> {
  const refs: Array<{ tipo: string; numero: number; ano: number }> = [];

  // "Projeto de Lei nº 1.825, de 2023" or "Projeto de Lei Complementar nº 459, de 2017"
  const plRegex = /Projeto de Lei\s+(?:Complementar\s+)?n[ºo°]\s*([\d.]+),?\s*de\s*(\d{4})/gi;
  let match;
  while ((match = plRegex.exec(texto)) !== null) {
    const tipo = texto.slice(match.index).toLowerCase().includes("complementar") ? "PLP" : "PL";
    refs.push({ tipo, numero: parseInt(match[1].replace(/\./g, "")), ano: parseInt(match[2]) });
  }

  // "Proposta de Emenda à Constituição nº 31, de 2007"
  const pecRegex = /Proposta de Emenda\s+(?:à\s+)?Constitui[çc][aã]o\s+n[ºo°]\s*(\d+),?\s*de\s*(\d{4})/gi;
  while ((match = pecRegex.exec(texto)) !== null) {
    refs.push({ tipo: "PEC", numero: parseInt(match[1]), ano: parseInt(match[2]) });
  }

  // "Medida Provisória nº 1.234, de 2024"
  const mpvRegex = /Medida Provis[óo]ria\s+n[ºo°]\s*([\d.]+),?\s*de\s*(\d{4})/gi;
  while ((match = mpvRegex.exec(texto)) !== null) {
    refs.push({ tipo: "MPV", numero: parseInt(match[1].replace(/\./g, "")), ano: parseInt(match[2]) });
  }

  return refs;
}

// Extract committee name from description → tema
function extrairTemaComissao(texto: string): string | null {
  const lower = texto.toLowerCase();
  // Match "Comissão de X" patterns
  const comissaoMatch = lower.match(/comiss[aã]o\s+(?:especial\s+)?(?:de\s+|d[aeo]\s+)([\w\sçãõáéíóúâêôàü,]+?)(?:\s*,|\s*que|\s*\.|\s*$)/i);
  if (!comissaoMatch) return null;

  const comissaoNome = comissaoMatch[1].trim().toLowerCase();
  for (const [keyword, tema] of Object.entries(COMISSAO_TEMA_MAP)) {
    if (comissaoNome.includes(keyword)) return tema;
  }
  return null;
}

// ── Bulk data types ─────────────────────────────────────────────────────

interface BulkVoto {
  idVotacao: string;
  voto: string;
  deputado_: {
    id: string;
    nome: string;
    siglaPartido: string;
    siglaUf: string;
    urlFoto: string;
  };
}

interface BulkVotacao {
  id: string;
  siglaOrgao: string;
  descricao: string;
  idEvento?: number;
  ultimaApresentacaoProposicao?: {
    idProposicao?: number;
    descricao?: string;
  };
}

interface BulkTema {
  uriProposicao: string;
  siglaTipo: string;
  numero: number;
  ano: number;
  tema: string;
  codTema: number;
  relevancia: number;
}

interface VotoComTemaAPI {
  voto: string;
  temaCategoria: string | null;
  proposicaoId: string;
  descricao: string;
  direcaoImpacto: 1 | -1 | 0;
}

interface PresencaData {
  totalSessoes: number;
  presencas: number;
  ausenciasJustificadas: number;
  ausenciasNaoJustificadas: number;
}

interface CoerenciaData {
  totalVotos: number;
  votosAlinhados: number;
}

interface ParlamentarVotos {
  id: string;
  nome: string;
  siglaPartido: string;
  siglaUf: string;
  urlFoto: string;
  casa: "camara";
  votos: VotoComTemaAPI[];
  presenca?: PresencaData;
  coerencia?: CoerenciaData;
}

// ── Bulk fetch with caching ─────────────────────────────────────────────

async function fetchBulk<T>(dataset: string, ano: string): Promise<T[]> {
  const cacheKey = `bulk:camara:raw:${dataset}:${ano}`;

  if (!isStale(cacheKey)) {
    const cached = getCached<T[]>(cacheKey);
    if (cached) return cached.data;
  }

  const url = `${CAMARA_DOWNLOADS}/${dataset}/json/${dataset}-${ano}.json`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Bulk download failed: ${dataset}-${ano} → ${response.status}`);
  }

  const raw = await response.json();
  // Câmara bulk files can be a direct array or wrapped in {dados: [...]}
  const data: T[] = Array.isArray(raw) ? raw : (raw?.dados ?? []);
  setCache(cacheKey, data, BULK_CACHE_TTL);
  return data;
}

// ── GET handler ─────────────────────────────────────────────────────────

export async function GET() {
  // Return cached if fresh
  if (!isStale(CACHE_KEY)) {
    const cached = getCached<Record<string, ParlamentarVotos>>(CACHE_KEY);
    if (cached && Object.keys(cached.data).length > 0) {
      return NextResponse.json(
        { data: cached.data, fromCache: true, totalParlamentares: Object.keys(cached.data).length },
        { headers: { "X-Cache": "HIT" } },
      );
    }
  }

  try {
    // ── Phase 1: Download bulk files in parallel ─────────────────────────
    // Bills voted in 2024 can come from any year, so load proposicoesTemas
    // from multiple years for better coverage.
    const TEMAS_ANOS = ["2019", "2020", "2021", "2022", "2023", "2024"];
    const [votosRaw, votacoesRaw, ...temasArrays] = await Promise.all([
      fetchBulk<BulkVoto>("votacoesVotos", ANO),
      fetchBulk<BulkVotacao>("votacoes", ANO),
      ...TEMAS_ANOS.map((a) => fetchBulk<BulkTema>("proposicoesTemas", a).catch(() => [] as BulkTema[])),
    ]);
    // Merge all years' temas into one array
    const temasRaw = temasArrays.flat();

    // ── Phase 2: Build lookup maps ──────────────────────────────────────

    // 2a. votação id → metadata — PLEN only
    interface VotacaoMeta {
      descricao: string;
      ultDescricao: string;
      propId: number | null;
      idEvento: number | null;
      textoCompleto: string; // combined text for classification
    }
    const votacaoMap = new Map<string, VotacaoMeta>();
    for (const v of votacoesRaw) {
      if (v.siglaOrgao !== "PLEN") continue;
      const desc = v.descricao || "";
      const ultDesc = v.ultimaApresentacaoProposicao?.descricao || "";
      votacaoMap.set(v.id, {
        descricao: desc,
        ultDescricao: ultDesc,
        propId: v.ultimaApresentacaoProposicao?.idProposicao ?? null,
        idEvento: v.idEvento ?? null,
        textoCompleto: `${desc} ${ultDesc}`,
      });
    }

    // 2b. proposição id → tema (by numeric ID)
    const propIdTemaMap = new Map<string, string>();
    // 2c. proposição (tipo+numero+ano) → tema (for PL number extraction)
    const propRefTemaMap = new Map<string, string>();
    for (const t of temasRaw) {
      const mapped = CAMARA_TEMA_MAP[t.tema];
      if (!mapped) continue;
      // By proposição ID
      const match = t.uriProposicao.match(/\/proposicoes\/(\d+)$/);
      if (match) {
        if (!propIdTemaMap.has(match[1])) propIdTemaMap.set(match[1], mapped);
      }
      // By (tipo, numero, ano) — for PL reference extraction
      const refKey = `${t.siglaTipo}|${t.numero}|${t.ano}`;
      if (!propRefTemaMap.has(refKey)) propRefTemaMap.set(refKey, mapped);
    }

    // ── Phase 2d: Pre-classify tema for each votação (6 strategies) ─────
    const votacaoTemaMap = new Map<string, string>();
    let strategy1 = 0, strategy2 = 0, strategy3 = 0, strategy4 = 0, strategy5 = 0;

    for (const [votId, meta] of Array.from(votacaoMap.entries())) {
      let tema: string | null = null;

      // Strategy 1: Direct proposição ID → tema
      if (!tema && meta.propId) {
        tema = propIdTemaMap.get(String(meta.propId)) ?? null;
        if (tema) strategy1++;
      }

      // Strategy 2: Extract PL/PLP/PEC number from descriptions → lookup
      if (!tema) {
        const refs = extrairReferenciasPL(meta.textoCompleto);
        for (const ref of refs) {
          const refKey = `${ref.tipo}|${ref.numero}|${ref.ano}`;
          tema = propRefTemaMap.get(refKey) ?? null;
          if (tema) { strategy2++; break; }
        }
      }

      // Strategy 3: Committee name extraction from descriptions
      if (!tema) {
        tema = extrairTemaComissao(meta.textoCompleto);
        if (tema) strategy3++;
      }

      // Strategy 4: Keyword matching on COMBINED text (short + long description)
      if (!tema) {
        tema = classificarTemaFallback(meta.textoCompleto);
        if (tema) strategy4++;
      }

      // Strategy 5: Keyword matching on short description only (already tried above,
      // but textoCompleto may be empty if ultDescricao was empty)
      if (!tema && meta.descricao !== meta.textoCompleto) {
        tema = classificarTemaFallback(meta.descricao);
        if (tema) strategy5++;
      }

      if (tema) votacaoTemaMap.set(votId, tema);
    }

    // ── Phase 2e: Event grouping — propagate tema to siblings ───────────
    // Group votações by idEvento
    const eventVotacoes = new Map<number, string[]>();
    for (const [votId, meta] of Array.from(votacaoMap.entries())) {
      if (!meta.idEvento) continue;
      const existing = eventVotacoes.get(meta.idEvento) ?? [];
      existing.push(votId);
      eventVotacoes.set(meta.idEvento, existing);
    }
    // For each event, find the first classified tema and propagate
    let strategy6 = 0;
    for (const [, votIds] of Array.from(eventVotacoes.entries())) {
      // Find first tema in this event
      let eventTema: string | null = null;
      for (const vid of votIds) {
        if (votacaoTemaMap.has(vid)) { eventTema = votacaoTemaMap.get(vid)!; break; }
      }
      if (!eventTema) continue;
      // Propagate to unclassified siblings
      for (const vid of votIds) {
        if (!votacaoTemaMap.has(vid)) {
          votacaoTemaMap.set(vid, eventTema);
          strategy6++;
        }
      }
    }

    const totalVotacoes = votacaoMap.size;
    const temasResolvidos = votacaoTemaMap.size;

    // ── Phase 3: Build parlamentar map using pre-classified temas ────────
    const parlamentarMap: Record<string, ParlamentarVotos> = {};
    const plenVotacaoIds = new Set(votacaoMap.keys());
    let direcoesResolvidas = 0;
    let votosComTema = 0;

    // Group votes by votação for party majority calculation
    const votesByVotacao = new Map<string, Array<{ partido: string; voto: string }>>();

    // Cache direction per votação to avoid recomputing
    const votacaoDirecaoCache = new Map<string, 1 | -1 | 0>();

    for (const voto of votosRaw) {
      if (voto.voto !== "Sim" && voto.voto !== "Não") continue;
      if (!plenVotacaoIds.has(voto.idVotacao)) continue;

      const votacaoMeta = votacaoMap.get(voto.idVotacao)!;
      const temaCategoria = votacaoTemaMap.get(voto.idVotacao) ?? null;
      if (temaCategoria) votosComTema++;

      // Direction analysis (cached per votação)
      let direcaoImpacto = votacaoDirecaoCache.get(voto.idVotacao);
      if (direcaoImpacto === undefined) {
        direcaoImpacto = analisarDirecao(
          votacaoMeta.textoCompleto,
          "", // no explicacao
          "", // no indexacao
          temaCategoria,
        );
        votacaoDirecaoCache.set(voto.idVotacao, direcaoImpacto);
      }
      if (direcaoImpacto !== 0) direcoesResolvidas++;

      const dep = voto.deputado_;
      const key = dep.id;

      if (!parlamentarMap[key]) {
        parlamentarMap[key] = {
          id: `camara-${dep.id}`,
          nome: dep.nome,
          siglaPartido: dep.siglaPartido,
          siglaUf: dep.siglaUf,
          urlFoto: dep.urlFoto || "",
          casa: "camara",
          votos: [],
        };
      }

      parlamentarMap[key].votos.push({
        voto: voto.voto,
        temaCategoria,
        proposicaoId: voto.idVotacao,
        descricao: votacaoMeta.descricao.slice(0, 150),
        direcaoImpacto,
      });

      // Track for party majority
      const existing = votesByVotacao.get(voto.idVotacao) ?? [];
      existing.push({ partido: dep.siglaPartido, voto: voto.voto });
      votesByVotacao.set(voto.idVotacao, existing);
    }

    // ── Phase 4: Derive presença ────────────────────────────────────────
    // Use the number of votações with actual Sim/Não votes as denominator,
    // not ALL PLEN votações (which includes voice votes, procedural, etc.)
    const nominalVotacoes = votesByVotacao.size;
    for (const [, parlData] of Object.entries(parlamentarMap)) {
      const votou = parlData.votos.length;
      const ausencias = nominalVotacoes - votou;
      parlData.presenca = {
        totalSessoes: nominalVotacoes,
        presencas: votou,
        ausenciasJustificadas: 0,
        ausenciasNaoJustificadas: Math.max(0, ausencias),
      };
    }

    // ── Phase 5: Derive coerência from party majority ───────────────────
    const partyMajority = new Map<string, Map<string, string>>();
    for (const [votId, votes] of Array.from(votesByVotacao.entries())) {
      const partyVotes = new Map<string, { sim: number; nao: number }>();
      for (const v of votes) {
        const counts = partyVotes.get(v.partido) ?? { sim: 0, nao: 0 };
        if (v.voto === "Sim") counts.sim++;
        else counts.nao++;
        partyVotes.set(v.partido, counts);
      }
      const majorityMap = new Map<string, string>();
      Array.from(partyVotes.entries()).forEach(([party, counts]) => {
        if (counts.sim === counts.nao) return;
        majorityMap.set(party, counts.sim > counts.nao ? "Sim" : "Não");
      });
      if (majorityMap.size > 0) partyMajority.set(votId, majorityMap);
    }

    for (const [, parlData] of Object.entries(parlamentarMap)) {
      let total = 0;
      let alinhados = 0;
      for (const voto of parlData.votos) {
        const maj = partyMajority.get(voto.proposicaoId);
        if (!maj) continue;
        const partidoMaj = maj.get(parlData.siglaPartido);
        if (!partidoMaj) continue;
        total++;
        if (partidoMaj === voto.voto) alinhados++;
      }
      if (total > 0) {
        parlData.coerencia = { totalVotos: total, votosAlinhados: alinhados };
      }
    }

    // Cache
    const totalParlamentares = Object.keys(parlamentarMap).length;
    if (totalParlamentares > 0) {
      setCache(CACHE_KEY, parlamentarMap, CACHE_TTL);
    }

    return NextResponse.json(
      {
        data: parlamentarMap,
        fromCache: false,
        totalParlamentares,
        totalVotacoes,
        temasResolvidos,
        direcoesResolvidas,
        votosComTema,
        strategies: { propId: strategy1, plRef: strategy2, comissao: strategy3, keyword: strategy4, keywordShort: strategy5, eventGroup: strategy6 },
        ano: ANO,
      },
      { headers: { "X-Cache": "MISS" } },
    );
  } catch (error) {
    const stale = getCached<Record<string, ParlamentarVotos>>(CACHE_KEY);
    if (stale && Object.keys(stale.data).length > 0) {
      return NextResponse.json(
        { data: stale.data, fromCache: true, stale: true },
        { headers: { "X-Cache": "STALE" } },
      );
    }
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
