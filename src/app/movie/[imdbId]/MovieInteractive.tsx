"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Star, Bookmark, List, Trash2, X } from "lucide-react";

interface Comment {
  _id: string;
  userId: { _id: string; name: string } | string;
  text: string;
  createdAt: string;
}

interface Props {
  imdbId: string;
  movieTitle: string;
  moviePoster: string;
  initialAverage: number;
  initialVotes: number;
  initialUserScore: number | null;
  initialComments: Comment[];
  currentUserId: string | null;
}

function StarRating({
  value,
  onChange,
  disabled,
}: {
  value: number;
  onChange: (v: number) => void;
  disabled: boolean;
}) {
  const [hovered, setHovered] = useState(0);
  const active = hovered || value;

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={disabled}
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="disabled:cursor-not-allowed outline-none"
          aria-label={`${star} estrellas`}
        >
          <Star
            size={28}
            className={`transition-all duration-200 ${
              star <= active ? "text-[#710014] fill-[#710014]" : "text-[#2a2a2a]"
            } ${!disabled ? "hover:scale-110 active:scale-95" : ""}`}
          />
        </button>
      ))}
    </div>
  );
}

export default function MovieInteractive({
  imdbId,
  movieTitle,
  moviePoster,
  initialAverage,
  initialVotes,
  initialUserScore,
  initialComments,
  currentUserId,
}: Props) {
  const [average, setAverage] = useState(initialAverage);
  const [votes, setVotes] = useState(initialVotes);
  const [userScore, setUserScore] = useState(initialUserScore ?? 0);
  const [ratingLoading, setRatingLoading] = useState(false);

  // Watchlist state
  const [inWatchlist, setInWatchlist] = useState(false);
  const [watchlistLoading, setWatchlistLoading] = useState(false);

  useEffect(() => {
    if (!currentUserId) return;
    fetch("/api/watchlist")
      .then((r) => r.json())
      .then((data: Array<{ id: string }>) => {
        if (Array.isArray(data)) {
          setInWatchlist(data.some((e) => e.id === imdbId));
        }
      })
      .catch(() => {});
  }, [imdbId, currentUserId]);

  async function handleWatchlist() {
    if (!currentUserId) { setShowLoginPrompt(true); return; }
    setWatchlistLoading(true);
    try {
      if (inWatchlist) {
        const res = await fetch(`/api/watchlist/${imdbId}`, { method: "DELETE" });
        if (res.ok) setInWatchlist(false);
      } else {
        const res = await fetch("/api/watchlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ movieId: imdbId, posterPath: moviePoster }),
        });
        if (res.ok) setInWatchlist(true);
      }
    } finally {
      setWatchlistLoading(false);
    }
  }

  // Fetch userScore client-side — backend no longer sends it for public requests
  useEffect(() => {
    if (!currentUserId) return;
    fetch(`/api/rate/${imdbId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.userScore != null) setUserScore(d.userScore);
        if (d.averageScore != null) setAverage(d.averageScore);
        if (d.totalVotes != null) setVotes(d.totalVotes);
      })
      .catch(() => {});
  }, [imdbId, currentUserId]);

  // Lists state
  interface UserList { _id: string; name: string }
  const [userLists, setUserLists] = useState<UserList[]>([]);
  const [listsOpen, setListsOpen] = useState(false);
  const [listAdding, setListAdding] = useState<string | null>(null);
  const [listSuccess, setListSuccess] = useState("");

  useEffect(() => {
    if (!currentUserId) return;
    fetch("/api/lists")
      .then((r) => r.json())
      .then((data: UserList[]) => { if (Array.isArray(data)) setUserLists(data); })
      .catch(() => {});
  }, [currentUserId]);

  async function handleAddToList(listId: string) {
    setListAdding(listId);
    try {
      const res = await fetch(`/api/lists/${listId}/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          movieId: imdbId,
          title: movieTitle,
          poster: moviePoster,
          releaseYear: "",
        }),
      });
      if (res.ok) {
        const list = userLists.find((l) => l._id === listId);
        setListSuccess(`Agregada a "${list?.name ?? "la lista"}"`);
        setListsOpen(false);
        setTimeout(() => setListSuccess(""), 3000);
      }
    } finally {
      setListAdding(null);
    }
  }

  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [commentText, setCommentText] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentError, setCommentError] = useState("");
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  async function handleRate(score: number) {
    if (!currentUserId) {
      setShowLoginPrompt(true);
      return;
    }
    setRatingLoading(true);
    try {
      const res = await fetch("/api/rate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imdbId, score }),
      });
      if (res.ok) {
        // Refresh stats
        const stats = await fetch(`/api/rate/${imdbId}`).then((r) => r.json());
        setAverage(stats.averageScore ?? average);
        setVotes(stats.totalVotes ?? votes);
        setUserScore(score);
      }
    } finally {
      setRatingLoading(false);
    }
  }

  async function handleComment(e: React.SyntheticEvent) {
    e.preventDefault();
    if (!currentUserId || !commentText.trim()) return;
    if (commentText.length > 250) {
      setCommentError("Máximo 250 caracteres.");
      return;
    }
    setCommentLoading(true);
    setCommentError("");
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ movieId: imdbId, movieTitle, text: commentText.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCommentError(data.msg || "Error al publicar comentario.");
        return;
      }
      setComments((prev) => [data.comment, ...prev]);
      setCommentText("");
    } catch {
      setCommentError("No se pudo conectar con el servidor.");
    } finally {
      setCommentLoading(false);
    }
  }

  // Review state
  const [reviewContent, setReviewContent] = useState("");
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState(false);

  async function handleReview(e: React.SyntheticEvent) {
    e.preventDefault();
    if (!currentUserId || !reviewContent.trim() || reviewRating === 0) return;
    setReviewLoading(true);
    setReviewError("");
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          movieId: imdbId,
          movieTitle,
          moviePoster,
          movieYear: "",
          content: reviewContent.trim(),
          rating: reviewRating,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setReviewError(data.error || "Error al publicar la reseña.");
        return;
      }
      setReviewContent("");
      setReviewRating(0);
      setReviewSuccess(true);
      setTimeout(() => setReviewSuccess(false), 3000);
    } catch {
      setReviewError("No se pudo conectar con el servidor.");
    } finally {
      setReviewLoading(false);
    }
  }

  async function handleDeleteComment(commentId: string) {
    const res = await fetch(`/api/comments/${commentId}`, { method: "DELETE" });
    if (res.ok) {
      setComments((prev) => prev.filter((c) => c._id !== commentId));
    }
  }

  function getCommentUserId(c: Comment): string {
    return typeof c.userId === "string" ? c.userId : c.userId._id;
  }

  function getCommentUserName(c: Comment): string {
    return typeof c.userId === "string" ? "Usuario" : c.userId.name;
  }

  return (
    <div className="mt-10 space-y-10">
      {/* ── Rating ── */}
      <section>
        <h2 className="text-xs font-bold uppercase tracking-widest text-[#838f6f] mb-4">
          Calificación de la comunidad
        </h2>

        <div className="flex items-center gap-6 flex-wrap">
          {/* Promedio */}
          <div className="flex items-center gap-3 bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg px-5 py-3">
            <span className="text-3xl font-bold text-[#f2f1ed]">
              {average > 0 ? average.toFixed(1) : "—"}
            </span>
            <div>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={16}
                    className={`${s <= Math.round(average) ? "text-[#710014] fill-[#710014]" : "text-[#2a2a2a]"}`}
                  />
                ))}
              </div>
              <p className="text-xs text-[#5a5a5a] mt-0.5">
                {votes} {votes === 1 ? "voto" : "votos"}
              </p>
            </div>
          </div>

          {/* Tu calificación */}
          <div>
            <p className="text-xs text-[#838f6f] mb-2 uppercase tracking-widest">
              Tu calificación
            </p>
            <StarRating
              value={userScore}
              onChange={handleRate}
              disabled={ratingLoading}
            />
            {/* Prompt de login al tocar estrellas sin sesión */}
            {showLoginPrompt && !currentUserId && (
              <div className="mt-3 flex items-center gap-3 bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg px-4 py-3">
                <p className="text-xs text-[#838f6f]">
                  Para calificar necesitas una cuenta.
                </p>
                <Link
                  href="/login"
                  className="text-xs font-semibold uppercase tracking-widest text-[#f2f1ed] hover:text-[#838f6f] transition-colors whitespace-nowrap"
                >
                  Iniciar sesión
                </Link>
                <Link
                  href="/register"
                  className="text-xs font-semibold uppercase tracking-widest text-[#f2f1ed] bg-[#710014] hover:bg-[#8b0018] transition-colors px-3 py-1.5 rounded whitespace-nowrap"
                >
                  Registrarse
                </Link>
                <button
                  onClick={() => setShowLoginPrompt(false)}
                  className="text-[#5a5a5a] hover:text-[#f2f1ed] transition-colors ml-auto"
                >
                  <X size={14} />
                </button>
              </div>
            )}
          </div>
          {/* Watchlist */}
          <div>
            <p className="text-xs text-[#838f6f] mb-2 uppercase tracking-widest">
              Watchlist
            </p>
            <button
              onClick={handleWatchlist}
              disabled={watchlistLoading}
              className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-widest px-4 py-2 rounded border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                inWatchlist
                  ? "bg-[#710014] border-[#710014] text-[#f2f1ed] hover:bg-[#8b0018]"
                  : "border-[#2a2a2a] text-[#838f6f] hover:border-[#5a5a5a] hover:text-[#f2f1ed]"
              }`}
            >
              <Bookmark size={14} fill={inWatchlist ? "currentColor" : "none"} />
              {inWatchlist ? "En watchlist" : "Agregar a watchlist"}
            </button>
          </div>

          {/* Agregar a lista */}
          {currentUserId && (
            <div className="relative">
              <p className="text-xs text-[#838f6f] mb-2 uppercase tracking-widest">
                Mis listas
              </p>
              <button
                onClick={() => setListsOpen((v) => !v)}
                className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest px-4 py-2 rounded border border-[#2a2a2a] text-[#838f6f] hover:border-[#5a5a5a] hover:text-[#f2f1ed] transition-colors"
              >
                <List size={14} />
                Agregar a lista
              </button>

              {listsOpen && (
                <div className="absolute top-full mt-1 left-0 z-20 bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg shadow-lg py-1 min-w-[180px]">
                  {userLists.length === 0 ? (
                    <div className="px-4 py-3">
                      <p className="text-xs text-[#5a5a5a]">No tienes listas todavía.</p>
                      <Link
                        href="/listas"
                        className="text-xs text-[#f2f1ed] hover:text-[#838f6f] transition-colors mt-1 block"
                      >
                        Crear una lista →
                      </Link>
                    </div>
                  ) : (
                    <>
                      {userLists.map((list) => (
                        <button
                          key={list._id}
                          onClick={() => handleAddToList(list._id)}
                          disabled={listAdding === list._id}
                          className="w-full text-left px-4 py-2 text-xs text-[#f2f1ed] hover:bg-[#2a2a2a] transition-colors disabled:opacity-50 truncate"
                        >
                          {list.name}
                        </button>
                      ))}
                      <div className="border-t border-[#2a2a2a] mt-1 pt-1">
                        <Link
                          href="/listas"
                          className="block px-4 py-2 text-xs text-[#838f6f] hover:text-[#f2f1ed] transition-colors"
                        >
                          Gestionar listas →
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              )}
              {listSuccess && (
                <p className="text-xs text-[#838f6f] font-medium mt-1">{listSuccess}</p>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ── Comentarios ── */}
      <section>
        <h2 className="text-xs font-bold uppercase tracking-widest text-[#838f6f] mb-4">
          Comentarios
        </h2>

        {/* Formulario — solo si hay sesión */}
        {currentUserId ? (
          <form onSubmit={handleComment} className="mb-6">
            <textarea
              value={commentText}
              onChange={(e) => { setCommentText(e.target.value); setCommentError(""); }}
              placeholder="Escribe tu comentario... (máx. 250 caracteres)"
              disabled={commentLoading}
              maxLength={250}
              rows={3}
              className="w-full bg-[#1e1e1e] border border-[#2a2a2a] focus:border-[#710014] disabled:opacity-50 rounded px-3 py-2.5 text-sm text-[#f2f1ed] placeholder:text-[#5a5a5a] outline-none transition-colors resize-none"
            />
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={commentLoading || !commentText.trim()}
                  className="bg-[#710014] hover:bg-[#8b0018] disabled:opacity-50 disabled:cursor-not-allowed text-[#f2f1ed] text-xs font-semibold uppercase tracking-widest px-4 py-2 rounded transition-colors"
                >
                  {commentLoading ? "Publicando..." : "Publicar"}
                </button>
                {commentError && (
                  <span className="text-xs text-white font-medium">{commentError}</span>
                )}
              </div>
              <span className="text-xs text-[#5a5a5a]">{commentText.length}/250</span>
            </div>
          </form>
        ) : (
          <p className="text-sm text-[#5a5a5a] mb-6">
            Inicia sesión para dejar un comentario.
          </p>
        )}

        {/* Lista de comentarios */}
        {comments.length === 0 ? (
          <p className="text-sm text-[#5a5a5a]">Aún no hay comentarios. ¡Sé el primero!</p>
        ) : (
          <ul className="space-y-3">
            {comments.map((c) => (
              <li
                key={c._id}
                className="bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg px-4 py-3"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#710014] flex items-center justify-center shrink-0">
                      <span className="text-[10px] font-bold text-[#f2f1ed] uppercase">
                        {getCommentUserName(c).charAt(0)}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-[#f2f1ed]">
                      {getCommentUserName(c)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-[#5a5a5a]">
                      {new Date(c.createdAt).toLocaleDateString("es-MX", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    {currentUserId && getCommentUserId(c) === currentUserId && (
                      <button
                        onClick={() => handleDeleteComment(c._id)}
                        className="text-[#5a5a5a] hover:text-[#710014] transition-colors"
                        aria-label="Eliminar comentario"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-sm text-[#838f6f] leading-relaxed">{c.text}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ── Reseña ── */}
      <section>
        <h2 className="text-xs font-bold uppercase tracking-widest text-[#838f6f] mb-4">
          Escribir reseña
        </h2>

        {currentUserId ? (
          <form onSubmit={handleReview} className="space-y-3 max-w-xl">
            <div>
              <p className="text-xs text-[#838f6f] mb-2 uppercase tracking-widest">Tu puntuación</p>
              <StarRating
                value={reviewRating}
                onChange={setReviewRating}
                disabled={reviewLoading}
              />
            </div>
            <textarea
              value={reviewContent}
              onChange={(e) => { setReviewContent(e.target.value); setReviewError(""); }}
              placeholder="Escribe tu reseña... (máx. 500 caracteres)"
              disabled={reviewLoading}
              maxLength={500}
              rows={4}
              className="w-full bg-[#1e1e1e] border border-[#2a2a2a] focus:border-[#710014] disabled:opacity-50 rounded px-3 py-2.5 text-sm text-[#f2f1ed] placeholder:text-[#5a5a5a] outline-none transition-colors resize-none"
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={reviewLoading || !reviewContent.trim() || reviewRating === 0}
                  className="bg-[#710014] hover:bg-[#8b0018] disabled:opacity-50 disabled:cursor-not-allowed text-[#f2f1ed] text-xs font-semibold uppercase tracking-widest px-4 py-2 rounded transition-colors"
                >
                  {reviewLoading ? "Publicando..." : "Publicar reseña"}
                </button>
                {reviewError && <span className="text-xs text-white font-medium">{reviewError}</span>}
                {reviewSuccess && <span className="text-xs text-[#838f6f] font-medium">¡Reseña publicada!</span>}
              </div>
              <span className="text-xs text-[#5a5a5a]">{reviewContent.length}/500</span>
            </div>
          </form>
        ) : (
          <p className="text-sm text-[#5a5a5a]">
            <Link href="/login" className="text-[#f2f1ed] hover:underline">Inicia sesión</Link> para escribir una reseña.
          </p>
        )}
      </section>
    </div>
  );
}
