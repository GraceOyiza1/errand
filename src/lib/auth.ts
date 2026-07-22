import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const SECRET_KEY = process.env.JWT_SECRET || 'fallback-secret-key-for-development';
const key = new TextEncoder().encode(SECRET_KEY);

export async function createSession(payload: any) {
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 1 week
    const session = await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(key);

    const cookieStore = await cookies();
    cookieStore.set('session', session, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        expires,
    });
}

export async function verifySession(session: string) {
    try {
        const { payload } = await jwtVerify(session, key, {
            algorithms: ['HS256'],
        });
        return payload;
    } catch (error) {
        return null;
    }
}

export async function destroySession() {
    const cookieStore = await cookies();
    cookieStore.delete('session');
}

export async function getSession() {
    const cookieStore = await cookies();
    const session = cookieStore.get('session')?.value;
    if (!session) return null;
    return await verifySession(session);
}
