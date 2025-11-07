import { $ } from "bun";
import { SveltePlugin } from "bun-plugin-svelte";
import TailwindCSSPlugin from "bun-plugin-tailwind";

const c = (color: string, text: string, bold = false) =>
  `${bold ? "\x1b[1m" : ""}${Bun.color(color, "ansi")}${text}\x1b[0m`;

const result = await Bun.build({
  entrypoints: ["public/index.html"],
  outdir: "./dist",
  plugins: [SveltePlugin(), TailwindCSSPlugin],
  minify: true,
  sourcemap: false,
  target: "browser",
});

if (result.success) {
  const assets = await Promise.all(
    result.outputs.map(async (o) => {
      const path = o.path.replace(`${process.cwd()}/`, "");
      const { stdout } = await $`du -h ${o.path} | awk '{print $1}'`.quiet();
      return {
        path,
        sizeStr: stdout.toString().trim(),
        sizeBytes: Bun.file(o.path).size,
      };
    }),
  );

  assets.sort((a, b) => a.sizeBytes - b.sizeBytes);

  console.log(c("hsl(45, 98%, 61%)", "📦 Build Assets", true));
  console.log(c("#a8a29e", "─".repeat(54)));

  for (const a of assets) {
    const file =
      a.path.length % 2 === 0
        ? c("hsl(45, 98%, 61%)", a.path.padEnd(40))
        : c("#facc15", a.path.padEnd(40));
    console.log(`${file} ${c("#a8a29e", a.sizeStr, true)}`);
  }

  console.log(
    `\n\x1b[48;2;255;193;7m\x1b[30m\x1b[1m Buffet is ready. Bon appétit! 🥐 \x1b[0m\n`,
  );
} else {
  console.error(c("red", `\n🍽️ Buffet build failed!\n`));
  for (const log of result.logs) console.error(log);
}

process.exit(result.success ? 0 : 1);
