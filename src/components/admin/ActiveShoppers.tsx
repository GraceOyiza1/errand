'use client';

import React, { useEffect, useState } from 'react';
import { Star, Loader2, UserCircle } from 'lucide-react';

export default function ActiveShoppers() {
    const [shoppers, setShoppers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/admin/stats')
            .then(res => res.json())
            .then(json => {
                if (json.success) setShoppers(json.data.activeShoppers || []);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white"><Loader2 className="h-8 w-8 animate-spin text-slate-400" /></div>;
    }

    return (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="border-b border-slate-100 px-6 py-5 dark:border-slate-800">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Active Shoppers</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Monitor performance and daily activity.</p>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-500 dark:text-slate-400">
                    <thead className="bg-slate-50 text-xs uppercase text-slate-700 dark:bg-slate-800/50 dark:text-slate-400">
                        <tr>
                            <th scope="col" className="px-6 py-4">Shopper</th>
                            <th scope="col" className="px-6 py-4">Status</th>
                            <th scope="col" className="px-6 py-4">Completed Orders</th>
                            <th scope="col" className="px-6 py-4">Total Earned</th>
                        </tr>
                    </thead>
                    <tbody>
                        {shoppers.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                                    No active shoppers found yet.
                                </td>
                            </tr>
                        ) : shoppers.map((shopper, idx) => (
                            <tr
                                key={idx}
                                className="border-b border-slate-50 transition-colors hover:bg-slate-50/50 dark:border-slate-800 dark:hover:bg-slate-800/50"
                            >
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                                            <UserCircle className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-900 dark:text-white uppercase tracking-wide">
                                                {shopper.name}
                                            </div>
                                            <div className="text-xs text-slate-500">ID: {shopper.id}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span
                                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                            shopper.isActive
                                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                                : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                                        }`}
                                    >
                                        <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${
                                            shopper.isActive ? 'bg-blue-500' : 'bg-emerald-500'
                                        }`}></span>
                                        {shopper.isActive ? 'On Delivery' : 'Available'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-300">
                                    {shopper.deliveries}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="font-medium text-slate-900 dark:text-white">
                                        ₵{(shopper.earned || 0).toFixed(2)}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
