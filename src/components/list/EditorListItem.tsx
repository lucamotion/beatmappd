"use client";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Beatmap,
  BeatmapSet,
  ListBeatmapItem,
  ListBeatmapSetItem,
  ListUserItem,
  User,
} from "@prisma/client";
import Link from "next/link";
import { ChangeEvent } from "react";
import styles from "./EditorListItem.module.css";

export function EditorListItem({
  index,
  item,
  onDelete,
  onCommentChange,
}: {
  index: number;
  item:
    | (ListBeatmapSetItem & { type: "beatmapSet"; beatmapSet: BeatmapSet })
    | (ListBeatmapItem & {
        type: "beatmap";
        beatmap: Beatmap & { beatmapSet: BeatmapSet };
      })
    | (ListUserItem & { type: "user"; user: User });
  onDelete: () => Promise<void>;
  onCommentChange: (event: ChangeEvent<HTMLTextAreaElement>) => Promise<void>;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: item.order });

  const style = { transform: CSS.Transform.toString(transform), transition };

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
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={styles["item"]}
    >
      <div className={styles["item-number"]}>
        {index + 1}
        <button
          type="button"
          onClick={onDelete}
          data-no-dnd={"true"}
          className={styles["delete-button"]}
        >
          [delete]
        </button>
      </div>
      <Link href={href} data-no-dnd={"true"}>
        <div
          style={{
            backgroundImage: `url(${imageUrl})`,
            backgroundPosition: "center",
          }}
          className={styles["item-image"]}
        />
      </Link>
      <div className={styles["item-data"]} data-no-dnd={"true"}>
        <Link
          href={href}
          style={{ color: `hsl(${240}, 75%, 80%)` }}
          className={styles["link"]}
        >
          {item.type === "user"
            ? item.user.username
            : item.type === "beatmapSet"
              ? `${item.beatmapSet.artist} - ${item.beatmapSet.title}`
              : item.type === "beatmap"
                ? `${item.beatmap.beatmapSet.artist} - ${item.beatmap.beatmapSet.title} [${item.beatmap.version}]`
                : "unknown item"}
        </Link>
        <textarea
          data-no-dnd={"true"}
          onChange={onCommentChange}
          defaultValue={item.comment ?? ""}
          className={styles["comment-box"]}
          placeholder="Write something about this item"
        />
      </div>
    </div>
  );
}
