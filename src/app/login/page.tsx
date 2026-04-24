"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  }

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    if (!form.email.trim() || !form.password.trim()) {
      setError("Todos los campos son obligatorios.");
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
        setError(data.message || "Credenciales incorrectas. Intenta de nuevo.");
        return;
      }
      router.push("/");
    } catch {
      setError("No se pudo conectar con el servidor. Verifica tu conexión.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-48px)] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-gradient-to-br from-[#710014]/20 via-[#161616] to-[#161616] pointer-events-none" />

      <div className="relative w-full max-w-md bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg p-8 shadow-2xl">

        <Link
          href="/"
          className="absolute top-4 right-4 text-[#5a5a5a] hover:text-[#f2f1ed] transition-colors"
          aria-label="Cerrar"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </Link>

        <h1 className="text-xs font-bold uppercase tracking-widest text-[#838f6f] mb-6">
          Iniciar sesión
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-[#838f6f] uppercase tracking-widest">
              Correo electrónico
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="correo@ejemplo.com"
              autoComplete="email"
              disabled={loading}
              className="bg-[#161616] border border-[#2a2a2a] focus:border-[#710014] disabled:opacity-50 rounded px-3 py-2.5 text-sm text-[#f2f1ed] placeholder:text-[#5a5a5a] outline-none transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-[#838f6f] uppercase tracking-widest">
              Contraseña
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Tu contraseña"
              autoComplete="current-password"
              disabled={loading}
              className="bg-[#161616] border border-[#2a2a2a] focus:border-[#710014] disabled:opacity-50 rounded px-3 py-2.5 text-sm text-[#f2f1ed] placeholder:text-[#5a5a5a] outline-none transition-colors"
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 text-sm text-white bg-[#710014]/25 border border-[#710014]/60 rounded px-3 py-2.5 font-medium">
              <svg className="w-4 h-4 text-white shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 bg-[#710014] hover:bg-[#8b0018] disabled:opacity-70 disabled:cursor-not-allowed text-[#f2f1ed] font-semibold py-2.5 rounded transition-colors text-sm uppercase tracking-widest flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                Entrando...
              </>
            ) : (
              "Iniciar sesión"
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-[#5a5a5a]">
          ¿No tienes cuenta?{" "}
          <Link href="/register" className="text-[#838f6f] hover:text-[#f2f1ed] transition-colors">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  );
}
