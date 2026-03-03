import type { ParsedUrlQuery, ParsedUrlQueryInput } from "querystring";

export type SortOrder = "distance" | "rating" | "name" | "numWings";
export type DistanceFilterValues = "5" | "10" | "25" | "50" | "100" | "any";
export type FilterValues = {
  name: string;
  state: string;
  city: string;
  distance: DistanceFilterValues;
};

export const defaultFilterValues: FilterValues = {
  name: "",
  state: "",
  city: "",
  distance: "any",
};

const SORT_ORDERS: readonly SortOrder[] = ["distance", "rating", "name", "numWings"];
const DISTANCE_FILTER_VALUES: readonly DistanceFilterValues[] = [
  "5",
  "10",
  "25",
  "50",
  "100",
  "any",
];

type SearchStateQueryValues = {
  filters?: string;
  reverse?: "false";
  sortBy?: SortOrder;
};

const getQueryStringValue = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

const isSortOrder = (value: unknown): value is SortOrder =>
  typeof value === "string" && SORT_ORDERS.includes(value as SortOrder);

const isDistanceFilterValue = (value: unknown): value is DistanceFilterValues =>
  typeof value === "string" &&
  DISTANCE_FILTER_VALUES.includes(value as DistanceFilterValues);

export const parseFiltersFromQueryWithDefaults = (
  value: string | string[] | undefined,
  defaultFilters: FilterValues
): FilterValues => {
  const filtersFromQuery = getQueryStringValue(value);
  if (!filtersFromQuery) {
    return { ...defaultFilters };
  }

  try {
    const parsedFilters = JSON.parse(filtersFromQuery) as Partial<
      Record<keyof FilterValues, unknown>
    >;

    if (!parsedFilters || typeof parsedFilters !== "object" || Array.isArray(parsedFilters)) {
      return { ...defaultFilters };
    }

    return {
      name: typeof parsedFilters.name === "string" ? parsedFilters.name : defaultFilters.name,
      state:
        typeof parsedFilters.state === "string" ? parsedFilters.state : defaultFilters.state,
      city: typeof parsedFilters.city === "string" ? parsedFilters.city : defaultFilters.city,
      distance: isDistanceFilterValue(parsedFilters.distance)
        ? parsedFilters.distance
        : defaultFilters.distance,
    };
  } catch {
    return { ...defaultFilters };
  }
};

export const parseReverseFromQuery = (value: string | string[] | undefined) =>
  getQueryStringValue(value) === "false" ? false : true;

export const parseSortByFromQuery = (
  value: string | string[] | undefined,
  defaultSortBy: SortOrder
) => {
  const sortByFromQuery = getQueryStringValue(value);
  return isSortOrder(sortByFromQuery) ? sortByFromQuery : defaultSortBy;
};

export const buildSearchStateQueryValues = ({
  filters,
  reverse,
  sortBy,
  defaultSortBy,
  defaultFilters,
}: {
  filters: FilterValues;
  reverse: boolean;
  sortBy: SortOrder;
  defaultSortBy: SortOrder;
  defaultFilters: FilterValues;
}): SearchStateQueryValues => {
  const filtersWithNonDefaultValues: Partial<FilterValues> = {};
  if (filters.name !== defaultFilters.name) {
    filtersWithNonDefaultValues.name = filters.name;
  }
  if (filters.state !== defaultFilters.state) {
    filtersWithNonDefaultValues.state = filters.state;
  }
  if (filters.city !== defaultFilters.city) {
    filtersWithNonDefaultValues.city = filters.city;
  }
  if (filters.distance !== defaultFilters.distance) {
    filtersWithNonDefaultValues.distance = filters.distance;
  }

  return {
    filters:
      Object.keys(filtersWithNonDefaultValues).length > 0
        ? JSON.stringify(filtersWithNonDefaultValues)
        : undefined,
    reverse: reverse ? undefined : "false",
    sortBy: sortBy === defaultSortBy ? undefined : sortBy,
  };
};

export const isSearchStateQueryChanged = (
  currentQuery: ParsedUrlQuery,
  nextQueryValues: SearchStateQueryValues
) => {
  return (
    getQueryStringValue(currentQuery.filters) !== nextQueryValues.filters ||
    getQueryStringValue(currentQuery.reverse) !== nextQueryValues.reverse ||
    getQueryStringValue(currentQuery.sortBy) !== nextQueryValues.sortBy
  );
};

export const buildSearchStateQuery = (
  currentQuery: ParsedUrlQuery,
  nextQueryValues: SearchStateQueryValues
): ParsedUrlQueryInput => {
  const { filters: _filters, reverse: _reverse, sortBy: _sortBy, ...restQuery } = currentQuery;
  return {
    ...restQuery,
    ...(nextQueryValues.filters ? { filters: nextQueryValues.filters } : {}),
    ...(nextQueryValues.reverse ? { reverse: nextQueryValues.reverse } : {}),
    ...(nextQueryValues.sortBy ? { sortBy: nextQueryValues.sortBy } : {}),
  };
};
