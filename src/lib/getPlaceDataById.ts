import { getGeocode, getLatLng } from "use-places-autocomplete";

export const getPlaceGeoDataById = async (placeId: string) => {
  const geocode = await getGeocode({ placeId: placeId });
  const result = geocode[0];
  if (!result) throw new Error(`No result found for placeId: ${placeId}`);
  const { address_components: addressComponents } = result;
  const state = addressComponents.find((component) =>
    component.types.includes("administrative_area_level_1")
  )?.short_name;
  const city = addressComponents.find((component) =>
    component.types.includes("locality")
  )?.long_name;
  if (!state) throw new Error(`No state found for placeId: ${placeId}`);
  if (!city) throw new Error(`No city found for placeId: ${placeId}`);
  const { lat, lng } = getLatLng(result);
  return {
    placeId,
    state,
    city,
    lat,
    lng,
  };
};
