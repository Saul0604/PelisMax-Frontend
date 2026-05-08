import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

async function authHeader() {
  const store = await cookies();
  const token = store.get("auth_token")?.value;
  return token ? { Authorization: `Bearer ${token}` } : null;
}

export async function GET() {
  const auth = await authHeader();
  if (!auth) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const res = await fetch(`${BACKEND}/reviews/me`, {
    cache: "no-store",
    headers: { ...auth },
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function POST(req: NextRequest) {
  const auth = await authHeader();
  if (!auth) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const body = await req.json();
  const res = await fetch(`${BACKEND}/reviews`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...auth },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
