// src/server/router/index.ts
import { createRouter } from "./context";
import superjson from "superjson";

import { router } from "./router";
import { protectedRouter } from "./protectedRouter";

export const appRouter = createRouter()
  .transformer(superjson)
  .merge("", router)
  .merge("protected.", protectedRouter);

// export type definition of API
export type AppRouter = typeof appRouter;
