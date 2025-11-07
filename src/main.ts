import { mount, unmount } from "svelte";
import App from "./app.svelte";

declare global {
  var didMount: boolean | undefined;
}

let app: ReturnType<typeof mount> | undefined;

const target = document.getElementById("app");
if (!target) {
  throw new Error("Target element #app not found");
}

if (!globalThis.didMount) {
  app = mount(App, { target });
}
globalThis.didMount = true;

if (import.meta.hot) {
  import.meta.hot.accept(async () => {
    if (!app) return;
    const prevApp = app;
    app = undefined;
    await unmount(prevApp, { outro: true });
    app = mount(App, { target });
  });
}

export default app;
