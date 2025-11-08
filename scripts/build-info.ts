import { $, type BuildOutput } from "bun";

const colors = {
  accent: "#ffd569",
  accentBold: "#f59e0b",
  accentDark: "#b45309",
  muted: "#a8a29e",
} as const;

const c = (color: string, text: string, bold = false, background?: string) => {
  const fg = Bun.color(color, "ansi") ?? "";
  const rawBg = background ? Bun.color(background, "ansi") : null;
  const bg = rawBg ? rawBg.replace("[38", "[48") : "";
  return `${bold ? "\x1b[1m" : ""}${bg}${fg}${text}\x1b[0m`;
};

export async function printBuildInfo(result: BuildOutput): Promise<void> {
  if (result.success) {
    const cwd = `${process.cwd()}/`;
    const assets = await Promise.all(
      result.outputs.map(async (o) => {
        const path = o.path.replace(cwd, "");
        const sizeBytes = Bun.file(o.path).size;
        const { stdout } = await $`du -h ${o.path} | awk '{print $1}'`.quiet();
        return {
          path,
          sizeBytes,
          sizeStr: stdout.toString().trim(),
        };
      }),
    );

    assets.sort((a, b) => a.sizeBytes - b.sizeBytes);

    console.log(c(colors.accentBold, "📦 Build Assets", true));
    console.log(c(colors.muted, "─".repeat(54)));

    for (const a of assets) {
      console.log(
        `${c(colors.accent, a.path.padEnd(40))} ${c(
          colors.muted,
          a.sizeStr.padStart(8),
          true,
        )}`,
      );
    }

    console.log(
      c(
        colors.accentDark,
        "\n  Buffet is ready. Bon appétit! 🥐  \n",
        true,
        colors.accent,
      ),
    );
  } else {
    console.error(c("red", `\n🍽️ Buffet build failed!\n`));
    for (const log of result.logs) console.error(log);
  }
}
