import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import "../styles/globals.css";
import { trpc } from "../utils/trpc";
import { DefaultSeo } from "next-seo";
import { siteConfig } from "../siteConfig";
import { env } from "../env/client.mjs";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <>
      <DefaultSeo
        title={siteConfig.title}
        description={siteConfig.description}
        canonical={env.NEXT_PUBLIC_BASE_URL}
        openGraph={{
          type: "website",
          locale: "en_IE",
          url: env.NEXT_PUBLIC_BASE_URL,
          siteName: siteConfig.title,
          title: siteConfig.title,
          description: siteConfig.description,
          images: [
            {
              url: `${env.NEXT_PUBLIC_BASE_URL}/nxcLogoWithBg.webp`,
              width: 400,
              height: 400,
              alt: `${siteConfig.title} logo`,
              type: "image/webp",
            },
          ],
        }}
        twitter={{
          handle: siteConfig.twitterHandle,
          site: siteConfig.twitterHandle,
          cardType: "summary_large_image",
        }}
      />
      <SessionProvider session={session}>
        <Component {...pageProps} />
      </SessionProvider>
    </>
  );
};

export default trpc.withTRPC(MyApp);
