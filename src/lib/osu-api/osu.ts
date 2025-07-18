import { Ruleset } from "@prisma/client";
import { WebAPIBeatmapsetSearchResponse } from "./schema/WebAPIBeatmapsetSearchResponse";
import { WebAPITokenResponse } from "./schema/WebAPITokenResponse";

export class OsuAPI {
  public isApiHealthy: boolean | null = null;

  private readonly oauthUrl = "https://osu.ppy.sh/oauth/token";
  private readonly apiBaseUrl = "https://osu.ppy.sh/api/v2";
  private readonly client_id = process.env.OSU_CLIENT_ID;
  private readonly client_secret = process.env.OSU_CLIENT_SECRET;
  private bearer?: string;
  private bearer_expires?: Date;

  private async request(
    url: string | URL,
    options?: RequestInit,
  ): Promise<unknown> {
    if (
      this.bearer === undefined ||
      (this.bearer_expires &&
        this.bearer_expires.getTime() < Date.now() + 1000 * 60 * 30)
    ) {
      await this.login();
    }

    const response = await fetch(url, {
      ...options,
      headers: { ...options?.headers, Authorization: `Bearer ${this.bearer}` },
    });

    if (response.status !== 200) {
      this.isApiHealthy = false;
      throw new Error(
        `Failed to retrieve data from osu! api: ${
          response.status
        } ${await response.text()}`,
      );
    } else {
      this.isApiHealthy = true;
      return await response.json();
    }
  }

  public async getBeatmap(id: number) {
    const url = `${this.apiBaseUrl}/beatmaps/${id}`;

    const response = (await this.request(url)) as {
      beatmapset_id: number;
      difficulty_rating: number;
      id: number;
      mode: Ruleset;
      status: string;
      total_length: number;
      user_id: number;
      version: string;
      accuracy: number;
      ar: number;
      bpm: number;
      convert: boolean;
      count_circles: number;
      count_sliders: number;
      count_spinners: number;
      cs: number;
      deleted_at: unknown;
      drain: number;
      hit_length: number;
      is_scoreable: boolean;
      last_updated: string;
      ranked_date: string | null;
      mode_int: number;
      passcount: number;
      playcount: number;
      ranked: number;
      url: string;
      checksum: string;
      failtimes: unknown;
      owners: { id: number; username: string }[];
    };

    return response;
  }

  public async getBeatmapSet(id: number) {
    const url = `${this.apiBaseUrl}/beatmapsets/${id}`;

    const response = (await this.request(url)) as {
      artist: string;
      artist_unicode: string;
      covers: unknown;
      creator: string;
      favourite_count: number;
      id: number;
      nsfw: boolean;
      offset: number;
      play_count: number;
      preview_url: string;
      source: string;
      status: string;
      spotlight: boolean;
      title: string;
      title_unicode: string;
      user_id: number;
      genre: { id: number; name: string };
      language: { id: number; name: string };
      video: boolean;
      current_nominations: {
        beatmapset_id: number;
        rulesets: Ruleset[] | null;
        reset: boolean;
        user_id: number;
      }[];
      ranked_date: string | null;
      related_users: { id: number; username: string }[];
      beatmaps: {
        beatmapset_id: number;
        difficulty_rating: number;
        id: number;
        mode: Ruleset;
        status: string;
        total_length: number;
        user_id: number;
        version: string;
        accuracy: number;
        ar: number;
        bpm: number;
        convert: boolean;
        count_circles: number;
        count_sliders: number;
        count_spinners: number;
        cs: number;
        deleted_at: unknown;
        drain: number;
        hit_length: number;
        is_scoreable: boolean;
        last_updated: string;
        mode_int: number;
        passcount: number;
        playcount: number;
        ranked: number;
        url: string;
        checksum: string;
        failtimes: unknown;
        owners: { id: number; username: string }[];
      }[];
    };

    return response;
  }

  public async getUser(id: number) {
    const url = `${this.apiBaseUrl}/users/${id}`;

    const response = (await this.request(url)) as {
      id: number;
      username: string;
    };

    return response;
  }

  public async getBeatmaps() {
    const params = new URLSearchParams([
      ["nsfw", "true"],
      ["sort", "ranked_desc"],
    ]);
    const url = `${this.apiBaseUrl}/beatmapsets/search?${params}`;

    const response = await this.request(url);
    const maps = WebAPIBeatmapsetSearchResponse.parse(response);

    // await refreshBeatmapCache();

    return maps;
  }

  public async login() {
    if (!this.client_id || !this.client_secret) {
      throw new Error(`CLIENT_ID and CLIENT_SECRET are unset!`);
    }

    const response = await fetch(this.oauthUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: this.client_id.toString(),
        client_secret: this.client_secret,
        grant_type: "client_credentials",
        scope: "public",
      }),
    });

    try {
      const parsedResponse = WebAPITokenResponse.parse(await response.json());

      this.bearer = parsedResponse.access_token;
      this.bearer_expires = new Date(
        Date.now() + parsedResponse.expires_in * 1000,
      );

      console.log(`Successfully logged into osu! Web API.`);
      this.isApiHealthy = true;
    } catch (e) {
      console.log(`Failed to retrieve bearer token from osu! api:`, e);
      this.isApiHealthy = false;
    }
  }

  constructor() {}
}

export const osu = new OsuAPI();
