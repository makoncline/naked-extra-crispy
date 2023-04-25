import type { NextApiRequest, NextApiResponse } from "next";
import { appRouter } from "../../../server/trpc/router/_app";
import { TRPCError } from "@trpc/server";
import { getHTTPStatusCodeFromError } from "@trpc/server/http";
import { createContext } from "../../../server/trpc/context";
import { socialPostTypeSchema } from "../../../server/trpc/router/social";

const userByIdHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { type: rawType } = req.query;
  const type = socialPostTypeSchema.parse(rawType);
  const ctx = await createContext({ req, res });
  const caller = appRouter.createCaller(ctx);
  try {
    const resp = await caller.social.getNextWingSocialPostData({ type });
    res.status(200).json(resp);
  } catch (cause) {
    if (cause instanceof TRPCError) {
      // An error from tRPC occured
      const httpCode = getHTTPStatusCodeFromError(cause);
      return res.status(httpCode).json(cause);
    }
    // Another error occured
    console.error(cause);
    res.status(500).json({ message: "Internal server error" });
  }
};

export default userByIdHandler;
