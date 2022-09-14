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
        <button
          key={i}
          onClick={() => handleChange(i)}
          className={i < rating ? "selected" : ""}
          type="button"
          disabled={!!displayValue}
        >
          <div
            css={`
              ${col}
              gap: 0;
              p {
                font-size: var(--font-size-00);
              }
            `}
          >
            <span>
              {i <= rating ? (
                <span>🔥</span>
              ) : (
                <span
                  css={`
                    filter: grayscale(100%);
                  `}
                >
                  🔥
                </span>
              )}
            </span>
            <p>{i}</p>
          </div>
        </button>
      ))}
    </ScRating>
  );
};

const ScRating = styled.div`
  ${row}
  button {
    background: none;
    border: none;
    box-shadow: var(--shadow-1);
    padding: 0;
    width: var(--size-4);
  }
`;
