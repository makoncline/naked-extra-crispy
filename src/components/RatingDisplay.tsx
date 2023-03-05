import { getRatingDescription } from "../lib/getRatingDescription";
import { row } from "../styles/utils";

export const RatingDisplay = ({ rating }: { rating: number }) => (
  <div
    css={`
      ${row}
      gap: var(--space-sm);
    `}
  >
    <span>{rating} / 10 🔥</span>
    <span>{getRatingDescription(rating)}</span>
  </div>
);
