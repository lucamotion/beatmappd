import { getServerSession } from "next-auth";
import styles from "./Nav.module.css";
import { nextAuthOptions } from "@/lib/auth";
import Link from "next/link";
import Image from "next/image";
import { Search } from "./Search";

export async function Nav({
  hue,
  bgColor,
  linkColor,
}: {
  hue?: number;
  bgColor?: string;
  linkColor?: string;
}) {
  hue = hue;

  bgColor = bgColor || `hsl(${hue}, 10%, 15%)`;
  linkColor = linkColor || `hsl(${hue}, 75%, 80%)`;

  const session = await getServerSession(nextAuthOptions);
  return (
    <nav className={styles["navbar"]} style={{ backgroundColor: bgColor }}>
      <div className={styles["navbar-content"]}>
        <Link
          href="/"
          className={styles["site-name"]}
          style={{ color: linkColor }}
        >
          Beatmappd
        </Link>

        <div className={styles["user-info"]}>
          <span className={styles["feedback"]}>
            Feedback? Join the{" "}
            <a
              href="https://discord.gg/7UJRMFUv8u"
              style={{ color: linkColor }}
              className={styles["link"]}
            >
              Discord
            </a>
            ! Beatmappd is a WIP.
          </span>
          <Search />
          {session ? (
            <>
              <Link
                href={`/user/${session.user.id}`}
                style={{ color: linkColor }}
                className={styles["link"]}
              >
                {session.user.name}
              </Link>
              <Link
                href={`/user/${session.user.id}`}
                style={{ color: linkColor, height: "40px" }}
                className={styles["link"]}
              >
                <Image
                  src={`https://a.ppy.sh/${session.user.id}?0.jpeg`}
                  height={40}
                  width={40}
                  alt={"Your profile picture"}
                  className={styles["profile-picture"]}
                />
              </Link>
            </>
          ) : (
            <>
              <Link
                href={"/api/auth/signin"}
                style={{ color: `hsl(${hue}, 75%, 80%)` }}
                className={styles["link"]}
              >
                log in with osu!
              </Link>
              <Link
                href={"/api/auth/signin"}
                style={{ color: `hsl(${hue}, 75%, 80%)` }}
                className={styles["link"]}
              >
                <Image
                  src={`https://a.ppy.sh/-1?0.jpeg`}
                  height={48}
                  width={48}
                  alt={"Your profile picture"}
                  className={styles["profile-picture"]}
                />
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
