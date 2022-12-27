import { getGeocode, getLatLng } from "use-places-autocomplete";

export type GoogleMapsPlaceData = {
  placeId: string;
  state: string;
  city: string;
  lat: number;
  lng: number;
};

export const getPlaceGeoDataById = async (
  placeId: string
): Promise<GoogleMapsPlaceData> => {
  const geocode = await getGeocode({ placeId: placeId });
  const result = geocode[0];
  if (!result) throw new Error(`No result found for placeId: ${placeId}`);
  const { address_components: addressComponents } = result;
  const state = addressComponents.find((component) =>
    component.types.includes("administrative_area_level_1")
  )?.short_name;
  const city = addressComponents.find(
    (component) =>
      component.types.includes("sublocality") ||
      component.types.includes("locality")
  )?.long_name;
  if (!state) throw new Error(`No state found for placeId: ${placeId}`);
  if (!city) throw new Error(`No city found for placeId: ${placeId}`);
  const { lat, lng } = getLatLng(result);
  console.log({
    placeId,
    state,
    city,
    lat,
    lng,
  });
  return {
    placeId,
    state,
    city,
    lat,
    lng,
  };
};
