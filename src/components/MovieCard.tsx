import Image from "next/image";
import Link from "next/link";
import { Movie } from "@/types/movie";
import { Film } from "lucide-react";

interface Props {
  movie: Movie;
}

export default function MovieCard({ movie }: Props) {
  const poster =
    movie.Poster && movie.Poster !== "N/A" ? movie.Poster : null;

  return (
    <Link
      href={`/movie/${movie.imdbID}`}
      className="group w-36 sm:w-44 md:w-52 block"
    >
      <div className="relative aspect-[2/3] rounded overflow-hidden bg-[#1e1e1e] border border-[#2a2a2a]">
        {poster ? (
          <Image
            src={poster}
            alt={movie.Title}
            fill
            sizes="(max-width: 640px) 144px, (max-width: 768px) 176px, 208px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-[#5a5a5a]">
            <Film size={32} strokeWidth={1} />
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
