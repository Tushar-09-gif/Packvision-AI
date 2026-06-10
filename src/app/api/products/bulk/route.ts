import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { Product } from '@/types';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    await requireAuth(['admin']);
    const db = await getDb();
    const products: Product[] = await req.json();
    if (!Array.isArray(products)) return NextResponse.json({ success: false, error: 'Invalid data format' }, { status: 400 });
    await db.bulkUpsertProducts(products);
    return NextResponse.json({ success: true, count: products.length });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
