"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface User { name: string; email: string; }

export default function Header() {
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem("pelismax_user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  useEffect(() => {
    if (loginOpen) setTimeout(() => emailRef.current?.focus(), 50);
  }, [loginOpen]);

  function openLogin() {
    setLoginOpen(true);
    setSearchOpen(false);
    setError("");
  }

  function closeLogin() {
    setLoginOpen(false);
    setForm({ email: "", password: "" });
    setError("");
  }

  async function handleLogin(e: SubmitEvent | { preventDefault(): void }) {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError("Completa ambos campos.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Credenciales incorrectas.");
        return;
      }
      const userData = { name: data.user?.name ?? data.name ?? "Usuario", email: form.email };
      localStorage.setItem("pelismax_user", JSON.stringify(userData));
      setUser(userData);
      closeLogin();
      router.refresh();
    } catch {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    localStorage.removeItem("pelismax_user");
    setUser(null);
    router.refresh();
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#161616]/95 backdrop-blur-sm border-b border-[#2a2a2a]">
      <div className="max-w-7xl mx-auto px-4 h-12 flex items-center gap-4">

        {/* Logo */}
        <Link href="/" className="shrink-0 mr-2">
          <span className="font-bold text-[#f2f1ed] tracking-widest text-sm uppercase">
            PelisMax
          </span>
        </Link>

        {loginOpen ? (
          /* ── Panel de login inline (ocupa todo el espacio disponible) ── */
          <form
            onSubmit={handleLogin}
            className="flex-1 flex items-center gap-2 sm:gap-3"
          >
            {/* Cerrar */}
            <button
              type="button"
              onClick={closeLogin}
              className="text-[#5a5a5a] hover:text-[#f2f1ed] transition-colors shrink-0"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <input
              ref={emailRef}
              type="email"
              value={form.email}
              onChange={(e) => { setForm(p => ({ ...p, email: e.target.value })); setError(""); }}
              placeholder="Correo electrónico"
              className="flex-1 min-w-0 bg-[#f2f1ed] text-[#161616] text-sm px-3 py-1.5 rounded outline-none placeholder:text-[#5a5a5a]"
            />

            <input
              type="password"
              value={form.password}
              onChange={(e) => { setForm(p => ({ ...p, password: e.target.value })); setError(""); }}
              placeholder="Contraseña"
              className="flex-1 min-w-0 bg-[#f2f1ed] text-[#161616] text-sm px-3 py-1.5 rounded outline-none placeholder:text-[#5a5a5a]"
            />

            {error && (
              <span className="text-xs text-[#710014] shrink-0 hidden sm:block">{error}</span>
            )}

            <button
              type="submit"
              disabled={loading}
              className="shrink-0 bg-[#710014] hover:bg-[#8b0018] disabled:opacity-60 text-[#f2f1ed] text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded transition-colors flex items-center gap-1.5"
            >
              {loading ? (
                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
              ) : "Entrar"}
            </button>

            <Link
              href="/register"
              onClick={closeLogin}
              className="shrink-0 text-xs text-[#838f6f] hover:text-[#f2f1ed] transition-colors hidden sm:block"
            >
              ¿Sin cuenta?
            </Link>
          </form>
        ) : (
          /* ── Nav normal ── */
          <>
            <nav className="hidden sm:flex items-center gap-6 text-xs font-semibold uppercase tracking-widest text-[#838f6f] flex-1">
              <Link href="/" className="hover:text-[#f2f1ed] transition-colors">Películas</Link>
              <Link href="/search" className="hover:text-[#f2f1ed] transition-colors">Buscar</Link>
            </nav>

            <div className="flex items-center gap-3 ml-auto">
              {/* Buscador */}
              {searchOpen ? (
                <div className="flex items-center gap-2 bg-[#1e1e1e] border border-[#2a2a2a] rounded px-3 py-1">
                  <input
                    autoFocus
                    type="text"
                    placeholder="Buscar película..."
                    className="bg-transparent text-[#f2f1ed] text-sm outline-none w-36 placeholder:text-[#5a5a5a]"
                    onKeyDown={(e) => e.key === "Escape" && setSearchOpen(false)}
                  />
                  <button onClick={() => setSearchOpen(false)}>
                    <svg className="w-4 h-4 text-[#838f6f]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <button onClick={() => { setSearchOpen(true); setLoginOpen(false); }} className="text-[#838f6f] hover:text-[#f2f1ed] transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              )}

              {user ? (
                /* Usuario autenticado */
                <div className="flex items-center gap-2.5">
                  {/* Círculo con inicial — indicador visual de sesión */}
                  <div className="w-6 h-6 rounded-full bg-[#710014] flex items-center justify-center shrink-0">
                    <span className="text-[10px] font-bold text-[#f2f1ed] uppercase">
                      {user.name.charAt(0)}
                    </span>
                  </div>
                  <span className="text-xs text-[#f2f1ed] hidden sm:block tracking-wide">
                    {user.name}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="text-xs font-semibold uppercase tracking-widest text-[#5a5a5a] hover:text-[#f2f1ed] transition-colors ml-1"
                  >
                    Salir
                  </button>
                </div>
              ) : (
                /* No autenticado */
                <>
                  <button
                    onClick={openLogin}
                    className="text-xs font-semibold uppercase tracking-widest text-[#838f6f] hover:text-[#f2f1ed] transition-colors"
                  >
                    Iniciar sesión
                  </button>
                  <Link
                    href="/register"
                    className="text-xs font-semibold uppercase tracking-widest text-[#f2f1ed] bg-[#710014] hover:bg-[#8b0018] transition-colors px-3 py-1.5 rounded"
                  >
                    Registrarse
                  </Link>
                </>
              )}
            </div>
          </>
        )}
      </div>

      {/* Error en móvil (debajo del header) */}
      {loginOpen && error && (
        <div className="sm:hidden bg-[#710014]/20 border-t border-[#710014]/30 px-4 py-2 text-xs text-[#f2f1ed]">
          {error}
        </div>
      )}
    </header>
  );
}
