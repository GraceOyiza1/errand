"use client";

import React, { useState, useEffect } from "react";
import ImageUploader from "@/components/ImageUploader";
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
    Star,
    Lock
} from "lucide-react";

export default function ShopperDashboardPage() {
    // 1. SHOPPER PROFILE STATES
    // 'unregistered' (onboarding), 'under_review', 'login' (returning shopper), 'verified' (access to pool)
    const [shopperStatus, setShopperStatus] = useState<"unregistered" | "under_review" | "login" | "verified">("unregistered");
    const [isClient, setIsClient] = useState(false);

    // Registration Form Input States
    const [fullName, setFullName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [idType, setIdType] = useState("ID Card");
    const [idNumber, setIdNumber] = useState("");
    const [vehicleType, setVehicleType] = useState("Motorcycle");

    // Login Form Input States
    const [loginName, setLoginName] = useState("");
    const [loginCode, setLoginCode] = useState("");
    const [loginError, setLoginError] = useState("");

    // 2. ACTIVE ERRAND POOL STATES
    const [activeErrand, setActiveErrand] = useState<any>(null);
    const [errandState, setErrandState] = useState<"pool" | "accepted" | "shopping" | "delivering" | "completed">("pool");
    const [shoppingTime, setShoppingTime] = useState("30");
    const [deliveryTime, setDeliveryTime] = useState("20");
    const [poolErrands, setPoolErrands] = useState<any[]>([]);
    const [historyErrands, setHistoryErrands] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [customUpdateMessage, setCustomUpdateMessage] = useState("");
    const [basketPhoto, setBasketPhoto] = useState<string[]>([]);

    useEffect(() => {
        setIsClient(true);
        const isRegistered = localStorage.getItem("errand-shopper-registered");
        const savedName = localStorage.getItem("errand-shopper-name");

        if (isRegistered === "true") {
            setShopperStatus("login");
            if (savedName) setLoginName(savedName);
        }
    }, []);

    // Submit profile details handler (New Shopper)
    const handleOnboardingSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!fullName || !phoneNumber) {
            alert("Please fill in all verification fields.");
            return;
        }

        localStorage.setItem("errand-shopper-registered", "true");
        localStorage.setItem("errand-shopper-name", fullName);

        setShopperStatus("under_review");
    };

    // Login handler (Registered Shopper)
    const handleLoginSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoginError("");

        if (loginCode !== "123") {
            setLoginError("Invalid login code. Hint: Use 123");
            return;
        }
        if (!loginName.trim()) {
            setLoginError("Please enter your registered name.");
            return;
        }

        // Update active session name
        setFullName(loginName);
        setIdNumber("user_unique_id_" + Math.floor(Math.random() * 1000));
        setShopperStatus("verified");
    };

    const simulateAdminApproval = () => {
        setShopperStatus("verified");
        if (!idNumber) setIdNumber("user_unique_id_123");
        if (!fullName) setFullName(localStorage.getItem("errand-shopper-name") || "Demo Shopper");
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
        if (basketPhoto.length === 0) {
            alert("Please capture a photo of your basket before dispatching!");
            return;
        }
        setErrandState("delivering");
        await updateErrandAPI("delivering", {
            basketImageUrl: basketPhoto[0],
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

    const handleCancelErrand = async () => {
        if (!activeErrand) return;
        const errandId = activeErrand._id || activeErrand.id;
        try {
            await fetch('/api/errands', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: errandId,
                    status: "paid_editable",
                    riderId: null,
                    riderName: null,
                    riderMessage: "Shopper cancelled the request and returned it to the pool."
                })
            });
            setActiveErrand(null);
            setErrandState("pool");
            loadErrands();
        } catch (e) {
            console.error('Failed to cancel errand:', e);
        }
    };

    const handleSendCustomUpdate = async () => {
        if (!activeErrand || !customUpdateMessage.trim()) return;
        await updateErrandAPI(errandState, {
            riderMessage: customUpdateMessage
        });
        setCustomUpdateMessage("");
        alert("Customer notified!");
    };

    const loadErrands = async () => {
        if (shopperStatus !== "verified") return;
        try {
            const poolRes = await fetch('/api/errands?role=shopper');
            const poolResult = await poolRes.json();
            if (poolRes.ok && poolResult?.success) {
                setPoolErrands(Array.isArray(poolResult.data) ? poolResult.data : []);
            }

            const historyUrl = `/api/errands?role=shopper&riderId=${idNumber || 'user_unique_id_123'}`;
            const historyRes = await fetch(historyUrl);
            const historyResult = await historyRes.json();
            if (historyRes.ok && historyResult?.success) {
                const historyData = Array.isArray(historyResult.data) ? historyResult.data : [];
                setHistoryErrands(historyData);

                // Auto-restore active errand if shopper refreshed the page
                setErrandState(currentErrandState => {
                    if (currentErrandState === "pool") {
                        const active = historyData.find((e: any) => ['accepted', 'shopping', 'delivering'].includes(e.status));
                        if (active) {
                            setActiveErrand(active);
                            return active.status as any;
                        }
                    }
                    return currentErrandState;
                });
            }
        } catch (error) {
            console.error("Failed to load errands:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (shopperStatus === "verified") {
            loadErrands();
            const intervalId = setInterval(() => {
                if (errandState === 'pool') {
                    loadErrands();
                }
            }, 5000);
            return () => clearInterval(intervalId);
        }
    }, [idNumber, errandState, shopperStatus]);

    if (!isClient) return null; // Avoid hydration mismatch

    return (
        <div className="min-h-screen bg-errand-alabaster text-slate-800 p-4 md:p-8">
            <div className="max-w-4xl mx-auto">

                {/* TOP MAIN HEADER */}
                <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5 mb-8">
                    <div>
                        <h1 className="text-2xl font-black tracking-tight text-errand-obsidian"> Errand Shopper Hub</h1>
                        <p className="text-xs text-slate-500 mt-1">Fulfill market requests, manage operations, and track local daily runs</p>
                    </div>

                    {/* Status Badge */}
                    <div className="mt-3 sm:mt-0 self-start sm:self-center flex items-center space-x-2">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Your Profile:</span>
                        {shopperStatus === "unregistered" && (
                            <span className="text-xs font-black bg-purple-100 text-purple-700 px-3 py-1 rounded-full border border-purple-200"> Unverified</span>
                        )}
                        {shopperStatus === "login" && (
                            <span className="text-xs font-black bg-blue-100 text-errand-clay px-3 py-1 rounded-full border border-blue-200"> Login Required</span>
                        )}
                        {shopperStatus === "under_review" && (
                            <span className="text-xs font-black bg-purple-400 text-white px-3 py-1 rounded-full border border-purple-400 animate-pulse">⏳ Under Review</span>
                        )}
                        {shopperStatus === "verified" && (
                            <span className="text-xs font-black bg-errand-leaf text-white px-3 py-1 rounded-full border border-errand-leaf">✅ Authorized Sourcing Agent</span>
                        )}
                    </div>
                </header>

                {/* =========================================================
            STATE 1.5: LOGIN (FOR REGISTERED SHOPPERS)
           ========================================================= */}
                {shopperStatus === "login" && (
                    <div className="bg-errand-alabaster rounded-2xl border border-slate-200 shadow-xl overflow-hidden max-w-md mx-auto mt-10">
                        <div className="bg-slate-900 p-5 text-white flex items-center justify-center space-x-3">
                            <Lock className="w-6 h-6 shrink-0 text-errand-leaf" />
                            <div>
                                <h2 className="font-extrabold text-base">Shopper Login</h2>
                            </div>
                        </div>

                        <form onSubmit={handleLoginSubmit} className="p-6 space-y-4">
                            {loginError && (
                                <div className="bg-red-50 text-errand-clay p-3 rounded-lg text-xs font-bold border border-red-200">
                                    {loginError}
                                </div>
                            )}
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">
                                    Registered Name
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={loginName}
                                    onChange={(e) => setLoginName(e.target.value)}
                                    placeholder="Enter your name"
                                    className="w-full text-sm border border-slate-200 rounded-xl p-3 focus:border-errand-leaf focus:outline-none transition bg-errand-alabaster"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">
                                    Access Code
                                </label>
                                <input
                                    type="password"
                                    required
                                    value={loginCode}
                                    onChange={(e) => setLoginCode(e.target.value)}
                                    placeholder="Enter login code"
                                    className="w-full text-sm border border-slate-200 rounded-xl p-3 focus:border-errand-leaf focus:outline-none transition bg-errand-alabaster"
                                />
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    className="w-full bg-errand-leaf hover:bg-errand-leaf text-white text-xs font-extrabold uppercase tracking-wider py-4 rounded-xl transition shadow-lg flex items-center justify-center space-x-2"
                                >
                                    <span>Access Dashboard</span>
                                </button>
                            </div>
                        </form>

                        <div className="bg-errand-alabaster p-4 border-t border-slate-100 text-center">
                            <button
                                type="button"
                                onClick={() => setShopperStatus("unregistered")}
                                className="text-xs text-slate-500 hover:text-errand-obsidian font-bold underline"
                            >
                                Not registered yet? Create a profile
                            </button>
                        </div>
                    </div>
                )}

                {/* =========================================================
            STATE 1: UNREGISTERED SHOPPER (THE KYC ONBOARDING FORM GATE)
           ========================================================= */}
                {shopperStatus === "unregistered" && (
                    <div className="bg-errand-alabaster rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
                        <div className="bg-gradient-to-r from-purple-100 to-purple-200 p-5 text-purple-900 flex items-center space-x-3">
                            <ShieldAlert className="w-6 h-6 shrink-0 text-purple-700" />
                            <div>
                                <h2 className="font-extrabold text-base text-purple-900">Verification Required</h2>
                                <p className="text-xs text-purple-800">To maintain safety and trust, complete verification to unlock live errands.</p>
                            </div>
                        </div>

                        <form onSubmit={handleOnboardingSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5 flex items-center space-x-1">
                                        <User className="w-3.5 h-3.5 text-slate-400" />
                                        <span>Full Name</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        placeholder="e.g. Kofi Mensah"
                                        className="w-full text-sm border border-slate-200 rounded-xl p-3 focus:border-slate-900 focus:outline-none transition bg-errand-alabaster"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5 flex items-center space-x-1">
                                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                                        <span>Contact</span>
                                    </label>
                                    <input
                                        type="tel"
                                        required
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        placeholder="e.g. +233 24 123 4567"
                                        className="w-full text-sm border border-slate-200 rounded-xl p-3 focus:border-slate-900 focus:outline-none transition bg-errand-alabaster"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5 flex items-center space-x-1">
                                        <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                                        <span>Identification Type</span>
                                    </label>
                                    <select
                                        value={idType}
                                        onChange={(e) => setIdType(e.target.value)}
                                        className="w-full text-sm border border-slate-200 rounded-xl p-3 focus:border-slate-900 focus:outline-none transition bg-errand-alabaster h-[46px]"
                                    >
                                        <option value="Ghana Card">ID Card</option>
                                        <option value="Voters ID">Voters ID</option>
                                        <option value="Passport">Passport</option>
                                    </select>
                                </div>

                                {/* Removed Unique ID Number field for test mode */}

                                <div className="md:col-span-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5 flex items-center space-x-1">
                                        <Bike className="w-3.5 h-3.5 text-slate-400" />
                                        <span>Logistics / Transport Mode</span>
                                    </label>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                        {["Motorcycle", "Bicycle", "On Foot / Walking"].map((mode) => (
                                            <button
                                                key={mode}
                                                type="button"
                                                onClick={() => setVehicleType(mode)}
                                                className={`p-3 rounded-xl border text-xs font-bold transition text-center ${vehicleType === mode
                                                    ? "border-slate-900 bg-slate-900 text-white shadow-md"
                                                    : "border-slate-200 bg-errand-alabaster hover:border-slate-400"
                                                    }`}
                                            >
                                                {mode}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-4">
                                <button
                                    type="submit"
                                    className="flex-1 w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold uppercase tracking-wider py-4 rounded-xl transition shadow-lg"
                                >
                                    Submit
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShopperStatus("login")}
                                    className="flex-1 w-full bg-slate-200 border-2 border-slate-300 hover:bg-slate-300 hover:border-slate-400 text-slate-800 text-xs font-extrabold uppercase tracking-wider py-4 rounded-xl transition shadow-sm"
                                >
                                    Login Instead
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* =========================================================
            STATE 2: UNDER REVIEW STATUS (BLOCKED FROM DISPATCH POOL)
           ========================================================= */}
                {shopperStatus === "under_review" && (
                    <div className="bg-errand-alabaster rounded-2xl border border-slate-200 p-8 text-center shadow-lg space-y-4">
                        <div className="w-16 h-16 bg-purple-400 text-white rounded-full flex items-center justify-center mx-auto border border-purple-400">
                            <Clock className="w-8 h-8 animate-spin" />
                        </div>
                        <div>
                            <h2 className="text-xl font-extrabold text-errand-obsidian">Your Documents are Under Admin Review</h2>
                            <p className="text-sm text-slate-500 max-w-md mx-auto mt-2 leading-relaxed">
                                Thank you for uploading your identification profile details, <strong>{fullName}</strong>.
                                Our review team is currently cross-referencing your profile credentials.
                                We will lift this gate immediately upon activation.
                            </p>
                        </div>

                        <div className="pt-6 border-t border-slate-100 max-w-xs mx-auto">
                            <button
                                onClick={simulateAdminApproval}
                                className="w-full bg-errand-leaf hover:bg-errand-leaf text-white text-xs font-bold py-2.5 rounded-xl transition"
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
                            <div className="bg-errand-alabaster rounded-2xl border border-slate-200 p-6 shadow-sm">
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
                                    <div key={errand._id || errand.id} className="bg-errand-alabaster border-2 border-slate-900 rounded-2xl p-5 shadow-lg relative overflow-hidden mb-6">
                                        <div className="absolute top-0 right-0 bg-errand-clay text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-bl-xl animate-pulse">
                                            New Errand Match
                                        </div>

                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <div className="flex items-center space-x-2 text-slate-500 text-xs font-bold">
                                                    <MapPin className="w-3.5 h-3.5 text-errand-leaf" />
                                                    <span>{errand.marketName} • {errand.location || 'Local Market'}</span>
                                                </div>
                                                <h3 className="text-base font-extrabold text-errand-obsidian mt-1">Errand Household Restock Run</h3>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-[10px] text-slate-400 uppercase font-bold block">Guaranteed Payout</span>
                                                <span className="text-lg font-black text-errand-obsidian">₵{errand.payout}</span>
                                            </div>
                                        </div>

                                        {/* Scrapebook Items Preview */}
                                        <div className="bg-errand-alabaster rounded-xl p-4 border border-slate-100 mb-5">
                                            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block mb-2">Inspect & Purchase Checklist:</span>
                                            <ul className="space-y-2.5">
                                                {errand.items && errand.items.map((item: any, idx: number) => (
                                                    <li key={idx} className="text-xs flex justify-between items-start border-b border-slate-200/50 pb-1.5 last:border-0 last:pb-0">
                                                        <div>
                                                            <span className="font-extrabold text-errand-obsidian">{item.quantity || item.qty}x {item.name}</span>
                                                            {item.condition && <span className="block text-[11px] text-slate-500 italic mt-0.5">⚠️ Condition: {item.condition}</span>}
                                                            {item.notes && <span className="block text-[11px] text-slate-500 italic mt-0.5">⚠️ Notes: {item.notes}</span>}
                                                            {item.imageUrls && item.imageUrls.length > 0 && (
                                                                <div className="flex gap-2 mt-2">
                                                                    {item.imageUrls.map((url: string, i: number) => (
                                                                        <img key={i} src={url} alt={`Ref ${i}`} className="w-12 h-12 object-cover rounded-lg border border-slate-200 shadow-sm" />
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <button
                                            onClick={() => handleAcceptErrand(errand)}
                                            className="w-full bg-slate-900 hover:bg-errand-leaf text-white font-extrabold text-xs uppercase tracking-wider py-4 rounded-xl transition"
                                        >
                                            Accept Errand & Update Customer
                                        </button>
                                    </div>
                                ))}

                                {/* ACTIVE ORDER WORKING PIPELINE LAYOUT */}
                                {["accepted", "shopping", "delivering", "completed"].includes(errandState) && activeErrand && (
                                    <div className="bg-errand-alabaster rounded-2xl border border-slate-200 p-6 shadow-md space-y-6">

                                        {/* Status Indicator */}
                                        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                                            <div>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">Active Run Reference ID</span>
                                                <h3 className="font-black text-base text-errand-obsidian">{activeErrand.id}</h3>
                                            </div>
                                            <span className="text-xs font-bold bg-slate-100 text-slate-800 px-3 py-1 rounded-lg uppercase">
                                                Status: <strong className="text-errand-leaf">{errandState}</strong>
                                            </span>
                                        </div>

                                        {/* STEP A: MANUAL TIME ADJUSTMENTS */}
                                        {errandState === "accepted" && (
                                            <div className="bg-purple-400 border border-purple-400 rounded-xl p-4 space-y-4">
                                                <div>
                                                    <h4 className="font-extrabold text-xs text-white uppercase tracking-wider flex items-center space-x-1">
                                                        <Clock className="w-4 h-4 text-white" />
                                                        <span>Set Manual Errand Countdown Estimates</span>
                                                    </h4>
                                                    <p className="text-[11px] text-white mt-1">
                                                        Estimate your timeline accurately for the customer before entering the market grounds.
                                                    </p>
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="text-[10px] font-bold text-white uppercase tracking-wider block mb-1">Market Shopping (Mins)</label>
                                                        <input
                                                            type="number"
                                                            value={shoppingTime}
                                                            onChange={(e) => setShoppingTime(e.target.value)}
                                                            className="w-full bg-white text-purple-900 text-xs p-2.5 rounded-lg border border-purple-300 font-bold focus:outline-none"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] font-bold text-white uppercase tracking-wider block mb-1">Bike Delivery Transit (Mins)</label>
                                                        <input
                                                            type="number"
                                                            value={deliveryTime}
                                                            onChange={(e) => setDeliveryTime(e.target.value)}
                                                            className="w-full bg-white text-purple-900 text-xs p-2.5 rounded-lg border border-purple-300 font-bold focus:outline-none"
                                                        />
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={handleStartShopping}
                                                    className="w-full bg-purple-400 hover:bg-purple-500 text-white font-extrabold py-3 rounded-lg text-xs transition"
                                                >
                                                    Start Sourcing
                                                </button>
                                            </div>
                                        )}

                                        {/* STEP B: MARKET WORKPLACE VETTING CHECKS */}
                                        {errandState === "shopping" && (
                                            <div className="space-y-4">
                                                <div className="p-4 bg-purple-400 rounded-xl border border-purple-400">
                                                    <h4 className="font-extrabold text-xs text-white uppercase tracking-wider flex items-center space-x-1">
                                                        <ShoppingBag className="w-4 h-4 text-white" />
                                                        <span>Sourcing Quality Inspection</span>
                                                    </h4>
                                                    <p className="text-[11px] text-white mt-0.5">Cross-check conditions with seller to protect order value.</p>

                                                    <div className="space-y-2 mt-3">
                                                        {activeErrand.items.map((item: any, idx: number) => (
                                                            <div key={idx} className="bg-errand-alabaster p-3 rounded-xl border border-slate-100 flex flex-col gap-2 text-xs">
                                                                <div className="flex items-center justify-between">
                                                                    <div>
                                                                        <span className="font-extrabold text-errand-obsidian">{item.qty || item.quantity}x {item.name}</span>
                                                                        <span className="block text-[10px] text-slate-400 italic">Check: {item.condition || "As requested"}</span>
                                                                    </div>
                                                                    <span className="text-[10px] bg-errand-leaf text-white font-bold px-2 py-0.5 rounded-full shrink-0">Approved</span>
                                                                </div>
                                                                {item.imageUrls && item.imageUrls.length > 0 && (
                                                                    <div className="flex gap-2">
                                                                        {item.imageUrls.map((url: string, i: number) => (
                                                                            <img key={i} src={url} alt={`Ref ${i}`} className="w-12 h-12 object-cover rounded-lg border border-slate-200 shadow-sm" />
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="p-4 border border-slate-200 rounded-xl bg-errand-alabaster text-center space-y-3">
                                                    <span className="text-2xl block">📸</span>
                                                    <h5 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Capture your Basket and send photo</h5>
                                                    
                                                    <div className="text-left bg-white p-3 rounded-lg border border-slate-200">
                                                        <ImageUploader 
                                                            images={basketPhoto} 
                                                            onChange={(imgs) => setBasketPhoto(imgs)} 
                                                            maxImages={1} 
                                                            label="Basket Photo"
                                                        />
                                                    </div>

                                                    <button
                                                        onClick={handleCompleteShoppingAndTransit}
                                                        className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-3 rounded-lg transition"
                                                    >
                                                        Upload Photo & Dispatch Rider
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {/* STEP C: DISPATCH & DELIVERY */}
                                        {errandState === "delivering" && (
                                            <div className="bg-blue-50 border border-blue-200 p-5 rounded-xl text-center space-y-3">
                                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto text-errand-clay">
                                                    <Truck className="w-5 h-5 animate-pulse" />
                                                </div>
                                                <div>
                                                    <h4 className="font-extrabold text-sm text-blue-950">Errand Package En Route To Client</h4>
                                                    <p className="text-xs text-errand-clay mt-0.5">Estimated transit delivery timeline duration remaining: {deliveryTime} minutes.</p>
                                                </div>
                                                <button
                                                    onClick={handleConfirmDropoff}
                                                    className="w-full bg-errand-leaf hover:bg-errand-leaf text-white font-extrabold py-3 rounded-lg text-xs transition shadow-md"
                                                >
                                                    ✅ Confirm Drop-off Complete
                                                </button>
                                            </div>
                                        )}

                                        {/* STEP D: COMPLETED */}
                                        {errandState === "completed" && (
                                            <div className="p-4 bg-errand-leaf border border-errand-leaf rounded-xl text-center space-y-2">
                                                <div className="w-8 h-8 rounded-full bg-errand-leaf flex items-center justify-center mx-auto text-white">
                                                    <CheckCircle className="w-4 h-4" />
                                                </div>
                                                <h4 className="font-extrabold text-xs text-white uppercase tracking-wider">Run Completed Successfully!</h4>
                                                <p className="text-[11px] text-white">Earnings have been credited.</p>
                                                <button
                                                    onClick={handleClearErrandRun}
                                                    className="text-xs font-bold text-slate-600 bg-errand-alabaster border border-slate-200 rounded-lg px-3 py-1.5 mt-2 hover:bg-errand-alabaster"
                                                >
                                                    Validation
                                                </button>
                                            </div>
                                        )}

                                        {/* CUSTOMER UPDATE & CANCEL OPTIONS */}
                                        {errandState !== "completed" && (
                                            <div className="pt-4 border-t border-slate-200 space-y-4">
                                                <div className="bg-white p-4 rounded-xl border border-slate-200">
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider mb-2">Send Update to Customer</label>
                                                    <div className="flex gap-2">
                                                        <input
                                                            type="text"
                                                            placeholder="e.g. Traffic is heavy, I'll be 5 mins late..."
                                                            value={customUpdateMessage}
                                                            onChange={(e) => setCustomUpdateMessage(e.target.value)}
                                                            className="flex-1 text-xs border border-slate-200 rounded-lg p-2.5 outline-none focus:border-errand-leaf"
                                                        />
                                                        <button
                                                            onClick={handleSendCustomUpdate}
                                                            disabled={!customUpdateMessage.trim()}
                                                            className="bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-xs font-bold px-4 py-2.5 rounded-lg transition"
                                                        >
                                                            Send
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <button
                                                        onClick={handleCancelErrand}
                                                        className="text-[11px] font-bold text-red-500 hover:text-red-700 underline"
                                                    >
                                                        Cancel & Release Errand
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                    </div>
                                )}

                                {errandState === "pool" && poolErrands.length === 0 && (
                                    <div className="bg-errand-alabaster rounded-2xl border border-slate-200 p-8 text-center text-slate-400 text-xs font-medium">
                                        No active local market requests currently listed in your location.
                                    </div>
                                )}

                            </div>

                            {/* Right Column: Rides Log Ledger & Wallet Earnings History */}
                            <div className="space-y-6">
                                <div className="bg-errand-alabaster rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-base border border-slate-200">👨‍✈️</div>
                                        <div>
                                            <h4 className="font-extrabold text-xs text-errand-obsidian">{fullName || "Shopper"}</h4>
                                            <div className="flex items-center space-x-1 mt-0.5">
                                                <Star className="w-2.5 h-2.5 text-errand-ochre fill-amber-400" />
                                                <span className="text-[9px] font-bold text-slate-600">4.9 Rating</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            localStorage.removeItem("errand-shopper-registered");
                                            localStorage.removeItem("errand-shopper-name");
                                            setShopperStatus("unregistered");
                                            setFullName("");
                                        }}
                                        className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold px-2 py-1 rounded"
                                    >
                                        Logout
                                    </button>
                                </div>

                                {/* Live Wallet Summary */}
                                <div className="bg-slate-900 rounded-2xl p-5 text-white shadow-md">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Earnings</span>
                                    <span className="text-3xl font-black block tracking-tight mt-1">₵{errandState === "completed" ? "110.00" : "85.00"}</span>
                                </div>

                                {/* Rides History */}
                                <div className="bg-errand-alabaster rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
                                    <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block">Your Past Runs</span>
                                    <div className="space-y-2">
                                        {historyErrands.length > 0 ? historyErrands.map((history: any) => (
                                            <div key={history._id || history.id} className="p-3 bg-errand-alabaster border border-slate-100 rounded-xl text-xs flex justify-between items-start">
                                                <div>
                                                    <strong className="text-errand-obsidian block">{history.customerId || "Customer"}</strong>
                                                    <span className="text-[10px] text-slate-400 block mt-0.5">{history.marketName}</span>
                                                </div>
                                                <span className="font-extrabold text-errand-leaf">₵{history.payout}</span>
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
