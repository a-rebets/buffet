import { Elysia, file, status, type HTTPHeaders } from "elysia";
import { isProduction } from "elysia/error";

type ContentCoding = "br" | "gzip" | "identity";

type CompressedAssets = {
  br: Map<string, string>;
  gzip: Map<string, string>;
};

const CODING_PREFERENCE: Record<ContentCoding, number> = {
  br: 3,
  gzip: 2,
  identity: 1,
};

const getCompressedAssets = async (): Promise<CompressedAssets> => {
  const br = new Map<string, string>();
  const gzip = new Map<string, string>();

  if (!isProduction) return { br, gzip };

  const brGlob = new Bun.Glob("**/*.br");
  for await (const asset of brGlob.scan({
    cwd: "dist/brotli",
    onlyFiles: true,
  })) {
    br.set(`/${asset.replace(/\.br$/, "")}`, `dist/brotli/${asset}`);
  }

  const gzipGlob = new Bun.Glob("**/*.gz");
  for await (const asset of gzipGlob.scan({
    cwd: "dist/gzip",
    onlyFiles: true,
  })) {
    gzip.set(`/${asset.replace(/\.gz$/, "")}`, `dist/gzip/${asset}`);
  }

  return { br, gzip };
};

const copyHeadersFromResponse = (source: Response, target: HTTPHeaders) => {
  source.headers.forEach((value, key) => {
    if (!(key in target)) target[key] = value;
  });
};

/** Parse Accept-Encoding into coding → q-value. Missing header ⇒ identity only. */
export const parseAcceptEncoding = (
  header: string | null | undefined,
): Map<string, number> => {
  if (header == null || header.trim() === "") {
    return new Map([["identity", 1]]);
  }

  const result = new Map<string, number>();

  for (const part of header.split(",")) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    const [codingToken, ...params] = trimmed.split(";");
    const coding = codingToken.trim().toLowerCase();
    if (!coding) continue;

    let q = 1;
    for (const param of params) {
      const [rawKey, rawValue] = param.split("=");
      if (rawKey?.trim().toLowerCase() !== "q") continue;
      const parsed = Number.parseFloat(rawValue?.trim() ?? "");
      q = Number.isFinite(parsed) ? Math.min(1, Math.max(0, parsed)) : 0;
    }

    result.set(coding, q);
  }

  return result;
};

const qualityFor = (
  accept: Map<string, number>,
  coding: ContentCoding,
): number => {
  if (accept.has(coding)) return accept.get(coding) ?? 0;
  if (accept.has("*")) return accept.get("*") ?? 0;
  // identity is acceptable unless explicitly refused via identity or *
  if (coding === "identity") return 1;
  return 0;
};

export const negotiateEncoding = (
  acceptHeader: string | null | undefined,
  available: ContentCoding[],
): ContentCoding | "not_acceptable" => {
  const accept = parseAcceptEncoding(acceptHeader);
  const candidates = available
    .map((coding) => ({
      coding,
      q: qualityFor(accept, coding),
      preference: CODING_PREFERENCE[coding],
    }))
    .filter((entry) => entry.q > 0);

  if (candidates.length === 0) return "not_acceptable";

  candidates.sort((a, b) => b.q - a.q || b.preference - a.preference);

  return candidates[0]!.coding;
};

const normalizeAssetPath = (route: string, requestUrl: string): string => {
  if (route === "/*" || route === "/") return "/index.html";
  if (route && route !== "/*") return route;

  const pathname = new URL(requestUrl).pathname;
  if (pathname === "/" || pathname === "") return "/index.html";
  return pathname;
};

export const compressionPlugin = new Elysia({ name: "compression" })
  .decorate("compressedAssets", await getCompressedAssets())
  .onAfterHandle(
    { as: "global" },
    ({ compressedAssets, set, route, request, response, headers }) => {
      const normalizedPath = normalizeAssetPath(route, request.url);
      const brFile = compressedAssets.br.get(normalizedPath);
      const gzipFile = compressedAssets.gzip.get(normalizedPath);

      // Only negotiate assets that have at least one precompressed variant.
      if (!brFile && !gzipFile) return;

      const currentStatus =
        response instanceof Response ? response.status : (set.status ?? 200);

      // Leave redirects and errors alone; still attach Vary on 304.
      if (typeof currentStatus === "number" && currentStatus === 304) {
        set.headers.vary = "Accept-Encoding";
        return;
      }

      if (typeof currentStatus === "number" && currentStatus !== 200) {
        return;
      }

      const available: ContentCoding[] = (
        ["br", "gzip", "identity"] as const
      ).filter((coding) => {
        if (coding === "br") return Boolean(brFile);
        if (coding === "gzip") return Boolean(gzipFile);
        return true;
      });

      const acceptEncoding =
        headers?.["accept-encoding"] ?? request.headers.get("accept-encoding");

      const chosen = negotiateEncoding(acceptEncoding, available);

      set.headers.vary = "Accept-Encoding";

      if (chosen === "not_acceptable") {
        return status(406, "Not Acceptable");
      }

      if (chosen === "identity") {
        return;
      }

      const compressedPath = chosen === "br" ? brFile : gzipFile;
      if (!compressedPath) return;

      if (response instanceof Response)
        copyHeadersFromResponse(response, set.headers);

      // Compressed body length replaces any identity Content-Length.
      delete set.headers["content-length"];
      set.headers["content-encoding"] = chosen;

      return file(compressedPath);
    },
  );
