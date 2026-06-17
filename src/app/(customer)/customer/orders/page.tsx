'use client';

import { useEffect, useState } from 'react';

interface DemoOrder {
    id: string;
    customerName: string;
    marketName: string;
    status: string;
    paymentMethod: string;
    riderName: string;
    riderMessage: string;
    total: number;
    etaMinutes: number;
    createdAt: string;
    items: Array<{
        name: string;
        quantity: number;
        unit: string;
        notes?: string;
    }>;
}

export default function CustomerOrdersPage() {
    const [orders, setOrders] = useState<DemoOrder[]>([]);
    const [currentTime, setCurrentTime] = useState(0);
    const [newItemName, setNewItemName] = useState('');

    useEffect(() => {
        // eslint-disable-next-line react-hooks/purity
        setCurrentTime(Date.now());
        const syncOrders = () => {
            const savedOrders = window.localStorage.getItem('errand-demo-orders');
            if (savedOrders) {
                setOrders(JSON.parse(savedOrders));
            }
        };

        syncOrders();
        const interval = window.setInterval(() => {
            syncOrders();
            // eslint-disable-next-line react-hooks/purity
            setCurrentTime(Date.now());
        }, 1000);

        return () => window.clearInterval(interval);
    }, []);

    const updateOrders = (updatedOrders: DemoOrder[]) => {
        setOrders(updatedOrders);
        window.localStorage.setItem('errand-demo-orders', JSON.stringify(updatedOrders));
    };

    const isEditable = (order: DemoOrder) => {
        if (!currentTime) return false;
        const lockTime = new Date(order.createdAt).getTime() + 3 * 60 * 1000;
        return currentTime < lockTime && order.status !== 'cancelled';
    };

    const getTimeRemaining = (order: DemoOrder) => {
        if (!currentTime) return '';
        const lockTime = new Date(order.createdAt).getTime() + 3 * 60 * 1000;
        const diff = Math.max(0, Math.floor((lockTime - currentTime) / 1000));
        const mins = Math.floor(diff / 60);
        const secs = diff % 60;
        return `${mins}m ${secs}s`;
    };

    const handleRemoveItem = (orderId: string, index: number) => {
        const updatedOrders = orders.map((order) => {
            if (order.id !== orderId) return order;
            const nextItems = order.items.filter((_, i) => i !== index);
            return { ...order, items: nextItems };
        });
        updateOrders(updatedOrders);
    };

    const handleAddItem = (orderId: string) => {
        if (!newItemName.trim()) return;

        const updatedOrders = orders.map((order) => {
            if (order.id !== orderId) return order;
            return {
                ...order,
                items: [
                    ...order.items,
                    {
                        name: newItemName.trim(),
                        quantity: 1,
                        unit: 'piece',
                        notes: 'Added by customer',
                    },
                ],
            };
        });
        updateOrders(updatedOrders);
        setNewItemName('');
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">My Orders</h1>
                <p className="mt-1 text-sm text-slate-500">Track your recent errand requests and delivery updates.</p>
            </div>

            {orders.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
                    No orders yet.
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <div key={order.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-xs uppercase tracking-widest text-slate-400">Order #{order.id.replace('demo-', '')}</p>
                                    <h2 className="mt-1 text-lg font-semibold text-slate-900">{order.marketName}</h2>
                                </div>
                                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                                    {order.status}
                                </span>
                            </div>

                            <div className="mt-4 grid gap-3 sm:grid-cols-4">
                                <div>
                                    <p className="text-xs text-slate-500">Payment</p>
                                    <p className="text-sm font-medium text-slate-800">{order.paymentMethod === 'cash' ? 'Cash on Delivery' : 'MoMo Placeholder'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">Assigned Rider</p>
                                    <p className="text-sm font-medium text-slate-800">{order.riderName}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">ETA</p>
                                    <p className="text-sm font-medium text-slate-800">{order.etaMinutes} min</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">Total</p>
                                    <p className="text-sm font-medium text-slate-800">₵{order.total.toFixed(2)}</p>
                                </div>
                            </div>

                            <div className="mt-4 rounded-2xl bg-slate-50 p-3 text-sm text-slate-700">
                                <p className="font-semibold text-slate-900">{order.riderName} says:</p>
                                <p>{order.riderMessage}</p>
                            </div>

                            <div className="mt-4">
                                <div className="flex items-center justify-between">
                                    <p className="text-xs text-slate-500">Items</p>
                                    {isEditable(order) ? (
                                        <span className="text-xs text-amber-600">Edit lock in {getTimeRemaining(order)}</span>
                                    ) : (
                                        <span className="text-xs text-slate-400">No more edits allowed</span>
                                    )}
                                </div>
                                <ul className="mt-1 space-y-2 text-sm text-slate-700">
                                    {order.items.map((item, index) => (
                                        <li key={`${order.id}-${index}`} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2">
                                            <span>
                                                {item.quantity} × {item.name} ({item.unit})
                                                {item.notes ? ` — ${item.notes}` : ''}
                                            </span>
                                            {isEditable(order) && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveItem(order.id, index)}
                                                    className="text-xs font-medium text-rose-600 hover:underline"
                                                >
                                                    Remove
                                                </button>
                                            )}
                                        </li>
                                    ))}
                                </ul>

                                {isEditable(order) && (
                                    <div className="mt-3 flex gap-2">
                                        <input
                                            value={newItemName}
                                            onChange={(e) => setNewItemName(e.target.value)}
                                            placeholder="Add another item"
                                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-emerald-600"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleAddItem(order.id)}
                                            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
                                        >
                                            Add Item
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
