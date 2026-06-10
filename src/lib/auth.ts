import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const SECRET_KEY = process.env.JWT_SECRET || 'packvision-super-secret-key-2024';
const key = new TextEncoder().encode(SECRET_KEY);

export async function signToken(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(key);
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, key);
    return payload;
  } catch (err) {
    return null;
  }
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (!token) return null;
  return await verifyToken(token);
}

export async function requireAuth(allowedRoles?: string[]) {
  const session = await getSession();
  if (!session) {
    throw new Error('Unauthorized');
  }
  if (allowedRoles && !allowedRoles.includes(session.role as string)) {
    throw new Error('Forbidden');
  }
  return session;
}
