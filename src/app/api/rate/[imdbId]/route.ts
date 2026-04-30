import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ imdbId: string }> }
) {
  const { imdbId } = await params;
  const store = await cookies();
  const token = store.get("auth_token")?.value ?? process.env.TEMP_API_TOKEN ?? "";

  const res = await fetch(`${BASE_URL}/rate/${imdbId}`, {
    cache: "no-store",
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
