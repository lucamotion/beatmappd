"use server";

import { prisma } from "./prisma";
import { getServerSession } from "next-auth";
import { nextAuthOptions } from "@/lib/auth";
import getColors from "get-image-colors";
import { osu } from "../osu-api/osu";

export async function getRatings(mapId: number) {
  const ratings = await prisma.beatmapRating.findMany({
    where: { beatmapId: mapId },
    orderBy: { createdAt: "desc" },
    include: { user: true },
  });

  return ratings;
}

export async function recalculateNormalBeatmapStats(id: number) {
  const ratings = await prisma.beatmapRating.aggregate({
    _avg: { rating: true },
    _count: { rating: true },
    where: { beatmapId: id },
  });

  const newBeatmap = await prisma.beatmap.update({
    where: { id },
    data: {
      averageRating: ratings._avg.rating ?? 0,
      ratingCount: ratings._count.rating,
    },
  });

  return newBeatmap;
}

export async function rateBeatmap(id: number, rating: number | null) {
  const session = await getServerSession(nextAuthOptions);

  if (!session) {
    return;
  }

  console.log(id, rating, session);

  const ratingExists = await prisma.beatmapRating.findFirst({
    where: { beatmapId: id, userId: session.user.id },
  });

  if (rating === null && !ratingExists) {
    return;
  }

  let newRating;

  if (rating === null) {
    if (ratingExists) {
      await prisma.beatmapRating.delete({ where: { id: ratingExists.id } });
    } else {
      return;
    }
  } else if (ratingExists) {
    newRating = await prisma.beatmapRating.update({
      where: { id: ratingExists.id },
      data: { rating, createdAt: new Date() },
    });
  } else {
    newRating = await prisma.beatmapRating.create({
      data: {
        beatmapId: id,
        rating,
        userId: session.user.id,
      },
    });
  }

  await recalculateNormalBeatmapStats(id);

  return newRating;
}

export async function getOwnBeatmapSetRating(mapId: number) {
  const session = await getServerSession(nextAuthOptions);

  if (!session) {
    return;
  }

  const rating = await prisma.beatmapRating.findFirst({
    where: { beatmapId: mapId, userId: session.user.id },
  });

  return rating;
}

export async function getBeatmap(id: number) {
  let beatmap = await prisma.beatmap.findUnique({
    where: { id },
    include: { beatmapSet: true, owners: true, user: true, ratings: true },
  });

  if (!beatmap) {
    const apiBeatmap = await osu.getBeatmap(id);

    await getBeatmapSet(apiBeatmap.beatmapset_id);
    beatmap = await prisma.beatmap.findUnique({
      where: { id },
      include: { beatmapSet: true, owners: true, user: true, ratings: true },
    });
  }

  return beatmap ?? undefined;
}

