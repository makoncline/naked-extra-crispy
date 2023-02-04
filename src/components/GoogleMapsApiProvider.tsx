import React from "react";
import { env } from "../env/client.mjs";
import Script from "next/script";

const GoogleMapsApiContext = React.createContext<{
  isGoogleMapsApiReady: boolean;
} | null>(null);

export const GoogleMapsApiProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isReady, setIsReady] = React.useState(false);
  const initMap = () => {
    setIsReady(true);
  };
  React.useEffect(() => {
    (window as any).initMap = initMap;
  }, []);
  return (
    <>
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&callback=initMap&libraries=places`}
        strategy="lazyOnload"
        onReady={() => setIsReady(true)}
      />
      <GoogleMapsApiContext.Provider value={{ isGoogleMapsApiReady: isReady }}>
        {children}
      </GoogleMapsApiContext.Provider>
    </>
  );
};

export const useGoogleMapsApi = () => {
  const context = React.useContext(GoogleMapsApiContext);
  if (!context) {
    throw new Error(
      "useGoogleMapsApi must be used within a GoogleMapsApiProvider"
    );
  }
  return context;
};
