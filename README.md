# ZeroZenit

**Ancient Wisdom + AI + Deep Focus for Modern Minds**

A production-ready Next.js 15 (App Router) + TypeScript + Tailwind site with a blog, an AI-tools directory, full SEO plumbing, dark mode, and AdSense-readiness. This is a working foundation that builds and runs today; the more advanced items in the original brief (Supabase CMS, Clerk auth, admin dashboard, comments) are wired as clearly-marked integration points rather than fully implemented, so you can add them incrementally.

## What's included and working

- Home, Blog (index + single + category), AI Tools (directory + detail), About, Newsletter, Contact, Privacy, Terms, Disclaimer, 404
- Dynamic metadata, Open Graph, Twitter cards, canonical URLs on every page
- JSON-LD: Organization, Article, Breadcrumb, FAQ, SoftwareApplication
- Dynamic `sitemap.xml` and `robots.txt` (via Next metadata routes)
- Dark/light mode with no-flash inline script + accessible toggle
- Client-side tool search + pricing filter
- Newsletter + contact API routes (validation, honeypot spam protection) with Mailchimp/email TODO hooks
- GA4 script (loads only when `NEXT_PUBLIC_GA_ID` is set)
- Reusable AdSense `<AdSlot>` component (renders only when a client id is set)
- Security headers in `next.config.mjs`
- 10 sample posts, 5 sample tools, 10 categories
- Verified: `npm run build` compiles all 41 routes cleanly

## Requirements

- Node.js 18.18+ (20 LTS recommended)

## Install & run

```bash
npm install
cp .env.example .env.local   # fill in what you need; all are optional to boot
npm run dev                  # http://localhost:3000
npm run build && npm start   # production build
```

The site runs with zero env vars set. GA, AdSense, Mailchimp, Supabase, and Clerk activate only once their vars are present.

## Environment variables

See `.env.example`. Key ones:

- `NEXT_PUBLIC_SITE_URL` — canonical base URL
- `NEXT_PUBLIC_GA_ID` — GA4 measurement id (`G-XXXX`)
- `NEXT_PUBLIC_ADSENSE_CLIENT` — AdSense client (`ca-pub-XXXX`) for `<AdSlot>`
- `MAILCHIMP_*` — newsletter double opt-in (see `src/app/api/newsletter/route.ts`)
- `NEXT_PUBLIC_SUPABASE_*`, `CLERK_*` — for when you add DB + auth

## Project structure

```
src/
  app/
    blog/[slug]/            single post (SSG, Article + Breadcrumb schema)
    blog/category/[category]/
    tools/[slug]/           tool detail (SoftwareApplication schema)
    api/newsletter/         POST route, validation + Mailchimp hook
    api/contact/            POST route, validation + honeypot
    sitemap.ts  robots.ts  layout.tsx  page.tsx  ...legal pages
  components/
    layout/ (navbar, footer)
    ui/ (cards, theme-toggle, newsletter-form, ad-slot)
  data/  (posts.ts, tools.ts — swap for Supabase later)
  lib/   (site config, slugify)
  types/ (Post, Tool)
```

## Deploy to Vercel

1. Push to GitHub: `git init && git add -A && git commit -m "init" && git remote add origin <repo> && git push -u origin main`
2. Import the repo at vercel.com → framework auto-detected as Next.js.
3. Add env vars in Project Settings → Environment Variables.
4. Add the domain `zerozenit.com` in Settings → Domains; Vercel provisions HTTPS automatically.

## SEO checklist

- [ ] Set `NEXT_PUBLIC_SITE_URL` and the `url` in `src/lib/site.ts` to your real domain
- [ ] Replace `public/og.png` with a real 1200×630 OG image
- [ ] Submit `https://zerozenit.com/sitemap.xml` in Google Search Console
- [ ] Add GSC verification (meta tag in `layout.tsx` or DNS record)
- [ ] Confirm every page has a unique title/description (already scaffolded)

## Google Analytics setup

Create a GA4 property, copy the `G-` id into `NEXT_PUBLIC_GA_ID`. The script self-activates. Add custom events (scroll depth, outbound clicks, tool usage) by calling `gtag('event', ...)` from client components.

## AdSense setup

1. Get approved (privacy policy, terms, disclaimer, and cookie consent are prerequisites — the first three ship here; add a cookie banner before applying).
2. Set `NEXT_PUBLIC_ADSENSE_CLIENT` and add the AdSense script tag to `layout.tsx`.
3. Drop `<AdSlot slot="1234567890" />` where you want ad units. It renders nothing until the client id exists, so it's safe in dev.

## Not yet implemented (clear next steps)

These were in the brief but need real backing services, so they're left as integration points rather than half-built:

- Supabase-backed CMS (posts/tools currently live in `src/data/*.ts`)
- Clerk auth + admin dashboard
- Comments, bookmarks, view counters (need a DB)
- Full-text global search (current search is client-side over local data)
- Mailchimp double opt-in (hook is stubbed in the API route)

Wiring Supabase is the natural first move: replace the exports in `src/data/posts.ts` and `src/data/tools.ts` with async queries and the rest of the app keeps working unchanged.

## ZeroZenit CMS

The repository now includes a GitHub-backed admin CMS at `/admin` for publishing blog articles, digital products and AI tools. See `CMS-SETUP.md` for Vercel environment variables and GitHub token setup.
