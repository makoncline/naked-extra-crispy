import { useSession, signIn } from "next-auth/react";
import { AddSpotForm } from "../../components/AddSpotForm";
import { Loading } from "../../components/Loading";
import { useRouter } from "next/router";
import { Layout } from "../../components/Layout";
import { Space } from "../../components/Space";
import React from "react";
import Script from "next/script";
import { env } from "../../env/client.mjs";
import { isGoogleMapsAvailable } from "../../lib/isGoogleMapsAvailable";

const AddSpot = () => {
  const [googleMapsLoading, setGoogleMapsLoading] = React.useState(true);
  const canUseGoogleMaps = isGoogleMapsAvailable();
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
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
        strategy="lazyOnload"
        onLoad={() => setGoogleMapsLoading(false)}
      />
      <Layout>
        <h1>Add Spot</h1>
        <Space size="sm" />
        {googleMapsLoading && !canUseGoogleMaps ? (
          <Loading />
        ) : (
          <AddSpotForm
            userId={userId}
            onSuccess={(spotId) => router.push(`/spots/${spotId}`)}
          />
        )}
      </Layout>
    </>
  );
};

export default AddSpot;
