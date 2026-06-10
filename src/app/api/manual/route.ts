import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = await getDb();
    const manual = await db.getManual();
    return NextResponse.json({ success: true, manual });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await requireAuth(['admin']);
    const db = await getDb();
    const { html, fileName } = await req.json();
    await db.updateManual(html, fileName);
    return NextResponse.json({ success: true, manual: { html, fileName } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
