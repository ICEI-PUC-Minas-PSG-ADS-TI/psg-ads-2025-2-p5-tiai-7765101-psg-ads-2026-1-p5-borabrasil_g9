"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  Calculator,
  Info,
  Loader2,
  AlertCircle,
  Search,
  Trophy,
  Medal,
  Award,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  TrendingDown,
  Minus,
  Scale,
  BarChart3,
  BookOpen,
} from "lucide-react";
import { getCorScore, getLabelScore, getBgCorScore } from "@/lib/scoring/aggregator";
import { getDescricaoFaixa, getTodasFaixas } from "@/lib/scoring/weights/income-weights";
import { calcularImpactoRenda } from "@/lib/scoring/calculators/income-impact";
import { useSimuladorVotos, type ParlamentarVotos } from "@/hooks/use-simulador";
import type { FaixaRenda } from "@/services/types/scoring.types";
import type { VotoComTema } from "@/lib/scoring/types";

const FAIXAS: FaixaRenda[] = ["classe_e", "classe_d", "classe_c", "classe_b", "classe_a"];
const TOP_N = 20;

function mapVotosToComTema(dep: ParlamentarVotos): VotoComTema[] {
  return dep.votos.map((v) => ({
    voto: v.voto === "Sim" ? "Sim" : v.voto === "Não" ? "Não" : "Outro",
    temaCategoria: v.temaCategoria,
    proposicaoId: v.proposicaoId,
    descricao: v.descricao,
    direcaoImpacto: v.direcaoImpacto ?? 0,
  }));
}

function PodiumIcon({ posicao }: { posicao: number }) {
  if (posicao === 1)
    return <Trophy className="h-5 w-5 text-yellow-500" />;
  if (posicao === 2)
    return <Medal className="h-5 w-5 text-gray-400" />;
  if (posicao === 3)
    return <Award className="h-5 w-5 text-amber-600" />;
  return null;
}

