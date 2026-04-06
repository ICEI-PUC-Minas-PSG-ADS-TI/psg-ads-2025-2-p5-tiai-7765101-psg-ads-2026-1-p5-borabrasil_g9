import { NextResponse } from "next/server";
import { getCacheStats } from "@/lib/cache";

export const dynamic = "force-dynamic";

export async function GET() {
  const stats = getCacheStats();

  return NextResponse.json({
    ...stats,
    timestamp: new Date().toISOString(),
  });
}
