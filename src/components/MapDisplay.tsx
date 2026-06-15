import Link from "next/link";
import { SpotInfo } from "./SpotInfo";
import { type RouterOutputs } from "../utils/trpc";
import { SpotMap } from "./SpotMap";
import { GoogleMapsApiProvider } from "./GoogleMapsApiProvider";
import { Button } from "@/components/ui/button";
import { stateLabelByValue, useSpotSearch } from "../hooks/useSpotSearch";
import { SpotSearchForm } from "./SpotSearchForm";

export const MapDisplay = ({
  spots = [],
}: {
  spots?: RouterOutputs["public"]["getAllSpots"];
}) => {
  const {
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
    numFilteredSpots,
    reverse,
    selectedSpot,
    selectedSpotId,
    setReverse,
    sortBy,
    spotDistancesMap,
    stateOptions,
    userLocation,
    userLocationError,
  } = useSpotSearch({ spots });

  return (
    <div className="grid gap-8">
      <SpotSearchForm
        cityOptions={cityOptions}
        filteredSpots={filteredSpots}
        filters={filters}
        getUserLocation={getUserLocation}
        handleChangeName={handleChangeName}
        handleReset={handleReset}
        handleSelectCity={handleSelectCity}
        handleSelectDistance={handleSelectDistance}
        handleSelectSortOrder={handleSelectSortOrder}
        handleSelectState={handleSelectState}
        numFilteredSpots={numFilteredSpots}
        resultHref="#map"
        reverse={reverse}
        setReverse={setReverse}
        sortBy={sortBy}
        stateLabelByValue={stateLabelByValue}
        stateOptions={stateOptions}
        userLocation={userLocation}
        userLocationError={userLocationError}
      />

      <section id="map" className="grid gap-4 scroll-mt-24">
        <h3 className="text-xl font-semibold">Map</h3>
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
      </section>
    </div>
  );
};
