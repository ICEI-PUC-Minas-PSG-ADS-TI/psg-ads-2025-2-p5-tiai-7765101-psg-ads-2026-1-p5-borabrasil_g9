"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Info, X, FileText } from "lucide-react";
import { criarDetalheVotacao, type DetalheVotacao } from "@/lib/votacao-details";
import type { VotoComTema } from "@/lib/scoring/types";

interface VotoItemProps {
  voto: VotoComTema;
  votoParlamentar: "Sim" | "Não" | "Abstenção" | "Outro";
}

export function VotoItem({ voto, votoParlamentar }: VotoItemProps) {
  const [showDetails, setShowDetails] = useState(false); // Mostrar detalhes fechados por padrão
  const detalhe = criarDetalheVotacao(voto, votoParlamentar);

  return (
    <div className="space-y-2">
      <div
        className="flex items-center gap-3 rounded-lg border p-3 text-sm cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => setShowDetails(!showDetails)}
      >
        <span
          className={`flex h-7 w-14 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${
            votoParlamentar === "Sim"
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              : votoParlamentar === "Não"
                ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
          }`}
        >
          {votoParlamentar}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate font-medium">{detalhe.resumo}</p>
            {detalhe.resumo.includes("nº") && (
              <span className="flex items-center gap-1 rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                <FileText className="h-3 w-3" />
                {detalhe.resumo.match(/nº\s+(\d+)/)?.[1]}
              </span>
            )}
          </div>
          <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
            {voto.temaCategoria && (
              <span className="rounded bg-muted px-1.5 py-0.5">
                {voto.temaCategoria.replace(/_/g, " ")}
              </span>
            )}
            <span>
              {voto.direcaoImpacto === 1
                ? "↑ Progressivo"
                : voto.direcaoImpacto === -1
                  ? "↓ Regressivo"
                  : "— Neutro"}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-5 w-5 p-0 ml-auto"
              onClick={(e) => {
                e.stopPropagation();
                setShowDetails(!showDetails);
              }}
            >
              {showDetails ? <X className="h-3 w-3" /> : <Info className="h-3 w-3" />}
            </Button>
          </div>
        </div>
      </div>

      {showDetails && (
        <Card className="border-l-4 border-l-primary">
          <CardContent className="pt-4">
            <div className="space-y-4">
              {/* Resumo e Explicação */}
              <div>
                <h4 className="font-semibold text-sm mb-2">O que foi votado:</h4>
                <p className="text-sm text-muted-foreground mb-3">{detalhe.resumo}</p>
                
                <h4 className="font-semibold text-sm mb-2">Explicação do voto:</h4>
                <div 
                  className="text-sm text-muted-foreground leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: detalhe.explicacao }}
                />
              </div>

              {/* Impacto */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium">Impacto:</span>
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${
                    detalhe.impacto === 1
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : detalhe.impacto === -1
                        ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                  }`}
                >
                  {detalhe.impacto === 1
                    ? "Progressivo (favorece políticas sociais)"
                    : detalhe.impacto === -1
                      ? "Regressivo (impacta negativamente políticas sociais)"
                      : "Neutro (impacto técnico ou ambíguo)"}
                </span>
              </div>

              {/* Link oficial */}
              {detalhe.urlOficial && (
                <div className="pt-2 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(detalhe.urlOficial, "_blank");
                    }}
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Ver votação oficial
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
