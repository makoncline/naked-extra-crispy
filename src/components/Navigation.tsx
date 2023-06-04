import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { col, row } from "../styles/utils";
import { Loading } from "./Loading";
import { DrumSvg } from "./DrumSvg";
import { useRouter } from "next/router";

export const Navigation = () => {
  const router = useRouter();
  const showLogoText = router.pathname !== "/";
  const { data: session, status } = useSession();
  const isLoading = status === "loading";
  return (
    <div
      css={`
        display: grid;
        grid-template-columns: auto 1fr;
        padding-top: var(--size-2);
        width: 100%;
      `}
    >
      <div
        css={`
          ${row}
          align-items: center;
          gap: var(--space-sm);
          @media (max-width: 420px) {
            ${col}
            align-items: flex-start;
          }
        `}
      >
        <Link href="/" passHref>
          <a>
            <div
              css={`
                ${row}
                align-items: center;
              `}
            >
              <DrumSvg />
              {showLogoText && (
                <div
                  css={`
                    ${col}
                    gap: 0;
                    color: var(--text-2);
                    line-height: 1;
                  `}
                >
                  <span
                    css={`
                      font-size: var(--font-size-4);
                      font-weight: var(--font-weight-9);
                    `}
                  >
                    Naked
                  </span>
                  <span
                    css={`
                      font-size: var(--font-size-0);
                      font-weight: var(--font-weight-8);
                    `}
                  >
                    Extra Crispy
                  </span>
                </div>
              )}
            </div>
          </a>
        </Link>
        <div
          css={`
            ${row}
          `}
        >
          <Link href="/spots" passHref>
            <a
              css={`
                color: var(--text-2);
                text-decoration: ${router.pathname === "/spots"
                  ? "underline"
                  : "none"};
              `}
            >
              Spots
            </a>
          </Link>

          {/* 
          disabled because this is crashing on mobile. need to paginate the query
          <Link href="/ratings" passHref>
            <a
              css={`
                color: var(--text-2);
                text-decoration: ${router.pathname === "/ratings"
                  ? "underline"
                  : "none"};
              `}
            >
              Ratings
            </a>
          </Link> */}
          <Link href="/map" passHref>
            <a
              css={`
                color: var(--text-2);
                text-decoration: ${router.pathname === "/map"
                  ? "underline"
                  : "none"};
              `}
            >
              Map
            </a>
          </Link>
        </div>
      </div>
      <div
        css={`
          justify-self: end;
          ${col}
          align-items: flex-end;
        `}
      >
        {session ? (
          <>
            {session.user?.email} <br />
            <a onClick={() => signOut()} href="#">
              Sign out
            </a>
          </>
        ) : isLoading ? (
          <Loading scale={0.5} />
        ) : (
          <button onClick={() => signIn("google")}>Sign in</button>
        )}
      </div>
    </div>
  );
};
