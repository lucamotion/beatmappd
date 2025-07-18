import { Stars } from "@/components/beatmapset/Stars";
import { HeaderImage } from "@/components/shared/HeaderImage";
import { Image } from "@/components/shared/Image";
import { Nav } from "@/components/shared/Nav";
import {
  getRecentBeatmapSets,
  getRecentComments,
  getRecentRatings,
  getSiteStats,
} from "@/lib/database/beatmaps";
import Link from "next/link";
import styles from "./page.module.css";

export default async function Home() {
  const recentBeatmapSets = await getRecentBeatmapSets();
  const recentRatings = await getRecentRatings();
  const recentComments = await getRecentComments();
  const siteStats = await getSiteStats();

  const hue = recentBeatmapSets[0]?.hue || 240;
  const imageUrl = recentBeatmapSets[0]
    ? `https://assets.ppy.sh/beatmaps/${recentBeatmapSets[0].id}/covers/cover.jpg`
    : "https://osu.ppy.sh/assets/images/default-bg.7594e945.png";

  return (
    <main className={"page"}>
      <Nav hue={hue} />
      <HeaderImage imageUrl={imageUrl} />
      <section
        className={"page-content"}
        style={{ backgroundColor: `hsl(${hue}, 10%, 15%)` }}
      >
        <section className={styles["homepage"]}>
          <section className={styles["heading"]}>
            <div>
              <h1 className={styles["welcome"]}>
                Welcome to{" "}
                <span
                  className={styles["site-name"]}
                  style={{ color: `hsl(${hue}, 75%, 80%)` }}
                >
                  Beatmappd
                </span>
              </h1>
              <p className={styles["description"]}>
                a place for osu! players to catalog and rate beatmaps
              </p>
            </div>
            <p className={styles["statistics"]}>
              {siteStats.users} user{siteStats.users === 1 ? null : "s"} /{" "}
              {siteStats.ratings} rating{siteStats.ratings === 1 ? null : "s"} /{" "}
              {siteStats.comments} comment
              {siteStats.comments === 1 ? null : "s"}
            </p>
            <p className={styles["disclaimer"]}>
              <strong>Notice:</strong> Beatmappd is in very early development
              and may contain bugs and incomplete or missing features. The
              appearance and functionality of the site now may not reflect the
              final product. Keep up with development by joining our{" "}
              <a
                href={`https://discord.gg/7UJRMFUv8u`}
                className={styles["link"]}
                style={{
                  color: `hsl(${hue}, 75%, 80%)`,
                  height: "2rem",
                }}
              >
                Discord
              </a>{" "}
              server!
            </p>
          </section>
          <section className={styles["site-activity-container"]}>
            <div className={styles["container"]}>
              <h1 className={styles["container-heading"]}>Recent Ratings</h1>
              <section className={styles["recent-ratings-list"]}>
                {recentRatings.map((rating) => (
                  <div
                    key={rating.id}
                    className={styles["recent-ratings-item"]}
                  >
                    <div className={styles["recent-ratings-item-heading"]}>
                      <Link
                        href={`/user/${rating.userId}`}
                        className={styles["link"]}
                        style={{
                          color: `hsl(${hue}, 75%, 80%)`,
                          height: "2rem",
                        }}
                      >
                        <Image
                          src={`https://a.ppy.sh/${rating.userId}?0.jpeg`}
                          alt={`Profile image`}
                          height={32}
                          width={32}
                          className={styles["recent-ratings-beatmap-icon"]}
                        />
                      </Link>
                      <Link
                        href={`/user/${rating.userId}`}
                        className={styles["link"]}
                        style={{
                          color: `hsl(${hue}, 75%, 80%)`,
                        }}
                      >
                        {rating.user.username}
                      </Link>
                      on
                      <Link
                        href={`/set/${rating.beatmap.beatmapSetId}`}
                        className={styles["link"]}
                        style={{
                          color: `hsl(${hue}, 75%, 80%)`,
                          height: "2rem",
                        }}
                      >
                        <Image
                          src={`https://assets.ppy.sh/beatmaps/${rating.beatmap.beatmapSetId}/covers/list.jpg`}
                          fallback={
                            "https://osu.ppy.sh/assets/images/default-bg.7594e945.png"
                          }
                          alt={`Beatmap image`}
                          objectFit="cover"
                          fill
                          height={32}
                          width={32}
                          className={styles["recent-ratings-beatmap-icon"]}
                        />
                      </Link>
                      <Link
                        href={`/set/${rating.beatmap.beatmapSetId}`}
                        className={styles["link"]}
                        style={{
                          color: `hsl(${hue}, 75%, 80%)`,
                        }}
                      >
                        {rating.beatmap.beatmapSet.artist} -{" "}
                        {rating.beatmap.beatmapSet.title} [
                        {rating.beatmap.version}]
                      </Link>
                    </div>
                    <div className={styles["recent-ratings-stars"]}>
                      <svg
                        style={{
                          width: 0,
                          height: 0,
                          position: "absolute",
                        }}
                        aria-hidden="true"
                        focusable="false"
                      >
                        <linearGradient id="my-cool-gradient" x2="1" y2="0">
                          <stop offset="0%" stopColor="#ffff00" />
                          <stop offset="50%" stopColor="#ffff00" />
                          <stop offset="50%" stopColor="rgba(0, 0, 0, 0.75)" />
                          <stop offset="100%" stopColor="rgba(0, 0, 0, 0.75)" />
                        </linearGradient>
                      </svg>
                      <Stars rating={rating.rating} />
                    </div>
                  </div>
                ))}
              </section>
            </div>
            <div className={styles["container"]}>
              <h1 className={styles["container-heading"]}>Recent Comments</h1>
              <div className={styles["recent-comments-list"]}>
                {recentComments.map((comment) => (
                  <div
                    key={comment.id}
                    className={styles["recent-comments-item"]}
                  >
                    <div className={styles["recent-comments-comment-heading"]}>
                      <Link
                        href={`/user/${comment.userId}`}
                        className={styles["link"]}
                        style={{
                          color: `hsl(${hue}, 75%, 80%)`,
                          height: "2rem",
                        }}
                      >
                        <Image
                          src={`https://a.ppy.sh/${comment.userId}?0.jpeg`}
                          alt={`Profile image`}
                          height={32}
                          width={32}
                          className={styles["recent-ratings-beatmap-icon"]}
                        />
                      </Link>
                      <Link
                        href={`/user/${comment.userId}`}
                        className={styles["link"]}
                        style={{
                          color: `hsl(${hue}, 75%, 80%)`,
                        }}
                      >
                        {comment.user.username}
                      </Link>
                      on
                      <Link
                        href={`/set/${comment.beatmapSetId}`}
                        className={styles["link"]}
                        style={{
                          color: `hsl(${hue}, 75%, 80%)`,
                          height: "2rem",
                        }}
                      >
                        <Image
                          src={`https://assets.ppy.sh/beatmaps/${comment.beatmapSetId}/covers/list.jpg`}
                          fallback={
                            "https://osu.ppy.sh/assets/images/default-bg.7594e945.png"
                          }
                          alt={`Beatmap image`}
                          objectFit="cover"
                          fill
                          height={32}
                          width={32}
                          className={styles["recent-ratings-beatmap-icon"]}
                        />
                      </Link>
                      <Link
                        href={`/set/${comment.beatmapSetId}`}
                        className={styles["link"]}
                        style={{ color: `hsl(${hue}, 75%, 80%)` }}
                      >
                        {comment.beatmapSet.artist} - {comment.beatmapSet.title}
                      </Link>
                    </div>
                    <p>{comment.content}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
          <div className={styles["container"]} style={{ width: "100%" }}>
            <h1 className={styles["container-heading"]}>
              Recently Ranked Maps
            </h1>
            <div className={styles["recent-maps-list"]}>
              {recentBeatmapSets.map((set) => (
                <div key={set.id} className={styles["recent-maps-item"]}>
                  <div className={styles["recent-comments-comment-heading"]}>
                    <Link
                      href={`/set/${set.id}`}
                      className={styles["link"]}
                      style={{
                        color: `hsl(${hue}, 75%, 80%)`,
                        height: "2rem",
                      }}
                    >
                      <Image
                        src={`https://assets.ppy.sh/beatmaps/${set.id}/covers/list.jpg`}
                        fallback={
                          "https://osu.ppy.sh/assets/images/default-bg.7594e945.png"
                        }
                        alt={`Beatmap image`}
                        height={32}
                        width={32}
                        className={styles["recent-ratings-beatmap-icon"]}
                        objectFit="cover"
                        fill
                      />
                    </Link>
                    <Link
                      href={`/set/${set.id}`}
                      className={styles["link"]}
                      style={{ color: `hsl(${hue}, 75%, 80%)` }}
                    >
                      {set.artist} - {set.title}
                    </Link>{" "}
                    by
                    <Link
                      href={`/user/${set.userId}`}
                      className={styles["link"]}
                      style={{
                        color: `hsl(${hue}, 75%, 80%)`,
                        height: "2rem",
                      }}
                    >
                      <Image
                        src={`https://a.ppy.sh/${set.userId}?0.jpeg`}
                        alt={`Profile image`}
                        height={32}
                        width={32}
                        className={styles["recent-ratings-beatmap-icon"]}
                      />
                    </Link>
                    <Link
                      href={`/user/${set.userId}`}
                      className={styles["link"]}
                      style={{
                        color: `hsl(${hue}, 75%, 80%)`,
                      }}
                    >
                      {set.user.username}
                    </Link>
                    <p className={styles["recent-maps-item-date"]}>
                      {set.rankedDate!.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}{" "}
                      at{" "}
                      {set.rankedDate!.toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        hour12: false,
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
