import { getRatingDescription } from "../lib/getRatingDescription";

export const RatingDisplay = ({ rating }: { rating: number }) => (
  <div className="flex flex-wrap items-center gap-3 text-sm">
    <span>{rating} / 10 🔥</span>
    <span className="text-muted-foreground">{getRatingDescription(rating)}</span>
  </div>
);
