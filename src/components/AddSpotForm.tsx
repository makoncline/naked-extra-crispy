import { trpc } from "../utils/trpc";
import { useForm, SubmitHandler } from "react-hook-form";
import React from "react";
import { SelectStateOptions } from "./SelectStateOptions";

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
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        {...register("userId", { required: true })}
        value={userId}
        hidden
      />
      <div>
        <label htmlFor="name">What's the place's name?</label>
        <input id="name" {...register("name", { required: true })} />
        {errors.name && <span>What? This place has wings, but no name?</span>}
      </div>
      <div>
        <label htmlFor="state">What state is it in?</label>
        <select
          id="state"
          {...register("state", { required: true })}
          defaultValue=""
        >
          <option value="">Select a State</option>
          <SelectStateOptions />
        </select>
        {errors.state && <span>Enter a state</span>}
      </div>
      <div>
        <label htmlFor="city">What city?</label>
        <input id="city" {...register("city", { required: true })} />
        {errors.name && <span>Enter a city</span>}
      </div>
      <button>Add spot</button>
    </form>
  );
};
