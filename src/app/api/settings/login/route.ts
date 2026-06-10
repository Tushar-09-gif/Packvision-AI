import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = await getDb();
    const content = await db.getLoginContent();
    return NextResponse.json(content);
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await requireAuth(['admin']);
    const db = await getDb();
    const content = await req.json();
    await db.updateLoginContent(content);
    return NextResponse.json({ success: true, content });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
