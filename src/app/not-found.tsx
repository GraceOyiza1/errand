import Link from "next/link";
import { MoveLeft, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-errand-alabaster dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center transition-colors duration-300">
      <div className="relative">
        <h1 className="text-[120px] md:text-[180px] font-extrabold text-slate-200 dark:text-slate-800 tracking-tighter leading-none select-none">
          404
        </h1>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-full shadow-lg border border-slate-100 dark:border-slate-800">
            <Search className="w-12 h-12 md:w-16 md:h-16 text-errand-leaf dark:text-emerald-500" />
          </div>
        </div>
      </div>
      
      <div className="mt-8 max-w-md z-10">
        <h2 className="text-3xl md:text-4xl font-bold text-errand-obsidian dark:text-slate-50 mb-4 tracking-tight">
          Page Not Found
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8 text-lg">
          We couldn't find the market aisle you're looking for. The page might have been moved, deleted, or perhaps it never existed.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full sm:w-auto bg-errand-leaf hover:bg-emerald-800 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            <MoveLeft className="w-5 h-5" />
            Back to Home
          </Link>
          <Link
            href="/customer/dashboard"
            className="flex items-center justify-center w-full sm:w-auto bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 hover:border-errand-leaf dark:hover:border-emerald-500 text-slate-700 dark:text-slate-300 font-bold py-3 px-8 rounded-xl transition-all hover:text-errand-leaf dark:hover:text-emerald-500"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
