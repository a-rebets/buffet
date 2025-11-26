<img src="https://a5lsx687lx.ufs.sh/f/fExbAB4WdS7G36z7AU98EMFmqYgawV09ps7Btn5QheWLfdKy" alt="Buffet" width="64" height="64" />

# Buffet (**bu·fè**)

<img src="https://a5lsx687lx.ufs.sh/f/fExbAB4WdS7GPbt7g3wBGbMJdRDxOSAZjuQ4Fs31PafCzWc6" alt="Buffet" width="500" height="auto" /><br/>

[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/deploy/buffet-modern-starter-for-bun?referralCode=M7vVjv&utm_medium=integration&utm_source=template&utm_campaign=generic)

### Fresh ingredients, simple web dev

Buffet is a template for 2025. Let's recognize where we stand:
- Bun is awesome and powerful
- Effect is a new way of thinking about type and exception safety
- TailwindCSS makes styling easier for both humans and AI

**So why not use them together?**

Since Bun has better support for full-stack web development now, bringing a separate bundler, like Vite, is not required anymore.
Less config files and dependencies to manage. Better DX.

The main goals of this template are:
1. simplicity
2. an optimized client bundle
3. end-to-end type safety

## What you are here for

```bash
bun i && bun run init && bun dev
```

> **⚠️ Warning**  
> Bun >= 1.3.0 is required.  
> If you don't have Bun installed, run `curl -fsSL https://bun.com/install | bash`  
> If you have an older version of Bun, run `bun upgrade`  
> If you are on Windows, I'm sorry for you  

### Some notes on the workflow

- The `bun run init` command sets up your project's environment and updates the auth schema.
- The `bun run make-migrations` command generates migration scripts using drizzle-kit. Migrations should be committed to your repository for deployments to work.
- In production, migrations are applied right after the server starts, in a separate Effect layer, using the SQLite migrator provided by Drizzle.
- Avoid using the Better Auth CLI in production as it has a dependency on `better-sqlite3`, which requires V8 C++ APIs that [Bun doesn't currently support](https://github.com/oven-sh/bun/issues/4290).
- To adjust rate limiting, refer to the corresponding [plugin's documentation](https://github.com/rayriffy/elysia-rate-limit).

## What's included?

The template is a work in progress, but it's ready for you to fork and ship your next project!
All basic building blocks are here - auth, DB operations, API, routing, etc.

While the stack was very simple at the start (based on HTMX and `@kitajs/html` JSX runtime), it has become much more opinionated. It's hard to be happy about having the super fast and lightweight client bundle, when the project is unmaintainable. We need the red squiggly lines in the editor, and the types, and reliable battle-tested solutions for common things like auth. Here are the picks:

[ElysiaJS](https://elysiajs.com/) supports the backend, it has a great ecosystem of plugins and various helpers for serving static files and implementing the API.  
[Svelte](https://svelte.dev/) SPA is the frontend solution of choice.  
[Shadcn Svelte](https://www.shadcn-svelte.com/docs/installation) components are added to unlock fast UI prototyping.  
[Better Auth](https://better-auth.com/) is used for authentication.

## Other stuff

- [Eden Treaty](https://elysiajs.com/eden/overview.html) keeps RPC calls end-to-end type safe
- [Drizzle ORM](https://orm.drizzle.team/docs/connect-bun-sqlite) enables type-safe database operations
- Routing is powered by an awesome lightweight library [sv-router](https://sv-router.vercel.app/guide/getting-started) by [@colinlienard](https://github.com/colinlienard)
- Client data fetching is done with [Svelte Query](https://tanstack.com/query/latest/docs/framework/svelte/overview)
- [Biome](https://biomejs.dev/guides/getting-started/) is used for linting and formatting

> ❗ Note for Biome:  
> if you are on **Linux** (not macOS), replace the `@biomejs/cli-darwin-arm64` binary package with the appropriate one for your platform (see this [list](https://www.npmjs.com/search?q=@biomejs/cli-*))

**Contributions are welcome** to keep polishing the experience!
