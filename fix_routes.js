const fs = require('fs');

const files = {
    'src/app/(admin)/layout.tsx': `import React from 'react';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-slate-50">
            <header className="border-b border-slate-200 bg-white px-6 py-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-slate-900">Admin Panel</h2>
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                        Operations Dashboard
                    </span>
                </div>
            </header>
            <main className="p-6">{children}</main>
        </div>
    );
}
`,
    'src/app/(admin)/admin/dashboard/page.tsx': `export default function AdminDashboardPage() {
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
`,
    'src/app/(customer)/customer/orders/page.tsx': `export default function CustomerOrdersPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">My Orders</h1>
                <p className="mt-1 text-sm text-slate-500">Track your recent errand requests and delivery updates.</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
                No orders yet.
            </div>
        </div>
    );
}
`
};

for (const [filePath, content] of Object.entries(files)) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Wrote ${filePath}`);
}
