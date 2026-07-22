import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { createSession } from '@/lib/auth';
import { comparePassword } from '@/lib/password';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json({ error: 'Missing email or password' }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db();

        const user = await db.collection('users').findOne({ email });

        if (!user) {
            return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
        }

        const isValidPassword = await comparePassword(password, user.password);

        if (!isValidPassword) {
            return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
        }

        // Create secure session
        await createSession({
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
        });

        return NextResponse.json(
            { message: 'Logged in successfully', role: user.role },
            { status: 200 }
        );
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
