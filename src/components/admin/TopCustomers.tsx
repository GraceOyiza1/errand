'use client';

import React, { useEffect, useState } from 'react';
import { Gift, Trophy, Loader2, UserCircle2 } from 'lucide-react';

export default function TopCustomers() {
    const [customers, setCustomers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/admin/stats')
            .then(res => res.json())
            .then(json => {
                if (json.success) setCustomers(json.data.topCustomers || []);
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
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 dark:border-slate-800">
                <div>
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-amber-500" /> Top Customers
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Identify loyal customers for annual rewards.</p>
                </div>
                <button className="flex items-center gap-2 rounded-lg bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-600 transition-colors hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50">
                    <Gift className="h-4 w-4" />
                    Reward All
                </button>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {customers.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">
                        No customer data available yet.
                    </div>
                ) : customers.map((customer, idx) => (
                    <div
                        key={idx}
                        className="flex items-center justify-between p-6 transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/50"
                    >
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                                <UserCircle2 className="h-7 w-7" />
                            </div>
                            <div>
                                <div className="font-bold text-slate-900 dark:text-white">
                                    {(() => {
                                        const rawId = customer.name || '';
                                        let phoneStr = rawId.replace('customer_', '');
                                        if (phoneStr.length >= 10 && !isNaN(Number(phoneStr))) {
                                            return phoneStr.substring(0, 4) + '****' + phoneStr.substring(phoneStr.length - 3);
                                        }
                                        return rawId.length > 8 ? rawId.substring(0, 4) + '****' + rawId.substring(rawId.length - 3) : rawId;
                                    })()}
                                </div>
                                <div className="text-xs text-slate-500 mt-0.5">ID: {customer.id.substring(0, 8)}...</div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="font-semibold text-slate-900 dark:text-white">₵{(customer.spent || 0).toFixed(2)}</div>
                            <div className="text-sm text-slate-500">{customer.orders} Orders</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
