import Link from "next/link";
import React, { ChangeEventHandler } from "react";
import { col } from "../styles/utils";
import { inferQueryOutput } from "../utils/trpc";
import { SelectStateOptions } from "./SelectStateOptions";
import { row } from "../styles/utils";
import Image from "next/image";
import { Rating } from "./Rating";
import { above } from "../styles/breakpoints";
import { Space } from "./Space";
import { ImageDisplay } from "./ImageDisplay";

type SortOrder = "rating" | "name" | "numWings";

export const SpotsDisplay = ({
  spots = [],
}: {
  spots?: inferQueryOutput<"getAllSpots">;
}) => {
  const [nameFilter, setNameFilter] = React.useState<string>("");
  const [stateFilter, setStateFilter] = React.useState<string>("");
  const [cityFilter, setCityFilter] = React.useState<string>("");
  const [sortBy, setSortBy] = React.useState<SortOrder>("rating");
  const [sortOrder, setSortOrder] = React.useState(true);
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
    setSortOrder(true);
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
      let a = spotA[sortBy] || 0;
      let b = spotB[sortBy] || 0;
      if (sortBy === "name") {
        a = (a as string).toLowerCase();
        b = (b as string).toLowerCase();
      }
      const result = a < b ? 1 : -1;
      return sortOrder ? result : result * -1;
    });
  const SelectCityOptions = () => (
    <>
      {filteredSpots
        .map((spot) => spot.city)
        .sort()
        .map((city, i) => (
          <option value={city} key={i}>
            {city}
          </option>
        ))}
    </>
  );
  return (
    <div>
      <h2 id="spots">Spots</h2>
      <Space size="md" />
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
              <option value="rating">Rating</option>
              <option value="numWings">Popularity</option>
              <option value="name">Name</option>
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
                setSortOrder((prev) => !prev);
              }}
            >
              Reverse {sortOrder ? "▲" : "▼"}
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
                Results 👇
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
              gap: var(--gap-list);
            `}
          >
            {filteredSpots.map((spot, i) => (
              <Link href={`/spots/${spot.id}`} key={i}>
                <article
                  css={`
                    display: grid;
                    &:hover {
                      background-color: rgba(255, 255, 255, 0.01);
                      cursor: pointer;
                    }
                    max-width: 400px;
                    ${above["md"]`
                      max-width: unset;
                      grid-template-columns: 1fr 1fr;
                    `}
                  `}
                >
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
                    <div
                      css={`
                        ${col}
                        gap: var(--gap-list);
                      `}
                    >
                      <div>
                        <h4>{spot.name}</h4>
                        <p>
                          {spot.city}, {spot.state}
                        </p>
                        <p>{spot.numWings.toLocaleString()} wings</p>
                      </div>
                      {spot.rating ? (
                        <Rating displayValue={spot.rating} />
                      ) : (
                        <span>🚫 No wings</span>
                      )}
                    </div>
                    <Link href={`/spots/${spot.id}/addWing`}>
                      <button>+ Add wing</button>
                    </Link>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        ) : (
          <div>
            <p>There are no spots matching this search...</p>
            <Link href="/spots/add">
              <button>Add a spot</button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
