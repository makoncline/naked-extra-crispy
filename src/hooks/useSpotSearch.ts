import { getDistance } from "geolib";
import { useRouter } from "next/router";
import React from "react";
import { STATE_OPTIONS } from "../components/SelectStateOptions";
import { scrollToId } from "../components/ScrollToElement";
import { convertMetersToMiles, formatDistance } from "../lib/distance";
import {
  type DistanceFilterValues,
  type FilterValues,
  type SortOrder,
  buildSearchStateQuery,
  buildSearchStateQueryValues,
  defaultFilterValues,
  isSearchStateQueryChanged,
  normalizeLocationFilters,
  parseFiltersFromQueryWithDefaults,
  parseReverseFromQuery,
  parseSortByFromQuery,
} from "../lib/searchStateQuery";
import { type RouterOutputs } from "../utils/trpc";
import { useUserLocation } from "./useUserLocation";

export const stateLabelByValue: Map<string, string> = new Map(
  STATE_OPTIONS.map(({ value, label }) => [value, label] as const)
);

export const useSpotSearch = ({
  spots = [],
}: {
  spots?: RouterOutputs["public"]["getAllSpots"];
}) => {
  const router = useRouter();
  const [selectedSpotId, setSelectedSpotId] = React.useState<string | null>(
    null
  );
  const sortedAfterLocationEnabled = React.useRef(false);

  const filtersFromUrl = normalizeLocationFilters(
    parseFiltersFromQueryWithDefaults(router.query.filters, defaultFilterValues)
  );
  const reverseFromUrl = parseReverseFromQuery(router.query.reverse);
  const sortByFromUrl = parseSortByFromQuery(router.query.sortBy, "rating");

  const [filters, setFilters] = React.useState<FilterValues>(filtersFromUrl);
  const [reverse, setReverse] = React.useState(reverseFromUrl);
  const [sortBy, setSortBy] = React.useState<SortOrder>(sortByFromUrl);

  const handleUserLocationEnabled = React.useCallback(() => {
    if (!sortedAfterLocationEnabled.current) {
      setSortBy("distance");
      setFilters((filters) => ({
        ...normalizeLocationFilters(filters),
        state: "",
        city: "",
        distance: "10",
      }));
      sortedAfterLocationEnabled.current = true;
    }
  }, [setFilters, setSortBy]);

  const { userLocation, userLocationError, getUserLocation } = useUserLocation({
    onUserLocationEnabled: handleUserLocationEnabled,
  });
  const defaultSortBy: SortOrder = userLocation ? "distance" : "rating";
  const defaultFilters = React.useMemo<FilterValues>(
    () => ({
      ...defaultFilterValues,
      distance: userLocation ? "10" : "any",
    }),
    [userLocation]
  );

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

  const nameFilteredSpots = spots.filter((spot) =>
    filters.name
      ? spot.name.toLowerCase().includes(filters.name.toLowerCase())
      : true
  );

  const filteredSpots = nameFilteredSpots
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

  const stateOptions = Array.from(
    new Set(nameFilteredSpots.map((spot) => spot.state.trim()).filter(Boolean))
  ).sort();
  const cityOptions = Array.from(
    new Set(nameFilteredSpots.map((spot) => spot.city.trim()).filter(Boolean))
  ).sort();

  const handleChangeName = (value: string) => {
    setFilters((prev) => ({ ...prev, name: value }));
    setSelectedSpotId(null);
  };
  const handleSelectState = (state: string) => {
    const nextState = state === "__empty_state__" ? "" : state;
    setFilters((prev) => ({
      ...prev,
      state: nextState,
      city: nextState ? "" : prev.city,
      distance: nextState ? "any" : prev.distance,
    }));
    setSelectedSpotId(null);
  };
  const handleSelectCity = (city: string) => {
    const nextCity = city === "__empty_city__" ? "" : city;
    setFilters((prev) => ({
      ...prev,
      city: nextCity,
      state: nextCity ? "" : prev.state,
      distance: nextCity ? "any" : prev.distance,
    }));
    setSelectedSpotId(null);
  };
  const handleSelectDistance = (distance: string) => {
    const nextDistance = distance as DistanceFilterValues;
    setFilters((prev) => ({
      ...prev,
      distance: nextDistance,
      state: nextDistance !== "any" ? "" : prev.state,
      city: nextDistance !== "any" ? "" : prev.city,
    }));
    setSelectedSpotId(null);
  };
  const handleSelectSortOrder = (nextSortBy: string) => {
    setSortBy(nextSortBy as SortOrder);
    setSelectedSpotId(null);
  };
  const handleSelectSpot = (spotId: string) => {
    scrollToId("map");
    setSelectedSpotId(spotId);
  };
  const handleReset = () => {
    setFilters(defaultFilters);
    setReverse(true);
    setSelectedSpotId(null);
  };

  return {
    cityOptions,
    filteredSpots,
    filters,
    getUserLocation,
    handleChangeName,
    handleReset,
    handleSelectCity,
    handleSelectDistance,
    handleSelectSortOrder,
    handleSelectSpot,
    handleSelectState,
    numFilteredSpots: filteredSpots.length,
    reverse,
    selectedSpot: spots.find((spot) => spot.id === selectedSpotId),
    selectedSpotId,
    setReverse,
    sortBy,
    spotDistancesMap,
    stateOptions,
    userLocation,
    userLocationError,
  };
};
