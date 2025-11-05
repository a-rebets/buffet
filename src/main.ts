import { mount } from "svelte";
import App from "./app.svelte";

const target = document.getElementById("app");
if (!target) {
  throw new Error("Target element #app not found");
}

const app = mount(App, {
  target,
  props: {},
});

export default app;
