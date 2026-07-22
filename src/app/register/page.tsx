'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

export default function RegisterPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        const formData = new FormData(e.currentTarget);
        const name = formData.get('name');
        const email = formData.get('email');
        const password = formData.get('password');

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to register');
            }

            // Always redirect admins to admin dashboard
            router.push('/admin/dashboard');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6 dark:bg-slate-950">
            <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="p-8">
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Admin Registration</h1>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                        Create an administrator account to manage Errand.
                    </p>

                    {error && (
                        <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-400">
                            {error}
                        </div>
                    )}

                    <form onSubmit={onSubmit} className="mt-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                Full Name
                            </label>
                            <input
                                name="name"
                                type="text"
                                required
                                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                placeholder="Admin Name"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                Email Address
                            </label>
                            <input
                                name="email"
                                type="email"
                                required
                                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                placeholder="admin@errand.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                Password
                            </label>
                            <input
                                name="password"
                                type="password"
                                required
                                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                placeholder="••••••••"
                            />
                        </div>
                        
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="mt-6 flex w-full items-center justify-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-500"
                        >
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Create Admin Account
                        </button>
                    </form>
                </div>
                <div className="border-t border-slate-100 bg-slate-50 px-8 py-4 text-center dark:border-slate-800 dark:bg-slate-900/50">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Already an admin?{' '}
                        <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
                            Log in
                        </Link>
                    </p>
                </div>
            </div>
        </main>
    );
}
