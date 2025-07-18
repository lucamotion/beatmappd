import { prisma } from "./database/prisma";

const options = {
  orderBy: { beatmapSet: { rankedDate: "desc" } },
  select: {
    id: true,
    beatmapSetId: true,
    version: true,
    beatmapSet: {
      select: {
        id: true,
        artist: true,
        artistUnicode: true,
        title: true,
        titleUnicode: true,
      },
    },
  },
} as const;

export let beatmapCache = await prisma.beatmap.findMany(options);

export async function refreshBeatmapCache() {
  beatmapCache = await prisma.beatmap.findMany(options);
}
