import Link from "next/link";
import React from "react";
import { ImageDisplay } from "./ImageDisplay";
import { SpotInfo } from "./SpotInfo";
import { Card } from "./Card";
import { type RouterOutputs } from "../utils/trpc";
import { SpotMap } from "./SpotMap";
import { ScrollToElement } from "./ScrollToElement";
import { GoogleMapsApiProvider } from "./GoogleMapsApiProvider";
import mapPlaceholder from "../../public/map-placeholder.webp";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { stateLabelByValue, useSpotSearch } from "../hooks/useSpotSearch";
import { SpotSearchForm } from "./SpotSearchForm";

export const SpotsDisplay = ({
  spots = [],
}: {
  spots?: RouterOutputs["public"]["getAllSpots"];
}) => {
  const [showMap, setShowMap] = React.useState(false);
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
    <div>
      <ScrollToElement id={"search"} />
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
        resultHref="#results"
        reverse={reverse}
        setReverse={setReverse}
        sortBy={sortBy}
        stateLabelByValue={stateLabelByValue}
        stateOptions={stateOptions}
        userLocation={userLocation}
        userLocationError={userLocationError}
      />

      <div className="h-8" />

      <section id="map" className="grid gap-4">
        <h3 className="text-xl font-semibold">Map</h3>
        {!showMap ? (
          <button
            type="button"
            onClick={() => setShowMap(true)}
            className="w-full overflow-hidden rounded-lg border text-left transition-[box-shadow,border-color] focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Open interactive wing map"
          >
            <Image
              src={mapPlaceholder}
              alt="Map preview"
              className="h-auto w-full"
            />
          </button>
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

      <section id="results" className="grid min-h-screen gap-4 scroll-mt-24">
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
            <p>There are no spots matching this search…</p>
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
