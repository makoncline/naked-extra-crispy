import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { col } from "../styles/utils";
import { local } from "../lib/loaders";

export const Navigation = () => {
  const { data: session } = useSession();
  return (
    <div
      css={`
        display: grid;
        grid-template-columns: 1fr 1fr;
        align-items: center;
        padding-top: var(--size-2);
        width: 100%;
      `}
    >
      <div
        css={`
          font-weight: var(--font-weight-9);
        `}
      >
        <Link href="/" passHref>
          <a>
            <Image
              src="/nxcLogo.webp"
              loader={local}
              width={200}
              height={100}
              objectFit="cover"
              alt="Naked Extra Crispy logo"
            />
          </a>
        </Link>
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
        ) : (
          <button onClick={() => signIn()}>Sign in</button>
        )}
      </div>
    </div>
  );
};
