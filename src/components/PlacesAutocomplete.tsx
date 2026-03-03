import usePlacesAutocomplete from "use-places-autocomplete";
import { getPlaceGeoDataById } from "../lib/getPlaceDataById";
import React from "react";
import { OnSelectPlaceData } from "./AddSpotForm";
import { Label } from "@/components/ui/label";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";

export const PlacesAutocomplete = ({
  onSelectPlace,
}: {
  onSelectPlace: (placeData: OnSelectPlaceData) => void;
}) => {
  const {
    suggestions: { data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {
      componentRestrictions: { country: "us" },
    },
    debounce: 300,
  });

  const handleSelect = async (
    suggestion: google.maps.places.AutocompletePrediction | null | undefined
  ) => {
    if (!suggestion) {
      onSelectPlace(null);
    } else {
      const {
        structured_formatting: { main_text: placeName },
        place_id: placeId,
      } = suggestion;
      const geoData = await getPlaceGeoDataById(placeId);
      onSelectPlace({
        placeName,
        ...geoData,
      });
    }
    clearSuggestions();
  };

  return (
    <div className="grid gap-2">
      <Label htmlFor="places-autocomplete">Search for a spot!</Label>
      <Combobox<google.maps.places.AutocompletePrediction>
        items={data}
        onInputValueChange={(inputValue) => setValue(inputValue || "")}
        onValueChange={(suggestion) => {
          void handleSelect(suggestion);
        }}
        itemToStringLabel={(item) => item.description}
        itemToStringValue={(item) => item.place_id}
        isItemEqualToValue={(item, selected) => item.place_id === selected.place_id}
        filter={() => true}
      >
        <ComboboxInput
          id="places-autocomplete"
          className="w-full"
          placeholder="Search for a spot!"
          type="search"
          name="place-search"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck={false}
          showClear
        />
        <ComboboxContent>
          <ComboboxEmpty className="px-3 py-2 text-sm text-muted-foreground">
            No matching places found.
          </ComboboxEmpty>
          <ComboboxList>
            {(item: google.maps.places.AutocompletePrediction) => (
              <ComboboxItem key={item.place_id} value={item}>
                <div className="grid">
                  <strong>{item.structured_formatting.main_text}</strong>
                  <small className="text-muted-foreground">
                    {item.structured_formatting.secondary_text}
                  </small>
                </div>
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  );
};
