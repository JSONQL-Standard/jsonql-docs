# JSONQL Documentation Site

Official docs, developer guide, and marketing site for JSONQL.

## Quick Start

```bash
npm install
npm run dev
```

The site runs at `http://localhost:4321` by default.

## Build

```bash
npm run build
npm run preview
```

## Deployment (Cloudflare Pages)

1. Create a new Cloudflare Pages project and connect this repo.
2. Set the build command to `npm run build`.
3. Set the output directory to `dist`.
4. Use Node.js 18+.

Astro is configured with the Cloudflare adapter in `astro.config.mjs`.

## Content

Docs live in `src/content/docs/`. Add or edit `.md` / `.mdx` files to update navigation and content.

## Branding

- Logo: `public/logo.svg`
- Favicon: `public/favicon.svg`
- Theme overrides: `src/styles/custom.css`
