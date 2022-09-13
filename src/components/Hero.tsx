import Link from "next/link";
import { siteConfig } from "../siteConfig";
import { row } from "../styles/utils";
import Image from "next/image";

export const Hero = () => {
  const { title, description } = siteConfig;
  return (
    <div
      css={`
        display: grid;
        align-items: center;
        grid-template-columns: 1fr 1fr;
      `}
    >
      <section
        css={`
          display: grid;
          gap: var(--size-5);
        `}
      >
        <h1
          css={`
            display: grid;
            grid-template-columns: max-content;
            color: var(--text);
            line-height: var(--font-lineheight-0);
            font-size: var(--font-size-fluid-2);
            & > div:last-child {
              color: var(--brand-color);
              font-size: var(--font-size-fluid-1);
            }
          `}
        >
          <div>{title}</div>
          <div>{description}</div>
        </h1>
        <p
          css={`
            margin-block-end: var(--size-3);
            font-size: var(--font-size-fluid-0);
          `}
        >
          Lorem ipsum dolor sit amet consectetu adipisicing elit. Nemo in
          doloremque quam, voluptatibus eum voluptatum.
        </p>
        <div>
          <Link href="#spots">
            <button>Show me the wings</button>
          </Link>
        </div>
      </section>
      <picture
        css={`
          ${row}
          align-items: center;
          position: relative;
          align-self: stretch;
          //   background-color: var(--brand-color);
          & > img {
            block-size: 100%;
            object-fit: cover;
          }
        `}
      >
        <Image
          src="/wings.png"
          alt="a random doodle"
          loader={({ src }) => src}
          width={800}
          height={800}
        />
      </picture>
    </div>
  );
};
