import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySession } from '@/lib/auth';

export async function proxy(request: NextRequest) {
    const session = request.cookies.get('session')?.value;
    const { pathname } = request.nextUrl;

    // Protect ONLY admin routes with the email/password session
    const isProtected = pathname.startsWith('/admin/dashboard');

    if (isProtected) {
        if (!session) {
            return NextResponse.redirect(new URL('/login', request.url));
        }

        const payload = await verifySession(session);
        if (!payload || payload.role !== 'admin') {
            const response = NextResponse.redirect(new URL('/login', request.url));
            response.cookies.delete('session');
            return response;
        }
    }

    // Redirect logged-in admins away from auth pages
    if (session && (pathname === '/login' || pathname === '/register')) {
        const payload = await verifySession(session);
        if (payload?.role === 'admin') {
            return NextResponse.redirect(new URL('/admin/dashboard', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api/auth (auth API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
    ],
};
