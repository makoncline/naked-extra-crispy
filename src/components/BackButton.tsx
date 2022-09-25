import { useRouter } from "next/router";
import { Space } from "./Space";

export const BackButton = () => {
  const router = useRouter();
  return (
    <>
      <a onClick={() => router.back()} href="#">
        ⬅️ Go back
      </a>
      <Space size="md" />
    </>
  );
};
