"use server";
import { parse } from "csv-parse/sync";
import { readFile } from "fs/promises";
import { getServerSession } from "next-auth";
import { nextAuthOptions } from "./auth";
import { getBeatmap } from "./database/beatmaps";
import { prisma } from "./database/prisma";

const data = await readFile("./src/assets/ratings.csv");

const rawOmdbRatings = parse(data, {
  columns: ["id", "beatmapId", "userId", "rating", "date"],
  quote: null,
}) as {
  id: string;
  beatmapId: string;
  userId: string;
  rating: string;
  date: string;
}[];

const omdbRatings: Map<
  number,
  { beatmapId: number; rating: number; date: Date }[]
> = new Map();

for (const rating of rawOmdbRatings) {
  const userId = parseInt(rating.userId);

  if (!omdbRatings.has(userId)) {
    omdbRatings.set(userId, []);
  }

  omdbRatings.get(userId)!.push({
    beatmapId: parseInt(rating.beatmapId),
    rating: parseFloat(rating.rating),
    date: new Date(rating.date.trim()),
  });
}

export async function importRatings(): Promise<number> {
  const session = await getServerSession(nextAuthOptions);

  if (!session) {
    return 0;
  }

  const existingRatings = new Set(
    (
      await prisma.beatmapRating.findMany({
        where: { userId: session.user.id },
      })
    ).map((rating) => rating.beatmapId),
  );

  const oldRatings = omdbRatings.get(session.user.id);

  if (!oldRatings || oldRatings.length === 0) {
    return 0;
  }

  let imported = 0;

  for (const rating of oldRatings) {
    if (existingRatings.has(rating.beatmapId)) {
      continue;
    }

    let map;

    try {
      map = await getBeatmap(rating.beatmapId);
    } catch (e) {
      console.log(`ignored beatmap: ${e}`);
    }

    if (!map) {
      continue;
    }

    await prisma.beatmapRating.create({
      data: {
        beatmapId: map.id,
        rating: rating.rating * 2,
        userId: session.user.id,
        createdAt: rating.date,
      },
    });
    imported++;
  }

  return imported;
}
