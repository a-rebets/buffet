import { $, type BuildOutput } from "bun";
import { c, colors } from "./printing";

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

    console.log(c(colors.primary, "\n📦 Build Assets", true));
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
        colors.primary,
        "\n  Buffet is ready. Bon appétit! 🥐  \n",
        false,
        colors.accentDark,
      ),
    );
  } else {
    console.error(c("white", `\n🚨 Buffet build failed!\n`, false, "#440000"));
    for (const log of result.logs) console.error(log);
  }
}
