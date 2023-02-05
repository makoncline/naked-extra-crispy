import { NextApiRequest, NextApiResponse } from "next";

const blurImageProxy = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const imageUrl = req.query.imageUrl as string;
    const response = await fetch(imageUrl);
    const imageData = await response.arrayBuffer();
    const contentType = response.headers.get("Content-Type") as string;
    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "max-age=31536000,public,immutable");
    res.status(200).send(Buffer.from(imageData));
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    }
  }
};

export default blurImageProxy;
