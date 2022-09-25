import { trpc } from "../utils/trpc";
import { useForm, SubmitHandler } from "react-hook-form";
import React from "react";
import { SelectStateOptions } from "./SelectStateOptions";
import { Space } from "./Space";

export type AddSpotFormInputs = {
  userId: string;
  name: string;
  city: string;
  state: string;
};

export const AddSpotForm = ({
  userId,
  onSuccess,
}: {
  userId: string;
  onSuccess: (spotId: string) => void;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AddSpotFormInputs>();
  const createRestaurant = trpc.useMutation("protected.createSpot");
  const onSubmit: SubmitHandler<AddSpotFormInputs> = async (data) => {
    const { id: spotId } = await createRestaurant.mutateAsync(data);
    onSuccess(spotId);
  };
  return (
    <div>
      <h2>Add Spot</h2>
      <Space size="sm" />
      <form onSubmit={handleSubmit(onSubmit)}>
        <input
          {...register("userId", { required: true })}
          value={userId}
          hidden
        />
        <label>
          What&apos;s the place&apos;s name?
          <input {...register("name", { required: true })} />
        </label>
        {errors.name && <span>What? This place has wings, but no name?</span>}
        <label>
          What state is it in?
          <select {...register("state", { required: true })} defaultValue="">
            <option value="">Select a State</option>
            <SelectStateOptions />
          </select>
        </label>
        {errors.state && <span>Enter a state</span>}
        <label>
          What city?
          <input {...register("city", { required: true })} />
        </label>
        {errors.name && <span>Enter a city</span>}
        <input type="submit" />
      </form>
    </div>
  );
};
