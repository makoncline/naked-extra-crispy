import { css } from "styled-components";

const flex = css`
  display: flex;
  gap: var(--size-1);
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

export const content = css`
  max-width: var(--size-md);
`;
