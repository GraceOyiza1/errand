import React from 'react';

export default function ShopperLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex flex-col bg-slate-100">
            <header className="bg-slate-900 text-white px-8 py-4 flex justify-between items-center shadow-md">
                <h2 className="text-xl font-bold tracking-tight text-errand-leaf">Errand Rider Portal</h2>
                <span className="text-xs font-semibold bg-errand-leaf/20 text-errand-leaf px-2.5 py-1 rounded-md border border-errand-leaf/30">
                    Status: Active & Online
                </span>
            </header>

            <main className="flex-1 p-6 max-w-6xl w-full mx-auto">
                {children}
            </main>
        </div>
    );
}
