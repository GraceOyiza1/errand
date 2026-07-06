import React, { useState, useEffect } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import {
    getAuth,
    signInAnonymously,
    signInWithCustomToken,
    onAuthStateChanged
} from 'firebase/auth';
import {
    getFirestore,
    doc,
    setDoc,
    getDoc,
    collection,
    onSnapshot,
    updateDoc,
    addDoc
} from 'firebase/firestore';
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
    DollarSign,
    Camera,
    X,
    AlertCircle,
    TrendingUp,
    RefreshCw,
    Bell
} from 'lucide-react';

// ==========================================
// FIREBASE ENVIRONMENT CONFIGURATION SETUP
// ==========================================
const appId = typeof __app_id !== 'undefined' ? __app_id : 'errand-default-sandbox';
let db;
let auth;

// Safely initialize Firebase with environment keys or fallback
const initializeFirebaseService = () => {
    try {
        if (typeof __firebase_config !== 'undefined' && __firebase_config) {
            const firebaseConfig = JSON.parse(__firebase_config);
            if (getApps().length === 0) {
                const app = initializeApp(firebaseConfig);
                auth = getAuth(app);
                db = getFirestore(app);
            }
        } else {
            // Graceful fallback for mock local preview if config isn't populated
            db = null;
            auth = null;
        }
    } catch (error) {
        console.error("Firebase Initialization Error: ", error);
        db = null;
        auth = null;
    }
};

initializeFirebaseService();

