import { getCurrentUser, getListById } from "@/lib/api";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

interface ListMovie {
  movieId: string;
  title: string;
  poster: string;
  releaseYear: string;
}

interface MovieList {
  _id: string;
  name: string;
  movies: ListMovie[];
  createdAt: string;
}

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ListaDetallePage({ params }: Props) {
  const user = await getCurrentUser();
  if (!user) redirect("/listas");

  const { id } = await params;
  const list: MovieList | null = await getListById(id);

  if (!list) {
    return (
      <main className="min-h-screen bg-[#161616] pt-20 px-4">
        <div className="max-w-7xl mx-auto py-12 text-center">
          <p className="text-[#5a5a5a] text-sm">Lista no encontrada.</p>
          <Link
            href="/listas"
            className="inline-block mt-4 text-xs font-semibold uppercase tracking-widest text-[#838f6f] hover:text-[#f2f1ed] transition-colors"
          >
            ← Volver a mis listas
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#161616] pt-20 px-4">
      <div className="max-w-7xl mx-auto py-8">
        <div className="mb-2">
          <Link
            href="/listas"
            className="text-xs text-[#5a5a5a] hover:text-[#838f6f] transition-colors uppercase tracking-widest"
          >
            ← Mis listas
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-[#f2f1ed] text-2xl font-semibold mt-2">{list.name}</h1>
          <p className="text-xs text-[#5a5a5a] mt-1">
            {list.movies?.length ?? 0} {(list.movies?.length ?? 0) === 1 ? "película" : "películas"}
          </p>
        </div>

        {(!list.movies || list.movies.length === 0) ? (
          <div className="py-12 text-center">
            <p className="text-[#5a5a5a] text-sm">Esta lista está vacía.</p>
            <p className="text-xs text-[#5a5a5a] mt-2">Agrega películas desde su página de detalle.</p>
            <Link
              href="/catalogo"
              className="inline-block mt-6 text-xs font-semibold uppercase tracking-widest text-[#f2f1ed] bg-[#710014] hover:bg-[#8b0018] transition-colors px-4 py-2 rounded"
            >
              Explorar catálogo
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2">
            {list.movies.map((movie) => (
              <Link
                key={movie.movieId}
                href={`/movie/${movie.movieId}`}
                className="group relative aspect-[2/3] rounded overflow-hidden bg-[#1e1e1e]"
              >
                {movie.poster && movie.poster !== "N/A" ? (
                  <Image
                    src={movie.poster}
                    alt={movie.title}
                    fill
                    className="object-cover transition-opacity group-hover:opacity-60"
                    sizes="(max-width: 640px) 33vw, 12vw"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-end p-2">
                    <span className="text-[10px] text-[#838f6f] leading-tight">{movie.title}</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-end p-2 opacity-0 group-hover:opacity-100">
                  <span className="text-[10px] text-[#f2f1ed] leading-tight font-medium line-clamp-2">{movie.title}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