export async function getBeatmapSet(id: number) {
  let set = await prisma.beatmapSet.findUnique({
    where: { id },
    include: {
      difficulties: {
        include: { owners: true, ratings: { include: { user: true } } },
      },
      nominations: { include: { user: true } },
      user: true,
      comments: { include: { user: true } },
      listItems: { include: { list: { include: { user: true } } } },
    },
  });

  if (!set) {
    const apiSet = await osu.getBeatmapSet(id);

    if (
      apiSet.status !== "ranked" &&
      apiSet.status !== "loved" &&
      apiSet.status !== "approved"
    ) {
      return;
    }

    if (apiSet) {
      let creator = await prisma.user.findUnique({
        where: { id: apiSet.user_id },
      });

      if (!creator) {
        let apiUser;
        try {
          apiUser = await osu.getUser(apiSet.user_id);
        } catch {}

        creator = await prisma.user.create({
          data: {
            id: apiUser?.id || apiSet.user_id,
            username:
              apiUser?.username ||
              apiSet.related_users.find((u) => u.id === apiSet.user_id)
                ?.username ||
              apiSet.creator,
          },
        });
      }

      for (const diff of apiSet.beatmaps) {
        for (const user of diff.owners) {
          const owner = await prisma.user.findUnique({
            where: { id: user.id },
          });

          if (!owner) {
            await prisma.user.create({
              data: { id: user.id, username: user.username },
            });
          }
        }
      }

      let hue: number;
      let saturation: number;

      try {
        const bgImage = await fetch(
          `https://assets.ppy.sh/beatmaps/${apiSet.id}/covers/raw.jpg`
        );

        if (bgImage.status === 200) {
          const colors = await getColors(
            Buffer.from(await bgImage.arrayBuffer()),
            { count: 1, type: "image/jpeg" }
          );

          console.log(colors[0].hsl());
          hue = colors[0].hsl()[0];
          saturation = Math.round(colors[0].hsl()[1] * 100);
        } else {
          hue = 240;
          saturation = 100;
        }
      } catch (e) {
        console.log(e);
        hue = 240;
        saturation = 100;
      }

      if (isNaN(hue)) {
        hue = 240;
      }

      set = await prisma.beatmapSet.create({
        data: {
          artist: apiSet.artist,
          artistUnicode: apiSet.artist_unicode,
          creator: apiSet.creator,
          id: apiSet.id,
          nsfw: apiSet.nsfw,
          offset: apiSet.offset,
          previewUrl: apiSet.preview_url,
          source: apiSet.source,
          status: apiSet.status,
          title: apiSet.title,
          titleUnicode: apiSet.title_unicode,
          genreId: apiSet.genre.id,
          languageId: apiSet.language.id,
          userId: creator!.id,
          rankedDate: apiSet.ranked_date ? new Date(apiSet.ranked_date) : null,
          hue,
          saturation,
          difficulties: {
            connectOrCreate: apiSet.beatmaps.map((beatmap) => ({
              where: { id: beatmap.id },
              create: {
                accuracy: beatmap.accuracy,
                ar: beatmap.ar,
                bpm: beatmap.bpm,
                cs: beatmap.cs,
                drain: beatmap.drain,
                id: beatmap.id,
                mode: beatmap.mode,
                modeInt: beatmap.mode_int,
                difficulty: beatmap.difficulty_rating,
                owners: {
                  connect: beatmap.owners.map((owner) => ({ id: owner.id })),
                },
                ranked: beatmap.ranked,
                status: beatmap.status,
                totalLength: beatmap.total_length,
                user: { connect: { id: beatmap.user_id } },
                version: beatmap.version,
              },
            })),
          },
        },
        include: {
          difficulties: {
            include: { owners: true, ratings: { include: { user: true } } },
          },
          nominations: { include: { user: true } },
          user: true,
          comments: { include: { user: true } },
          listItems: { include: { list: { include: { user: true } } } },
        },
      });

      for (const nomination of apiSet.current_nominations) {
        let nominator = await prisma.user.findUnique({
          where: { id: nomination.user_id },
        });

        console.log(nominator);

        if (!nominator) {
          const apiNominator = await osu.getUser(nomination.user_id);

          if (apiNominator) {
            nominator = await prisma.user.create({
              data: {
                id: apiNominator.id || nomination.user_id,
                username:
                  apiNominator.username ||
                  apiSet.related_users.find(
                    (user) => user.id === nomination.user_id
                  )?.username ||
                  "[Deleted User]",
              },
            });
          }
        }

        if (!nominator) {
          continue;
        }

        await prisma.nomination.create({
          data: {
            beatmapsetId: set.id,
            rulesets: nomination.rulesets
              ? { set: nomination.rulesets }
              : undefined,
            userId: nominator.id,
          },
        });
      }

      set = await prisma.beatmapSet.findUnique({
        where: { id: id },
        include: {
          difficulties: {
            include: { owners: true, ratings: { include: { user: true } } },
          },
          nominations: { include: { user: true } },
          user: true,
          comments: { include: { user: true } },
          listItems: { include: { list: { include: { user: true } } } },
        },
      });
    }
  }

  return set ?? undefined;
}

export async function getBeatmapSetComments(setId: number) {
  const comments = await prisma.beatmapComment.findMany({
    where: { beatmapSetId: setId },
  });

  return comments;
}

export async function createBeatmapSetComment(setId: number, content: string) {
  const session = await getServerSession(nextAuthOptions);

  if (!session) {
    return;
  }

  const comment = await prisma.beatmapComment.create({
    data: { beatmapSetId: setId, content, userId: session.user.id },
    include: { user: true },
  });

  return comment;
}

