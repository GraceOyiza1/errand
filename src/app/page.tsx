// src/app/page.tsx
import Link from 'next/link';
import image1 from '../../public/images/mkt1.jpg';
export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <div className="text-center max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-10 sm:p-16 rounded-3xl shadow-xs transition-colors duration-300">
        <span className="text-xs font-bold tracking-widest text-emerald-600 dark:text-emerald-400 uppercase bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1 rounded-full">
          On-Demand Delivery
        </span>
        <img src="/images/mkt1.jpg" alt="Quality goods" className="mt-6 h-28 sm:h-32 rounded-2xl border border-slate-200 dark:border-slate-700 object-cover w-full" />

        <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-6xl">
          Market Shopping Delivered
        </h1>

        <p className="mt-6 text-base sm:text-lg leading-relaxed text-slate-600 dark:text-slate-400 max-w-md mx-auto">
          Upload your shopping list, pay securely, and let trusted shoppers buy and deliver your groceries right to your door.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/customer/dashboard"
            className="w-full sm:w-auto text-center rounded-xl bg-emerald-600 px-6 py-3.5 text-sm font-semibold text-white shadow-xs hover:bg-emerald-500 transition-all cursor-pointer"
          >
            Start Shopping
          </Link>
          <Link
            href="/shopper/dashboard"
            className="w-full sm:w-auto text-center rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 px-6 py-3.5 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all cursor-pointer"
          >
            Become a Shopper
          </Link>
        </div>
      </div>
    </main>
  );
}