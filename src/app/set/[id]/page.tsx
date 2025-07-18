import { CommentBox } from "@/components/beatmapset/CommentBox";
import { Rater } from "@/components/beatmapset/Rater";
import { Stars } from "@/components/beatmapset/Stars";
import { CatchIcon } from "@/components/icons/CatchIcon";
import { ManiaIcon } from "@/components/icons/ManiaIcon";
import { StandardIcon } from "@/components/icons/StandardIcon";
import { TaikoIcon } from "@/components/icons/TaikoIcon";
import { HeaderImage } from "@/components/shared/HeaderImage";
import { Image } from "@/components/shared/Image";
import { Nav } from "@/components/shared/Nav";
import { nextAuthOptions } from "@/lib/auth";
import { getBeatmapSet } from "@/lib/database/beatmaps";
import { Genre } from "@/lib/genre";
import { Language } from "@/lib/language";
import { getServerSession } from "next-auth";
import Link from "next/link";
import styles from "./page.module.css";

export default async function MapsetPage({
  params: _params,
}: {
  params: Promise<{ id: string }>;
}) {
  const params = await _params;
  const set = await getBeatmapSet(parseInt(params.id, 10));
  const session = await getServerSession(nextAuthOptions);

  if (!set) {
    return <div>404</div>;
  }

  const totalRatingCount = set.difficulties.reduce(
    (a, b) => a + b.ratings.length,
    0,
  );
  const averageRating =
    set.difficulties.reduce(
      (a, b) => a + b.ratings.reduce((c, d) => c + d.rating, 0),
      0,
    ) /
    (totalRatingCount || 1) /
    2;

  return (
    <div className={"page"}>
      <Nav hue={set.hue} />
      <HeaderImage
        imageUrl={`https://assets.ppy.sh/beatmaps/${set.id}/covers/cover.jpg`}
      />
      <section
        className="page-content"
        style={{
          backgroundColor: `hsl(${set.hue}, 10%, 15%)`,
        }}
      >
        <div className={styles["column-container"]}>
          <div className={`${styles["column"]} ${styles["left"]}`}>
            <section className={styles["set-cover"]}>
              <Image
                src={`https://assets.ppy.sh/beatmaps/${set.id}/covers/cover.jpg`}
                fallback={
                  "https://osu.ppy.sh/assets/images/default-bg.7594e945.png"
                }
                alt={`Cover for ${set.artist} - ${set.title}`}
                height={960}
                width={1920}
                className={styles["set-cover-image"]}
              />
            </section>
            <section className={styles["metadata-container"]}>
              <header className={styles["set-title-container"]}>
                <h1 className={styles["set-title"]}>
                  <a
                    href={`https://osu.ppy.sh/s/${set.id}`}
                    className={styles["link"]}
                    style={{ color: `hsl(${set.hue}, 75%, 80%)` }}
                  >
                    {set.title}
                  </a>
                </h1>
                <h2 className={styles["set-artist"]}>{set.artist}</h2>
              </header>
              <div className={styles["metadata-element"]}>
                <h3 className={styles["metadata-heading"]}>Creator</h3>
                <p className={styles["metadata-body"]}>
                  <Link
                    href={`/user/${set.userId}`}
                    className={styles["link"]}
                    style={{ color: `hsl(${set.hue}, 75%, 80%)` }}
                  >
                    {set.creator}{" "}
                    {set.creator !== set.user.username
                      ? `(${set.user.username})`
                      : ""}
                  </Link>
                </p>
              </div>
              <div className={styles["metadata-element"]}>
                <h3 className={styles["metadata-heading"]}>
                  {set.status === "ranked"
                    ? "Ranked"
                    : set.status === "loved"
                      ? "Loved"
                      : set.status === "approved"
                        ? "Approved"
                        : "???"}{" "}
                  on
                </h3>
                <p className={styles["metadata-body"]}>
                  {set.rankedDate
                    ? `${set.rankedDate.toLocaleDateString("en-US", {
                        day: "numeric",
                        month: "long",
                      })}, ${set.rankedDate.toLocaleDateString("en-US", {
                        year: "numeric",
                      })}`
                    : "???"}
                </p>
              </div>
              <div className={styles["metadata-element"]}>
                <h3 className={styles["metadata-heading"]}>Language</h3>
                <p className={styles["metadata-body"]}>
                  {set.languageId
                    ? Language[set.languageId as keyof typeof Language] ||
                      set.languageId
                    : "Unknown"}
                </p>
              </div>
              <div className={styles["metadata-element"]}>
                <h3 className={styles["metadata-heading"]}>Genre</h3>
                <p className={styles["metadata-body"]}>
                  {set.genreId
                    ? Genre[set.genreId as keyof typeof Genre] || set.genreId
                    : "Unknown"}
                </p>
              </div>
              <div className={styles["metadata-element"]}>
                {" "}
                <h3 className={styles["metadata-heading"]}>Nominators</h3>
                <p className={styles["metadata-body"]}>
                  {set.nominations.map((nom) => (
                    <Link
                      key={nom.userId}
                      href={`/user/${nom.userId}`}
                      className={styles["link"]}
                      style={{ color: `hsl(${set.hue}, 75%, 80%)` }}
                    >
                      {nom.user.username}
                    </Link>
                  ))}
                </p>
              </div>
              <div
                className={`${styles["metadata-element"]} ${styles["global-rating-container"]}`}
              >
                <p
                  className={`${styles["metadata-body"]} ${styles["global-rating-text"]}`}
                >
                  {set.user.blacklisted ? (
                    <span className={styles["blacklisted"]}>
                      Rating unavailable (mapper blacklisted)
                    </span>
                  ) : (
                    <span>
                      <span className={styles["global-rating"]}>
                        {averageRating.toFixed(2)}
                      </span>{" "}
                      / 5.0 from{" "}
                      <span className={styles["global-rating-count"]}>
                        {totalRatingCount.toLocaleString()}
                      </span>{" "}
                      rating{totalRatingCount === 1 ? null : "s"}
                    </span>
                  )}
                </p>
              </div>
            </section>
            <div className={styles["divider"]} />
            {set.user.blacklisted ? undefined : (
              <div className={styles["container"]}>
                <CommentBox
                  setId={set.id}
                  comments={set.comments}
                  hue={set.hue}
                />
              </div>
            )}
            <section className={styles["container"]}>
              <h2 className={styles["container-heading"]}>
                {set.listItems.length.toLocaleString()} List
                {set.listItems.length === 1 ? null : "s"}
              </h2>
              <div className={styles["list-container"]}>
                {set.listItems
                  .filter(
                    (item, index) =>
                      set.listItems.findIndex((i) => i.id === item.id) ===
                      index,
                  )
                  .map((item) => (
                    <div key={item.id} className={styles["list"]}>
                      <p>
                        <Link
                          href={`/list/${item.listId}`}
                          style={{
                            color: `hsl(${set.hue}, 75%, 80%)`,
                          }}
                        >
                          {item.list.name}
                        </Link>
                      </p>
                      <p>
                        <Link
                          href={`/user/${item.list.userId}`}
                          className={styles["link"]}
                          style={{ color: `hsl(${set.hue}, 75%, 80%)` }}
                        >
                          {item.list.user.username}
                        </Link>
                      </p>
                    </div>
                  ))}
              </div>
            </section>
          </div>
          <div className={`${styles["column"]} ${styles["right"]}`}>
            <div className={styles["difficulty-container"]}>
              <div className={styles["beatmap-list"]}>
                {set.difficulties
                  .sort(
                    (a, b) =>
                      a.modeInt - b.modeInt || b.difficulty - a.difficulty,
                  )
                  .map((map) => {
                    const userRating = map.ratings.find(
                      (r) => r.userId === session?.user.id,
                    );

                    return (
                      <div className={styles["beatmap"]} key={map.id}>
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
                            {map.owners.length === 1 &&
                            map.owners[0].id === set.userId ? null : (
                              <span className={styles["guest-mapper"]}>
                                mapped by{" "}
                                {map.owners.map((owner, index) => (
                                  <span key={owner.id}>
                                    <Link
                                      href={`/user/${owner.id}`}
                                      className={styles["link"]}
                                      style={{
                                        color: `hsl(${set.hue}, 75%, 80%)`,
                                      }}
                                    >
                                      {owner.username}
                                    </Link>
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
                          {map.owners.find((owner) => owner.blacklisted) !==
                          undefined ? (
                            <span className={styles["blacklisted"]}>
                              Rating unavailable (mapper blacklisted)
                            </span>
                          ) : (
                            <p>
                              <span className={styles["global-rating"]}>
                                {(
                                  map.ratings.reduce(
                                    (a, b) => a + b.rating / 2,
                                    0,
                                  ) / (map.ratings.length || 1)
                                ).toFixed(2)}
                              </span>{" "}
                              / 5.0 from {map.ratings.length} rating
                              {map.ratings.length === 1 ? null : "s"}
                            </p>
                          )}
                          {session ? (
                            <Rater
                              mapId={map.id}
                              userRating={userRating?.rating}
                            />
                          ) : (
                            "Please log in to rate."
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
            <div className={styles["rating-list-container"]}>
              <h2 className={styles["container-heading"]}>Recent Ratings</h2>
              <div className={styles["rating-list"]}>
                {(
                  [] as {
                    version: string;
                    user: {
                      id: number;
                      username: string;
                      hasCreatedAccount: boolean;
                    };
                    id: number;
                    userId: number;
                    beatmapId: number;
                    rating: number;
                    createdAt: Date;
                  }[]
                )
                  .concat(
                    ...set.difficulties
                      .filter(
                        (map) =>
                          map.owners.find((owner) => owner.blacklisted) ===
                          undefined,
                      )
                      .map((diff) =>
                        diff.ratings.map((rating) => ({
                          ...rating,
                          version: diff.version,
                        })),
                      ),
                  )
                  .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
                  .map((rating) => (
                    <div key={rating.id} className={styles["rating"]}>
                      <Link
                        href={`/user/${rating.userId}`}
                        className={styles["link"]}
                        style={{
                          color: `hsl(${set.hue}, 75%, 80%)`,
                          height: "1.5rem",
                          marginRight: "-0.25rem",
                        }}
                      >
                        <Image
                          src={`https://a.ppy.sh/${rating.userId}?0.jpeg`}
                          alt={`Profile image`}
                          height={24}
                          width={24}
                          className={styles["profile-image"]}
                        />
                      </Link>
                      <Link
                        href={`/user/${rating.userId}`}
                        className={styles["link"]}
                        style={{
                          color: `hsl(${set.hue}, 75%, 80%)`,
                          marginRight: "0.25rem",
                        }}
                      >
                        {rating.user.username}
                      </Link>
                      <p className={styles["rating-difficulty"]}>
                        {rating.version}
                      </p>
                      <p className={styles["rating-date"]}>
                        {rating.createdAt.toLocaleDateString("en-US", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                      <div className={styles["rating-stars"]}>
                        <Stars rating={rating.rating} />
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
