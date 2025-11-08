import { mount, unmount } from "svelte";
import App from "./app.svelte";

const target = document.getElementById("app");
if (!target) throw new Error("Target element #app not found");

let app: ReturnType<typeof mount>;

if (import.meta.hot) {
  import.meta.hot.data.app ??= mount(App, { target });
  app = import.meta.hot.data.app;
  import.meta.hot.dispose(() => unmount(app));
} else {
  app = mount(App, { target });
}

export default app;
