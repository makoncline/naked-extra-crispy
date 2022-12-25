import { router } from "../trpc";
import { authRouter } from "./auth";
import { routes } from "./routes";

export const appRouter = router({
  public: routes,
  auth: authRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
