"use client";

import React, { useEffect, useState } from "react";
import ImageUploader from "@/components/ImageUploader";

interface Market {
  id: string;
  name: string;
  description: string;
  tag: string;
  baseDeliveryFee: number;
  imageUrl?: string;
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
  imageUrls: string[];
  isCustom: boolean;
}

const ACCRA_MARKETS: Market[] = [
  {
    id: "madina",
    name: "Madina Market",
    description:
      "Excellent for fresh farm produce, local grains, and everyday foodstuffs.",
    tag: "Fast Delivery",
    baseDeliveryFee: 25,
    imageUrl: "/images/mkt1.jpg",
  },
  {
    id: "makola",
    name: "Makola Market",
    description:
      "Best wholesale hub for imported items, dry goods, and household packaging.",
    tag: "Bulk Items",
    baseDeliveryFee: 35,
    imageUrl: "/images/mkt2.jpg",
  },
  {
    id: "kaneshie",
    name: "Kaneshie Market",
    description:
      "Ideal for local roots, tubers, and authentic spices wrapped in multi-tier stalls.",
    tag: "Structured Shopping",
    baseDeliveryFee: 30,
    imageUrl: "/images/mkt3.jpg",
  },
  {
    id: "agbogbloshie",
    name: "Agbogbloshie Market",
    description:
      "Accra’s primary food depot for bulk yams, fresh tomatoes, and wholesale vegetables.",
    tag: "Wholesale Depot",
    baseDeliveryFee: 40,
    imageUrl: "/images/mkt4.jpg",
  },
];

const MARKET_CATALOG: CatalogItem[] = [
  {
    id: "p1",
    name: "Fresh Tomatoes (Paint Bucket)",
    estimatedPrice: 75.0,
    unit: "bucket",
  },
  {
    id: "p2",
    name: "Scotch Bonnet Pepper / Rodo",
    estimatedPrice: 40.0,
    unit: "olonka",
  },
  { id: "p3", name: "Onions", estimatedPrice: 35.0, unit: "1 bucket" },
  { id: "p4", name: "Local Rice", estimatedPrice: 32.0, unit: "bag" },
];

