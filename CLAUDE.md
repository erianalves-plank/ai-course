# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Important: Next.js Version Notice

This project uses **Next.js 16**, which has breaking changes from earlier versions. Before writing any Next.js-specific code, consult `node_modules/next/dist/docs/` — APIs, conventions, and file structure may differ from training data.

## Commands

```bash
npm run dev      # Start dev server (Turbopack)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

No test runner is configured yet.

## Architecture

- **Framework:** Next.js 16 with App Router, React 19, TypeScript
- **Styling:** Tailwind CSS v4 (configured via `postcss.config.mjs`, no `tailwind.config.*` file — v4 uses CSS-first config)
- **Fonts:** Geist Sans and Geist Mono loaded via `next/font/google`, exposed as CSS variables `--font-geist-sans` / `--font-geist-mono`
- **Deployment:** Vercel (project linked in `.vercel/project.json`)

All application code lives under `src/app/` using the App Router file conventions (`layout.tsx`, `page.tsx`, etc.). The `@/*` alias maps to `src/*`.
