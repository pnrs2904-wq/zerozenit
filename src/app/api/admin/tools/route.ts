import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { commitJson, getFile } from '@/lib/github-cms';

const FILE = 'src/data/tools-cms.json';
async function readTools() {
  try { return JSON.parse((await getFile(FILE)).content || '[]'); }
  catch (e) { if (e instanceof Error && e.message.includes('GitHub API 404')) return []; throw e; }
}

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json(await readTools());
}

export async function POST(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await request.json();
  if (!body.name || !body.slug || !body.url) return NextResponse.json({ error: 'Name, slug and URL are required.' }, { status: 400 });
  const tools = await readTools();
  const item = {
    slug: String(body.slug).toLowerCase().replace(/[^a-z0-9-]/g, '-'), name: String(body.name), logo: String(body.logo || '🤖'), description: String(body.description || ''), category: String(body.category || 'AI'),
    pricing: ['Free', 'Freemium', 'Paid'].includes(body.pricing) ? body.pricing : 'Freemium', url: String(body.url), rating: Number(body.rating || 4), features: body.features || [], pros: body.pros || [], cons: body.cons || [],
  };
  const index = tools.findIndex((t: any) => t.slug === item.slug);
  if (index >= 0) tools[index] = item; else tools.push(item);
  await commitJson(FILE, tools, `${index >= 0 ? 'Update' : 'Add'} AI tool: ${item.name}`);
  return NextResponse.json({ ok: true, tool: item });
}
