"use client";

import { useState } from "react";
import Link from "next/link";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      setError("Todos los campos son obligatorios.");
      return;
    }
    if (form.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Error al crear la cuenta. Intenta de nuevo.");
        return;
      }
      setSuccess(true);
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

        {success ? (
          /* ── Pantalla de éxito ── */
          <div className="flex flex-col items-center text-center gap-5 py-4">
            <div className="w-14 h-14 rounded-full bg-[#710014]/20 border border-[#710014]/40 flex items-center justify-center">
              <svg className="w-7 h-7 text-[#710014]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <div>
              <h2 className="text-base font-bold text-[#f2f1ed] uppercase tracking-widest mb-1">
                ¡Cuenta creada!
              </h2>
              <p className="text-sm text-[#838f6f]">
                Bienvenido, <span className="text-[#f2f1ed]">{form.name}</span>.
                <br />
                Ya puedes acceder al catálogo de películas.
              </p>
            </div>

            <Link
              href="/"
              className="w-full text-center bg-[#710014] hover:bg-[#8b0018] text-[#f2f1ed] font-semibold py-2.5 rounded transition-colors text-sm uppercase tracking-widest"
            >
              Ver catálogo
            </Link>
          </div>
        ) : (
          /* ── Formulario ── */
          <>
            <h1 className="text-xs font-bold uppercase tracking-widest text-[#838f6f] mb-6">
              Crear cuenta
            </h1>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-[#838f6f] uppercase tracking-widest">
                  Nombre
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Tu nombre"
                  autoComplete="name"
                  disabled={loading}
                  className="bg-[#161616] border border-[#2a2a2a] focus:border-[#710014] disabled:opacity-50 rounded px-3 py-2.5 text-sm text-[#f2f1ed] placeholder:text-[#5a5a5a] outline-none transition-colors"
                />
              </div>

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
                  placeholder="Mínimo 6 caracteres"
                  autoComplete="new-password"
                  disabled={loading}
                  className="bg-[#161616] border border-[#2a2a2a] focus:border-[#710014] disabled:opacity-50 rounded px-3 py-2.5 text-sm text-[#f2f1ed] placeholder:text-[#5a5a5a] outline-none transition-colors"
                />
              </div>

              {error && (
                <div className="flex items-start gap-2 text-xs text-[#f2f1ed] bg-[#710014]/15 border border-[#710014]/40 rounded px-3 py-2.5">
                  <svg className="w-4 h-4 text-[#710014] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  </svg>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-2 relative bg-[#710014] hover:bg-[#8b0018] disabled:opacity-70 disabled:cursor-not-allowed text-[#f2f1ed] font-semibold py-2.5 rounded transition-colors text-sm uppercase tracking-widest flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                    Creando cuenta...
                  </>
                ) : (
                  "Registrarse"
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-[#5a5a5a]">
              ¿Ya tienes cuenta?{" "}
              <Link href="/login" className="text-[#838f6f] hover:text-[#f2f1ed] transition-colors">
                Inicia sesión
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
