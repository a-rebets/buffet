import { Effect, Option } from "effect";
import { HttpServerRequest, HttpServerResponse } from "effect/unstable/http";

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 50;

type Window = {
  count: number;
  resetAt: number;
};

const windows = new Map<string, Window>();

/** Railway puts the client IP in X-Real-IP; otherwise use the socket address. */
export const clientIp = (
  request: HttpServerRequest.HttpServerRequest,
): string => {
  const railwayIp = request.headers["x-real-ip"];
  if (railwayIp) return railwayIp;
  return Option.getOrElse(request.remoteAddress, () => "");
};

const take = (
  ip: string,
  now: number,
): { limited: true; retryAfter: number } | { limited: false } => {
  let entry = windows.get(ip);
  if (!entry || entry.resetAt <= now) {
    entry = { count: 0, resetAt: now + WINDOW_MS };
    windows.set(ip, entry);
  }
  entry.count += 1;
  if (entry.count > MAX_REQUESTS) {
    return {
      limited: true,
      retryAfter: Math.max(1, Math.ceil((entry.resetAt - now) / 1000)),
    };
  }
  return { limited: false };
};

const sweep = (now: number) => {
  if (windows.size < 1024) return;
  for (const [key, entry] of windows) {
    if (entry.resetAt <= now) windows.delete(key);
  }
};

export const rateLimit = <E, R>(
  httpEffect: Effect.Effect<HttpServerResponse.HttpServerResponse, E, R>,
): Effect.Effect<
  HttpServerResponse.HttpServerResponse,
  E,
  R | HttpServerRequest.HttpServerRequest
> =>
  Effect.gen(function* () {
    const request = yield* HttpServerRequest.HttpServerRequest;
    if (!request.url.includes("/api/")) {
      return yield* httpEffect;
    }
    const now = Date.now();
    sweep(now);
    const result = take(clientIp(request), now);
    if (result.limited) {
      return HttpServerResponse.empty({
        status: 429,
        headers: { "retry-after": String(result.retryAfter) },
      });
    }
    return yield* httpEffect;
  });