export default function CustomerDashboard() {
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    "mobile-money" | "cash"
  >("mobile-money");
  const [checkoutMessage, setCheckoutMessage] = useState("");
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<{
    id: string;
    customerName: string;
    customerPhone: string;
    marketName: string;
    status: string;
    paymentMethod: string;
    riderName: string;
    riderMessage: string;
    total: number;
    etaMinutes: number;
    createdAt: string;
    items: Array<any>;
  } | null>(null);

  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  // Toggle between standard catalog or custom open text input
  const [isCustomMode, setIsCustomMode] = useState(false);

  // Form Fields
  const [selectedCatalogItemId, setSelectedCatalogItemId] = useState(
    MARKET_CATALOG[0].id,
  );
  const [customItemName, setCustomItemName] = useState("");
  const [customTargetPrice, setCustomTargetPrice] = useState("15");
  const [quantity, setQuantity] = useState(1);
  const [customUnit, setCustomUnit] = useState("wrap/packet");
  const [notes, setNotes] = useState("");
  const [itemImages, setItemImages] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Restore name/phone from localStorage if previously saved
    const savedName = window.localStorage.getItem("errand-customer-name");
    const savedPhone = window.localStorage.getItem("errand-customer-phone");
    if (savedName) setCustomerName(savedName);
    if (savedPhone) setCustomerPhone(savedPhone);

    const savedOrderId = window.localStorage.getItem("errand-last-order-id");
    if (!savedOrderId) return;

    const savedPhone2 = window.localStorage.getItem("errand-customer-phone") || "";
    const customerId = `customer_${savedPhone2.replace(/\s+/g, "")}`;

    const pollOrder = async () => {
      try {
        const res = await fetch(`/api/errands?customerId=${customerId}`);
        const result = await res.json();
        if (res.ok && result?.success && Array.isArray(result.data)) {
          const found = result.data.find((o: Record<string, unknown>) =>
            (o._id as string)?.toString() === savedOrderId || o.id === savedOrderId
          );
          if (found) setConfirmedOrder(found as typeof confirmedOrder);
        }
      } catch { /* ignore */ }
    };

    pollOrder();
    const interval = setInterval(pollOrder, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!confirmedOrder) {
      setTimeLeft(null);
      return;
    }

    const updateTimer = () => {
      const createdAtTime = new Date(confirmedOrder.createdAt).getTime();
      const elapsedSeconds = Math.floor((Date.now() - createdAtTime) / 1000);
      const remaining = 180 - elapsedSeconds;
      setTimeLeft(remaining > 0 ? remaining : 0);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [confirmedOrder]);

  const handleEditOrder = () => {
    if (!confirmedOrder) return;

    setItems(
      confirmedOrder.items.map((item: any) => ({
        id: item.id || crypto.randomUUID(),
        name: item.name,
        targetPrice: item.targetPrice || 0,
        quantity: item.quantity,
        unit: item.unit,
        notes: item.notes || "",
        imageUrls: item.imageUrls || [],
        isCustom: item.isCustom || false,
      })),
    );

    const savedOrders = window.localStorage.getItem("errand-demo-orders");
    if (savedOrders) {
      try {
        let parsed = JSON.parse(savedOrders);
        parsed = parsed.map((o: any) =>
          o.id === confirmedOrder.id ? { ...o, status: "cancelled" } : o,
        );
        window.localStorage.setItem(
          "errand-demo-orders",
          JSON.stringify(parsed),
        );
      } catch (e) { }
    }

    setConfirmedOrder(null);
    window.sessionStorage.removeItem("currentErrandOrderId");
    setCheckoutMessage(
      "Order reopened for editing. Make your changes and check out again.",
    );
  };

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
        imageUrls: itemImages,
        isCustom: true,
      };
      setItems([...items, newItem]);
      setCustomItemName("");
      setNotes("");
      setItemImages([]);
    } else {
      const catalogItem = MARKET_CATALOG.find(
        (item) => item.id === selectedCatalogItemId,
      );
      if (!catalogItem) return;

      const newItem: ShoppingItem = {
        id: crypto.randomUUID(),
        name: catalogItem.name,
        targetPrice: catalogItem.estimatedPrice,
        quantity,
        unit: catalogItem.unit,
        notes: notes,
        imageUrls: itemImages,
        isCustom: false,
      };
      setItems([...items, newItem]);
      setNotes("");
      setItemImages([]);
    }
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const handleCheckout = async (e?: React.FormEvent) => {
    if (e && e.preventDefault) e.preventDefault();
    if (isCheckingOut) return;

    if (!customerName.trim() || !customerPhone.trim()) {
      setCheckoutMessage("Please enter your name and phone number in step 1.");
      return;
    }

    if (items.length === 0 || !selectedMarket) {
      setCheckoutMessage(
        "Please add at least one item and choose a market before checking out.",
      );
      return;
    }

    const savedOrders =
      typeof window !== "undefined"
        ? window.localStorage.getItem("errand-demo-orders")
        : null;
    const existingOrders = savedOrders ? JSON.parse(savedOrders) : [];
    const duplicateOrder = existingOrders.find(
      (order: { marketName: string; items: ShoppingItem[] }) =>
        order.marketName === selectedMarket.name &&
        JSON.stringify(order.items) ===
        JSON.stringify(
          items.map((item) => ({
            name: item.name,
            quantity: item.quantity,
            unit: item.unit,
            notes: item.notes,
          })),
        ),
    );

    if (duplicateOrder) {
      setCheckoutMessage(
        "This order has already been submitted once. Check your orders page for the latest status.",
      );
      return;
    }

    setIsCheckingOut(true);
    setCheckoutMessage("Processing checkout...");

    // Derive a stable customerId from the phone number
    const customerId = `customer_${customerPhone.trim().replace(/\s+/g, "")}`;

    // Persist identity to localStorage so the orders page can look them up
    if (typeof window !== "undefined") {
      window.localStorage.setItem("errand-customer-name", customerName.trim());
      window.localStorage.setItem("errand-customer-phone", customerPhone.trim());
      window.localStorage.setItem("errand-customer-id", customerId);
    }

    try {
      const payload = {
        customerId,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        marketName: selectedMarket.name,
        items: items.map(item => ({
          name: item.name,
          qty: item.quantity,
          quantity: item.quantity,
          unit: item.unit,
          condition: item.notes,
          notes: item.notes,
          expectedPrice: item.targetPrice
        })),
        payout: grandTotal,
        paymentMethod: selectedPaymentMethod,
      };

      const response = await fetch('/api/errands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (result.success === true) {
        const insertedId = result.insertedId?.toString() || `demo-${Date.now()}`;

        // Save the last order ID so the dashboard can poll for it
        if (typeof window !== "undefined") {
          window.localStorage.setItem("errand-last-order-id", insertedId);
        }

        setConfirmedOrder({
          id: insertedId,
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          marketName: selectedMarket.name,
          status: "paid_editable",
          paymentMethod: selectedPaymentMethod,
          riderName: "Pending assignment...",
          riderMessage: "Your order has been placed. Waiting for a shopper to accept your request.",
          total: grandTotal,
          etaMinutes: 0,
          createdAt: new Date().toISOString(),
          items: items.map((item) => ({ ...item })),
        });
        setCheckoutMessage("Order successfully created!");
        setItems([]);
      } else {
        setCheckoutMessage(result.error || "Database write failed. Please try again.");
      }
    } catch {
      setCheckoutMessage("An unexpected error occurred during checkout. Please try again.");
    } finally {
      setTimeout(() => setIsCheckingOut(false), 1000);
    }
  };

  // Math calculation 
  const itemsSubtotal = items.reduce(
    (sum, item) => sum + item.targetPrice * item.quantity,
    0,
  );

  // We add a higher protection buffer specifically for unlisted open market custom items
  const marketBuffer = items.reduce((sum, item) => {
    const itemCost = item.targetPrice * item.quantity;
    return sum + (item.isCustom ? itemCost * 0.33 : itemCost * 0.12);
  }, 0);

  const deliveryFee = selectedMarket ? selectedMarket.baseDeliveryFee : 0;
  const grandTotal = itemsSubtotal + marketBuffer + deliveryFee;

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-300">
      {step === 0 && (
        <div className="space-y-6 sm:space-y-8 w-full mt-6 sm:mt-10">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="font-extrabold tracking-tight text-slate-900 text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl leading-tight">
              Welcome to Errand
            </h1>
            <p className="text-slate-500 mt-2 sm:mt-3 text-xs sm:text-sm md:text-base lg:text-lg">
              Please enter your details to get started.
            </p>

            {/* Food item examples */}
            <div className="mt-4 sm:mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 items-start">
              <img src="/images/mkt1.jpg" alt="Fresh produce" className="h-24 sm:h-28 md:h-32 rounded-2xl border border-slate-200 object-cover w-full" />
              <img src="/images/mkt2.jpg" alt="Market items" className="h-24 sm:h-28 md:h-32 rounded-2xl border border-slate-200 object-cover w-full" />
              <img src="/images/mkt3.jpg" alt="Quality goods" className="h-24 sm:h-28 md:h-32 rounded-2xl border border-slate-200 object-cover w-full" />
            </div>
          </div>
          <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4 w-full sm:max-w-md mx-auto">
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-600 mb-2">
                Your Name
              </label>
              <input
                type="text"
                placeholder="e.g. Ama Ghana"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full text-xs sm:text-sm border p-2.5 rounded-xl bg-slate-50 focus:outline-emerald-600"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-600 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                placeholder="e.g. 054 123 4567"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full text-xs sm:text-sm border p-2.5 rounded-xl bg-slate-50 focus:outline-emerald-600"
              />
            </div>
            <button
              onClick={() => {
                if (customerName.trim() && customerPhone.trim()) {
                  setStep(1);
                }
              }}
              disabled={!customerName.trim() || !customerPhone.trim()}
              className="w-full bg-emerald-600 text-white font-semibold text-xs sm:text-sm px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl hover:bg-emerald-500 transition disabled:bg-slate-300 disabled:cursor-not-allowed"
            >
              Continue to Markets
            </button>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 sm:gap-0">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
                Request a New Errand
              </h1>
              <p className="text-slate-500 mt-1 sm:mt-2 text-sm sm:text-base">
                Select the market where our shopper should buy your commodities.
              </p>
            </div>
            <button
              onClick={() => setStep(0)}
              className="text-xs sm:text-sm font-medium text-slate-500 hover:text-emerald-600 cursor-pointer whitespace-nowrap"
            >
              Edit Profile
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-3 sm:gap-6">
            {ACCRA_MARKETS.map((market) => (
              <div
                key={market.id}
                onClick={() => setSelectedMarket(market)}
                className={`overflow-hidden bg-white border rounded-2xl shadow-xs hover:shadow-md transition cursor-pointer ${selectedMarket?.id === market.id
                  ? "ring-2 ring-emerald-600 border-transparent"
                  : "border-slate-200"
                  }`}
              >
                {market.imageUrl && (
                  <img
                    src={market.imageUrl}
                    alt={market.name}
                    className="w-full h-40 object-cover"
                  />
                )}
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-600">
                      {market.tag}
                    </span>
                    <span className="text-sm font-bold text-emerald-600">
                      ₵{market.baseDeliveryFee} delivery
                    </span>
                  </div>
                  <h3 className="font-bold text-xl text-slate-800 mt-3">
                    {market.name}
                  </h3>
                </div>
              </div>
            ))}
          </div>

          {selectedMarket && (
            <div className="flex justify-end pt-3 sm:pt-4 border-t border-slate-200">
              <button
                className="bg-emerald-600 text-white font-semibold text-xs sm:text-sm px-4 sm:px-6 py-2 sm:py-3 rounded-xl hover:bg-emerald-500 transition cursor-pointer"
                onClick={() => setStep(2)}
              >
                Continue to your Shopping List
              </button>
            </div>
          )}
        </div>
      )}

      {step === 2 && selectedMarket && (
        <div className="space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
            <div>
              <button
                onClick={() => setStep(1)}
                className="text-xs font-medium text-emerald-600 hover:underline mb-2 block cursor-pointer"
              >
                ← Change Market
              </button>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
                Create List for {selectedMarket.name}
              </h1>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {/* Input Form Box */}
            <div className="bg-white border border-slate-200 p-4 sm:p-6 rounded-2xl h-fit space-y-4 sm:space-y-5 shadow-xs">
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  className={`flex-1 text-xs py-2 rounded-lg font-medium transition cursor-pointer ${!isCustomMode ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"}`}
                  onClick={() => setIsCustomMode(false)}
                >
                  Standard Listing
                </button>
                <button
                  type="button"
                  className={`flex-1 text-xs py-2 rounded-lg font-medium transition cursor-pointer ${isCustomMode ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"}`}
                  onClick={() => setIsCustomMode(true)}
                >
                  Custom Request (e.g. Beans)
                </button>
              </div>

              <form onSubmit={handleAddItem} className="space-y-4">
                {!isCustomMode ? (
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Select Item
                    </label>
                    <select
                      value={selectedCatalogItemId}
                      onChange={(e) => setSelectedCatalogItemId(e.target.value)}
                      className="w-full text-sm text-slate-900 border p-2.5 rounded-xl bg-slate-50 focus:outline-emerald-600 placeholder:text-slate-400"
                    >
                      {MARKET_CATALOG.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name} (~₵{item.estimatedPrice})
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Item Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., Locust beans (Dawadawa), Smoked herrings"
                        value={customItemName}
                        onChange={(e) => setCustomItemName(e.target.value)}
                        className="w-full text-sm text-slate-900 border p-2.5 rounded-xl bg-slate-50 focus:outline-emerald-600 placeholder:text-slate-400"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">
                          Your Target Budget (₵)
                        </label>
                        <input
                          type="number"
                          placeholder="15"
                          value={customTargetPrice}
                          onChange={(e) => setCustomTargetPrice(e.target.value)}
                          className="w-full text-sm text-slate-900 border p-2.5 rounded-xl bg-slate-50 focus:outline-emerald-600 placeholder:text-slate-400"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">
                          Cups/Bags
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 2 wraps, cups"
                          value={customUnit}
                          onChange={(e) => setCustomUnit(e.target.value)}
                          className="w-full text-sm text-slate-900 border p-2.5 rounded-xl bg-slate-50 focus:outline-emerald-600 placeholder:text-slate-400"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Quantity Needed
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    className="w-full text-sm text-slate-900 border p-2.5 rounded-xl bg-slate-50 focus:outline-emerald-600 placeholder:text-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Instructions for Rider
                  </label>
                  <textarea
                    placeholder="e.g., If the ₵15 package is too small, contact customer."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full text-sm text-slate-900 border p-2.5 rounded-xl bg-slate-50 focus:outline-emerald-600 placeholder:text-slate-400 h-20 resize-none"
                  />
                </div>

                <ImageUploader
                  images={itemImages}
                  onChange={setItemImages}
                  label="Item photos"
                  maxImages={3}
                />

                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm py-2.5 rounded-xl transition cursor-pointer"
                >
                  Add to Errand Bucket
                </button>
              </form>
            </div>

            {/* Receipt Summary Box */}
            <div className="md:col-span-1 lg:col-span-2 space-y-4 sm:space-y-6">
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col shadow-xs order-last md:order-none">
                <div className="bg-slate-50 px-6 py-3 border-b font-semibold text-xs text-slate-500 uppercase tracking-wider">
                  Current Errand Bucket
                </div>

                {items.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-12 text-center text-sm">
                    Your items will appear here.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 max-h-[250px] sm:max-h-[350px] md:max-h-[400px] overflow-y-auto">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 sm:p-4 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 hover:bg-slate-50/20"
                      >
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="font-bold text-slate-800 text-sm sm:text-base">
                              {item.name}
                            </h4>
                            {item.isCustom && (
                              <span className="text-[9px] sm:text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-sm font-bold">
                                Unlisted Request
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {item.quantity} &times; {item.unit} @ target ₵
                            {item.targetPrice.toFixed(2)}
                          </p>
                          {item.notes && (
                            <p className="text-xs text-emerald-600 mt-1">
                              📌 {item.notes}
                            </p>
                          )}
                          {item.imageUrls.length > 0 && (
                            <div className="mt-2 sm:mt-3 flex gap-2">
                              {item.imageUrls.map((src, index) => (
                                <img
                                  key={`${item.id}-img-${index}`}
                                  src={src}
                                  alt={`Attached item ${index + 1}`}
                                  className="h-8 sm:h-10 w-8 sm:w-10 rounded-lg object-cover border border-slate-200"
                                />
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 sm:gap-0">
                          <span className="font-bold text-slate-900 text-xs sm:text-sm">
                            ₵{(item.targetPrice * item.quantity).toFixed(2)}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-xs text-rose-500 hover:underline cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {items.length > 0 && (
                <div className="bg-slate-900 text-slate-100 p-4 sm:p-6 rounded-2xl space-y-3 shadow-md">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 border-b border-slate-800 pb-2">
                    Pre-Authorization Summary
                  </h4>
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-slate-400">
                      Total Target Item Prices
                    </span>
                    <span>₵{itemsSubtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-slate-400">
                      Dynamic Variable Pricing Buffer
                    </span>
                    <span>₵{marketBuffer.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-slate-400">Rider Delivery Fee</span>
                    <span>₵{deliveryFee.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-slate-800 my-2 pt-3 flex justify-between items-baseline">
                    <span className="font-bold text-sm sm:text-base">
                      Total Holding Amount
                    </span>
                    <span className="text-xl sm:text-2xl font-black text-emerald-400">
                      ₵{grandTotal.toFixed(2)}
                    </span>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 mt-3 sm:mt-4">
                    <p className="text-[9px] sm:text-[10px] uppercase tracking-widest text-slate-400">
                      Payment Method
                    </p>
                    <div className="mt-2 grid gap-2 grid-cols-1 sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPaymentMethod("mobile-money");
                          setCheckoutMessage("");
                        }}
                        className={`rounded-xl px-3 py-2 text-sm font-medium transition ${selectedPaymentMethod === "mobile-money" ? "bg-emerald-500 text-slate-950" : "bg-slate-900 text-slate-200 hover:bg-slate-800"}`}
                      >
                        Pay with MoMo / Paystack
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPaymentMethod("cash");
                          setCheckoutMessage("");
                        }}
                        className={`rounded-xl px-3 py-2 text-sm font-medium transition ${selectedPaymentMethod === "cash" ? "bg-amber-400 text-slate-950" : "bg-slate-900 text-slate-200 hover:bg-slate-800"}`}
                      >
                        Cash on Delivery
                      </button>
                    </div>
                  </div>

                  {/* Notice describing business rules */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-2 mt-4 leading-relaxed">
                    <p className="font-bold text-amber-400">
                      Errand Open-Market Guarantee Policy:
                    </p>
                    <p>
                      1. If your custom items cost less than your target
                      estimate, the remaining balance is instantly returned to
                      your account.
                    </p>
                    <p>
                      2. If an item costs more or is unavailable, the rider will
                      submit an instant app notification to approve the price
                      change.
                    </p>
                    <p>
                      3. <span className="underline">Important:</span> If you do
                      not reply to the shopper's notification before they
                      checkout at the stall, the item will be automatically
                      removed from your run and a full refund for that specific
                      item will be disbursed immediately.
                    </p>
                  </div>

                  {checkoutMessage && (
                    <div
                      className={`rounded-xl px-4 py-3 text-xs ${selectedPaymentMethod === "cash" ? "bg-amber-500/10 text-amber-300" : "bg-emerald-500/10 text-emerald-300"}`}
                    >
                      {checkoutMessage}
                    </div>
                  )}

                  {confirmedOrder && (
                    <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-[10px] uppercase tracking-widest text-emerald-700">
                            Confirmed Order
                          </p>
                          <h3 className="mt-1 text-base font-semibold text-slate-900">
                            {confirmedOrder.marketName}
                          </h3>
                        </div>
                        <span className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white">
                          {confirmedOrder.status}
                        </span>
                      </div>

                      <div className="mt-3 grid gap-3 sm:grid-cols-3">
                        <div>
                          <p className="text-xs text-slate-500">
                            Assigned Rider
                          </p>
                          <p className="text-sm font-semibold text-slate-900">
                            {confirmedOrder.riderName}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">ETA</p>
                          <p className="text-sm font-semibold text-slate-900">
                            {confirmedOrder.etaMinutes > 0
                              ? `${confirmedOrder.etaMinutes} min`
                              : "Pending..."}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Payment</p>
                          <p className="text-sm font-semibold text-slate-900">
                            {confirmedOrder.paymentMethod === "cash"
                              ? "Cash on Delivery"
                              : "MoMo Placeholder"}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 rounded-xl bg-white p-3 text-sm text-slate-700">
                        <p className="text-xs uppercase tracking-widest text-slate-500">
                          Rider update
                        </p>
                        <p className="mt-1 font-medium text-slate-900">
                          {confirmedOrder.riderMessage}
                        </p>
                      </div>

                      <div className="mt-4">
                        <p className="text-xs uppercase tracking-widest text-slate-500">
                          Items bought
                        </p>
                        <ul className="mt-2 space-y-2">
                          {confirmedOrder.items.map((item, index) => (
                            <li
                              key={`${confirmedOrder.id}-${index}`}
                              className="flex items-center justify-between rounded-xl bg-white px-3 py-2 text-sm text-slate-700"
                            >
                              <span>
                                {item.quantity} × {item.name} ({item.unit})
                                {item.notes ? ` — ${item.notes}` : ""}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {timeLeft !== null && timeLeft > 0 ? (
                        <div className="mt-5 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between">
                          <div>
                            <p className="text-xs font-bold text-amber-800">
                              Order locks in {Math.floor(timeLeft / 60)}:
                              {(timeLeft % 60).toString().padStart(2, "0")}
                            </p>
                            <p className="text-[10px] text-amber-700 mt-0.5">
                              You have 3 minutes to change items
                            </p>
                          </div>
                          <button
                            onClick={handleEditOrder}
                            className="text-xs font-bold bg-amber-200 text-amber-900 px-4 py-2 rounded-lg hover:bg-amber-300 transition shadow-xs cursor-pointer"
                          >
                            Edit Order
                          </button>
                        </div>
                      ) : timeLeft === 0 ? (
                        <div className="mt-5 p-4 bg-slate-100 border border-slate-200 rounded-xl">
                          <p className="text-xs font-bold text-slate-500">
                            Order Locked
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            The 3-minute modification window has passed.
                          </p>
                        </div>
                      ) : null}

                      {/* View My Orders CTA */}
                      <div className="mt-5 flex flex-col sm:flex-row gap-3">
                        <a
                          href="/customer/orders"
                          className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm px-5 py-3 transition shadow-sm"
                        >
                          📦 View My Orders & Track Status
                        </a>
                        <button
                          type="button"
                          onClick={() => { setConfirmedOrder(null); setStep(0); }}
                          className="flex-1 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-semibold text-sm px-5 py-3 transition"
                        >
                          Place Another Order
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end pt-4">
                    <button
                      onClick={handleCheckout}
                      className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm px-6 py-3 rounded-xl shadow-xs transition cursor-pointer"
                    >
                      {selectedPaymentMethod === "cash"
                        ? "Confirm Checkout"
                        : "Confirm MoMo Checkout"}
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
