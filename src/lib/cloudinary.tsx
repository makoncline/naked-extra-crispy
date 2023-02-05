import { buildUrl } from "cloudinary-build-url";

export const toCloudinaryUrl = (imageId: string, size: number) =>
  buildUrl(imageId, {
    cloud: {
      cloudName: "makon-dev",
    },
    transformations: {
      resize: {
        type: "fill",
        width: size * 2,
        height: size * 2,
        aspectRatio: "1:1",
      },
      quality: 100,
      format: "webp",
    },
  });

// proxy request to set custom Cache-Control header
export const toCloudinaryBlurUrl = (imageId: string) =>
  "/api/blur-image-proxy?imageUrl=" +
  buildUrl(imageId, {
    cloud: {
      cloudName: "makon-dev",
    },
    transformations: {
      effect: { name: "blur", value: 1000 },
      quality: 1,
      format: "webp",
    },
  });
