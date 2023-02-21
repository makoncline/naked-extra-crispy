import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { col } from "../styles/utils";
import logo from "../../public/nxcLogo.webp";
import { Loading } from "./Loading";

export const Navigation = () => {
  const { data: session, status } = useSession();
  const isLoading = status === "loading";
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
              src={logo}
              width={200}
              height={100}
              objectFit="cover"
              alt="Naked Extra Crispy logo"
              priority
              placeholder="blur"
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
        ) : isLoading ? (
          <Loading scale={0.5} />
        ) : (
          <button onClick={() => signIn("google")}>Sign in</button>
        )}
      </div>
    </div>
  );
};
