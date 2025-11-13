import { $ } from "bun";
import { c, colors } from "./printing";

const defaultDistDir = `${process.cwd()}/dist`;
const compressibleExtensions = [".html", ".css", ".js"];

export async function compressBuildAssets(distDir: string = defaultDistDir) {
  const initialSize = await sizeToken($`du -sh`.cwd(distDir).quiet());

  const glob = new Bun.Glob("**/*");
  const files: string[] = [];

  for await (const path of glob.scan({ cwd: distDir, onlyFiles: true })) {
    if (!path.endsWith(".gz")) {
      files.push(path);
    }
  }

  if (files.length === 0) {
    return;
  }

  const targets = files.filter((path) =>
    compressibleExtensions.some((ext) => path.endsWith(ext)),
  );

  if (targets.length === 0) {
    return;
  }

  for (const path of targets) {
    const absolutePath = `${distDir}/${path}`;
    const source = await Bun.file(absolutePath).arrayBuffer();
    await Bun.write(`${absolutePath}.gz`, Bun.gzipSync(new Uint8Array(source)));
  }

  const finalSize = await sizeToken(
    $`(find . -maxdepth 1 -name '*.gz'; find . -maxdepth 1 -type f ! -name '*.gz' ! -exec test -f {}.gz \\;) | xargs du -ch | tail -1`
      .cwd(distDir)
      .quiet(),
  );

  const percent = ((targets.length / files.length) * 100).toFixed(2);

  console.log(
    c(
      colors.accent,
      `Compressed ${targets.length}/${files.length} assets (${initialSize} -> ${finalSize}, ${percent}%)`,
    ),
  );
}

async function sizeToken(promise: ReturnType<typeof $>) {
  const { stdout } = await promise;
  return stdout.toString().trim().split(/\s+/)[0] ?? "0";
}
