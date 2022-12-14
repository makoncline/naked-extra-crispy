const sendToMakonBaseUrl = "https://send-to-makon.vercel.app/api";

export const siteConfig = {
  title: "Naked Extra Crispy",
  description: "A site for wing enthusiasts",
  baseUrl: "https://nakedextracrispy.com",
  cloudinaryImageUploadPreset: "naked-extra-crispy",
  cloudinaryCloudName: "makon-dev",
  sendEmailUrl: `${sendToMakonBaseUrl}/send-email`,
  sendTextUrl: `${sendToMakonBaseUrl}/send-text`,
  twitterHandle: "@nakedxtracrispy",
} as const;
