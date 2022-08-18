import type { NextPage } from "next";
import Head from "next/head";
import { trpc } from "../utils/trpc";
import { signIn, signOut, useSession } from "next-auth/react";
import { useForm, SubmitHandler } from "react-hook-form";
import React from "react";
import Image from "next/image";

type RestaurauntFormInputs = {
  userId: string;
  name: string;
  city: string;
  state: string;
};

const AddRestaurantForm = ({ userId }: { userId: string }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RestaurauntFormInputs>();
  const createRestaurant = trpc.useMutation("protected.createRestaurant");
  const onSubmit: SubmitHandler<RestaurauntFormInputs> = (data) => {
    console.log("submitting", data);
    createRestaurant.mutate(data);
  };
  return (
    <div>
      <h2>Add Restaurant</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <input
          {...register("userId", { required: true })}
          value={userId}
          hidden
        />
        <label>
          Name of restaurant
          <input {...register("name", { required: true })} />
        </label>
        {errors.name && <span>You must enter a restaurant name</span>}
        <label>
          What state is the restaurant in?
          <select {...register("state", { required: true })} defaultValue="">
            <option value="">Select a State</option>
            <option value="AL">Alabama</option>
            <option value="AK">Alaska</option>
            <option value="AZ">Arizona</option>
            <option value="AR">Arkansas</option>
            <option value="CA">California</option>
            <option value="CO">Colorado</option>
            <option value="CT">Connecticut</option>
            <option value="DE">Delaware</option>
            <option value="DC">District Of Columbia</option>
            <option value="FL">Florida</option>
            <option value="GA">Georgia</option>
            <option value="HI">Hawaii</option>
            <option value="ID">Idaho</option>
            <option value="IL">Illinois</option>
            <option value="IN">Indiana</option>
            <option value="IA">Iowa</option>
            <option value="KS">Kansas</option>
            <option value="KY">Kentucky</option>
            <option value="LA">Louisiana</option>
            <option value="ME">Maine</option>
            <option value="MD">Maryland</option>
            <option value="MA">Massachusetts</option>
            <option value="MI">Michigan</option>
            <option value="MN">Minnesota</option>
            <option value="MS">Mississippi</option>
            <option value="MO">Missouri</option>
            <option value="MT">Montana</option>
            <option value="NE">Nebraska</option>
            <option value="NV">Nevada</option>
            <option value="NH">New Hampshire</option>
            <option value="NJ">New Jersey</option>
            <option value="NM">New Mexico</option>
            <option value="NY">New York</option>
            <option value="NC">North Carolina</option>
            <option value="ND">North Dakota</option>
            <option value="OH">Ohio</option>
            <option value="OK">Oklahoma</option>
            <option value="OR">Oregon</option>
            <option value="PA">Pennsylvania</option>
            <option value="RI">Rhode Island</option>
            <option value="SC">South Carolina</option>
            <option value="SD">South Dakota</option>
            <option value="TN">Tennessee</option>
            <option value="TX">Texas</option>
            <option value="UT">Utah</option>
            <option value="VT">Vermont</option>
            <option value="VA">Virginia</option>
            <option value="WA">Washington</option>
            <option value="WV">West Virginia</option>
            <option value="WI">Wisconsin</option>
            <option value="WY">Wyoming</option>
          </select>
        </label>
        {errors.state && <span>You must enter a state</span>}
        <label>
          What city is the restaurant in?
          <input {...register("city", { required: true })} />
        </label>
        {errors.name && <span>You must enter a city</span>}
        <input type="submit" />
      </form>
    </div>
  );
};

type ReviewFormInputs = {
  userId: string;
  restaurantId: string;
  title: string;
  description: string;
  rating: number;
  mainImageFileList: FileList;
};

const toBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

const AddReviewForm = ({
  userId,
  restaurantId,
}: {
  userId: string;
  restaurantId: string;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<ReviewFormInputs>();
  const createReview = trpc.useMutation("protected.createReview");

  const onSubmit: SubmitHandler<ReviewFormInputs> = async (data) => {
    const mainImageFile = data.mainImageFileList[0];
    if (!mainImageFile) {
      setError("mainImageFileList", {
        message: "You must upload a main image",
      });
      return;
    }
    const base64File = await toBase64(mainImageFile);
    createReview.mutate({ ...data, mainImage: base64File });
  };

  return (
    <div>
      <h2>Add Review</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <input
          {...register("userId", { required: true })}
          value={userId}
          hidden
        />
        <input
          {...register("restaurantId", { required: true })}
          value={restaurantId}
          hidden
        />
        <label>
          Title
          <input {...register("title", { required: true })} />
        </label>
        {errors.title && <span>Enter a title for your review</span>}
        <label>
          Your review
          <input {...register("description", { required: true })} />
        </label>
        {errors.description && <span>Enter a review</span>}
        <label>
          Your rating
          <input {...register("rating", { required: true })} type="number" />
        </label>
        {errors.rating && <span>Enter a rating</span>}
        <label>
          Main Image
          <input
            {...register("mainImageFileList", { required: true })}
            type="file"
            accept="image/*"
          />
        </label>
        <input type="submit" />
      </form>
    </div>
  );
};

const Home: NextPage = () => {
  const [restaurantId, setRestaurantId] = React.useState<string>("");
  const { data: session } = useSession();
  const { data: restaurants } = trpc.useQuery(["getAllRestaurants"]);
  const { data: reviews } = trpc.useQuery(["getReviews", { restaurantId }]);
  return (
    <>
      <Head>
        <title>Naked Extra Crispy</title>
        <meta name="description" content="A site for crispy wing enthusiasts" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div>
        <h1>Naked Extra Crispy</h1>
        {session ? (
          <>
            Signed in as {session.user?.email} <br />
            <button onClick={() => signOut()}>Sign out</button>
          </>
        ) : (
          <button onClick={() => signIn()}>Sign in</button>
        )}
      </div>
      {session?.user && <AddRestaurantForm userId={session.user?.id} />}
      <div>
        <h2>Restaurants</h2>
        <ul>
          {restaurants?.map((restaurant, i) => (
            <li key={i}>
              <article>
                <h3>{restaurant.name}</h3>
                <p>
                  {restaurant.city}, {restaurant.state}
                </p>
                <p>added: {restaurant.createdAt.toLocaleDateString()} </p>
                <button onClick={() => setRestaurantId(restaurant.id)}>
                  Add Review
                </button>
              </article>
            </li>
          ))}
        </ul>
      </div>
      {session?.user && restaurantId && (
        <div>
          <AddReviewForm
            userId={session.user?.id}
            restaurantId={restaurantId}
          />
        </div>
      )}
      <div>
        <h2>Reviews</h2>
        <ul>
          {reviews?.map((review, i) => (
            <li key={i}>
              <article>
                <h3>{review.title}</h3>
                <p>by: {review.user.id}</p>
                <p>added: {review.createdAt.toLocaleDateString()} </p>
                <p>rating: {review.rating}/5</p>
                <p>{review.description}</p>
                {review.images.length > 0 &&
                  review.images.map((image) => {
                    console.log(image);
                    return (
                      <>
                        img
                        <Image
                          src={"/naked-extra-crispy/l3bholzruhxpd8tj5fom.png"}
                          alt={`${image.type}`}
                          width={300}
                          height={300}
                          objectFit="cover"
                        />
                      </>
                    );
                  })}
              </article>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default Home;
