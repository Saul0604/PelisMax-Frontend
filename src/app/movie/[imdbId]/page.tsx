import { getMovieDetail, getComments, getCurrentUser } from "@/lib/api";
import Image from "next/image";
import Link from "next/link";
import MovieInteractive from "./MovieInteractive";

interface Props {
  params: Promise<{ imdbId: string }>;
}

export default async function MovieDetailPage({ params }: Props) {
  const { imdbId } = await params;

  let movie: Record<string, any> | null = null;
  let comments: any[] = [];
  let error = false;

  const user = await getCurrentUser();

  try {
    [movie, comments] = await Promise.all([
      getMovieDetail(imdbId),
      getComments(imdbId),
    ]);
  } catch {
    error = true;
  }

  if (error || !movie) {
    return (
      <main className="max-w-4xl mx-auto px-4 pt-24 pb-12 text-center">
        <p className="text-[#838f6f]">No se pudo cargar la película.</p>
        <Link href="/" className="text-xs text-[#710014] hover:underline mt-4 inline-block">
          Volver al inicio
        </Link>
      </main>
    );
  }

  const poster = movie.Poster && movie.Poster !== "N/A" ? movie.Poster : null;
  const community = movie.communityRating ?? { averageScore: 0, totalVotes: 0, userScore: null };
  const genres: string[] = movie.Genre ? movie.Genre.split(", ") : [];

  return (
    <main className="max-w-5xl mx-auto px-4 pt-20 pb-16">
      {/* Back */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs text-[#838f6f] hover:text-[#f2f1ed] transition-colors mb-8"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Volver
      </Link>

      {/* Hero — poster + info */}
      <div className="flex flex-col sm:flex-row gap-8">
        {/* Poster */}
        <div className="shrink-0 w-48 sm:w-56">
          <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-[#1e1e1e] border border-[#2a2a2a] shadow-2xl">
            {poster ? (
              <Image
                src={poster}
                alt={movie.Title}
                fill
                sizes="224px"
                className="object-cover"
                unoptimized
                priority
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-[#5a5a5a]">
                <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4" />
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#f2f1ed] leading-tight mb-1">
            {movie.Title}
          </h1>

          <div className="flex flex-wrap items-center gap-2 text-xs text-[#838f6f] mb-4">
            <span>{movie.Year}</span>
            {movie.Runtime && movie.Runtime !== "N/A" && (
              <>
                <span className="text-[#2a2a2a]">·</span>
                <span>{movie.Runtime}</span>
              </>
            )}
            {movie.Rated && movie.Rated !== "N/A" && (
              <>
                <span className="text-[#2a2a2a]">·</span>
                <span className="border border-[#2a2a2a] px-1.5 py-0.5 rounded text-[10px]">
                  {movie.Rated}
                </span>
              </>
            )}
          </div>

          {/* Genres */}
          {genres.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-5">
              {genres.map((g) => (
                <span
                  key={g}
                  className="text-[10px] font-semibold uppercase tracking-widest bg-[#1e1e1e] border border-[#2a2a2a] text-[#838f6f] px-2.5 py-1 rounded"
                >
                  {g}
                </span>
              ))}
            </div>
          )}

          {/* Plot */}
          {movie.Plot && movie.Plot !== "N/A" && (
            <p className="text-sm text-[#838f6f] leading-relaxed mb-5 max-w-2xl">
              {movie.Plot}
            </p>
          )}

          {/* Meta */}
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-xs">
            {movie.Director && movie.Director !== "N/A" && (
              <div>
                <dt className="text-[#5a5a5a] uppercase tracking-widest mb-0.5">Director</dt>
                <dd className="text-[#f2f1ed]">{movie.Director}</dd>
              </div>
            )}
            {movie.Actors && movie.Actors !== "N/A" && (
              <div>
                <dt className="text-[#5a5a5a] uppercase tracking-widest mb-0.5">Reparto</dt>
                <dd className="text-[#f2f1ed]">{movie.Actors}</dd>
              </div>
            )}
            {movie.Language && movie.Language !== "N/A" && (
              <div>
                <dt className="text-[#5a5a5a] uppercase tracking-widest mb-0.5">Idioma</dt>
                <dd className="text-[#f2f1ed]">{movie.Language}</dd>
              </div>
            )}
            {movie.imdbRating && movie.imdbRating !== "N/A" && (
              <div>
                <dt className="text-[#5a5a5a] uppercase tracking-widest mb-0.5">IMDb</dt>
                <dd className="text-[#f2f1ed]">⭐ {movie.imdbRating} / 10</dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-[#2a2a2a] mt-10" />

      {/* Rating + Comentarios (cliente) */}
      <MovieInteractive
        imdbId={imdbId}
        movieTitle={movie.Title}
        moviePoster={movie.Poster ?? ""}
        initialAverage={community.averageScore ?? 0}
        initialVotes={community.totalVotes ?? 0}
        initialUserScore={community.userScore ?? null}
        initialComments={comments}
        currentUserId={user?.id ?? null}
      />
    </main>
  );
}
