import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth(['admin']);
    const { id } = await params;
    const db = await getDb();
    const updates = await req.json();
    
    const updated = await db.updateQuestion(id, updates);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, question: updated });
  } catch (error) {
    console.error('Question PUT Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update question' }, { status: 500 });
  }
}
