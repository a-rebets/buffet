import { FetchHttpClient } from "@effect/platform";
import { RpcClient, RpcSerialization } from "@effect/rpc";
import { ThoughtRpcs } from "@server/thoughts/rpc";
import { Effect, Layer } from "effect";

const ProtocolLive = RpcClient.layerProtocolHttp({
  url: "/rpc",
}).pipe(Layer.provide([FetchHttpClient.layer, RpcSerialization.layerNdjson]));

const makeRpcClient = RpcClient.make(ThoughtRpcs).pipe(
  Effect.provide(ProtocolLive),
);

type RpcClientType = Effect.Effect.Success<typeof makeRpcClient>;

export function withRpcClient<A, E>(
  fn: (client: RpcClientType) => Effect.Effect<A, E>,
): Effect.Effect<A, E> {
  return Effect.scoped(makeRpcClient.pipe(Effect.flatMap(fn)));
}
