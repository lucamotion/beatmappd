"use client";

import {
  createBeatmapSetComment,
  deleteBeatmapSetComment,
} from "@/lib/database/beatmaps";
import { BeatmapComment, User } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useState } from "react";
import styles from "./CommentBox.module.css";
import Link from "next/link";
import { Image } from "../shared/Image";

export function CommentBox({
  setId,
  comments: _comments,
  hue,
}: {
  setId: number;
  comments: (BeatmapComment & { user: User })[];
  hue: number;
}) {
  const session = useSession().data;
  const [input, setInput] = useState<string>("");
  const [comments, setComments] = useState(_comments);

  return (
    <div className={styles["comment-box-container"]}>
      <div className={styles["comment-box"]}>
        {comments
          // this has to be reversed due to flex-direction: column-reverse
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
          .map((comment) => (
            <div key={comment.id} className={styles["comment"]}>
              <div className={styles["comment-meta-container"]}>
                <Link
                  href={`/user/${comment.userId}`}
                  className={styles["link"]}
                  style={{
                    color: `hsl(${hue}, 75%, 80%)`,
                    height: "1.5rem",
                  }}
                >
                  <Image
                    src={`https://a.ppy.sh/${comment.userId}?0.jpeg`}
                    alt={`Profile image`}
                    height={24}
                    width={24}
                    className={styles["profile-image"]}
                  />
                </Link>
                <Link
                  href={`/user/${comment.userId}`}
                  style={{
                    color: `hsl(${hue}, 75%, 80%)`,
                  }}
                  className={styles["link"]}
                >
                  {comment.user.username}
                </Link>
                <p className={styles["time"]}>
                  {comment.createdAt.toLocaleDateString("en-US", {
                    month: "short",
                    day: "2-digit",
                  })}{" "}
                  {comment.createdAt.getUTCFullYear() ===
                  new Date().getUTCFullYear()
                    ? comment.createdAt.getUTCFullYear()
                    : null}{" "}
                  at{" "}
                  {comment.createdAt.toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "numeric",
                    hour12: false,
                  })}
                </p>
              </div>
              <p className={styles["content"]}>{comment.content}</p>
              {comment.userId === session?.user.id ? (
                <button
                  className={styles["delete-button"]}
                  onClick={async () => {
                    const confirmed = confirm("Really delete this comment?");

                    if (confirmed) {
                      await deleteBeatmapSetComment(comment.id);
                      setComments(comments.filter((c) => c.id !== comment.id));
                    }
                  }}
                  type="button"
                >
                  [Delete]
                </button>
              ) : (
                ""
              )}
            </div>
          ))}
      </div>
      <div className={styles["input-container"]}>
        <textarea
          value={input}
          onChange={(event) =>
            event.target.value === undefined
              ? setInput("")
              : setInput(event.target.value)
          }
          className={styles["comment-input"]}
          placeholder={
            session?.user === undefined
              ? "Log in to comment."
              : "Write something thought-provoking"
          }
          disabled={session?.user === undefined}
        />
        <button
          type="button"
          className={styles["comment-post-button"]}
          style={{ backgroundColor: `hsl(${hue}, 40%, 30%)` }}
          disabled={session?.user === undefined}
          onClick={async () => {
            if (input.length === 0) {
              // TODO: error
              return;
            }

            const comment = await createBeatmapSetComment(setId, input);

            if (comment) {
              setComments([comment, ...comments]);
              setInput("");
            } else {
              // TODO: error
            }
          }}
        >
          Submit
        </button>
      </div>
    </div>
  );
}
