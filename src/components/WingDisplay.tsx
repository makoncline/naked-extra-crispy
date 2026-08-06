import { RouterOutputs } from "../utils/trpc";
import { Card } from "./Card";
import { ImageDisplay } from "./ImageDisplay";
import { RatingDisplay } from "./RatingDisplay";
import { formatDate } from "@/lib/formatDate";

export const WingDisplay = ({
  wing,
}: {
  wing: RouterOutputs["public"]["getWing"];
}) => {
  return (
    <Card key={wing.id} id={wing.id}>
      <ImageDisplay imageKeys={wing.images.map((image) => image.key)} />
      <Card.Body>
        <p>{wing.review}</p>
        <RatingDisplay rating={wing.rating} />
        <span className="text-sm text-muted-foreground">
          {formatDate(wing.createdAt)}
        </span>
      </Card.Body>
    </Card>
  );
};
