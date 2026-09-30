import { categories } from './site';

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function titleCase(input: string) {
  return input
    .replace(/[-_]+/g, ' ')
    .replace(/\.(md|mdx|docx?)$/i, '')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .map((w) => (w.length > 3 ? w[0].toUpperCase() + w.slice(1) : w))
    .join(' ');
}

/** Pull a usable title out of the markdown body (first H1) or fall back to the filename. */
export function extractTitle(markdown: string, filename?: string): { title: string; body: string } {
  const lines = markdown.split('\n');
  for (let i = 0; i < Math.min(lines.length, 10); i++) {
    const m = /^#\s+(.+)$/.exec(lines[i].trim());
    if (m) {
      const title = m[1].replace(/[*`]/g, '').trim();
      const body = [...lines.slice(0, i), ...lines.slice(i + 1)].join('\n').replace(/^\s+/, '');
      return { title, body };
    }
  }
  const fallback = filename ? titleCase(filename) : 'Untitled article';
  return { title: fallback, body: markdown };
}

/** Generate a plain-text excerpt from the first real paragraph of the body. */
export function generateExcerpt(markdown: string, maxLen = 160): string {
  const lines = markdown.split('\n').map((l) => l.trim());
  for (const line of lines) {
    if (!line || line.startsWith('#') || line.startsWith('```') || line.startsWith('>') || /^[-*]\s/.test(line)) continue;
    const plain = line
      .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
      .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
      .replace(/[*_`#>]/g, '')
      .trim();
    if (plain.length < 20) continue;
    return plain.length > maxLen ? plain.slice(0, maxLen - 1).replace(/\s+\S*$/, '') + '…' : plain;
  }
  return '';
}

const STOPWORDS = new Set('the a an and or but of to in on for with is are was were be been being this that these those it its as at by from your you we our i he she they them his her not no can will would should could very just also more most so than then out up about into over under'.split(' '));

/** Frequency-based keyword/tag suggestion — no external AI call required. */
export function suggestTags(markdown: string, limit = 5): string[] {
  const words = markdown
    .toLowerCase()
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 3 && !STOPWORDS.has(w));
  const counts = new Map<string, number>();
  for (const w of words) counts.set(w, (counts.get(w) ?? 0) + 1);
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([w]) => w[0].toUpperCase() + w.slice(1));
}

/** Score the article body against each known site category by keyword overlap. */
export function suggestCategory(markdown: string): string {
  const text = markdown.toLowerCase();
  let best = categories[0] as string;
  let bestScore = -1;
  for (const cat of categories) {
    const words = cat.toLowerCase().split(/\s+/).filter((w) => w.length > 2 && !STOPWORDS.has(w));
    let score = 0;
    for (const w of words) score += (text.match(new RegExp(`\\b${w}\\b`, 'g')) || []).length;
    if (score > bestScore) { bestScore = score; best = cat; }
  }
  return best;
}

export interface SeoCheck { label: string; pass: boolean; hint: string; }
export interface SeoResult { score: number; checks: SeoCheck[]; }

export function computeSeoScore(input: {
  title: string; slug: string; excerpt: string; content: string; coverImage?: string; internalLinks?: number;
}): SeoResult {
  const wordCount = input.content.trim().split(/\s+/).filter(Boolean).length;
  const hasH2 = /^##\s+/m.test(input.content);
  const hasAltText = !input.content.includes('![]') && !/!\[\s*\]\(/.test(input.content);
  const imageCount = (input.content.match(/!\[[^\]]*\]\([^)]*\)/g) || []).length;
  const altTextOk = imageCount === 0 || hasAltText;

  const checks: SeoCheck[] = [
    { label: 'Title length (30–65 chars)', pass: input.title.length >= 15 && input.title.length <= 65, hint: `${input.title.length} characters` },
    { label: 'Meta description (70–160 chars)', pass: input.excerpt.length >= 50 && input.excerpt.length <= 160, hint: `${input.excerpt.length} characters` },
    { label: 'URL / slug is clean', pass: /^[a-z0-9-]+$/.test(input.slug) && input.slug.length <= 75, hint: input.slug || 'missing slug' },
    { label: 'H1 exists (title)', pass: Boolean(input.title), hint: input.title ? 'ok' : 'missing' },
    { label: 'H2 subheadings present', pass: hasH2, hint: hasH2 ? 'ok' : 'add at least one ## heading' },
    { label: 'Internal links (2+)', pass: (input.internalLinks ?? 0) >= 2, hint: `${input.internalLinks ?? 0} found` },
    { label: 'Article length (500+ words)', pass: wordCount >= 500, hint: `${wordCount} words` },
    { label: 'Image alt text', pass: altTextOk, hint: altTextOk ? 'ok' : 'add alt text to images' },
    { label: 'Featured image set', pass: Boolean(input.coverImage), hint: input.coverImage ? 'ok' : 'add a featured image' },
  ];
  const score = Math.round((checks.filter((c) => c.pass).length / checks.length) * 100);
  return { score, checks };
}

export interface PostSummary { slug: string; title: string; category: string; tags: string[]; }

/** Suggest existing posts to link to, based on shared category/tags. */
export function suggestInternalLinks(current: { category: string; tags: string[]; slug?: string }, posts: PostSummary[], limit = 5): PostSummary[] {
  return posts
    .filter((p) => p.slug !== current.slug)
    .map((p) => {
      let score = p.category === current.category ? 2 : 0;
      score += p.tags.filter((t) => current.tags.includes(t)).length;
      return { p, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.p);
}

/** Very small HTML → Markdown converter, used for DOCX imports (via mammoth's HTML output). */
export function htmlToMarkdown(html: string): string {
  let md = html;
  md = md.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '\n# $1\n');
  md = md.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '\n## $1\n');
  md = md.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '\n### $1\n');
  md = md.replace(/<h4[^>]*>(.*?)<\/h4>/gi, '\n#### $1\n');
  md = md.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**');
  md = md.replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**');
  md = md.replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*');
  md = md.replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*');
  md = md.replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)');
  md = md.replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*\/?>/gi, '![$2]($1)');
  md = md.replace(/<img[^>]*alt="([^"]*)"[^>]*src="([^"]*)"[^>]*\/?>/gi, '![$1]($2)');
  md = md.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n');
  md = md.replace(/<\/(ul|ol)>/gi, '\n');
  md = md.replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gis, '\n> $1\n');
  md = md.replace(/<p[^>]*>(.*?)<\/p>/gis, '$1\n\n');
  md = md.replace(/<br\s*\/?>/gi, '\n');
  md = md.replace(/<[^>]+>/g, '');
  md = md.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ');
  md = md.replace(/\n{3,}/g, '\n\n').trim();
  return md;
}

/** Full auto-metadata pass used by both the single-upload and bulk-upload flows. */
export function parseArticle(rawContent: string, filename?: string) {
  const { title, body } = extractTitle(rawContent, filename);
  const excerpt = generateExcerpt(body);
  const category = suggestCategory(body);
  const tags = suggestTags(body);
  const slug = slugify(title);
  const wordCount = body.trim().split(/\s+/).filter(Boolean).length;
  const readingTime = Math.max(1, Math.round(wordCount / 200));
  return { title, slug, excerpt, category, tags, content: body, wordCount, readingTime };
}