function MetodologiaSection() {
  const [aberto, setAberto] = useState(false);

  return (
    <Card className="mb-8">
      <button
        onClick={() => setAberto(!aberto)}
        className="flex w-full items-center justify-between px-6 py-4 text-left"
      >
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          <span className="font-semibold">Como o score é calculado?</span>
        </div>
        {aberto ? (
          <ChevronUp className="h-5 w-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        )}
      </button>

      {aberto && (
        <CardContent className="border-t pt-6">
          {/* Step 1 */}
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                1
              </div>
              <div>
                <h4 className="font-semibold">Coleta de votações</h4>
                <p className="mt-1 text-sm text-muted-foreground">
                  Buscamos todas as <strong>votações nominais do Plenário do Senado</strong> dos
                  últimos 6 meses via API oficial (Dados Abertos do Senado). Só contam votos
                  &quot;Sim&quot; ou &quot;Não&quot; — abstenções e votos secretos são ignorados.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                2
              </div>
              <div>
                <h4 className="font-semibold">Classificação do tema</h4>
                <p className="mt-1 text-sm text-muted-foreground">
                  Para cada projeto de lei votado, consultamos os <strong>metadados oficiais da matéria</strong> (ementa,
                  classificação hierárquica, assunto) para identificar o tema: tributação, saúde,
                  educação, trabalho, previdência, etc. Quando a classificação oficial é genérica,
                  usamos a ementa como refinamento.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-4">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                3
              </div>
              <div>
                <h4 className="font-semibold">Análise da direção do impacto</h4>
                <p className="mt-1 text-sm text-muted-foreground">
                  Analisamos a <strong>ementa e explicação</strong> de cada projeto para determinar se ele
                  é <strong>progressivo</strong> (beneficia classes mais baixas) ou <strong>regressivo</strong> (prejudica).
                  Projetos com direção indeterminada são excluídos do cálculo para não distorcer o score.
                </p>
                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                  <div className="flex items-center gap-2 rounded-lg bg-green-500/10 p-2 text-sm">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span><strong>Progressivo (+1)</strong>: reduz ICMS, amplia SUS</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg bg-red-500/10 p-2 text-sm">
                    <TrendingDown className="h-4 w-4 text-red-600" />
                    <span><strong>Regressivo (−1)</strong>: aumenta tributo, corta benefício</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg bg-gray-500/10 p-2 text-sm">
                    <Minus className="h-4 w-4 text-gray-500" />
                    <span><strong>Neutro (0)</strong>: indeterminado, excluído</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex gap-4">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                4
              </div>
              <div>
                <h4 className="font-semibold">Cálculo do score por faixa de renda</h4>
                <p className="mt-1 text-sm text-muted-foreground">
                  Cada tema tem um <strong>peso diferente</strong> para cada classe social. Por exemplo:
                </p>
                <div className="mt-2 overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b text-left text-muted-foreground">
                        <th className="pb-2 pr-4">Tema</th>
                        <th className="pb-2 pr-2 text-center">Classe E</th>
                        <th className="pb-2 pr-2 text-center">Classe C</th>
                        <th className="pb-2 pr-2 text-center">Classe A</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      <tr className="border-b">
                        <td className="py-1.5 pr-4 font-medium">Tributação</td>
                        <td className="py-1.5 pr-2 text-center text-green-600 font-semibold">+0.9</td>
                        <td className="py-1.5 pr-2 text-center text-yellow-600">+0.3</td>
                        <td className="py-1.5 pr-2 text-center text-red-600">−0.4</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-1.5 pr-4 font-medium">Saúde</td>
                        <td className="py-1.5 pr-2 text-center text-green-600 font-semibold">+1.0</td>
                        <td className="py-1.5 pr-2 text-center text-yellow-600">+0.5</td>
                        <td className="py-1.5 pr-2 text-center text-muted-foreground">0.0</td>
                      </tr>
                      <tr>
                        <td className="py-1.5 pr-4 font-medium">Educação</td>
                        <td className="py-1.5 pr-2 text-center text-green-600 font-semibold">+1.0</td>
                        <td className="py-1.5 pr-2 text-center text-yellow-600">+0.6</td>
                        <td className="py-1.5 pr-2 text-center text-muted-foreground">+0.1</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Pesos baseados em dados do <strong>IBGE/ABEP (Critério Brasil 2024)</strong> sobre
                  como cada área legislativa afeta diferentes faixas de renda.
                </p>
              </div>
            </div>

            {/* Step 5 */}
            <div className="flex gap-4">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                5
              </div>
              <div>
                <h4 className="font-semibold">Fórmula final</h4>
                <div className="mt-2 rounded-lg bg-muted p-4">
                  <div className="flex items-center gap-2">
                    <Scale className="h-5 w-5 text-primary" />
                    <code className="text-sm font-mono">
                      impacto = peso_tema × voto × direção
                    </code>
                  </div>
                  <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                    <p><strong>peso_tema</strong> = peso do tema para sua faixa de renda (tabela acima)</p>
                    <p><strong>voto</strong> = Sim (+1) ou Não (−1)</p>
                    <p><strong>direção</strong> = progressivo (+1) ou regressivo (−1)</p>
                  </div>
                  <div className="mt-3 space-y-1 text-xs">
                    <p className="text-green-600">
                      <strong>Exemplo positivo:</strong> Votar Sim em &quot;reduzir ICMS sobre alimentos&quot;
                      → 0.9 × (+1) × (+1) = <strong>+0.9</strong> para Classe E
                    </p>
                    <p className="text-green-600">
                      <strong>Exemplo positivo:</strong> Votar Não em &quot;aumentar tributo regressivo&quot;
                      → 0.9 × (−1) × (−1) = <strong>+0.9</strong> para Classe E
                    </p>
                    <p className="text-red-600">
                      <strong>Exemplo negativo:</strong> Votar Sim em &quot;aumentar tributo regressivo&quot;
                      → 0.9 × (+1) × (−1) = <strong>−0.9</strong> para Classe E
                    </p>
                  </div>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  O score final é normalizado de <strong>0 a 100</strong>, onde 50 é neutro, acima de 50
                  é positivo para sua classe, e abaixo de 50 é negativo.
                </p>
              </div>
            </div>

            {/* Data sources */}
            <div className="flex gap-4">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                <BarChart3 className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-semibold">Fontes de dados</h4>
                <ul className="mt-1 space-y-1 text-sm text-muted-foreground">
                  <li>
                    <strong>Votações:</strong>{" "}
                    <a href="https://legis.senado.leg.br/dadosabertos" target="_blank" rel="noopener noreferrer" className="text-primary underline">
                      API Dados Abertos do Senado
                    </a>
                  </li>
                  <li>
                    <strong>Classificação de matérias:</strong> Classificações oficiais da matéria + análise de ementa
                  </li>
                  <li>
                    <strong>Faixas de renda:</strong> IBGE PNAD Contínua + ABEP Critério Brasil 2024
                  </li>
                  <li>
                    <strong>Salário mínimo:</strong> R$ 1.621 (Decreto nº 12.797/2025)
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

export default function SimuladorPage() {
  const [faixaSelecionada, setFaixaSelecionada] = useState<FaixaRenda>("classe_e");
  const [calculado, setCalculado] = useState(false);
  const [busca, setBusca] = useState("");
  const [filtroUf, setFiltroUf] = useState("");
  const [filtroPartido, setFiltroPartido] = useState("");

  const faixasInfo = getTodasFaixas();

  const {
    data: deputadosVotos,
    isLoading,
    error,
  } = useSimuladorVotos();

  // Compute ranking from real data
  const ranking = useMemo(() => {
    if (!calculado || !deputadosVotos) return null;

    const entries = Object.values(deputadosVotos);
    const scored = entries
      .filter((dep) => dep.votos.length > 0)
      .map((dep) => {
        const votosComTema = mapVotosToComTema(dep);
        const score = calcularImpactoRenda(votosComTema, faixaSelecionada);
        return { dep, score };
      })
      .filter((r) => r.score.votosConsiderados > 0)
      .sort((a, b) => b.score.valor - a.score.valor);

    return scored;
  }, [calculado, deputadosVotos, faixaSelecionada]);

  // Filtered + searched results
  const filtrados = useMemo(() => {
    if (!ranking) return null;
    let lista = [...ranking];

    if (busca) {
      const termo = busca.toLowerCase();
      lista = lista.filter(
        (r) =>
          r.dep.nome.toLowerCase().includes(termo) ||
          r.dep.siglaPartido.toLowerCase().includes(termo),
      );
    }
    if (filtroUf) {
      lista = lista.filter((r) => r.dep.siglaUf === filtroUf);
    }
    if (filtroPartido) {
      lista = lista.filter((r) => r.dep.siglaPartido === filtroPartido);
    }
    return lista;
  }, [ranking, busca, filtroUf, filtroPartido]);

  const partidos = useMemo(() => {
    if (!ranking) return [];
    const set = new Set(ranking.map((r) => r.dep.siglaPartido));
    return Array.from(set).sort();
  }, [ranking]);

  const ufs = useMemo(() => {
    if (!ranking) return [];
    const set = new Set(ranking.map((r) => r.dep.siglaUf));
    return Array.from(set).sort();
  }, [ranking]);

  const topN = filtrados?.slice(0, TOP_N) ?? [];

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Simulador de Impacto
        </h1>
        <p className="mt-2 text-muted-foreground">
          Informe sua faixa de renda e veja quais senadores mais beneficiam
          pessoas na sua situação — com dados reais de votações recentes do
          Senado Federal
        </p>
      </div>

      {/* Faixa de Renda */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            <CardTitle>Sua Faixa de Renda</CardTitle>
          </div>
          <CardDescription>
            Selecione a faixa que mais se aproxima da sua renda familiar mensal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-5">
            {FAIXAS.map((faixa) => {
              const info = faixasInfo[faixa];
              const isSelected = faixaSelecionada === faixa;
              return (
                <button
                  key={faixa}
                  onClick={() => {
                    setFaixaSelecionada(faixa);
                    setCalculado(false);
                  }}
                  className={`rounded-lg border-2 p-4 text-left transition-all ${
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-muted hover:border-muted-foreground/30"
                  }`}
                >
                  <div className="font-semibold">{info.descricao}</div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {info.limiteInferior > 0
                      ? `R$ ${info.limiteInferior.toLocaleString("pt-BR")}`
                      : "R$ 0"}
                    {info.limiteSuperior
                      ? ` a R$ ${info.limiteSuperior.toLocaleString("pt-BR")}`
                      : "+"}
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    ~{info.populacaoPercentual}% da população
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-6 flex justify-center">
            <Button
              size="lg"
              className="gap-2"
              onClick={() => setCalculado(true)}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Calculator className="h-4 w-4" />
              )}
              {isLoading ? "Carregando votações..." : "Calcular Impacto"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Metodologia */}
      <MetodologiaSection />

      {/* Loading */}
      {isLoading && calculado && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">
            Buscando votações recentes e calculando scores...
          </span>
        </div>
      )}

      {/* Error */}
      {error && (
        <Card className="mb-6 border-destructive">
          <CardContent className="flex items-center gap-3 pt-6">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <div>
              <p className="font-medium text-destructive">Erro ao carregar dados</p>
              <p className="text-sm text-muted-foreground">{error.message}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {filtrados && !isLoading && (
        <div>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              Melhores parlamentares para:{" "}
              <span className="text-primary">
                {getDescricaoFaixa(faixaSelecionada)}
              </span>
            </h2>
            <span className="text-sm text-muted-foreground">
              {ranking?.length ?? 0} parlamentares com votos classificados
            </span>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome ou partido..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select
                  value={filtroUf}
                  onChange={(e) => setFiltroUf(e.target.value)}
                >
                  <option value="">Todos os estados</option>
                  {ufs.map((uf) => (
                    <option key={uf} value={uf}>
                      {uf}
                    </option>
                  ))}
                </Select>
                <Select
                  value={filtroPartido}
                  onChange={(e) => setFiltroPartido(e.target.value)}
                >
                  <option value="">Todos os partidos</option>
                  {partidos.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Top 3 Podium */}
          {!busca && !filtroUf && !filtroPartido && filtrados.length >= 3 && (
            <div className="mb-8 grid gap-4 md:grid-cols-3">
              {filtrados.slice(0, 3).map((r, i) => (
                <Link
                  key={r.dep.id}
                  href={`/parlamentar/${r.dep.id}`}
                >
                  <Card
                    className={`transition-all hover:shadow-lg ${
                      i === 0
                        ? "border-yellow-400 dark:border-yellow-600"
                        : i === 1
                          ? "border-gray-300 dark:border-gray-600"
                          : "border-amber-600 dark:border-amber-800"
                    }`}
                  >
                    <CardContent className="flex flex-col items-center pt-6 text-center">
                      <PodiumIcon posicao={i + 1} />
                      <span className="mt-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        {i === 0 ? "1º Lugar" : i === 1 ? "2º Lugar" : "3º Lugar"}
                      </span>
                      <div className="mt-3 h-20 w-20 overflow-hidden rounded-full bg-muted">
                        {r.dep.urlFoto ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={r.dep.urlFoto}
                            alt={r.dep.nome}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-muted-foreground">
                            {r.dep.nome.charAt(0)}
                          </div>
                        )}
                      </div>
                      <h3 className="mt-3 font-semibold">{r.dep.nome}</h3>
                      <p className="text-sm text-muted-foreground">
                        {r.dep.siglaPartido} · {r.dep.siglaUf}
                      </p>
                      <div
                        className={`mt-3 rounded-full px-4 py-1 ${getBgCorScore(r.score.valor)}`}
                      >
                        <span
                          className={`text-2xl font-bold ${getCorScore(r.score.valor)}`}
                        >
                          {r.score.valor}
                        </span>
                      </div>
                      <span
                        className={`mt-1 text-xs font-semibold ${getCorScore(r.score.valor)}`}
                      >
                        {getLabelScore(r.score.valor)}
                      </span>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {r.score.votosConsiderados} voto
                        {r.score.votosConsiderados !== 1 ? "s" : ""} analisado
                        {r.score.votosConsiderados !== 1 ? "s" : ""}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}

          {/* Full Ranking */}
          <div className="space-y-3">
            {(busca || filtroUf || filtroPartido
              ? filtrados
              : filtrados.slice(0, TOP_N)
            ).map((r, i) => {
              const posicao = busca || filtroUf || filtroPartido
                ? i + 1
                : i + 1;
              return (
                <Link
                  key={r.dep.id}
                  href={`/parlamentar/${r.dep.id}`}
                >
                  <Card className="transition-colors hover:border-primary/50">
                    <CardContent className="flex items-center gap-4 py-4">
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-muted text-sm font-bold">
                        {posicao}
                      </div>
                      <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full bg-muted">
                        {r.dep.urlFoto ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={r.dep.urlFoto}
                            alt={r.dep.nome}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center font-semibold text-muted-foreground">
                            {r.dep.nome.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate font-semibold">{r.dep.nome}</h3>
                        <p className="text-sm text-muted-foreground">
                          {r.dep.siglaPartido} · {r.dep.siglaUf} ·{" "}
                          {r.score.votosConsiderados} voto
                          {r.score.votosConsiderados !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <div className="text-right">
                        <div
                          className={`text-2xl font-bold ${getCorScore(r.score.valor)}`}
                        >
                          {r.score.valor}
                        </div>
                        <div
                          className={`text-xs font-medium ${getCorScore(r.score.valor)}`}
                        >
                          {getLabelScore(r.score.valor)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>

          {!busca && !filtroUf && !filtroPartido && filtrados.length > TOP_N && (
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Mostrando os {TOP_N} melhores de {filtrados.length} parlamentares.
              Use os filtros acima para ver todos.
            </p>
          )}

          {filtrados.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Search className="h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-lg font-medium">Nenhum resultado</p>
              <p className="text-sm text-muted-foreground">
                Tente ajustar os filtros de busca
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
