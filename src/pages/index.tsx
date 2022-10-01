import type { NextPage } from "next";
import { trpc } from "../utils/trpc";
import React from "react";
import { SpotsDisplay } from "../components/SpotsDisplay";
import { Layout } from "../components/Layout";
import { Hero } from "../components/Hero";
import { Space } from "../components/Space";

const Home: NextPage = () => {
  const { data: spots } = trpc.useQuery(["getAllSpots"]);
  return (
    <Layout>
      <Hero />
      <Space size="md" />
      <SpotsDisplay spots={spots} />
    </Layout>
  );
};

export default Home;
