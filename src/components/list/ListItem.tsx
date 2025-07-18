import { AnyListItem } from "@/lib/database/lists.js";
import Link from "next/link.js";
import styles from "./ListItem.module.css";

export function ListItem({ item }: { item: AnyListItem }) {
  const href =
    item.type === "beatmap"
      ? `/set/${item.beatmap.beatmapSetId}`
      : item.type === "beatmapSet"
        ? `/set/${item.beatmapSetId}`
        : item.type === "user"
          ? `/user/${item.userId}`
          : "";

  const imageUrl =
    item.type === "beatmap"
      ? `https://assets.ppy.sh/beatmaps/${item.beatmap.beatmapSetId}/covers/cover.jpg`
      : item.type === "beatmapSet"
        ? `https://assets.ppy.sh/beatmaps/${item.beatmapSetId}/covers/cover.jpg`
        : item.type === "user"
          ? `https://a.ppy.sh/${item.userId}?0.jpeg`
          : "";

  return (
    <div className={styles["list-item"]} key={`${item.id}-${item.order}`}>
      <span className={styles["item-number"]}>{item.order}</span>
      <Link href={href}>
        <div
          style={{
            backgroundImage: `url(${imageUrl})`,
            backgroundPosition: "center",
          }}
          className={styles["item-image"]}
        />
      </Link>
      <section className={styles["item-data"]}>
        <Link
          href={href}
          className={`${styles["link"]} ${styles["item-name"]}`}
          style={{ color: `hsl(${240}, 75%, 80%)` }}
        >
          {item.type === "beatmap"
            ? `${item.beatmap.beatmapSet.artist} - ${item.beatmap.beatmapSet.title} [${item.beatmap.version}]`
            : item.type === "beatmapSet"
              ? `${item.beatmapSet.artist} - ${item.beatmapSet.title}`
              : item.type === "user"
                ? `${item.user.username}`
                : ""}
        </Link>
        <p className={styles["item-comment"]}>{item.comment}</p>
      </section>
    </div>
  );
}
