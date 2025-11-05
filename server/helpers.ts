import { Effect } from "effect";

const renderResponse = (jsx: string | Promise<string>, status = 200) =>
  Effect.promise(async () => {
    const html = await Promise.resolve(jsx);
    return new Response(html, {
      status,
      headers: { "Content-Type": "text/html" },
    });
  }).pipe(
    Effect.catchAll(() =>
      Effect.succeed(new Response("Server rendering error", { status: 500 })),
    ),
  );

export { renderResponse };
