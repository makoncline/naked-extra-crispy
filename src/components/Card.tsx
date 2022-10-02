import React from "react";
import styled from "styled-components";
import { above } from "../styles/breakpoints";
import { cardWidth, col } from "../styles/utils";

const Card = ({
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

const Carddd = styled.article<{ hover?: boolean }>`
  display: grid;
  background-color: rgba(255, 255, 255, 0.01);
  ${cardWidth}
  ${above["md"]`
  grid-template-columns: 1fr 1fr;
  `}
  ${(p) =>
    p.hover &&
    `
    &:hover {
        background-color: rgba(255, 255, 255, 0.02);
        cursor: pointer;
    }
    `}
`;

const Body = styled.div`
  ${col}
  gap: var(--gap-list);
  padding: var(--card-padding);
`;

Card.Body = Body;

export { Card };
