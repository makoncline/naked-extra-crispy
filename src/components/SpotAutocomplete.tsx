import { useCombobox } from "downshift";
import React from "react";
import { row } from "../styles/utils";
import { useRouter } from "next/router";

export const SpotAutocomplete = ({
  spots,
  value,
  setValue,
}: {
  spots: { name: string; id: string }[];
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
        <input
          {...getInputProps()}
          placeholder="What's it called?"
          autoComplete="off"
        />
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
          spots.map((spot, index) => {
            const { name, id } = spot;
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
                key={id}
                {...getItemProps({
                  item: spot,
                  index,
                })}
              >
                {name}
              </li>
            );
          })}
      </ul>
    </div>
  );
};
