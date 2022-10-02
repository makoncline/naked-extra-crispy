import styled from "styled-components";
import { errorText, successText, warnText } from "./utils";

export const Error = styled.span`
  ${errorText}
`;

export const Warn = styled.span`
  ${warnText}
`;
export const Success = styled.span`
  ${successText}
`;

export const Subtle = styled.span`
  color: var(--text-2);
  font-size: var(--font-size-0);
`;
