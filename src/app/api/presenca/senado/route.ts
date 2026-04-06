import { NextResponse, type NextRequest } from "next/server";
import { conditionalFetch, TTL } from "@/lib/cache";

const SENADO_BASE = "https://legis.senado.leg.br/dadosabertos";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const dataInicio = request.nextUrl.searchParams.get("dataInicio");
  const dataFim = request.nextUrl.searchParams.get("dataFim");

  if (!dataInicio || !dataFim) {
    return NextResponse.json(
      { error: "Parâmetros dataInicio e dataFim são obrigatórios" },
      { status: 400 },
    );
  }

  try {
    const { data, fromCache } = await conditionalFetch(
      `${SENADO_BASE}/plenario/lista/presenca/${dataInicio}/${dataFim}`,
      `presenca:senado:${dataInicio}:${dataFim}`,
      TTL.PRESENCA,
    );

    return NextResponse.json(
      { data, fromCache },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600",
          "X-Cache": fromCache ? "HIT" : "MISS",
        },
      },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
