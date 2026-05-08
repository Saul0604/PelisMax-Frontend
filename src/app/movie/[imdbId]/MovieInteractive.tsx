"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

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
          className="disabled:cursor-not-allowed"
          aria-label={`${star} estrellas`}
        >
          <svg
            className={`w-7 h-7 transition-colors ${
              star <= active ? "text-[#710014]" : "text-[#2a2a2a]"
            } ${!disabled ? "hover:text-[#8b0018]" : ""}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
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
                  <svg
                    key={s}
                    className={`w-4 h-4 ${s <= Math.round(average) ? "text-[#710014]" : "text-[#2a2a2a]"}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
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
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
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
              <svg className="w-3.5 h-3.5" fill={inWatchlist ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              {inWatchlist ? "En watchlist" : "Agregar a watchlist"}
            </button>
          </div>
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
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
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
