import type { NextPage } from "next";
import Head from "next/head";
import { useSession } from "next-auth/react";
import React from "react";
import Image from "next/image";
import { trpc } from "../../../utils/trpc";
import { useRouter } from "next/router";
import Error from "next/error";
import { Loading } from "../../../components/Loading";
import Link from "next/link";
import { BackButton } from "../../../components/BackButton";
import { Layout } from "../../../components/Layout";
import { Space } from "../../../components/Space";
import { cardWidth, col, row } from "../../../styles/utils";
import { SpotInfo } from "../../../components/SpotInfo";
import { ImageDisplay } from "../../../components/ImageDisplay";
import { Rating } from "../../../components/Rating";
import { Card } from "../../../components/Card";
import { WingsDisplay } from "../../../components/WingsDisplay";

const Spot: NextPage = () => {
  const router = useRouter();
  const spotId = router.query.id as string;
  const { data: spot, isLoading } = trpc.useQuery(["getSpot", { spotId }]);
  if (isLoading) {
    return <Loading />;
  }
  if (!spot) {
    return <Error statusCode={404} />;
  }
  const { name, wings } = spot;
  return (
    <Layout title={`${name} - Naked Extra Crispy`}>
      <h1>{spot.name}</h1>
      <Space size="md" />
      <Card>
        <ImageDisplay imageKeys={spot.images.map((image) => image.key)} />
        <Card.Body
          css={`
            justify-content: space-between;
          `}
        >
          <div>
            <p>
              {spot.city}, {spot.state}
            </p>
            {spot.numWings > 0 && <p>{spot.numWings.toLocaleString()} wings</p>}
            <Space size="sm" />
            {spot.rating ? (
              <Rating displayValue={spot.rating} />
            ) : (
              <span>🚫 No wings</span>
            )}
          </div>
          <div
            css={`
              ${col}
            `}
          >
            <Link href={`#results`}>
              <button>Show me the wings</button>
            </Link>
            <Link href={`/spots/${spotId}/addWing`}>
              <button>+ Add Wing</button>
            </Link>
          </div>
        </Card.Body>
      </Card>
      <Space size="md" />
      <h2>Wings</h2>
      <Space size="sm" />
      <WingsDisplay wings={wings} />
    </Layout>
  );
};

export default Spot;
