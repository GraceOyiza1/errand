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

const DEFAULT_RIDERS = [
    { name: 'Nana', phone: '054 111 2222' },
    { name: 'Yaw', phone: '020 333 4444' }
];

export default function ShopperDashboard() {
    const [orders, setOrders] = useState<DemoOrder[]>([]);
    const [riders, setRiders] = useState<{ name: string, phone: string }[]>(DEFAULT_RIDERS);
    const [selectedRider, setSelectedRider] = useState('');
    const [joinName, setJoinName] = useState('');
    const [joinPhone, setJoinPhone] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const savedOrders = window.localStorage.getItem('errand-demo-orders');
        if (savedOrders) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setOrders(JSON.parse(savedOrders));
        }

        const savedRiders = window.localStorage.getItem('errand-demo-riders');
        if (savedRiders) {
            try {
                const parsed = JSON.parse(savedRiders);
                const formatted = parsed.map((p: any) => typeof p === 'string' ? { name: p, phone: '' } : p);
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setRiders(formatted);
                if (!selectedRider && formatted.length > 0) {
                    // eslint-disable-next-line react-hooks/set-state-in-effect
                    setSelectedRider(formatted[0].name);
                }
            } catch (e) {
                console.error(e);
            }
        } else {
            window.localStorage.setItem('errand-demo-riders', JSON.stringify(DEFAULT_RIDERS));
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setSelectedRider(DEFAULT_RIDERS[0].name);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const saveOrders = (updatedOrders: DemoOrder[]) => {
        setOrders(updatedOrders);
        if (typeof window !== 'undefined') {
            window.localStorage.setItem('errand-demo-orders', JSON.stringify(updatedOrders));
        }
    };

    const handleAcceptOrder = (orderId: string) => {
        const orderToAccept = orders.find(o => o.id === orderId);
        if (!orderToAccept) return;

        const activeTasks = orders.filter(
            o => o.riderName === selectedRider &&
                o.marketName === orderToAccept.marketName &&
                ['accepted', 'shopping', 'delivering'].includes(o.status)
        );

        if (activeTasks.length >= 2) {
            setMessage(`You can only handle up to 2 shopping tasks from ${orderToAccept.marketName} at the same time to avoid confusion.`);
            return;
        }

        const generatedEta = Math.floor(Math.random() * 20) + 15;

        const updatedOrders = orders.map((order) =>
            order.id === orderId
                ? {
                    ...order,
                    status: 'accepted',
                    riderName: selectedRider,
                    etaMinutes: generatedEta,
                    riderMessage: `I've picked up your order from ${order.marketName} and expect delivery in about ${generatedEta} minutes.`,
                }
                : order
        );
        saveOrders(updatedOrders);
        setMessage('You accepted this ride request. The customer can now see your update.');
    };

    const handleCancelOrder = (orderId: string) => {
        const updatedOrders = orders.map((order) =>
            order.id === orderId
                ? { ...order, status: 'cancelled' }
                : order
        );
        saveOrders(updatedOrders);
        setMessage('You cancelled this ride request.');
    };

    const handleJoinRider = () => {
        const trimmedName = joinName.trim();
        const trimmedPhone = joinPhone.trim();
        if (!trimmedName || !trimmedPhone) return;

        const exists = riders.find(r => r.name === trimmedName);
        let nextRiders = riders;
        if (!exists) {
            nextRiders = [...riders, { name: trimmedName, phone: trimmedPhone }];
            setRiders(nextRiders);
            window.localStorage.setItem('errand-demo-riders', JSON.stringify(nextRiders));
        }

        setSelectedRider(trimmedName);
        setJoinName('');
        setJoinPhone('');
        setMessage(`${trimmedName} is now available as a rider.`);
    };

    const visibleOrders = orders.filter(
        (order) =>
            order.status === 'pending' ||
            order.status === 'accepted' ||
            order.status === 'shopping' ||
            order.status === 'delivering'
    );

    return (
        <div className="mx-auto max-w-6xl space-y-6 overflow-x-hidden px-3 py-4 sm:px-6 sm:py-6">
            <div className="space-y-1">
                <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">Available Market Errands</h1>
                <p className="text-sm text-slate-500 sm:text-base">Accept trips below to start shopping for clients.</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-xs uppercase tracking-widest text-slate-400">Rider</p>
                        <p className="text-sm font-semibold text-slate-900">{selectedRider || 'Choose a rider'}</p>
                    </div>
                    <div className="flex gap-2">
                        {riders.map((rider) => (
                            <button
                                key={rider.name}
                                type="button"
                                onClick={() => setSelectedRider(rider.name)}
                                className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${selectedRider === rider.name ? 'bg-emerald-500 text-slate-950' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                            >
                                {rider.name} {rider.phone ? `(${rider.phone})` : ''}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                    <input
                        value={joinName}
                        onChange={(e) => setJoinName(e.target.value)}
                        placeholder="Name (e.g. Kwame)"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-emerald-600"
                    />
                    <input
                        value={joinPhone}
                        onChange={(e) => setJoinPhone(e.target.value)}
                        placeholder="Phone (e.g. 054 123 4567)"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-emerald-600"
                    />
                    <button
                        type="button"
                        onClick={handleJoinRider}
                        disabled={!joinName.trim() || !joinPhone.trim()}
                        className="w-full rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed whitespace-nowrap sm:w-auto"
                    >
                        Join as Rider
                    </button>
                </div>

                {message && (
                    <p className="mt-3 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p>
                )}
            </div>

            {visibleOrders.length === 0 ? (
                <div className="bg-white border p-12 rounded-2xl shadow-xs text-center text-slate-400">
                    <p className="text-sm font-medium">No open market requests in your area right now.</p>
                    <p className="text-xs mt-1">New orders from Makola, Madina, and Kaneshie will appear live here.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {visibleOrders.map((order) => (
                        <div key={order.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div className="min-w-0">
                                    <p className="text-xs uppercase tracking-widest text-slate-400">Order #{order.id.replace('demo-', '')}</p>
                                    <h2 className="mt-1 text-lg font-semibold text-slate-900">{order.marketName}</h2>
                                    <p className="mt-1 text-sm text-slate-500">Customer: <span className="font-medium text-slate-800">{order.customerName}</span></p>
                                    <p className="mt-1 text-sm break-words text-slate-500">Items: {order.items.map((item) => `${item.quantity} × ${item.name}`).join(', ')}</p>
                                </div>
                                <span className="self-start rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">{order.status}</span>
                            </div>
                            <div className="mt-3 grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                                <div>
                                    <p className="text-xs text-slate-500">Assigned Rider</p>
                                    <p className="text-sm font-medium text-slate-800">{order.riderName}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">Payment</p>
                                    <p className="text-sm font-medium text-slate-800">{order.paymentMethod === 'cash' ? 'Cash' : 'MoMo Placeholder'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">GMT</p>
                                    <p className="text-sm font-medium text-slate-800">{order.etaMinutes} min</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">Total</p>
                                    <p className="text-sm font-medium text-slate-800">₵{order.total.toFixed(2)}</p>
                                </div>
                            </div>

                            {order.status === 'pending' ? (
                                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                                    <button
                                        type="button"
                                        onClick={() => handleAcceptOrder(order.id)}
                                        className="w-full rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 sm:w-auto"
                                    >
                                        Accept Ride
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleCancelOrder(order.id)}
                                        className="w-full rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-500 sm:w-auto"
                                    >
                                        Cancel Order
                                    </button>
                                </div>
                            ) : order.riderName === selectedRider ? (
                                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                                    <button
                                        type="button"
                                        onClick={() => handleCancelOrder(order.id)}
                                        className="w-full rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-500 sm:w-auto"
                                    >
                                        Order Delivered
                                    </button>
                                </div>
                            ) : null}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
