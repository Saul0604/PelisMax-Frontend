import { getMoviesByCategory } from "@/lib/api";
import { Movie } from "@/types/movie";
import Image from "next/image";
import Link from "next/link";

export default async function CatalogoPage() {
  let movies: Movie[] = [];
  let error = false;

  try {
    const categories = await getMoviesByCategory();
    // Flatten all categories, deduplicate by imdbID
    const seen = new Set<string>();
    for (const cat of categories) {
      for (const movie of cat.movies) {
        if (!seen.has(movie.imdbID)) {
          seen.add(movie.imdbID);
          movies.push(movie);
        }
      }
    }
  } catch {
    error = true;
  }

  return (
    <main className="max-w-7xl mx-auto px-4 pt-20 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 border-b border-[#2a2a2a] pb-4">
        <h1 className="text-xs font-bold uppercase tracking-widest text-[#838f6f]">
          Películas
        </h1>
        {!error && (
          <span className="text-xs text-[#5a5a5a]">
            {movies.length} películas
          </span>
        )}
      </div>

      {error && (
        <div className="text-center py-20 text-[#838f6f]">
          <p className="text-lg mb-2">No se pudo conectar con el servidor.</p>
          <p className="text-sm">Asegúrate de que el backend esté corriendo.</p>
        </div>
      )}

      {!error && movies.length === 0 && (
        <div className="text-center py-20 text-[#838f6f]">
          <p>No hay películas disponibles.</p>
        </div>
      )}

      {/* Grid */}
      {!error && movies.length > 0 && (
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-2">
          {movies.map((movie) => {
            const poster = movie.Poster && movie.Poster !== "N/A" ? movie.Poster : null;
            return (
              <Link
                key={movie.imdbID}
                href={`/movie/${movie.imdbID}`}
                className="group block"
              >
                <div className="relative aspect-[2/3] rounded overflow-hidden bg-[#1e1e1e] border border-[#2a2a2a]">
                  {poster ? (
                    <Image
                      src={poster}
                      alt={movie.Title}
                      fill
                      sizes="(max-width: 640px) 25vw, (max-width: 768px) 16vw, (max-width: 1024px) 12vw, 8vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      unoptimized
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-[#5a5a5a]">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                      </svg>
                    </div>
                  )}

                  {/* Hover overlay con título */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-colors duration-200 flex items-end p-1.5 opacity-0 group-hover:opacity-100">
                    <p className="text-[10px] text-white font-medium leading-tight line-clamp-2">
                      {movie.Title}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
