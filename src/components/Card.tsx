import React from "react";
import { above } from "../styles/breakpoints";
import { cardWidth } from "../styles/utils";

export const Card = ({
  children,
  hover,
}: {
  children: React.ReactNode;
  hover?: boolean;
}) => {
  return (
    <article
      css={`
        display: grid;
        background-color: rgba(255, 255, 255, 0.01);
        ${hover &&
        `
            &:hover {
                background-color: rgba(255, 255, 255, 0.02);
                cursor: pointer;
            }
        `}
        ${cardWidth}
        ${above["md"]`
            grid-template-columns: 1fr 1fr;
        `}
      `}
    >
      {children}
    </article>
  );
};
