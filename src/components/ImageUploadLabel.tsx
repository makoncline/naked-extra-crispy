import Image, { StaticImageData } from "next/image";

export const ImageUploadLabel = ({
  image,
  type,
}: {
  image: StaticImageData;
  type: string;
}) => {
  const size = 110;
  const offset = 8;
  return (
    <div
      className="relative grid overflow-hidden rounded-md border"
      style={{ width: size, height: size }}
    >
      <div className="flex items-center justify-center">
        <Image
          src={image}
          placeholder="blur"
          width={size - offset}
          height={size - offset}
          style={{ objectFit: "cover" }}
          alt={type}
        />
      </div>
      <div className="absolute inset-0 z-10 grid content-end justify-items-center bg-gradient-to-t from-black/85 to-transparent pb-1 text-sm text-white">
        <span>+ {type}</span>
      </div>
    </div>
  );
};
