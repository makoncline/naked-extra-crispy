export const uploadImage = async (image: string): Promise<string> => {
  const fileUploadBody = {
    file: image,
    upload_preset: "naked-extra-crispy",
  };
  const data = await fetch(
    "https://api.cloudinary.com/v1_1/makon-dev/image/upload",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(fileUploadBody),
    }
  ).then((r) => {
    return r.json();
  });
  return data.public_id;
};
