import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export async function POST(req: NextRequest) {
  const store = await cookies();
  const token = store.get("auth_token")?.value ?? process.env.TEMP_API_TOKEN ?? "";

  const body = await req.json();

  const res = await fetch(`${BASE_URL}/rate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
