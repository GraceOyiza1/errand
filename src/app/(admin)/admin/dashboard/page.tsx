export default function AdminDashboardPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
                <p className="mt-1 text-sm text-slate-500">Overview of platform activity and operations.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                    <p className="text-sm text-slate-500">Total Orders</p>
                    <h2 className="mt-2 text-3xl font-semibold">128</h2>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                    <p className="text-sm text-slate-500">Active Shoppers</p>
                    <h2 className="mt-2 text-3xl font-semibold">24</h2>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                    <p className="text-sm text-slate-500">Pending Issues</p>
                    <h2 className="mt-2 text-3xl font-semibold">7</h2>
                </div>
            </div>
        </div>
    );
}
