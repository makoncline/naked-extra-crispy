import React from "react";
import { cn } from "@/lib/utils";

export const Rating = ({
  onChange = () => {},
  displayValue,
}: {
  onChange?: (rating: number) => void;
  displayValue?: number;
}) => {
  const [rating, setRating] = React.useState(displayValue || 0);
  const maxRating = 10;
  const values = Array.from({ length: maxRating }, (_, i) => i + 1);

  const handleChange = (nextRating: number) => {
    if (!displayValue) {
      setRating(nextRating);
      onChange(nextRating);
    }
  };

  return (
    <div className="flex flex-wrap items-end gap-2">
      {values.map((value) => (
        <React.Fragment key={value}>
          {displayValue ? (
            <Flame gray={value > rating} />
          ) : (
            <button
              onClick={() => handleChange(value)}
              type="button"
              disabled={Boolean(displayValue)}
              className="rounded-sm p-0.5"
            >
              <div className="flex flex-col items-center gap-0">
                <Flame gray={value > rating} />
                <span className="text-xs text-muted-foreground">{value}</span>
              </div>
            </button>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

const Flame = ({ gray = false }: { gray?: boolean }) => (
  <span className={cn("text-2xl", gray && "grayscale")}>🔥</span>
);
