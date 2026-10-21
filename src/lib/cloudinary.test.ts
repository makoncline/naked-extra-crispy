import assert from "node:assert/strict";
import { test } from "node:test";
import {
  toCloudinaryBlurUrl,
  toCloudinaryUrl,
  toCloudinaryUrlForIg,
} from "./cloudinary";

function transformationParameters(value: string, imageId: string) {
  const url = new URL(value);
  assert.equal(url.origin, "https://res.cloudinary.com");
  assert.equal(url.search, "");
  assert.equal(url.hash, "");
  const prefix = "/makon-dev/image/upload/";
  assert.ok(url.pathname.startsWith(prefix));
  const path = decodeURIComponent(url.pathname.slice(prefix.length));
  assert.ok(path.endsWith(`/${imageId}`));
  return new Set(path.slice(0, -imageId.length - 1).split(/[,/]/));
}

test("display and metadata images retain square fill and double resolution", () => {
  const id = "wings/main-photo";
  for (const size of [400, 800]) {
    assert.deepEqual(
      transformationParameters(toCloudinaryUrl(id, size), id),
      new Set([
        "c_fill",
        `w_${size * 2}`,
        `h_${size * 2}`,
        "ar_1:1",
        "q_100",
        "f_webp",
      ]),
    );
  }
});

test("blur and Instagram transforms stay separate across successive calls", () => {
  const id = "wings/side-photo";
  const expectedBlur = new Set(["e_blur:1000", "q_1", "f_webp"]);
  assert.deepEqual(transformationParameters(toCloudinaryBlurUrl(id), id), expectedBlur);
  toCloudinaryUrl("another-image", 800);
  assert.deepEqual(
    transformationParameters(toCloudinaryUrlForIg(id), id),
    new Set(["q_auto", "f_jpg"]),
  );
  assert.deepEqual(transformationParameters(toCloudinaryBlurUrl(id), id), expectedBlur);
});

test("public IDs keep folder paths, Unicode and reserved characters as asset data", () => {
  for (const id of ["photo", "wings/space name", "wings/éclair 50%? #,id.jpg"]) {
    transformationParameters(toCloudinaryUrl(id, 400), id);
    transformationParameters(toCloudinaryBlurUrl(id), id);
    transformationParameters(toCloudinaryUrlForIg(id), id);
  }
});
