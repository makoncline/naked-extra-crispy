import { IgApiClient } from "instagram-private-api";
import { z } from "zod";
import fetch from "cross-fetch";
import * as dotenv from "dotenv";

dotenv.config();

const NAKED_EXTRA_CRISPY_URL = "https://nakedextracrispy.com";
const DATA_URL = `${NAKED_EXTRA_CRISPY_URL}/api/social/next-post?type=ig-post`;
const SEND_EMAIL_URL = "https://send-to-makon.vercel.app/api/send-email";
const IG_USERNAME = process.env.IG_USERNAME;
const IG_PASSWORD = process.env.IG_PASSWORD;
const NAKEDEXTRACRISPY_AUTH_KEY = process.env.NAKEDEXTRACRISPY_AUTH_KEY;

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

if (!IG_USERNAME || !IG_PASSWORD || !NAKEDEXTRACRISPY_AUTH_KEY) {
  throw new Error(
    "IG_USERNAME, IG_PASSWORD, NAKEDEXTRACRISPY_AUTH_KEY env vars must be set"
  );
}

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
    let result;
    if (albumPhotoItems.length === 1) {
      result = await ig.publish.photo({
        file: albumPhotoItems[0]?.file!,
        caption,
        location,
      });
    } else {
      result = await ig.publish.album({
        items: albumPhotoItems,
        caption,
        location,
      });
    }

    const queryParams = new URLSearchParams();
    queryParams.set("subject", `IG Post Success!`);
    queryParams.set("message", `${NAKED_EXTRA_CRISPY_URL}/wings/${id}`);
    fetch(`${SEND_EMAIL_URL}?${queryParams}`);
    console.log(result);
  } catch (e) {
    const message = getErrorMessage(e);
    const queryParams = new URLSearchParams();
    queryParams.set("subject", `IG Post Error!`);
    queryParams.set("message", `${message}`);
    fetch(`${SEND_EMAIL_URL}?${queryParams}`);
    console.error(message);
  }
};

const loginToInstagram = async () => {
  ig.state.generateDevice(IG_USERNAME);
  try {
    await ig.simulate.preLoginFlow();
  } catch (e) {
    // ignore
  }
  await ig.account.login(IG_USERNAME, IG_PASSWORD);
  try {
    await ig.simulate.postLoginFlow();
  } catch (e) {
    // ignore
  }
};

const getPostData = async () => {
  const data = await fetch(DATA_URL, {
    method: "GET",
    headers: {
      Authorization: `${NAKEDEXTRACRISPY_AUTH_KEY}`,
    },
  }).then((res) => res.json());
  console.log(data);

  return postDataSchema.parse(data);
};

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message;
  return String(error);
};

main();
