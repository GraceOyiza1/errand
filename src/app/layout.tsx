import type { Metadata } from "next";
import "./globals.css"; // Links Tailwind to your whole application

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
    <html lang="en" className="h-full antialiased" style={{ colorScheme: 'light' }}>
      <body className="bg-slate-50 text-slate-900 min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}