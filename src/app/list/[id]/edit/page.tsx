import { ListEditor } from "@/components/list/ListEditor";
import { HeaderImage } from "@/components/shared/HeaderImage";
import { Nav } from "@/components/shared/Nav";
import { nextAuthOptions } from "@/lib/auth";
import { getList } from "@/lib/database/lists";
import { getServerSession } from "next-auth";
import Head from "next/head";
import styles from "../page.module.css";

export default async function EditListPage({
  params: _params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(nextAuthOptions);
  const params = await _params;
  const list = await getList(parseInt(params.id, 10));

  if (!list) {
    return <div>404</div>;
  }

  if (list.userId !== session?.user.id) {
    return <div>401</div>;
  }

  let coverImage = "https://osu.ppy.sh/assets/images/default-bg.7594e945.png";

  if (list.items[0]) {
    if (list.items[0].type === "user") {
      coverImage = `https://a.ppy.sh/${list.items[0].userId}?0.jpeg`;
    } else if (list.items[0].type === "beatmap") {
      coverImage = `https://assets.ppy.sh/beatmaps/${list.items[0].beatmap.beatmapSetId}/covers/cover.jpg`;
    } else if (list.items[0].type === "beatmapSet") {
      coverImage = `https://assets.ppy.sh/beatmaps/${list.items[0].beatmapSetId}/covers/cover.jpg`;
    }
  }

  return (
    <main className="page">
      <Head>
        <title>Edit List - {list.name} | Beatmappd</title>
      </Head>
      <Nav hue={240} />
      <HeaderImage imageUrl={coverImage} />
      <section
        className="page-content"
        style={{ backgroundColor: `hsl(${240}, 10%, 15%)` }}
      >
        <div className={styles["list-page"]}>
          <h1 className={styles["list-name"]}>Edit List</h1>
          <ListEditor list={list} />
        </div>
      </section>
    </main>
  );
}
