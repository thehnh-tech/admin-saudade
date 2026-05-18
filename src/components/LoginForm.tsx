"use client";

import { FormEvent, useState } from "react";
import { LockKeyhole, LogIn } from "lucide-react";

export function LoginForm() {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error ?? "Login failed.");
      window.location.href = "/";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-paper text-ink">
      <div className="mx-auto grid min-h-screen w-full max-w-6xl grid-cols-1 lg:grid-cols-[1fr_420px]">
        <section className="flex min-h-[42vh] flex-col justify-between px-5 py-6 sm:px-8 lg:min-h-screen lg:px-10">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="" className="h-11 w-11 rounded-lg object-contain" />
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-red">SAUDADE</p>
              <h1 className="text-2xl font-black uppercase leading-none sm:text-3xl">Admin</h1>
            </div>
          </div>
          <div className="max-w-xl py-12">
            <p className="text-sm font-black uppercase tracking-[0.16em] text-red">NIGHT ACCESS 0024</p>
            <h2 className="mt-3 text-4xl font-black uppercase leading-[0.95] sm:text-6xl">Operations</h2>
          </div>
        </section>

        <section className="flex items-center px-5 pb-8 sm:px-8 lg:px-0 lg:pr-10">
          <form onSubmit={submit} className="w-full rounded-lg border border-line bg-bone p-5 shadow-soft sm:p-6">
            <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-lg bg-red text-white">
              <LockKeyhole size={22} aria-hidden="true" />
            </div>
            <label className="block text-xs font-black uppercase tracking-[0.14em] text-stone" htmlFor="username">
              Name
            </label>
            <input
              id="username"
              autoCapitalize="none"
              autoComplete="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="mt-2 h-12 w-full rounded-lg border border-line bg-white px-3 text-base font-bold text-ink"
            />
            <label className="mt-4 block text-xs font-black uppercase tracking-[0.14em] text-stone" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              autoComplete="current-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 h-12 w-full rounded-lg border border-line bg-white px-3 text-base font-bold text-ink"
            />
            {error ? <p className="mt-4 rounded-lg border border-red/30 bg-red/10 px-3 py-2 text-sm font-bold text-red">{error}</p> : null}
            <button
              type="submit"
              disabled={loading}
              className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-red px-4 text-sm font-black uppercase text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              <LogIn size={18} aria-hidden="true" />
              {loading ? "Opening" : "Enter"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
