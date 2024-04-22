import type { NextPage } from "next";
import { trpc } from "../utils/trpc";
import React from "react";
import { SpotsDisplay } from "../components/SpotsDisplay";
import { Layout } from "../components/Layout";
import { Hero } from "../components/Hero";
import { Space } from "../components/Space";
import { Loading } from "../components/Loading";
import { Contact } from "../components/Contact";
import { useSession } from "next-auth/react";

import { createServerSideHelpers } from "@trpc/react-query/server";
import { createContextInner } from "../server/trpc/context";
import { appRouter } from "../server/trpc/router/_app";
import superjson from "superjson";

const Home: NextPage = () => {
  const { data: spots, status } = trpc.public.getAllSpots.useQuery();
  const { data: session } = useSession();
  const isLoading = status === "loading";
  return (
    <Layout>
      <Hero />
      <Space size="md" />
      <div>
        <h2>Spots</h2>
        <Space size="md" />
        {isLoading ? <Loading /> : <SpotsDisplay spots={spots} />}
      </div>
      <Space size="lg" />
      <Contact userEmail={session?.user?.email || undefined} />
    </Layout>
  );
};

export async function getStaticProps() {
  const ssg = createServerSideHelpers({
    router: appRouter,
    ctx: await createContextInner({ session: null }),
    transformer: superjson,
  });
  await ssg.public.getAllSpots.prefetch();
  return {
    props: {
      trpcState: ssg.dehydrate(),
    },
    revalidate: 1,
  };
}

export default Home;
