import React from "react";
import { RouterOutputs } from "../utils/trpc.js";
import { getCenter } from "geolib";
import { useGoogleMapsApi } from "./GoogleMapsApiProvider";
import { Spinner } from "./Spiner";
import { css } from "styled-components";
import { Place } from "../../prisma/generated/sqlite-client";

type SpotWithLocation = RouterOutputs["public"]["getAllSpots"][number] & {
  place: Place;
};
const TEAL_MARKER = "/teal-marker.png";
const defaultZoom = 3;
const usCenterLocation = {
  lat: 39.8097343,
  lng: -98.5556199,
} as const;

const mapSize = css`
  height: 400px;
  width: 100%;
`;

export const SpotMap = ({
  spots = [],
  userLocation,
  onSelectSpot,
  selectedSpotId,
}: {
  spots?: RouterOutputs["public"]["getAllSpots"];
  userLocation?: { lat: number; lng: number };
  onSelectSpot: (id: string) => void;
  selectedSpotId: string | null;
}) => {
  const { isGoogleMapsApiReady } = useGoogleMapsApi();
  if (!isGoogleMapsApiReady) {
    return (
      <div
        css={`
          ${mapSize}
          display: flex;
          justify-content: center;
          align-items: center;
        `}
      >
        <Spinner />
      </div>
    );
  }
  const spotsWithLocation = spots.filter(
    (spot): spot is SpotWithLocation => spot.place != null
  );
  const selectedSpot = spotsWithLocation.find(
    (spot) => spot.id === selectedSpotId
  );
  const hasSpots = spotsWithLocation.length > 0;
  const bounds = new google.maps.LatLngBounds();
  spotsWithLocation.forEach((spot) => {
    bounds.extend(new google.maps.LatLng(spot.place.lat, spot.place.lng));
  });
  const center = getCenter(
    spotsWithLocation.map(({ place }) => ({ lat: place.lat, lng: place.lng }))
  );
  const centerLocation = center
    ? { lat: center.latitude, lng: center.longitude }
    : undefined;
  const location = (() => {
    if (userLocation) {
      return userLocation;
    }
    if (!hasSpots) {
      return usCenterLocation;
    }
    if (centerLocation) {
      return centerLocation;
    }
    return usCenterLocation;
  })();

  const handleSpotSelect = (id: string) => {
    onSelectSpot(id);
  };
  return (
    <Map
      {...location}
      bounds={bounds}
      centerOverride={
        selectedSpot
          ? new google.maps.LatLng(
              selectedSpot.place.lat,
              selectedSpot.place.lng
            )
          : undefined
      }
    >
      {spotsWithLocation.map((spot) => (
        <Marker
          key={spot.id}
          lat={spot.place.lat}
          lng={spot.place.lng}
          title={spot.name}
          id={spot.id}
          onSelect={handleSpotSelect}
          selected={selectedSpotId === spot.id}
        />
      ))}
    </Map>
  );
};

const Map = ({
  children,
  bounds,
  centerOverride,
}: {
  children?: React.ReactNode;
  bounds: google.maps.LatLngBounds;
  centerOverride?: google.maps.LatLng;
}) => {
  const ref = React.useRef(null);
  const [map, setMap] = React.useState<google.maps.Map | null>(null);
  const isBoundsEmpty = bounds.isEmpty();
  const center = isBoundsEmpty ? usCenterLocation : bounds.getCenter().toJSON();
  const zoom = isBoundsEmpty ? defaultZoom : undefined;
  React.useEffect(() => {
    if (centerOverride) return;
    if (!isBoundsEmpty) {
      map?.fitBounds(bounds);
    } else {
      map?.setCenter(center);
      map?.setZoom(defaultZoom);
    }
  }, [isBoundsEmpty, map, bounds, center, centerOverride]);

  React.useEffect(() => {
    if (centerOverride) {
      map?.panTo(centerOverride);
    }
  }, [centerOverride, map]);

  React.useEffect(() => {
    if (ref.current && !map) {
      setMap(
        new google.maps.Map(ref.current, {
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          center,
          zoom,
        })
      );
    }
  }, [ref, map, center, zoom]);

  return (
    <div
      ref={ref}
      css={`
        ${mapSize}
      `}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          // set the map prop on the child component
          // @ts-ignore
          return React.cloneElement(child, { map });
        }
      })}
    </div>
  );
};

const Marker = ({
  map,
  lat: lat,
  lng: lng,
  title,
  id,
  onSelect,
  selected,
}: {
  lat: number;
  lng: number;
  title: string;
  map?: google.maps.MarkerOptions["map"];
  id: string;
  onSelect: (id: string) => void;
  selected: boolean;
}) => {
  const [marker, setMarker] = React.useState<google.maps.Marker>();

  React.useEffect(() => {
    if (!marker) {
      setMarker(new google.maps.Marker());
    }

    // remove marker from map on unmount
    return () => {
      if (marker) {
        marker.setMap(null);
      }
    };
  }, [marker]);

  React.useEffect(() => {
    if (marker) {
      marker.setOptions({
        map,
        position: { lat, lng },
        title,
        icon: selected ? undefined : TEAL_MARKER,
      });
      marker.addListener("click", () => {
        onSelect(id);
      });
    }
  }, [id, lat, lng, map, marker, onSelect, selected, title]);

  return null;
};
