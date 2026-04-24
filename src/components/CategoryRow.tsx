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
  const preview = data.movies.slice(0, 5);

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <span>{icon}</span>
          {data.category}
        </h2>
        <a
          href={`/category/${encodeURIComponent(data.category)}`}
          className="text-xs text-[#00c030] hover:text-[#00e054] font-semibold uppercase tracking-widest transition-colors"
        >
          Ver más →
        </a>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {preview.map((movie) => (
          <MovieCard key={movie.imdbID} movie={movie} />
        ))}
      </div>
    </section>
  );
}
