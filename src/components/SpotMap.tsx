import React from "react";
import { RouterOutputs } from "../utils/trpc.js";
import { Place } from "@prisma/client";
import { getCenter } from "geolib";

type SpotWithLocation = RouterOutputs["public"]["getAllSpots"][number] & {
  place: Place;
};
const defaultZoom = 3;
const usCenterLocation = {
  lat: 39.8097343,
  lng: -98.5556199,
} as const;

export const SpotMap = ({
  spots = [],
  userLocation,
}: {
  spots?: RouterOutputs["public"]["getAllSpots"];
  userLocation?: { lat: number; lng: number };
}) => {
  const spotsWithLocation = spots.filter(
    (spot): spot is SpotWithLocation => spot.place != null
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

  return (
    <Map {...location} bounds={bounds}>
      {spotsWithLocation.map((spot) => (
        <Marker
          key={spot.id}
          lat={spot.place.lat}
          lng={spot.place.lng}
          title={spot.name}
          id={spot.id}
        />
      ))}
    </Map>
  );
};

const Map = ({
  children,
  bounds,
}: {
  children?: React.ReactNode;
  bounds: google.maps.LatLngBounds;
}) => {
  const ref = React.useRef(null);
  const [map, setMap] = React.useState<google.maps.Map | null>(null);
  const isBoundsEmpty = bounds.isEmpty();
  const center = isBoundsEmpty ? usCenterLocation : bounds.getCenter().toJSON();
  const zoom = isBoundsEmpty ? defaultZoom : undefined;
  if (!isBoundsEmpty) {
    map?.fitBounds(bounds);
  } else {
    map?.setCenter(center);
    map?.setZoom(defaultZoom);
  }
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
        height: 400px;
        width: 100%;
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
}: {
  lat: number;
  lng: number;
  title: string;
  map?: google.maps.MarkerOptions["map"];
  id: string;
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
      });
      marker.addListener("click", () => {
        window.open(`/spots/${id}`, "_blank");
      });
    }
  }, [id, lat, lng, map, marker, title]);

  return null;
};
