"use client";

import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#14181c]/90 backdrop-blur-sm border-b border-[#374151]/50">
      <div className="max-w-7xl mx-auto px-4 h-12 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="flex gap-1">
            <span className="w-3 h-3 rounded-full bg-[#00c030]" />
            <span className="w-3 h-3 rounded-full bg-[#ff8000]" />
            <span className="w-3 h-3 rounded-full bg-[#40bcf4]" />
          </div>
          <span className="font-bold text-white tracking-wide text-sm uppercase">
            PelisMax
          </span>
        </Link>

        {/* Nav */}
        <nav className="hidden sm:flex items-center gap-6 text-xs font-semibold uppercase tracking-widest text-[#9ca3af]">
          <Link href="/" className="hover:text-white transition-colors">
            Películas
          </Link>
          <Link href="/search" className="hover:text-white transition-colors">
            Buscar
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {searchOpen ? (
            <div className="flex items-center gap-2 bg-[#1f2937] border border-[#374151] rounded px-3 py-1">
              <input
                autoFocus
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar película..."
                className="bg-transparent text-white text-sm outline-none w-40 placeholder:text-[#6b7280]"
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setSearchOpen(false);
                    setQuery("");
                  }
                }}
              />
              <button onClick={() => { setSearchOpen(false); setQuery(""); }}>
                <svg className="w-4 h-4 text-[#9ca3af]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ) : (
            <button
              onClick={() => setSearchOpen(true)}
              className="text-[#9ca3af] hover:text-white transition-colors"
              aria-label="Buscar"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          )}

          <Link
            href="/login"
            className="text-xs font-semibold uppercase tracking-widest text-[#9ca3af] hover:text-white transition-colors"
          >
            Iniciar sesión
          </Link>
          <Link
            href="/register"
            className="text-xs font-semibold uppercase tracking-widest text-white bg-[#00c030] hover:bg-[#00e054] transition-colors px-3 py-1.5 rounded"
          >
            Registrarse
          </Link>
        </div>
      </div>
    </header>
  );
}
