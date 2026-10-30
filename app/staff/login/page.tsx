"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function StaffLoginPage() {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/staff/session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: form.get("email"), password: form.get("password") }) });
    const result = await response.json().catch(() => ({}));
    if (response.ok) { router.replace("/"); router.refresh(); } else { setBusy(false); setError(result.error || "Unable to sign in."); }
  }
  return <main className="grid min-h-screen place-items-center bg-black px-5 text-white"><form onSubmit={submit} className="grid w-full max-w-sm gap-5 border border-white/20 bg-[#090909] p-7"><Link href="/" className="text-lg font-semibold tracking-[0.3em]">ATLAS</Link><div><p className="text-xs tracking-[0.2em] text-white/50">CENTRAL STAFF ACCESS</p><h1 className="mt-2 text-2xl font-semibold">Sign in to continue</h1></div><label className="grid gap-2 text-sm">Email<input name="email" type="email" autoComplete="username" required className="h-11 border border-white/25 bg-black px-3 text-base outline-offset-2 focus:outline" /></label><label className="grid gap-2 text-sm">Password<input name="password" type="password" autoComplete="current-password" required className="h-11 border border-white/25 bg-black px-3 text-base outline-offset-2 focus:outline" /></label>{error && <p role="alert" className="text-sm text-red-300">{error}</p>}<button disabled={busy} className="h-11 border border-white bg-white text-sm font-semibold text-black disabled:opacity-60">{busy ? "Signing in…" : "Sign in"}</button><small className="leading-5 text-white/50">Staff access is managed through AMPLIFY. Contact your administrator if you need access.</small></form></main>;
}
