# ZeroZenit — Make It Yours (Setup Guide)

This covers the six changes you listed. Items 1–5 need values or content only you
have; item 6 (newsletter) is now fully coded and just needs one API key.

---

## 1. Site URL

In `.env.local` (copy it from `.env.example` first):

```
NEXT_PUBLIC_SITE_URL=https://zerozenit.com
```

Used for canonical URLs, the sitemap, RSS, and Open Graph tags. On Vercel, also add
this in **Project → Settings → Environment Variables** (not just locally).

## 2. Google Analytics

```
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

The GA script only loads when this is set, so analytics stays off in local dev
unless you opt in. Nothing else to do — page views track automatically.

## 3. AdSense (later)

Leave this **empty** until your site is approved:

```
NEXT_PUBLIC_ADSENSE_CLIENT=
```

When approved, paste your publisher ID (`ca-pub-…`). The AdSense loader script is
already wired into the layout and only injects when this value exists — so an empty
value means zero ad code on the page, which is what you want pre-approval. Drop
`<AdSlot slot="1234567890" />` (from `src/components/ui/ad-slot.tsx`) wherever you
want a unit; it also renders nothing until the client ID is set.

## 4. Replace the sample blog posts

The 10 samples live in `content/blog/*.mdx`. To add your own:

1. Copy `content/blog/_TEMPLATE.mdx.txt` to a new file, e.g. `content/blog/my-post.mdx`.
2. Fill in the frontmatter and write the body in Markdown/MDX.
3. Set `draft: false` to publish. The filename becomes the URL slug.

Reading time, the table of contents, tag pages, the sitemap, and RSS all update
automatically — you never edit those by hand. Delete the sample `.mdx` files you
don't want. **Categories** must match the list in `src/lib/site.ts`; add new ones
there and category pages generate themselves.

## 5. Replace the sample AI tools

The 5 samples are in `src/data/tools.ts` — a typed array. Add or edit entries
following the existing shape (`slug`, `name`, `logo`, `description`, `category`,
`pricing`, `url`, `rating`, `features`, `pros`, `cons`). Each entry auto-generates
its `/tools/<slug>` page with SoftwareApplication schema.

## 6. Newsletter — now working, pick one provider

The API route (`src/app/api/newsletter/route.ts`) auto-detects your provider from
env vars. Set **one** group in `.env.local`:

**Mailchimp** (double opt-in built in)
```
MAILCHIMP_API_KEY=your-key
MAILCHIMP_LIST_ID=your-audience-id
MAILCHIMP_DC=us1        # the bit after the dash in your API key
```

**Brevo**
```
BREVO_API_KEY=your-key
BREVO_LIST_ID=2         # optional
```

**ConvertKit**
```
CONVERTKIT_API_KEY=your-key
CONVERTKIT_FORM_ID=1234567
```

If none are set, signups are accepted and logged to the server console — safe for
local development, no errors. Duplicate subscribers are handled gracefully for all
three (no crash on re-subscribe).

---

## SEO — already in place

You confirmed these; for reference they live at: canonical URLs and metadata in
`src/lib/seo.ts`, all JSON-LD (Organization, Article, FAQ, Breadcrumb, WebSite +
SearchAction) in `src/lib/schema.ts`, plus `sitemap.ts`, `robots.ts`, and
`rss.xml/route.ts`. After deploy, submit `https://zerozenit.com/sitemap.xml` in
Google Search Console.

## Deploy checklist

- [ ] `.env.local` values copied into Vercel env vars
- [ ] `NEXT_PUBLIC_SITE_URL` and `url` in `src/lib/site.ts` set to the real domain
- [ ] Your posts added, sample posts removed
- [ ] Your tools added
- [ ] One newsletter provider configured and a test signup confirmed
- [ ] `NEXT_PUBLIC_ADSENSE_CLIENT` left empty until approved

---

## New in this build

### Global search + Ctrl+K
Press **⌘K / Ctrl+K** anywhere to open the command palette, or visit **/search**.
It indexes articles, tags, and tools (products/resources auto-join once added).
The index is served statically from `/api/search` — instant, no server cost.

### Cookie consent + consent-gated analytics
A banner asks visitors to Accept or Decline before **any** analytics or ad script
loads. This is required for AdSense approval and GDPR-friendly. GA4, Microsoft
Clarity, and AdSense now live in `src/components/analytics/analytics.tsx` and only
fire after consent — so with no consent (or "Decline") the page ships zero tracking.

### Microsoft Clarity
Add your project ID:
```
NEXT_PUBLIC_CLARITY_ID=your-clarity-id
```
It loads through the same consent gate as GA and AdSense.
