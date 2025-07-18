import { BeatmapRating } from "@prisma/client";
import styles from "./UserRatingSpread.module.css";

export function UserRatingSpread({ ratings }: { ratings: BeatmapRating[] }) {
  const ratingCounts: { [key: number]: number } = {
    0: 0,
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0,
    7: 0,
    8: 0,
    9: 0,
    10: 0,
  };

  for (const rating of ratings) {
    ratingCounts[`${rating.rating}`]++;
  }

  const highestRatingCount = Object.entries(ratingCounts).sort(
    (a, b) => b[1] - a[1]
  )[0][1];

  return (
    <div className={styles["rating-spread-list"]}>
      {Object.keys(ratingCounts)
        .reverse()
        .map((rating) => {
          const numericRating = parseInt(rating, 10);
          const widthPercent =
            (ratings.filter((userRating) => userRating.rating === numericRating)
              .length /
              (highestRatingCount || 1)) *
            100;

          return (
            <div key={rating} className={styles["rating-spread-item"]}>
              <span>{(numericRating / 2).toFixed(1)}</span>{" "}
              <div className={styles["rating-bar-container"]}>
                <div
                  style={{
                    width: `${widthPercent}%`,
                    color: widthPercent < 10 ? "#ffffff" : undefined,
                  }}
                  className={styles["rating-bar"]}
                >
                  <span
                    style={{
                      position: "absolute",
                      right: widthPercent < 10 ? "-0.75rem" : "0.25rem",
                      top: "1px",
                    }}
                  >
                    {
                      ratings.filter(
                        (userRating) => userRating.rating === numericRating
                      ).length
                    }
                  </span>
                </div>
              </div>
            </div>
          );
        })}
    </div>
  );
}
