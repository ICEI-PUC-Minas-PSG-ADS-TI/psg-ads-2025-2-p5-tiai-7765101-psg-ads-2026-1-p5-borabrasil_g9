"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSenador } from "@/hooks/use-senadores";
import { useDeputado } from "@/hooks/use-deputados";
import { useSimuladorVotos } from "@/hooks/use-simulador";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Mail,
  MapPin,
  Building2,
  TrendingUp,
  Heart,
  ClipboardCheck,
  Wallet,
  Scale,
} from "lucide-react";
import { getCorScore, getLabelScore, getBgCorScore } from "@/lib/scoring/aggregator";
import { calcularScoreCompleto } from "@/lib/scoring/aggregator";
import type { Parlamentar, Casa } from "@/services/types/scoring.types";
import type { VotoComTema } from "@/lib/scoring/types";

function ScoreBar({ valor, label }: { valor: number; label: string }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className={getCorScore(valor)}>{valor}/100</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${valor}%` }}
        />
      </div>
    </div>
  );
}

const PILAR_ICONS = [
  { icon: TrendingUp, label: "Impacto Econômico", key: "pilar1_economico" as const },
  { icon: Heart, label: "Serviços Essenciais", key: "pilar2_servicos" as const },
  { icon: ClipboardCheck, label: "Presença e Coerência", key: "pilar3_presenca" as const },
  { icon: Wallet, label: "Benefício por Renda", key: "pilar4_renda" as const },
  { icon: Scale, label: "Custo-Benefício", key: "pilar5_custoBeneficio" as const },
];

export default function ParlamentarPage() {
  const params = useParams();
  const rawId = params.id as string;
  const [casa, codigoStr] = rawId.split("-") as [Casa, string];
  const codigo = codigoStr ?? "";

  const isSenado = casa === "senado";
  const codigoNum = Number(codigo);

  const {
    data: senadorData,
    isLoading: loadingSenador,
    error: errorSenador,
  } = useSenador(codigo, { enabled: isSenado && !!codigo });

  const {
    data: deputadoData,
    isLoading: loadingDeputado,
    error: errorDeputado,
  } = useDeputado(codigoNum, { enabled: !isSenado && !!codigo });

  // Fetch real voting data from simulador API
  const { data: simuladorData, isLoading: loadingVotos } = useSimuladorVotos();

  const parlamentar: Parlamentar | null = useMemo(() => {
    if (isSenado && senadorData) {
      const id = senadorData.IdentificacaoParlamentar;
      return {
        id: rawId,
        nome: id.NomeParlamentar,
        nomeCompleto: id.NomeCompletoParlamentar,
        partido: id.SiglaPartidoParlamentar,
        uf: id.UfParlamentar,
        foto: id.UrlFotoParlamentar,
        email: id.EmailParlamentar,
        casa: "senado" as Casa,
      };
    }
    if (!isSenado && deputadoData) {
      return {
        id: rawId,
        nome: deputadoData.ultimoStatus.nome,
        nomeCompleto: deputadoData.nomeCivil,
        partido: deputadoData.ultimoStatus.siglaPartido,
        uf: deputadoData.ultimoStatus.siglaUf,
        foto: deputadoData.ultimoStatus.urlFoto,
        email: deputadoData.ultimoStatus.email,
        casa: "camara" as Casa,
      };
    }
    return null;
  }, [isSenado, senadorData, deputadoData, rawId]);

  // Map real votes from simulador API to VotoComTema[]
  const votosReais: VotoComTema[] = useMemo(() => {
    if (!simuladorData || !codigo) return [];
    // Simulador data is keyed by CodigoParlamentar (the raw numeric code)
    const parlamentarVotos = simuladorData[codigo];
    if (!parlamentarVotos) return [];
    return parlamentarVotos.votos.map((v) => ({
      voto: v.voto === "Sim" ? "Sim" as const : v.voto === "Não" ? "Não" as const : "Outro" as const,
      temaCategoria: v.temaCategoria,
      proposicaoId: v.proposicaoId,
      descricao: v.descricao,
      direcaoImpacto: v.direcaoImpacto ?? 0,
    }));
  }, [simuladorData, codigo]);

  // Extract presença and coerência from simulador data
  const presencaData = useMemo(() => {
    if (!simuladorData || !codigo) return null;
    const parlamentarVotos = simuladorData[codigo];
    if (!parlamentarVotos?.presenca) return null;
    return parlamentarVotos.presenca;
  }, [simuladorData, codigo]);

  const coerenciaData = useMemo(() => {
    if (!simuladorData || !codigo) return null;
    const parlamentarVotos = simuladorData[codigo];
    if (!parlamentarVotos?.coerencia) return null;
    return parlamentarVotos.coerencia;
  }, [simuladorData, codigo]);

  const score = useMemo(() => {
    if (!parlamentar) return null;
    if (votosReais.length === 0) return null;
    return calcularScoreCompleto({
      parlamentar,
      votos: votosReais,
      presenca: presencaData,
      coerencia: coerenciaData,
    });
  }, [parlamentar, votosReais, presencaData, coerenciaData]);

  const isLoading = loadingSenador || loadingDeputado || loadingVotos;
  const error = errorSenador || errorDeputado;

  if (isLoading) {
    return (
      <div className="container flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Carregando perfil...</span>
      </div>
    );
  }

  if (error || !parlamentar) {
    return (
      <div className="container py-8">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Button>
        </Link>
        <Card className="border-destructive">
          <CardContent className="flex items-center gap-3 pt-6">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <div>
              <p className="font-medium text-destructive">Erro ao carregar parlamentar</p>
              <p className="text-sm text-muted-foreground">{error?.message ?? "Parlamentar não encontrado"}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <Link href="/dashboard">
        <Button variant="ghost" size="sm" className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar ao Dashboard
        </Button>
      </Link>

      {/* Header */}
      <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-start">
        <div className="relative h-28 w-28 flex-shrink-0 overflow-hidden rounded-xl bg-muted shadow-lg">
          {parlamentar.foto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={parlamentar.foto}
              alt={parlamentar.nome}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-muted-foreground">
              {parlamentar.nome.charAt(0)}
            </div>
          )}
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{parlamentar.nome}</h1>
          <p className="text-lg text-muted-foreground">{parlamentar.nomeCompleto}</p>
          <div className="mt-3 flex flex-wrap gap-3">
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              <Building2 className="h-3.5 w-3.5" />
              {parlamentar.partido}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-sm font-medium">
              <MapPin className="h-3.5 w-3.5" />
              {parlamentar.uf}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-sm font-medium">
              {parlamentar.casa === "senado" ? "Senador(a)" : "Deputado(a)"}
            </span>
            {parlamentar.email && (
              <a
                href={`mailto:${parlamentar.email}`}
                className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-sm font-medium hover:bg-muted/80"
              >
                <Mail className="h-3.5 w-3.5" />
                E-mail
              </a>
            )}
          </div>
        </div>

        {/* Score Geral */}
        {score && (
          <div className={`flex flex-col items-center rounded-xl p-6 ${getBgCorScore(score.scoreGeral)}`}>
            <span className="text-sm font-medium text-muted-foreground">Score Geral</span>
            <span className={`text-4xl font-bold ${getCorScore(score.scoreGeral)}`}>
              {score.scoreGeral}
            </span>
            <span className={`text-sm font-semibold ${getCorScore(score.scoreGeral)}`}>
              {getLabelScore(score.scoreGeral)}
            </span>
          </div>
        )}
      </div>

      {/* 5 Pilares */}
      {score && (
        <div className="grid gap-4 md:grid-cols-5">
          {PILAR_ICONS.map(({ icon: Icon, label, key }) => {
            const pilar = score[key];
            return (
              <Card key={key}>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-primary" />
                    <CardTitle className="text-sm">{label}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className={`text-3xl font-bold ${getCorScore(pilar.valor)}`}>
                    {pilar.valor}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{pilar.detalhes}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {pilar.votosConsiderados} voto{pilar.votosConsiderados !== 1 ? "s" : ""}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Score Bars */}
      {score && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Detalhamento dos Pilares</CardTitle>
            <CardDescription>Comparação visual dos 5 pilares de scoring</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {PILAR_ICONS.map(({ label, key }) => (
              <ScoreBar key={key} valor={score[key].valor} label={label} />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Votos Recentes */}
      {votosReais.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Votações Recentes ({votosReais.length})</CardTitle>
            <CardDescription>Votos nominais dos últimos 6 meses no Plenário do Senado</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {votosReais.map((v, i) => (
                <div
                  key={`${v.proposicaoId}-${i}`}
                  className="flex items-center gap-3 rounded-lg border p-3 text-sm"
                >
                  <span
                    className={`flex h-7 w-14 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      v.voto === "Sim"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : v.voto === "Não"
                          ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                    }`}
                  >
                    {v.voto}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{v.descricao}</p>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                      {v.temaCategoria && (
                        <span className="rounded bg-muted px-1.5 py-0.5">
                          {v.temaCategoria.replace(/_/g, " ")}
                        </span>
                      )}
                      <span>
                        {v.direcaoImpacto === 1
                          ? "↑ Progressivo"
                          : v.direcaoImpacto === -1
                            ? "↓ Regressivo"
                            : "— Neutro"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No votes message */}
      {!isLoading && votosReais.length === 0 && (
        <Card className="mt-6">
          <CardContent className="flex items-center gap-3 pt-6">
            <AlertCircle className="h-5 w-5 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Sem dados de votação disponíveis para este parlamentar. O simulador
              atualmente cobre apenas votações recentes do Senado Federal.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Info extra */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Sobre o Scoring</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            O score é calculado com base nos votos nominais do parlamentar cruzados com tabelas de
            pesos determinísticos para cada pilar. Não utiliza inteligência artificial.
          </p>
          <p>
            <strong>Pilar 1 — Econômico:</strong> impacto dos votos em tributação, emprego, inflação.
          </p>
          <p>
            <strong>Pilar 2 — Serviços:</strong> impacto em saúde, educação, saneamento, transporte, alimentação.
          </p>
          <p>
            <strong>Pilar 3 — Presença:</strong> frequência em sessões e coerência com orientação partidária.
          </p>
          <p>
            <strong>Pilar 4 — Renda:</strong> benefício diferenciado por faixa de renda do cidadão.
          </p>
          <p>
            <strong>Pilar 5 — Custo-Benefício:</strong> relação entre impacto social e custo orçamentário.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
