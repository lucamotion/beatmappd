import { ListItem } from "@/components/list/ListItem.jsx";
import { HeaderImage } from "@/components/shared/HeaderImage";
import { Nav } from "@/components/shared/Nav";
import { nextAuthOptions } from "@/lib/auth";
import { getList } from "@/lib/database/lists";
import { getServerSession } from "next-auth";
import Link from "next/link";
import styles from "./page.module.css";

export default async function ListPage({
  params: _params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(nextAuthOptions);
  const params = await _params;
  const listId = parseInt(params.id, 10);

  if (isNaN(listId)) {
    return <div>404</div>;
  }

  const list = await getList(listId);

  if (!list) {
    return <div>404</div>;
  }

  let coverImage = "https://osu.ppy.sh/assets/images/default-bg.7594e945.png";

  if (list.items[0]) {
    if (list.items[0].type === "user") {
      coverImage = `https://a.ppy.sh/${list.items[0].userId}?0.jpeg`;
    } else if (list.items[0].type === "beatmap") {
      coverImage = `https://assets.ppy.sh/beatmaps/${list.items[0].beatmap.beatmapSetId}/covers/cover.jpg`;
    } else if (list.items[0].type === "beatmapSet") {
      coverImage = `https://assets.ppy.sh/beatmaps/${list.items[0].beatmapSetId}/covers/cover.jpg`;
    }
  }

  return (
    <main className="page">
      <Nav hue={240} />
      <HeaderImage imageUrl={coverImage} />
      <section
        className="page-content"
        style={{ backgroundColor: `hsl(${240}, 10%, 15%)` }}
      >
        <div className={styles["list-page"]}>
          <div className={styles["list-header"]}>
            <h1 className={styles["list-name"]}>{list.name}</h1>
            <p className={styles["list-creator"]}>
              created by{" "}
              <Link
                href={`/user/${list.userId}`}
                style={{ color: `hsl(${240}, 75%, 80%)` }}
                className={styles["link"]}
              >
                {list.user.username}
              </Link>
            </p>
            <p className={styles["list-description"]}>
              {list.description || ""}
            </p>
            {list.userId === session?.user.id ? (
              <Link
                href={`/list/${list.id}/edit`}
                className={styles["edit-list"]}
              >
                [Edit List]
              </Link>
            ) : null}
          </div>
          <div className={"divider"} />
          <div className={styles["list-items"]}>
            {list.items.map((item) => (
              <ListItem key={item.id} item={item} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
