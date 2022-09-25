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
import { row } from "../../../styles/utils";

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
        <h1>{name}</h1>
        <Space size="sm" />
        <p>
          {spot.city}, {spot.state}
        </p>
        <p>added: {spot.createdAt.toLocaleDateString()} </p>
        <p># wings: {spot.numWings}</p>
        {spot.rating && <p>Rating: {spot.rating}</p>}
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
          <button onClick={() => setReverse((prev) => !prev)}>Reverse</button>
          <button
            onClick={() => {
              setSort("rating");
              setReverse(false);
            }}
          >
            Reset
          </button>
        </div>
        <Space size="md" />
        {wings && wings.length > 0 ? (
          <ul>
            {sortedWings.map((wing, i) => (
              <li key={i}>
                <article>
                  <p>added: {wing.createdAt.toLocaleDateString()} </p>
                  <p>rating: {wing.rating}</p>
                  <p>{wing.review}</p>
                  {wing.images.length > 0 &&
                    wing.images.map((image, i) => {
                      return (
                        <>
                          <p>{image.type}</p>
                          <Image
                            src={image.key}
                            alt={`${image.type}`}
                            width={300}
                            height={300}
                            objectFit="cover"
                            key={i}
                          />
                        </>
                      );
                    })}
                </article>
              </li>
            ))}
          </ul>
        ) : (
          <p>There are no wings for this spot...</p>
        )}
      </div>
    </Layout>
  );
};

export default Spot;
