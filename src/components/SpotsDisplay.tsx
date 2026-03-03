import Link from "next/link";
import React from "react";
import { ImageDisplay } from "./ImageDisplay";
import { SpotInfo } from "./SpotInfo";
import { Card } from "./Card";
import { RouterOutputs } from "../utils/trpc";
import { getDistance } from "geolib";
import { useUserLocation } from "../hooks/useUserLocation";
import { convertMetersToMiles, formatDistance } from "../lib/distance";
import { SpotMap } from "./SpotMap";
import { ScrollToElement, scrollToId } from "./ScrollToElement";
import { GoogleMapsApiProvider } from "./GoogleMapsApiProvider";
import { useRouter } from "next/router";
import { SpotAutocomplete } from "./SpotAutocomplete";
import mapPlaceholder from "../../public/map-placeholder.webp";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { STATE_OPTIONS } from "./SelectStateOptions";
import {
  type DistanceFilterValues,
  type FilterValues,
  type SortOrder,
  buildSearchStateQuery,
  buildSearchStateQueryValues,
  defaultFilterValues,
  isSearchStateQueryChanged,
  parseFiltersFromQueryWithDefaults,
  parseReverseFromQuery,
  parseSortByFromQuery,
} from "../lib/searchStateQuery";

const EMPTY_STATE_VALUE = "__empty_state__";
const EMPTY_CITY_VALUE = "__empty_city__";

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
        distance: "10",
      }));
      sortedAfterLocationEnabled.current = true;
    }
  };
  const { userLocation, userLocationError, getUserLocation } = useUserLocation({
    onUserLocationEnabled: handleUserLocationEnabled,
  });
  const defaultSortBy = userLocation ? "distance" : "rating";
  const defaultFilters = React.useMemo<FilterValues>(
    () => ({
      ...defaultFilterValues,
      distance: userLocation ? "10" : "any",
    }),
    [userLocation]
  );

  const filtersFromUrl = parseFiltersFromQueryWithDefaults(
    router.query.filters,
    defaultFilters
  );
  const reverseFromUrl = parseReverseFromQuery(router.query.reverse);
  const sortByFromUrl = parseSortByFromQuery(router.query.sortBy, defaultSortBy);

  const [filters, setFilters] = React.useState<FilterValues>(filtersFromUrl);
  const [reverse, setReverse] = React.useState(reverseFromUrl);
  const [sortBy, setSortBy] = React.useState<SortOrder>(sortByFromUrl);

  React.useEffect(() => {
    const nextQueryValues = buildSearchStateQueryValues({
      filters,
      reverse,
      sortBy,
      defaultSortBy,
      defaultFilters,
    });

    if (isSearchStateQueryChanged(router.query, nextQueryValues)) {
      void router.replace(
        {
          query: buildSearchStateQuery(router.query, nextQueryValues),
        },
        undefined,
        { scroll: false, shallow: true }
      );
    }
  }, [defaultFilters, defaultSortBy, filters, reverse, sortBy, router]);

  const sortedAfterLocationEnabled = React.useRef(false);

  const handleChangeName = (value: string) => {
    setFilters((prev) => ({ ...prev, name: value }));
    setSelectedSpotId(null);
  };
  const handleSelectState = (state: string) => {
    setFilters((prev) => ({
      ...prev,
      state: state === EMPTY_STATE_VALUE ? "" : state,
    }));
    setSelectedSpotId(null);
  };
  const handleSelectCity = (city: string) => {
    setFilters((prev) => ({
      ...prev,
      city: city === EMPTY_CITY_VALUE ? "" : city,
    }));
    setSelectedSpotId(null);
  };
  const handleSelectDistance = (distance: string) => {
    setFilters((prev) => ({
      ...prev,
      distance: distance as DistanceFilterValues,
    }));
    setSelectedSpotId(null);
  };
  const handleSelectSortOrder = (nextSortBy: string) => {
    setSortBy(nextSortBy as SortOrder);
    setSelectedSpotId(null);
  };
  const handleReset = () => {
    setFilters(defaultFilters);
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
  const cityOptions = Array.from(new Set(spots.map((spot) => spot.city.trim()))).sort();

  const handleSelectSpot = (spotId: string) => {
    scrollToId("map");
    setSelectedSpotId(spotId);
  };

  return (
    <div>
      <ScrollToElement id={"search"} />
      <section id="search" className="grid gap-4">
        <h3 className="text-xl font-semibold">Search</h3>
        {!userLocation && (
          <div className="grid items-start gap-2">
            <Button onClick={getUserLocation}>Find spots nearby</Button>
            {userLocationError && (
              <p className="text-sm text-destructive">
                Failed to get location. Enable location access in your web
                browser and try again.
              </p>
            )}
          </div>
        )}

        <form
          className="grid w-full max-w-md gap-4"
          autoComplete="off"
          data-lpignore="true"
        >
          <SpotAutocomplete
            spots={filteredSpots}
            value={filters.name}
            setValue={handleChangeName}
          />

          <div className="grid gap-2">
            <Label htmlFor="state">State</Label>
            <Select
              value={filters.state || EMPTY_STATE_VALUE}
              onValueChange={handleSelectState}
            >
              <SelectTrigger id="state" className="w-full">
                <SelectValue placeholder="Pick a state" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={EMPTY_STATE_VALUE}>Pick a state</SelectItem>
                {STATE_OPTIONS.map(({ value, label }) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="city">City</Label>
            <Select value={filters.city || EMPTY_CITY_VALUE} onValueChange={handleSelectCity}>
              <SelectTrigger id="city" className="w-full">
                <SelectValue placeholder="Select a city" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={EMPTY_CITY_VALUE}>Select a city</SelectItem>
                {cityOptions.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {userLocation && (
            <div className="grid gap-2">
              <Label htmlFor="distance">Within distance</Label>
              <Select value={filters.distance} onValueChange={handleSelectDistance}>
                <SelectTrigger id="distance" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  <SelectItem value="5">5 miles</SelectItem>
                  <SelectItem value="10">10 miles</SelectItem>
                  <SelectItem value="25">25 miles</SelectItem>
                  <SelectItem value="50">50 miles</SelectItem>
                  <SelectItem value="100">100 miles</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="sort">Sort by</Label>
            <Select value={sortBy} onValueChange={handleSelectSortOrder}>
              <SelectTrigger id="sort" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {userLocation && (
                  <SelectItem value="distance">
                    Distance - {reverse ? "Closest" : "Farthest"}
                  </SelectItem>
                )}
                <SelectItem value="rating">
                  Rating - {reverse ? "Best" : "Worst"}
                </SelectItem>
                <SelectItem value="numWings">
                  {reverse ? "Most Popular" : "Least Popular"}
                </SelectItem>
                <SelectItem value="name">
                  Name ({reverse ? "A to Z" : "Z to A"})
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-wrap gap-2 whitespace-nowrap">
            <Button type="button" variant="secondary" onClick={() => setReverse((prev) => !prev)}>
              Reverse {reverse ? "▲" : "▼"}
            </Button>
            <Button type="button" variant="destructive" onClick={handleReset}>
              Reset ↺
            </Button>
            <Button asChild>
              <Link href="#results">
                {numFilteredSpots} Result{numFilteredSpots !== 1 ? "s" : ""} 👇
              </Link>
            </Button>
          </div>
        </form>
      </section>

      <div className="h-8" />

      <section id="map" className="grid gap-4">
        <h3 className="text-xl font-semibold">Map</h3>
        {!showMap ? (
          <Image
            src={mapPlaceholder}
            alt="Click to view wing map"
            onClick={() => setShowMap(true)}
            className="cursor-pointer rounded-lg border"
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
              <div className="grid gap-3">
                <SpotInfo
                  spot={selectedSpot}
                  distance={spotDistancesMap?.[selectedSpot.id]?.display}
                />
                <Button asChild className="w-fit">
                  <Link href={`/spots/${selectedSpot.id}`}>View</Link>
                </Button>
              </div>
            )}
          </>
        )}
      </section>

      <div className="h-8" />

      <section id="results" className="grid min-h-screen gap-4">
        <h3 className="text-xl font-semibold">Results</h3>
        {filteredSpots && filteredSpots.length ? (
          <div className="grid items-start gap-4">
            {filteredSpots.map((spot) => (
              <div key={spot.id} id={spot.id}>
                <Card>
                  <ImageDisplay imageKeys={spot.images.map((image) => image.key)} />
                  <div className="flex flex-col justify-between gap-4 p-4 md:p-6">
                    <SpotInfo
                      spot={spot}
                      distance={spotDistancesMap?.[spot.id]?.display}
                    />
                    <div className="flex flex-wrap gap-2">
                      <Button asChild>
                        <Link href={`/spots/${spot.id}`}>View</Link>
                      </Button>
                      <Button asChild variant="secondary">
                        <Link href={`/spots/${spot.id}/addWing`}>+ Add rating</Link>
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-4">
            <p>There are no spots matching this search...</p>
            <div className="flex flex-wrap gap-2">
              <Button asChild>
                <Link href="/spots/add">Add a spot</Link>
              </Button>
              <Button onClick={handleReset} variant="destructive" type="reset">
                Reset search and filters
              </Button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
