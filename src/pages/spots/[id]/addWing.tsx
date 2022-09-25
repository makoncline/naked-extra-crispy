import { useSession, signIn } from "next-auth/react";
import { AddWingForm } from "../../../components/AddWingForm";
import { Loading } from "../../../components/Loading";
import { useRouter } from "next/router";
import { NextPage } from "next";
import { BackButton } from "../../../components/BackButton";
import { Layout } from "../../../components/Layout";
import { trpc } from "../../../utils/trpc";

const AddWing: NextPage = () => {
  const router = useRouter();
  const spotId = router.query.id as string;
  const { data: spot } = trpc.useQuery(["getSpotName", { spotId }]);
  const { data: session, status } = useSession();
  const isLoading = status === "loading" || !spot;
  if (isLoading) {
    return <Loading />;
  }
  const userId = session?.user?.id;
  if (!userId) {
    signIn();
    return null;
  }
  return (
    <Layout>
      <BackButton />
      <AddWingForm
        userId={userId}
        spotId={spotId}
        spotName={spot!.name}
        onSuccess={() => router.push(`/spots/${spotId}`)}
      />
    </Layout>
  );
};

export default AddWing;
