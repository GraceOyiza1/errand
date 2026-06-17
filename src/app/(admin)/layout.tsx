import React from 'react';

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
