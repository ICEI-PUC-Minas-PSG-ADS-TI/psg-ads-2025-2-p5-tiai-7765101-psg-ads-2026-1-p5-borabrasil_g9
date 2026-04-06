"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useSenadoresAtuais } from "@/hooks/use-senadores";
import { useDeputados } from "@/hooks/use-deputados";
import { useSimuladorVotos } from "@/hooks/use-simulador";
import { calcularScoreCompleto, getCorScore, getLabelScore } from "@/lib/scoring/aggregator";
import type { VotoComTema } from "@/lib/scoring/types";
import {
  Search,
  Users,
  ArrowUpDown,
  Loader2,
  AlertCircle,
  BarChart3,
} from "lucide-react";
import type { Parlamentar, Casa } from "@/services/types/scoring.types";

function mapSenadorToParlamentar(s: {
  IdentificacaoParlamentar: {
    CodigoParlamentar: string;
    NomeParlamentar: string;
    NomeCompletoParlamentar: string;
    SiglaPartidoParlamentar: string;
    UfParlamentar: string;
    UrlFotoParlamentar: string;
    EmailParlamentar: string;
  };
}): Parlamentar {
  const id = s.IdentificacaoParlamentar;
  return {
    id: `senado-${id.CodigoParlamentar}`,
    nome: id.NomeParlamentar,
    nomeCompleto: id.NomeCompletoParlamentar,
    partido: id.SiglaPartidoParlamentar,
    uf: id.UfParlamentar,
    foto: id.UrlFotoParlamentar,
    email: id.EmailParlamentar,
    casa: "senado",
  };
}

function mapDeputadoToParlamentar(d: {
  id: number;
  nome: string;
  siglaPartido: string;
  siglaUf: string;
  urlFoto: string;
  email: string;
}): Parlamentar {
  return {
    id: `camara-${d.id}`,
    nome: d.nome,
    nomeCompleto: d.nome,
    partido: d.siglaPartido,
    uf: d.siglaUf,
    foto: d.urlFoto,
    email: d.email,
    casa: "camara",
  };
}

const UFS = [
  "AC","AL","AM","AP","BA","CE","DF","ES","GO","MA","MG","MS","MT",
  "PA","PB","PE","PI","PR","RJ","RN","RO","RR","RS","SC","SE","SP","TO",
];

