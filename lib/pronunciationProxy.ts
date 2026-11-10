/**
 * Server-side half of the pronunciation API. Only imported by the route
 * handlers in app/api/pronounce/*: the browser calls those routes, and they
 * forward to the real server with the API key. The server URL and key never
 * reach the browser (no NEXT_PUBLIC_ prefix).
 *
 * Every handler checks for a signed-in staff session before forwarding, so
 * only AICA staff can reach the AI server. proxy.ts checks this too; the
 * check here keeps the AI server protected even if that layer is bypassed
 * or its matcher changes.
 */

import { requireStaff } from "@/lib/staff-auth";

const upstreamTimeoutMs = 60_000;

function upstreamConfig() {
  const url = process.env.PRONOUNCE_API_URL?.replace(/\/+$/, "");
  const key = process.env.PRONOUNCE_API_KEY;

  return url && key ? { url, key } : null;
}

function jsonError(status: number, detail: string) {
  return Response.json({ detail }, { status });
}

/**
 * Returns an error response unless the caller has a staff session.
 * Re-wraps requireStaff's { error } body as { detail }, the field the
 * client reads.
 */
async function staffGuard() {
  const { response } = await requireStaff();
  if (!response) return null;

  const body = (await response.json().catch(() => null)) as {
    error?: string;
  } | null;
  return jsonError(response.status, body?.error ?? "Staff access is required.");
}

/** Copies the upstream status and body back to the browser. */
async function relay(upstream: Response) {
  return new Response(await upstream.arrayBuffer(), {
    status: upstream.status,
    headers: {
      "Content-Type":
        upstream.headers.get("Content-Type") ?? "application/json",
      "Cache-Control": "no-store",
    },
  });
}

/** GET /health on the real server. */
export async function proxyHealth() {
  const denied = await staffGuard();
  if (denied) return denied;

  const config = upstreamConfig();
  if (!config) return Response.json({ ok: false }, { status: 503 });

  try {
    const upstream = await fetch(`${config.url}/health`, {
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    return relay(upstream);
  } catch {
    return Response.json({ ok: false }, { status: 503 });
  }
}

/**
 * POST /analyze or /analyze-word on the real server, with the API key added.
 * Returns 503 when the server can't be reached, which the client treats
 * like "offline".
 */
export async function proxyAnalyze(
  request: Request,
  path: "/analyze" | "/analyze-word",
) {
  const denied = await staffGuard();
  if (denied) return denied;

  const config = upstreamConfig();
  if (!config) {
    console.error("PRONOUNCE_API_URL or PRONOUNCE_API_KEY is not set.");
    return jsonError(500, "The pronunciation server is not configured.");
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return jsonError(400, "Expected multipart/form-data.");
  }

  try {
    // No Content-Type: fetch adds it with the multipart boundary.
    const upstream = await fetch(`${config.url}${path}`, {
      method: "POST",
      headers: { "X-API-Key": config.key },
      body: form,
      cache: "no-store",
      signal: AbortSignal.any([
        request.signal,
        AbortSignal.timeout(upstreamTimeoutMs),
      ]),
    });

    if (upstream.status === 401) {
      // The browser can't fix this, so make it visible in the server logs.
      console.error("Pronunciation server rejected PRONOUNCE_API_KEY (401).");
    }

    return relay(upstream);
  } catch {
    return jsonError(503, "Could not reach the pronunciation server.");
  }
}
