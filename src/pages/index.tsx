import type { NextPage } from "next";
import Head from "next/head";
import { trpc } from "../utils/trpc";
import { signIn, signOut, useSession } from "next-auth/react";
import React from "react";
import Image from "next/image";
import { siteConfig } from "../siteConfig";
import Link from "next/link";
import { col } from "../styles/utils";
import { SpotsDisplay } from "../components/SpotsDisplay";

const Home: NextPage = () => {
  const [spotId, setSpotId] = React.useState<string>("");
  const { data: session } = useSession();
  const { data: spots } = trpc.useQuery(["getAllSpots"]);
  const { title, description } = siteConfig;
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div>
        {/* <h1>{title}</h1> */}
        {session ? (
          <>
            Signed in as {session.user?.email} <br />
            <button onClick={() => signOut()}>Sign out</button>
          </>
        ) : (
          <button onClick={() => signIn()}>Sign in</button>
        )}
      </div>
      {session?.user && <Link href="spots/add">Add Spot</Link>}
      <div>
        <h2>Spots</h2>
        {spots && spots.length ? (
          <SpotsDisplay spots={spots} />
        ) : (
          <p>There are no spots...</p>
        )}
      </div>
    </>
  );
};

export default Home;
