import { useCombobox } from "downshift";
import React from "react";
import { row } from "../styles/utils";
import { useRouter } from "next/router";
import { Autocomplete } from "./AutocompleteStyles";
import Link from "next/link";
import { RouterOutputs } from "../utils/trpc";

type AutoCompleteSpot = Pick<
  RouterOutputs["public"]["getAllSpots"][number],
  "name" | "id" | "place"
>;

export const SpotAutocomplete = ({
  spots,
  value,
  setValue,
}: {
  spots: AutoCompleteSpot[];
  value: string;
  setValue: (value: string) => void;
}) => {
  const router = useRouter();
  const {
    isOpen,
    getLabelProps,
    getMenuProps,
    getInputProps,
    highlightedIndex,
    getItemProps,
    selectItem,
  } = useCombobox({
    inputId: "spot-autocomplete",
    labelId: "spot-autocomplete-label",
    menuId: "spot-autocomplete-menu",
    items: spots,
    inputValue: value,
    onInputValueChange: ({ inputValue }) => {
      setValue(inputValue || "");
    },
    onSelectedItemChange: ({ selectedItem }) => {
      if (selectedItem) {
        setTimeout(() => {
          router.push({
            pathname: `/spots/[id]`,
            query: { id: selectedItem.id },
          });
        }, 100);
      }
    },
    itemToString: (item) => (item ? item.name : ""),
  });

  return (
    <div>
      <label {...getLabelProps()}>Name</label>
      <div
        css={`
          ${row}
          margin-bottom: var(--size-2);
        `}
      >
        <input {...getInputProps()} placeholder="What's it called?" />
        <button
          aria-label="toggle menu"
          onClick={() => selectItem(null)}
          type="reset"
        >
          &#10007;
        </button>
      </div>
      <Autocomplete.Container {...getMenuProps()}>
        {isOpen &&
          spots.map((spot, index) => {
            const { name, id, place } = spot;
            const { address } = place || {};
            return (
              <Autocomplete.Item
                highlighted={highlightedIndex === index}
                key={id}
                {...getItemProps({
                  item: spot,
                  index,
                })}
              >
                <strong>{name}</strong>{" "}
                {address ? <small>{address}</small> : null}
              </Autocomplete.Item>
            );
          })}
        {spots.length === 0 && (
          <Autocomplete.Item highlighted={false}>
            No spots found.{"  "}
            <Link href="/spots/add" passHref>
              <a>Add new spot?</a>
            </Link>
          </Autocomplete.Item>
        )}
      </Autocomplete.Container>
    </div>
  );
};
