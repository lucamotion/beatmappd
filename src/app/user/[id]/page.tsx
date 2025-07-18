import { Stars } from "@/components/beatmapset/Stars";
import { ImportButton } from "@/components/profile/Import";
import { UserRatingSpread } from "@/components/profile/UserRatingSpread";
import { HeaderImage } from "@/components/shared/HeaderImage";
import { Image } from "@/components/shared/Image";
import { Nav } from "@/components/shared/Nav";
import { nextAuthOptions } from "@/lib/auth";
import { getUser } from "@/lib/database/users";
import { getServerSession } from "next-auth";
import Link from "next/link";
import styles from "./page.module.css";

export default async function User({
  params: _params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(nextAuthOptions);
  const params = await _params;
  const user = await getUser(parseInt(params.id, 10));

  if (!user) {
    return <div>404</div>;
  }

  const ratingCount = user.ratings.length;

  const recentRatings = user.ratings
    .filter(
      (rating) =>
        rating.beatmap.owners.find((owner) => owner.blacklisted) ===
          undefined && rating.beatmap.beatmapSet.user.blacklisted === false,
    )
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 25);

  const commentCount = user.beatmapSetComments.length;

  return (
    <main className="page">
      <Nav hue={240} />
      <HeaderImage imageUrl={`https://a.ppy.sh/${user.id}?0.jpeg`} />
      <section
        className="page-content"
        style={{
          backgroundColor: `hsl(${240}, 10%, 15%)`,
        }}
      >
        <div className={styles["profile-container"]}>
          <div className={styles["profile-heading"]}>
            <Image
              src={`https://a.ppy.sh/${user.id}?0.jpeg`}
              alt={`${user.username}'s profile`}
              height={250}
              width={250}
              className={styles["profile-picture"]}
            />
            <div className={styles["profile-heading-meta"]}>
              <a
                href={`https://osu.ppy.sh/u/${user.id}`}
                className={styles["username"]}
                style={{ color: `hsl(240, 75%, 80%)` }}
              >
                {user.username}
              </a>
              <div className={styles["statistics"]}>
                <p>
                  {ratingCount} {ratingCount === 1 ? "rating" : "ratings"}
                </p>
                <p>
                  {commentCount} {commentCount === 1 ? "comment" : "comments"}
                </p>
              </div>
              <div className={styles["rating-spread-container"]}>
                <h1 className={styles["container-heading"]}>Rating Spread</h1>
                <UserRatingSpread ratings={user.ratings} />
              </div>
              {user.id === session?.user.id ? <ImportButton /> : null}
            </div>
          </div>
          <div className={styles["column-right"]}>
            <div className={styles["container"]}>
              <h1 className={styles["container-heading"]}>Recent Ratings</h1>
              {recentRatings.length === 0 ? (
                "No recent activity..."
              ) : (
                <div className={styles["recent-ratings-list"]}>
                  {recentRatings.map((rating) => (
                    <div
                      key={rating.id}
                      className={styles["recent-ratings-item"]}
                    >
                      <Link
                        href={`/set/${rating.beatmap.beatmapSetId}`}
                        className={styles["link"]}
                        style={{
                          color: `hsl(240, 75%, 80%)`,
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
                            <stop
                              offset="50%"
                              stopColor="rgba(0, 0, 0, 0.75)"
                            />
                            <stop
                              offset="100%"
                              stopColor="rgba(0, 0, 0, 0.75)"
                            />
                          </linearGradient>
                        </svg>
                        <Stars rating={rating.rating} />
                      </div>
                      <Link
                        href={`/set/${rating.beatmap.beatmapSetId}`}
                        className={styles["link"]}
                        style={{
                          color: `hsl(240, 75%, 80%)`,
                          maxWidth: "30rem",
                        }}
                      >
                        {rating.beatmap.beatmapSet.artist} -{" "}
                        {rating.beatmap.beatmapSet.title} [
                        {rating.beatmap.version}]
                      </Link>
                      <span className={styles["recent-ratings-date"]}>
                        {rating.createdAt.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}{" "}
                        at{" "}
                        {rating.createdAt.toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          hour12: false,
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className={styles["container"]}>
              <h1 className={styles["container-heading"]}>Recent Comments</h1>
              {user.beatmapSetComments.length === 0 ? (
                "No recent activity..."
              ) : (
                <div className={styles["recent-comments-list"]}>
                  {user.beatmapSetComments
                    .sort(
                      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
                    )
                    .map((comment) => (
                      <div
                        key={comment.id}
                        className={styles["recent-comments-item"]}
                      >
                        <div
                          className={styles["recent-comments-comment-heading"]}
                        >
                          <Link
                            href={`/set/${comment.beatmapSetId}`}
                            className={styles["link"]}
                            style={{
                              color: `hsl(240, 75%, 80%)`,
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
                            style={{ color: `hsl(240, 75%, 80%)` }}
                          >
                            {comment.beatmapSet.artist} -{" "}
                            {comment.beatmapSet.title}
                          </Link>
                          <span className={styles["recent-ratings-date"]}>
                            {comment.createdAt.toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}{" "}
                            at{" "}
                            {comment.createdAt.toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              hour12: false,
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <p>{comment.content}</p>
                      </div>
                    ))}
                </div>
              )}
            </div>
            <div className={styles["container"]}>
              <h1 className={styles["container-heading"]}>Lists</h1>
              {user.lists.length === 0 ? (
                `${user.username} has not created any lists yet.`
              ) : (
                <div className={styles["lists-list"]}>
                  {user.lists
                    .sort((a, b) => b.id - a.id)
                    .map((list) => {
                      const itemCount =
                        list._count.beatmapItems +
                        list._count.beatmapSetItems +
                        list._count.userItems;

                      return (
                        <div key={list.id} className={styles["list-item"]}>
                          <Link
                            href={`/list/${list.id}`}
                            className={styles["list-link"]}
                            style={{
                              color: `hsl(240, 75%, 80%)`,
                            }}
                          >
                            {list.name}
                          </Link>
                          {itemCount} item{itemCount === 1 ? null : "s"}
                        </div>
                      );
                    })}
                </div>
              )}
              {session?.user.id === user.id ? (
                <Link
                  href={`/list/new`}
                  style={{ color: `hsl(240, 75%, 80%)` }}
                >
                  [create list]
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