export default function DashboardPage() {
  const [busca, setBusca] = useState("");
  const [filtroUf, setFiltroUf] = useState("");
  const [filtroPartido, setFiltroPartido] = useState("");
  const [filtroCasa, setFiltroCasa] = useState<Casa | "">("");
  const [ordenacao, setOrdenacao] = useState<"nome" | "partido" | "uf" | "score">("nome");

  const {
    data: senadores,
    isLoading: loadingSenadores,
    error: errorSenadores,
  } = useSenadoresAtuais();

  const {
    data: deputados,
    isLoading: loadingDeputados,
    error: errorDeputados,
  } = useDeputados();

  const {
    data: simuladorData,
    isLoading: loadingSimulador,
  } = useSimuladorVotos();

  // Pre-calculate scores for all parlamentares that have simulador data
  const scoreMap = useMemo(() => {
    if (!simuladorData) return new Map<string, number>();
    const map = new Map<string, number>();
    for (const [codigoParlamentar, parlData] of Object.entries(simuladorData)) {
      if (parlData.votos.length === 0) continue;
      const votos: VotoComTema[] = parlData.votos.map((v) => ({
        voto: v.voto === "Sim" ? "Sim" as const : v.voto === "Não" ? "Não" as const : "Outro" as const,
        temaCategoria: v.temaCategoria,
        proposicaoId: v.proposicaoId,
        descricao: v.descricao,
        direcaoImpacto: v.direcaoImpacto ?? 0,
      }));
      const parlamentar: Parlamentar = {
        id: parlData.id,
        nome: parlData.nome,
        nomeCompleto: parlData.nome,
        partido: parlData.siglaPartido,
        uf: parlData.siglaUf,
        foto: parlData.urlFoto,
        email: "",
        casa: parlData.casa === "camara" ? "camara" : "senado",
      };
      const score = calcularScoreCompleto({
        parlamentar,
        votos,
        presenca: parlData.presenca ?? null,
        coerencia: parlData.coerencia ?? null,
      });
      // Key by parlData.id (senado-{codigo} or camara-{id})
      map.set(parlData.id, score.scoreGeral);
    }
    return map;
  }, [simuladorData]);

  const parlamentares = useMemo(() => {
    const lista: Parlamentar[] = [];

    if (senadores) {
      lista.push(...senadores.map(mapSenadorToParlamentar));
    }
    if (deputados) {
      lista.push(...deputados.map(mapDeputadoToParlamentar));
    }

    return lista;
  }, [senadores, deputados]);

  const partidos = useMemo(() => {
    const set = new Set(parlamentares.map((p) => p.partido));
    return Array.from(set).sort();
  }, [parlamentares]);

  const filtrados = useMemo(() => {
    let lista = [...parlamentares];

    if (busca) {
      const termo = busca.toLowerCase();
      lista = lista.filter(
        (p) =>
          p.nome.toLowerCase().includes(termo) ||
          p.partido.toLowerCase().includes(termo),
      );
    }

    if (filtroUf) {
      lista = lista.filter((p) => p.uf === filtroUf);
    }

    if (filtroPartido) {
      lista = lista.filter((p) => p.partido === filtroPartido);
    }

    if (filtroCasa) {
      lista = lista.filter((p) => p.casa === filtroCasa);
    }

    lista.sort((a, b) => {
      if (ordenacao === "score") {
        const sa = scoreMap.get(a.id) ?? -1;
        const sb = scoreMap.get(b.id) ?? -1;
        return sb - sa; // descending
      }
      if (ordenacao === "nome") return a.nome.localeCompare(b.nome);
      if (ordenacao === "partido") return a.partido.localeCompare(b.partido);
      return a.uf.localeCompare(b.uf);
    });

    return lista;
  }, [parlamentares, busca, filtroUf, filtroPartido, filtroCasa, ordenacao, scoreMap]);

  const isLoading = loadingSenadores || loadingDeputados;
  const hasError = errorSenadores || errorDeputados;
  const totalComScore = scoreMap.size;

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-2 text-muted-foreground">
          Visão geral dos parlamentares em exercício no Congresso Nacional
        </p>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Senadores</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loadingSenadores ? "..." : (senadores?.length ?? 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deputados</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loadingDeputados ? "..." : (deputados?.length ?? 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : parlamentares.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Com Score</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loadingSimulador ? "..." : totalComScore}
            </div>
            <p className="text-xs text-muted-foreground">parlamentares com votações analisadas</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-5">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou partido..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select
              value={filtroCasa}
              onChange={(e) => setFiltroCasa(e.target.value as Casa | "")}
            >
              <option value="">Todas as casas</option>
              <option value="senado">Senado</option>
              <option value="camara">Câmara</option>
            </Select>
            <Select
              value={filtroUf}
              onChange={(e) => setFiltroUf(e.target.value)}
            >
              <option value="">Todos os estados</option>
              {UFS.map((uf) => (
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
          <div className="mt-4 flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Ordenar por:</span>
            <Button
              variant={ordenacao === "nome" ? "default" : "outline"}
              size="sm"
              onClick={() => setOrdenacao("nome")}
            >
              <ArrowUpDown className="mr-1 h-3 w-3" />
              Nome
            </Button>
            <Button
              variant={ordenacao === "partido" ? "default" : "outline"}
              size="sm"
              onClick={() => setOrdenacao("partido")}
            >
              <ArrowUpDown className="mr-1 h-3 w-3" />
              Partido
            </Button>
            <Button
              variant={ordenacao === "uf" ? "default" : "outline"}
              size="sm"
              onClick={() => setOrdenacao("uf")}
            >
              <ArrowUpDown className="mr-1 h-3 w-3" />
              Estado
            </Button>
            <Button
              variant={ordenacao === "score" ? "default" : "outline"}
              size="sm"
              onClick={() => setOrdenacao("score")}
            >
              <BarChart3 className="mr-1 h-3 w-3" />
              Score
            </Button>
            {(busca || filtroUf || filtroPartido || filtroCasa) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setBusca("");
                  setFiltroUf("");
                  setFiltroPartido("");
                  setFiltroCasa("");
                }}
              >
                Limpar filtros
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Error State */}
      {hasError && (
        <Card className="mb-6 border-destructive">
          <CardContent className="flex items-center gap-3 pt-6">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <div>
              <p className="font-medium text-destructive">
                Erro ao carregar dados
              </p>
              <p className="text-sm text-muted-foreground">
                {errorSenadores?.message || errorDeputados?.message}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">
            Carregando parlamentares...
          </span>
        </div>
      )}

      {/* Results */}
      {!isLoading && (
        <>
          <p className="mb-4 text-sm text-muted-foreground">
            {filtrados.length} parlamentar{filtrados.length !== 1 ? "es" : ""}{" "}
            encontrado{filtrados.length !== 1 ? "s" : ""}
          </p>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtrados.map((p) => (
              <Link key={p.id} href={`/parlamentar/${p.id}`}>
                <Card className="transition-colors hover:border-primary/50 hover:shadow-md">
                  <CardContent className="flex items-center gap-4 pt-6">
                    <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-full bg-muted">
                      {p.foto ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.foto}
                          alt={p.nome}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-lg font-semibold text-muted-foreground">
                          {p.nome.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-semibold">{p.nome}</h3>
                      <p className="text-sm text-muted-foreground">
                        {p.partido} · {p.uf}
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="inline-block rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                          {p.casa === "senado" ? "Senador(a)" : "Deputado(a)"}
                        </span>
                        {(() => {
                          const s = scoreMap.get(p.id);
                          if (s == null) {
                            return (
                              <span className="inline-block rounded-full px-2 py-0.5 text-xs font-bold text-muted-foreground">
                                -
                              </span>
                            );
                          }
                          return (
                            <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-bold ${getCorScore(s)}`}>
                              {s} · {getLabelScore(s)}
                            </span>
                          );
                        })()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {filtrados.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Users className="h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-lg font-medium">
                Nenhum parlamentar encontrado
              </p>
              <p className="text-sm text-muted-foreground">
                Tente ajustar os filtros de busca
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
