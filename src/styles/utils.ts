import { css } from "styled-components";
import { above } from "./breakpoints";

const flex = css`
  display: flex;
  gap: var(--size-2);
`;

export const row = css`
  ${flex}
  flex-direction: row;
`;
export const col = css`
  ${flex}
  flex-direction: column;
`;

export const errorText = css`
  color: var(--text-color--error);
`;
export const warnText = css`
  color: var(--text-color--warn);
`;
export const successText = css`
  color: var(--text-color--success);
`;

export const content = css`
  max-width: var(--size-md);
`;

export const center = css`
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const cardWidth = css`
  max-width: var(--card-width);
  ${above["md"]`
    max-width: unset;
  `}
`;
