import Image from "next/image";
import Link from "next/link";
import { Movie } from "@/types/movie";

interface Props {
  movie: Movie;
}

export default function MovieCard({ movie }: Props) {
  const poster =
    movie.Poster && movie.Poster !== "N/A" ? movie.Poster : null;

  return (
    <Link
      href={`/movie/${movie.imdbID}`}
      className="group w-28 sm:w-32 md:w-36 block"
    >
      <div className="relative aspect-[2/3] rounded overflow-hidden bg-[#1e1e1e] border border-[#2a2a2a]">
        {poster ? (
          <Image
            src={poster}
            alt={movie.Title}
            fill
            sizes="(max-width: 640px) 112px, (max-width: 768px) 128px, 144px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-[#5a5a5a]">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
            </svg>
          </div>
        )}

        {/* Overlay en hover */}
        <div className="absolute inset-0 bg-[#710014]/0 group-hover:bg-[#710014]/30 transition-colors duration-300" />
      </div>

      <p className="mt-1.5 text-xs text-[#838f6f] truncate group-hover:text-[#f2f1ed] transition-colors leading-tight">
        {movie.Title}
      </p>
      <p className="text-xs text-[#5a5a5a]">{movie.Year}</p>
    </Link>
  );
}
