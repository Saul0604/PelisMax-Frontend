import Image from "next/image";
import Link from "next/link";
import { Movie } from "@/types/movie";

interface Props {
  movie: Movie;
}

export default function MovieCard({ movie }: Props) {
  const poster =
    movie.Poster && movie.Poster !== "N/A"
      ? movie.Poster
      : "/no-poster.svg";

  return (
    <Link
      href={`/movie/${movie.imdbID}`}
      className="group relative flex-shrink-0 w-28 sm:w-32 md:w-36"
    >
      <div className="relative aspect-[2/3] rounded overflow-hidden bg-[#1f2937]">
        <Image
          src={poster}
          alt={movie.Title}
          fill
          sizes="(max-width: 640px) 112px, (max-width: 768px) 128px, 144px"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          unoptimized={poster === "/no-poster.svg"}
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
        </div>
      </div>
      <p className="mt-1.5 text-xs text-[#9ca3af] truncate group-hover:text-white transition-colors leading-tight">
        {movie.Title}
      </p>
      <p className="text-xs text-[#6b7280]">{movie.Year}</p>
    </Link>
  );
}
