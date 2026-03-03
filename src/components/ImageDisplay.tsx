import Image from "next/image";
import { toCloudinaryBlurUrl, toCloudinaryUrl } from "../lib/cloudinary";
import wings from "../../public/wings.webp";

export const ImageDisplay = ({
  imageKeys,
  priority = false,
}: {
  imageKeys: string[];
  priority?: boolean;
}) => {
  const alt = "wing image";
  const hasImages = imageKeys.length > 0;
  const imageSize = 400;
  return (
    <div className="flex h-full snap-x snap-mandatory overflow-x-auto">
      {hasImages ? (
        imageKeys.map((key, i) => {
          return (
            <div key={i} className="relative min-w-full snap-start">
              <div
                style={{ backgroundImage: `url(${toCloudinaryBlurUrl(key)})` }}
                className="absolute inset-0 -z-10 bg-cover bg-center"
              />
              <Image
                src={toCloudinaryUrl(key, imageSize)}
                alt={alt}
                style={{ objectFit: "cover" }}
                priority={i === 0 && priority ? true : false}
                width={imageSize}
                height={imageSize}
                loading={i === 0 && priority ? "eager" : "lazy"}
                unoptimized
              />
            </div>
          );
        })
      ) : (
        <div className="relative min-w-full snap-start">
          <Image
            src={wings}
            placeholder="blur"
            alt={alt}
            style={{ objectFit: "cover" }}
            width={imageSize}
            height={imageSize}
            priority={priority}
          />
        </div>
      )}
    </div>
  );
};
