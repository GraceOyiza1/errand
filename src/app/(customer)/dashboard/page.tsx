"use client";

import React, { useState, useEffect } from "react";
import {
    ShieldAlert,
    User,
    Phone,
    CreditCard,
    Bike,
    Clock,
    CheckCircle,
    MapPin,
    ShoppingBag,
    Truck,
    Star
} from "lucide-react";

export default function ShopperDashboardPage() {
    // 1. SHOPPER PROFILE STATES
    // Simulated database profile status: 'unregistered', 'under_review', or 'verified'
    const [shopperStatus, setShopperStatus] = useState<"unregistered" | "under_review" | "verified">("unregistered");

    // Registration Form Input States
    const [fullName, setFullName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [idType, setIdType] = useState("Ghana Card");
    const [idNumber, setIdNumber] = useState("");
    const [vehicleType, setVehicleType] = useState("Motorcycle");

    // 2. ACTIVE ERRAND POOL STATES (Only visible to verified shoppers)
    const [activeErrand, setActiveErrand] = useState<any>(null);
    const [errandState, setErrandState] = useState<"pool" | "accepted" | "shopping" | "delivering" | "completed">("pool");
    const [shoppingTime, setShoppingTime] = useState("30");
    const [deliveryTime, setDeliveryTime] = useState("20");
    const [poolErrands, setPoolErrands] = useState<any[]>([]);
    const [historyErrands, setHistoryErrands] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Mock available order coming from a locked customer bucket
    const mockAvailableOrder = {
        id: "ERR-5592",
        marketName: "Makola Market",
        location: "Accra Central",
        payout: "85.00",
        items: [
            { name: "Yam", qty: 2, condition: "Must be very firm, no soft spots" },
            { name: "Pepper", qty: 1, condition: "Leave my pepper unplucked" },
            { name: "Smoked Fish ", qty: 2, condition: "Dry and tightly wrapped seperately" }
        ]
    };

    // Submit profile details handler
    const handleOnboardingSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!fullName || !phoneNumber || !idNumber) {
            alert("Please fill in all verification fields.");
            return;
        }
        // Set status to under review (conceptually updates database flag isVerified = false)
        setShopperStatus("under_review");
    };

    const simulateAdminApproval = () => {
        setShopperStatus("verified");
        if (!idNumber) setIdNumber("user_unique_id_123");
        if (!fullName) setFullName("Demo Shopper");
        setErrandState("pool");
    };

    // Errand State Management Actions
    const updateErrandAPI = async (status: string, extraUpdates: any = {}) => {
        if (!activeErrand) return;
        const errandId = activeErrand._id || activeErrand.id;
        try {
            await fetch('/api/errands', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: errandId,
                    status,
                    ...extraUpdates
                })
            });
        } catch (e) {
            console.error('Failed to update errand status via API:', e);
        }
    };

    const handleAcceptErrand = async (errand: any) => {
        setActiveErrand(errand);
        setErrandState("accepted");

        const errandId = errand._id || errand.id;
        try {
            await fetch('/api/errands', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: errandId,
                    status: "accepted",
                    riderId: idNumber || "user_unique_id_123",
                    riderName: fullName || "Demo Shopper",
                    riderMessage: "A shopper has accepted your request and is reviewing the details."
                })
            });
            // Re-fetch to update history/pool
            loadErrands();
        } catch (e) {
            console.error('Failed to update errand status via API:', e);
        }
    };

    const handleStartShopping = async () => {
        setErrandState("shopping");
        await updateErrandAPI("shopping", {
            estShoppingTime: shoppingTime,
            estDeliveryTime: deliveryTime,
            riderMessage: "Shopper is now at the market purchasing your items."
        });
    };

    const handleCompleteShoppingAndTransit = async () => {
        setErrandState("delivering");
        await updateErrandAPI("delivering", {
            riderMessage: "Shopper has completed purchasing and is en route for delivery."
        });
    };

    const handleConfirmDropoff = async () => {
        setErrandState("completed");
        await updateErrandAPI("completed", {
            riderMessage: "Delivery complete! Thank you for using Errand."
        });
    };

    const handleClearErrandRun = () => {
        setActiveErrand(null);
        setErrandState("pool");
    };

    const loadErrands = async () => {
        if (shopperStatus !== "verified") return;
        try {
            // Fetch 1: Look for open marketplace jobs
            const poolRes = await fetch('/api/errands?role=shopper');
            const poolResult = await poolRes.json();
            if (poolRes.ok && poolResult?.success) {
                setPoolErrands(Array.isArray(poolResult.data) ? poolResult.data : []);
            }

            // Fetch 2: Look for this shopper's history
            const historyUrl = `/api/errands?role=shopper&riderId=${idNumber || 'user_unique_id_123'}`;
            const historyRes = await fetch(historyUrl);
            const historyResult = await historyRes.json();
            if (historyRes.ok && historyResult?.success) {
                setHistoryErrands(Array.isArray(historyResult.data) ? historyResult.data : []);
            }
        } catch (error) {
            console.error("Failed to load errands:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadErrands();
        const intervalId = setInterval(() => {
            if (errandState === 'pool') {
                loadErrands();
            }
        }, 5000);
        return () => clearInterval(intervalId);
    }, [idNumber, errandState, shopperStatus]);

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 p-4 md:p-8">
            <div className="max-w-4xl mx-auto">

                {/* TOP MAIN HEADER */}
                <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5 mb-8">
                    <div>
                        <h1 className="text-2xl font-black tracking-tight text-slate-900"> Errand Shopper Hub</h1>
                        <p className="text-xs text-slate-500 mt-1">Fulfill market requests, manage operations, and track local daily runs</p>
                    </div>

                    {/* Status Badge */}
                    <div className="mt-3 sm:mt-0 self-start sm:self-center flex items-center space-x-2">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Your Profile:</span>
                        {shopperStatus === "unregistered" && (
                            <span className="text-xs font-black bg-red-100 text-red-700 px-3 py-1 rounded-full border border-red-200">❌ Unverified</span>
                        )}
                        {shopperStatus === "under_review" && (
                            <span className="text-xs font-black bg-amber-100 text-amber-700 px-3 py-1 rounded-full border border-amber-200 animate-pulse">⏳ Under Review</span>
                        )}
                        {shopperStatus === "verified" && (
                            <span className="text-xs font-black bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full border border-emerald-200"> Authorized Sourcing Agent</span>
                        )}
                    </div>
                </header>

                {/* =========================================================
            STATE 1: UNREGISTERED SHOPPER (THE KYC ONBOARDING FORM GATE)
           ========================================================= */}
                {shopperStatus === "unregistered" && (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
                        <div className="bg-gradient-to-r from-red-500 to-orange-500 p-5 text-white flex items-center space-x-3">
                            <ShieldAlert className="w-6 h-6 shrink-0" />
                            <div>
                                <h2 className="font-extrabold text-base">Verification Required</h2>
                                <p className="text-xs text-red-50 text-slate-100">To maintain safety and trust in open markets, complete verification to unlock live errands.</p>
                            </div>
                        </div>

                        <form onSubmit={handleOnboardingSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5 flex items-center space-x-1">
                                        <User className="w-3.5 h-3.5 text-slate-400" />
                                        <span>Full Legal Name</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        placeholder="e.g. Kofi Mensah"
                                        className="w-full text-sm border border-slate-200 rounded-xl p-3 focus:border-slate-900 focus:outline-none transition bg-slate-50"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5 flex items-center space-x-1">
                                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                                        <span>Mobile Money / Contact Phone</span>
                                    </label>
                                    <input
                                        type="tel"
                                        required
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        placeholder="e.g. +233 24 123 4567"
                                        className="w-full text-sm border border-slate-200 rounded-xl p-3 focus:border-slate-900 focus:outline-none transition bg-slate-50"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5 flex items-center space-x-1">
                                        <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                                        <span>Identification Document Type</span>
                                    </label>
                                    <select
                                        value={idType}
                                        onChange={(e) => setIdType(e.target.value)}
                                        className="w-full text-sm border border-slate-200 rounded-xl p-3 focus:border-slate-900 focus:outline-none transition bg-slate-50 h-[46px]"
                                    >
                                        <option value="Ghana Card">Ghana Card</option>
                                        <option value="Voters ID">Voters ID</option>
                                        <option value="Passport">National Passport</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5 flex items-center space-x-1">
                                        <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                                        <span>Unique ID Card Number</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={idNumber}
                                        onChange={(e) => setIdNumber(e.target.value)}
                                        placeholder="e.g. GHA-72910839-4"
                                        className="w-full text-sm border border-slate-200 rounded-xl p-3 focus:border-slate-900 focus:outline-none transition bg-slate-50"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5 flex items-center space-x-1">
                                        <Bike className="w-3.5 h-3.5 text-slate-400" />
                                        <span>Logistics / Transport Mode</span>
                                    </label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {["Motorcycle", "Bicycle", "On Foot / Walking"].map((mode) => (
                                            <button
                                                key={mode}
                                                type="button"
                                                onClick={() => setVehicleType(mode)}
                                                className={`p-3 rounded-xl border text-xs font-bold transition text-center ${vehicleType === mode
                                                    ? "border-slate-900 bg-slate-900 text-white shadow-md"
                                                    : "border-slate-200 bg-white hover:border-slate-400"
                                                    }`}
                                            >
                                                {mode}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-100">
                                <button
                                    type="submit"
                                    className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold uppercase tracking-wider py-4 rounded-xl transition shadow-lg"
                                >
                                    Submit Verification Documents
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* =========================================================
            STATE 2: UNDER REVIEW STATUS (BLOCKED FROM DISPATCH POOL)
           ========================================================= */}
                {shopperStatus === "under_review" && (
                    <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-lg space-y-4">
                        <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto border border-amber-200">
                            <Clock className="w-8 h-8 animate-spin" />
                        </div>
                        <div>
                            <h2 className="text-xl font-extrabold text-slate-900">Your Documents are Under Admin Review</h2>
                            <p className="text-sm text-slate-500 max-w-md mx-auto mt-2 leading-relaxed">
                                Thank you for uploading your identification profile details, <strong>{fullName}</strong>.
                                Our backend review team is currently cross-referencing your profile credentials.
                                We will lift this gate immediately upon activation.
                            </p>
                        </div>

                        <div className="pt-6 border-t border-slate-100 max-w-xs mx-auto">
                            <button
                                onClick={simulateAdminApproval}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 rounded-xl transition"
                            >
                                Simulate Admin Approval (Demo Bypass)
                            </button>
                        </div>
                    </div>
                )}

                {/* =========================================================
            STATE 3: VERIFIED SHOPPER (THE EXCLUSIVE LIVE DISPATCH DASHBOARD)
           ========================================================= */}
                {shopperStatus === "verified" && (
                    <div className="space-y-6">
                        {loading ? (
                            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                                <div className="animate-pulse space-y-4">
                                    <div className="h-4 rounded-full bg-slate-200 w-3/5" />
                                    <div className="h-4 rounded-full bg-slate-200 w-2/5" />
                                    <div className="grid gap-4 md:grid-cols-3">
                                        <div className="h-32 rounded-2xl bg-slate-200" />
                                        <div className="h-32 rounded-2xl bg-slate-200" />
                                        <div className="h-32 rounded-2xl bg-slate-200" />
                                    </div>
                                </div>
                            </div>
                        ) : null}

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                            {/* Left Column: Live Jobs & Pipeline Tasks */}
                            <div className="md:col-span-2 space-y-6">

                                {/* Pool Status Tracker */}
                                {errandState === "pool" && poolErrands.map((errand: any) => (
                                    <div key={errand._id || errand.id} className="bg-white border-2 border-slate-900 rounded-2xl p-5 shadow-lg relative overflow-hidden mb-6">
                                        <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-bl-xl animate-pulse">
                                            New Errand Match
                                        </div>

                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <div className="flex items-center space-x-2 text-slate-500 text-xs font-bold">
                                                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                                                    <span>{errand.marketName} • {errand.location || 'Local Market'}</span>
                                                </div>
                                                <h3 className="text-base font-extrabold text-slate-900 mt-1">Bulk Household Restock Run</h3>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-[10px] text-slate-400 uppercase font-bold block">Guaranteed Payout</span>
                                                <span className="text-lg font-black text-slate-950">₵{errand.payout}</span>
                                            </div>
                                        </div>

                                        {/* Scrapebook Items Preview */}
                                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 mb-5">
                                            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block mb-2">Inspect & Purchase Checklist:</span>
                                            <ul className="space-y-2.5">
                                                {errand.items && errand.items.map((item: any, idx: number) => (
                                                    <li key={idx} className="text-xs flex justify-between items-start border-b border-slate-200/50 pb-1.5 last:border-0 last:pb-0">
                                                        <div>
                                                            <span className="font-extrabold text-slate-900">{item.quantity || item.qty}x {item.name}</span>
                                                            {item.condition && <span className="block text-[11px] text-slate-500 italic mt-0.5">⚠️ Condition: {item.condition}</span>}
                                                            {item.notes && <span className="block text-[11px] text-slate-500 italic mt-0.5">⚠️ Notes: {item.notes}</span>}
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <button
                                            onClick={() => handleAcceptErrand(errand)}
                                            className="w-full bg-slate-900 hover:bg-emerald-600 text-white font-extrabold text-xs uppercase tracking-wider py-4 rounded-xl transition"
                                        >
                                            Accept Errand & Update Customer
                                        </button>
                                    </div>
                                ))}

                                {/* ACTIVE ORDER WORKING PIPELINE LAYOUT */}
                                {["accepted", "shopping", "delivering", "completed"].includes(errandState) && activeErrand && (
                                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-md space-y-6">

                                        {/* Status Indicator */}
                                        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                                            <div>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">Active Run Reference ID</span>
                                                <h3 className="font-black text-base text-slate-900">{activeErrand.id}</h3>
                                            </div>
                                            <span className="text-xs font-bold bg-slate-100 text-slate-800 px-3 py-1 rounded-lg uppercase">
                                                Status: <strong className="text-emerald-700">{errandState}</strong>
                                            </span>
                                        </div>

                                        {/* STEP A: MANUAL TIME ADJUSTMENTS (MANUAL CUSTOMER COOLDOWN TIMERS) */}
                                        {errandState === "accepted" && (
                                            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 space-y-4">
                                                <div>
                                                    <h4 className="font-extrabold text-xs text-orange-950 uppercase tracking-wider flex items-center space-x-1">
                                                        <Clock className="w-4 h-4 text-orange-600" />
                                                        <span>Set Manual Errand Countdown Estimates</span>
                                                    </h4>
                                                    <p className="text-[11px] text-orange-700 mt-1">
                                                        Estimate your timeline accurately for the customer's live dashboard tracking panel before entering the market grounds.
                                                    </p>
                                                </div>

                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Market Shopping (Mins)</label>
                                                        <input
                                                            type="number"
                                                            value={shoppingTime}
                                                            onChange={(e) => setShoppingTime(e.target.value)}
                                                            className="w-full bg-white text-xs p-2.5 rounded-lg border border-slate-200 font-bold focus:outline-none"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Bike Delivery Transit (Mins)</label>
                                                        <input
                                                            type="number"
                                                            value={deliveryTime}
                                                            onChange={(e) => setDeliveryTime(e.target.value)}
                                                            className="w-full bg-white text-xs p-2.5 rounded-lg border border-slate-200 font-bold focus:outline-none"
                                                        />
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={handleStartShopping}
                                                    className="w-full bg-orange-600 hover:bg-orange-700 text-white font-extrabold py-3 rounded-lg text-xs transition"
                                                >
                                                    Dispatch Estimates & Start Sourcing
                                                </button>
                                            </div>
                                        )}

                                        {/* STEP B: MARKET WORKPLACE VETTING CHECKS & SINGLE PHOTO PROOF */}
                                        {errandState === "shopping" && (
                                            <div className="space-y-4">
                                                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                                                    <h4 className="font-extrabold text-xs text-amber-900 uppercase tracking-wider flex items-center space-x-1">
                                                        <ShoppingBag className="w-4 h-4 text-amber-600" />
                                                        <span>Sourcing Quality </span>
                                                    </h4>
                                                    <p className="text-[11px] text-amber-700 mt-0.5">Cross-check conditions with market women to protect order values.</p>

                                                    <div className="space-y-2 mt-3">
                                                        {activeErrand.items.map((item: any, idx: number) => (
                                                            <div key={idx} className="bg-white p-3 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                                                                <div>
                                                                    <span className="font-extrabold text-slate-900">{item.qty}x {item.name}</span>
                                                                    <span className="block text-[10px] text-slate-400 italic">Check: {item.condition}</span>
                                                                </div>
                                                                <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full">Approved Vetted</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Single Flat-Lay photo rule container simulation */}
                                                <div className="p-4 border border-slate-200 rounded-xl bg-slate-50 text-center space-y-3">
                                                    <span className="text-2xl block">📸</span>
                                                    <h5 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Capture Final Group Basket Photo</h5>
                                                    <p className="text-[11px] text-slate-500 max-w-sm mx-auto leading-normal">
                                                        Lay out all items together in your delivery crate to save time and avoid hassle before loading your bike.
                                                    </p>
                                                    <button
                                                        onClick={handleCompleteShoppingAndTransit}
                                                        className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2.5 rounded-lg transition"
                                                    >
                                                        Upload order Photo & Dispatch Rider
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {/* STEP C: DISPATCH & DELIVERY MAP HANDOVER OVERVIEW */}
                                        {errandState === "delivering" && (
                                            <div className="bg-blue-50 border border-blue-200 p-5 rounded-xl text-center space-y-3">
                                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto text-blue-600">
                                                    <Truck className="w-5 h-5 animate-pulse" />
                                                </div>
                                                <div>
                                                    <h4 className="font-extrabold text-sm text-blue-950">Errand Package En Route To Client</h4>
                                                    <p className="text-xs text-blue-700 mt-0.5">Estimated transit delivery timeline duration remaining: {deliveryTime} minutes.</p>
                                                </div>
                                                <button
                                                    onClick={handleConfirmDropoff}
                                                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3 rounded-lg text-xs transition shadow-md"
                                                >
                                                    ✅ Confirm Drop-off Complete
                                                </button>
                                            </div>
                                        )}

                                        {/* STEP D: COMPLETED SUMMARY OVERVIEW */}
                                        {errandState === "completed" && (
                                            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-2">
                                                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center mx-auto text-emerald-600">
                                                    <CheckCircle className="w-4 h-4" />
                                                </div>
                                                <h4 className="font-extrabold text-xs text-emerald-950 uppercase tracking-wider">Run Completed Successfully!</h4>
                                                <p className="text-[11px] text-emerald-700">Earnings have been credited. The client was notified for rating reviews.</p>
                                                <button
                                                    onClick={handleClearErrandRun}
                                                    className="text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg px-3 py-1.5 mt-2 hover:bg-slate-50"
                                                >
                                                    Confirmed
                                                </button>
                                            </div>
                                        )}

                                    </div>
                                )}

                                {errandState === "pool" && poolErrands.length === 0 && (
                                    <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400 text-xs font-medium">
                                        📭 No active local market requests currently listed in your location.
                                    </div>
                                )}

                            </div>

                            {/* Right Column: Rides Log Ledger & Wallet Earnings History */}
                            <div className="space-y-6">

                                {/* Profile Bio summary panel */}
                                <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center space-x-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-base border border-slate-200">👨‍✈️</div>
                                    <div>
                                        <h4 className="font-extrabold text-xs text-slate-900">{fullName || "Kofi Mensah"}</h4>
                                        <p className="text-[10px] text-slate-400 mt-0.5">{vehicleType} Logistics Mode</p>
                                        <div className="flex items-center space-x-1 mt-0.5">
                                            <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                                            <span className="text-[9px] font-bold text-slate-600">4.9 Rating Balance</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Live Wallet Summary Ledger Panel */}
                                <div className="bg-slate-900 rounded-2xl p-5 text-white shadow-md">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Mobile Money Earnings</span>
                                    <span className="text-3xl font-black block tracking-tight mt-1">₵{errandState === "completed" ? "110.00" : "85.00"}</span>

                                    <div className="border-t border-slate-800 mt-3 pt-3 flex justify-between text-xs text-slate-400 font-medium">
                                        <span>Total Rides Logged:</span>
                                        <span className="font-bold text-white">{errandState === "completed" ? "4 runs" : "3 runs"}</span>
                                    </div>
                                </div>

                                {/* Rides History Records Ledger */}
                                <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
                                    <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block">Your Past Runs</span>

                                    <div className="space-y-2">
                                        {historyErrands.length > 0 ? historyErrands.map((history: any) => (
                                            <div key={history._id || history.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs flex justify-between items-start">
                                                <div>
                                                    <strong className="text-slate-900 block">{history.customerId || "Customer"}</strong>
                                                    <span className="text-[10px] text-slate-400 block mt-0.5">{history.marketName} - <span className="uppercase text-emerald-700">{history.status}</span></span>
                                                </div>
                                                <span className="font-extrabold text-emerald-600">₵{history.payout}</span>
                                            </div>
                                        )) : (
                                            <div className="text-xs text-slate-500 text-center py-2">No past runs yet.</div>
                                        )}
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}