import Link from "next/link";
import React from "react";
import { Subtle } from "../styles/text";
import { row, col } from "../styles/utils";
import { Card } from "./Card";
import { ImageDisplay } from "./ImageDisplay";
import { Rating } from "./Rating";
import { Space } from "./Space";
import { RouterOutputs } from "../utils/trpc";

export const WingsDisplay = ({
  wings,
}: {
  wings: RouterOutputs["public"]["getSpot"]["wings"];
}) => {
  const [sort, setSort] = React.useState<"date" | "rating">("rating");
  const [reverse, setReverse] = React.useState(false);
  const sortedWings = wings.sort((a, b) => {
    let value = 0;
    if (sort === "rating") {
      value = b.rating - a.rating;
    }
    if (sort === "date") {
      value = b.createdAt.valueOf() - a.createdAt.valueOf();
    }
    return reverse ? value * -1 : value;
  });
  const numWings = wings.length;
  return (
    <>
      <h3>Sort</h3>
      <Space size="sm" />
      <form>
        <div>
          <label htmlFor="sort">Sort by</label>
          <select
            id="sort"
            value={sort}
            onChange={(e) => setSort(e.target.value as any)}
            name="sort"
            css={`
              min-width: 10ch;
            `}
          >
            <option value="rating">{reverse ? "Worst" : "Best"}</option>
            <option value="date">{reverse ? "Oldest" : "Newest"}</option>
          </select>
        </div>
        <div
          css={`
            ${row}
            white-space: nowrap;
          `}
        >
          <button onClick={() => setReverse((prev) => !prev)} type="button">
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
          <Link href="#results">
            <button
              css={`
                width: 100%;
              `}
            >
              {numWings} Result{numWings !== 1 ? "s" : ""} 👇
            </button>
          </Link>
        </div>
      </form>
      <Space size="sm" />
      <h3 id="results">Results</h3>
      <Space size="sm" />
      {wings && wings.length > 0 ? (
        <div
          css={`
            ${col}
            gap: var(--gap-list);
          `}
        >
          {sortedWings.map((wing) => (
            <Card key={wing.id} id={wing.id}>
              <ImageDisplay imageKeys={wing.images.map((image) => image.key)} />
              <Card.Body>
                <p>{wing.review}</p>
                <Rating displayValue={wing.rating} />
                <div
                  css={`
                    ${row}
                    justify-content: space-between;
                  `}
                >
                  <Subtle>{wing.createdAt.toLocaleDateString()}</Subtle>
                  <Link href={`/wings/${wing.id}`} passHref>
                    <a>🔗</a>
                  </Link>
                </div>
              </Card.Body>
            </Card>
          ))}
        </div>
      ) : (
        <p>There are no wings for this spot...</p>
      )}
    </>
  );
};
