import { useSession, signIn } from "next-auth/react";
import { AddWingForm } from "../../../components/AddWingForm";
import { Loading } from "../../../components/Loading";
import { useRouter } from "next/router";
import { NextPage } from "next";
import { Layout } from "../../../components/Layout";
import { trpc } from "../../../utils/trpc";
import { Space } from "../../../components/Space";

const AddWing: NextPage = () => {
  const router = useRouter();
  const spotId = router.query.id as string;
  const { data: spot } = trpc.public.getSpotName.useQuery({ spotId });
  const { data: session, status } = useSession();
  const isLoading = status === "loading" || !spot;
  if (isLoading) {
    return <Loading />;
  }
  const userId = session?.user?.id;
  if (!userId) {
    signIn("google");
    return null;
  }
  return (
    <Layout>
      <h1>{spot.name}</h1>
      <Space size="sm" />
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
