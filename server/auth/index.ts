import { Database } from "bun:sqlite";
import { DB_PATH } from "@server/util/constants";
import { Authorization, CurrentUser } from "@shared/api";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { Effect, Layer } from "effect";
import {
  HttpEffect,
  HttpRouter,
  HttpServerRequest,
} from "effect/unstable/http";
import { HttpApiError } from "effect/unstable/httpapi";
import * as schema from "./schema";

const publicOrigin =
  process.env.BETTER_AUTH_URL ??
  process.env.BUN_PUBLIC_DOMAIN ??
  "http://localhost:3000";

export const auth = betterAuth({
  baseURL: publicOrigin,
  basePath: "/api/auth",
  database: drizzleAdapter(drizzle({ client: new Database(DB_PATH) }), {
    provider: "sqlite",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
  },
  trustedOrigins: [publicOrigin],
});

export const AuthorizationLive = Layer.succeed(
  Authorization,
  Authorization.of((httpEffect) =>
    Effect.gen(function* () {
      const request = yield* HttpServerRequest.HttpServerRequest;
      const headers =
        request.source instanceof Request
          ? request.source.headers
          : new Headers(request.headers);
      const session = yield* Effect.tryPromise({
        try: () => auth.api.getSession({ headers }),
        catch: () => new HttpApiError.Unauthorized(),
      });
      if (!session) {
        return yield* new HttpApiError.Unauthorized();
      }
      return yield* Effect.provideService(httpEffect, CurrentUser, {
        id: session.user.id,
      });
    }),
  ),
);

export const AuthLive = HttpRouter.add(
  "*",
  "/api/auth/*",
  HttpEffect.fromWebHandler((request) => auth.handler(request)),
);
