import type { NextPage } from "next";
import React from "react";
import { trpc } from "../../utils/trpc";
import { useRouter } from "next/router";
import Error from "next/error";
import { Loading } from "../../components/Loading";
import Link from "next/link";
import { Layout } from "../../components/Layout";
import { Space } from "../../components/Space";
import { WingDisplay } from "../../components/WingDisplay";

const Wing: NextPage = () => {
  const router = useRouter();
  const wingId = router.query.id as string;
  const { data: wing, isLoading } = trpc.useQuery(["getWing", { wingId }]);
  if (isLoading) {
    return <Loading />;
  }
  if (!wing) {
    return <Error statusCode={404} />;
  }
  const { spot } = wing;
  return (
    <Layout>
      <h1>{spot.name}</h1>
      <Space size="sm" />
      <div>
        <Link href={`/spots/${spot.id}`}>
          <button>View spot</button>
        </Link>
      </div>
      <Space size="md" />
      <WingDisplay wing={wing} />
    </Layout>
  );
};

export default Wing;
