import { router } from "../trpc";
import { authRouter } from "./auth";
import { publicRouter } from "./public";
import { socialRouter } from "./social";

export const appRouter = router({
  public: publicRouter,
  auth: authRouter,
  social: socialRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
