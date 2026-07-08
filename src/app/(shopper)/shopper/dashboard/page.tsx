'use client';

import { useCallback, useEffect, useState } from 'react';

interface ErrandItem {
    name: string;
    quantity?: number;
    qty?: number;
    unit?: string;
    notes?: string;
    condition?: string;
}

interface Errand {
    _id?: string;
    id?: string;
    customerId: string;
    marketName: string;
    status: string;
    payout: number;
    riderId?: string | null;
    riderName?: string;
    riderMessage?: string;
    createdAt: string;
    items: ErrandItem[];
}

// Stable ETA range outside of render to avoid impure function lint warning
const ETA_MIN = 15;
const ETA_RANGE = 20;

const SHOPPER_ID = 'user_unique_id_123';
const SHOPPER_NAME = 'Demo Shopper';

export default function ShopperDashboard() {
    const [poolErrands, setPoolErrands] = useState<Errand[]>([]);
    const [myErrands, setMyErrands] = useState<Errand[]>([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [etaSeed] = useState(() => Math.floor(Math.random() * ETA_RANGE) + ETA_MIN);

    const fetchErrands = useCallback(async () => {
        try {
            // Fetch 1: Open marketplace pool
            const poolRes = await fetch('/api/errands?role=shopper');
            const poolData = await poolRes.json();
            if (poolRes.ok && poolData?.success) {
                setPoolErrands(poolData.data || []);
            }

            // Fetch 2: This shopper's claimed/completed runs
            const myRes = await fetch(`/api/errands?role=shopper&riderId=${SHOPPER_ID}`);
            const myData = await myRes.json();
            if (myRes.ok && myData?.success) {
                setMyErrands(myData.data || []);
            }
        } catch (err) {
            console.error('Failed to fetch errands:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchErrands();
        const interval = setInterval(fetchErrands, 5000);
        return () => clearInterval(interval);
    }, [fetchErrands]);

    const handleAcceptOrder = async (errand: Errand) => {
        const errandId = errand._id || errand.id;
        const eta = etaSeed;
        try {
            const res = await fetch('/api/errands', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: errandId,
                    status: 'accepted',
                    riderId: SHOPPER_ID,
                    riderName: SHOPPER_NAME,
                    etaMinutes: eta,
                    riderMessage: `I've accepted your order from ${errand.marketName} and expect delivery in about ${eta} minutes.`,
                }),
            });
            const result = await res.json();
            if (result.success) {
                setMessage('You accepted this errand. The customer can now see your update.');
                fetchErrands();
            }
        } catch (e) {
            console.error('Failed to accept order:', e);
            setMessage('Error accepting order. Please try again.');
        }
    };

    const handleMarkDelivered = async (errand: Errand) => {
        const errandId = errand._id || errand.id;
        try {
            const res = await fetch('/api/errands', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: errandId,
                    status: 'completed',
                    riderMessage: 'Delivery complete! Thank you for using Errand.',
                }),
            });
            const result = await res.json();
            if (result.success) {
                setMessage('Order marked as delivered!');
                fetchErrands();
            }
        } catch (e) {
            console.error('Failed to mark delivered:', e);
        }
    };

    const totalEarnings = myErrands
        .filter((e) => e.status === 'completed')
        .reduce((sum, e) => sum + (e.payout || 0), 0);

    const statusColor: Record<string, string> = {
        paid_editable: 'bg-blue-50 text-blue-700',
        locked: 'bg-amber-50 text-amber-700',
        accepted: 'bg-emerald-50 text-emerald-700',
        shopping: 'bg-orange-50 text-orange-700',
        delivering: 'bg-indigo-50 text-indigo-700',
        completed: 'bg-slate-100 text-slate-600',
        cancelled: 'bg-rose-50 text-rose-600',
    };

    return (
        <div className="mx-auto max-w-6xl space-y-6 overflow-x-hidden px-3 py-4 sm:px-6 sm:py-6">
            <div className="space-y-1">
                <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                    Available Market Errands
                </h1>
                <p className="text-sm text-slate-500 sm:text-base">
                    Accept trips below to start shopping for clients.
                </p>
            </div>

            {/* Earnings Summary */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                <div className="rounded-2xl bg-slate-900 p-4 text-white shadow-md">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Total Earnings
                    </p>
                    <p className="mt-1 text-2xl font-black">₵{totalEarnings.toFixed(2)}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Completed Runs
                    </p>
                    <p className="mt-1 text-2xl font-black text-slate-900">
                        {myErrands.filter((e) => e.status === 'completed').length}
                    </p>
                </div>
                <div className="col-span-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:col-span-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Active Runs
                    </p>
                    <p className="mt-1 text-2xl font-black text-slate-900">
                        {myErrands.filter((e) => ['accepted', 'shopping', 'delivering'].includes(e.status)).length}
                    </p>
                </div>
            </div>

            {message && (
                <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 border border-emerald-200">
                    {message}
                </p>
            )}

            {/* Open Pool */}
            <div>
                <h2 className="mb-3 text-xs font-extrabold uppercase tracking-widest text-slate-400">
                    Open Market Pool
                </h2>
                {loading ? (
                    <div className="animate-pulse space-y-3">
                        {[1, 2].map((i) => (
                            <div key={i} className="h-36 rounded-2xl bg-slate-200" />
                        ))}
                    </div>
                ) : poolErrands.length === 0 ? (
                    <div className="rounded-2xl border bg-white p-12 text-center text-slate-400 shadow-sm">
                        <p className="text-sm font-medium">No open market requests right now.</p>
                        <p className="mt-1 text-xs">New orders will appear live here every 5 seconds.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {poolErrands.map((errand) => (
                            <div
                                key={errand._id || errand.id}
                                className="rounded-2xl border-2 border-slate-900 bg-white p-4 shadow-md sm:p-5"
                            >
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                    <div className="min-w-0">
                                        <p className="text-xs uppercase tracking-widest text-slate-400">
                                            Marketplace Errand
                                        </p>
                                        <h3 className="mt-1 text-lg font-semibold text-slate-900">
                                            {errand.marketName}
                                        </h3>
                                        <p className="mt-1 text-sm text-slate-500">
                                            Customer:{' '}
                                            <span className="font-medium text-slate-800">
                                                {errand.customerId}
                                            </span>
                                        </p>
                                        {errand.items && (
                                            <p className="mt-1 break-words text-sm text-slate-500">
                                                Items:{' '}
                                                {errand.items
                                                    .map(
                                                        (item) =>
                                                            `${item.quantity || item.qty || 1} × ${item.name}`
                                                    )
                                                    .join(', ')}
                                            </p>
                                        )}
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-[10px] font-bold uppercase text-slate-400">
                                            Payout
                                        </p>
                                        <p className="text-xl font-black text-slate-900">
                                            ₵{errand.payout}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <button
                                        type="button"
                                        onClick={() => handleAcceptOrder(errand)}
                                        className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-600 sm:w-auto"
                                    >
                                        🤝 Accept Errand
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* My Active & Past Runs */}
            {myErrands.length > 0 && (
                <div>
                    <h2 className="mb-3 text-xs font-extrabold uppercase tracking-widest text-slate-400">
                        My Runs
                    </h2>
                    <div className="space-y-4">
                        {myErrands.map((errand) => (
                            <div
                                key={errand._id || errand.id}
                                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
                            >
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                    <div className="min-w-0">
                                        <h3 className="text-base font-semibold text-slate-900">
                                            {errand.marketName}
                                        </h3>
                                        <p className="mt-0.5 text-sm text-slate-500">
                                            Customer: {errand.customerId}
                                        </p>
                                        <p className="mt-0.5 text-sm font-semibold text-emerald-700">
                                            ₵{errand.payout}
                                        </p>
                                    </div>
                                    <span
                                        className={`self-start rounded-full px-3 py-1 text-xs font-bold ${statusColor[errand.status] || 'bg-slate-100 text-slate-600'}`}
                                    >
                                        {errand.status}
                                    </span>
                                </div>

                                {errand.riderMessage && (
                                    <p className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600 border border-slate-100">
                                        {errand.riderMessage}
                                    </p>
                                )}

                                {['accepted', 'shopping', 'delivering'].includes(errand.status) && (
                                    <div className="mt-4">
                                        <button
                                            type="button"
                                            onClick={() => handleMarkDelivered(errand)}
                                            className="w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-500 sm:w-auto"
                                        >
                                            ✅ Mark as Delivered
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
