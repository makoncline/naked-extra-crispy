import Link from "next/link";
import React, { ChangeEventHandler } from "react";
import { col } from "../styles/utils";
import { inferQueryOutput } from "../utils/trpc";
import { SelectStateOptions } from "./SelectStateOptions";

type SortOrder = "rating" | "name" | "numWings";

export const SpotsDisplay = ({
  spots,
}: {
  spots: inferQueryOutput<"getAllSpots">;
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
    <>
      <div
        css={`
          ${col}
        `}
      >
        <h3>Filters</h3>
        <input
          type="text"
          placeholder="Name includes..."
          value={nameFilter}
          onChange={(e) => setNameFilter(e.target.value)}
        />
        <select value={stateFilter} onChange={handleSelectState}>
          <option value="">Select a State</option>
          <SelectStateOptions />
        </select>
        <select value={cityFilter} onChange={handleSelectCity}>
          <option value="">Select a City</option>
          <SelectCityOptions />
        </select>
      </div>
      <div>
        <h3>Sort</h3>
        <select value={sortBy} onChange={handleSelectSortOrder}>
          <option value="rating">Rating</option>
          <option value="numWings">Popularity</option>
          <option value="name">Name</option>
        </select>
        <button
          onClick={() => {
            setSortOrder((prev) => !prev);
          }}
        >
          Reverse
        </button>
      </div>
      <button onClick={() => handleReset()}>Reset</button>
      {filteredSpots && filteredSpots.length ? (
        <ul>
          {filteredSpots.map((spot, i) => (
            <li key={i}>
              <article>
                <h3>{spot.name}</h3>
                <p>
                  {spot.city}, {spot.state}
                </p>
                <p>added: {spot.createdAt.toLocaleDateString()} </p>
                <p># wings: {spot.numWings}</p>
                {spot.rating && <p>Rating: {spot.rating}</p>}
                <div
                  css={`
                    ${col}
                  `}
                >
                  <Link href={`/spots/${spot.id}`}>View</Link>
                  <Link href={`/spots/${spot.id}/addWing`}>Add Wing</Link>
                </div>
              </article>
            </li>
          ))}
        </ul>
      ) : (
        <div>
          <p>There are no spots matching this search...</p>
          <button onClick={() => handleReset()}>Reset</button>
        </div>
      )}
    </>
  );
};
