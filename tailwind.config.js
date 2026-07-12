/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    darkMode: false,
    theme: {
        extend: {
            colors: {
                'errand-obsidian': '#131616',
                'errand-leaf': '#1E4631',
                'errand-clay': '#C05C3E',
                'errand-ochre': '#C4B5FD', // Faint purple instead of orange
                'errand-alabaster': '#FAF8F5',
            }
        },
    },
    plugins: [],
};
