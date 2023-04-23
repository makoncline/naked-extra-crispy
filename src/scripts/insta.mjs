import { IgApiClient } from "instagram-private-api";

const USERNAME = "makon.dev";
const PASSWORD = "mAr6nbVf7%^F";
const PHOTO_URLS = [
  "https://nakedextracrispy.com/_next/image?url=https%3A%2F%2Fres.cloudinary.com%2Fmakon-dev%2Fimage%2Fupload%2Fc_fill%2Cw_800%2Ch_800%2Car_1%3A1%2Cq_100%2Cf_webp%2Fnaked-extra-crispy%2Fnoq44mkwo2efg1yb56qn&w=828&q=75",
  "https://nakedextracrispy.com/_next/image?url=https%3A%2F%2Fres.cloudinary.com%2Fmakon-dev%2Fimage%2Fupload%2Fc_fill%2Cw_800%2Ch_800%2Car_1%3A1%2Cq_100%2Cf_webp%2Fnaked-extra-crispy%2Fnoq44mkwo2efg1yb56qn&w=828&q=75",
  "https://nakedextracrispy.com/_next/image?url=https%3A%2F%2Fres.cloudinary.com%2Fmakon-dev%2Fimage%2Fupload%2Fc_fill%2Cw_800%2Ch_800%2Car_1%3A1%2Cq_100%2Cf_webp%2Fnaked-extra-crispy%2Fnoq44mkwo2efg1yb56qn&w=828&q=75",
];

const ig = new IgApiClient();

async function login() {
  ig.state.generateDevice(USERNAME);
  await ig.account.login(USERNAME, PASSWORD);
}

(async () => {
  await login();

  const photoArrayBuffers = await Promise.all(
    PHOTO_URLS.map((url) => fetch(url).then((res) => res.arrayBuffer()))
  );
  const photoBuffers = photoArrayBuffers.map((buffer) => Buffer.from(buffer));

  const { latitude, longitude, searchQuery } = {
    latitude: 0.0,
    longitude: 0.0,
    searchQuery: "place",
  };

  const locations = await ig.search.location(latitude, longitude, searchQuery);
  const mediaLocation = locations[0];
  console.log("media-location", mediaLocation);

  const publishResult = await ig.publish.album({
    items: photoBuffers.map((buffer) => ({ file: buffer })),
    caption: "test",
    location: mediaLocation,
  });

  console.log(publishResult);
})();
