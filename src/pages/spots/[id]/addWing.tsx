import { useSession, signIn } from "next-auth/react";
import { AddWingForm } from "../../../components/AddWingForm";
import { Loading } from "../../../components/Loading";
import { useRouter } from "next/router";
import { NextPage } from "next";
import { BackButton } from "../../../components/BackButton";

const AddWing: NextPage = () => {
  const router = useRouter();
  const spotId = router.query.id as string;
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
      <AddWingForm
        userId={userId}
        spotId={spotId}
        onSuccess={() => router.push(`/spots/${spotId}`)}
      />
    </>
  );
};

export default AddWing;
