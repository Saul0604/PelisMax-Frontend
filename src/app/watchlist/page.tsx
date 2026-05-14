import { getCurrentUser, getWatchlist } from "@/lib/api";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Film } from "lucide-react";

interface WatchlistEntry {
  id: string;
  poster: string;
}

export default async function WatchlistPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/");

  const entries: WatchlistEntry[] = await getWatchlist();

  return (
    <main className="min-h-screen bg-[#161616] pt-20 px-4">
      <div className="max-w-7xl mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-xs font-bold uppercase tracking-widest text-[#838f6f] mb-1">
            Mi Watchlist
          </h1>
          <p className="text-[#f2f1ed] text-lg font-semibold">
            Películas que quiero ver
          </p>
          {entries.length > 0 && (
            <p className="text-xs text-[#5a5a5a] mt-1">{entries.length} {entries.length === 1 ? "película" : "películas"}</p>
          )}
        </div>

        {entries.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-[#5a5a5a] text-sm">Tu watchlist está vacía.</p>
            <p className="text-xs text-[#5a5a5a] mt-2">
              Agrega películas desde su página de detalle.
            </p>
            <Link
              href="/catalogo"
              className="inline-block mt-6 text-xs font-semibold uppercase tracking-widest text-[#f2f1ed] bg-[#710014] hover:bg-[#8b0018] transition-colors px-4 py-2 rounded"
            >
              Explorar catálogo
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {entries.map((entry) => (
              <Link
                key={entry.id}
                href={`/movie/${entry.id}`}
                className="group relative aspect-[2/3] rounded overflow-hidden bg-[#1e1e1e]"
              >
                {entry.poster && entry.poster !== "N/A" ? (
                  <Image
                    src={entry.poster}
                    alt={entry.id}
                    fill
                    className="object-cover transition-opacity group-hover:opacity-60"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-[#5a5a5a]">
                    <Film size={40} strokeWidth={1} />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
