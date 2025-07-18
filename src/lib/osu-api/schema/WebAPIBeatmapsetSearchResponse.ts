import z from "zod";

export const WebAPIBeatmapsetSearchResponse = z.object({
  beatmapsets: z.array(z.object({ id: z.number() })),
});
