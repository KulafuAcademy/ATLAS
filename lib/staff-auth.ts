import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { publicLearningAccessEnabled } from "@/lib/public-learning-access";

export function staffAuthConfig() {
  const url = process.env.AMPLIFY_SUPABASE_URL;
  const anonKey = process.env.AMPLIFY_SUPABASE_ANON_KEY;
  return url && anonKey ? { url, anonKey } : null;
}

export async function requireStaff() {
  if (publicLearningAccessEnabled()) return { user: null, accessToken: null, response: null };
  const config = staffAuthConfig();
  if (!config) return { user: null, accessToken: null, response: Response.json({ error: "Staff authentication is not configured." }, { status: 503 }) };
  const cookieStore = await cookies();
  const client = createServerClient(config.url, config.anonKey, {
    cookieOptions: { name: "atlas_staff_auth", httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/" },
    cookies: { getAll: () => cookieStore.getAll(), setAll: (values) => { try { values.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch { /* Route handlers may refresh; server components cannot. */ } } },
  });
  const { data: { user }, error } = await client.auth.getUser();
  if (error || !user) return { user: null, accessToken: null, response: Response.json({ error: "Sign in is required." }, { status: 401 }) };
  if (user.app_metadata?.staff_access !== true) return { user: null, accessToken: null, response: Response.json({ error: "Staff access is required." }, { status: 403 }) };
  const { data: { session } } = await client.auth.getSession();
  return { user, accessToken: session?.access_token ?? null, response: null };
}
