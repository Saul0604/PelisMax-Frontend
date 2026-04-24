import { getMoviesByCategory } from "@/lib/api";
import { Category } from "@/types/movie";
import CategoryRow from "@/components/CategoryRow";
import Image from "next/image";
import Link from "next/link";

export default async function HomePage() {
  let categories: Category[] = [];
  let error = false;

  try {
    categories = await getMoviesByCategory();
  } catch {
    error = true;
  }

  const heroImage = process.env.HERO_IMAGE_URL ?? null;

  return (
    <main>
      {/* Hero */}
      <section className="relative h-[70vh] min-h-[400px] flex items-end">
        {heroImage ? (
          <Image
            src={heroImage}
            alt="Hero"
            fill
            priority
            className="object-cover object-center"
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#710014]/40 to-[#161616]" />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-[#161616] via-[#161616]/70 to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 pb-12 w-full">
          <h1 className="text-3xl sm:text-5xl font-bold text-[#f2f1ed] leading-tight max-w-xl mb-6">
            Descubre las mejores películas.
            <br />
            <span className="text-[#838f6f]">Todas en un lugar.</span>
          </h1>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/register"
              className="bg-[#710014] hover:bg-[#8b0018] text-[#f2f1ed] font-semibold px-6 py-3 rounded transition-colors text-sm"
            >
              Crear cuenta gratis
            </Link>
            <Link
              href="/login"
              className="border border-[#838f6f]/50 hover:border-[#838f6f] text-[#f2f1ed] font-semibold px-6 py-3 rounded transition-colors text-sm"
            >
              Iniciar sesión
            </Link>
          </div>
        </div>
      </section>

      {/* Catalog */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        {error && (
          <div className="text-center py-20 text-[#838f6f]">
            <p className="text-lg mb-2">No se pudo conectar con el servidor.</p>
            <p className="text-sm">
              Asegúrate de que el backend esté corriendo en localhost:3000
            </p>
          </div>
        )}

        {!error && categories.length === 0 && (
          <div className="text-center py-20 text-[#838f6f]">
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
