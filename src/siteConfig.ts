const sendToMakonBaseUrl = "https://send-to-makon.vercel.app/api";

export const siteConfig = {
  title: "Naked Extra Crispy",
  description: "A site for wing enthusiasts",
  cloudinaryImageUploadPreset: "naked-extra-crispy",
  cloudinaryCloudName: "makon-dev",
  sendEmailUrl: `${sendToMakonBaseUrl}/send-email`,
  sendTextUrl: `${sendToMakonBaseUrl}/send-text`,
} as const;
