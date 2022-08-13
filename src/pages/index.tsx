import type { NextPage } from "next";
import Head from "next/head";
import { trpc } from "../utils/trpc";

const Home: NextPage = () => {
  const { data, isLoading } = trpc.useQuery([
    "example.hello",
    { text: "from tRPC" },
  ]);

  return (
    <>
      <Head>
        <title>Naked Extra Crispy</title>
        <meta name="description" content="A site for crispy wing enthusiasts" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div>
        <h1>Naked Extra Crispy</h1>
      </div>
    </>
  );
};

export default Home;
