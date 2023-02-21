import { useSession, signIn } from "next-auth/react";
import { AddSpotForm } from "../../components/AddSpotForm";
import { Loading } from "../../components/Loading";
import { useRouter } from "next/router";
import { Layout } from "../../components/Layout";
import { Space } from "../../components/Space";
import React from "react";
import { GoogleMapsApiProvider } from "../../components/GoogleMapsApiProvider";

const AddSpot = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  if (status === "loading") {
    return <Loading />;
  }
  const userId = session?.user?.id;
  if (!userId) {
    signIn("google");
    return null;
  }
  return (
    <GoogleMapsApiProvider>
      <Layout>
        <h1>Add Spot</h1>
        <Space size="sm" />
        <AddSpotForm
          userId={userId}
          onSuccess={(spotId) => router.push(`/spots/${spotId}`)}
        />
      </Layout>
    </GoogleMapsApiProvider>
  );
};

export default AddSpot;
