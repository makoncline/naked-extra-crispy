import usePlacesAutocomplete from "use-places-autocomplete";
import { getPlaceGeoDataById } from "../lib/getPlaceDataById";
import { useCombobox } from "downshift";
import React from "react";
import { row } from "../styles/utils";
import { OnSelectPlaceData } from "./AddSpotForm";

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
  const {
    isOpen,
    getLabelProps,
    getMenuProps,
    getInputProps,
    highlightedIndex,
    getItemProps,
    selectItem,
  } = useCombobox({
    inputId: "places-autocomplete",
    items: data,
    onInputValueChange: ({ inputValue }) => {
      setValue(inputValue || "");
    },
    onSelectedItemChange: ({ selectedItem }) => {
      handleSelect(selectedItem);
    },
    itemToString: (item) => (item ? item.description : ""),
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
    <div>
      <label {...getLabelProps()}>Search for a spot!</label>
      <div
        css={`
          ${row}
          margin-bottom: var(--size-2);
        `}
      >
        <input {...getInputProps()} />
        <button
          aria-label="toggle menu"
          onClick={() => selectItem(null)}
          type="reset"
        >
          &#10007;
        </button>
      </div>
      <ul
        {...getMenuProps()}
        css={`
          list-style: none;
          padding: 0;
          background-color: hsla(var(--gray-1-hsl) / 5%);
          border-radius: var(--radius-2);
        `}
      >
        {isOpen &&
          data.map((item, index) => {
            const {
              place_id,
              structured_formatting: { main_text, secondary_text },
            } = item;
            return (
              <li
                css={`
                  background-color: ${highlightedIndex === index
                    ? "hsla(var(--gray-1-hsl) / 10%)"
                    : "unset"};
                  padding: var(--size-1);
                  cursor: pointer;
                  &:first-child {
                    border-radius: var(--radius-2) var(--radius-2) 0 0;
                  }
                  &:last-child {
                    border-radius: 0 0 var(--radius-2) var(--radius-2);
                  }
                `}
                key={place_id}
                {...getItemProps({
                  item,
                  index,
                })}
              >
                <strong>{main_text}</strong> <small>{secondary_text}</small>
              </li>
            );
          })}
      </ul>
    </div>
  );
};
