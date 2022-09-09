import { useSession, signIn } from "next-auth/react";
import { AddSpotForm } from "../../components/AddSpotForm";
import { Loading } from "../../components/Loading";
import { useRouter } from "next/router";
import { BackButton } from "../../components/BackButton";

const AddSpot = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  if (status === "loading") {
    return <Loading />;
  }
  const userId = session?.user?.id;
  if (!userId) {
    signIn();
    return null;
  }
  return (
    <>
      <BackButton />
      <AddSpotForm
        userId={userId}
        onSuccess={(spotId) => router.push(`/spots/${spotId}`)}
      />
    </>
  );
};

export default AddSpot;
