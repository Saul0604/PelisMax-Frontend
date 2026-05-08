"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

type AuthUser = { name: string; email: string | null } | null;

export default function Header() {
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [loginOpen, setLoginOpen] = useState(false);
  const [logoutConfirm, setLogoutConfirm] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<AuthUser>(undefined as unknown as AuthUser);
  const loginRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setUser(d.user ?? null))
      .catch(() => setUser(null));
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (loginRef.current && !loginRef.current.contains(e.target as Node)) {
        setLoginOpen(false);
        setError("");
      }
    }
    if (loginOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [loginOpen]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  }

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    if (!form.email.trim() || !form.password.trim()) {
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
      setLoginOpen(false);
      setForm({ email: "", password: "" });
      const me = await fetch("/api/auth/me").then((r) => r.json());
      setUser(me.user ?? null);
      router.refresh();
    } catch {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setLogoutConfirm(false);
    window.location.href = "/";
  }

  const sessionReady = user !== (undefined as unknown as AuthUser);

  return (
    <>
      {/* ── Modal confirmación de cierre de sesión ── */}
      {logoutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setLogoutConfirm(false)}
          />
          {/* Dialog */}
          <div className="relative bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg p-6 w-full max-w-sm shadow-2xl">
            <h2 className="text-sm font-bold text-[#f2f1ed] uppercase tracking-widest mb-2">
              Cerrar sesión
            </h2>
            <p className="text-sm text-[#838f6f] mb-6">
              ¿Estás seguro de que quieres cerrar tu sesión?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setLogoutConfirm(false)}
                className="text-xs font-semibold uppercase tracking-widest text-[#838f6f] hover:text-[#f2f1ed] transition-colors px-4 py-2 rounded border border-[#2a2a2a] hover:border-[#5a5a5a]"
              >
                Cancelar
              </button>
              <button
                onClick={handleLogout}
                className="text-xs font-semibold uppercase tracking-widest text-[#f2f1ed] bg-[#710014] hover:bg-[#8b0018] transition-colors px-4 py-2 rounded"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="fixed top-0 left-0 right-0 z-50 bg-[#161616]/95 backdrop-blur-sm border-b border-[#2a2a2a]">
        <div className="max-w-7xl mx-auto px-4 h-12 grid grid-cols-3 items-center">

          {/* Logo — col 1, izquierda */}
          <Link href="/" className="justify-self-start shrink-0">
            <span className="font-bold text-[#f2f1ed] tracking-widest text-sm uppercase">
              PelisMax
            </span>
          </Link>

          {/* Nav — col 2, centro */}
          <nav className="hidden sm:flex justify-center items-center gap-8 text-xs font-semibold uppercase tracking-widest text-[#838f6f]">
            <Link href="/" className="hover:text-[#f2f1ed] transition-colors">
              Inicio
            </Link>
            <Link href="/catalogo" className="hover:text-[#f2f1ed] transition-colors">
              Catálogo
            </Link>
            {user && (
              <>
                <Link href="/watchlist" className="hover:text-[#f2f1ed] transition-colors">
                  Watchlist
                </Link>
                <Link href="/listas" className="hover:text-[#f2f1ed] transition-colors">
                  Mis listas
                </Link>
              </>
            )}
          </nav>

          {/* Actions — col 3, derecha */}
          <div className="flex items-center gap-3 justify-self-end" ref={loginRef}>

            {/* Search — hide when login form is open */}
            {!loginOpen && (
              searchOpen ? (
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
                      if (e.key === "Enter" && query.trim()) {
                        setSearchOpen(false);
                        router.push(`/buscar?q=${encodeURIComponent(query.trim())}`);
                        setQuery("");
                      }
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
              )
            )}

            {/* Auth area */}
            {!sessionReady ? null : user ? (
              /* ── Logged in ── */
              <div className="flex items-center gap-3">
                <Link href="/perfil" className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#710014] flex items-center justify-center shrink-0">
                    <span className="text-[10px] font-bold text-[#f2f1ed] uppercase">
                      {user.name.charAt(0)}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-[#f2f1ed] tracking-wide max-w-[120px] truncate hover:text-[#838f6f] transition-colors">
                    {user.name}
                  </span>
                </Link>
                <button
                  onClick={() => setLogoutConfirm(true)}
                  className="text-xs font-semibold uppercase tracking-widest text-[#5a5a5a] hover:text-[#f2f1ed] transition-colors"
                >
                  Salir
                </button>
              </div>
            ) : loginOpen ? (
              /* ── Inline login form ── */
              <form onSubmit={handleSubmit} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => { setLoginOpen(false); setError(""); }}
                  className="text-[#5a5a5a] hover:text-[#f2f1ed] transition-colors mr-1"
                  aria-label="Cerrar"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                <input
                  autoFocus
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Correo"
                  autoComplete="email"
                  disabled={loading}
                  className="bg-[#1e1e1e] border border-[#2a2a2a] focus:border-[#710014] disabled:opacity-50 rounded px-2.5 py-1 text-xs text-[#f2f1ed] placeholder:text-[#5a5a5a] outline-none transition-colors w-36"
                />

                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Contraseña"
                  autoComplete="current-password"
                  disabled={loading}
                  className="bg-[#1e1e1e] border border-[#2a2a2a] focus:border-[#710014] disabled:opacity-50 rounded px-2.5 py-1 text-xs text-[#f2f1ed] placeholder:text-[#5a5a5a] outline-none transition-colors w-32"
                  onKeyDown={(e) => { if (e.key === "Escape") { setLoginOpen(false); setError(""); } }}
                />

                {error && (
                  <span className="text-xs text-white font-medium whitespace-nowrap">{error}</span>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#710014] hover:bg-[#8b0018] disabled:opacity-70 text-[#f2f1ed] text-xs font-semibold uppercase tracking-widest px-3 py-1.5 rounded transition-colors whitespace-nowrap"
                >
                  {loading ? "..." : "Entrar"}
                </button>

                <Link
                  href="/register"
                  className="text-xs font-semibold uppercase tracking-widest text-[#838f6f] hover:text-[#f2f1ed] transition-colors whitespace-nowrap"
                >
                  Registrarse
                </Link>
              </form>
            ) : (
              /* ── Logged out ── */
              <>
                <button
                  onClick={() => { setLoginOpen(true); setSearchOpen(false); }}
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
        </div>
      </header>
    </>
  );
}
