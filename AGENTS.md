# Buffet

Buffet is a Bun + Svelte SPA template. Keep the dependency list small. Every package has to earn its place. Prefer Bun built-ins and Effect over a new library. Tooling is Bun-native. See `.cursor/rules/` for the Bun-first stance. No Node CLIs, no Vite. Effect is the server backbone. Types start in the HttpApi contract and reach the Svelte client through generated OpenAPI types. Effect must never enter the client bundle graph. Type-only imports are the only exception.

## Layout

`shared/api.ts` is the HttpApi contract, written with Effect Schema. `server/` implements the handlers in the Effect runtime. `scripts/openapi.ts` runs `OpenApi.fromApi` into `.openapi/openapi.json`, then `openapi-typescript` writes `src/lib/api-types.gen.ts`. The browser calls the API through `openapi-fetch` in `src/lib/api.ts`. Svelte components sit on top of that client via TanStack Query.

- `app.ts` starts `BunHttpServer` (`@effect/platform-bun`).
- `server/api.ts` mounts HttpApi routes, Better Auth at `/api/auth/*`, CORS, rate limiting, and in production `HttpStaticServer` plus precompression.
- `server/db.ts` is SQLite via `@effect/sql-sqlite-bun` and drizzle. Schema lives under `server/`. Committed SQL is in `migrations/`.
- `server/auth` is Better Auth as a web handler. `server/util` holds the rate limiter and precompression middleware.
- `src/` is the Svelte 5 SPA: sv-router codegen, shadcn-svelte/bits-ui, Tailwind 4.
- `scripts/build.ts` bundles with `Bun.build`. `bun test` spawns the real server (`tests/helpers.ts`).

## Commands

- `bun dev` runs sv-router codegen, `generate:api`, then watches `app.ts`.
- `bun test` runs integration tests against a spawned server.
- `bun run lint` runs `biome check --fix` then `svelte-check`. Biome rewrites files in place.
- `bun run build` writes the client bundle to `dist/`.
- `bun run db:generate` after drizzle schema changes under `server/`.
- `bun run generate:api` after changing `shared/api.ts`. `postinstall` and `dev` already run it.

## Hard rules

Never import `effect` at runtime from `src/**`.

Do not edit or commit `.router/`, `.openapi/`, or `src/lib/api-types.gen.ts`.

Effect HTTP modules live under `effect/unstable/http` and `effect/unstable/httpapi`. Check the pinned version in `package.json` before assuming signatures.
