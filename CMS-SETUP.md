# ZeroZenit CMS Setup

This CMS is built specifically for `pnrs2904-wq/zerozenit`, whose Next.js project lives in the repository's `zerozenit/` subfolder.

## Vercel environment variables

Add these to the Vercel project:

- `ADMIN_PASSWORD` — a strong private password for `/admin`.
- `ADMIN_SESSION_SECRET` — a long random secret, different from the password.
- `GITHUB_TOKEN` — a GitHub fine-grained personal access token with **Contents: Read and write** for this repository.
- `GITHUB_OWNER=pnrs2904-wq`
- `GITHUB_REPO=zerozenit`
- `GITHUB_BRANCH=main`
- `GITHUB_PROJECT_ROOT=zerozenit`

Do not commit `.env.local` or the GitHub token.

## Publishing workflow

1. Open `https://zerozenit.com/admin`.
2. Sign in with `ADMIN_PASSWORD`.
3. Publish an article, product or AI tool.
4. The CMS commits the content to GitHub using the GitHub Contents API.
5. Vercel detects the commit and rebuilds the site.

## Files written by the CMS

- Blog: `zerozenit/content/blog/<slug>.mdx`
- Products: `zerozenit/src/data/products.json`
- AI tools: `zerozenit/src/data/tools-cms.json`

Existing blog posts and existing AI tools are preserved. CMS-added AI tools are merged with the existing tool directory.
