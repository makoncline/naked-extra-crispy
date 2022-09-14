import { css } from "styled-components";

const size = {
  sm: 480,
  md: 768,
  lg: 1024,
};

const mediaQueryKeys = Object.keys(size) as Array<keyof typeof size>;

export const above = mediaQueryKeys.reduce((acc, label) => {
  acc[label] = (literals: TemplateStringsArray, ...placeholders: any[]) =>
    css`
      @media (min-width: ${size[label] / 16}em) {
        ${css(literals, ...placeholders)}
      }
    `.join("");
  return acc;
}, {} as Record<keyof typeof size, (l: TemplateStringsArray, ...p: any[]) => string>);
