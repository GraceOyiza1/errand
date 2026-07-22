import React from 'react';
import DashboardStats from '@/components/admin/DashboardStats';
import RevenueChart from '@/components/admin/RevenueChart';
import ActiveShoppers from '@/components/admin/ActiveShoppers';
import TopCustomers from '@/components/admin/TopCustomers';

export default function AdminDashboardPage() {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Admin Dashboard</h1>
                <p className="mt-2 text-slate-500 dark:text-slate-400">
                    Overview of platform activity, revenue, and active workers.
                </p>
            </div>

            {/* Premium Metric Cards */}
            <DashboardStats />

            <div className="grid gap-8 lg:grid-cols-3">
                {/* Charts Area */}
                <div className="lg:col-span-2">
                    <RevenueChart />
                </div>
                
                {/* Top Customers (For Annual Gifts) */}
                <div className="lg:col-span-1">
                    <TopCustomers />
                </div>
            </div>

            <div className="grid gap-8">
                {/* Active Workers / Shoppers */}
                <ActiveShoppers />
            </div>
        </div>
    );
}
