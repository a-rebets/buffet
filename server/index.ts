import { staticPlugin } from "@elysiajs/static";
import { Elysia } from "elysia";
import { isProduction } from "elysia/error";
import { rateLimit } from "elysia-rate-limit";
import indexHtml from "../public/index.html";
import { apiRouter } from "./api";
import { initializeSchema, runWithSql } from "./db";
import { compressionPlugin } from "./util/compression";
import { ensureClientBundleInProd } from "./util/production";

await ensureClientBundleInProd();

/*
 * ========================================================
 *   DEVELOPERS - SOME IMPORTANT STUFF YOU SHOULD KNOW
 * ========================================================
 *
 * - the order of the plugins you add matters! meaning events like
 *   .onError() or .onBeforeHandle() will apply only to routes that
 *   are registered after them.
 * - Elysia has this precedence for different types of routes:
 *   static > dynamic > wildcard.
 * - when two routes have the same priority (e.g. two static routes),
 *   the one that was registered first is used.
 * - .all() handler is weaker than a handler for a specific HTTP verb,
 *   meaning .all("/test/*") will not match when .get("/*") exists even
 *   if the GET request was sent to "/test/something".
 * - more here: https://elysiajs.com/key-concept.html
 *
 * - right now relying on Bun as the bundler for SPAs is rough. it works but,
 *   for example, a hack was added below to prevent Bun from short-circuiting
 *   routing internals of Elysia, this should be fixed in the future.
 */

const app = new Elysia({
	serve: isProduction
		? undefined
		: {
				routes: {
					"/api/*": false,
				},
			},
})
	.use(rateLimit())
	.use(compressionPlugin)
	.use(apiRouter)
	.use(
		isProduction
			? await staticPlugin({
					assets: "dist",
					prefix: "/",
					alwaysStatic: true,
					indexHTML: false,
				})
			: undefined,
	)
	.get(
		"/*",
		isProduction ? () => new Response(Bun.file("dist/index.html")) : indexHtml,
	)
	.onStart(async ({ server }) => {
		await runWithSql(initializeSchema);
		console.log(
			`${isProduction ? "[PROD]" : "[DEV]"} 🚀 Server running on port ${server?.port}`,
		);
	})
	.listen(3000);

export type App = typeof app;
