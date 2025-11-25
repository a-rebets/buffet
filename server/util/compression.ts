import { Elysia, file, type HTTPHeaders } from "elysia";
import { isProduction } from "elysia/error";

const getCompressedAssets = async () => {
  const glob = new Bun.Glob("**/*.gz");
  const entries = new Map<string, string>();

  if (!isProduction) return entries;

  for await (const asset of glob.scan({ cwd: "dist/gzip", onlyFiles: true })) {
    entries.set(`/${asset.replace(/\.gz$/, "")}`, `dist/gzip/${asset}`);
  }

  return entries;
};

const copyHeadersFromResponse = (source: Response, target: HTTPHeaders) => {
  source.headers.forEach((value, key) => {
    if (!(key in target)) target[key] = value;
  });
};

export const compressionPlugin = new Elysia({ name: "compression" })
  .decorate("compressedAssets", await getCompressedAssets())
  .onAfterHandle(
    { as: "global" },
    ({ compressedAssets, set, route, response }) => {
      const isIndexPath = route === "/*" || route === "/";
      const normalizedPath = isIndexPath ? "/index.html" : route;
      const gzFile = compressedAssets.get(normalizedPath);

      if (!gzFile) return;

      if (response instanceof Response)
        copyHeadersFromResponse(response, set.headers);

      set.headers["content-encoding"] = "gzip";
      set.headers.vary = "Accept-Encoding";

      return file(gzFile);
    },
  );
