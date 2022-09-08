import React from "react";
import styled from "styled-components";
import { col, row } from "../styles/utils";

export const Rating = ({
  onChange,
}: {
  onChange: (rating: number) => void;
}) => {
  const [rating, setRating] = React.useState(0);
  const maxRating = 10;
  const checkboxes = Array.from({ length: maxRating }, (_, i) => i + 1);
  const handleChange = (rating: number) => {
    setRating(rating);
    onChange(rating);
  };
  return (
    <ScRating>
      {checkboxes.map((i) => (
        <button
          key={i}
          onClick={() => handleChange(i)}
          className={i < rating ? "selected" : ""}
          type="button"
        >
          <div
            css={`
              ${col}
              p {
                font-size: var(--font-size-00);
              }
            `}
          >
            <span>{i <= rating ? "🔥" : "⚪"}</span>
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
