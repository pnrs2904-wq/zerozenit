# CMS update files

### New
- `src/lib/admin-auth.ts`
- `src/lib/github-cms.ts`
- `src/lib/products.ts`
- `src/app/admin/page.tsx`
- `src/app/admin/login/page.tsx`
- `src/app/api/admin/session/route.ts`
- `src/app/api/admin/login/route.ts`
- `src/app/api/admin/logout/route.ts`
- `src/app/api/admin/posts/route.ts`
- `src/app/api/admin/products/route.ts`
- `src/app/api/admin/tools/route.ts`
- `src/app/products/page.tsx`
- `src/app/products/[slug]/page.tsx`
- `src/data/products.json`
- `src/data/tools-cms.json`
- `CMS-SETUP.md`
- `CMS-FILES.md`

### Modified
- `src/data/tools.ts` — merges CMS-managed tools with the existing tool directory.
- `src/components/layout/navbar.tsx` — adds Products navigation.
- `src/app/sitemap.ts` — adds products to sitemap.
- `tsconfig.json` — enables JSON imports.
- `.env.example` — adds CMS variables if the file exists/is generated.
- `README.md` — documents the CMS.

### Not modified
Existing blog posts, existing tool records, legal pages, theme, analytics, and existing APIs are preserved.
