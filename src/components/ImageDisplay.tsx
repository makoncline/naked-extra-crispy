import Image from "next/image";

export const ImageDisplay = ({ imageKeys }: { imageKeys: string[] }) => {
  return (
    <div
      css={`
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
      `}
    >
      {imageKeys.map((key, i) => (
        <div
          key={i}
          css={`
            position: relative;
            width: 100%;
            aspect-ratio: 1 / 1;
          `}
        >
          <Image src={key} layout="fill" objectFit="cover" alt="wing image" />
        </div>
      ))}
    </div>
  );
};
