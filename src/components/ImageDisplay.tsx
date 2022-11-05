import Image from "next/image";
import styled from "styled-components";
import { local } from "../lib/loaders";

export const ImageDisplay = ({ imageKeys }: { imageKeys: string[] }) => {
  const alt = "wing image";
  const hasImages = imageKeys.length > 0;
  return (
    <ImageDisplayWrapper>
      {hasImages ? (
        imageKeys.map((key, i) => (
          <ImageWrapper key={i}>
            <Image src={key} alt={alt} layout="fill" objectFit="cover" />
          </ImageWrapper>
        ))
      ) : (
        <ImageWrapper>
          <Image
            src="/wings.webp"
            loader={local}
            alt={alt}
            layout="fill"
            objectFit="cover"
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
