import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

async function authHeader() {
  const store = await cookies();
  const token = store.get("auth_token")?.value;
  return token ? { Authorization: `Bearer ${token}` } : null;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authHeader();
  if (!auth) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const res = await fetch(`${BACKEND}/reviews/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...auth },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authHeader();
  if (!auth) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { id } = await params;
  const res = await fetch(`${BACKEND}/reviews/${id}`, {
    method: "DELETE",
    headers: { ...auth },
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
