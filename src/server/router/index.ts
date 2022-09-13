// src/server/router/index.ts
import { createRouter } from "./context";
import superjson from "superjson";

import { routes } from "./routes";
import { protectedRoutes } from "./protectedRoutes";

export const appRouter = createRouter()
  .transformer(superjson)
  .merge("", routes)
  .merge("protected.", protectedRoutes);

// export type definition of API
export type AppRouter = typeof appRouter;
