import React from "react";

export const useUserLocation = ({
  onUserLocationEnabled,
}: {
  onUserLocationEnabled: () => void;
}) => {
  const [userLocation, setUserLocation] =
    React.useState<GeolocationPosition | null>(null);
  const [userLocationError, setUserLocationError] =
    React.useState<GeolocationPositionError | null>(null);

  const getUserLocation = React.useCallback(() => {
    navigator.geolocation.getCurrentPosition(
      setUserLocation,
      setUserLocationError,
      {
        maximumAge: Infinity,
        timeout: 5000,
        enableHighAccuracy: true, // doesn't work consisently wihtout this
      }
    );
    onUserLocationEnabled();
  }, [onUserLocationEnabled]);

  React.useEffect(() => {
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions
        .query({ name: "geolocation" })
        .then((permissionStatus) => {
          if (permissionStatus.state === "granted") {
            getUserLocation();
          }
        });
    }
  }, [getUserLocation]);
  return { userLocation, userLocationError, getUserLocation };
};
