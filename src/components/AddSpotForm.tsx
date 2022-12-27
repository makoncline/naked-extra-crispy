import { trpc } from "../utils/trpc";
import { useForm, SubmitHandler } from "react-hook-form";
import React from "react";
import { SelectStateOptions } from "./SelectStateOptions";
import Script from "next/script";
import { PlacesAutocomplete } from "./PlacesAutocomplete";
import { clientEnv } from "../env/schema.mjs";

export type AddSpotFormInputs = {
  userId: string;
  name: string;
  city: string;
  state: string;
};

export type GoogleMapsPlaceData = {
  placeName: string;
  placeId: string;
  state: string;
  city: string;
  lat: number;
  lng: number;
};

export const AddSpotForm = ({
  userId,
  onSuccess,
}: {
  userId: string;
  onSuccess: (spotId: string) => void;
}) => {
  const [googleMapsLoaded, setGoogleMapsLoaded] = React.useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AddSpotFormInputs>();
  const utils = trpc.useContext();
  const createRestaurant = trpc.auth.createSpot.useMutation({
    onSuccess: () => {
      utils.invalidate();
    },
  });
  const onSubmit: SubmitHandler<AddSpotFormInputs> = async (data) => {
    const { id: spotId } = await createRestaurant.mutateAsync(data);
    onSuccess(spotId);
  };
  const onSelectPlace = (placeData: GoogleMapsPlaceData) => {
    console.log("place", placeData);
  };
  return (
    <>
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${clientEnv.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
        strategy="lazyOnload"
        onLoad={() => {
          console.log("loaded google maps");
          setGoogleMapsLoaded(true);
        }}
      />
      <form onSubmit={handleSubmit(onSubmit)}>
        {googleMapsLoaded && (
          <PlacesAutocomplete onSelectPlace={onSelectPlace} />
        )}
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
    </>
  );
};
