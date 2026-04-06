import { NextResponse, type NextRequest } from "next/server";
import { conditionalFetch, TTL } from "@/lib/cache";

const SENADO_BASE = "https://legis.senado.leg.br/dadosabertos";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const qs = searchParams.toString();
  const url = qs
    ? `${SENADO_BASE}/votacao?${qs}`
    : `${SENADO_BASE}/votacao`;

  try {
    const { data, fromCache } = await conditionalFetch(
      url,
      `votacoes:senado:${qs || "todos"}`,
      TTL.VOTACOES,
    );

    return NextResponse.json(
      { data, fromCache },
      {
        headers: {
          "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=600",
          "X-Cache": fromCache ? "HIT" : "MISS",
        },
      },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
