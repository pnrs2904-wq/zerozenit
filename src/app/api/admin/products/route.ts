import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { commitJson, getFile } from '@/lib/github-cms';

const FILE = 'src/data/products.json';

async function readProducts() {
  try { return JSON.parse((await getFile(FILE)).content || '[]'); }
  catch (e) { if (e instanceof Error && e.message.includes('GitHub API 404')) return []; throw e; }
}

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json(await readProducts());
}

export async function POST(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await request.json();
  if (!body.name || !body.slug || !body.description) return NextResponse.json({ error: 'Name, slug and description are required.' }, { status: 400 });
  const products = await readProducts();
  const item = {
    slug: String(body.slug).toLowerCase().replace(/[^a-z0-9-]/g, '-'), name: String(body.name), description: String(body.description), category: String(body.category || 'Digital Product'),
    price: Number(body.price || 0), salePrice: body.salePrice === '' || body.salePrice == null ? null : Number(body.salePrice), currency: String(body.currency || 'INR'),
    image: String(body.image || '📘'), purchaseUrl: String(body.purchaseUrl || ''), downloadUrl: String(body.downloadUrl || ''), featured: Boolean(body.featured), active: body.active !== false,
  };
  const index = products.findIndex((p: any) => p.slug === item.slug);
  if (index >= 0) products[index] = item; else products.push(item);
  await commitJson(FILE, products, `${index >= 0 ? 'Update' : 'Add'} digital product: ${item.name}`);
  return NextResponse.json({ ok: true, product: item });
}
