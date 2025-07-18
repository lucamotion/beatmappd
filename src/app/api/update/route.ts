import { refreshBeatmapCache } from "@/lib/cache";
import { getBeatmapSet } from "@/lib/database/beatmaps";
import { osu } from "@/lib/osu-api/osu";

export async function POST() {
  const { beatmapsets } = await osu.getBeatmaps();

  for (const map of beatmapsets) {
    await getBeatmapSet(map.id);
  }

  await refreshBeatmapCache();

  return new Response(undefined, { status: 200 });
}
