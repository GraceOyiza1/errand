'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';

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
    customerName?: string;
    marketName: string;
    status: string;
    payout: number;
    paymentMethod?: string;
    riderId?: string | null;
    riderName?: string;
    riderMessage?: string;
    estShoppingTime?: string;
    estDeliveryTime?: string;
    createdAt: string;
    lockTimeDeadline?: string;
    items: ErrandItem[];
}

const STATUS_STEPS = [
    { key: 'paid_editable', label: 'Order Placed', icon: '📋', color: 'text-errand-clay' },
    { key: 'locked', label: 'Locked & Open', icon: '🔒', color: 'text-errand-ochre' },
    { key: 'accepted', label: 'Shopper Assigned', icon: '🤝', color: 'text-purple-600' },
    { key: 'shopping', label: 'Shopping Now', icon: '🛒', color: 'text-errand-ochre' },
    { key: 'delivering', label: 'On The Way', icon: '🏍️', color: 'text-errand-clay' },
    { key: 'completed', label: 'Delivered!', icon: '✅', color: 'text-errand-leaf' },
];

const STATUS_INDEX: Record<string, number> = {
    paid_editable: 0,
    locked: 1,
    accepted: 2,
    shopping: 3,
    delivering: 4,
    completed: 5,
    cancelled: -1,
};

