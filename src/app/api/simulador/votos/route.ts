import { NextResponse } from "next/server";
import { getCached, setCache, isStale } from "@/lib/cache";
import { resolverClassificacaoSenado } from "@/data/theme-category-map";
import { analisarDirecao } from "@/lib/scoring/direction-analyzer";

// Uses the Senado API which includes inline vote records (Sim/Não) per votação.
// For each matéria voted on, we fetch full details (ementa, classificação, assunto)
// to determine BOTH the topic AND the direction of impact.

const SENADO_BASE = "https://legis.senado.leg.br/dadosabertos";
const CACHE_KEY = "simulador:votos:senado:v5";
const CACHE_TTL = 2 * 60 * 60 * 1000; // 2h
const MATERIA_CACHE_PREFIX = "simulador:materia:";
const MATERIA_CACHE_TTL = 24 * 60 * 60 * 1000; // 24h — matéria details don't change
const CONCURRENT_LIMIT = 5;

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
  casa: "senado";
  votos: VotoComTemaAPI[];
  presenca?: PresencaData;
  coerencia?: CoerenciaData;
}

// Structured matéria details from Senado API
interface MateriaDetalhes {
  ementa: string;
  explicacao: string;
  indexacao: string;
  temaCategoria: string | null;
  descricaoClassificacao: string;
  assuntoGeral: string;
  assuntoEspecifico: string;
}

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Keyword-based tema classification — used as FALLBACK when API classification is unavailable.
// ORDER MATTERS: more specific themes first, generic ones (economia, administracao) last.
const KEYWORD_TEMA_MAP: Array<{ keywords: string[]; tema: string }> = [
  { keywords: ["tribut", "icms", "imposto", "fiscal", "cofins", "pis", "ipi", "irpf", "irpj", "iss", "reforma tributária", "ibs", "cbs", "alíquota", "aliquota", "incentivo fiscal", "benefício fiscal", "desoneração", "desoneracao"], tema: "tributacao" },
  { keywords: ["previdên", "previdenc", "aposentadoria", "aposentadoria especial", "inss", "pensão", "pensao", "benefício previdenciár", "seguridade social", "bpc", "benefício de prestação continuada"], tema: "previdencia" },
  { keywords: ["saúde", "saude", "sus", "médic", "hospital", "farmac", "vagin", "epidem", "pandemia", "doença", "agentes comunitários de saúde", "agentes de saúde", "vigilância sanitária"], tema: "saude" },
  { keywords: ["educa", "escola", "ensino", "universid", "fundeb", "professor", "estudant", "magistério", "alfabetização"], tema: "educacao" },
  { keywords: ["trabalh", "emprego", "salário", "salario", "CLT", "trabalhist", "sindic", "jornada de trabalho", "seguro desemprego", "fgts"], tema: "trabalho_emprego" },
  { keywords: ["meio ambient", "ambiental", "desmatamento", "climátic", "carbono", "sustentab", "floresta", "resíduo", "licenciamento ambiental", "unidade de conservação"], tema: "meio_ambiente" },
  { keywords: ["execução penal", "código penal", "lei penal", "segurança pública", "seguranca publica", "polícia", "policia", "penal", "crime", "prisão", "prisao", "arma de fogo", "porte de arma", "pena privativa"], tema: "seguranca" },
  { keywords: ["direitos humanos", "direito fundamental", "discrimin", "racial", "indígena", "indigena", "demarcação", "demarcacao", "quilombo", "idoso", "criança", "deficien", "lgb", "gênero", "genero", "marco temporal", "terra indígena"], tema: "direitos_humanos" },
  { keywords: ["agricultura familiar", "rural", "agropec", "agrícol", "agricol", "pecuár", "reforma agrária", "assentamento", "pronaf"], tema: "agricultura" },
  { keywords: ["energia", "elétric", "eletric", "petról", "petroleo", "gás natural", "renováv", "eólica", "solar", "lei nº 9.074", "lei nº 9.427", "concessão de energia", "setor elétrico"], tema: "energia" },
  { keywords: ["finança", "financa", "financ", "banco", "crédito", "credito", "dívida", "divida", "orçament", "orcament", "lei de responsabilidade fiscal", "lei complementar nº 101"], tema: "financas" },
  { keywords: ["transport", "rodovia", "ferrovia", "porto", "aeroporto", "mobilid", "trânsito", "transito"], tema: "transporte" },
  { keywords: ["habitação", "habitacao", "moradia", "saneament", "minha casa"], tema: "urbanismo_habitacao" },
  { keywords: ["tecnolog", "inovação", "inovacao", "digital", "internet", "inteligência artificial", "ciência", "ciencia", "pesquisa científica"], tema: "ciencia_tecnologia" },
  { keywords: ["defesa nacional", "militar", "forças armadas", "exército", "marinha", "aeronáutica"], tema: "defesa" },
  { keywords: ["comunicaç", "comunicac", "telecom", "radiodifus", "imprensa", "mídia", "midia"], tema: "comunicacoes" },
  { keywords: ["relações exteriores", "diplomát", "diplomac", "embaixad", "tratado internacional"], tema: "relacoes_exteriores" },
  { keywords: ["indústri", "industri", "comérci", "comerci", "exporta", "importa", "jogos", "apostas", "loteria"], tema: "industria_comercio" },
  { keywords: ["econom", "pib", "crescimento", "inflação", "inflacao", "monetár", "lei complementar nº 200"], tema: "economia" },
  { keywords: ["servidor público", "cargo público", "concurso público", "funcionalismo", "acumulação remunerada", "provimento"], tema: "administracao" },
  { keywords: ["inelegibilidade", "eleitoral", "eleição", "eleicao", "lei eleitoral", "ficha limpa", "campanha eleitoral"], tema: "administracao" },
];

