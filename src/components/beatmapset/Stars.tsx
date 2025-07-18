import styles from "./Rater.module.css";

export function Stars({ rating }: { rating: number }) {
  rating = Math.min(10, Math.max(0, rating));

  return (
    <>
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="800"
          height="800"
          fill="none"
          viewBox="0 0 24 24"
          key={star}
          className={`${styles["star"]}`}
        >
          <path
            fill={
              ((rating || 0) / 2 || -0.5) + 0.5 === star
                ? "url(#my-cool-gradient)"
                : ((rating || 0) / 2 || 0) >= star
                ? "#ffff00"
                : "currentColor"
            }
            d="M11.525 3.464a.5.5 0 0 1 .95 0l1.658 5.1a.5.5 0 0 0 .475.346h5.364a.5.5 0 0 1 .294.904l-4.34 3.153a.5.5 0 0 0-.181.559l1.657 5.1a.5.5 0 0 1-.77.56l-4.338-3.153a.5.5 0 0 0-.588 0l-4.339 3.153a.5.5 0 0 1-.77-.56l1.658-5.1a.5.5 0 0 0-.182-.56L3.734 9.815a.5.5 0 0 1 .294-.904h5.364a.5.5 0 0 0 .475-.346z"
          ></path>
        </svg>
      ))}
    </>
  );
}
