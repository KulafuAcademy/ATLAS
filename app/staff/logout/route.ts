import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import { staffAuthConfig } from "@/lib/staff-auth";

export async function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/staff/login", request.url)); const config = staffAuthConfig();
  if (config) { const client = createServerClient(config.url, config.anonKey, { cookieOptions: { name: "atlas_staff_auth", httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/" }, cookies: { getAll: () => request.cookies.getAll(), setAll: (values) => values.forEach(({ name, value, options }) => response.cookies.set(name, value, options)) } }); await client.auth.signOut(); }
  return response;
}
