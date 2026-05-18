import { NextResponse } from "next/server";
import { BACKEND_URL } from "@/lib/backend";
import { getAdminSession } from "@/lib/session";

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

async function proxy(request: Request, context: RouteContext) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });
  }

  const { path } = await context.params;
  const requestUrl = new URL(request.url);
  const targetPath = path.map((segment) => encodeURIComponent(segment)).join("/");
  const targetUrl = `${BACKEND_URL}/api/admin/${targetPath}${requestUrl.search}`;
  const method = request.method.toUpperCase();
  const hasBody = !["GET", "HEAD"].includes(method);
  const contentType = request.headers.get("content-type");

  const response = await fetch(targetUrl, {
    method,
    headers: {
      ...(contentType ? { "Content-Type": contentType } : {}),
      Authorization: `Bearer ${session.backendToken}`
    },
    body: hasBody ? await request.text() : undefined,
    cache: "no-store"
  });

  const body = await response.text();
  return new Response(body, {
    status: response.status,
    headers: {
      "Content-Type": response.headers.get("content-type") ?? "application/json",
      "Cache-Control": "no-store"
    }
  });
}

export function GET(request: Request, context: RouteContext) {
  return proxy(request, context);
}

export function POST(request: Request, context: RouteContext) {
  return proxy(request, context);
}

export function PATCH(request: Request, context: RouteContext) {
  return proxy(request, context);
}

export function DELETE(request: Request, context: RouteContext) {
  return proxy(request, context);
}
