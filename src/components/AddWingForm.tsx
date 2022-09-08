import { trpc } from "../utils/trpc";
import { useForm, SubmitHandler } from "react-hook-form";
import React from "react";
import { toBase64 } from "../lib/toBase64";
import { Rating } from "./Rating";
import { col } from "../styles/utils";
import { ImageUpload } from "./ImageUpload";
import { Error } from "../styles/text";

export type AddWFormInputs = {
  userId: string;
  spotId: string;
  review: string;
  rating: number;
  mainImageId: string;
  drumImageId: string;
  flatImageId: string;
};

export const AddWingForm = ({
  userId,
  spotId,
  onSuccess,
}: {
  userId: string;
  spotId: string;
  onSuccess: () => void;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<AddWFormInputs>();
  const watchReview = watch("review");
  const watchRating = watch("rating");
  const createWing = trpc.useMutation("protected.createWing");
  const handleRatingChange = (rating: number) => {
    setValue("rating", rating);
  };
  const onSubmit: SubmitHandler<AddWFormInputs> = async (data) => {
    createWing.mutate(data);
    onSuccess();
  };
  return (
    <div>
      <h2>Add your wings</h2>
      <form
        css={`
          ${col}
          gap: var(--size-4);
        `}
      >
        <input
          {...register("userId", { required: true })}
          value={userId}
          hidden
        />
        <input
          {...register("spotId", { required: true })}
          value={spotId}
          hidden
        />
        <div>
          <label>
            How were they?
            <textarea
              {...register("review", { required: true, minLength: 60 })}
            />
          </label>
          <div
            css={`
              ${col}
            `}
          >
            {watchReview && watchReview.length < 60 && (
              <Error>Don't leave us hanging - what else you got?</Error>
            )}
            {watchReview && watchReview.length >= 60 && (
              <span>Now you're rolling - got any more to add?</span>
            )}
            {errors.review && !watchReview.length && (
              <Error>
                Were they crispy? How was the sauce? Leave a review.
              </Error>
            )}
          </div>
        </div>
        <div>
          <label>
            Your rating
            <input
              {...register("rating", { required: true })}
              type="number"
              hidden
            />
            <Rating onChange={handleRatingChange} />
          </label>
          {watchRating === 7 && (
            <Error>Come on... choose a something besides 7.</Error>
          )}
        </div>
        {errors.rating && <Error>How were the wings? Enter a rating.</Error>}

        <input {...register("mainImageId", { required: true })} hidden />
        <input {...register("drumImageId")} hidden />
        <input {...register("flatImageId")} hidden />
      </form>
      <div>
        <label>
          Main Image
          <ImageUpload
            onUploadSuccess={(id) => {
              setValue("mainImageId", id);
            }}
          />
        </label>
        {errors.mainImageId && (
          <Error>A picture is worth a thousand words. Upload a photo.</Error>
        )}
      </div>
      <div>
        <label>
          Drum Image
          <ImageUpload
            onUploadSuccess={(id) => {
              setValue("drumImageId", id);
            }}
          />
        </label>
      </div>
      <div>
        <label>
          Flat Image
          <ImageUpload
            onUploadSuccess={(id) => {
              setValue("flatImageId", id);
            }}
          />
        </label>
      </div>
      <button type="submit" onClick={handleSubmit(onSubmit)}>
        Submit
      </button>
    </div>
  );
};
