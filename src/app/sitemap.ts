import type { MetadataRoute } from 'next';
import { site, categories, categorySlug } from '@/lib/site';
import { getAllPosts, getAllTags } from '@/lib/mdx';
import { tools } from '@/data/tools';
import { getProducts } from '@/lib/products';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = site.url;
  const now = new Date();

  const staticRoutes = ['', '/blog', '/tools', '/products', '/about', '/newsletter', '/contact', '/privacy', '/terms', '/disclaimer'].map(
    (path) => ({ url: `${base}${path}`, lastModified: now, changeFrequency: 'weekly' as const, priority: path === '' ? 1 : 0.7 }),
  );

  const postRoutes = getAllPosts().map((p) => ({
    url: `${base}/blog/${p.slug}`,
    lastModified: new Date(p.updatedDate ?? p.date),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  const toolRoutes = tools.map((t) => ({
    url: `${base}/tools/${t.slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  const productRoutes = getProducts().filter((p) => p.active).map((p) => ({
    url: `${base}/products/${p.slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  const categoryRoutes = categories.map((c) => ({
    url: `${base}/blog/category/${categorySlug(c)}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.5,
  }));

  const tagRoutes = getAllTags().map(({ tag }) => ({
    url: `${base}/blog/tag/${tag}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.4,
  }));

  return [...staticRoutes, ...postRoutes, ...toolRoutes, ...productRoutes, ...categoryRoutes, ...tagRoutes];
}
