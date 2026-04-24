"use client";

import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#161616]/95 backdrop-blur-sm border-b border-[#2a2a2a]">
      <div className="max-w-7xl mx-auto px-4 h-12 flex items-center justify-between gap-4">

        {/* Logo — solo texto, sin imitación de ningún logo */}
        <Link href="/" className="shrink-0">
          <span className="font-bold text-[#f2f1ed] tracking-widest text-sm uppercase">
            PelisMax
          </span>
        </Link>

        {/* Nav */}
        <nav className="hidden sm:flex items-center gap-6 text-xs font-semibold uppercase tracking-widest text-[#838f6f]">
          <Link href="/" className="hover:text-[#f2f1ed] transition-colors">
            Películas
          </Link>
          <Link href="/search" className="hover:text-[#f2f1ed] transition-colors">
            Buscar
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {searchOpen ? (
            <div className="flex items-center gap-2 bg-[#1e1e1e] border border-[#2a2a2a] rounded px-3 py-1">
              <input
                autoFocus
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar película..."
                className="bg-transparent text-[#f2f1ed] text-sm outline-none w-40 placeholder:text-[#5a5a5a]"
                onKeyDown={(e) => {
                  if (e.key === "Escape") { setSearchOpen(false); setQuery(""); }
                }}
              />
              <button onClick={() => { setSearchOpen(false); setQuery(""); }}>
                <svg className="w-4 h-4 text-[#838f6f]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ) : (
            <button
              onClick={() => setSearchOpen(true)}
              className="text-[#838f6f] hover:text-[#f2f1ed] transition-colors"
              aria-label="Buscar"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          )}

          <Link
            href="/login"
            className="text-xs font-semibold uppercase tracking-widest text-[#838f6f] hover:text-[#f2f1ed] transition-colors"
          >
            Iniciar sesión
          </Link>
          <Link
            href="/register"
            className="text-xs font-semibold uppercase tracking-widest text-[#f2f1ed] bg-[#710014] hover:bg-[#8b0018] transition-colors px-3 py-1.5 rounded"
          >
            Registrarse
          </Link>
        </div>
      </div>
    </header>
  );
}
