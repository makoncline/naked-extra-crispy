import type { NextPage } from "next";
import { trpc } from "../utils/trpc";
import React from "react";
import { Layout } from "../components/Layout";
import { Space } from "../components/Space";
import { Loading } from "../components/Loading";

import { createProxySSGHelpers } from "@trpc/react-query/ssg";
import { createContextInner } from "../server/trpc/context";
import { appRouter } from "../server/trpc/router/_app";
import superjson from "superjson";
import { MapDisplay } from "../components/MapDisplay";

const Map: NextPage = () => {
  const { data: spots, status } = trpc.public.getAllSpots.useQuery();
  const isLoading = status === "loading";
  return (
    <Layout>
      <h1>Wing Map</h1>
      <Space size="sm" />
      {isLoading ? <Loading /> : <MapDisplay spots={spots} />}
    </Layout>
  );
};

export async function getStaticProps() {
  const ssg = createProxySSGHelpers({
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

export default Map;
