import React from 'react';
import Link from 'next/link';
import { Clock } from 'lucide-react';
import Footer from '@/components/Footer';

export default function CustomerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex flex-col bg-errand-alabaster/50 dark:bg-slate-950 transition-colors duration-300">
            <header className="sticky top-0 z-50 bg-errand-alabaster/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 sm:px-8 py-4 flex justify-between items-center transition-colors duration-300">
                <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-errand-leaf animate-pulse" />
                    <h2 className="text-lg sm:text-xl font-bold tracking-tight text-errand-obsidian dark:text-white">Errand Hub</h2>
                </div>
                <div className="flex items-center gap-2 sm:gap-4">
                    <Link 
                        href="/customer/orders" 
                        className="text-xs font-extrabold text-errand-obsidian dark:text-white bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm px-3 sm:px-4 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition flex items-center gap-1.5"
                    >
                        <Clock className="w-3.5 h-3.5 text-errand-leaf dark:text-emerald-400" />
                        Track Status
                    </Link>
                    <div className="hidden sm:block text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg transition-colors">
                        Role: Customer
                    </div>
                </div>
            </header>

            <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto pb-24">
                {children}
            </main>
            
            <Footer />
        </div>
    );
}
