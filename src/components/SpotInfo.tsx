import { RouterOutputs } from "../utils/trpc";
import { RatingDisplay } from "./RatingDisplay";

export const SpotInfo = ({
  spot,
  distance,
}: {
  spot: RouterOutputs["public"]["getSpot"];
  distance?: string | null;
}) => {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h4 className="text-lg font-semibold">{spot.name}</h4>
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-muted-foreground">
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
        {spot.rating ? <RatingDisplay rating={spot.rating} /> : <span>🚫 No ratings</span>}
        {spot.numWings > 0 && (
          <p className="text-sm text-muted-foreground">
            {spot.numWings.toLocaleString()} ratings
          </p>
        )}
      </div>
    </div>
  );
};
