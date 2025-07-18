import { getBeatmapSet } from "@/lib/database/beatmaps";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const id = parseInt(request.nextUrl.searchParams.get("id") || "invalid", 10);

  if (isNaN(id)) {
    return new Response(undefined, { status: 400 });
  }

  await getBeatmapSet(id);
  return new Response(undefined, { status: 200 });
}
