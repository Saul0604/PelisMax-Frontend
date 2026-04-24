const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export async function getMoviesByCategory() {
  const res = await fetch(`${BASE_URL}/movies`, { cache: "no-store" });
  if (!res.ok) throw new Error("Error al obtener películas");
  return res.json();
}

export async function searchMovies(query: string, page = 1) {
  const res = await fetch(
    `${BASE_URL}/movies/search?q=${encodeURIComponent(query)}&page=${page}`,
    { cache: "no-store" }
  );
  if (!res.ok) throw new Error("Error en la búsqueda");
  return res.json();
}

export async function getMovieDetail(imdbId: string) {
  const res = await fetch(`${BASE_URL}/movies/${imdbId}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Error al obtener detalle");
  return res.json();
}
