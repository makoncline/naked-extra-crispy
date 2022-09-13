import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { col } from "../styles/utils";

export const Navigation = () => {
  const { data: session } = useSession();
  return (
    <div
      css={`
        display: grid;
        grid-template-columns: 1fr 1fr;
        align-items: center;
        padding-top: var(--size-2);
        padding-bottom: var(--size-7);
        width: 100%;
      `}
    >
      <div
        css={`
          font-weight: var(--font-weight-9);
        `}
      >
        <Link href="/">Naked Extra Crispy</Link>
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
