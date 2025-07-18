import styles from "./HeaderImage.module.css";

export function HeaderImage({ imageUrl }: { imageUrl: string }) {
  return (
    <section className={styles["header"]}>
      <div
        className={styles["header-image"]}
        style={{
          backgroundImage: `url(${imageUrl})`,
          backgroundSize: "200%",
          backgroundPosition: "center",
        }}
      />
    </section>
  );
}
