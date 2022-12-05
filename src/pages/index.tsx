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

const Home: NextPage = () => {
  const { data: spots, status } = trpc.useQuery(["getAllSpots"]);
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

export default Home;
