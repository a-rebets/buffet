declare module "*.jpg" {
  const content: string;
  export default content;
}

declare module "bun" {
  interface Env {
    VERCEL_URL: string;
  }
}
