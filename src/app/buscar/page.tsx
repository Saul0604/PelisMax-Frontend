import { searchMovies } from "@/lib/api";
import Link from "next/link";
import Image from "next/image";

interface Props {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export default async function BuscarPage({ searchParams }: Props) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const page = Number(params.page ?? 1);

  if (!query) {
    return (
      <main className="min-h-screen bg-[#161616] pt-20 px-4">
        <div className="max-w-7xl mx-auto py-12 text-center">
          <p className="text-[#5a5a5a] text-sm">Escribe algo en el buscador para encontrar películas.</p>
        </div>
      </main>
    );
  }

  const data = await searchMovies(query, page);
  const movies: { Title: string; Poster: string; imdbID: string }[] = data.movies ?? [];
  const total: number = data.totalResults ?? 0;
  const totalPages = Math.ceil(total / 10);

  return (
    <main className="min-h-screen bg-[#161616] pt-20 px-4">
      <div className="max-w-7xl mx-auto py-8">
        <div className="mb-6">
          <h1 className="text-xs font-bold uppercase tracking-widest text-[#838f6f] mb-1">
            Resultados de búsqueda
          </h1>
          <p className="text-[#f2f1ed] text-lg font-semibold">
            &ldquo;{query}&rdquo;
          </p>
          {total > 0 && (
            <p className="text-xs text-[#5a5a5a] mt-1">{total} resultados encontrados</p>
          )}
        </div>

        {movies.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-[#5a5a5a] text-sm">
              No se encontraron resultados para &ldquo;{query}&rdquo;.
            </p>
            <p className="text-xs text-[#5a5a5a] mt-2">
              Intenta con un término diferente.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
              {movies.map((movie) => (
                <Link
                  key={movie.imdbID}
                  href={`/movie/${movie.imdbID}`}
                  className="group relative aspect-[2/3] rounded overflow-hidden bg-[#1e1e1e]"
                >
                  {movie.Poster && movie.Poster !== "N/A" ? (
                    <Image
                      src={movie.Poster}
                      alt={movie.Title}
                      fill
                      className="object-cover transition-opacity group-hover:opacity-60"
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 16vw"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-end p-2">
                      <span className="text-[10px] text-[#838f6f] leading-tight line-clamp-3">
                        {movie.Title}
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-end p-2 opacity-0 group-hover:opacity-100">
                    <span className="text-[10px] text-[#f2f1ed] leading-tight font-medium line-clamp-3">
                      {movie.Title}
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-10">
                {page > 1 && (
                  <Link
                    href={`/buscar?q=${encodeURIComponent(query)}&page=${page - 1}`}
                    className="text-xs font-semibold uppercase tracking-widest text-[#838f6f] hover:text-[#f2f1ed] transition-colors border border-[#2a2a2a] hover:border-[#5a5a5a] px-4 py-2 rounded"
                  >
                    Anterior
                  </Link>
                )}
                <span className="text-xs text-[#5a5a5a]">
                  Página {page} de {totalPages}
                </span>
                {page < totalPages && (
                  <Link
                    href={`/buscar?q=${encodeURIComponent(query)}&page=${page + 1}`}
                    className="text-xs font-semibold uppercase tracking-widest text-[#838f6f] hover:text-[#f2f1ed] transition-colors border border-[#2a2a2a] hover:border-[#5a5a5a] px-4 py-2 rounded"
                  >
                    Siguiente
                  </Link>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
