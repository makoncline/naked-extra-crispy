import { Spinner } from "./Spiner";

export const Loading = ({ scale }: { scale?: number }) => {
  return (
    <div className="flex items-center justify-center">
      <Spinner scale={scale} />
    </div>
  );
};
