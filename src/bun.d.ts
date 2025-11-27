declare module "*.jpg" {
  const content: string;
  export default content;
}

declare module "bun" {
  interface Env {
    BUN_PUBLIC_DOMAIN: string;
  }
}
