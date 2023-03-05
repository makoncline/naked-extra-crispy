import { Subtle } from "../styles/text";
import { RouterOutputs } from "../utils/trpc";
import { Card } from "./Card";
import { ImageDisplay } from "./ImageDisplay";
import { Rating } from "./Rating";
import { RatingDisplay } from "./RatingDisplay";

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
        <Subtle>{wing.createdAt.toLocaleDateString()}</Subtle>
      </Card.Body>
    </Card>
  );
};
