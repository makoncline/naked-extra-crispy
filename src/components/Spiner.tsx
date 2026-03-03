import { Spinner as UiSpinner } from "@/components/ui/spinner";

export const Spinner = ({ scale }: { scale?: number }) => {
  const size = Math.max(16, Math.round((scale ?? 1) * 32));
  return <UiSpinner style={{ width: size, height: size }} />;
};
