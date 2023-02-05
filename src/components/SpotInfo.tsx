import { col, row } from "../styles/utils";
import { RouterOutputs } from "../utils/trpc";
import { Rating } from "./Rating";

export const SpotInfo = ({
  spot,
  distance,
}: {
  spot: RouterOutputs["public"]["getSpot"];
  distance?: string | null;
}) => {
  return (
    <div
      css={`
        ${col}
        gap: var(--gap-list);
        p {
          color: var(--text-2);
        }
      `}
    >
      <div>
        <h4>{spot.name}</h4>
        <div
          css={`
            ${row}
          `}
        >
          <p>
            {spot.city}, {spot.state}
          </p>
          {spot.place && (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${spot.place.name}&query_place_id=${spot.place.id}`}
              target="_blank"
              rel="noreferrer"
            >
              📍 {distance && `${distance}`}
            </a>
          )}
        </div>
        {spot.rating ? (
          <Rating displayValue={spot.rating} key={spot.id} />
        ) : (
          <span>🚫 No ratings</span>
        )}
        {spot.numWings > 0 && <p>{spot.numWings.toLocaleString()} ratings</p>}
      </div>
    </div>
  );
};
