import { Category } from "@/types/movie";
import MovieCard from "./MovieCard";

interface Props {
  data: Category;
}

const CATEGORY_ICONS: Record<string, string> = {
  "Acción": "💥",
  "Comedia": "😄",
  "Terror": "👻",
  "Ciencia Ficción": "🚀",
};

export default function CategoryRow({ data }: Props) {
  const icon = CATEGORY_ICONS[data.category] ?? "🎬";

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-[#f2f1ed] flex items-center gap-2 uppercase tracking-widest">
          <span>{icon}</span>
          {data.category}
          <span className="text-[#838f6f] font-normal text-xs normal-case tracking-normal">
            ({data.movies.length})
          </span>
        </h2>
      </div>

      {/* Carrusel horizontal — muestra todas las películas */}
      <div className="flex gap-3 overflow-x-auto pb-3 scroll-smooth snap-x snap-mandatory">
        {data.movies.map((movie) => (
          <div key={movie.imdbID} className="snap-start shrink-0">
            <MovieCard movie={movie} />
          </div>
        ))}
      </div>
    </section>
  );
}
