import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { adminPassword, loginToBackend } from "@/lib/backend";
import { setAdminSessionCookie } from "@/lib/session";

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  if (leftBuffer.length !== rightBuffer.length) return false;
  return timingSafeEqual(leftBuffer, rightBuffer);
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { username?: string; password?: string } | null;
  const username = body?.username?.trim().toLowerCase() ?? "";
  const password = body?.password ?? "";
  const expectedPassword = adminPassword();

  if (!expectedPassword) {
    return NextResponse.json({ error: "ADMIN_PASSWORD is not configured." }, { status: 500 });
  }

  if (username !== "admin" || !safeEqual(password, expectedPassword)) {
    return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
  }

  let backendToken: string;
  try {
    backendToken = await loginToBackend(password);
  } catch {
    return NextResponse.json({ error: "Backend admin login failed. Check backend admin env values." }, { status: 502 });
  }

  const response = NextResponse.json({ ok: true });
  setAdminSessionCookie(response, backendToken);
  return response;
}
