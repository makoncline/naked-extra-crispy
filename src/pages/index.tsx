import type { NextPage } from "next";
import { trpc } from "../utils/trpc";
import React from "react";
import { SpotsDisplay } from "../components/SpotsDisplay";
import { Layout } from "../components/Layout";
import { Hero } from "../components/Hero";
import Link from "next/link";

const Home: NextPage = () => {
  const { data: spots } = trpc.useQuery(["getAllSpots"]);
  return (
    <Layout>
      <Hero />
      <div
        id="spots"
        css={`
          width: 100%;
        `}
      >
        <SpotsDisplay spots={spots} />
      </div>
    </Layout>
  );
};

export default Home;
