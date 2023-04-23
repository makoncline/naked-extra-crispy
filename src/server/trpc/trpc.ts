import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";

import { type Context } from "./context";
import { env } from "../../env/server.mjs";

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return shape;
  },
});

export const router = t.router;

/**
 * Unprotected procedure
 **/
export const publicProcedure = t.procedure;

/**
 * Reusable middleware to ensure
 * users are logged in
 */
const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      // infers the `session` as non-nullable
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});

/**
 * Protected procedure
 **/
export const protectedProcedure = t.procedure.use(isAuthed);

/**
 * Reusable middleware to ensure
 * authorization header is present and valid
 */
const isAuthTokenValidated = t.middleware(({ ctx, next }) => {
  if (ctx.headers?.authorization !== env.AUTH_TOKEN) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next();
});

/**
 * Auth token protected procedure
 **/
export const authTokenProtectedProcedure =
  t.procedure.use(isAuthTokenValidated);
