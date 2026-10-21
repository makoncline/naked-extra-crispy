import { Cloudinary } from "@cloudinary/url-gen";
import { format, quality } from "@cloudinary/url-gen/actions/delivery";
import { blur } from "@cloudinary/url-gen/actions/effect";
import { fill } from "@cloudinary/url-gen/actions/resize";
import { siteConfig } from "../siteConfig";

const cloudinary = new Cloudinary({
  cloud: { cloudName: siteConfig.cloudinaryCloudName },
  url: { secure: true, analytics: false, forceVersion: false },
});

export const toCloudinaryUrl = (imageId: string, size: number) =>
  cloudinary
    .image(imageId)
    .resize(fill().width(size * 2).height(size * 2).aspectRatio("1:1"))
    .delivery(quality(100))
    .delivery(format("webp"))
    .toURL()
    .replaceAll("#", "%23");

export const toCloudinaryBlurUrl = (imageId: string) =>
  cloudinary
    .image(imageId)
    .effect(blur().strength(1000))
    .delivery(quality(1))
    .delivery(format("webp"))
    .toURL()
    .replaceAll("#", "%23");

export const toCloudinaryUrlForIg = (imageId: string) =>
  cloudinary
    .image(imageId)
    .delivery(quality("auto"))
    .delivery(format("jpg"))
    .toURL()
    .replaceAll("#", "%23");
