import { trpc } from "../utils/trpc";
import { SubmitHandler } from "react-hook-form";
import React from "react";
import { PlacesAutocomplete } from "./PlacesAutocomplete";
import { GoogleMapsPlaceData } from "../lib/getPlaceDataById";
import { useGoogleMapsApi } from "./GoogleMapsApiProvider";
import { Spinner } from "./Spiner";
import { z } from "zod";
import { useZodForm } from "../hooks/useZodForm";
import { Button } from "@/components/ui/button";

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
  } = useZodForm<AddSpotInput>({
    schema: addSpotInputSchema,
    defaultValues: { userId },
    reValidateMode: "onChange",
  });
  const utils = trpc.useContext();
  const createSpot = trpc.auth.createSpot.useMutation({
    onSuccess: () => {
      void utils.invalidate();
    },
  });
  const onSubmit: SubmitHandler<AddSpotInput> = async (data) => {
    try {
      const { id: spotId } = await createSpot.mutateAsync(data);
      onSuccess(spotId);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to add spot");
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
      void trigger();
    }
    setError(null);
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid w-full max-w-md gap-4">
      <input
        {...register("userId", { required: true })}
        value={userId}
        hidden
        readOnly
      />
      <input {...register("city")} hidden readOnly />
      <input {...register("state")} hidden readOnly />
      <input {...register("placeId")} hidden readOnly />
      <input {...register("lat")} hidden readOnly />
      <input {...register("lng")} hidden readOnly />
      <input {...register("address")} hidden readOnly />

      {isGoogleMapsApiReady ? (
        <>
          <PlacesAutocomplete onSelectPlace={onSelectPlace} />
          {errors.name && (
            <p className="text-sm text-destructive">You have to select a place!</p>
          )}
          <Button disabled={!isValid}>Add spot</Button>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </>
      ) : (
        <div className="flex h-24 w-full items-center justify-center">
          <Spinner />
        </div>
      )}
    </form>
  );
};
