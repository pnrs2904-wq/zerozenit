// Compatibility shim: content now lives in /content/blog/*.mdx and is loaded via lib/mdx.
// Kept so any legacy imports of `posts` / `getPost` continue to resolve.
export { getAllPosts as posts_loader, getPost, getAllPosts } from '@/lib/mdx';
import { getAllPosts } from '@/lib/mdx';
export const posts = getAllPosts();
