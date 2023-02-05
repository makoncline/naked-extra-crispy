import Image from "next/image";
import styled from "styled-components";
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
    <ImageDisplayWrapper>
      {hasImages ? (
        imageKeys.map((key, i) => (
          <ImageWrapper key={i}>
            <Image
              src={toCloudinaryUrl(key, imageSize)}
              blurDataURL={toCloudinaryBlurUrl(key)}
              placeholder="blur"
              alt={alt}
              objectFit="cover"
              priority={i === 0 && priority ? true : false}
              width={imageSize}
              height={imageSize}
            />
          </ImageWrapper>
        ))
      ) : (
        <ImageWrapper>
          <Image
            src={wings}
            placeholder="blur"
            alt={alt}
            objectFit="cover"
            width={imageSize}
            height={imageSize}
            priority={priority}
          />
        </ImageWrapper>
      )}
    </ImageDisplayWrapper>
  );
};

const ImageDisplayWrapper = styled.div`
  display: flex;
  overflow-x: scroll;
  height: 100%;
  scroll-snap-type: x mandatory;
  scroll-snap-points-x: repeat(100%);
  -webkit-overflow-scrolling: touch;
  -ms-scroll-snap-type: x mandatory;
  -ms-scroll-snap-points-x: repeat(100%);
  & > div {
    scroll-snap-align: start;
    min-width: 100%;
  }
  overflow-x: overlay;
  ::-webkit-scrollbar {
    -webkit-appearance: none;
    height: 6px;
  }
  ::-webkit-scrollbar-thumb {
    border-radius: 3px;
    background-color: var(--gray-6);
  }
`;

const ImageWrapper = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
`;