function StatusTimeline({ status }: { status: string }) {
    const currentIdx = STATUS_INDEX[status] ?? 0;
    return (
        <div className="mt-4 overflow-x-auto">
            <div className="flex items-center gap-0 min-w-max">
                {STATUS_STEPS.map((step, idx) => {
                    const done = idx < currentIdx;
                    const active = idx === currentIdx;
                    return (
                        <div key={step.key} className="flex items-center">
                            <div className="flex flex-col items-center">
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${done
                                        ? 'bg-errand-leaf border-errand-leaf text-white'
                                        : active
                                            ? 'bg-errand-alabaster border-errand-leaf text-errand-leaf shadow-md scale-110'
                                            : 'bg-slate-100 border-slate-200 text-slate-400'
                                        }`}
                                >
                                    {done ? '✓' : step.icon}
                                </div>
                                <p
                                    className={`mt-1 text-[9px] font-semibold text-center max-w-[56px] leading-tight ${active ? 'text-errand-leaf' : done ? 'text-slate-600' : 'text-slate-400'
                                        }`}
                                >
                                    {step.label}
                                </p>
                            </div>
                            {idx < STATUS_STEPS.length - 1 && (
                                <div
                                    className={`h-0.5 w-8 mx-1 rounded-full transition-all ${idx < currentIdx ? 'bg-errand-leaf' : 'bg-slate-200'
                                        }`}
                                />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default function CustomerOrdersPage() {
    const [orders, setOrders] = useState<Errand[]>([]);
    const [customerId, setCustomerId] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [currentTime, setCurrentTime] = useState(Date.now());
    const [newItemName, setNewItemName] = useState('');
    const [loading, setLoading] = useState(true);

    // Load identity from localStorage on mount
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const savedId = window.localStorage.getItem('errand-customer-id') || '';
        const savedName = window.localStorage.getItem('errand-customer-name') || '';
        setCustomerId(savedId);
        setCustomerName(savedName);
    }, []);

    const fetchOrders = useCallback(async () => {
        if (!customerId) return;
        try {
            const res = await fetch(`/api/errands?customerId=${customerId}`);
            const result = await res.json();
            if (res.ok && result?.success) {
                setOrders(result.data || []);
            }
        } catch (err) {
            console.error('Failed to fetch orders:', err);
        } finally {
            setLoading(false);
        }
    }, [customerId]);

    useEffect(() => {
        if (!customerId) {
            setLoading(false);
            return;
        }
        fetchOrders();
        const dataInterval = setInterval(fetchOrders, 4000);
        const timeInterval = setInterval(() => setCurrentTime(Date.now()), 1000);
        return () => {
            clearInterval(dataInterval);
            clearInterval(timeInterval);
        };
    }, [customerId, fetchOrders]);

    const getErrandId = (order: Errand) => (order._id || order.id) as string;

    const isEditable = (order: Errand) => {
        if (order.status === 'cancelled' || order.status === 'completed') return false;
        const lockTime = order.lockTimeDeadline
            ? new Date(order.lockTimeDeadline).getTime()
            : new Date(order.createdAt).getTime() + 3 * 60 * 1000;
        return currentTime < lockTime && order.status === 'paid_editable';
    };

    const getTimeRemaining = (order: Errand) => {
        const lockTime = order.lockTimeDeadline
            ? new Date(order.lockTimeDeadline).getTime()
            : new Date(order.createdAt).getTime() + 3 * 60 * 1000;
        const diff = Math.max(0, Math.floor((lockTime - currentTime) / 1000));
        const mins = Math.floor(diff / 60);
        const secs = diff % 60;
        return { str: `${mins}:${secs.toString().padStart(2, '0')}`, secs: diff };
    };

    const handleRemoveItem = async (order: Errand, idx: number) => {
        const nextItems = order.items.filter((_, i) => i !== idx);
        setOrders(orders.map((o) => (getErrandId(o) === getErrandId(order) ? { ...o, items: nextItems } : o)));
        try {
            await fetch('/api/errands', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: getErrandId(order), items: nextItems }),
            });
        } catch (e) { console.error(e); }
    };

    const handleAddItem = async (order: Errand) => {
        if (!newItemName.trim()) return;
        const nextItems = [
            ...order.items,
            { name: newItemName.trim(), quantity: 1, unit: 'piece', notes: 'Added by customer' },
        ];
        setOrders(orders.map((o) => (getErrandId(o) === getErrandId(order) ? { ...o, items: nextItems } : o)));
        setNewItemName('');
        try {
            await fetch('/api/errands', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: getErrandId(order), items: nextItems }),
            });
        } catch (e) { console.error(e); }
    };

    const statusBadge: Record<string, string> = {
        paid_editable: 'bg-blue-100 text-errand-clay',
        locked: 'bg-errand-ochre text-white',
        accepted: 'bg-purple-100 text-purple-700',
        shopping: 'bg-errand-ochre text-white',
        delivering: 'bg-indigo-100 text-errand-clay',
        completed: 'bg-errand-leaf text-white',
        cancelled: 'bg-rose-100 text-rose-600',
    };

    // No identity saved yet
    if (!loading && !customerId) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
                <div className="text-5xl">📦</div>
                <h1 className="text-2xl font-extrabold text-errand-obsidian">No Orders Yet</h1>
                <p className="text-slate-500 text-sm">
                    You haven&apos;t placed any orders yet, or your session has been cleared.
                </p>
                <Link
                    href="/customer/dashboard"
                    className="inline-flex items-center gap-2 mt-4 rounded-xl bg-errand-leaf hover:bg-errand-leaf text-white font-bold px-6 py-3 transition"
                >
                    🛒 Place Your First Order
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-extrabold text-errand-obsidian">
                        {customerName ? `${customerName}'s Orders` : 'My Orders'}
                    </h1>
                    <p className="mt-0.5 text-sm text-slate-500">
                        Real-Time updates every 4 seconds · {orders.length} order{orders.length !== 1 ? 's' : ''} found
                    </p>
                </div>
                <Link
                    href="/customer/dashboard"
                    className="self-start sm:self-center rounded-xl border border-slate-200 bg-errand-alabaster px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-errand-alabaster transition"
                >
                    + Place New Order
                </Link>
            </div>

            {loading ? (
                <div className="space-y-4 animate-pulse">
                    {[1, 2].map((i) => <div key={i} className="h-48 rounded-2xl bg-slate-200" />)}
                </div>
            ) : orders.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-errand-alabaster p-12 text-center space-y-3">
                    <div className="text-4xl">🧺</div>
                    <p className="font-semibold text-slate-700">No orders yet for your account.</p>
                    <p className="text-sm text-slate-400">Orders you place will appear here on Real-Time.</p>
                    <Link
                        href="/customer/dashboard"
                        className="inline-block mt-2 rounded-xl bg-errand-leaf hover:bg-errand-leaf text-white font-bold px-5 py-2.5 text-sm transition"
                    >
                        Start Shopping
                    </Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map((order) => {
                        const editable = isEditable(order);
                        const { str: timeStr, secs } = getTimeRemaining(order);
                        const eid = getErrandId(order);

                        return (
                            <div
                                key={eid}
                                className={`rounded-2xl border bg-errand-alabaster shadow-sm overflow-hidden ${order.status === 'cancelled' ? 'border-rose-200 opacity-70' : 'border-slate-200'
                                    }`}
                            >
                                {/* Card Header */}
                                <div className="flex items-start justify-between gap-3 p-5 pb-3">
                                    <div>
                                        <p className="text-[10px] uppercase tracking-widest text-slate-400">
                                            Order from {new Date(order.createdAt).toLocaleDateString('en-GH', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                        <h2 className="mt-1 text-lg font-bold text-errand-obsidian">{order.marketName}</h2>
                                        <p className="text-sm text-slate-500 mt-0.5">
                                            Payout: <span className="font-semibold text-slate-800">₵{order.payout}</span>
                                            {order.paymentMethod && (
                                                <span className="ml-2 text-xs text-slate-400">
                                                    · {order.paymentMethod === 'cash' ? 'Cash on Delivery' : 'MoMo'}
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                    <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${statusBadge[order.status] || 'bg-slate-100 text-slate-600'}`}>
                                        {order.status.replace('_', ' ')}
                                    </span>
                                </div>

                                {/* Status Timeline */}
                                <div className="px-5 pb-4">
                                    {order.status === 'cancelled' ? (
                                        <div className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700 font-medium">
                                            ❌ This order was cancelled.
                                        </div>
                                    ) : (
                                        <StatusTimeline status={order.status} />
                                    )}
                                </div>

                                {/* Rider Update */}
                                {order.riderMessage && order.status !== 'paid_editable' && (
                                    <div className="mx-5 mb-4 rounded-xl bg-errand-alabaster border border-slate-100 px-4 py-3">
                                        <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-1">
                                            {order.riderName ? `🏍️ ${order.riderName} says:` : 'Rider Update'}
                                        </p>
                                        <p className="text-sm font-medium text-slate-800">{order.riderMessage}</p>
                                        {(order.estShoppingTime || order.estDeliveryTime) && (
                                            <div className="mt-2 flex gap-4 text-xs text-slate-500">
                                                {order.estShoppingTime && <span>🛒 Shopping: ~{order.estShoppingTime} min</span>}
                                                {order.estDeliveryTime && <span>🏍️ Delivery: ~{order.estDeliveryTime} min</span>}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Items list */}
                                <div className="mx-5 mb-4">
                                    <p className="text-xs uppercase tracking-widest text-slate-400 mb-2">
                                        Items ({order.items.length})
                                    </p>
                                    <ul className="space-y-2">
                                        {order.items.map((item, idx) => (
                                            <li
                                                key={idx}
                                                className="flex items-center justify-between rounded-xl bg-errand-alabaster border border-slate-100 px-3 py-2 text-sm"
                                            >
                                                <span className="text-slate-700">
                                                    <span className="font-semibold">{item.quantity || item.qty || 1}×</span>{' '}
                                                    {item.name}
                                                    {(item.notes || item.condition) && (
                                                        <span className="ml-1 text-xs text-slate-400 italic">
                                                            — {item.notes || item.condition}
                                                        </span>
                                                    )}
                                                </span>
                                                {editable && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveItem(order, idx)}
                                                        className="ml-3 text-xs font-semibold text-rose-500 hover:text-rose-700 transition shrink-0"
                                                    >
                                                        Remove
                                                    </button>
                                                )}
                                            </li>
                                        ))}
                                    </ul>

                                    {/* Add item during editable window */}
                                    {editable && (
                                        <div className="mt-3 flex gap-2">
                                            <input
                                                value={newItemName}
                                                onChange={(e) => setNewItemName(e.target.value)}
                                                placeholder="Add another item…"
                                                className="flex-1 rounded-xl border border-slate-200 bg-errand-alabaster px-3 py-2 text-sm focus:outline-emerald-600"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => handleAddItem(order)}
                                                className="rounded-xl bg-errand-leaf px-4 py-2 text-sm font-bold text-white hover:bg-errand-leaf transition whitespace-nowrap"
                                            >
                                                Add
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Edit window banner */}
                                {order.status === 'paid_editable' && (
                                    <div className={`mx-5 mb-5 rounded-xl px-4 py-3 flex items-center justify-between ${secs > 0
                                        ? 'bg-errand-ochre border border-errand-ochre'
                                        : 'bg-slate-100 border border-slate-200'
                                        }`}>
                                        {secs > 0 ? (
                                            <>
                                                <div>
                                                    <p className="text-xs font-bold text-errand-ochre">
                                                        ✏️ Edit window closes in {timeStr}
                                                    </p>
                                                    <p className="text-[10px] text-errand-ochre mt-0.5">
                                                        You can still add or remove items
                                                    </p>
                                                </div>
                                                <div className="text-2xl font-black text-errand-ochre tabular-nums">{timeStr}</div>
                                            </>
                                        ) : (
                                            <p className="text-xs font-bold text-slate-500">
                                                🔒 Edit window closed — order is now locked for the shopper
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
