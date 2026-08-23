import { brotliCompressSync, constants as zlibConstants } from "node:zlib";
import { $ } from "bun";
import { c, colors } from "./printing";

const defaultDistDir = `${process.cwd()}/dist`;
const compressibleExtensions = [".html", ".css", ".js"];

export async function compressBuildAssets(distDir: string = defaultDistDir) {
  const initialSize = await sizeToken($`du -sh`.cwd(distDir).quiet());

  const glob = new Bun.Glob("**/*");
  const files: string[] = [];

  for await (const path of glob.scan({ cwd: distDir, onlyFiles: true })) {
    if (
      path.endsWith(".gz") ||
      path.endsWith(".br") ||
      path.startsWith("gzip/") ||
      path.startsWith("brotli/")
    ) {
      continue;
    }
    files.push(path);
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

  const gzipDir = `${distDir}/gzip`;
  const brotliDir = `${distDir}/brotli`;
  await $`mkdir -p ${gzipDir} ${brotliDir}`.quiet();

  for (const path of targets) {
    const absolutePath = `${distDir}/${path}`;
    const source = new Uint8Array(await Bun.file(absolutePath).arrayBuffer());

    await Bun.write(`${gzipDir}/${path}.gz`, Bun.gzipSync(source));
    await Bun.write(
      `${brotliDir}/${path}.br`,
      brotliCompressSync(source, {
        params: {
          [zlibConstants.BROTLI_PARAM_QUALITY]: 11,
          [zlibConstants.BROTLI_PARAM_SIZE_HINT]: source.byteLength,
        },
      }),
    );
  }

  const gzipSize = await sizeToken($`du -sh`.cwd(gzipDir).quiet());
  const brotliSize = await sizeToken($`du -sh`.cwd(brotliDir).quiet());

  const percent = ((targets.length / files.length) * 100).toFixed(2);

  console.log(
    c(
      colors.accent,
      `Compressed ${targets.length}/${files.length} assets (${initialSize} raw → gzip ${gzipSize}, brotli ${brotliSize}, ${percent}%)`,
    ),
  );
}

async function sizeToken(promise: ReturnType<typeof $>) {
  const { stdout } = await promise;
  return stdout.toString().trim().split(/\s+/)[0] ?? "0";
}
