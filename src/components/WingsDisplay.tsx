import Link from "next/link";
import React from "react";
import { useRouter } from "next/router";
import { Card } from "./Card";
import { ImageDisplay } from "./ImageDisplay";
import { RouterOutputs } from "../utils/trpc";
import { RatingDisplay } from "./RatingDisplay";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const WingsDisplay = ({
  wings,
  showSpotName = false,
}: {
  wings: RouterOutputs["public"]["getSpot"]["wings"];
  showSpotName?: boolean;
}) => {
  const router = useRouter();
  const sortQuery = Array.isArray(router.query.sort)
    ? router.query.sort[0]
    : router.query.sort;
  const reverseQuery = Array.isArray(router.query.reverse)
    ? router.query.reverse[0]
    : router.query.reverse;
  const showQuery = Array.isArray(router.query.show)
    ? router.query.show[0]
    : router.query.show;

  const sort: "date" | "rating" = sortQuery === "rating" ? "rating" : "date";
  const reverse = reverseQuery === "1" || reverseQuery === "true";
  const parsedShow = Number(showQuery);
  const show = Number.isFinite(parsedShow) && parsedShow > 0 ? parsedShow : 10;

  const setUrlState = React.useCallback(
    (next: Partial<{ sort: "date" | "rating"; reverse: boolean; show: number }>) => {
      const nextSort = next.sort ?? sort;
      const nextReverse = next.reverse ?? reverse;
      const nextShow = next.show ?? show;
      const nextQuery = { ...router.query };

      if (nextSort === "date") {
        delete nextQuery.sort;
      } else {
        nextQuery.sort = nextSort;
      }

      if (!nextReverse) {
        delete nextQuery.reverse;
      } else {
        nextQuery.reverse = "1";
      }

      if (nextShow <= 10) {
        delete nextQuery.show;
      } else {
        nextQuery.show = String(nextShow);
      }

      void router.replace(
        {
          query: nextQuery,
        },
        undefined,
        { shallow: true, scroll: false }
      );
    },
    [reverse, router, show, sort]
  );

  const sortedWings = [...wings]
    .sort((a, b) => {
      let value = 0;
      if (sort === "rating") {
        value = b.rating - a.rating;
      }
      if (sort === "date") {
        value = b.createdAt.valueOf() - a.createdAt.valueOf();
      }
      return reverse ? value * -1 : value;
    })
    .slice(0, show);
  const numWings = wings.length;

  const handleShowMore = () => {
    setUrlState({ show: show + 10 });
  };
  return (
    <>
      <h3 className="text-xl font-semibold">Sort</h3>
      <div className="h-4" />
      <form className="grid w-full max-w-md gap-4">
        <div className="grid gap-2">
          <Label htmlFor="sort">Sort by</Label>
          <Select
            value={sort}
            onValueChange={(value) => setUrlState({ sort: value as "date" | "rating" })}
            name="sort"
          >
            <SelectTrigger id="sort" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rating">{reverse ? "Worst" : "Best"}</SelectItem>
              <SelectItem value="date">{reverse ? "Oldest" : "Newest"}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-wrap gap-2 whitespace-nowrap">
          <Button
            onClick={() => setUrlState({ reverse: !reverse })}
            type="button"
            variant="secondary"
          >
            Reverse {reverse ? "▲" : "▼"}
          </Button>
          <Button
            onClick={() => {
              setUrlState({ sort: "rating", reverse: false });
            }}
            type="reset"
            variant="destructive"
          >
            Reset ↺
          </Button>
          <Button asChild>
            <Link href="#results">
              {numWings} Result{numWings !== 1 ? "s" : ""} 👇
            </Link>
          </Button>
        </div>
      </form>
      <div className="h-4" />
      <h3 id="results" className="scroll-mt-24 text-xl font-semibold">
        Results
      </h3>
      <div className="h-4" />
      {wings && wings.length > 0 ? (
        <div className="grid gap-4">
          {sortedWings.map((wing) => (
            <Card key={wing.id} id={wing.id}>
              <ImageDisplay imageKeys={wing.images.map((image) => image.key)} />
              <Card.Body>
                {showSpotName && (
                  <div className="grid gap-4">
                    <div>
                      <h4 className="text-lg font-semibold">{wing.spot.name}</h4>
                      <div className="flex flex-wrap items-center gap-3">
                        <p className="text-muted-foreground">
                          {wing.spot.city}, {wing.spot.state}
                        </p>
                        {wing.spot.place && (
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${wing.spot.place.name}&query_place_id=${wing.spot.place.id}`}
                            target="_blank"
                            rel="noreferrer"
                            aria-label={`Open ${wing.spot.name} in Google Maps`}
                          >
                            📍
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                <p>{wing.review}</p>
                <RatingDisplay rating={wing.rating} />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {wing.createdAt.toLocaleDateString()}
                  </span>
                  <Link href={`/wings/${wing.id}`} aria-label="View rating permalink">
                    🔗
                  </Link>
                </div>
              </Card.Body>
            </Card>
          ))}
        </div>
      ) : (
        <p>There are no ratings for this spot…</p>
      )}
      <div className="h-4" />
      <Button onClick={handleShowMore}>Show More</Button>
    </>
  );
};
