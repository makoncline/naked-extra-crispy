import { trpc } from "../utils/trpc";
import { useForm, SubmitHandler } from "react-hook-form";
import React from "react";
import { Rating } from "./Rating";
import { ImageUpload } from "./ImageUpload";
import { Error, Success, Warn } from "../styles/text";
import { Space } from "./Space";
import { ImageUploadLabel } from "./ImageUploadLabel";
import { col } from "../styles/utils";
import mainWing from "../../public/mainWing.webp";
import drumWing from "../../public/drumWing.webp";
import flatWing from "../../public/flatWing.webp";
import { boolean } from "zod";
import { getRatingDescription } from "../lib/getRatingDescription";

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
  spotName,
  onSuccess,
}: {
  userId: string;
  spotId: string;
  spotName: string;
  onSuccess: () => void;
}) => {
  const [isMainUploading, setIsMainUploading] = React.useState(false);
  const [isDrumUploading, setIsDrumUploading] = React.useState(false);
  const [isFlatUploading, setIsFlatUploading] = React.useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue,
  } = useForm<AddWFormInputs>();
  const watchReview = watch("review");
  const watchRating = watch("rating");
  const utils = trpc.useContext();
  const createWing = trpc.auth.createWing.useMutation({
    onSuccess: () => {
      utils.invalidate();
    },
  });
  const handleRatingChange = (rating: number) => {
    setValue("rating", rating, { shouldValidate: true });
  };
  const onSubmit: SubmitHandler<AddWFormInputs> = async (data) => {
    createWing.mutate(data);
    onSuccess();
  };
  const isUploading = isMainUploading || isDrumUploading || isFlatUploading;
  return (
    <>
      <form id="add-wing">
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
        <input
          {...register("rating", {
            required: {
              value: true,
              message: "How were the wings? Enter a rating.",
            },
          })}
          id="rating"
          hidden
        />
        <input
          {...register("mainImageId", {
            required: {
              value: true,
              message:
                "A picture is worth a thousand words. Upload a main photo.",
            },
          })}
          hidden
        />
        <input {...register("drumImageId")} hidden />
        <input {...register("flatImageId")} hidden />
        <div
          css={`
            border: 1px solid var(--color-gray-300);
          `}
        >
          <Rating aria-label="rating" onChange={handleRatingChange} />
          {!watchRating && !errors.rating && <span>Select your rating</span>}
          {watchRating && watchRating === 7 ? (
            <Error>Come on... choose a something besides 7.</Error>
          ) : (
            <span>{getRatingDescription(watchRating)}</span>
          )}

          {errors.rating && <Error>{errors.rating.message}</Error>}
        </div>
        <div>
          <textarea
            aria-label="review"
            {...register("review")}
            placeholder="I'm totally in love with these wings. They definitely have the best Buffalo wings in the neighborhood and arguably some of the best in the city. They are always crispy, sauce is just the right amount of spicy and tangy, and their blue cheese is divine."
            css={`
              min-height: 200px;
            `}
          />
          {!watchReview && (
            <span>Were they crispy? How was the sauce? Leave a review.</span>
          )}
          {watchReview && watchReview.length < 60 && (
            <Warn>Don't leave us hanging - what else you got?</Warn>
          )}
          {watchReview && watchReview.length >= 60 && (
            <Success>Now you're rolling - got any more to add?</Success>
          )}
        </div>
      </form>
      <Space size="sm" />
      <h2>Attach Photos</h2>
      <Space size="sm" />
      <div
        css={`
          ${col}
        `}
      >
        <div>
          <ImageUpload
            id="main"
            onUploadSuccess={(id) => {
              setValue("mainImageId", id, { shouldValidate: true });
            }}
            setUploading={(uploading) => setIsMainUploading(uploading)}
          >
            <ImageUploadLabel image={mainWing} type="Main" />
          </ImageUpload>
          {errors.mainImageId && <Error>{errors.mainImageId.message}</Error>}
        </div>

        <div>
          <ImageUpload
            id="drum"
            onUploadSuccess={(id) => {
              setValue("drumImageId", id);
            }}
            setUploading={(uploading) => setIsDrumUploading(uploading)}
          >
            <ImageUploadLabel image={drumWing} type="Drum" />
          </ImageUpload>
        </div>
        <div>
          <ImageUpload
            id="flat"
            onUploadSuccess={(id) => {
              setValue("flatImageId", id);
            }}
            setUploading={(uploading) => setIsFlatUploading(uploading)}
          >
            <ImageUploadLabel image={flatWing} type="Flat" />
          </ImageUpload>
        </div>
      </div>
      <Space size="sm" />
      <form>
        <button
          type="submit"
          onClick={handleSubmit(onSubmit)}
          form="add-wing"
          disabled={isUploading}
        >
          Submit
        </button>
      </form>
      {Object.keys(errors).length > 0 &&
        Object.entries(errors).map(([key, error]) => (
          <div key={key}>
            <Error>{error.message}</Error>
          </div>
        ))}
    </>
  );
};
