import type { Metadata } from "next";
import "./globals.css";
import Header from "./components/Header";

export const metadata: Metadata = {
  title: "Portfolio Checker",
  description: "Professional portfolio management and analytics for Hyperliquid traders",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="antialiased h-full flex flex-col">
        <Header />
        <main className="flex-1 w-full pt-6 md:pt-8">
          <div className="app-container space-y-10 md:space-y-12">
            {children}
          </div>
        </main>
        <footer className="glass border-t border-white/20 mt-auto rounded-none">
          <div className="app-container py-4 md:py-6">
            <p className="text-center text-xs md:text-sm text-gray-600">
              Built with QuickNode Hyperliquid API • Powered by Next.js 16
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
