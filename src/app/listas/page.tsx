"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface MovieList {
  _id: string;
  name: string;
  movies: Array<{ movieId: string; title: string; poster: string }>;
  createdAt: string;
}

export default function ListasPage() {
  const [lists, setLists] = useState<MovieList[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetch("/api/lists")
      .then((r) => r.json())
      .then((data) => setLists(Array.isArray(data) ? data : []))
      .catch(() => setLists([]))
      .finally(() => setLoading(false));
  }, []);

  async function handleCreate(e: React.SyntheticEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    setError("");
    try {
      const res = await fetch("/api/lists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error al crear la lista.");
        return;
      }
      setLists((prev) => [data, ...prev]);
      setNewName("");
      setShowForm(false);
    } catch {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setCreating(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#161616] pt-20 px-4">
        <div className="max-w-7xl mx-auto py-12 text-center">
          <p className="text-[#5a5a5a] text-sm">Cargando listas...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#161616] pt-20 px-4">
      <div className="max-w-7xl mx-auto py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-xs font-bold uppercase tracking-widest text-[#838f6f] mb-1">
              Mis Listas
            </h1>
            <p className="text-[#f2f1ed] text-lg font-semibold">Colecciones personalizadas</p>
          </div>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="text-xs font-semibold uppercase tracking-widest text-[#f2f1ed] bg-[#710014] hover:bg-[#8b0018] transition-colors px-4 py-2 rounded"
          >
            {showForm ? "Cancelar" : "+ Nueva lista"}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleCreate} className="mb-8 flex items-start gap-3">
            <div className="flex-1 max-w-sm">
              <input
                autoFocus
                type="text"
                value={newName}
                onChange={(e) => { setNewName(e.target.value); setError(""); }}
                placeholder="Nombre de la lista..."
                maxLength={50}
                disabled={creating}
                className="w-full bg-[#1e1e1e] border border-[#2a2a2a] focus:border-[#710014] disabled:opacity-50 rounded px-3 py-2 text-sm text-[#f2f1ed] placeholder:text-[#5a5a5a] outline-none transition-colors"
              />
              {error && <p className="text-xs text-white font-medium mt-1">{error}</p>}
            </div>
            <button
              type="submit"
              disabled={creating || !newName.trim()}
              className="bg-[#710014] hover:bg-[#8b0018] disabled:opacity-50 disabled:cursor-not-allowed text-[#f2f1ed] text-xs font-semibold uppercase tracking-widest px-4 py-2 rounded transition-colors whitespace-nowrap"
            >
              {creating ? "Creando..." : "Crear"}
            </button>
          </form>
        )}

        {lists.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-[#5a5a5a] text-sm">No tienes listas todavía.</p>
            <p className="text-xs text-[#5a5a5a] mt-2">Crea una y agrega las películas que quieras.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {lists.map((list) => (
              <Link
                key={list._id}
                href={`/listas/${list._id}`}
                className="bg-[#1e1e1e] border border-[#2a2a2a] hover:border-[#5a5a5a] rounded-lg p-4 transition-colors"
              >
                <h3 className="text-sm font-semibold text-[#f2f1ed] mb-1 truncate">{list.name}</h3>
                <p className="text-xs text-[#5a5a5a]">
                  {list.movies?.length ?? 0} {(list.movies?.length ?? 0) === 1 ? "película" : "películas"}
                </p>
                {list.movies && list.movies.length > 0 && (
                  <div className="flex gap-1 mt-3">
                    {list.movies.slice(0, 5).map((m, i) => (
                      <div
                        key={i}
                        className="w-8 h-12 rounded bg-[#2a2a2a] overflow-hidden relative shrink-0"
                      >
                        {m.poster && m.poster !== "N/A" && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={m.poster} alt={m.title} className="w-full h-full object-cover" />
                        )}
                      </div>
                    ))}
                    {(list.movies?.length ?? 0) > 5 && (
                      <div className="w-8 h-12 rounded bg-[#2a2a2a] flex items-center justify-center shrink-0">
                        <span className="text-[9px] text-[#5a5a5a]">+{(list.movies?.length ?? 0) - 5}</span>
                      </div>
                    )}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
