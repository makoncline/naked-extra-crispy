import styled from "styled-components";

const Item = styled.li<{ highlighted: boolean }>`
  background-color: ${({ highlighted }) =>
    highlighted ? "hsla(var(--gray-1-hsl) / 10%)" : "unset"};
  padding: var(--size-1);
  cursor: pointer;
  &:first-child {
    border-radius: var(--radius-2) var(--radius-2) 0 0;
  }
  &:last-child {
    border-radius: 0 0 var(--radius-2) var(--radius-2);
  }
`;

const Container = styled.ul`
  list-style: none;
  padding: 0;
  background-color: hsla(var(--gray-1-hsl) / 5%);
  border-radius: var(--radius-2);
`;

export const Autocomplete = {
  Item,
  Container,
};
