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
