import { NextResponse } from "next/server";
import { conditionalFetch, TTL } from "@/lib/cache";

const CAMARA_BASE = "https://dadosabertos.camara.leg.br/api/v2";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const { id } = params;

  try {
    const { data, fromCache } = await conditionalFetch(
      `${CAMARA_BASE}/votacoes/${id}/votos`,
      `votos:camara:${id}`,
      TTL.VOTOS,
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
