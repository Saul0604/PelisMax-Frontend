import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

async function getToken() {
  const store = await cookies();
  return store.get("auth_token")?.value ?? process.env.TEMP_API_TOKEN ?? "";
}

// GET /api/comments/[movieId] — list comments for a movie
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const token = await getToken();

  const res = await fetch(`${BASE_URL}/comments/${id}`, {
    cache: "no-store",
    headers: { Authorization: `Bearer ${token}` },
  });

  // 404 from backend means no comments yet — return empty list
  if (res.status === 404) {
    return NextResponse.json({ comments: [], total: 0 });
  }

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

// DELETE /api/comments/[commentId] — delete own comment
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const token = await getToken();

  const res = await fetch(`${BASE_URL}/comments/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
