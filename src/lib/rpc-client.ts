import { FetchHttpClient } from "@effect/platform";
import { RpcClient, RpcSerialization } from "@effect/rpc";
import { ThoughtRpcs } from "@server/thoughts/rpc";
import { Effect, Layer, Scope } from "effect";

const ProtocolLive = RpcClient.layerProtocolHttp({
  url: "/rpc",
}).pipe(Layer.provide([FetchHttpClient.layer, RpcSerialization.layerNdjson]));

const makeRpcClient = RpcClient.make(ThoughtRpcs).pipe(
  Effect.provide(ProtocolLive),
);

type RpcClientType = Effect.Effect.Success<typeof makeRpcClient>;

type Cache = { scope?: Scope.Scope; client?: RpcClientType };

const cache: Cache = (() => {
  if (import.meta.hot) {
    const data = import.meta.hot.data as { rpcClientCache?: Cache };
    if (!data.rpcClientCache) {
      data.rpcClientCache = {} as Cache;
    }
    return data.rpcClientCache;
  }
  return {};
})();

function resolveClient(): RpcClientType {
  if (!cache.client) {
    cache.scope ??= Effect.runSync(Scope.make());
    cache.client = Effect.runSync(
      makeRpcClient.pipe(Effect.provideService(Scope.Scope, cache.scope)),
    );
  }
  return cache.client;
}

export function withRpcClient<A, E>(
  fn: (client: RpcClientType) => Effect.Effect<A, E>,
): Effect.Effect<A, E> {
  return Effect.sync(resolveClient).pipe(Effect.flatMap(fn));
}
