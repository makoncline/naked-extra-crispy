export const isGoogleMapsAvailable = () => {
  return typeof google === "object" && typeof google.maps === "object";
};