export async function deleteBeatmapSetComment(commentId: number) {
  const session = await getServerSession(nextAuthOptions);

  if (!session) {
    return;
  }

  const comment = await prisma.beatmapComment.findUnique({
    where: { id: commentId },
  });

  if (!comment) {
    return;
  }

  if (comment.userId !== session.user.id) {
    return;
  }

  await prisma.beatmapComment.delete({ where: { id: commentId } });

  return;
}

export async function getRecentRatings() {
  const ratings = await prisma.beatmapRating.findMany({
    orderBy: { createdAt: "desc" },
    take: 25,
    include: {
      user: true,
      beatmap: { include: { beatmapSet: true, owners: true } },
    },
    where: {
      AND: [
        { beatmap: { owners: { none: { blacklisted: true } } } },
        { beatmap: { beatmapSet: { user: { blacklisted: false } } } },
      ],
    },
  });

  return ratings;
}

export async function getRecentComments() {
  const comments = await prisma.beatmapComment.findMany({
    orderBy: { createdAt: "desc" },
    take: 25,
    include: {
      user: true,
      beatmapSet: true,
    },
  });

  return comments;
}

export async function getRecentBeatmapSets() {
  const mapsets = await prisma.beatmapSet.findMany({
    where: { rankedDate: { not: null } },
    orderBy: { rankedDate: "desc" },
    take: 10,
    include: { user: true },
  });

  return mapsets;
}

export async function getSiteStats() {
  const userCount = await prisma.user.count({
    where: { hasCreatedAccount: true },
  });
  const ratingCount = await prisma.beatmapRating.count();
  const commentCount = await prisma.beatmapComment.count();

  return { users: userCount, ratings: ratingCount, comments: commentCount };
}

export async function calculateBeatmapBayesianAverage(id: number) {
  const globalRatingAverage =
    (
      await prisma.beatmapRating.aggregate({
        _avg: { rating: true },
      })
    )._avg.rating ?? 0;

  const sortedGlobalBeatmaps = await prisma.beatmap.findMany({
    include: { _count: { select: { ratings: true } } },
    orderBy: { ratings: { _count: "asc" } },
  });

  const lowerQuartileIndex = Math.floor(
    (sortedGlobalBeatmaps.length - 1) * 0.25
  );
  const lowerQuartileRatingCount =
    sortedGlobalBeatmaps[lowerQuartileIndex]._count.ratings;

  const beatmapRatings = await prisma.beatmapRating.findMany({
    where: { beatmapId: id },
  });
  const averageBeatmapRating =
    beatmapRatings.reduce((a, b) => a + b.rating, 0) /
    (beatmapRatings.length || 1);

  const bayesianAverage =
    (averageBeatmapRating * beatmapRatings.length +
      lowerQuartileRatingCount * globalRatingAverage) /
    (beatmapRatings.length + lowerQuartileRatingCount || 1);

  console.log(bayesianAverage);

  const newBeatmap = await prisma.beatmap.update({
    where: { id },
    data: {
      bayesianAverage,
      averageRating: averageBeatmapRating,
      ratingCount: beatmapRatings.length,
    },
  });

  return newBeatmap;
}

export async function globalRecalculateBayesian() {
  const beatmaps = await prisma.beatmap.findMany();

  for (const beatmap of beatmaps) {
    await calculateBeatmapBayesianAverage(beatmap.id);
  }
}

export async function globalRecalculateRank() {
  await globalRecalculateBayesian();

  const beatmaps = await prisma.beatmap.findMany({
    orderBy: { bayesianAverage: "desc" },
    include: { beatmapSet: true },
  });

  const years: { [key: number]: number } = {};

  for (const [index, beatmap] of beatmaps.entries()) {
    const year = beatmap.beatmapSet.rankedDate?.getUTCFullYear();
    if (year !== undefined) {
      if (years[year]) {
        years[year]++;
      } else {
        years[year] = 1;
      }
    }

    await prisma.beatmap.update({
      where: { id: beatmap.id },
      data: { rankOverall: index + 1, rankYear: year ? years[year] : null },
    });
  }
}
