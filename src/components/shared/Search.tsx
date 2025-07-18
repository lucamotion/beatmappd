"use client";

import { useRouter } from "next/navigation";
import styles from "./Search.module.css";
import { useEffect, useState } from "react";
import { siteSearch } from "@/lib/database/shared";
import Link from "next/link";
import { Image } from "./Image";

export function Search() {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    users: { id: number; username: string }[];
    maps: { id: number; setId: number; name: string }[];
  }>();
  const router = useRouter();

  useEffect(() => {
    if (search.length > 0) {
      const timeout = setTimeout(async () => {
        const results = await siteSearch(search);
        setResults(results);
        setLoading(false);
      }, 250);

      return () => clearTimeout(timeout);
    }
  }, [search]);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        router.push(`/search?q=${encodeURIComponent(search)}`);
      }}
      className={styles["form"]}
    >
      <input
        type="text"
        value={search}
        onChange={(e) => {
          setLoading(true);
          setSearch(e.target.value);
        }}
        placeholder="Search Beatmappd (or paste a link)"
        className={styles["search"]}
      />
      {search.length > 0 ? (
        <div className={styles["results"]}>
          <div className={styles["result-heading"]}>Users</div>
          {!loading && results && results.users.length > 0 ? (
            <div className={styles["container"]}>
              {results.users.map((user) => (
                <Link
                  href={`/user/${user.id}`}
                  key={user.id}
                  className={styles["result"]}
                >
                  <Image
                    src={`https://a.ppy.sh/${user.id}?0.jpeg`}
                    alt="Profile picture"
                    height={36}
                    width={36}
                    className={styles["image"]}
                  />
                  {user.username}
                </Link>
              ))}
            </div>
          ) : loading ? (
            <p className={styles["not-found"]}>Loading...</p>
          ) : (
            <p className={styles["not-found"]}>No users found.</p>
          )}
          <div className={styles["result-heading"]}>Maps</div>
          {!loading && results && results.maps.length > 0 ? (
            <div className={styles["container"]}>
              {results.maps.map((map) => (
                <Link
                  href={`/set/${map.setId}`}
                  key={map.id}
                  className={styles["result"]}
                >
                  <Image
                    src={`https://assets.ppy.sh/beatmaps/${map.setId}/covers/list.jpg`}
                    fallback={
                      "https://osu.ppy.sh/assets/images/default-bg.7594e945.png"
                    }
                    alt={`Beatmap image`}
                    objectFit="cover"
                    fill
                    height={36}
                    width={36}
                    className={styles["image"]}
                  />
                  {map.name}
                </Link>
              ))}
            </div>
          ) : loading ? (
            <p className={styles["not-found"]}>Loading...</p>
          ) : (
            <p className={styles["not-found"]}>No users found.</p>
          )}
        </div>
      ) : null}
    </form>
  );
}
