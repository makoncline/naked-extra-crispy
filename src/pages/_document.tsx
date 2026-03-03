import { Head, Html, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en" className="dark" style={{ colorScheme: "dark" }}>
      <Head>
        <meta name="theme-color" content="#111525" />
      </Head>
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
