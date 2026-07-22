import React from 'react';

const chartData = [
    { label: 'Mon', value: 45 },
    { label: 'Tue', value: 55 },
    { label: 'Wed', value: 85 },
    { label: 'Thu', value: 65 },
    { label: 'Fri', value: 95 },
    { label: 'Sat', value: 100 },
    { label: 'Sun', value: 75 },
];

export default function RevenueChart() {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Revenue & Orders Overview</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Weekly performance metrics</p>
                </div>
                <select className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    <option>This Week</option>
                    <option>Last Week</option>
                    <option>This Month</option>
                </select>
            </div>

            {/* Custom CSS Bar Chart */}
            <div className="mt-8 flex h-64 items-end gap-2 sm:gap-6">
                {chartData.map((data, index) => (
                    <div key={index} className="group relative flex flex-1 flex-col items-center justify-end">
                        <div className="peer relative w-full max-w-[48px]">
                            {/* Hover Tooltip */}
                            <div className="pointer-events-none absolute -top-12 left-1/2 -translate-x-1/2 rounded-md bg-slate-800 px-3 py-1.5 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 dark:bg-white dark:text-slate-900">
                                ${data.value * 120}
                            </div>
                            {/* Bar */}
                            <div
                                className="w-full rounded-t-lg bg-gradient-to-t from-blue-600 to-cyan-400 transition-all duration-500 ease-out hover:brightness-110"
                                style={{ height: `${data.value}%` }}
                            ></div>
                        </div>
                        <span className="mt-4 text-xs font-medium text-slate-500 dark:text-slate-400">
                            {data.label}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
