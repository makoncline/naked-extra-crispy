import { trpc } from "../utils/trpc";
import { useForm, SubmitHandler } from "react-hook-form";
import React from "react";
import { SelectStateOptions } from "./SelectStateOptions";
import { PlacesAutocomplete } from "./PlacesAutocomplete";
import { Space } from "./Space";
import { GoogleMapsPlaceData } from "../lib/getPlaceDataById";
import { Error } from "../styles/text";
import { useGoogleMapsApi } from "./GoogleMapsApiProvider";

export type AddSpotFormInputs = {
  userId: string;
  placeId?: string;
  name: string;
  city: string;
  state: string;
  lat?: number;
  lng?: number;
  address?: string;
};

export type OnSelectPlaceData =
  | (GoogleMapsPlaceData & { placeName: string })
  | null;

export const AddSpotForm = ({
  userId,
  onSuccess,
}: {
  userId: string;
  onSuccess: (spotId: string) => void;
}) => {
  const [manualEntryToggle, setManualEntryToggle] = React.useState(false);
  const { isGoogleMapsApiReady } = useGoogleMapsApi();
  const shouldShowManualEntry = manualEntryToggle || !isGoogleMapsApiReady;
  const [error, setError] = React.useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    setValue,
    trigger,
  } = useForm<AddSpotFormInputs>({
    defaultValues: { userId },
    reValidateMode: "onChange",
  });
  const utils = trpc.useContext();
  const createSpot = trpc.auth.createSpot.useMutation({
    onSuccess: () => {
      utils.invalidate();
    },
  });
  const onSubmit: SubmitHandler<AddSpotFormInputs> = async (data) => {
    try {
      const { id: spotId } = await createSpot.mutateAsync(data);
      onSuccess(spotId);
    } catch (err: any) {
      setError(err.message);
    }
  };
  const onSelectPlace = (placeData: OnSelectPlaceData) => {
    console.log("placeData", placeData);
    if (!placeData) {
      reset();
    } else {
      setValue("name", placeData.placeName);
      setValue("city", placeData.city);
      setValue("state", placeData.state);
      setValue("placeId", placeData.placeId);
      setValue("lat", placeData.lat);
      setValue("lng", placeData.lng);
      setValue("address", placeData.address);
      trigger();
    }
    setError(null);
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        {...register("userId", { required: true })}
        value={userId}
        hidden
      />
      <input {...register("placeId")} hidden />
      <input {...register("lat")} hidden />
      <input {...register("lng")} hidden />

      {!shouldShowManualEntry && (
        <>
          <PlacesAutocomplete onSelectPlace={onSelectPlace} />
          {errors.name && <Error>You have to select a place!</Error>}
        </>
      )}
      <div hidden={!shouldShowManualEntry}>
        <label htmlFor="name">What's the place's name?</label>
        <input id="name" {...register("name", { required: true })} />
        {errors.name && <Error>What? This place has wings, but no name?</Error>}
      </div>
      <div hidden={!shouldShowManualEntry}>
        <label htmlFor="state">What state is it in?</label>
        <select
          id="state"
          {...register("state", { required: true })}
          defaultValue=""
        >
          <option value="">Select a State</option>
          <SelectStateOptions />
        </select>
        {errors.state && <Error>Enter a state</Error>}
      </div>
      <div hidden={!shouldShowManualEntry}>
        <label htmlFor="city">What city?</label>
        <input id="city" {...register("city", { required: true })} />
        {errors.name && <Error>Enter a city</Error>}
      </div>
      <button disabled={!isValid}>Add spot</button>
      {error && <Error>{error}</Error>}
      <Space size="sm" />
      <div hidden={!isGoogleMapsApiReady}>
        <a
          href="#"
          onClick={() => {
            setManualEntryToggle(!shouldShowManualEntry);
            reset();
          }}
        >
          {shouldShowManualEntry
            ? `Want to search for the spot?`
            : `Can't find the spot?`}
        </a>
      </div>
    </form>
  );
};
