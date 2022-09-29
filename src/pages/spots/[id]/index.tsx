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

const Spot: NextPage = () => {
  const [sort, setSort] = React.useState<"date" | "rating">("rating");
  const [reverse, setReverse] = React.useState(false);
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
  const sortedWings = wings.sort((a, b) => {
    let value: number = 0;
    if (sort === "rating") {
      value = a.rating - b.rating;
    }
    if (sort === "date") {
      value = a.createdAt.valueOf() - b.createdAt.valueOf();
    }
    return reverse ? value * -1 : value;
  });
  return (
    <Layout title={`${name} - Naked Extra Crispy`}>
      <div>
        <BackButton />
        <Card>
          <ImageDisplay imageKeys={spot.images.map((image) => image.key)} />
          <div
            css={`
              padding: var(--card-padding);
            `}
          >
            <SpotInfo spot={spot} />
          </div>
        </Card>
        <Space size="sm" />
        <Link href={`/spots/${spotId}/addWing`}>
          <button>Add Wing</button>
        </Link>
      </div>
      <Space size="md" />
      <div>
        <h2>Wings</h2>
        <Space size="md" />
        <div
          css={`
            ${row}
          `}
        >
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as any)}
            name="sort"
          >
            <option value="rating">{reverse ? "Worst" : "Best"}</option>
            <option value="date">{reverse ? "Oldest" : "Newest"}</option>
          </select>
          <button onClick={() => setReverse((prev) => !prev)}>
            Reverse {reverse ? "▲" : "▼"}
          </button>
          <button
            onClick={() => {
              setSort("rating");
              setReverse(false);
            }}
            type="reset"
          >
            Reset ↺
          </button>
        </div>
        <Space size="md" />
        {wings && wings.length > 0 ? (
          <div
            css={`
              ${col}
              gap: var(--gap-list);
            `}
          >
            {sortedWings.map((wing, i) => (
              <Card key={i}>
                <ImageDisplay
                  imageKeys={wing.images.map((image) => image.key)}
                />
                <div
                  css={`
                    ${col}
                    padding: var(--card-padding);
                  `}
                >
                  <p>{wing.review}</p>
                  <Rating displayValue={wing.rating} />
                  <p
                    css={`
                      color: var(--text-2);
                      font-size: var(--font-size-0);
                    `}
                  >
                    {wing.createdAt.toLocaleDateString()}{" "}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <p>There are no wings for this spot...</p>
        )}
      </div>
    </Layout>
  );
};

export default Spot;
