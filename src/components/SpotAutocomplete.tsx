import React from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { RouterOutputs } from "../utils/trpc";
import { Label } from "@/components/ui/label";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";

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
  const handleSelectSpot = (selectedSpot: AutoCompleteSpot | null) => {
    if (!selectedSpot) {
      return;
    }
    setTimeout(() => {
      void router.push({
        pathname: `/spots/[id]`,
        query: { id: selectedSpot.id },
      });
    }, 100);
  };

  return (
    <div className="grid gap-2">
      <Label htmlFor="spot-autocomplete">Name</Label>
      <Combobox<AutoCompleteSpot>
        items={spots}
        inputValue={value}
        onInputValueChange={(inputValue) => setValue(inputValue || "")}
        onValueChange={handleSelectSpot}
        itemToStringLabel={(item) => item.name}
        itemToStringValue={(item) => item.id}
        isItemEqualToValue={(item, selected) => item.id === selected.id}
        filter={() => true}
      >
        <ComboboxInput
          id="spot-autocomplete"
          className="w-full"
          placeholder="What's it called?"
          type="search"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck={false}
          name="spot-search"
          showClear
          data-lpignore="true"
          data-1p-ignore="true"
          data-form-type="other"
        />
        <ComboboxContent>
          <ComboboxEmpty className="px-3 py-2 text-sm text-muted-foreground">
            No spots found. <Link href="/spots/add">Add new spot?</Link>
          </ComboboxEmpty>
          <ComboboxList>
            {(spot: AutoCompleteSpot) => (
              <ComboboxItem key={spot.id} value={spot}>
                <div className="grid">
                  <strong>{spot.name}</strong>
                  {spot.place?.address ? (
                    <small className="text-muted-foreground">{spot.place.address}</small>
                  ) : null}
                </div>
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  );
};
