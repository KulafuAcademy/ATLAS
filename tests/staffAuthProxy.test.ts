import assert from "node:assert/strict";
import test from "node:test";
import { NextRequest } from "next/server";
import { proxy } from "../proxy";

const keys = ["AMPLIFY_SUPABASE_URL", "AMPLIFY_SUPABASE_ANON_KEY"] as const;
const previous = Object.fromEntries(keys.map((key) => [key, process.env[key]]));

test("staff login endpoint remains reachable before authentication", async () => {
  delete process.env.AMPLIFY_SUPABASE_URL;
  delete process.env.AMPLIFY_SUPABASE_ANON_KEY;
  const response = await proxy(new NextRequest("http://localhost/staff/login"));
  assert.equal(response.headers.get("x-middleware-next"), "1");
});

test("protected pages redirect to the login page when auth is unconfigured", async () => {
  delete process.env.AMPLIFY_SUPABASE_URL;
  delete process.env.AMPLIFY_SUPABASE_ANON_KEY;
  const response = await proxy(new NextRequest("http://localhost/practice"));
  assert.equal(response.status, 307);
  assert.equal(response.headers.get("location"), "http://localhost/staff/login?setup=required");
});

test("all API routes, including dotted paths, fail closed when auth is unconfigured", async () => {
  delete process.env.AMPLIFY_SUPABASE_URL;
  delete process.env.AMPLIFY_SUPABASE_ANON_KEY;
  const response = await proxy(new NextRequest("http://localhost/api/pronunciation/score.v1"));
  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), { error: "Staff authentication is not configured." });
});

test("authenticated endpoints return unauthorized when no Supabase session exists", async () => {
  process.env.AMPLIFY_SUPABASE_URL = "https://atlas-auth-test.supabase.co";
  process.env.AMPLIFY_SUPABASE_ANON_KEY = "test-publishable-key";
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => Response.json({ message: "Invalid token" }, { status: 401 });
  try {
    const response = await proxy(new NextRequest("http://localhost/api/pronunciation/score"));
    assert.equal(response.status, 401);
    assert.deepEqual(await response.json(), { error: "Sign in is required." });
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test.after(() => {
  for (const key of keys) {
    const value = previous[key];
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});
