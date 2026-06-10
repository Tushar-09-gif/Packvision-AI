import { NextResponse } from 'next/server';
import { signToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const { id, name, role, email, avatar } = await req.json();
    
    if (!name || !role) {
      return NextResponse.json({ success: false, error: 'Missing name or role' }, { status: 400 });
    }

    const payload = { id, name, role, email, avatar };
    const token = await signToken(payload);

    const cookieStore = await cookies();
    cookieStore.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60 // 30 days
    });

    return NextResponse.json({ success: true, user: payload });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
