'use client';

import React, { useState } from 'react';

interface Market {
    id: string;
    name: string;
    description: string;
    tag: string;
    baseDeliveryFee: number;
}

interface CatalogItem {
    id: string;
    name: string;
    estimatedPrice: number;
    unit: string;
}

interface ShoppingItem {
    id: string;
    name: string;
    targetPrice: number;
    quantity: number;
    unit: string;
    notes: string;
    isCustom: boolean;
}

const ACCRA_MARKETS: Market[] = [
    { id: 'madina', name: 'Madina Market', description: 'Excellent for fresh farm produce, local grains, and everyday foodstuffs.', tag: 'Fast Delivery', baseDeliveryFee: 25 },
    { id: 'makola', name: 'Makola Market', description: 'Best wholesale hub for imported items, dry goods, and household packaging.', tag: 'Bulk Items', baseDeliveryFee: 35 },
    { id: 'kaneshie', name: 'Kaneshie Market', description: 'Ideal for local roots, tubers, and authentic spices wrapped in multi-tier stalls.', tag: 'Structured Shopping', baseDeliveryFee: 30 },
    { id: 'agbogbloshie', name: 'Agbogbloshie Market', description: 'Accra’s primary food depot for bulk yams, fresh tomatoes, and wholesale vegetables.', tag: 'Wholesale Depot', baseDeliveryFee: 40 }
];

const MARKET_CATALOG: CatalogItem[] = [
    { id: 'p1', name: 'Fresh Tomatoes (Paint Bucket)', estimatedPrice: 75.00, unit: 'bucket' },
    { id: 'p2', name: 'Scotch Bonnet Pepper / Rodo', estimatedPrice: 40.00, unit: 'olonka' },
    { id: 'p3', name: 'Bawku Onions', estimatedPrice: 35.00, unit: 'olonka' },
    { id: 'p4', name: 'Local White Rice', estimatedPrice: 32.00, unit: 'olonka' }
];

