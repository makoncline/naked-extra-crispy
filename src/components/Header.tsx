import Head from "next/head";
import { siteConfig } from "../siteConfig";

export const Header = ({
  title = siteConfig.title,
  description = siteConfig.description,
}: {
  title?: string;
  description?: string;
}) => {
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="icon" href="/favicon.ico" />
    </Head>
  );
};
