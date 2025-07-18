"use client";

import { importRatings } from "@/lib/import";
import styles from "./Import.module.css";
import { useState } from "react";

export function ImportButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [importedCount, setImportedCount] = useState<number>();

  return (
    <button
      className={`${styles["button"]} ${isLoading ? styles["loading"] : ""}`}
      onClick={async () => {
        setIsLoading(true);
        const ratingsImported = await importRatings();
        setImportedCount(ratingsImported);
        setIsLoading(false);
      }}
    >
      {isLoading
        ? "Importing..."
        : importedCount !== undefined
        ? `Imported ${importedCount.toLocaleString()} rating${
            importedCount === 1 ? "" : "s"
          }!`
        : "Import OMDB Ratings"}
    </button>
  );
}