export default function CustomerDashboard() {
    const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
    const [step, setStep] = useState<1 | 2>(1);
    const [items, setItems] = useState<ShoppingItem[]>([]);

    // Toggle between standard catalog or custom open text input
    const [isCustomMode, setIsCustomMode] = useState(false);

    // Form Fields
    const [selectedCatalogItemId, setSelectedCatalogItemId] = useState(MARKET_CATALOG[0].id);
    const [customItemName, setCustomItemName] = useState('');
    const [customTargetPrice, setCustomTargetPrice] = useState('15');
    const [quantity, setQuantity] = useState(1);
    const [customUnit, setCustomUnit] = useState('wrap/packet');
    const [notes, setNotes] = useState('');

    const handleAddItem = (e: React.FormEvent) => {
        e.preventDefault();

        if (isCustomMode) {
            if (!customItemName.trim()) return;
            const targetPriceNum = parseFloat(customTargetPrice) || 0;

            const newItem: ShoppingItem = {
                id: crypto.randomUUID(),
                name: customItemName,
                targetPrice: targetPriceNum,
                quantity,
                unit: customUnit,
                notes: notes,
                isCustom: true
            };
            setItems([...items, newItem]);
            setCustomItemName('');
            setNotes('');
        } else {
            const catalogItem = MARKET_CATALOG.find(item => item.id === selectedCatalogItemId);
            if (!catalogItem) return;

            const newItem: ShoppingItem = {
                id: crypto.randomUUID(),
                name: catalogItem.name,
                targetPrice: catalogItem.estimatedPrice,
                quantity,
                unit: catalogItem.unit,
                notes: notes,
                isCustom: false
            };
            setItems([...items, newItem]);
            setNotes('');
        }
    };

    const handleRemoveItem = (id: string) => {
        setItems(items.filter(item => item.id !== id));
    };

    // Math calculation using your business strategy
    const itemsSubtotal = items.reduce((sum, item) => sum + (item.targetPrice * item.quantity), 0);

    // We add a higher protection buffer specifically for unlisted open market custom items
    const marketBuffer = items.reduce((sum, item) => {
        const itemCost = item.targetPrice * item.quantity;
        return sum + (item.isCustom ? itemCost * 0.33 : itemCost * 0.12);
    }, 0);

    const deliveryFee = selectedMarket ? selectedMarket.baseDeliveryFee : 0;
    const grandTotal = itemsSubtotal + marketBuffer + deliveryFee;

    return (
        <div className="space-y-8 max-w-5xl mx-auto transition-all duration-300">
            {step === 1 && (
                <div className="space-y-6">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Request a New Errand</h1>
                        <p className="text-slate-500 mt-2">Select the market where our shopper should buy your commodities.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {ACCRA_MARKETS.map((market) => (
                            <div
                                key={market.id}
                                onClick={() => setSelectedMarket(market)}
                                className={`p-6 bg-white border rounded-2xl shadow-xs hover:shadow-md transition cursor-pointer ${selectedMarket?.id === market.id ? 'ring-2 ring-emerald-600 border-transparent bg-emerald-50/10' : 'border-slate-200'
                                    }`}
                            >
                                <div className="flex justify-between items-start">
                                    <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-600">{market.tag}</span>
                                    <span className="text-sm font-bold text-emerald-600">₵{market.baseDeliveryFee} delivery</span>
                                </div>
                                <h3 className="font-bold text-xl text-slate-800 mt-3">{market.name}</h3>
                            </div>
                        ))}
                    </div>

                    {selectedMarket && (
                        <div className="flex justify-end pt-4 border-t border-slate-200">
                            <button className="bg-emerald-600 text-white font-semibold text-sm px-6 py-3 rounded-xl hover:bg-emerald-500 transition cursor-pointer" onClick={() => setStep(2)}>
                                Continue to Shopping List ({selectedMarket.name})
                            </button>
                        </div>
                    )}
                </div>
            )}

            {step === 2 && selectedMarket && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <button onClick={() => setStep(1)} className="text-xs font-medium text-emerald-600 hover:underline mb-2 block cursor-pointer">← Change Market</button>
                            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Create List for {selectedMarket.name}</h1>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Input Form Box */}
                        <div className="bg-white border border-slate-200 p-6 rounded-2xl h-fit space-y-5 shadow-xs">
                            <div className="flex bg-slate-100 p-1 rounded-xl">
                                <button
                                    type="button"
                                    className={`flex-1 text-xs py-2 rounded-lg font-medium transition cursor-pointer ${!isCustomMode ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'}`}
                                    onClick={() => setIsCustomMode(false)}
                                >
                                    Standard Catalog
                                </button>
                                <button
                                    type="button"
                                    className={`flex-1 text-xs py-2 rounded-lg font-medium transition cursor-pointer ${isCustomMode ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'}`}
                                    onClick={() => setIsCustomMode(true)}
                                >
                                    Custom Request (e.g. Locust Beans)
                                </button>
                            </div>

                            <form onSubmit={handleAddItem} className="space-y-4">
                                {!isCustomMode ? (
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1">Select Commodity</label>
                                        <select
                                            value={selectedCatalogItemId}
                                            onChange={(e) => setSelectedCatalogItemId(e.target.value)}
                                            className="w-full text-sm border p-2.5 rounded-xl bg-slate-50 focus:outline-emerald-600"
                                        >
                                            {MARKET_CATALOG.map((item) => (
                                                <option key={item.id} value={item.id}>{item.name} (~₵{item.estimatedPrice})</option>
                                            ))}
                                        </select>
                                    </div>
                                ) : (
                                    <>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-600 mb-1">Item Name</label>
                                            <input
                                                type="text"
                                                placeholder="e.g., Locust beans (Dawadawa), Smoked herrings"
                                                value={customItemName}
                                                onChange={(e) => setCustomItemName(e.target.value)}
                                                className="w-full text-sm border p-2.5 rounded-xl bg-slate-50 focus:outline-emerald-600"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-600 mb-1">Your Target Budget (₵)</label>
                                                <input
                                                    type="number"
                                                    placeholder="15"
                                                    value={customTargetPrice}
                                                    onChange={(e) => setCustomTargetPrice(e.target.value)}
                                                    className="w-full text-sm border p-2.5 rounded-xl bg-slate-50 focus:outline-emerald-600"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-600 mb-1">Metric/Unit</label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g. 2 wraps, cups"
                                                    value={customUnit}
                                                    onChange={(e) => setCustomUnit(e.target.value)}
                                                    className="w-full text-sm border p-2.5 rounded-xl bg-slate-50 focus:outline-emerald-600"
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}

                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">Quantity Needed</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={quantity}
                                        onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                                        className="w-full text-sm border p-2.5 rounded-xl bg-slate-50 focus:outline-emerald-600"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">Instructions for Rider</label>
                                    <textarea
                                        placeholder="e.g., If the ₵15 package is too small, check the ₵20 variant."
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        className="w-full text-sm border p-2.5 rounded-xl bg-slate-50 focus:outline-emerald-600 h-20 resize-none"
                                    />
                                </div>

                                <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm py-2.5 rounded-xl transition cursor-pointer">
                                    Add to Errand Bucket
                                </button>
                            </form>
                        </div>

                        {/* Receipt Summary Box */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col shadow-xs">
                                <div className="bg-slate-50 px-6 py-3 border-b font-semibold text-xs text-slate-500 uppercase tracking-wider">Current Errand Bucket</div>

                                {items.length === 0 ? (
                                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-12 text-center text-sm">Your items will appear here. Try adding custom locust beans to test!</div>
                                ) : (
                                    <div className="divide-y divide-slate-100 max-h-[300px] overflow-y-auto">
                                        {items.map((item) => (
                                            <div key={item.id} className="p-4 flex justify-between items-center hover:bg-slate-50/20">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-bold text-slate-800">{item.name}</h4>
                                                        {item.isCustom && <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-sm font-bold">Unlisted Request</span>}
                                                    </div>
                                                    <p className="text-xs text-slate-500 mt-0.5">{item.quantity} &times; {item.unit} @ target ₵{item.targetPrice.toFixed(2)}</p>
                                                    {item.notes && <p className="text-xs text-emerald-600 mt-1">📌 {item.notes}</p>}
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <span className="font-bold text-slate-900 text-sm">₵{(item.targetPrice * item.quantity).toFixed(2)}</span>
                                                    <button type="button" onClick={() => handleRemoveItem(item.id)} className="text-xs text-rose-500 hover:underline cursor-pointer">Remove</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {items.length > 0 && (
                                <div className="bg-slate-900 text-slate-100 p-6 rounded-2xl space-y-3 shadow-md">
                                    <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 border-b border-slate-800 pb-2">Pre-Authorization Summary</h4>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-400">Total Target Item Prices</span>
                                        <span>₵{itemsSubtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-400">Dynamic Variable Pricing Buffer</span>
                                        <span>₵{marketBuffer.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-400">Rider Delivery Fee</span>
                                        <span>₵{deliveryFee.toFixed(2)}</span>
                                    </div>
                                    <div className="border-t border-slate-800 my-2 pt-3 flex justify-between items-baseline">
                                        <span className="font-bold text-base">Total Mobile Money Escrow Hold</span>
                                        <span className="text-2xl font-black text-emerald-400">₵{grandTotal.toFixed(2)}</span>
                                    </div>

                                    {/* Notice describing your exact business rules */}
                                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-2 mt-4 leading-relaxed">
                                        <p className="font-bold text-amber-400">💡 Errand Open-Market Guarantee Policy:</p>
                                        <p>1. If your custom items cost less than your target estimate, the remaining balance is instantly returned to your account.</p>
                                        <p>2. If an item costs more or is unavailable, the rider will submit an instant app notification to approve the price change.</p>
                                        <p>3. <span className="underline">Important:</span> If you do not reply to the shopper's notification before they checkout at the stall, the item will be automatically removed from your run and a full refund for that specific item will be disbursed immediately.</p>
                                    </div>

                                    <div className="flex justify-end pt-4">
                                        <button onClick={() => alert('Launching Paystack checkout integration...')} className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm px-6 py-3 rounded-xl shadow-xs transition cursor-pointer">
                                            Authorize MoMo Escrow
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}