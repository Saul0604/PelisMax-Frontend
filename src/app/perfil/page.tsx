import { getCurrentUser, getMyReviews } from "@/lib/api";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

interface Review {
  id: string;
  content: string;
  rating: number;
  formattedDate: string;
  movieId: {
    title: string;
    poster: string;
    releaseYear: string;
    _id?: string;
    imdbId?: string;
  };
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg
          key={s}
          className={`w-3.5 h-3.5 ${s <= rating ? "text-[#710014]" : "text-[#2a2a2a]"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default async function PerfilPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/");

  const reviews: Review[] = await getMyReviews();

  return (
    <main className="min-h-screen bg-[#161616] pt-20 px-4">
      <div className="max-w-7xl mx-auto py-8">
        {/* Header de perfil */}
        <div className="flex items-center gap-4 mb-10">
          <div className="w-14 h-14 rounded-full bg-[#710014] flex items-center justify-center shrink-0">
            <span className="text-xl font-bold text-[#f2f1ed] uppercase">
              {user.name.charAt(0)}
            </span>
          </div>
          <div>
            <h1 className="text-[#f2f1ed] text-xl font-semibold">{user.name}</h1>
            <p className="text-xs text-[#5a5a5a] mt-0.5">{user.email}</p>
          </div>
        </div>

        {/* Reseñas */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#838f6f] mb-6">
            Mis Reseñas
            {reviews.length > 0 && (
              <span className="ml-2 normal-case text-[#5a5a5a]">({reviews.length})</span>
            )}
          </h2>

          {reviews.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-[#5a5a5a] text-sm">Aún no has escrito ninguna reseña.</p>
              <Link
                href="/catalogo"
                className="inline-block mt-6 text-xs font-semibold uppercase tracking-widest text-[#f2f1ed] bg-[#710014] hover:bg-[#8b0018] transition-colors px-4 py-2 rounded"
              >
                Explorar catálogo
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg p-4 flex gap-4"
                >
                  {/* Póster */}
                  <div className="relative w-16 h-24 shrink-0 rounded overflow-hidden bg-[#2a2a2a]">
                    {review.movieId?.poster && review.movieId.poster !== "N/A" ? (
                      <Image
                        src={review.movieId.poster}
                        alt={review.movieId.title ?? ""}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-[8px] text-[#5a5a5a] text-center px-1">
                          {review.movieId?.title}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Contenido */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <p className="text-sm font-semibold text-[#f2f1ed] leading-tight">
                          {review.movieId?.title ?? "Película desconocida"}
                        </p>
                        {review.movieId?.releaseYear && (
                          <p className="text-xs text-[#5a5a5a] mt-0.5">{review.movieId.releaseYear}</p>
                        )}
                      </div>
                      <StarDisplay rating={review.rating} />
                    </div>
                    <p className="text-sm text-[#838f6f] leading-relaxed line-clamp-4">
                      {review.content}
                    </p>
                    <p className="text-xs text-[#5a5a5a] mt-2">{review.formattedDate}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
