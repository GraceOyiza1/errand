import { NextResponse, NextRequest } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId, Filter, Document } from 'mongodb';

const fallbackErrands: Array<Record<string, unknown>> = [];

function getFallbackErrands(query: Record<string, unknown> = {}) {
    return fallbackErrands.filter((errand) => {
        const unsafeErrand = errand as Record<string, unknown>;
        if (query.customerId && unsafeErrand.customerId !== query.customerId) {
            return false;
        }

        if (query.role === 'shopper') {
            if (query.riderId) {
                return unsafeErrand.riderId === query.riderId;
            }

            return unsafeErrand.status === 'paid_editable' || unsafeErrand.status === 'locked';
        }

        return true;
    });
}

// GET: Fetch errands with dynamic filtering for customers and shoppers
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const customerId = searchParams.get('customerId');
        const role = searchParams.get('role');
        const riderId = searchParams.get('riderId');

        // Build our dynamic MongoDB query with proper typing
        const query: Filter<Document> = {};

        if (customerId) {
            query.customerId = customerId;
        } else if (role === 'shopper') {
            if (riderId) {
                query.riderId = riderId;
            } else {
                query.status = { $in: ['paid_editable', 'locked'] };
                query.riderId = null;
            }
        }

        if (!process.env.MONGODB_URI) {
            const fallbackData = getFallbackErrands({ customerId, role, riderId });
            return NextResponse.json({ success: true, data: fallbackData }, { status: 200 });
        }

        const client = await clientPromise;
        const db = client.db('errand_db');

        const errands = await db
            .collection('errands')
            .find(query)
            .sort({ createdAt: -1 })
            .toArray();

        return NextResponse.json({ success: true, data: errands }, { status: 200 });
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : 'Unknown error';
        const lower = msg.toLowerCase();

        if (lower.includes('ssl') || lower.includes('tls') || lower.includes('handshake') || lower.includes('server selection')) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Could not connect to MongoDB Atlas. Check your MONGODB_URI, Atlas network access, and TLS settings.',
                },
                { status: 502 }
            );
        }

        return NextResponse.json({ success: false, error: msg }, { status: 500 });
    }
}

// POST: Create a brand new errand request from a customer
export async function POST(request: Request) {
    try {
        const body: Record<string, unknown> = await request.json();

        const newErrand = {
            customerId: (body.customerId as string) || 'guest_user_1',
            customerName: (body.customerName as string) || '',
            customerPhone: (body.customerPhone as string) || '',
            marketName: (body.marketName as string) || 'Makola Market',
            items: (body.items as unknown[]) || [],
            payout: parseFloat(body.payout as string) || 0.0,
            paymentMethod: (body.paymentMethod as string) || 'cash',
            status: 'paid_editable',
            createdAt: new Date().toISOString(),
            lockTimeDeadline: new Date(Date.now() + 3 * 60 * 1000).toISOString(),
            riderId: null,
        };

        if (!process.env.MONGODB_URI) {
            const fallbackErrand = {
                ...newErrand,
                _id: new ObjectId().toHexString(),
            };
            fallbackErrands.unshift(fallbackErrand);

            return NextResponse.json(
                { success: true, message: 'Errand listed successfully!', insertedId: fallbackErrand._id },
                { status: 201 }
            );
        }

        const client = await clientPromise;
        const db = client.db('errand_db');
        const result = await db.collection('errands').insertOne(newErrand);

        return NextResponse.json(
            { success: true, message: 'Errand listed successfully!', insertedId: result.insertedId },
            { status: 201 }
        );
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : 'Unknown error';
        const lower = msg.toLowerCase();

        if (lower.includes('ssl') || lower.includes('tls') || lower.includes('handshake') || lower.includes('server selection')) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Could not connect to MongoDB Atlas. Check your MONGODB_URI, Atlas network access, and TLS settings.',
                },
                { status: 502 }
            );
        }

        return NextResponse.json({ success: false, error: msg }, { status: 500 });
    }
}

// PATCH: Update an existing errand request
export async function PATCH(request: Request) {
    try {
        const body: Record<string, unknown> = await request.json();
        const { id, ...updates } = body;

        if (!id) {
            return NextResponse.json({ success: false, error: 'Missing errand ID' }, { status: 400 });
        }

        const errandId = id as string;

        if (!process.env.MONGODB_URI) {
            const target = fallbackErrands.find((errand) => {
                const unsafeErrand = errand as Record<string, unknown>;
                return unsafeErrand._id === errandId || unsafeErrand.id === errandId;
            });

            if (!target) {
                return NextResponse.json({ success: false, error: 'Errand not found' }, { status: 404 });
            }

            Object.assign(target, updates, { updatedAt: new Date().toISOString() });
            return NextResponse.json({ success: true, message: 'Errand updated successfully!' }, { status: 200 });
        }

        const client = await clientPromise;
        const db = client.db('errand_db');

        const updateDoc = {
            $set: {
                ...updates,
                updatedAt: new Date().toISOString(),
            },
        };

        const query: Filter<Document> =
            ObjectId.isValid(errandId) && String(new ObjectId(errandId)) === errandId
                ? { $or: [{ _id: new ObjectId(errandId) }, { id: errandId }] }
                : { id: errandId };

        const result = await db.collection('errands').updateOne(query, updateDoc);

        if (result.matchedCount === 0) {
            return NextResponse.json({ success: false, error: 'Errand not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Errand updated successfully!' }, { status: 200 });
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : 'Unknown error';
        const lower = msg.toLowerCase();

        if (lower.includes('ssl') || lower.includes('tls') || lower.includes('handshake') || lower.includes('server selection')) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Could not connect to MongoDB Atlas. Check your MONGODB_URI, Atlas network access, and TLS settings.',
                },
                { status: 502 }
            );
        }

        return NextResponse.json({ success: false, error: msg }, { status: 500 });
    }
}