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
import { getDistance } from "geolib";
import { useUserLocation } from "../hooks/useUserLocation";
import { convertMetersToMiles, formatDistance } from "../lib/distance";
import { Error } from "../styles/text";
import { SpotMap } from "./SpotMap";
import { ScrollToElement, scrollToId } from "./ScrollToElement";
import {
  GoogleMapsApiProvider,
  useGoogleMapsApi,
} from "./GoogleMapsApiProvider";
import { useRouter } from "next/router";
import { SpotAutocomplete } from "./SpotAutocomplete";
import mapPlaceholder from "../../public/map-placeholder.webp";
import Image from "next/image";

type SortOrder = "distance" | "rating" | "name" | "numWings";
type DistanceFilterValues = "5" | "10" | "25" | "50" | "100" | "any";
type FilterValues = {
  name: string;
  state: string;
  city: string;
  distance: DistanceFilterValues;
};
const defaultFilterValues = {
  name: "",
  state: "",
  city: "",
  distance: "any",
} as const;

export const SpotsDisplay = ({
  spots = [],
}: {
  spots?: RouterOutputs["public"]["getAllSpots"];
}) => {
  const router = useRouter();
  const [selectedSpotId, setSelectedSpotId] = React.useState<string | null>(
    null
  );
  const selectedSpot = spots.find((spot) => spot.id === selectedSpotId);

  const handleUserLocationEnabled = () => {
    if (!sortedAfterLocationEnabled.current) {
      setSortBy("distance");
      setFilters((filters) => ({
        ...filters,
        distance: "100",
      }));
      sortedAfterLocationEnabled.current = true;
    }
  };
  const { userLocation, userLocationError, getUserLocation } = useUserLocation({
    onUserLocationEnabled: handleUserLocationEnabled,
  });
  const defaultSortBy = userLocation ? "distance" : "rating";

  const filtersFromUrl = router.query.filters
    ? JSON.parse(router.query.filters.toString())
    : defaultFilterValues;
  const reverseFromUrl = router.query.reverse
    ? Boolean(router.query.reverse)
    : true;
  const sortByFromUrl = router.query.sortBy
    ? (router.query.sortBy as SortOrder)
    : defaultSortBy;

  const [filters, setFilters] = React.useState<FilterValues>(filtersFromUrl);
  const [reverse, setReverse] = React.useState(reverseFromUrl);
  const [sortBy, setSortBy] = React.useState<SortOrder>(sortByFromUrl);

  React.useEffect(() => {
    const newQuery = {
      filters: JSON.stringify(filters),
      reverse: reverse.toString(),
      sortBy: sortBy,
    };
    if (
      !(
        newQuery.filters === router.query.filters &&
        newQuery.reverse === router.query.reverse &&
        newQuery.sortBy === router.query.sortBy
      )
    ) {
      router.replace(
        {
          query: newQuery,
        },
        undefined,
        { scroll: false, shallow: true }
      );
    }
  }, [filters, reverse, sortBy, router]);

  const sortedAfterLocationEnabled = React.useRef(false);

  const handleChangeName = (value: string) => {
    setFilters((filters) => ({ ...filters, name: value }));
    setSelectedSpotId(null);
  };
  const handleSelectState: ChangeEventHandler<HTMLSelectElement> = (e) => {
    setFilters((filters) => ({ ...filters, state: e.target.value }));
    setSelectedSpotId(null);
  };
  const handleSelectCity: ChangeEventHandler<HTMLSelectElement> = (e) => {
    setFilters((filters) => ({ ...filters, city: e.target.value }));
    setSelectedSpotId(null);
  };
  const handleSelectDistance: ChangeEventHandler<HTMLSelectElement> = (e) => {
    setFilters((filters) => ({
      ...filters,
      distance: e.target.value as DistanceFilterValues,
    }));
    setSelectedSpotId(null);
  };
  const handleSelectSortOrder: ChangeEventHandler<HTMLSelectElement> = (e) => {
    setSortBy(e.target.value as SortOrder);
    setSelectedSpotId(null);
  };
  const handleReset = () => {
    setFilters(defaultFilterValues);
    setReverse(true);
  };
  const [showMap, setShowMap] = React.useState(false);

  const spotDistancesMap =
    userLocation &&
    spots.reduce((map, spot) => {
      if (!spot.place) {
        return map;
      }
      const { lat: spotLat, lng: spotLng } = spot.place;
      const { latitude: userLat, longitude: userLng } = userLocation.coords;
      const distance = getDistance(
        { latitude: userLat, longitude: userLng },
        { latitude: spotLat, longitude: spotLng }
      );
      return Object.assign(map, {
        [spot.id]: { distance, display: formatDistance(distance) },
      });
    }, {} as Record<string, { distance: number; display: string }>);

  const filteredSpots = spots
    .filter((spot) =>
      filters.name
        ? spot.name.toLowerCase().includes(filters.name.toLowerCase())
        : true
    )
    .filter((spot) => (filters.state ? spot.state === filters.state : true))
    .filter((spot) => (filters.city ? spot.city === filters.city : true))
    .filter((spot) => {
      if (!userLocation) {
        return true;
      }
      const spotDistanceMeters = spotDistancesMap?.[spot.id]?.distance || null;
      if (!spotDistanceMeters) {
        return false;
      }
      if (filters.distance === "any") {
        return true;
      }
      const distanceFilterNumber = parseInt(filters.distance, 10);
      const spotDistanceMiles = convertMetersToMiles(spotDistanceMeters);
      return spotDistanceMiles <= distanceFilterNumber;
    })
    .sort((spotA, spotB) => {
      let result = 0;
      if (sortBy === "rating") {
        result = spotA.rating > spotB.rating ? -1 : 1;
      } else if (sortBy === "name") {
        result = spotA.name > spotB.name ? 1 : -1;
      } else if (sortBy === "numWings") {
        result = spotA.numWings > spotB.numWings ? -1 : 1;
      } else if (sortBy === "distance") {
        const spotADistance = spotDistancesMap?.[spotA.id]?.distance || null;
        const spotBDistance = spotDistancesMap?.[spotB.id]?.distance || null;
        if (userLocation && spotADistance && spotBDistance) {
          result = spotADistance > spotBDistance ? 1 : -1;
        } else if (spotADistance && !spotBDistance) {
          result = -1;
        } else if (!spotADistance && spotBDistance) {
          result = 1;
        }
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

  const handleSelectSpot = (spotId: string) => {
    scrollToId("map");
    setSelectedSpotId(spotId);
  };
  return (
    <>
      <ScrollToElement id={"search"} />
      <div id="search">
        <h3>Search</h3>
        <Space size="sm" />
        {!userLocation && (
          <div
            css={`
              ${col}
              align-items: start;
            `}
          >
            <button onClick={getUserLocation}>Find spots nearby</button>
            {userLocationError && (
              <Error>
                Failed to get location. Enable location access in your web
                browser and try again.
              </Error>
            )}
          </div>
        )}
        <Space size="sm" />
        <form>
          <SpotAutocomplete
            spots={filteredSpots}
            value={filters.name}
            setValue={handleChangeName}
          />
          <div>
            <label htmlFor="state">State</label>
            <select
              id="state"
              value={filters.state}
              onChange={handleSelectState}
            >
              <option value="">Pick a state</option>
              <SelectStateOptions />
            </select>
          </div>
          <div>
            <label htmlFor="city">City</label>
            <select id="city" value={filters.city} onChange={handleSelectCity}>
              <option value="">Select a city</option>
              <SelectCityOptions />
            </select>
          </div>
          {userLocation && (
            <div>
              <label htmlFor="distance">Within distance</label>
              <select
                id="distance"
                value={filters.distance}
                onChange={handleSelectDistance}
              >
                <option value="any">Any</option>
                <option value="5">5 miles</option>
                <option value="10">10 miles</option>
                <option value="25">25 miles</option>
                <option value="50">50 miles</option>
                <option value="100">100 miles</option>
              </select>
            </div>
          )}
          <div>
            <label htmlFor="sort">Sort by</label>
            <select id="sort" value={sortBy} onChange={handleSelectSortOrder}>
              {userLocation && (
                <option value="distance">
                  Distance - {reverse ? "Closest" : "Farthest"}
                </option>
              )}
              <option value="rating">
                Rating - {reverse ? "Best" : "Worst"}
              </option>
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
            <button
              type="button"
              onClick={() => handleReset()}
              css={`
                color: var(--red-5);
                &:hover {
                  --_border: var(--red-5);
                }
              `}
            >
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
      <div id="map">
        <h3>Map</h3>
        <Space size="sm" />
        {!showMap ? (
          <Image
            src={mapPlaceholder}
            alt="Click to view wing map"
            onClick={() => setShowMap(true)}
          />
        ) : (
          <>
            <GoogleMapsApiProvider>
              <SpotMap
                spots={filteredSpots}
                userLocation={
                  userLocation
                    ? {
                        lat: userLocation?.coords.latitude,
                        lng: userLocation?.coords.longitude,
                      }
                    : undefined
                }
                onSelectSpot={handleSelectSpot}
                selectedSpotId={selectedSpotId}
              />
            </GoogleMapsApiProvider>
            {selectedSpot && (
              <>
                <Space size="sm" />
                <div>
                  <SpotInfo
                    spot={selectedSpot}
                    distance={spotDistancesMap?.[selectedSpot.id]?.display}
                  />
                  <Space size="sm" />
                  <Link href={`/spots/${selectedSpot.id}`}>
                    <button>View</button>
                  </Link>
                </div>
              </>
            )}
          </>
        )}
        <Space size="md" />
      </div>
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
              <div key={spot.id} id={spot.id}>
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
                    <SpotInfo
                      spot={spot}
                      distance={spotDistancesMap?.[spot.id]?.display}
                    />
                    <div
                      css={`
                        ${row}
                      `}
                    >
                      <Link href={`/spots/${spot.id}`}>
                        <button>View</button>
                      </Link>
                      <Link href={`/spots/${spot.id}/addWing`}>
                        <button>+ Add rating</button>
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
            <div
              css={`
                ${row}
              `}
            >
              <Link href="/spots/add">
                <button>Add a spot</button>
              </Link>
              <button
                onClick={() => {
                  handleReset();
                }}
                type="reset"
              >
                Reset search and filters
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
