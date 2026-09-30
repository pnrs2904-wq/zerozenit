import { MDXRemote } from 'next-mdx-remote/rsc';
import rehypeSlug from 'rehype-slug';
import Link from 'next/link';

const components = {
  h2: (props: React.ComponentProps<'h2'>) => (
    <h2 className="mt-10 scroll-mt-24 font-display text-2xl font-semibold" {...props} />
  ),
  h3: (props: React.ComponentProps<'h3'>) => (
    <h3 className="mt-6 scroll-mt-24 font-display text-xl font-semibold" {...props} />
  ),
  p: (props: React.ComponentProps<'p'>) => <p className="mt-4 leading-relaxed text-[var(--fg)]" {...props} />,
  ul: (props: React.ComponentProps<'ul'>) => <ul className="mt-4 list-disc space-y-2 pl-6" {...props} />,
  ol: (props: React.ComponentProps<'ol'>) => <ol className="mt-4 list-decimal space-y-2 pl-6" {...props} />,
  a: ({ href = '', ...props }: React.ComponentProps<'a'>) => (
    <Link href={href} className="text-accent underline underline-offset-4 hover:opacity-80" {...props} />
  ),
  blockquote: (props: React.ComponentProps<'blockquote'>) => (
    <blockquote className="mt-6 border-l-4 border-accent pl-4 italic text-[var(--muted)]" {...props} />
  ),
  code: (props: React.ComponentProps<'code'>) => (
    <code className="rounded bg-[var(--card)] px-1.5 py-0.5 text-sm" {...props} />
  ),
};

export function Mdx({ source }: { source: string }) {
  return (
    <div className="text-lg">
      <MDXRemote
        source={source}
        components={components}
        options={{ mdxOptions: { rehypePlugins: [rehypeSlug] } }}
      />
    </div>
  );
}
