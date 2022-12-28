import Link from "next/link";
import React, { ChangeEventHandler } from "react";
import { col } from "../styles/utils";
import { SelectStateOptions } from "./SelectStateOptions";
import { row } from "../styles/utils";
import { Space } from "./Space";
import { ImageDisplay } from "./ImageDisplay";
import { SpotInfo } from "./SpotInfo";
import { Card } from "./Card";
import { RouterOutputs } from "../utils/trpc";

type SortOrder = "rating" | "name" | "numWings";

export const SpotsDisplay = ({
  spots = [],
}: {
  spots?: RouterOutputs["public"]["getAllSpots"];
}) => {
  const [nameFilter, setNameFilter] = React.useState<string>("");
  const [stateFilter, setStateFilter] = React.useState<string>("");
  const [cityFilter, setCityFilter] = React.useState<string>("");
  const [sortBy, setSortBy] = React.useState<SortOrder>("rating");
  const [reverse, setReverse] = React.useState(true);
  const handleSelectState: ChangeEventHandler<HTMLSelectElement> = (e) => {
    setStateFilter(e.target.value);
  };
  const handleSelectCity: ChangeEventHandler<HTMLSelectElement> = (e) => {
    setCityFilter(e.target.value);
  };
  const handleSelectSortOrder: ChangeEventHandler<HTMLSelectElement> = (e) => {
    setSortBy(e.target.value as SortOrder);
  };
  const handleReset = () => {
    setNameFilter("");
    setStateFilter("");
    setCityFilter("");
    setSortBy("rating");
    setReverse(true);
  };
  const filteredSpots = spots
    .filter((spot) =>
      nameFilter
        ? spot.name.toLowerCase().includes(nameFilter.toLowerCase())
        : true
    )
    .filter((spot) => (stateFilter ? spot.state === stateFilter : true))
    .filter((spot) => (cityFilter ? spot.city === cityFilter : true))
    .sort((spotA, spotB) => {
      let result = 0;
      if (sortBy === "rating") {
        result = spotA.rating > spotB.rating ? -1 : 1;
      } else if (sortBy === "name") {
        result = spotA.name > spotB.name ? 1 : -1;
      } else if (sortBy === "numWings") {
        result = spotA.numWings > spotB.numWings ? -1 : 1;
      }
      return reverse ? result : result * -1;
    });
  const numFilteredSpots = filteredSpots.length;
  const SelectCityOptions = () => (
    <>
      {Array.from(new Set(spots.map((spot) => spot.city.trim())))
        .sort()
        .map((city, i) => (
          <option value={city} key={i}>
            {city}
          </option>
        ))}
    </>
  );
  return (
    <>
      <div>
        <h3>Search</h3>
        <Space size="sm" />
        <form>
          <div>
            <label htmlFor="name">Name</label>
            <input
              id="name"
              type="text"
              placeholder="What's it called?"
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              autoComplete="off"
            />
          </div>
          <div>
            <label htmlFor="state">State</label>
            <select id="state" value={stateFilter} onChange={handleSelectState}>
              <option value="">Pick a state</option>
              <SelectStateOptions />
            </select>
          </div>
          <div>
            <label htmlFor="city">City</label>
            <select id="city" value={cityFilter} onChange={handleSelectCity}>
              <option value="">Select a city</option>
              <SelectCityOptions />
            </select>
          </div>
          <div>
            <label htmlFor="sort">Sort by</label>
            <select id="sort" value={sortBy} onChange={handleSelectSortOrder}>
              <option value="rating">{reverse ? "Best" : "Worst"}</option>
              <option value="numWings">
                {reverse ? "Most Popular" : "Least Popular"}
              </option>
              <option value="name">
                Name ({reverse ? "A to Z" : "Z to A"})
              </option>
            </select>
          </div>
          <div
            css={`
              ${row}
              white-space: nowrap;
            `}
          >
            <button
              type="button"
              onClick={() => {
                setReverse((prev) => !prev);
              }}
            >
              Reverse {reverse ? "▲" : "▼"}
            </button>
            <button type="reset" onClick={() => handleReset()}>
              Reset ↺
            </button>
            <Link href="#results">
              <button
                css={`
                  width: 100%;
                `}
              >
                {numFilteredSpots} Result{numFilteredSpots !== 1 ? "s" : ""} 👇
              </button>
            </Link>
          </div>
        </form>
      </div>
      <Space size="md" />
      <div
        id="results"
        css={`
          min-height: 100vh;
        `}
      >
        <h3>Results</h3>
        <Space size="sm" />
        {filteredSpots && filteredSpots.length ? (
          <div
            css={`
              ${col}
              align-items: flex-start;
              gap: var(--gap-list);
            `}
          >
            {filteredSpots.map((spot) => (
              <div key={spot.id}>
                <Card>
                  <ImageDisplay
                    imageKeys={spot.images.map((image) => image.key)}
                  />
                  <div
                    css={`
                      ${col}
                      gap: var(--gap-list);
                      justify-content: space-between;
                      padding: var(--card-padding);
                    `}
                  >
                    <SpotInfo spot={spot} />
                    <div
                      css={`
                        ${row}
                      `}
                    >
                      <Link href={`/spots/${spot.id}`}>
                        <button>View</button>
                      </Link>
                      <Link href={`/spots/${spot.id}/addWing`}>
                        <button>+ Add wing</button>
                      </Link>
                    </div>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        ) : (
          <div>
            <p>There are no spots matching this search...</p>
            <Space size="sm" />
            <Link href="/spots/add">
              <button>Add a spot</button>
            </Link>
          </div>
        )}
      </div>
    </>
  );
};
