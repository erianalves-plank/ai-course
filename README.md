This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Testing

Cypress covers both E2E (full routes via the dev server) and component tests (mounted React components in isolation).

```bash
# Author E2E tests interactively against the real PokéAPI
npm run dev          # in one terminal
npm run cy:open      # in another

# Run the full stubbed suite locally (mirrors CI — no network)
npm run cy:run:stub

# Component tests
npm run cy:open:ct          # interactive
npm run cy:run:ct           # headless

# Refresh fixtures from the real PokéAPI
npm run cy:capture
```

### Modes

| Variable | Effect |
|---|---|
| `NEXT_PUBLIC_POKEAPI_BASE` | Overrides the PokéAPI base URL. Set automatically by `dev:stub`. |

### Code coverage

Deferred in v1. `babel-plugin-istanbul` instrumentation is incompatible with `next/font/google` under Next 16 (the font helper requires SWC/Turbopack). Re-attempt once Next ships a Turbopack-native coverage hook or once we switch to client-only instrumentation.

### CI

`.github/workflows/cypress.yml` runs both suites against the fixture server on every push and PR, and uploads screenshots on failure.

