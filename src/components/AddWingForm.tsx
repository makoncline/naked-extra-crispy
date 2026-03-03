import { trpc } from "../utils/trpc";
import { useForm, SubmitHandler } from "react-hook-form";
import React from "react";
import { Rating } from "./Rating";
import { ImageUpload } from "./ImageUpload";
import { ImageUploadLabel } from "./ImageUploadLabel";
import mainWing from "../../public/mainWing.webp";
import drumWing from "../../public/drumWing.webp";
import flatWing from "../../public/flatWing.webp";
import { getRatingDescription } from "../lib/getRatingDescription";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

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
  spotName: string;
  onSuccess: () => void;
}) => {
  const [isMainUploading, setIsMainUploading] = React.useState(false);
  const [isDrumUploading, setIsDrumUploading] = React.useState(false);
  const [isFlatUploading, setIsFlatUploading] = React.useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<AddWFormInputs>();
  const watchReview = watch("review");
  const watchRating = watch("rating");
  const utils = trpc.useContext();
  const createWing = trpc.auth.createWing.useMutation({
    onSuccess: () => {
      void utils.invalidate();
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
    <div className="grid gap-4">
      <form id="add-wing" className="grid gap-4">
        <input
          {...register("userId", { required: true })}
          value={userId}
          hidden
          readOnly
        />
        <input
          {...register("spotId", { required: true })}
          value={spotId}
          hidden
          readOnly
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
          readOnly
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
          readOnly
        />
        <input {...register("drumImageId")} hidden readOnly />
        <input {...register("flatImageId")} hidden readOnly />

        <Card className="border-input p-4">
          <Rating aria-label="rating" onChange={handleRatingChange} />
          {!watchRating && !errors.rating && (
            <span className="text-sm text-muted-foreground">Select your rating</span>
          )}
          {watchRating && watchRating === 7 ? (
            <p className="text-sm text-destructive">
              Come on... choose a something besides 7.
            </p>
          ) : (
            <span className="text-sm text-muted-foreground">
              {getRatingDescription(watchRating)}
            </span>
          )}

          {errors.rating && (
            <p className="text-sm text-destructive">{errors.rating.message}</p>
          )}
        </Card>

        <div className="grid gap-2">
          <Textarea
            aria-label="review"
            {...register("review")}
            placeholder="I'm totally in love with these wings. They definitely have the best Buffalo wings in the neighborhood and arguably some of the best in the city. They are always crispy, sauce is just the right amount of spicy and tangy, and their blue cheese is divine."
            className="min-h-[200px]"
          />
          {!watchReview && (
            <span className="text-sm text-muted-foreground">
              Were they crispy? How was the sauce? Leave a review.
            </span>
          )}
          {watchReview && watchReview.length < 60 && (
            <p className="text-sm text-amber-500">
              Don&apos;t leave us hanging - what else you got?
            </p>
          )}
          {watchReview && watchReview.length >= 60 && (
            <p className="text-sm text-emerald-500">
              Now you&apos;re rolling - got any more to add?
            </p>
          )}
        </div>
      </form>

      <h2 className="text-xl font-semibold">Attach Photos</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="grid gap-2">
          <ImageUpload.Root
            id="main"
            onUploadSuccess={(id) => {
              setValue("mainImageId", id, { shouldValidate: true });
            }}
            setUploading={(uploading) => setIsMainUploading(uploading)}
          >
            <ImageUpload.Preview />
            <ImageUpload.Idle>
              <ImageUpload.Trigger>
                <ImageUploadLabel image={mainWing} type="Main" />
              </ImageUpload.Trigger>
              <ImageUpload.Input />
            </ImageUpload.Idle>
            <ImageUpload.Dialog>
              <ImageUpload.Crop />
              <ImageUpload.Error />
              <ImageUpload.Actions />
            </ImageUpload.Dialog>
          </ImageUpload.Root>
          {errors.mainImageId && (
            <p className="text-sm text-destructive">{errors.mainImageId.message}</p>
          )}
        </div>

        <div>
          <ImageUpload.Root
            id="drum"
            onUploadSuccess={(id) => {
              setValue("drumImageId", id);
            }}
            setUploading={(uploading) => setIsDrumUploading(uploading)}
          >
            <ImageUpload.Preview />
            <ImageUpload.Idle>
              <ImageUpload.Trigger>
                <ImageUploadLabel image={drumWing} type="Drum" />
              </ImageUpload.Trigger>
              <ImageUpload.Input />
            </ImageUpload.Idle>
            <ImageUpload.Dialog>
              <ImageUpload.Crop />
              <ImageUpload.Error />
              <ImageUpload.Actions />
            </ImageUpload.Dialog>
          </ImageUpload.Root>
        </div>

        <div>
          <ImageUpload.Root
            id="flat"
            onUploadSuccess={(id) => {
              setValue("flatImageId", id);
            }}
            setUploading={(uploading) => setIsFlatUploading(uploading)}
          >
            <ImageUpload.Preview />
            <ImageUpload.Idle>
              <ImageUpload.Trigger>
                <ImageUploadLabel image={flatWing} type="Flat" />
              </ImageUpload.Trigger>
              <ImageUpload.Input />
            </ImageUpload.Idle>
            <ImageUpload.Dialog>
              <ImageUpload.Crop />
              <ImageUpload.Error />
              <ImageUpload.Actions />
            </ImageUpload.Dialog>
          </ImageUpload.Root>
        </div>
      </div>

      <form>
        <Button
          type="submit"
          onClick={handleSubmit(onSubmit)}
          form="add-wing"
          disabled={isUploading}
        >
          Submit
        </Button>
      </form>

      {Object.keys(errors).length > 0 &&
        Object.entries(errors).map(([key, error]) => (
          <div key={key}>
            <p className="text-sm text-destructive">{error.message}</p>
          </div>
        ))}
    </div>
  );
};