// "Generic" temas — if the API returns one of these, also try keyword match on ementa for a more specific override
const TEMAS_GENERICOS = new Set(["administracao", "economia"]);

function classificarTemaFallback(texto: string): string | null {
  const lower = texto.toLowerCase();
  for (const entry of KEYWORD_TEMA_MAP) {
    for (const kw of entry.keywords) {
      if (lower.includes(kw.toLowerCase())) {
        return entry.tema;
      }
    }
  }
  return null;
}

// Fetch JSON from Senado with timeout
async function fetchSenado<T>(url: string, timeoutMs = 12000): Promise<T | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: controller.signal,
      cache: "no-store",
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

// Generate date ranges (3-month windows going back)
function getDateRanges(windowsCount: number): Array<{ inicio: string; fim: string }> {
  const ranges: Array<{ inicio: string; fim: string }> = [];
  const now = new Date();
  for (let i = 0; i < windowsCount; i++) {
    const fim = new Date(now);
    fim.setMonth(fim.getMonth() - i * 3);
    const inicio = new Date(fim);
    inicio.setMonth(inicio.getMonth() - 3);

    const fmtDate = (d: Date) =>
      `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;

    ranges.push({ inicio: fmtDate(inicio), fim: fmtDate(fim) });
  }
  return ranges;
}

// Run async tasks with concurrency limit
async function pMap<T, R>(
  items: T[],
  fn: (item: T) => Promise<R>,
  concurrency: number,
): Promise<R[]> {
  const results: R[] = [];
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const idx = i++;
      results[idx] = await fn(items[idx]);
    }
  }
  const workers = Array.from({ length: Math.min(concurrency, items.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

// ── Fetch matéria details from Senado API ───────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractMateriaDetalhes(xml: any): MateriaDetalhes | null {
  try {
    const materia = xml?.DetalheMateria?.Materia;
    if (!materia) return null;

    const dados = materia.DadosBasicosMateria ?? {};
    const ementa = dados.EmentaMateria ?? "";
    const explicacao = dados.ExplicacaoEmentaMateria ?? "";
    const indexacao = dados.IndexacaoMateria ?? "";

    // Try official classification
    let temaCategoria: string | null = null;
    let descricaoClassificacao = "";

    // 1. Classificacoes[]
    const classificacoes = materia.Classificacoes?.Classificacao;
    if (classificacoes) {
      const lista = Array.isArray(classificacoes) ? classificacoes : [classificacoes];
      for (const c of lista) {
        const hierarquia = c.DescricaoClasseHierarquica ?? c.DescricaoClasse ?? "";
        descricaoClassificacao = hierarquia;
        const resolved = resolverClassificacaoSenado(hierarquia);
        if (resolved) {
          temaCategoria = resolved;
          break;
        }
        // Try just the DescricaoClasse
        if (c.DescricaoClasse) {
          const resolvedClasse = resolverClassificacaoSenado(c.DescricaoClasse);
          if (resolvedClasse) {
            temaCategoria = resolvedClasse;
            break;
          }
        }
      }
    }

    // 2. Assunto
    let assuntoGeral = "";
    let assuntoEspecifico = "";
    const assunto = materia.Assunto;
    if (assunto) {
      assuntoEspecifico = assunto.AssuntoEspecifico?.Descricao ?? "";
      assuntoGeral = assunto.AssuntoGeral?.Descricao ?? "";
      if (!temaCategoria && assuntoEspecifico) {
        temaCategoria = resolverClassificacaoSenado(assuntoEspecifico);
      }
      if (!temaCategoria && assuntoGeral) {
        temaCategoria = resolverClassificacaoSenado(assuntoGeral);
      }
    }

    // 3. If tema is generic (administracao, economia), try keyword override on ementa
    //    to get a more specific classification
    if (temaCategoria && TEMAS_GENERICOS.has(temaCategoria)) {
      const maisEspecifico = classificarTemaFallback(`${ementa} ${explicacao} ${indexacao}`);
      if (maisEspecifico && maisEspecifico !== temaCategoria) {
        temaCategoria = maisEspecifico;
      }
    }

    // 4. Fallback to keyword-based on ementa + explicação
    if (!temaCategoria) {
      temaCategoria = classificarTemaFallback(`${ementa} ${explicacao} ${indexacao}`);
    }

    return {
      ementa,
      explicacao,
      indexacao,
      temaCategoria,
      descricaoClassificacao,
      assuntoGeral,
      assuntoEspecifico,
    };
  } catch {
    return null;
  }
}

async function fetchMateriaDetalhes(codigoMateria: string): Promise<MateriaDetalhes | null> {
  // Check per-matéria cache first
  const cacheKey = `${MATERIA_CACHE_PREFIX}${codigoMateria}`;
  if (!isStale(cacheKey)) {
    const cached = getCached<MateriaDetalhes>(cacheKey);
    if (cached) return cached.data;
  }

  const data = await fetchSenado<unknown>(
    `${SENADO_BASE}/materia/${codigoMateria}`,
    8000,
  );
  if (!data) return null;

  const detalhes = extractMateriaDetalhes(data);
  if (detalhes) {
    setCache(cacheKey, detalhes, MATERIA_CACHE_TTL);
  }
  return detalhes;
}

// ── Types ───────────────────────────────────────────────────────────────────

interface SenadoVotacao {
  CodigoMateria: string;
  SiglaMateria: string;
  NumeroMateria: string;
  AnoMateria: string;
  DescricaoVotacao: string;
  Secreta: string;
  Votos?: {
    VotoParlamentar?: Array<{
      CodigoParlamentar: string;
      NomeParlamentar: string;
      SiglaPartido: string;
      SiglaUF: string;
      Foto: string;
      Voto: string;
    }> | {
      CodigoParlamentar: string;
      NomeParlamentar: string;
      SiglaPartido: string;
      SiglaUF: string;
      Foto: string;
      Voto: string;
    };
  };
}

// ── GET handler ─────────────────────────────────────────────────────────────

export async function GET() {
  // Return cached if fresh and non-empty
  if (!isStale(CACHE_KEY)) {
    const cached = getCached<Record<string, ParlamentarVotos>>(CACHE_KEY);
    if (cached && Object.keys(cached.data).length > 0) {
      return NextResponse.json(
        {
          data: cached.data,
          fromCache: true,
          totalParlamentares: Object.keys(cached.data).length,
        },
        { headers: { "X-Cache": "HIT" } },
      );
    }
  }

  try {
    // ── Phase 1: Fetch all votações ───────────────────────────────────────
    const ranges = getDateRanges(2);

    const rangeResults = await Promise.allSettled(
      ranges.map((range) =>
        fetchSenado<{
          ListaVotacoes?: {
            Votacoes?: {
              Votacao?: SenadoVotacao[] | SenadoVotacao;
            };
          };
        }>(`${SENADO_BASE}/plenario/lista/votacao/${range.inicio}/${range.fim}`),
      ),
    );

    // Collect all votações and unique matéria codes
    const allVotacoes: SenadoVotacao[] = [];
    const materiaCodigos = new Set<string>();

    for (const result of rangeResults) {
      if (result.status !== "fulfilled" || !result.value) continue;
      let votacoes = result.value.ListaVotacoes?.Votacoes?.Votacao ?? [];
      if (!Array.isArray(votacoes)) votacoes = [votacoes];

      for (const votacao of votacoes) {
        if (votacao.Secreta === "S") continue;
        const votosRaw = votacao.Votos?.VotoParlamentar;
        if (!votosRaw) continue;
        const votos = Array.isArray(votosRaw) ? votosRaw : [votosRaw];
        const hasSimNao = votos.some((v) => v.Voto === "Sim" || v.Voto === "Não");
        if (!hasSimNao) continue;

        allVotacoes.push(votacao);
        if (votacao.CodigoMateria) {
          materiaCodigos.add(votacao.CodigoMateria);
        }
      }
    }

    // ── Phase 2: Fetch matéria details in parallel (deduped, with concurrency limit)
    const materiaMap = new Map<string, MateriaDetalhes>();
    const codigos = Array.from(materiaCodigos);

    await pMap(
      codigos,
      async (codigo) => {
        const detalhes = await fetchMateriaDetalhes(codigo);
        if (detalhes) {
          materiaMap.set(codigo, detalhes);
        }
      },
      CONCURRENT_LIMIT,
    );

    // ── Phase 3: Build parlamentar map with enriched data ─────────────────
    const parlamentarMap: Record<string, ParlamentarVotos> = {};
    let totalVotacoes = 0;
    let temasResolvidos = 0;
    let direcoesResolvidas = 0;

    for (const votacao of allVotacoes) {
      totalVotacoes++;

      const codigo = votacao.CodigoMateria;
      const detalhes = codigo ? materiaMap.get(codigo) : undefined;

      // Resolve tema: prefer API classification, fallback to keywords on description
      let temaCategoria: string | null = detalhes?.temaCategoria ?? null;
      const descricaoVotacao = votacao.DescricaoVotacao || "";
      const sigla = `${votacao.SiglaMateria} ${votacao.NumeroMateria}/${votacao.AnoMateria}`;

      if (!temaCategoria) {
        temaCategoria = classificarTemaFallback(`${descricaoVotacao} ${sigla}`);
      }
      if (temaCategoria) temasResolvidos++;

      // Analyze direction of impact
      const direcaoImpacto = detalhes
        ? analisarDirecao(
            detalhes.ementa,
            detalhes.explicacao,
            detalhes.indexacao,
            temaCategoria,
          )
        : (0 as const);
      if (direcaoImpacto !== 0) direcoesResolvidas++;

      const proposicaoId = codigo || votacao.SiglaMateria;
      const descricaoTexto = detalhes?.ementa
        ? `${sigla}: ${detalhes.ementa.slice(0, 150)}`
        : `${sigla}: ${descricaoVotacao.slice(0, 120)}`;

      // Assign votes to parlamentares
      const votosRaw = votacao.Votos?.VotoParlamentar;
      if (!votosRaw) continue;
      const votos = Array.isArray(votosRaw) ? votosRaw : [votosRaw];

      for (const vp of votos) {
        if (vp.Voto !== "Sim" && vp.Voto !== "Não") continue;

        const key = vp.CodigoParlamentar;
        if (!parlamentarMap[key]) {
          parlamentarMap[key] = {
            id: `senado-${vp.CodigoParlamentar}`,
            nome: vp.NomeParlamentar,
            siglaPartido: vp.SiglaPartido,
            siglaUf: vp.SiglaUF,
            urlFoto: vp.Foto || "",
            casa: "senado",
            votos: [],
          };
        }

        parlamentarMap[key].votos.push({
          voto: vp.Voto,
          temaCategoria,
          proposicaoId,
          descricao: descricaoTexto,
          direcaoImpacto,
        });
      }
    }

    // ── Phase 4: Derive presença from vote participation ──────────────────
    // Presença = how many of the total votações each senator participated in.
    // A senator who voted (Sim/Não) in a votação is "present" for it.
    // totalVotacoes is the total number of nominal votações in the period.
    for (const [, parlData] of Object.entries(parlamentarMap)) {
      const votou = parlData.votos.length;
      const ausencias = totalVotacoes - votou;
      parlData.presenca = {
        totalSessoes: totalVotacoes,
        presencas: votou,
        ausenciasJustificadas: 0, // not available from this data source
        ausenciasNaoJustificadas: Math.max(0, ausencias),
      };
    }

    // ── Phase 5: Derive coerência from party majority per votação ────────
    // For each votação, determine what the majority of each party voted.
    // Then check if each senator voted with their party's majority.
    // Build per-votação party majority: proposicaoId → party → majority vote
    const partyMajorityPerVotacao = new Map<string, Map<string, string>>();

    for (const votacao of allVotacoes) {
      const codigo = votacao.CodigoMateria || votacao.SiglaMateria;
      const votosRaw = votacao.Votos?.VotoParlamentar;
      if (!votosRaw) continue;
      const votos = Array.isArray(votosRaw) ? votosRaw : [votosRaw];

      // Count Sim/Não per party for this votação
      const partyVotes = new Map<string, { sim: number; nao: number }>();
      for (const vp of votos) {
        if (vp.Voto !== "Sim" && vp.Voto !== "Não") continue;
        const counts = partyVotes.get(vp.SiglaPartido) ?? { sim: 0, nao: 0 };
        if (vp.Voto === "Sim") counts.sim++;
        else counts.nao++;
        partyVotes.set(vp.SiglaPartido, counts);
      }

      // Determine majority for each party
      const majorityMap = new Map<string, string>();
      Array.from(partyVotes.entries()).forEach(([party, counts]) => {
        // If exactly tied, skip (no clear majority)
        if (counts.sim === counts.nao) return;
        majorityMap.set(party, counts.sim > counts.nao ? "Sim" : "Não");
      });
      if (majorityMap.size > 0) {
        partyMajorityPerVotacao.set(codigo, majorityMap);
      }
    }

    // Now compare each parlamentar's votes against their party majority
    for (const [, parlData] of Object.entries(parlamentarMap)) {
      let totalComMajoria = 0;
      let alinhados = 0;

      for (const voto of parlData.votos) {
        const majorityMap = partyMajorityPerVotacao.get(voto.proposicaoId);
        if (!majorityMap) continue;

        const partidoMajoria = majorityMap.get(parlData.siglaPartido);
        if (!partidoMajoria) continue;

        totalComMajoria++;
        if (partidoMajoria === voto.voto) {
          alinhados++;
        }
      }

      if (totalComMajoria > 0) {
        parlData.coerencia = { totalVotos: totalComMajoria, votosAlinhados: alinhados };
      }
    }

    // Only cache if we got real data
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
        materiasEnriquecidas: materiaMap.size,
        materiasTotal: materiaCodigos.size,
        presencaEnriquecida: Object.values(parlamentarMap).filter((p) => p.presenca).length,
        coerenciaEnriquecida: Object.values(parlamentarMap).filter((p) => p.coerencia).length,
      },
      { headers: { "X-Cache": "MISS" } },
    );
  } catch (error) {
    // Try stale cache
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
