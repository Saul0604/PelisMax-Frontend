"use client";

import { useState } from "react";
import { Movie, Category } from "@/types/movie";
import Image from "next/image";
import Link from "next/link";

interface Props {
  initialMovies: Movie[];
}

export default function CatalogList({ initialMovies }: Props) {
  const [movies, setMovies] = useState<Movie[]>(initialMovies);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  async function loadMore() {
    setLoading(true);
    const nextPage = page + 1;
    try {
      const res = await fetch(`/api/movies?page=${nextPage}`);
      if (!res.ok) throw new Error();
      const categories: Category[] = await res.json();
      
      const newMovies: Movie[] = [];
      const seen = new Set(movies.map(m => m.imdbID));
      
      let foundAny = false;
      for (const cat of categories) {
        for (const movie of cat.movies) {
          if (!seen.has(movie.imdbID)) {
            seen.add(movie.imdbID);
            newMovies.push(movie);
            foundAny = true;
          }
        }
      }

      if (!foundAny) {
        setHasMore(false);
      } else {
        setMovies(prev => [...prev, ...newMovies]);
        setPage(nextPage);
      }
    } catch (err) {
      console.error("Error loading more movies:", err);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
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
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
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

      {hasMore && (
        <div className="mt-12 flex justify-center">
          <button
            onClick={loadMore}
            disabled={loading}
            className="px-8 py-3 bg-[#1e1e1e] border border-[#2a2a2a] text-[#f2f1ed] text-xs font-bold uppercase tracking-widest hover:bg-[#2a2a2a] hover:border-[#5a5a5a] transition-all disabled:opacity-50 rounded"
          >
            {loading ? "Cargando..." : "Ver más películas"}
          </button>
        </div>
      )}
    </>
  );
}
