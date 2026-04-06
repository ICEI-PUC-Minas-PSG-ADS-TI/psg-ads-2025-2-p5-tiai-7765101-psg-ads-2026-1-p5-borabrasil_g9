import { NextResponse, type NextRequest } from "next/server";
import { conditionalFetch, TTL } from "@/lib/cache";

const CAMARA_BASE = "https://dadosabertos.camara.leg.br/api/v2";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const qs = searchParams.toString();
  const url = qs
    ? `${CAMARA_BASE}/deputados?${qs}`
    : `${CAMARA_BASE}/deputados`;

  try {
    const { data, fromCache } = await conditionalFetch(
      url,
      `deputados:${qs || "todos"}`,
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
