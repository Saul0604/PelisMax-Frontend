import { Category } from "@/types/movie";
import MovieCard from "./MovieCard";
import { 
  Sparkles, 
  Zap, 
  Laugh, 
  Ghost, 
  Rocket, 
  Theater, 
  Shapes, 
  Compass, 
  Wand2, 
  Search, 
  Clapperboard 
} from "lucide-react";

interface Props {
  data: Category;
}

const CATEGORY_ICONS: Record<string, any> = {
  "Estrenos": Sparkles,
  "Acción": Zap,
  "Comedia": Laugh,
  "Terror": Ghost,
  "Ciencia Ficción": Rocket,
  "Drama": Theater,
  "Animación": Shapes,
  "Aventura": Compass,
  "Fantasía": Wand2,
  "Misterio": Search,
};

export default function CategoryRow({ data }: Props) {
  const IconComponent = CATEGORY_ICONS[data.category] ?? Clapperboard;

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-[#f2f1ed] flex items-center gap-2 uppercase tracking-widest">
          <IconComponent size={18} className="text-[#710014]" />
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
