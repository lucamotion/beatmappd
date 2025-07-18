import { globalRecalculateRank } from "@/lib/database/beatmaps";

export async function POST() {
  try {
    await globalRecalculateRank();
    return new Response(null, { status: 200 });
  } catch (e) {
    console.error(e);
    return new Response(null, { status: 500 });
  }
}
