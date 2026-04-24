import { getMoviesByCategory } from "@/lib/api";
import { Category, Movie } from "@/types/movie";
import CategoryRow from "@/components/CategoryRow";
import Image from "next/image";
import Link from "next/link";

async function getHeroMovie(categories: Category[]): Promise<Movie | null> {
  for (const cat of categories) {
    const m = cat.movies.find((mv) => mv.Poster && mv.Poster !== "N/A");
    if (m) return m;
  }
  return null;
}

export default async function HomePage() {
  let categories: Category[] = [];
  let error = false;

  try {
    categories = await getMoviesByCategory();
  } catch {
    error = true;
  }

  const hero = error ? null : await getHeroMovie(categories);

  return (
    <main>
      {/* Hero */}
      <section className="relative h-[70vh] min-h-[400px] flex items-end">
        {hero ? (
          <Image
            src={hero.Poster}
            alt={hero.Title}
            fill
            priority
            className="object-cover object-top"
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#1f2937] to-[#14181c]" />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-[#14181c] via-[#14181c]/60 to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 pb-12 w-full">
          <h1 className="text-3xl sm:text-5xl font-bold text-white leading-tight max-w-xl mb-6">
            Descubre las mejores películas.
            <br />
            <span className="text-[#00c030]">Todas en un lugar.</span>
          </h1>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/register"
              className="bg-[#00c030] hover:bg-[#00e054] text-white font-semibold px-6 py-3 rounded transition-colors text-sm"
            >
              Crear cuenta gratis
            </Link>
            <Link
              href="/login"
              className="border border-white/30 hover:border-white text-white font-semibold px-6 py-3 rounded transition-colors text-sm"
            >
              Iniciar sesión
            </Link>
          </div>
        </div>
      </section>

      {/* Catalog */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        {error && (
          <div className="text-center py-20 text-[#9ca3af]">
            <p className="text-lg mb-2">No se pudo conectar con el servidor.</p>
            <p className="text-sm">
              Asegúrate de que el backend esté corriendo en localhost:3000
            </p>
          </div>
        )}

        {!error && categories.length === 0 && (
          <div className="text-center py-20 text-[#9ca3af]">
            <p>No hay películas disponibles.</p>
          </div>
        )}

        {!error &&
          categories.map((cat) => (
            <CategoryRow key={cat.category} data={cat} />
          ))}
      </div>
    </main>
  );
}
