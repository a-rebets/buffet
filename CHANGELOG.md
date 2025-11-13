## November 2025

- Added gzip compression support across the Bun + Elysia stack. Build artifacts are precompressed via `scripts/compression.ts`, and the `compressionPlugin` in `server/util/compression.ts` serves the `.gz` assets with the correct headers in production.
- Added rate limiting using `elysia-rate-limit`.
