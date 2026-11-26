import { NextResponse } from "next/server";
import { dbConfigured, listPublicReels } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!dbConfigured()) return NextResponse.json({ reels: [], configured: false });
  try {
    const reels = await listPublicReels();
    return NextResponse.json(
      { reels, configured: true },
      { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } },
    );
  } catch (e) {
    console.error("reels: database error", e);
    return NextResponse.json({ reels: [], configured: true, error: "unavailable" }, { status: 503 });
  }
}
