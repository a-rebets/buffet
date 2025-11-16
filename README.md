<img src="https://a5lsx687lx.ufs.sh/f/fExbAB4WdS7G36z7AU98EMFmqYgawV09ps7Btn5QheWLfdKy" alt="Buffet" width="64" height="64" />

# Buffet (**bu·fè**)

<img src="https://a5lsx687lx.ufs.sh/f/fExbAB4WdS7GPbt7g3wBGbMJdRDxOSAZjuQ4Fs31PafCzWc6" alt="Buffet" width="500" height="auto" />

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

### About the init script

The `bun run init` command sets up your project's database and environment. In development, it generates a migration file using the Better Auth CLI. That migration file must be committed to your repository for production deployments to work.

In production, the init script runs migrations directly using Bun's native SQLite support, bypassing the need for the Better Auth CLI entirely. This avoids a dependency on `better-sqlite3`, which requires V8 C++ APIs that [Bun doesn't currently support](https://github.com/oven-sh/bun/issues/4290).

## What's included?

The template is a work in progress, but it's ready for you to fork and ship your next project!
All basic building blocks are here - auth, DB operations, API, routing, etc.

[Svelte](https://svelte.dev/) SPA is the frontend solution of choice.  
[Shadcn Svelte](https://www.shadcn-svelte.com/docs/installation) components are added to unlock fast UI prototyping.  
[Better Auth](https://better-auth.com/) is used for authentication.

## Other stuff

The stack has shifted to a more opinionated setup (previously based on HTMX and `@kitajs/html` JSX runtime):
- [ElysiaJS](https://elysiajs.com/) gives Bun extra powers
- [Eden Treaty](https://elysiajs.com/eden/overview.html) keeps RPC calls end-to-end type safe
- Routing is powered by an awesome lightweight library [sv-router](https://sv-router.vercel.app/guide/getting-started) by [@colinlienard](https://github.com/colinlienard)
- Client data fetching is done with `@tanstack/svelte-query`
- [Biome](https://biomejs.dev/guides/getting-started/) is used for linting and formatting
- To adjust rate limiting, refer to the [plugin's documentation](https://github.com/rayriffy/elysia-rate-limit)

> ❗ Note for Biome:  
> if you are on **Linux** (not macOS), replace the `@biomejs/cli-darwin-arm64` binary package with the appropriate one for your platform (see this [list](https://www.npmjs.com/search?q=@biomejs/cli-*))

**Contributions are welcome** to keep polishing the experience!
