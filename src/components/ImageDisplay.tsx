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
  return (
    <ImageDisplayWrapper>
      {hasImages ? (
        imageKeys.map((key, i) => (
          <ImageWrapper key={i}>
            <Image
              src={toCloudinaryUrl(key, 400)}
              placeholder="blur"
              blurDataURL={toCloudinaryBlurUrl(key)}
              alt={alt}
              layout="fill"
              objectFit="cover"
              priority={i === 0 && priority ? true : false}
            />
          </ImageWrapper>
        ))
      ) : (
        <ImageWrapper>
          <Image
            src={wings}
            alt={alt}
            layout="fill"
            objectFit="cover"
            placeholder="blur"
          />
        </ImageWrapper>
      )}
    </ImageDisplayWrapper>
  );
};

const ImageDisplayWrapper = styled.div`
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-snap-points-x: repeat(100%);
  -webkit-overflow-scrolling: touch;
  -ms-scroll-snap-type: x mandatory;
  -ms-scroll-snap-points-x: repeat(100%);
  & > div {
    scroll-snap-align: start;
    min-width: 100%;
  }
`;

const ImageWrapper = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
`;
