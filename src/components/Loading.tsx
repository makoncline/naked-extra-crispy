import { center } from "../styles/utils";
import { Spinner } from "./Spiner";

export const Loading = ({ scale }: { scale?: number }) => {
  return (
    <div
      css={`
        ${center}
      `}
    >
      <Spinner scale={scale} />
    </div>
  );
};
