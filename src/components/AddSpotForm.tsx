import { trpc } from "../utils/trpc";
import { SubmitHandler } from "react-hook-form";
import React from "react";
import { PlacesAutocomplete } from "./PlacesAutocomplete";
import { GoogleMapsPlaceData } from "../lib/getPlaceDataById";
import { Error } from "../styles/text";
import { useGoogleMapsApi } from "./GoogleMapsApiProvider";
import { Spinner } from "./Spiner";
import { z } from "zod";
import { useZodForm } from "../hooks/useZodForm";

export const addSpotInputSchema = z.object({
  userId: z.string(),
  name: z.string(),
  state: z.string().min(1).max(2),
  city: z.string().min(1),
  placeId: z.string(),
  lat: z.number(),
  lng: z.number(),
  address: z.string(),
});
type AddSpotInput = z.infer<typeof addSpotInputSchema>;

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
  const { isGoogleMapsApiReady } = useGoogleMapsApi();
  const [error, setError] = React.useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    setValue,
    trigger,
  } = useZodForm({
    schema: addSpotInputSchema,
    defaultValues: { userId },
    reValidateMode: "onChange",
  });
  const utils = trpc.useContext();
  const createSpot = trpc.auth.createSpot.useMutation({
    onSuccess: () => {
      utils.invalidate();
    },
  });
  const onSubmit: SubmitHandler<AddSpotInput> = async (data) => {
    try {
      const { id: spotId } = await createSpot.mutateAsync(data);
      onSuccess(spotId);
    } catch (err: any) {
      setError(err.message);
    }
  };
  const onSelectPlace = (placeData: OnSelectPlaceData) => {
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
      <input {...register("city")} hidden />
      <input {...register("state")} hidden />
      <input {...register("placeId")} hidden />
      <input {...register("lat")} hidden />
      <input {...register("lng")} hidden />
      <input {...register("address")} hidden />

      {isGoogleMapsApiReady ? (
        <>
          <PlacesAutocomplete onSelectPlace={onSelectPlace} />
          {errors.name && <Error>You have to select a place!</Error>}
          <button disabled={!isValid}>Add spot</button>
          {error && <Error>{error}</Error>}
        </>
      ) : (
        <div
          css={`
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100px;
            width: 100%;
          `}
        >
          <Spinner />
        </div>
      )}
    </form>
  );
};
