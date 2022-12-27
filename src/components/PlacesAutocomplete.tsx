import { ChangeEventHandler } from "react";
import usePlacesAutocomplete from "use-places-autocomplete";
import { getPlaceGeoDataById } from "../lib/getPlaceDataById";
import { GoogleMapsPlaceData } from "./AddSpotForm";

export const PlacesAutocomplete = ({
  onSelectPlace,
}: {
  onSelectPlace: (placeData: GoogleMapsPlaceData) => void;
}) => {
  const {
    ready,
    value,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {
      componentRestrictions: { country: "us" },
    },
    debounce: 300,
  });

  const handleInput: ChangeEventHandler<HTMLInputElement> = (e) => {
    setValue(e.target.value);
  };

  const handleSelect = async (
    suggestion: google.maps.places.AutocompletePrediction
  ) => {
    const {
      description,
      structured_formatting: { main_text: placeName },
      place_id: placeId,
    } = suggestion;

    setValue(description, false);
    clearSuggestions();
    const geoData = await getPlaceGeoDataById(placeId);
    const placeData = {
      placeName,
      ...geoData,
    };
    onSelectPlace(placeData);
  };

  const renderSuggestions = () =>
    data.map((suggestion) => {
      const {
        place_id,
        structured_formatting: { main_text, secondary_text },
      } = suggestion;

      return (
        <li key={place_id} onClick={() => handleSelect(suggestion)}>
          <strong>{main_text}</strong> <small>{secondary_text}</small>
        </li>
      );
    });

  return (
    <div>
      <input
        value={value}
        onChange={handleInput}
        disabled={!ready}
        placeholder="Where are you going?"
      />
      {status === "OK" && <ul>{renderSuggestions()}</ul>}
    </div>
  );
};
