import { useRouter } from "next/router";

export const BackButton = () => {
  const router = useRouter();
  return (
    <a onClick={() => router.back()} href="#">
      ⬅️ Go back
    </a>
  );
};
