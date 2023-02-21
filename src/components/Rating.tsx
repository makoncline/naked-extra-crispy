import React from "react";
import styled from "styled-components";
import { col, row } from "../styles/utils";

export const Rating = ({
  onChange = () => {},
  displayValue,
}: {
  onChange?: (rating: number) => void;
  displayValue?: number;
}) => {
  const [rating, setRating] = React.useState(displayValue || 0);
  const maxRating = 10;
  const checkboxes = Array.from({ length: maxRating }, (_, i) => i + 1);
  const handleChange = (rating: number) => {
    if (!displayValue) {
      setRating(rating);
      onChange(rating);
    }
  };
  return (
    <ScRating>
      {checkboxes.map((i) => (
        <React.Fragment key={i}>
          {displayValue ? (
            <Flame gray={i > rating} />
          ) : (
            <button
              onClick={() => handleChange(i)}
              type="button"
              disabled={Boolean(displayValue)}
            >
              <div
                css={`
                  ${col}
                  gap: 0;
                `}
              >
                <Flame gray={i > rating} />
                <p
                  css={`
                    font-size: var(--font-size-00);
                  `}
                >
                  {i}
                </p>
              </div>
            </button>
          )}
        </React.Fragment>
      ))}
    </ScRating>
  );
};

const Flame = ({ gray = false }: { gray?: boolean }) => (
  <span
    css={`
      font-size: var(--font-size-4);
      ${gray && `filter: grayscale(100%);`}
    `}
  >
    🔥
  </span>
);

const ScRating = styled.div`
  ${row}
  button {
    background: none;
    border: none;
    box-shadow: none;
    padding: 0;
    cursor: unset;
  }
`;
