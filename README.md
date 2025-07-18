# [beatmappd](https://beatmappd.mittens.cc/)

A place for [osu!](https://osu.ppy.sh/) players to rate beatmaps.

# Contributing

All contributions welcome, just submit a PR.

1. Fill in `.env.example` with your database URL and osu! api information.
2. `pnpm install`
3. `pnpm prisma db push` to update your database schema.
4. `pnpm dev` to start Next.js in watch mode
