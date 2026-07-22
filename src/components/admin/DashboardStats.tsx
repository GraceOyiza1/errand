'use client';

import React, { useEffect, useState } from 'react';
import { ShoppingBag, TrendingUp, Star, Users, Award, Loader2 } from 'lucide-react';

export default function DashboardStats() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const [isShopperModalOpen, setIsShopperModalOpen] = useState(false);

    useEffect(() => {
        fetch('/api/admin/stats')
            .then(res => res.json())
            .then(json => {
                if (json.success) setData(json.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return <div className="flex h-32 items-center justify-center rounded-2xl border border-slate-200 bg-white"><Loader2 className="h-6 w-6 animate-spin text-slate-400" /></div>;
    }

    const stats = [
        {
            title: "Total Orders",
            value: data?.totalOrders || 0,
            change: 'Lifetime',
            trend: 'neutral',
            icon: ShoppingBag,
            color: 'from-blue-500 to-cyan-400',
            bg: 'bg-blue-50',
            iconColor: 'text-blue-500'
        },
        {
            title: 'Total Revenue',
            value: `₵${(data?.totalRevenue || 0).toFixed(2)}`,
            change: 'Lifetime',
            trend: 'up',
            icon: TrendingUp,
            color: 'from-emerald-500 to-teal-400',
            bg: 'bg-emerald-50',
            iconColor: 'text-emerald-500'
        },
        {
            title: 'Avg. Rating',
            value: data?.averageRating || 'N/A',
            change: 'Shopper Avg',
            trend: 'up',
            icon: Star,
            color: 'from-amber-500 to-orange-400',
            bg: 'bg-amber-50',
            iconColor: 'text-amber-500'
        },
        {
            title: 'Active Shoppers',
            value: data?.activeShoppers?.length || 0,
            change: 'Live',
            trend: 'neutral',
            icon: Users,
            color: 'from-indigo-500 to-purple-400',
            bg: 'bg-indigo-50',
            iconColor: 'text-indigo-500',
            onClick: () => setIsShopperModalOpen(true)
        },
        {
            title: 'Top Customers',
            value: data?.topCustomers?.length || 0,
            change: 'Ranked',
            trend: 'neutral',
            icon: Award,
            color: 'from-rose-500 to-pink-400',
            bg: 'bg-rose-50',
            iconColor: 'text-rose-500'
        },
    ];

    return (
        <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div
                            key={index}
                            onClick={stat.onClick}
                            className={`group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 ${stat.onClick ? 'cursor-pointer hover:border-indigo-300' : ''}`}
                        >
                            <div
                                className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 transition-opacity duration-300 group-hover:opacity-5`}
                            ></div>
                            
                            <div className="flex items-center justify-between">
                                <div className={`rounded-xl ${stat.bg} p-3 dark:bg-slate-800`}>
                                    <Icon className={`h-6 w-6 ${stat.iconColor}`} />
                                </div>
                                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    {stat.change}
                                </span>
                            </div>
                            <div className="mt-4">
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                    {stat.title}
                                </p>
                                <h3 className="mt-1 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                                    {stat.value}
                                </h3>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Shoppers Modal */}
            {isShopperModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white shadow-xl dark:bg-slate-900">
                        <div className="flex items-center justify-between border-b border-slate-100 p-6 dark:border-slate-800">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Active Shoppers</h2>
                            <button 
                                onClick={() => setIsShopperModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="p-6 max-h-[60vh] overflow-y-auto">
                            {data?.activeShoppers?.length > 0 ? (
                                <ul className="space-y-3">
                                    {data.activeShoppers.map((shopper: any, idx: number) => (
                                        <li key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between rounded-xl bg-slate-50 p-4 gap-3 sm:gap-0 dark:bg-slate-800/50">
                                            <div className="font-semibold text-slate-900 dark:text-white">{shopper.name}</div>
                                            <span className="inline-flex self-start sm:self-auto items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                                                Active Now
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="text-center text-slate-500 py-8">
                                    No active shoppers currently on the platform.
                                </div>
                            )}
                        </div>
                        <div className="border-t border-slate-100 bg-slate-50 p-4 text-center rounded-b-2xl dark:border-slate-800 dark:bg-slate-800/20">
                            <button 
                                onClick={() => setIsShopperModalOpen(false)}
                                className="text-sm font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