export default function App() {
    const [user, setUser] = useState(null);
    const [userId, setUserId] = useState('demo-shopper-id-123');
    const [useMockMode, setUseMockMode] = useState(false);

    // 1. SHOPPER PROFILE STATES
    const [shopperProfile, setShopperProfile] = useState({
        fullName: '',
        phone: '',
        idType: 'Ghana Card',
        idNumber: '',
        vehicleType: 'Motorcycle',
        isVerified: false,
        onboardingStatus: 'unregistered' // unregistered, under_review, verified
    });

    // 2. DISPATCH & PIPELINE DATA STATES
    const [allErrands, setAllErrands] = useState([]);
    const [activeErrand, setActiveErrand] = useState(null);
    const [notification, setNotification] = useState(null);
    const [shopperEarnings, setShopperEarnings] = useState(85.00);
    const [completedRuns, setCompletedRuns] = useState([]);

    // 3. MANUAL TIME SETTINGS
    const [shoppingTime, setShoppingTime] = useState("30");
    const [deliveryTime, setDeliveryTime] = useState("20");

    // Onboarding Form Inputs
    const [formName, setFormName] = useState('');
    const [formPhone, setFormPhone] = useState('');
    const [formIdType, setFormIdType] = useState('Ghana Card');
    const [formIdNum, setFormIdNum] = useState('');
    const [formVehicle, setFormVehicle] = useState('Motorcycle');

    // ==========================================
    // AUTHENTICATION & INITIAL DATABASE LISTENERS
    // ==========================================
    useEffect(() => {
        if (!db || !auth) {
            setUseMockMode(true);
            loadMockInitialData();
            return;
        }

        // Rule 3: Auth Before Queries
        const authenticateUser = async () => {
            try {
                if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
                    await signInWithCustomToken(auth, __initial_auth_token);
                } else {
                    await signInAnonymously(auth);
                }
            } catch (err) {
                console.error("Auth failed, falling back to mock mode: ", err);
                setUseMockMode(true);
                loadMockInitialData();
            }
        };

        authenticateUser();

        const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                setUserId(currentUser.uid);

                // Fetch/Listen to Shopper Profile
                // Rule 1: Strict private path
                const profileRef = doc(db, 'artifacts', appId, 'users', currentUser.uid, 'profile', 'personalData');
                const unsubProfile = onSnapshot(profileRef, (snapshot) => {
                    if (snapshot.exists()) {
                        setShopperProfile(snapshot.data());
                    } else {
                        // Unregistered default state
                        setShopperProfile({
                            fullName: '',
                            phone: '',
                            idType: 'Ghana Card',
                            idNumber: '',
                            vehicleType: 'Motorcycle',
                            isVerified: false,
                            onboardingStatus: 'unregistered'
                        });
                    }
                }, (error) => {
                    showNotification("System Error", "Failed to load profile. Using local fallback.");
                });

                // Fetch/Listen to Errands Feed
                // Rule 1: Strict public path
                const errandsCollection = collection(db, 'artifacts', appId, 'public', 'data', 'errands');
                const unsubErrands = onSnapshot(errandsCollection, (snapshot) => {
                    const fetchedErrands = [];
                    snapshot.forEach((doc) => {
                        fetchedErrands.push({ id: doc.id, ...doc.data() });
                    });
                    setAllErrands(fetchedErrands);
                }, (error) => {
                    console.error("Error reading errands: ", error);
                });

                return () => {
                    unsubProfile();
                    unsubErrands();
                };
            }
        });

        return () => unsubscribeAuth();
    }, []);

    // Update active errand pipeline whenever collection data matches
    useEffect(() => {
        if (allErrands.length > 0) {
            // Find if we have an active assigned errand in transit or shopping for this rider
            const active = allErrands.find(e =>
                e.riderId === userId &&
                ['accepted', 'shopping', 'delivering'].includes(e.status)
            );

            // Real-time cancellation alert: if local state has active, but database shows it was canceled
            if (activeErrand && !active) {
                const dbUpdatedErrand = allErrands.find(e => e.id === activeErrand.id);
                if (dbUpdatedErrand && dbUpdatedErrand.status === 'canceled') {
                    showNotification(
                        "⚠️ Errand Canceled!",
                        `Your current run to ${activeErrand.marketName} was canceled by the customer. A ₵10 cancellation credit was sent to your wallet.`
                    );
                    setShopperEarnings(prev => prev + 10);
                }
            }

            setActiveErrand(active || null);

            // Collect completed runs for our history ledger
            const completed = allErrands.filter(e => e.riderId === userId && e.status === 'delivered');
            setCompletedRuns(completed);
        }
    }, [allErrands, userId]);

    // ==========================================
    // LOCAL MOCK STATE FALLBACK (PREVIEW MODE)
    // ==========================================
    const loadMockInitialData = () => {
        setAllErrands([
            {
                id: "ERR-9921",
                marketName: "Makola Market",
                location: "Accra Central",
                payout: "85.00",
                status: "locked", // available in pool
                items: [
                    { name: "Yam (Pona Tuber)", qty: 2, condition: "Must be very firm, no soft spots" },
                    { name: "Rodo (Pepper)", qty: 1, condition: "Leave my pepper unblended" }
                ],
                riderId: null
            }
        ]);
    };

    // Helper to trigger inside-app modal notification (no browser alert!)
    const showNotification = (title, message) => {
        setNotification({ title, message });
    };

    // ==========================================
    // ONBOARDING VERIFICATION FORM ACTIONS
    // ==========================================
    const handleOnboardingSubmit = async (e) => {
        e.preventDefault();
        if (!formName || !formPhone || !formIdNum) {
            showNotification("Missing Fields", "Please complete all verification inputs before submitting.");
            return;
        }

        const updatedProfile = {
            fullName: formName,
            phone: formPhone,
            idType: formIdType,
            idNumber: formIdNum,
            vehicleType: formVehicle,
            isVerified: false,
            onboardingStatus: 'under_review'
        };

        if (useMockMode) {
            setShopperProfile(updatedProfile);
        } else {
            try {
                // Rule 1: Write profile parameters securely
                const profileRef = doc(db, 'artifacts', appId, 'users', userId, 'profile', 'personalData');
                await setDoc(profileRef, updatedProfile);
            } catch (err) {
                showNotification("Database Write Failed", err.message);
            }
        }
    };

    // Simulator Bypass (Allows instant approval testing)
    const simulateAdminApproval = async () => {
        const approvedProfile = {
            ...shopperProfile,
            isVerified: true,
            onboardingStatus: 'verified'
        };

        if (useMockMode) {
            setShopperProfile(approvedProfile);
        } else {
            try {
                const profileRef = doc(db, 'artifacts', appId, 'users', userId, 'profile', 'personalData');
                await setDoc(profileRef, approvedProfile);
            } catch (err) {
                showNotification("Database Write Failed", err.message);
            }
        }
    };

    // ==========================================
    // REAL-TIME OPERATIONS & STATUS STATE HOOKS
    // ==========================================
    const handleAcceptErrand = async (errandId) => {
        if (useMockMode) {
            setAllErrands(prev => prev.map(e => e.id === errandId ? {
                ...e,
                status: 'accepted',
                riderId: userId,
                riderName: shopperProfile.fullName || "Kofi Sourcing Pro",
                riderPhone: shopperProfile.phone || "+233 24 123 4567"
            } : e));
        } else {
            try {
                const errandDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'errands', errandId);
                await updateDoc(errandDocRef, {
                    status: 'accepted',
                    riderId: userId,
                    riderName: shopperProfile.fullName,
                    riderPhone: shopperProfile.phone,
                    riderBike: shopperProfile.vehicleType
                });
            } catch (err) {
                showNotification("Error", "Could not lock this errand from the database pool.");
            }
        }
    };

    const handleStartShopping = async () => {
        if (!activeErrand) return;
        const shoppingMinutes = Number(shoppingTime) || 30;
        const deliveryMinutes = Number(deliveryTime) || 20;

        if (useMockMode) {
            setAllErrands(prev => prev.map(e => e.id === activeErrand.id ? {
                ...e,
                status: 'shopping',
                estShoppingTime: shoppingMinutes,
                estDeliveryTime: deliveryMinutes
            } : e));
        } else {
            try {
                const errandDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'errands', activeErrand.id);
                await updateDoc(errandDocRef, {
                    status: 'shopping',
                    estShoppingTime: shoppingMinutes,
                    estDeliveryTime: deliveryMinutes
                });
            } catch (err) {
                showNotification("Error", "Database timeline synchronization failed.");
            }
        }
    };

    const handleUploadProofAndTransit = async () => {
        if (!activeErrand) return;

        if (useMockMode) {
            setAllErrands(prev => prev.map(e => e.id === activeErrand.id ? {
                ...e,
                status: 'delivering',
                proofPhoto: "mock_uploaded"
            } : e));
        } else {
            try {
                const errandDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'errands', activeErrand.id);
                await updateDoc(errandDocRef, {
                    status: 'delivering',
                    proofPhoto: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80" // Flat-lay verification proof sample
                });
            } catch (err) {
                showNotification("Error", "Could not complete flat-lay proof upload.");
            }
        }
    };

    const handleCompleteDelivery = async () => {
        if (!activeErrand) return;

        if (useMockMode) {
            setAllErrands(prev => prev.map(e => e.id === activeErrand.id ? {
                ...e,
                status: 'delivered'
            } : e));
            setShopperEarnings(prev => prev + Number(activeErrand.payout));
        } else {
            try {
                const errandDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'errands', activeErrand.id);
                await updateDoc(errandDocRef, {
                    status: 'delivered'
                });
                setShopperEarnings(prev => prev + Number(activeErrand.payout));
            } catch (err) {
                showNotification("Error", "Completion handover failed to sync.");
            }
        }
    };

    // ==========================================
    // REAL-TIME SIMULATOR: CUSTOMER TRIGGER BOX
    // ==========================================
    const triggerSimulationOrder = async () => {
        const freshMockOrder = {
            id: "ERR-" + Math.floor(1000 + Math.random() * 9000),
            marketName: "Kejetia Market",
            location: "Kumasi",
            payout: "95.00",
            status: "locked", // Immediately available in the pool
            items: [
                { name: "Smoked Fish (Panla)", qty: 3, condition: "Must be dry and tightly wrapped" },
                { name: "Ripe Plantain", qty: 2, condition: "Deep yellow, firm texture" }
            ],
            riderId: null
        };

        if (useMockMode) {
            setAllErrands(prev => [...prev, freshMockOrder]);
            showNotification("Simulator Sync", "A customer paid and locked an errand! It's now visible in your pool.");
        } else {
            try {
                // Write fresh locked order into database to test crossing devices
                const errandsCollection = collection(db, 'artifacts', appId, 'public', 'data', 'errands');
                await addDoc(errandsCollection, freshMockOrder);
                showNotification("Firestore Sync", "Real-time Order injected successfully! Look at your pool below.");
            } catch (err) {
                showNotification("Simulation Failed", err.message);
            }
        }
    };

    const triggerSimulationCancel = async () => {
        if (!activeErrand) {
            showNotification("Simulator Error", "You must accept an active errand before simulating a customer cancellation.");
            return;
        }

        if (useMockMode) {
            setAllErrands(prev => prev.map(e => e.id === activeErrand.id ? { ...e, status: 'canceled' } : e));
        } else {
            try {
                const errandDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'errands', activeErrand.id);
                await updateDoc(errandDocRef, { status: 'canceled' });
            } catch (err) {
                console.error(err);
            }
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col">

            {/* 1. TOP HEADER BANNER */}
            <header className="bg-slate-900 text-white shadow-md">
                <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between">
                    <div className="flex items-center space-x-3 text-center md:text-left">
                        <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xl shadow-md">
                            🏍️
                        </div>
                        <div>
                            <div className="flex items-center space-x-2">
                                <h1 className="text-xl font-black tracking-tight">ERRAND <span className="text-emerald-400">Shopper Dashboard</span></h1>
                                <span className={`text-[9px] px-2 py-0.5 rounded font-black ${useMockMode ? 'bg-amber-500 text-slate-950' : 'bg-emerald-600 text-white animate-pulse'}`}>
                                    {useMockMode ? 'MOCK INTERACTIVE' : 'REAL-TIME DB LIVE'}
                                </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5">Sourcing and logistics panel for Ghana & Nigeria</p>
                        </div>
                    </div>

                    <div className="mt-4 md:mt-0 flex items-center space-x-3">
                        <span className="text-xs font-bold text-slate-400">Security Gate:</span>
                        {shopperProfile.onboardingStatus === 'unregistered' && (
                            <span className="text-xs font-black bg-red-900/50 text-red-300 border border-red-800 px-3 py-1.5 rounded-full">🚫 Blocked (KYC Required)</span>
                        )}
                        {shopperProfile.onboardingStatus === 'under_review' && (
                            <span className="text-xs font-black bg-amber-900/50 text-amber-300 border border-amber-800 px-3 py-1.5 rounded-full animate-pulse">⏳ Document Reviewing</span>
                        )}
                        {shopperProfile.onboardingStatus === 'verified' && (
                            <span className="text-xs font-black bg-emerald-900/50 text-emerald-300 border border-emerald-800 px-3 py-1.5 rounded-full">✓ Verified Rider</span>
                        )}
                    </div>
                </div>
            </header>

            {/* 2. REAL-TIME SYNC TESTING TOOLBAR */}
            <section className="bg-slate-800 text-slate-100 py-3 px-4 border-b border-slate-700">
                <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center space-x-2">
                        <Bell className="w-4 h-4 text-emerald-400 animate-bounce" />
                        <p className="text-xs text-slate-300">
                            <strong>Testing Console:</strong> Use these buttons to simulate actions made by a customer on another device!
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            onClick={triggerSimulationOrder}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-extrabold px-3 py-1.5 rounded-lg flex items-center space-x-1 transition"
                        >
                            <span>➕ Simulate Customer Order & Pay</span>
                        </button>
                        {activeErrand && (
                            <button
                                onClick={triggerSimulationCancel}
                                className="bg-red-600 hover:bg-red-700 text-white text-[11px] font-extrabold px-3 py-1.5 rounded-lg flex items-center space-x-1 transition"
                            >
                                <span>🚫 Simulate Customer Cancel</span>
                            </button>
                        )}
                    </div>
                </div>
            </section>

            {/* 3. MAIN DASHBOARD CONTENT GRID */}
            <main className="max-w-6xl mx-auto px-4 py-8 flex-1 w-full">

                {/* ==============================================
            GATE 1: UNREGISTERED FORM (KYC FORM REQUIRED)
           ============================================== */}
                {shopperProfile.onboardingStatus === 'unregistered' && (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden max-w-2xl mx-auto">
                        <div className="bg-red-600 p-5 text-white flex items-center space-x-3">
                            <ShieldAlert className="w-8 h-8 shrink-0 animate-pulse" />
                            <div>
                                <h2 className="font-extrabold text-lg">Shopper Security Protocol Check</h2>
                                <p className="text-xs text-red-100">You must register your profile identification and vehicle details before viewing open customer lists.</p>
                            </div>
                        </div>

                        <form onSubmit={handleOnboardingSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Full Legal Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formName}
                                        onChange={(e) => setFormName(e.target.value)}
                                        placeholder="Matches your Identity Card"
                                        className="w-full text-sm border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition bg-slate-50"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">MoMo / Contact Number</label>
                                    <input
                                        type="tel"
                                        required
                                        value={formPhone}
                                        onChange={(e) => setFormPhone(e.target.value)}
                                        placeholder="e.g. +233 24 123 4567"
                                        className="w-full text-sm border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition bg-slate-50"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">ID Card Type</label>
                                    <select
                                        value={formIdType}
                                        onChange={(e) => setFormIdType(e.target.value)}
                                        className="w-full text-sm border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition bg-slate-50 h-[46px]"
                                    >
                                        <option value="Ghana Card">Ghana Card</option>
                                        <option value="Voters ID">Voters ID</option>
                                        <option value="Passport">Passport</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Unique Document Number</label>
                                    <input
                                        type="text"
                                        required
                                        value={formIdNum}
                                        onChange={(e) => setFormIdNum(e.target.value)}
                                        placeholder="e.g. GHA-10294829-1"
                                        className="w-full text-sm border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition bg-slate-50"
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">Logistics Ride Mode</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {["Motorcycle", "Bicycle", "On-Foot"].map((mode) => (
                                            <button
                                                key={mode}
                                                type="button"
                                                onClick={() => setFormVehicle(mode)}
                                                className={`p-3 rounded-xl border text-xs font-extrabold transition text-center ${formVehicle === mode
                                                        ? "border-emerald-600 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-600/15"
                                                        : "border-slate-200 bg-white hover:border-slate-300 text-slate-600"
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
                                    className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold uppercase tracking-widest py-4 rounded-xl transition"
                                >
                                    📤 Submit Verification Files
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* ==============================================
            GATE 2: UNDER REVIEW SCREEN
           ============================================== */}
                {shopperProfile.onboardingStatus === 'under_review' && (
                    <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-lg max-w-xl mx-auto space-y-4">
                        <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto border border-amber-200">
                            <Clock className="w-8 h-8 animate-spin" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-slate-900">Your Errand Profile Vetting is Underway</h2>
                            <p className="text-xs text-slate-500 max-w-md mx-auto mt-2 leading-relaxed">
                                Thank you, <strong>{shopperProfile.fullName}</strong>. Admin verification of credentials and MoMo registers typically requires 15 minutes.
                                Use the bypass simulation key below to unlock your pool instantly for testing.
                            </p>
                        </div>

                        <div className="pt-6 border-t border-slate-100 max-w-xs mx-auto">
                            <button
                                onClick={simulateAdminApproval}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold py-3 rounded-xl transition shadow-md"
                            >
                                ⚡ Simulate Instant Admin Verification
                            </button>
                        </div>
                    </div>
                )}

                {/* ==============================================
            GATE 3: VERIFIED DISPATCH & POOL PIPELINE
           ============================================== */}
                {shopperProfile.onboardingStatus === 'verified' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* Left/Middle Column: Available Pool & Sourcing Checklist */}
                        <div className="lg:col-span-2 space-y-6">

                            {/* AVAILABLE JOB BOARD */}
                            {!activeErrand && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                                        <div>
                                            <h2 className="text-base font-black text-slate-900 uppercase tracking-tight">🛒 Sourcing Request Pool</h2>
                                            <p className="text-xs text-slate-500">Pick an active market request to begin earning</p>
                                        </div>
                                        <span className="text-xs bg-slate-200 px-3 py-1 rounded-full font-bold text-slate-700">
                                            {allErrands.filter(e => e.status === 'locked').length} available
                                        </span>
                                    </div>

                                    {allErrands.filter(e => e.status === 'locked').length === 0 ? (
                                        <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center space-y-2">
                                            <p className="text-sm text-slate-400 font-bold">No locked orders are currently in the pool.</p>
                                            <button
                                                onClick={triggerSimulationOrder}
                                                className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 font-extrabold px-4 py-2 rounded-xl hover:bg-emerald-100 transition"
                                            >
                                                ⚡ Simulate Customer Adding List & Paying
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 gap-4">
                                            {allErrands.filter(e => e.status === 'locked').map((errand) => (
                                                <div key={errand.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div>
                                                            <div className="flex items-center space-x-1 text-xs text-slate-400 font-semibold">
                                                                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                                                                <span>{errand.marketName} • {errand.location}</span>
                                                            </div>
                                                            <h3 className="font-extrabold text-sm text-slate-900 mt-1">Multi-item Household Restock</h3>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className="text-[10px] text-slate-400 font-black uppercase block">Rider Payout</span>
                                                            <span className="text-base font-black text-emerald-700">₵{errand.payout}</span>
                                                        </div>
                                                    </div>

                                                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 mb-4 text-xs space-y-2">
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Inspected Items:</span>
                                                        <ul className="space-y-1.5 font-semibold text-slate-700">
                                                            {errand.items?.map((item, idx) => (
                                                                <li key={idx} className="flex justify-between">
                                                                    <span>• {item.qty}x {item.name}</span>
                                                                    <span className="text-[11px] text-slate-500 italic">"{item.condition}"</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>

                                                    <button
                                                        onClick={() => handleAcceptErrand(errand.id)}
                                                        className="w-full bg-slate-900 hover:bg-emerald-600 text-white font-extrabold text-xs uppercase py-3 rounded-xl transition"
                                                    >
                                                        🤝 Accept Job & Update Customer Dashboard
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ACTIVE SOURCING PIPELINE OPERATION */}
                            {activeErrand && (
                                <div className="bg-white border-2 border-slate-900 rounded-2xl p-6 shadow-lg space-y-6">

                                    {/* Operation Status Bar */}
                                    <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                                        <div>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Assigned Order ID</span>
                                            <h3 className="text-lg font-black text-slate-900">{activeErrand.id}</h3>
                                        </div>
                                        <span className="text-xs bg-emerald-50 text-emerald-800 font-black px-3 py-1 rounded-lg uppercase tracking-wider border border-emerald-200 animate-pulse">
                                            STATUS: {activeErrand.status}
                                        </span>
                                    </div>

                                    {/* SUB-FLOW A: ACCEPTED (SET MANUAL TIMER COUNTER) */}
                                    {activeErrand.status === 'accepted' && (
                                        <div className="p-5 bg-orange-50 border border-orange-200 rounded-xl space-y-4">
                                            <div>
                                                <h4 className="font-extrabold text-xs text-orange-950 uppercase tracking-wider flex items-center space-x-1.5">
                                                    <Clock className="w-4 h-4 text-orange-600" />
                                                    <span>Define Manual Sourcing Times</span>
                                                </h4>
                                                <p className="text-[11px] text-orange-700 mt-1 leading-normal">
                                                    Provide your exact estimated minutes to the customer. This will update their countdown screen in real-time.
                                                </p>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Market Shopping (Mins)</label>
                                                    <input
                                                        type="number"
                                                        value={shoppingTime}
                                                        onChange={(e) => setShoppingTime(e.target.value)}
                                                        className="w-full bg-white text-xs p-3 rounded-lg border border-slate-200 font-bold focus:outline-none"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Bike Transit Delivery (Mins)</label>
                                                    <input
                                                        type="number"
                                                        value={deliveryTime}
                                                        onChange={(e) => setDeliveryTime(e.target.value)}
                                                        className="w-full bg-white text-xs p-3 rounded-lg border border-slate-200 font-bold focus:outline-none"
                                                    />
                                                </div>
                                            </div>

                                            <button
                                                onClick={handleStartShopping}
                                                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs uppercase py-3.5 rounded-xl transition"
                                            >
                                                🚀 Lock Estimates & Start Market Sourcing
                                            </button>
                                        </div>
                                    )}

                                    {/* SUB-FLOW B: SHOPPING & QUALITY FLAT-LAY PROOF */}
                                    {activeErrand.status === 'shopping' && (
                                        <div className="space-y-4">
                                            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                                                <h4 className="font-extrabold text-xs text-amber-900 uppercase tracking-wider flex items-center space-x-1">
                                                    <ShoppingBag className="w-4 h-4 text-amber-600" />
                                                    <span>Quality Inspections (Makola Stall Check)</span>
                                                </h4>
                                                <p className="text-[10px] text-amber-700 mt-0.5">Please manually verify each items meets the customers specified conditions.</p>

                                                <div className="space-y-2 mt-3">
                                                    {activeErrand.items?.map((item, idx) => (
                                                        <div key={idx} className="bg-white border border-slate-100 p-3 rounded-xl flex items-center justify-between text-xs">
                                                            <div>
                                                                <span className="font-extrabold text-slate-900">{item.qty}x {item.name}</span>
                                                                <span className="block text-[10px] text-slate-400 italic mt-0.5">Note: "{item.condition}"</span>
                                                            </div>
                                                            <span className="text-[10px] bg-emerald-50 text-emerald-800 font-black px-2 py-0.5 rounded-full">Inspected</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Single Flat-lay verification phototaker */}
                                            <div className="border-2 border-dashed border-slate-200 p-5 rounded-2xl bg-slate-50 text-center space-y-3">
                                                <Camera className="w-8 h-8 text-slate-400 mx-auto animate-pulse" />
                                                <h5 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Take Single Complete Flat-Lay Photo</h5>
                                                <p className="text-[11px] text-slate-500 max-w-sm mx-auto leading-relaxed">
                                                    Lay everything cleanly together inside the transit crate. Take one single photograph to verify bundle quality and speed up delivery.
                                                </p>
                                                <button
                                                    onClick={handleUploadProofAndTransit}
                                                    className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-lg transition"
                                                >
                                                    📸 Snap & Handover to Bike Rider
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* SUB-FLOW C: TRANSIT ROAD TO CLIENT */}
                                    {activeErrand.status === 'delivering' && (
                                        <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl text-center space-y-4">
                                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mx-auto">
                                                <Truck className="w-6 h-6 animate-pulse" />
                                            </div>
                                            <div>
                                                <h4 className="font-extrabold text-sm text-blue-950">Package Safely Locked in Crate</h4>
                                                <p className="text-xs text-blue-700 mt-1">Driving to coordinates. Expected time left: {deliveryTime} mins.</p>
                                            </div>

                                            <button
                                                onClick={handleCompleteDelivery}
                                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs uppercase py-3.5 rounded-xl transition shadow-md"
                                            >
                                                ✅ Confirm Drop-off Complete (Credit Earnings)
                                            </button>
                                        </div>
                                    )}

                                </div>
                            )}

                        </div>

                        {/* Right Column: Earnings Summary Ledger & History Logs */}
                        <div className="space-y-6">

                            {/* Daily Tracker Wallet Box */}
                            <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-md space-y-4">
                                <div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Wallet Balance</span>
                                    <span className="text-3xl font-black block tracking-tight text-emerald-400 mt-1">₵{shopperEarnings.toFixed(2)}</span>
                                </div>
                                <div className="border-t border-slate-800 pt-3 flex justify-between text-xs text-slate-400 font-medium">
                                    <span>Successful Rides Logged:</span>
                                    <span className="font-bold text-white">{completedRuns.length} runs</span>
                                </div>
                            </div>

                            {/* Verified Rider Profile Header */}
                            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 text-lg">👩‍✈️</div>
                                <div>
                                    <h4 className="font-extrabold text-xs text-slate-900">{shopperProfile.fullName || "Kofi Sourcing Pro"}</h4>
                                    <p className="text-[10px] text-slate-400 mt-0.5">{shopperProfile.vehicleType} Mode</p>
                                    <div className="flex items-center space-x-1 mt-0.5">
                                        <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                                        <span className="text-[9px] font-bold text-slate-600">4.9 Performance Stars</span>
                                    </div>
                                </div>
                            </div>

                            {/* Verified Rides ledger history */}
                            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider block">Your Completed Runs</h4>

                                {completedRuns.length === 0 ? (
                                    <p className="text-xs text-slate-400 italic">No runs logged yet today.</p>
                                ) : (
                                    <div className="space-y-2">
                                        {completedRuns.map((run) => (
                                            <div key={run.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs flex justify-between items-start">
                                                <div>
                                                    <strong className="text-slate-900 block">{run.id}</strong>
                                                    <span className="text-[10px] text-slate-400 block mt-0.5">{run.marketName} Run</span>
                                                </div>
                                                <span className="font-black text-emerald-600">+₵{run.payout}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                        </div>

                    </div>
                )}

            </main>

            {/* ==============================================
          CUSTOM INTERNAL MODAL NOTIFICATION
         ============================================== */}
            {notification && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl p-6 max-w-sm w-full space-y-4">
                        <div className="flex items-center space-x-3 text-emerald-600">
                            <AlertCircle className="w-6 h-6 shrink-0" />
                            <h4 className="font-extrabold text-base text-slate-900">{notification.title}</h4>
                        </div>
                        <p className="text-xs text-slate-600 leading-normal">{notification.message}</p>
                        <button
                            onClick={() => setNotification(null)}
                            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold py-2.5 rounded-xl text-xs transition"
                        >
                            Okay, Understood
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
}