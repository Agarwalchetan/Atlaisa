# Contributing to Atlasia

Thank you for your interest in contributing. This document covers how to set up the project locally, the branch and commit conventions, and the pull request process.

---

## Table of Contents

- [Development Setup](#development-setup)
- [Project Conventions](#project-conventions)
- [Branching Strategy](#branching-strategy)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)
- [Adding a New Page](#adding-a-new-page)
- [Adding a New API Route](#adding-a-new-api-route)
- [Design System Rules](#design-system-rules)
- [Code Style](#code-style)

---

## Development Setup

### Requirements

- [Bun](https://bun.sh) v1.0+
- Node.js 18+ (Bun handles this, but useful for tooling)
- Git

### Steps

```bash
# 1. Fork the repo and clone your fork
git clone https://github.com/AgarwalChetan/Atlasia.git
cd Atlasia

# 2. Install dependencies
bun install

# 3. Set up environment
cp .env.example .env.local
# Edit .env.local — at minimum set USE_OPENAI=true and OPENAI_API_KEY

# 4. Start dev server
bun dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Conventions

### Technology constraints

- **Next.js App Router only** — no `pages/` directory
- **`"use client"` directive** on every component that uses React hooks or browser APIs
- **Tailwind CSS v4** — no `tailwind.config.ts`. All customizations go in `globals.css` inside the `@theme inline` block.
- **`bun`** as the package manager — do not commit `package-lock.json` or `yarn.lock`
- **Lucide React** for all UI icons — no emoji characters as UI icons
- **`@iconify/react`** for flag icons only — use `circle-flags:<country-code>` IDs; always render via `<IconifyIcon icon={flag} />`, never as raw text
- **`src/components/ui/`** primitives for all UI elements — no raw HTML `<button>`, `<input>`, etc. outside of the UI component definitions themselves

### Design system

See the [Design System Rules](#design-system-rules) section below for the full list of visual constraints.

---

## Branching Strategy

| Branch | Purpose |
|---|---|
| `main` | Production-ready code. Direct pushes are blocked. |
| `feat/<name>` | New features |
| `fix/<name>` | Bug fixes |
| `refactor/<name>` | Refactoring without behavior change |
| `docs/<name>` | Documentation-only changes |
| `chore/<name>` | Dependency updates, config changes |

---

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org):

```
<type>: <short description>

[optional body]
```

Types:

| Type | When to use |
|---|---|
| `feat` | A new feature |
| `fix` | A bug fix |
| `refactor` | Code change that is neither a fix nor a feature |
| `docs` | Documentation only |
| `style` | Formatting, whitespace (no logic change) |
| `chore` | Dependency bumps, config, tooling |
| `perf` | Performance improvement |

Examples:

```
feat: add dark mode toggle to settings page
fix: map canvas not rendering full-screen on mobile
refactor: split map-component.tsx into 9 focused modules
docs: add DEPLOYMENT.md with Vercel setup guide
chore: bump openai to 6.29.0
```

---

## Pull Request Process

1. Create a branch from `main` using the naming convention above
2. Make your changes and commit with conventional commit messages
3. Run the build locally and confirm it passes:
   ```bash
   bun run build
   ```
4. Open a pull request against `main`
5. Fill in the PR template — describe what changed and why
6. Request a review

PRs that fail the build, introduce TypeScript errors, or break existing functionality will not be merged.

---

## Adding a New Page

1. Create a directory under `src/app/<route>/` with a `page.tsx`
2. Add `"use client"` at the top
3. Use the existing page structure as a reference (e.g. `src/app/phrases/page.tsx`)
4. Add the route to the navbar in `src/components/layout/navbar.tsx`
5. If the page should hide the navbar (like `/map`), update the condition in `src/components/layout/client-layout.tsx`

---

## Adding a New API Route

1. Create `src/app/api/<name>/route.ts`
2. Export a named `POST` or `GET` function
3. Use the AI provider abstraction from `src/lib/ai-provider.ts` for text generation — do not import `openai`, `@google/generative-ai`, or `groq-sdk` directly in route files
4. Add the route to `vercel.json` with an appropriate `maxDuration`
5. Document the route in `README.md`

---

## Design System Rules

These rules must be followed in all UI code:

### Colors

- **Primary accent**: Amber — use `amber-500` / `amber-600` for interactive elements, highlights, and CTAs
- **Secondary accent**: Teal — use `teal-400` / `teal-500` for secondary highlights and info states
- **Base palette**: Stone scale — `stone-950` page background, `stone-900`/`stone-800` for cards/panels, `stone-500`/`stone-400` for muted text
- **Danger**: `rose-500` / `rose-600` only — no plain `red-*`
- **No** default blue/green/yellow — use the rich alternatives above

### Typography

- **Headings**: `font-[family-name:var(--font-sora)]`
- **Body**: default (Inter via `--font-inter`)
- **Pronunciation/translations/mono**: `font-[family-name:var(--font-dm-mono)]`

### Transitions

- **No** `transition-all` — only transition specific properties:
  - `transition-colors`, `transition-transform`, `transition-shadow`, `transition-opacity`

### Icons

- **Lucide React** for all UI icons — no emoji characters as UI icons (emoji in AI-returned content is OK to display)
- **`@iconify/react`** (`Icon` imported as `IconifyIcon`) for flag icons only — use `circle-flags:<country-code>` IDs sourced from `SUPPORTED_LANGUAGES[].flag` in `src/lib/utils.ts`. The `flag` field is an Iconify ID string, not an emoji. Always render it with `<IconifyIcon icon={flag} width={N} />`, never as raw text content.

### Animations

- Prefer `framer-motion` (`motion.div` etc.) for entrance animations
- Custom `@keyframes` go in `globals.css`

---

## Code Style

- TypeScript strict mode is enabled — no `any` without a comment explaining why
- Prefer named exports over default exports for components
- Keep components focused — if a file exceeds ~200 lines, consider splitting it
- Co-locate types with the file that uses them unless they are shared across 3+ files (then put them in a `*-types.ts` file)
