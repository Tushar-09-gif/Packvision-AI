import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function GET() {
  try {
    const db = await getDb();
    const questions = await db.getQuestions();
    return NextResponse.json({ success: true, questions });
  } catch (error) {
    console.error('Questions GET Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch questions' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await requireAuth();
    const db = await getDb();
    const body = await req.json();
    
    if (!body.id || !body.userId || !body.question) {
      return NextResponse.json({ success: false, error: 'Missing fields' }, { status: 400 });
    }
    
    await db.insertQuestion(body);
    return NextResponse.json({ success: true, question: body });
  } catch (error) {
    console.error('Questions POST Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create question' }, { status: 500 });
  }
}
