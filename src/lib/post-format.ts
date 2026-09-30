import { slugify } from './article-tools';

export const BLOG_DIR = 'content/blog';

function yaml(value: unknown) { return JSON.stringify(value); }

export function relativeForSlug(slug: string) {
  return `${BLOG_DIR}/${slugify(slug)}.mdx`;
}

/** Build the MDX file body (frontmatter + content) for a post. Future scheduledDate => stored as draft. */
export function buildPostMdx(body: Record<string, any>) {
  const now = new Date().toISOString();
  const scheduled = body.scheduledDate ? new Date(body.scheduledDate) : null;
  const isFuture = scheduled ? scheduled.getTime() > Date.now() : false;
  const front = [
    '---',
    `title: ${yaml(body.title)}`,
    `slug: ${yaml(body.slug)}`,
    `excerpt: ${yaml(body.excerpt)}`,
    `category: ${yaml(body.category || 'Artificial Intelligence')}`,
    `tags: ${yaml(body.tags || [])}`,
    `author: ${yaml(body.author || 'ZeroZenit')}`,
    `date: ${yaml(body.date || now)}`,
    `updatedDate: ${yaml(now)}`,
    `cover: ${yaml(body.cover || '🧠')}`,
    `featured: ${Boolean(body.featured)}`,
    `draft: ${isFuture ? true : Boolean(body.draft)}`,
    ...(scheduled ? [`scheduledDate: ${yaml(scheduled.toISOString())}`] : []),
    `ogImage: ${yaml(body.ogImage || body.cover || '')}`,
    `faq: ${yaml(body.faq || [])}`,
    '---',
    '',
    String(body.content || '').trim(),
    '',
  ];
  return front.join('\n');
}
