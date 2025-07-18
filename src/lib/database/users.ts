"use server";

import { prisma } from "./prisma";

export async function getUser(id: number) {
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      beatmapSetComments: { include: { beatmapSet: true } },
      beatmapSets: { include: { difficulties: true } },
      difficulties: true,
      ownedBeatmaps: { include: { beatmapSet: true } },
      ratings: {
        include: {
          beatmap: {
            include: { beatmapSet: { include: { user: true } }, owners: true },
          },
        },
      },
      nominations: { include: { beatmapset: true } },
      lists: {
        include: {
          _count: {
            select: {
              beatmapItems: true,
              beatmapSetItems: true,
              userItems: true,
            },
          },
        },
      },
    },
  });

  return user ?? undefined;
}
