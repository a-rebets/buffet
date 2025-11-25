import { SveltePlugin } from "bun-plugin-svelte";
import TailwindCSSPlugin from "bun-plugin-tailwind";
import { printBuildInfo } from "./build-info";
import { compressBuildAssets } from "./compression";

const result = await Bun.build({
  entrypoints: ["public/index.html"],
  outdir: "./dist",
  plugins: [SveltePlugin(), TailwindCSSPlugin],
  minify: true,
  sourcemap: false,
  target: "browser",
  splitting: true,
  env: "inline",
  naming: {
    chunk: "chunk-[name]-[hash].[ext]",
    asset: "asset-[name]-[hash].[ext]",
  },
});

await printBuildInfo(result);

if (result.success) {
  await compressBuildAssets();
}

process.exit(result.success ? 0 : 1);
