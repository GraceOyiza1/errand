import React from 'react';

export default function CustomerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex flex-col bg-slate-50/50">
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-8 py-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
                    <h2 className="text-xl font-bold tracking-tight text-slate-900">Errand Hub</h2>
                </div>
                <div className="text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg">
                    Role: Customer
                </div>
            </header>

            <main className="flex-1 p-8 max-w-7xl w-full mx-auto">
                {children}
            </main>
        </div>
    );
}
