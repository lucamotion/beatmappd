"use client";
import { useState } from "react";
import styles from "./ListItemAddForm.module.css";

export function ListItemAddForm({
  addItem,
}: {
  addItem: (
    id: number,
    type: "beatmapSet" | "beatmap" | "user"
  ) => Promise<void>;
}) {
  const [type, setType] = useState<"beatmapSet" | "beatmap" | "user">(
    "beatmapSet"
  );
  const [id, setID] = useState<string>("");

  return (
    <div className={styles["form"]}>
      <select
        className={styles["type"]}
        defaultValue={type}
        onChange={(e) =>
          setType(e.target.value as "beatmapSet" | "beatmap" | "user")
        }
      >
        <option value="beatmapSet">Beatmap Set</option>
        <option value="beatmap">Beatmap</option>
        <option value="user">User</option>
      </select>
      <input
        className={styles["input"]}
        type="text"
        defaultValue={id}
        placeholder={`${
          type === "beatmapSet"
            ? "Beatmap Set"
            : type === "beatmap"
            ? "Beatmap (difficulty)"
            : type === "user"
            ? "User"
            : "???"
        } ID`}
        onChange={(e) => setID(e.target.value)}
      />
      <button
        className={styles["add-button"]}
        type="button"
        onClick={async () => {
          const parsedId = parseInt(id, 10);

          if (isNaN(parsedId) || parsedId < 1 || parsedId > 2147483647) {
            // TODO: ERROR
            return;
          }

          await addItem(parsedId, type);
        }}
      >
        Add to List
      </button>
    </div>
  );
}
