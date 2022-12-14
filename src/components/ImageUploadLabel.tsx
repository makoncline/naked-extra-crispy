import Image, { StaticImageData } from "next/image";
import { center } from "../styles/utils";

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
      css={`
        width: ${size}px;
        height: ${size}px;
        display: grid;
        justify-items: stretch;
        & > * {
          grid-area: 1/1;
        }
      `}
    >
      <div
        css={`
          ${center}
        `}
      >
        <Image
          src={image}
          placeholder="blur"
          width={size - offset}
          height={size - offset}
          objectFit="cover"
          alt={type}
        />
      </div>
      <div
        css={`
          z-index: var(--layer-1);
          display: grid;
          grid-template-rows: 3fr 1fr;
          justify-items: center;
          color: white;
          background-image: linear-gradient(
            rgba(0, 0, 0, 0) 50%,
            rgba(0, 0, 0, 0.8) 100%
          );
          & > * {
            grid-area: 2/1;
          }
        `}
      >
        <span>+ {type}</span>
      </div>
    </div>
  );
};
