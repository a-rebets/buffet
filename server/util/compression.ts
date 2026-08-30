import { Effect } from "effect";
import { HttpServerRequest, HttpServerResponse } from "effect/unstable/http";
import { isProduction } from "./production";

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

export const getCompressedAssets = async (): Promise<CompressedAssets> => {
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

  const winner = candidates[0];
  if (!winner) return "not_acceptable";
  return winner.coding;
};

const assetKey = (pathname: string, assets: CompressedAssets): string => {
  if (pathname === "/" || pathname === "") return "/index.html";
  if (assets.br.has(pathname) || assets.gzip.has(pathname)) return pathname;
  if (
    !pathname.includes(".") &&
    (assets.br.has("/index.html") || assets.gzip.has("/index.html"))
  ) {
    return "/index.html";
  }
  return pathname;
};

const withVary = (
  response: HttpServerResponse.HttpServerResponse,
): HttpServerResponse.HttpServerResponse => {
  const existing = response.headers.vary;
  const vary = existing?.includes("Accept-Encoding")
    ? existing
    : existing
      ? `${existing}, Accept-Encoding`
      : "Accept-Encoding";
  return HttpServerResponse.setHeader(response, "vary", vary);
};

export const precompression =
  (assets: CompressedAssets) =>
  <E, R>(
    httpEffect: Effect.Effect<HttpServerResponse.HttpServerResponse, E, R>,
  ): Effect.Effect<
    HttpServerResponse.HttpServerResponse,
    E,
    R | HttpServerRequest.HttpServerRequest
  > =>
    Effect.gen(function* () {
      const request = yield* HttpServerRequest.HttpServerRequest;
      const pathname = request.url.split("?")[0] ?? "/";

      if (
        pathname.startsWith("/gzip/") ||
        pathname.startsWith("/brotli/") ||
        pathname.endsWith(".gz") ||
        pathname.endsWith(".br")
      ) {
        return HttpServerResponse.empty({ status: 404 });
      }

      const response = yield* httpEffect;

      if (response.status === 304) {
        return withVary(response);
      }
      if (response.status !== 200) {
        return response;
      }

      const key = assetKey(pathname, assets);
      const brFile = assets.br.get(key);
      const gzipFile = assets.gzip.get(key);
      if (!brFile && !gzipFile) return response;

      const available: ContentCoding[] = (
        ["br", "gzip", "identity"] as const
      ).filter((coding) => {
        if (coding === "br") return Boolean(brFile);
        if (coding === "gzip") return Boolean(gzipFile);
        return true;
      });

      const chosen = negotiateEncoding(
        request.headers["accept-encoding"],
        available,
      );

      if (chosen === "not_acceptable") {
        return HttpServerResponse.empty({ status: 406 });
      }
      if (chosen === "identity") {
        return withVary(response);
      }

      const compressedPath = chosen === "br" ? brFile : gzipFile;
      if (!compressedPath) return withVary(response);

      const headers: Record<string, string> = { ...response.headers };
      delete headers["content-length"];
      headers["content-encoding"] = chosen;
      const existingVary = headers.vary;
      headers.vary = existingVary?.includes("Accept-Encoding")
        ? existingVary
        : existingVary
          ? `${existingVary}, Accept-Encoding`
          : "Accept-Encoding";

      return HttpServerResponse.raw(Bun.file(compressedPath), {
        status: 200,
        headers,
      });
    });
