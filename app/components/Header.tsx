"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navigation = [
  { name: "Home", href: "/" },
  { name: "Account", href: "/account" },
  { name: "Vaults", href: "/vaults" },
  { name: "Liquidations", href: "/liquidations" },
  {
    name: "Explorer",
    href: "/explorer/assets",
    submenu: [
      { name: "Assets", href: "/explorer/assets" },
      { name: "Spot", href: "/explorer/spot" },
      { name: "EVM", href: "/explorer/evm" },
    ],
  },
];

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="glass sticky top-0 z-50 border-b border-white/20 rounded-none">
      <div className="app-container">
        <div className="flex items-center justify-between h-14 md:h-16">
          {/* Logo / brand */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-brand-600 to-purple-600 rounded-lg md:rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg md:text-xl">P</span>
            </div>
            <span className="hidden sm:block text-lg md:text-xl font-bold gradient-text">
              Portfolio Checker
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navigation.map((item) => {
              const active =
                pathname === item.href ||
                (item.submenu && item.submenu.some((s) => pathname === s.href));

              if (!item.submenu) {
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3 lg:px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                      active ? "bg-brand-100 text-brand-700" : "text-gray-800 hover:bg-gray-100"
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              }

              return (
                <div key={item.name} className="relative group">
                  <button
                    className={`px-3 lg:px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                      active ? "bg-brand-100 text-brand-700" : "text-gray-800 hover:bg-gray-100"
                    }`}
                  >
                    {item.name}
                    <svg className="inline ml-1 w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className="absolute top-full left-0 mt-2 glass rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    {item.submenu.map((s) => (
                      <Link
                        key={s.href}
                        href={s.href}
                        className={`block px-4 py-3 text-sm transition-colors ${
                          pathname === s.href ? "bg-brand-100 text-brand-700" : "text-gray-800 hover:bg-gray-100"
                        }`}
                      >
                        {s.name}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </nav>

          {/* Mobile toggle */}
          <button
            onClick={() => setOpen((v) => !v)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {open ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {open && (
          <nav className="md:hidden border-t border-gray-200 pb-3 pt-2 space-y-1">
            {navigation.map((item) =>
              item.submenu ? (
                <div key={item.name} className="space-y-1">
                  <div className="px-3 py-2 text-sm font-semibold text-gray-900">{item.name}</div>
                  {item.submenu.map((s) => (
                    <Link
                      key={s.href}
                      href={s.href}
                      onClick={() => setOpen(false)}
                      className={`block px-5 py-2 rounded-lg text-sm transition-colors ${
                        pathname === s.href ? "bg-brand-100 text-brand-700" : "text-gray-800 hover:bg-gray-100"
                      }`}
                    >
                      {s.name}
                    </Link>
                  ))}
                </div>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                    pathname === item.href ? "bg-brand-100 text-brand-700" : "text-gray-800 hover:bg-gray-100"
                  }`}
                >
                  {item.name}
                </Link>
              )
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
