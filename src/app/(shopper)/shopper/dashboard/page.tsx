export default function ShopperDashboard() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Available Market Errands</h1>
                <p className="text-slate-500 mt-1">Accept trips below to start shopping for clients.</p>
            </div>

            <div className="bg-white border p-12 rounded-2xl shadow-xs text-center text-slate-400">
                <p className="text-sm font-medium">No open market requests in your area right now.</p>
                <p className="text-xs mt-1">New orders from Makola, Madina, and Kaneshie will appear live here.</p>
            </div>
        </div>
    );
}
