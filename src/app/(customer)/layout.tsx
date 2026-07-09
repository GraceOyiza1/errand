import React from 'react';
import Link from 'next/link';
import { Clock } from 'lucide-react';

export default function CustomerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex flex-col bg-errand-alabaster/50">
            <header className="sticky top-0 z-50 bg-errand-alabaster/80 backdrop-blur-md border-b border-slate-200/80 px-8 py-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-errand-leaf animate-pulse" />
                    <h2 className="text-xl font-bold tracking-tight text-errand-obsidian">Errand Hub</h2>
                </div>
                <div className="flex items-center gap-4">
                    <Link 
                        href="/customer/orders" 
                        className="text-xs font-extrabold text-errand-obsidian bg-white border border-slate-200 shadow-sm px-4 py-1.5 rounded-lg hover:bg-slate-50 transition flex items-center gap-1.5"
                    >
                        <Clock className="w-3.5 h-3.5 text-errand-leaf" />
                        Track Status
                    </Link>
                    <div className="text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg">
                        Role: Customer
                    </div>
                </div>
            </header>

            <main className="flex-1 p-8 max-w-7xl w-full mx-auto">
                {children}
            </main>
        </div>
    );
}
