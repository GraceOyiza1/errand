import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// GET: Fetch errands dynamically based on who is asking (Customer vs Shopper)
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const customerId = searchParams.get('customerId');
        const role = searchParams.get('role');
        const riderId = searchParams.get('riderId');

        const client = await clientPromise;
        const db = client.db('errand_db');
        let query: any = {};

        // 1. If customerId is provided, show ONLY that customer's order history
        if (customerId) {
            query.customerId = customerId;
        }
        // 2. If it's a shopper asking
        else if (role === 'shopper') {
            if (riderId) {
                // Show errands this specific shopper has claimed or completed
                query.riderId = riderId;
            } else {
                // Show ONLY open marketplace errands available to be claimed
                query.status = { $in: ['paid_editable', 'locked'] };
                query.riderId = null;
                // Clean off unaccepted orders after 24 hours
                const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
                query.createdAt = { $gte: oneDayAgo };
            }
        }

        const errands = await db
            .collection('errands')
            .find(query)
            .sort({ createdAt: -1 })
            .toArray();

        return NextResponse.json({ success: true, data: errands }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// POST: Create a brand new errand request from a customer
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const client = await clientPromise;
        const db = client.db('errand_db');

        // Structure the data clearly matching our layout schema
        const newErrand = {
            customerId: body.customerId || "guest_user_1",
            marketName: body.marketName || "Makola Market",
            items: body.items || [],
            payout: parseFloat(body.payout) || 0.0,
            status: "paid_editable",
            createdAt: new Date().toISOString(),
            lockTimeDeadline: new Date(Date.now() + 3 * 60 * 1000).toISOString(), // 3-minute grace period
            riderId: null
        };

        // Insert document into MongoDB collection
        const result = await db.collection('errands').insertOne(newErrand);

        return NextResponse.json({
            success: true,
            message: "Errand listed successfully!",
            insertedId: result.insertedId
        }, { status: 201 });

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// PATCH: Update errand state (Accepting job, starting shopping, completing delivery)
export async function PATCH(request: Request) {
    try {
        const body = await request.json();
        const { id, status, riderId, riderName, etaMinutes, riderMessage, basketImageUrl } = body;

        if (!id) {
            return NextResponse.json({ success: false, error: "Missing errand ID" }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db('errand_db');

        // Prepare dynamic update payload
        const updateData: any = { status };

        if (riderId !== undefined) updateData.riderId = riderId;
        if (riderName !== undefined) updateData.riderName = riderName;
        if (etaMinutes !== undefined) updateData.estDeliveryTime = etaMinutes;
        if (riderMessage !== undefined) updateData.riderMessage = riderMessage;
        if (basketImageUrl !== undefined) updateData.basketImageUrl = basketImageUrl;

        // Convert string ID to MongoDB ObjectId safely
        let queryId;
        try {
            queryId = new ObjectId(id);
        } catch {
            queryId = id; // Fallback to string if ObjectId conversion fails
        }

        const result = await db.collection('errands').updateOne(
            { _id: queryId },
            { $set: updateData }
        );

        if (result.matchedCount === 0) {
            // Try querying with string id as a fallback in case it was stored as string
            const stringResult = await db.collection('errands').updateOne(
                { id: id },
                { $set: updateData }
            );
            if (stringResult.matchedCount === 0) {
                return NextResponse.json({ success: false, error: "Errand not found" }, { status: 404 });
            }
        }

        return NextResponse.json({ success: true, message: "Errand status synced successfully!" }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}