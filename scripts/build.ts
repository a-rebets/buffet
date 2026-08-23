import { mkdir } from "node:fs/promises";
import { SveltePlugin } from "bun-plugin-svelte";
import TailwindCSSPlugin from "bun-plugin-tailwind";
import { printBuildInfo } from "./build-info";
import { compressBuildAssets } from "./compression";

// Paths are resolved relative to outdir; use ../ so reports stay outside dist.
const reportDir = ".bundle-reports";
const writeBundleReports =
  process.env.BUNDLE_REPORT === "1" || process.env.BUNDLE_REPORT === "true";

if (writeBundleReports) {
  await mkdir(reportDir, { recursive: true });
}

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
  ...(writeBundleReports
    ? {
        metafile: {
          json: `../${reportDir}/meta.json`,
          markdown: `../${reportDir}/meta.md`,
        },
      }
    : {}),
});

await printBuildInfo(result);

if (result.success) {
  await compressBuildAssets();
}

process.exit(result.success ? 0 : 1);
