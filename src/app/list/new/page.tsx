import { ListEditor } from "@/components/list/ListEditor";
import { HeaderImage } from "@/components/shared/HeaderImage";
import { Nav } from "@/components/shared/Nav";
import { nextAuthOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import styles from "./page.module.css";

export default async function ListNewPage() {
  const session = await getServerSession(nextAuthOptions);

  if (!session) {
    return <div>Sign in first</div>;
  }

  return (
    <main className="page">
      <Nav hue={240} />
      <HeaderImage
        imageUrl={"https://osu.ppy.sh/assets/images/default-bg.7594e945.png"}
      />
      <section
        className="page-content"
        style={{ backgroundColor: `hsl(${240}, 10%, 15%)` }}
      >
        <div className={styles["list-page"]}>
          <h1 className={styles["list-name"]}>Create List</h1>
          <ListEditor list={undefined} />
        </div>
      </section>
    </main>
  );
}
