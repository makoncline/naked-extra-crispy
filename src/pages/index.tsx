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
import { Wrapper } from "@googlemaps/react-wrapper";
import { env } from "../env/client.mjs";

const Home: NextPage = () => {
  const { data: spots, status } = trpc.public.getAllSpots.useQuery();
  const { data: session } = useSession();
  const isLoading = status === "loading";
  return (
    <Wrapper apiKey={env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
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
    </Wrapper>
  );
};

export default Home;
