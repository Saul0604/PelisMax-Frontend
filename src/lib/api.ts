import { cookies } from "next/headers";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

async function authHeaders(): Promise<HeadersInit> {
  const store = await cookies();
  const token = store.get("auth_token")?.value;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function getCurrentUser() {
  const store = await cookies();
  const token = store.get("auth_token")?.value;
  if (!token) return null;
  try {
    const payload = JSON.parse(
      Buffer.from(token.split(".")[1], "base64url").toString("utf8")
    );
    return {
      id: payload.id as string,
      name: payload.name as string,
      email: payload.email as string,
    };
  } catch {
    return null;
  }
}

export async function getMoviesByCategory(page = 1) {
  const res = await fetch(`${BASE_URL}/movies?page=${page}`, {
    cache: "no-store",
    headers: await authHeaders(),
  });
  if (!res.ok) return [];
  return res.json();
}

// Returns { movies: Movie[], totalResults: number }
export async function searchMovies(query: string, page = 1) {
  const res = await fetch(
    `${BASE_URL}/movies/search?q=${encodeURIComponent(query)}&page=${page}`,
    { cache: "no-store", headers: await authHeaders() }
  );
  if (!res.ok) return { movies: [], totalResults: 0 };
  return res.json();
}

export async function getWatchlist() {
  const res = await fetch(`${BASE_URL}/watchlist`, {
    cache: "no-store",
    headers: await authHeaders(),
  });
  if (!res.ok) return [];
  return res.json();
}

export async function getMyReviews() {
  const res = await fetch(`${BASE_URL}/reviews/me`, {
    cache: "no-store",
    headers: await authHeaders(),
  });
  if (!res.ok) return [];
  return res.json();
}

export async function getMyLists() {
  const res = await fetch(`${BASE_URL}/lists`, {
    cache: "no-store",
    headers: await authHeaders(),
  });
  if (!res.ok) return [];
  return res.json();
}

export async function getListById(id: string) {
  const res = await fetch(`${BASE_URL}/lists/${id}`, {
    cache: "no-store",
    headers: await authHeaders(),
  });
  if (!res.ok) return null;
  return res.json();
}

// Public — sends token only when logged in (for userScore)
export async function getMovieDetail(imdbId: string) {
  const res = await fetch(`${BASE_URL}/movies/${imdbId}`, {
    cache: "no-store",
    headers: await authHeaders(),
  });
  if (!res.ok) throw new Error("Error al obtener detalle");
  return res.json();
}

// Public — no auth required to read comments
export async function getComments(movieId: string) {
  const res = await fetch(`${BASE_URL}/comments/${movieId}`, {
    cache: "no-store",
  });
  if (res.status === 404) return [];
  if (!res.ok) return [];
  const data = await res.json();
  return data.comments ?? [];
}
