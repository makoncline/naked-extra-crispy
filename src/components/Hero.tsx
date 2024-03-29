import Link from "next/link";
import { siteConfig } from "../siteConfig";
import { row } from "../styles/utils";
import Image from "next/image";
import wings from "../../public/wings.webp";
import { LogoSVG } from "./LogoSvg";

export const Hero = () => {
  const { title, description } = siteConfig;
  return (
    <div>
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
            Naked Extra Crispy. It's how we like our wings. Good wings are
            crispy, but never breaded. They're tossed in buffalo sauce and come
            with a dip. Housemade sauces are key. We're not a wing spot, but we
            do wings right.
          </p>
        </section>
        <div
          css={`
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100%;
            width: 100%;
            padding: var(--space-sm);
          `}
        >
          <LogoSVG />
        </div>
      </div>
      <div>
        <Link href="#results">
          <button>Show me the wings</button>
        </Link>
      </div>
    </div>
  );
};
