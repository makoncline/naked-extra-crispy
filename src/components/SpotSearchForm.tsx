import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type FilterValues, type SortOrder } from "../lib/searchStateQuery";
import { type RouterOutputs } from "../utils/trpc";
import { SpotAutocomplete } from "./SpotAutocomplete";

const EMPTY_STATE_VALUE = "__empty_state__";
const EMPTY_CITY_VALUE = "__empty_city__";

type SpotSearchFormProps = {
  cityOptions: string[];
  filteredSpots: RouterOutputs["public"]["getAllSpots"];
  filters: FilterValues;
  getUserLocation: () => void;
  handleChangeName: (value: string) => void;
  handleReset: () => void;
  handleSelectCity: (city: string) => void;
  handleSelectDistance: (distance: string) => void;
  handleSelectSortOrder: (sortBy: string) => void;
  handleSelectState: (state: string) => void;
  numFilteredSpots: number;
  resultHref: "#map" | "#results";
  reverse: boolean;
  setReverse: React.Dispatch<React.SetStateAction<boolean>>;
  sortBy: SortOrder;
  stateLabelByValue: Map<string, string>;
  stateOptions: string[];
  userLocation: GeolocationPosition | null;
  userLocationError: GeolocationPositionError | null;
};

export const SpotSearchForm = ({
  cityOptions,
  filteredSpots,
  filters,
  getUserLocation,
  handleChangeName,
  handleReset,
  handleSelectCity,
  handleSelectDistance,
  handleSelectSortOrder,
  handleSelectState,
  numFilteredSpots,
  resultHref,
  reverse,
  setReverse,
  sortBy,
  stateLabelByValue,
  stateOptions,
  userLocation,
  userLocationError,
}: SpotSearchFormProps) => {
  return (
    <section id="search" className="grid gap-4">
      <h3 className="text-xl font-semibold">Search</h3>
      {!userLocation && (
        <div className="grid items-start gap-2">
          <Button onClick={getUserLocation}>Find spots nearby</Button>
          {userLocationError && (
            <p className="text-sm text-destructive">
              Failed to get location. Enable location access in your web browser
              and try again.
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
              {stateOptions.map((stateValue) => (
                <SelectItem key={stateValue} value={stateValue}>
                  {stateLabelByValue.get(stateValue) ?? stateValue}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="city">City</Label>
          <Select
            value={filters.city || EMPTY_CITY_VALUE}
            onValueChange={handleSelectCity}
          >
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
          <Button
            type="button"
            variant="secondary"
            onClick={() => setReverse((prev) => !prev)}
          >
            Reverse {reverse ? "▲" : "▼"}
          </Button>
          <Button type="button" variant="destructive" onClick={handleReset}>
            Reset ↺
          </Button>
          <Button asChild>
            <Link href={resultHref}>
              {numFilteredSpots} Result{numFilteredSpots !== 1 ? "s" : ""} 👇
            </Link>
          </Button>
        </div>
      </form>
    </section>
  );
};
