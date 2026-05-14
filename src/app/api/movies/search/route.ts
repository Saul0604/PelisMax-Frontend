import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "";
  const page = searchParams.get("page") || "1";

  if (!query) return NextResponse.json({ movies: [], totalResults: 0 });

  const store = await cookies();
  const token = store.get("auth_token")?.value;
  const headers: HeadersInit = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${BACKEND_URL}/movies/search?q=${encodeURIComponent(query)}&page=${page}`, {
      headers,
      cache: "no-store"
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Error searching movies" }, { status: 500 });
  }
}
