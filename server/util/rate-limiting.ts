/**
 * Custom IP generator for rate limiting that works correctly behind Railway's proxy.
 * Railway provides the client's real IP in the X-Real-IP header.
 * Falls back to server.requestIP() for direct connections or local development.
 */

import type { Generator } from "elysia-rate-limit";

export const railwayIpGenerator: Generator = (request: Request, server) => {
  const railwayIp = request.headers.get("X-Real-IP");
  if (railwayIp) return railwayIp;

  // Fall back to default IP detection for direct connections or local dev
  return server?.requestIP(request)?.address ?? "";
};
