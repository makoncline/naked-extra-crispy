import { useSession, signIn } from "next-auth/react";
import { AddSpotForm } from "../../components/AddSpotForm";
import { Loading } from "../../components/Loading";
import { useRouter } from "next/router";
import { BackButton } from "../../components/BackButton";
import { Layout } from "../../components/Layout";

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
    <Layout>
      <BackButton />
      <AddSpotForm
        userId={userId}
        onSuccess={(spotId) => router.push(`/spots/${spotId}`)}
      />
    </Layout>
  );
};

export default AddSpot;
