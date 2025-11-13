import Elysia from "elysia";
import { isProduction } from "elysia/error";

const getCompressedAssets = async () => {
  const glob = new Bun.Glob("**/*.gz");
  const entries = new Map<string, string>();

  if (!isProduction) return entries;

  for await (const file of glob.scan({ cwd: "dist", onlyFiles: true })) {
    entries.set(`/${file.replace(/\.gz$/, "")}`, `dist/${file}`);
  }
  return entries;
};

export const compressionPlugin = new Elysia({ name: "compression" })
  .decorate("compressedAssets", await getCompressedAssets())
  .onAfterHandle(
    { as: "global" },
    ({ compressedAssets, set, responseValue, route }) => {
      const normalizedPath = route === "/*" ? "/index.html" : route;
      const gzFile = compressedAssets.get(normalizedPath);

      if (!gzFile) return;

      const contentType =
        responseValue instanceof Response
          ? responseValue.headers.get("Content-Type")
          : null;

      set.headers["Content-Encoding"] = "gzip";
      set.headers.Vary = "Accept-Encoding";
      if (contentType) {
        set.headers["Content-Type"] = contentType;
      }

      return Bun.file(gzFile);
    },
  );
