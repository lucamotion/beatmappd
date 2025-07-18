import { BeatmapRating, Beatmap as DBBeatmap, User } from "@prisma/client";
import styles from "./Beatmap.module.css";
import { getServerSession } from "next-auth";
import { Rater } from "./Rater";
import { getOwnBeatmapSetRating } from "@/lib/database/beatmaps";
import { StandardIcon } from "../icons/StandardIcon";
import { CatchIcon } from "../icons/CatchIcon";
import { ManiaIcon } from "../icons/ManiaIcon";
import { TaikoIcon } from "../icons/TaikoIcon";
import { nextAuthOptions } from "@/lib/auth";

export async function Beatmap({
  map,
  setOwnerId,
}: {
  map: DBBeatmap & { owners: User[]; ratings: BeatmapRating[] };
  setOwnerId: number;
}) {
  const session = await getServerSession(nextAuthOptions);
  const userRating = await getOwnBeatmapSetRating(map.id);

  return (
    <div className={styles["beatmap"]}>
      <div className={styles["map-data"]}>
        {map.mode === "osu" ? (
          <StandardIcon className={styles["mode-icon"]} />
        ) : map.mode === "fruits" ? (
          <CatchIcon className={styles["mode-icon"]} />
        ) : map.mode === "mania" ? (
          <ManiaIcon className={styles["mode-icon"]} />
        ) : map.mode === "taiko" ? (
          <TaikoIcon className={styles["mode-icon"]} />
        ) : (
          ""
        )}
        <section className={styles["difficulty"]}>
          <span className={styles["difficulty-name"]}>
            {map.version}{" "}
            <span className={styles["difficulty-sr"]}>
              {map.difficulty.toFixed(2)} ★
            </span>
          </span>
          {map.owners.length === 1 && map.owners[0].id === setOwnerId ? null : (
            <span className={styles["guest-mapper"]}>
              mapped by{" "}
              {map.owners.map((owner, index) => (
                <span key={owner.id}>
                  <a href={`/user/${owner.id}`}>{owner.username}</a>
                  {map.owners.length === 2 && index === 0
                    ? " and "
                    : index + 1 < map.owners.length
                    ? ", "
                    : ""}
                </span>
              ))}
            </span>
          )}
        </section>
      </div>
      <div className={styles["ratings-container"]}>
        <p>
          <span className={styles["global-rating"]}>
            {(
              map.ratings.reduce((a, b) => a + b.rating / 2, 0) /
              (map.ratings.length || 1)
            ).toFixed(2)}
          </span>{" "}
          / 5.0 from {map.ratings.length} rating
          {map.ratings.length === 1 ? null : "s"}
        </p>
        {session ? (
          <Rater mapId={map.id} userRating={userRating?.rating} />
        ) : (
          "Please log in to rate."
        )}
      </div>
      {/* <div className={styles["add-to-list"]}>
        <p>Add to List</p>
        <AddToList itemId={map.id} type={"beatmap"} />
      </div> */}
    </div>
  );
}
