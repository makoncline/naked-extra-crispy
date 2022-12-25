import { Subtle } from "../styles/text";
import { inferQueryOutput } from "../utils/trpc";
import { Card } from "./Card";
import { ImageDisplay } from "./ImageDisplay";
import { Rating } from "./Rating";

export const WingDisplay = ({
  wing,
}: {
  wing: inferQueryOutput<"getWing">;
}) => {
  return (
    <Card key={wing.id} id={wing.id}>
      <ImageDisplay imageKeys={wing.images.map((image) => image.key)} />
      <Card.Body>
        <p>{wing.review}</p>
        <Rating displayValue={wing.rating} />
        <Subtle>{wing.createdAt.toLocaleDateString()}</Subtle>
      </Card.Body>
    </Card>
  );
};
