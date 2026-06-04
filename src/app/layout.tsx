import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css"; // Links Tailwind to your whole application

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Your custom dashboard metadata
export const metadata: Metadata = {
  title: 'Errand - Market Shopping Delivered',
  description: 'On-demand market shopping and logistics managed from stall to door.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="bg-slate-50 text-slate-900 min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}