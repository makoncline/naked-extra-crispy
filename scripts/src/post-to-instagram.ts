import { IgApiClient } from "instagram-private-api";
import { z } from "zod";
import fetch from "cross-fetch";
import * as dotenv from "dotenv";

dotenv.config();

const POST_TYPE = "ig-post";
const NAKED_EXTRA_CRISPY_URL = "https://nakedextracrispy.com";
const GET_POST_DATA_URL = `${NAKED_EXTRA_CRISPY_URL}/api/social/next-post`;
const MARK_POSTED_URL = `${NAKED_EXTRA_CRISPY_URL}/api/social/posted`;
const SEND_EMAIL_URL = "https://send-to-makon.vercel.app/api/send-email";

const postDataSchema = z.object({
  id: z.string(),
  name: z.string(),
  city: z.string(),
  state: z.string(),
  caption: z.string(),
  images: z.object({
    main: z.string(),
    drum: z.string().nullable(),
    flat: z.string().nullable(),
  }),
  lat: z.number(),
  lng: z.number(),
});

const envSchema = z.object({
  IG_USERNAME: z.string(),
  IG_PASSWORD: z.string(),
  NAKEDEXTRACRISPY_AUTH_KEY: z.string(),
});
const env = envSchema.parse(process.env);

const ig = new IgApiClient();

const main = async () => {
  try {
    const postData = await getPostData();

    const { lat, lng, name, caption, images, id } = postData;
    const imageUrls = [images.main, images.drum, images.flat].filter(
      Boolean
    ) as string[];
    const photoArrayBuffers = await Promise.all(
      imageUrls.map((url) => fetch(url).then((res) => res.arrayBuffer()))
    );
    const photoBuffers = photoArrayBuffers.map((buffer) => Buffer.from(buffer));
    const albumPhotoItems = photoBuffers.map((buffer) => ({ file: buffer }));

    await loginToInstagram();
    const locations = await ig.search.location(lat, lng, name);
    const location = locations[0];
    console.log("location", location);
    let result;
    if (albumPhotoItems.length === 1) {
      result = await ig.publish.photo({
        file: albumPhotoItems[0]?.file!,
        caption,
        location,
      });
      console.log("ig publish photo", result);
    } else {
      result = await ig.publish.album({
        items: albumPhotoItems,
        caption,
        location,
      });
      console.log("ig publish album", result);
    }
    await markPosted(id);

    const queryParams = new URLSearchParams();
    queryParams.set("subject", `IG Post Success!`);
    queryParams.set("message", `${NAKED_EXTRA_CRISPY_URL}/wings/${id}`);
    fetch(`${SEND_EMAIL_URL}?${queryParams}`);
    console.log("sent success email");
  } catch (e) {
    const message = getErrorMessage(e);
    console.error(message);
    const queryParams = new URLSearchParams();
    queryParams.set("subject", `IG Post Error!`);
    queryParams.set("message", `${message}`);
    fetch(`${SEND_EMAIL_URL}?${queryParams}`);
    console.log("sent error email");
  }
};

const loginToInstagram = async () => {
  ig.state.generateDevice(env.IG_USERNAME);
  try {
    await ig.simulate.preLoginFlow();
  } catch (e) {
    // ignore
  }
  await ig.account.login(env.IG_USERNAME, env.IG_PASSWORD);
  try {
    await ig.simulate.postLoginFlow();
  } catch (e) {
    // ignore
  }
  console.log("logged in to instagram");
};

const getPostData = async () => {
  const data = await fetch(`${GET_POST_DATA_URL}?type=${POST_TYPE}`, {
    method: "GET",
    headers: {
      Authorization: `${env.NAKEDEXTRACRISPY_AUTH_KEY}`,
    },
  }).then((res) => res.json());
  console.log("post data", data);
  return postDataSchema.parse(data);
};

const markPosted = async (wingId: string) => {
  const data = await fetch(
    `${MARK_POSTED_URL}?type=${POST_TYPE}&wingId=${wingId}`,
    {
      method: "POST",
      headers: {
        Authorization: `${env.NAKEDEXTRACRISPY_AUTH_KEY}`,
      },
    }
  ).then((res) => res.json());

  console.log("mark posted", data);
};

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message;
  return String(error);
};

main();
