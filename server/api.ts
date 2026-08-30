import { AuthLive } from "@server/auth";
import { AppLayer } from "@server/db";
import { ThoughtsLive } from "@server/thoughts";
import { getCompressedAssets, precompression } from "@server/util/compression";
import { CACHE_MAX_AGE } from "@server/util/constants";
import { isProduction } from "@server/util/production";
import { rateLimit } from "@server/util/rate-limiting";
import { Api } from "@shared/api";
import { Effect, Layer } from "effect";
import { HttpRouter, HttpStaticServer } from "effect/unstable/http";
import { HttpApiBuilder } from "effect/unstable/httpapi";

const domain = process.env.BUN_PUBLIC_DOMAIN;

const CorsLive = HttpRouter.cors({
  allowedOrigins: domain ? [domain] : [],
  allowedMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
});

const RateLimitLive = HttpRouter.middleware(rateLimit, { global: true });

const PrecompressionLive = HttpRouter.middleware(
  Effect.gen(function* () {
    const assets = yield* Effect.promise(() => getCompressedAssets());
    return precompression(assets);
  }),
  { global: true },
);

const ApiRoutes = HttpApiBuilder.layer(Api).pipe(Layer.provide(ThoughtsLive));

const StaticLive = HttpStaticServer.layer({
  root: "dist",
  spa: true,
  cacheControl: `public, max-age=${CACHE_MAX_AGE}`,
});

export const Routes = Layer.mergeAll(
  ApiRoutes,
  AuthLive,
  CorsLive,
  RateLimitLive,
  ...(isProduction ? [StaticLive, PrecompressionLive] : []),
).pipe(Layer.provide(AppLayer));
