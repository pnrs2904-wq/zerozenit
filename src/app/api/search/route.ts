import { NextResponse } from 'next/server';
import { buildSearchIndex } from '@/lib/search';

export const dynamic = 'force-static';

/** Serves the prebuilt search index as JSON. Static — no runtime cost. */
export function GET() {
  return NextResponse.json(buildSearchIndex());
}
