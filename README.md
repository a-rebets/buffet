<img src="https://a5lsx687lx.ufs.sh/f/fExbAB4WdS7G36z7AU98EMFmqYgawV09ps7Btn5QheWLfdKy" alt="Buffet" width="64" height="64" />

# Buffet (**bu·fè**)

<img src="https://a5lsx687lx.ufs.sh/f/fExbAB4WdS7GPbt7g3wBGbMJdRDxOSAZjuQ4Fs31PafCzWc6" alt="Buffet" width="500" height="auto" />

### Fresh ingredients, simple web dev

Buffet is a template for 2025. Let's face the truth:
- Bun is awesome and powerful
- Effect is a new way of thinking about type and exception safety
- TailwindCSS makes styling easier for both humans and AI

**So why not use them together?**

Since Bun has better support for full-stack web development now, bringing a separate bundler, like Vite, is not required anymore.
Less config files and dependencies to manage. Better DX.

Main goals of this template are:
1. simplicity
2. an optimized client bundle
3. end-to-end type safety

## What's included?

The template is a work in progress, but it's ready for you to start building your next project!
All basic building blocks are here - auth, DB operations, API, routing, etc.

[Svelte](https://svelte.dev/) SPA is the frontend solution of choice.  
[Shadcn Svelte](https://www.shadcn-svelte.com/docs/installation) components are added to unlock fast UI prototyping.  
[Better Auth](https://better-auth.com/) is used for authentication.

## What you are here for

```bash
bun i && bun run init && bun dev
```

> **⚠️ Warning**  
> Bun >= 1.3.0 is required.  
> If you don't have Bun installed, run `curl -fsSL https://bun.com/install | bash`  
> If you have an older version of Bun, run `bun upgrade`  
> If you are on Windows, I'm sorry for you

## Other stuff

The stack has shifted to a more opinionated setup (previously based on HTMX and `@kitajs/html` JSX runtime):
- [ElysiaJS](https://elysiajs.com/) gives Bun extra powers
- [Eden Treaty](https://elysiajs.com/eden/overview.html) keeps RPC calls end-to-end type safe
- Routing is powered by an awesome lightweight library [sv-router](https://sv-router.vercel.app/guide/getting-started) by [@colinlienard](https://github.com/colinlienard)
- Client data fetching is done with `@tanstack/svelte-query`

**Contributions are welcome** to keep polishing the experience!
