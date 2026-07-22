import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET(request: Request) {
    try {
        const client = await clientPromise;
        const db = client.db('errand_db');

        // 1. Get Total Orders and Revenue
        const overallStats = await db.collection('errands').aggregate([
            {
                $group: {
                    _id: null,
                    totalOrders: { $sum: 1 },
                    totalRevenue: { $sum: { $toDouble: "$payout" } }
                }
            }
        ]).toArray();

        const totalOrders = overallStats.length > 0 ? overallStats[0].totalOrders : 0;
        const totalRevenue = overallStats.length > 0 ? overallStats[0].totalRevenue : 0;
        
        // Mock average rating since we don't have a ratings table yet
        const averageRating = 4.8;

        // 2. Get Top Customers
        const topCustomers = await db.collection('errands').aggregate([
            {
                $group: {
                    _id: "$customerId",
                    orders: { $sum: 1 },
                    spent: { $sum: { $toDouble: "$payout" } }
                }
            },
            { $sort: { spent: -1 } },
            { $limit: 5 },
            {
                $project: {
                    id: "$_id",
                    name: "$_id", // For now, the customerId is often their name or guest id
                    orders: 1,
                    spent: 1,
                    _id: 0
                }
            }
        ]).toArray();

        // 3. Get Active Shoppers
        const activeShoppers = await db.collection('errands').aggregate([
            { 
                $match: { riderId: { $ne: null } } 
            },
            {
                $group: {
                    _id: "$riderId",
                    name: { $first: "$riderName" },
                    deliveries: { $sum: 1 },
                    earned: { $sum: { $toDouble: "$payout" } },
                    status: { $last: "$status" }
                }
            },
            { $sort: { deliveries: -1 } },
            { $limit: 5 },
            {
                $project: {
                    id: "$_id",
                    name: { $ifNull: ["$name", "$_id"] },
                    deliveries: 1,
                    earned: 1,
                    // Determine if currently active based on last errand status
                    isActive: { 
                        $in: ["$status", ["accepted", "shopping", "delivering"]] 
                    },
                    _id: 0
                }
            }
        ]).toArray();

        return NextResponse.json({
            success: true,
            data: {
                totalOrders,
                totalRevenue,
                averageRating,
                topCustomers,
                activeShoppers
            }
        }, { status: 200 });

    } catch (error: any) {
        console.error("Admin stats fetch error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
