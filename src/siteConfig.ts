const sendToMakonBaseUrl = "https://send-to-makon.vercel.app/api";

export const siteConfig = {
  title: "Naked Extra Crispy",
  description: "A site for wing enthusiasts",
  cloudinaryCloudName: "makon-dev",
  sendEmailUrl: `${sendToMakonBaseUrl}/send-email`,
  sendTextUrl: `${sendToMakonBaseUrl}/send-text`,
  twitterHandle: "@nakedxtracrispy",
  adminUserIds: [
    "cl9bos7lo003409kxye1fi1dq", // makon
    "cl9bp89e1074909mrlutzjdrs", // channing
  ],
  revalidate: 60 * 60 * 24, // 24 hours
};
