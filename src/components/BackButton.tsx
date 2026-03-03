import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";

export const BackButton = () => {
  const router = useRouter();
  return (
    <div className="mb-8">
      <Button variant="link" className="px-0" onClick={() => router.back()}>
        ⬅️ Go back
      </Button>
    </div>
  );
};
