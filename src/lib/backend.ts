import "server-only";

import type { AdminData, Garment, Order, Product } from "./types";

const DEFAULT_BACKEND_URL = process.env.NODE_ENV === "production"
  ? "https://back-saudade.thehnh.tech"
  : "http://localhost:4000";

export const BACKEND_URL = (
  process.env.BACKEND_URL
  ?? process.env.ADMIN_API_URL
  ?? process.env.API_PUBLIC_URL
  ?? DEFAULT_BACKEND_URL
).replace(/\/$/, "");

export const MARKETPLACE_URL = (
  process.env.MARKETPLACE_PUBLIC_URL
  ?? process.env.NEXT_PUBLIC_MARKETPLACE_URL
  ?? (process.env.NODE_ENV === "production" ? "https://saudade.thehnh.tech" : "http://localhost:3000")
).replace(/\/$/, "");

export function adminPassword() {
  return process.env.ADMIN_PASSWORD ?? (process.env.NODE_ENV === "production" ? "" : "admin");
}

function backendAdminLogin() {
  return process.env.BACKEND_ADMIN_LOGIN || process.env.ADMIN_LOGIN || "admin";
}

function backendAdminPassword(sitePassword: string) {
  return process.env.BACKEND_ADMIN_PASSWORD || sitePassword;
}

export async function loginToBackend(sitePassword: string) {
  const response = await fetch(`${BACKEND_URL}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      login: backendAdminLogin(),
      password: backendAdminPassword(sitePassword)
    }),
    cache: "no-store"
  });
  const body = await response.json().catch(() => ({})) as { token?: string; error?: string };
  if (!response.ok || !body.token) {
    throw new Error(body.error ?? "BACKEND_ADMIN_LOGIN_FAILED");
  }
  return body.token;
}

export async function fetchAdmin<T>(path: string, token: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${BACKEND_URL}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(init.headers ?? {})
    }
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = body && typeof body === "object" && "error" in body ? String(body.error) : "ADMIN_API_ERROR";
    throw new Error(error);
  }

  return body as T;
}

async function settle<T>(label: string, promise: Promise<T>, fallback: T) {
  try {
    return { value: await promise, error: null as string | null };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Request failed";
    return { value: fallback, error: `${label}: ${message}` };
  }
}

export async function loadAdminData(token: string): Promise<AdminData> {
  const [garments, products, orders] = await Promise.all([
    settle("accounts", fetchAdmin<{ garments: Garment[] }>("/api/admin/garments", token), { garments: [] }),
    settle("marketplace", fetchAdmin<{ products: Product[] }>("/api/admin/products", token), { products: [] }),
    settle("orders", fetchAdmin<{ orders: Order[] }>("/api/admin/orders", token), { orders: [] })
  ]);

  return {
    garments: garments.value.garments,
    products: products.value.products,
    orders: orders.value.orders,
    errors: [garments.error, products.error, orders.error].filter((error): error is string => Boolean(error))
  };
}
