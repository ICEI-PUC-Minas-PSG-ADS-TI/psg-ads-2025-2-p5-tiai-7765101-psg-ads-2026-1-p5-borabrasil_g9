import { NextResponse } from "next/server";
import { getCached, setCache, isStale, TTL } from "@/lib/cache";

// Câmara provides bulk JSON/CSV downloads for historical data.
// This route downloads, parses, caches, and serves them.
// Supported datasets: votacoes, votacoesVotos, votacoesOrientacoes, proposicoesTemas

const CAMARA_DOWNLOADS = "https://dadosabertos.camara.leg.br/arquivos";

const DATASET_PATHS: Record<string, string> = {
  votacoes: "votacoes/json/votacoes-{ano}.json",
  votacoesVotos: "votacoesVotos/json/votacoesVotos-{ano}.json",
  votacoesOrientacoes: "votacoesOrientacoes/json/votacoesOrientacoes-{ano}.json",
  proposicoesTemas: "proposicoesTemas/json/proposicoesTemas-{ano}.json",
};

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: { dataset: string } },
) {
  const { dataset } = params;
  const url = new URL(request.url);
  const ano = url.searchParams.get("ano") || new Date().getFullYear().toString();

  const pathTemplate = DATASET_PATHS[dataset];
  if (!pathTemplate) {
    return NextResponse.json(
      {
        error: `Dataset '${dataset}' não suportado. Use: ${Object.keys(DATASET_PATHS).join(", ")}`,
      },
      { status: 400 },
    );
  }

  const cacheKey = `bulk:camara:${dataset}:${ano}`;

  // Return cached if fresh
  if (!isStale(cacheKey)) {
    const cached = getCached(cacheKey);
    if (cached) {
      return NextResponse.json(
        { data: cached.data, fromCache: true, dataset, ano },
        {
          headers: {
            "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=3600",
            "X-Cache": "HIT",
          },
        },
      );
    }
  }

  // Download bulk file
  const filePath = pathTemplate.replace("{ano}", ano);
  const downloadUrl = `${CAMARA_DOWNLOADS}/${filePath}`;

  try {
    const response = await fetch(downloadUrl);

    if (!response.ok) {
      // Check if we have stale cache to fall back on
      const stale = getCached(cacheKey);
      if (stale) {
        return NextResponse.json(
          { data: stale.data, fromCache: true, stale: true, dataset, ano },
          {
            headers: {
              "X-Cache": "STALE",
            },
          },
        );
      }
      throw new Error(`Download failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Cache for 24h
    setCache(cacheKey, data, TTL.BULK);

    return NextResponse.json(
      { data, fromCache: false, dataset, ano },
      {
        headers: {
          "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=3600",
          "X-Cache": "MISS",
        },
      },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json({ error: message, dataset, ano }, { status: 502 });
  }
}
