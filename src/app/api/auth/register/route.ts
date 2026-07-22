import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { createSession } from '@/lib/auth';
import { hashPassword } from '@/lib/password';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, email, password } = body;

        if (!name || !email || !password) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db();

        // Check if user already exists
        const existingUser = await db.collection('users').findOne({ email });
        if (existingUser) {
            return NextResponse.json({ error: 'Admin with this email already exists' }, { status: 409 });
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Create user
        const newUser = {
            name,
            email,
            password: hashedPassword,
            role: 'admin',
            status: 'Active',
            createdAt: new Date(),
        };

        const result = await db.collection('users').insertOne(newUser);
        
        // Log them in automatically
        await createSession({
            userId: result.insertedId.toString(),
            email: newUser.email,
            role: newUser.role,
        });

        return NextResponse.json(
            { message: 'User registered successfully', userId: result.insertedId },
            { status: 201 }
        );
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
