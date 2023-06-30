import { NextPage, GetServerSidePropsContext } from "next";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/router";
import { AddWingForm } from "../../../components/AddWingForm";
import { Layout } from "../../../components/Layout";
import { Loading } from "../../../components/Loading";
import { Space } from "../../../components/Space";
import { trpc } from "../../../utils/trpc";

const AddWing: NextPage<{ spotId: string }> = ({ spotId }) => {
  const router = useRouter();
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

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { id } = context.params || {};

  if (typeof id !== "string") {
    return { notFound: true };
  }

  return {
    props: { spotId: id },
  };
}

export default AddWing;
