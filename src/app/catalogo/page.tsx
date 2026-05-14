import { getMoviesByCategory } from "@/lib/api";
import { Movie } from "@/types/movie";
import CatalogList from "@/components/CatalogList";

export default async function CatalogoPage() {
  let initialMovies: Movie[] = [];
  let error = false;

  try {
    const categories = await getMoviesByCategory(1);
    const seen = new Set<string>();
    for (const cat of categories) {
      for (const movie of cat.movies) {
        if (!seen.has(movie.imdbID)) {
          seen.add(movie.imdbID);
          initialMovies.push(movie);
        }
      }
    }
  } catch {
    error = true;
  }

  return (
    <main className="max-w-7xl mx-auto px-4 pt-24 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-10 border-b border-[#2a2a2a] pb-6">
        <div>
          <h1 className="text-xs font-bold uppercase tracking-widest text-[#838f6f] mb-1">
            Explorar
          </h1>
          <p className="text-2xl font-bold text-[#f2f1ed]">Catálogo Completo</p>
        </div>
        {!error && (
          <span className="text-xs font-medium text-[#5a5a5a] bg-[#1e1e1e] px-3 py-1 rounded-full border border-[#2a2a2a]">
            {initialMovies.length}+ películas
          </span>
        )}
      </div>

      {error && (
        <div className="text-center py-24 text-[#838f6f]">
          <p className="text-xl mb-2 font-semibold text-[#f2f1ed]">¡Ups! Algo salió mal</p>
          <p className="text-sm">No se pudo conectar con el servidor en este momento.</p>
        </div>
      )}

      {!error && initialMovies.length === 0 && (
        <div className="text-center py-24 text-[#838f6f]">
          <p className="text-sm italic">No hay películas disponibles en el catálogo.</p>
        </div>
      )}

      {/* Grid de Películas con "Ver más" */}
      {!error && initialMovies.length > 0 && (
        <CatalogList initialMovies={initialMovies} />
      )}
    </main>
  );
}
