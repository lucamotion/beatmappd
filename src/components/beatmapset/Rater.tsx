"use client";
import { rateBeatmap } from "@/lib/database/beatmaps";
import styles from "./Rater.module.css";
import { useRef, useState } from "react";

export function Rater({
  mapId,
  userRating,
}: {
  mapId: number;
  userRating?: number;
}) {
  const [rating, setRating] = useState(userRating);
  const ref = useRef<Map<number, SVGSVGElement>>(new Map());
  const [hoveredStar, setHoveredStar] = useState<number | null>();
  const [hoveredRating, setHoveredRating] = useState<number | null>();

  const starElements = [0, 1, 2, 3, 4, 5].map((star) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="800"
      height="800"
      fill="none"
      viewBox="0 0 24 24"
      key={star}
      className={`${styles["star"]}`}
      style={{ cursor: "pointer" }}
      onPointerMove={(e) => {
        setHoveredStar(star);

        const current = ref.current.get(star);

        if (!current) {
          return;
        }

        const rect = current.getBoundingClientRect();
        const relativeX = e.clientX - rect.x;

        console.log(star, relativeX);
        if (star === 0) {
          if (relativeX < rect.width / 2) {
            setHoveredRating(null);
          } else {
            setHoveredRating(0);
          }
        } else if (relativeX < 0) {
          setHoveredRating(star);
        } else if (relativeX >= rect.width) {
          setHoveredRating(Math.max(0, star - 0.5));
        } else {
          setHoveredRating(
            Math.max(0, star - (relativeX < rect.width / 2 ? 0.5 : 0))
          );
        }
      }}
      ref={(node) => {
        ref.current.set(star, node!);
        return () => {
          ref.current.delete(star);
        };
      }}
      onClick={async (e) => {
        const current = ref.current.get(star);
        if (!current) {
          return;
        }

        let fixedHoveredRating = hoveredRating;

        if (fixedHoveredRating === undefined) {
          const rect = current.getBoundingClientRect();
          const relativeX = e.clientX - rect.x;

          if (star === 0) {
            if (relativeX < rect.width / 2) {
              fixedHoveredRating = null;
            } else {
              fixedHoveredRating = 0;
            }
          } else if (relativeX < 0) {
            fixedHoveredRating = star;
          } else if (relativeX >= rect.width) {
            fixedHoveredRating = Math.max(0, star - 0.5);
          } else {
            fixedHoveredRating = Math.max(
              0,
              star - (relativeX < rect.width / 2 ? 0.5 : 0)
            );
          }
        }

        const rating = await rateBeatmap(
          mapId,
          fixedHoveredRating === null ? null : fixedHoveredRating * 2
        );
        setRating(rating?.rating);
      }}
    >
      <path
        fill={
          star === 0
            ? "rgba(0, 0, 0, 0)"
            : hoveredRating !== undefined && hoveredStar !== undefined
            ? (hoveredRating || 0) + 0.5 === star
              ? "url(#my-cool-gradient)"
              : (hoveredStar || 0) >= star
              ? "#ffff00"
              : "currentColor"
            : rating !== undefined
            ? ((rating || 0) / 2 || -0.5) + 0.5 === star
              ? "url(#my-cool-gradient)"
              : ((rating || 0) / 2 || 0) >= star
              ? "#ffff00"
              : "currentColor"
            : "currentColor"
        }
        d="M11.525 3.464a.5.5 0 0 1 .95 0l1.658 5.1a.5.5 0 0 0 .475.346h5.364a.5.5 0 0 1 .294.904l-4.34 3.153a.5.5 0 0 0-.181.559l1.657 5.1a.5.5 0 0 1-.77.56l-4.338-3.153a.5.5 0 0 0-.588 0l-4.339 3.153a.5.5 0 0 1-.77-.56l1.658-5.1a.5.5 0 0 0-.182-.56L3.734 9.815a.5.5 0 0 1 .294-.904h5.364a.5.5 0 0 0 .475-.346z"
      ></path>
    </svg>
  ));

  return (
    <div className={styles["container"]}>
      <p className={styles["rating-number"]}>
        {hoveredRating === null
          ? "-"
          : hoveredRating !== undefined
          ? hoveredRating
          : userRating !== undefined
          ? userRating / 2
          : undefined}
      </p>
      <div
        className={styles["rating-container"]}
        onPointerLeave={() => {
          setHoveredStar(undefined);
          setHoveredRating(undefined);
        }}
      >
        <svg
          style={{ width: 0, height: 0, position: "absolute" }}
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
        {starElements}
      </div>
    </div>
  );
}
