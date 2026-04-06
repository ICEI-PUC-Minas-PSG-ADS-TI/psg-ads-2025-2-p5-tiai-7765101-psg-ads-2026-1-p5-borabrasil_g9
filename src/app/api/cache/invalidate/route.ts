import { NextResponse, type NextRequest } from "next/server";
import { invalidate, invalidatePrefix } from "@/lib/cache";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const { key, prefix } = body as { key?: string; prefix?: string };

  if (prefix) {
    invalidatePrefix(prefix);
    return NextResponse.json({ invalidated: prefix, type: "prefix" });
  }

  if (key) {
    invalidate(key);
    return NextResponse.json({ invalidated: key, type: "key" });
  }

  return NextResponse.json(
    { error: 'Informe "key" ou "prefix" no body' },
    { status: 400 },
  );
}
