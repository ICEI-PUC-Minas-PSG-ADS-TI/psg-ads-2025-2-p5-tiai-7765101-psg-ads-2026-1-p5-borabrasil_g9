import { NextResponse } from "next/server";
import { conditionalFetch, TTL } from "@/lib/cache";

const SENADO_BASE = "https://legis.senado.leg.br/dadosabertos";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { data, fromCache } = await conditionalFetch(
      `${SENADO_BASE}/senador/lista/atual`,
      "senadores:atuais",
      TTL.LISTA_PARLAMENTARES,
    );

    return NextResponse.json(
      { data, fromCache },
      {
        headers: {
          "Cache-Control": "public, s-maxage=21600, stale-while-revalidate=3600",
          "X-Cache": fromCache ? "HIT" : "MISS",
        },
      },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
