"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";

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
  const [instantResults, setInstantResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setUser(d.user ?? null))
      .catch(() => setUser(null));
  }, []);

  // Instant Search Logic
  useEffect(() => {
    if (!query.trim() || query.length < 3) {
      setInstantResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/movies/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setInstantResults(data.movies?.slice(0, 6) || []);
        }
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (loginRef.current && !loginRef.current.contains(e.target as Node)) {
        setLoginOpen(false);
        setError("");
      }
      // Close instant results if clicking outside
      if (searchOpen && !(e.target as HTMLElement).closest(".search-container")) {
        setInstantResults([]);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [loginOpen, searchOpen]);

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
        <div className="max-w-7xl mx-auto px-4 h-16 grid grid-cols-3 items-center">

          {/* Logo — col 1, izquierda */}
          <Link href="/" className="justify-self-start shrink-0">
            <span className="font-bold text-[#f2f1ed] tracking-widest text-lg uppercase">
              PelisMax
            </span>
          </Link>

          {/* Nav — col 2, centro */}
          <nav className="hidden sm:flex justify-center items-center gap-8 text-sm font-semibold uppercase tracking-widest text-[#838f6f]">
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
          <div className="flex items-center gap-4 justify-self-end" ref={loginRef}>

            {/* Search — hide when login form is open */}
            {!loginOpen && (
              searchOpen ? (
                <div className="relative search-container">
                  <div className="flex items-center gap-2 bg-[#1e1e1e] border border-[#2a2a2a] rounded px-3 py-1.5 min-w-[240px]">
                    <Search size={16} className="text-[#5a5a5a]" />
                    <input
                      autoFocus
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Buscar película..."
                      className="bg-transparent text-[#f2f1ed] text-sm outline-none w-48 placeholder:text-[#5a5a5a]"
                      onKeyDown={(e) => {
                        if (e.key === "Escape") { setSearchOpen(false); setQuery(""); setInstantResults([]); }
                        if (e.key === "Enter" && query.trim()) {
                          setSearchOpen(false);
                          setInstantResults([]);
                          router.push(`/buscar?q=${encodeURIComponent(query.trim())}`);
                          setQuery("");
                        }
                      }}
                    />
                    {isSearching ? (
                      <div className="w-4 h-4 border-2 border-[#710014] border-t-transparent rounded-full animate-spin" />
                    ) : query && (
                      <button onClick={() => { setQuery(""); setInstantResults([]); }}>
                        <X size={16} className="text-[#5a5a5a] hover:text-[#f2f1ed]" />
                      </button>
                    )}
                  </div>

                  {/* Resultados Instantáneos */}
                  {instantResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg shadow-2xl overflow-hidden z-[60]">
                      <div className="p-2">
                        {instantResults.map((movie) => (
                          <Link
                            key={movie.imdbID}
                            href={`/movie/${movie.imdbID}`}
                            onClick={() => {
                              setSearchOpen(false);
                              setQuery("");
                              setInstantResults([]);
                            }}
                            className="flex items-center gap-3 p-2 hover:bg-[#2a2a2a] rounded transition-colors group"
                          >
                            <div className="w-10 h-14 bg-[#161616] rounded overflow-hidden shrink-0 border border-[#2a2a2a]">
                              {movie.Poster && movie.Poster !== "N/A" ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={movie.Poster} alt={movie.Title} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Search size={12} className="text-[#5a5a5a]" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-[#f2f1ed] truncate group-hover:text-[#710014] transition-colors">
                                {movie.Title}
                              </p>
                              <p className="text-[10px] text-[#838f6f]">{movie.Year}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                      <Link
                        href={`/buscar?q=${encodeURIComponent(query)}`}
                        onClick={() => { setSearchOpen(false); setQuery(""); setInstantResults([]); }}
                        className="block bg-[#161616] p-2.5 text-center text-[10px] font-bold uppercase tracking-widest text-[#838f6f] hover:text-[#f2f1ed] transition-colors border-t border-[#2a2a2a]"
                      >
                        Ver todos los resultados
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setSearchOpen(true)}
                  className="text-[#838f6f] hover:text-[#f2f1ed] transition-colors"
                  aria-label="Buscar"
                >
                  <Search size={20} />
                </button>
              )
            )}

            {/* Auth area */}
            {!sessionReady ? null : user ? (
              /* ── Logged in ── */
              <div className="flex items-center gap-4">
                <Link href="/perfil" className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#710014] flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-[#f2f1ed] uppercase">
                      {user.name.charAt(0)}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-[#f2f1ed] tracking-wide max-w-[140px] truncate hover:text-[#838f6f] transition-colors">
                    {user.name}
                  </span>
                </Link>
                <button
                  onClick={() => setLogoutConfirm(true)}
                  className="text-sm font-semibold uppercase tracking-widest text-[#5a5a5a] hover:text-[#f2f1ed] transition-colors"
                >
                  Salir
                </button>
              </div>
            ) : loginOpen ? (
              /* ── Inline login form ── */
              <form onSubmit={handleSubmit} className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => { setLoginOpen(false); setError(""); }}
                  className="text-[#5a5a5a] hover:text-[#f2f1ed] transition-colors mr-1"
                  aria-label="Cerrar"
                >
                  <X size={18} />
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
                  className="bg-[#1e1e1e] border border-[#2a2a2a] focus:border-[#710014] disabled:opacity-50 rounded px-3 py-2 text-sm text-[#f2f1ed] placeholder:text-[#5a5a5a] outline-none transition-colors w-40"
                />

                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Contraseña"
                  autoComplete="current-password"
                  disabled={loading}
                  className="bg-[#1e1e1e] border border-[#2a2a2a] focus:border-[#710014] disabled:opacity-50 rounded px-3 py-2 text-sm text-[#f2f1ed] placeholder:text-[#5a5a5a] outline-none transition-colors w-36"
                  onKeyDown={(e) => { if (e.key === "Escape") { setLoginOpen(false); setError(""); } }}
                />

                {error && (
                  <span className="text-xs text-white font-medium whitespace-nowrap">{error}</span>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#710014] hover:bg-[#8b0018] disabled:opacity-70 text-[#f2f1ed] text-sm font-semibold uppercase tracking-widest px-4 py-2 rounded transition-colors whitespace-nowrap"
                >
                  {loading ? "..." : "Entrar"}
                </button>

                <Link
                  href="/register"
                  className="text-sm font-semibold uppercase tracking-widest text-[#838f6f] hover:text-[#f2f1ed] transition-colors whitespace-nowrap"
                >
                  Registrarse
                </Link>
              </form>
            ) : (
              /* ── Logged out ── */
              <>
                <button
                  onClick={() => { setLoginOpen(true); setSearchOpen(false); }}
                  className="text-sm font-semibold uppercase tracking-widest text-[#838f6f] hover:text-[#f2f1ed] transition-colors"
                >
                  Iniciar sesión
                </button>
                <Link
                  href="/register"
                  className="text-sm font-semibold uppercase tracking-widest text-[#f2f1ed] bg-[#710014] hover:bg-[#8b0018] transition-colors px-4 py-2 rounded"
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
