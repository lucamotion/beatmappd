"use client";
import { useState } from "react";
import styles from "./NewListForm.module.css";
import { createList } from "@/lib/database/lists";
import { useRouter } from "next/navigation";

export function NewListForm() {
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [isPublic, setIsPublic] = useState<boolean>(true);

  const router = useRouter();

  return (
    <div className={styles["form"]}>
      <input
        type="text"
        defaultValue={name}
        placeholder="List Name"
        onChange={(e) => setName(e.target.value)}
      />
      <input
        type="text"
        defaultValue={description}
        placeholder="Some information about your list (optional)"
        onChange={(e) => setDescription(e.target.value)}
      />
      <input
        type="checkbox"
        defaultChecked={isPublic}
        onChange={(e) => setIsPublic(e.target.checked)}
      />
      <button
        type="button"
        onClick={async () => {
          const list = await createList({
            name,
            description: description === "" ? undefined : description,
            isPublic,
          });

          if (list) {
            router.push(`/list/${list.id}`);
          } else {
            //TODO: error
          }
        }}
      >
        Create List
      </button>
    </div>
  );
}
