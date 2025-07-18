"use server";
import { beatmapCache } from "../cache";
import { getBeatmapSet } from "./beatmaps";
import { prisma } from "./prisma";

export async function siteSearch(query: string): Promise<{
  users: { id: number; username: string }[];
  maps: { id: number; setId: number; name: string }[];
}> {
  const mapsetId = query.match(/(?<=osu\.ppy\.sh\/beatmapsets\/)(\d+)/i)?.[0];
  if (mapsetId && !isNaN(parseInt(mapsetId, 10))) {
    const set = await getBeatmapSet(parseInt(mapsetId, 10));

    if (set) {
      const users = set.difficulties
        .map((map) =>
          map.owners.map((owner) => ({
            id: owner.id,
            username: owner.username,
          }))
        )
        .flat();
      return {
        users: users.filter(
          (user, index) => users.findIndex((u) => u.id === user.id) === index
        ),
        maps: set.difficulties.map((map) => ({
          id: map.id,
          setId: map.beatmapSetId,
          name: `${set.artist} - ${set.title} [${map.version}]`,
        })),
      };
    }
  }

  const users = await prisma.user.findMany({
    where: { username: { contains: query, mode: "insensitive" } },
    take: 50,
  });

  const allBeatmaps = beatmapCache;

  const sanitizeRegex = /[#-.]|[[-^]|[?|{}]/g;

  const queryRegex = new RegExp(query.replace(sanitizeRegex, "\\$&"), "i");

  const mapMatches = allBeatmaps
    .filter((beatmap) => {
      if (beatmap.version.match(queryRegex)) {
        return true;
      } else if (beatmap.beatmapSet.artist.match(queryRegex)) {
        return true;
      } else if (beatmap.beatmapSet.artistUnicode.match(queryRegex)) {
        return true;
      } else if (beatmap.beatmapSet.title.match(queryRegex)) {
        return true;
      } else if (beatmap.beatmapSet.titleUnicode.match(queryRegex)) {
        return true;
      } else if (
        `${beatmap.beatmapSet.artist} ${beatmap.beatmapSet.title}`.match(
          queryRegex
        )
      ) {
        return true;
      } else if (
        `${beatmap.beatmapSet.artist} - ${beatmap.beatmapSet.title}`.match(
          queryRegex
        )
      ) {
        return true;
      } else if (
        `${beatmap.beatmapSet.artistUnicode} ${beatmap.beatmapSet.titleUnicode}`.match(
          queryRegex
        )
      ) {
        return true;
      } else if (
        `${beatmap.beatmapSet.artistUnicode} - ${beatmap.beatmapSet.titleUnicode}`.match(
          queryRegex
        )
      ) {
        return true;
      }

      return false;
    })
    .slice(0, 50);

  return {
    users: users.map((user) => ({ id: user.id, username: user.username })),
    maps: mapMatches.map((map) => ({
      id: map.id,
      setId: map.beatmapSetId,
      name: `${map.beatmapSet.artist} - ${map.beatmapSet.title} [${map.version}]`,
    })),
  };
}
