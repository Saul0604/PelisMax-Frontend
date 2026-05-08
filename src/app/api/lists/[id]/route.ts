import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

async function authHeader() {
  const store = await cookies();
  const token = store.get("auth_token")?.value;
  return token ? { Authorization: `Bearer ${token}` } : null;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authHeader();
  if (!auth) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { id } = await params;
  const res = await fetch(`${BACKEND}/lists/${id}`, {
    cache: "no-store",
    headers: { ...auth },
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
