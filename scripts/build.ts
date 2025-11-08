import { SveltePlugin } from "bun-plugin-svelte";
import TailwindCSSPlugin from "bun-plugin-tailwind";
import { printBuildInfo } from "./build-info";

const result = await Bun.build({
  entrypoints: ["public/index.html"],
  outdir: "./dist",
  plugins: [SveltePlugin(), TailwindCSSPlugin],
  minify: true,
  sourcemap: false,
  target: "browser",
  splitting: true,
});

await printBuildInfo(result);

process.exit(result.success ? 0 : 1);
