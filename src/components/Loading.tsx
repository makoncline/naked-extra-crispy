import { center } from "../styles/utils";
import { Spinner } from "./Spiner";

export const Loading = () => {
  return (
    <div
      css={`
        ${center}
      `}
    >
      <Spinner />
    </div>
  );
};
