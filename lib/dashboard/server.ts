import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { toDailyRow, type AttemptRow, type DailyRow } from "@/lib/dashboard/aggregate";
import { addDays, manilaDayStartTimestamp } from "@/lib/dashboard/dates";
import type { DashboardQuery } from "@/lib/dashboard/query";
import { staffAuthConfig } from "@/lib/staff-auth";

// Server-only, read-only access to the practice stats. The Supabase URL and
// key come from the server-side AMPLIFY_SUPABASE_* variables and never reach
// the browser; the browser calls /api/dashboard/* (staff only) instead.
// Supabase caps responses at 1000 rows, so every query is filtered by date
// and paged with .range() until a short page comes back.

const PAGE_SIZE = 1000;
const DAILY_COLUMNS = "day,sound_focus,pair_no,pair_id,target,text,pair_word,tries,attempts,perfect,avg_score";

let client: SupabaseClient | null = null;

function supabase(): SupabaseClient {
  if (client) return client;
  const config = staffAuthConfig();
  if (!config) throw new Error("Dashboard data is not configured.");
  client = createClient(config.url, config.anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
  return client;
}

type Page<T> = { data: T[] | null; error: { message: string } | null };

async function fetchAll<T>(page: (from: number, to: number) => PromiseLike<Page<T>>): Promise<T[]> {
  const rows: T[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await page(from, from + PAGE_SIZE - 1);
    if (error) throw new Error(error.message);
    rows.push(...(data ?? []));
    if (!data || data.length < PAGE_SIZE) return rows;
  }
}

/** `daily_stats` rows from `start` (inclusive; null = all time) to `end` (inclusive). */
export async function queryDailyStats(start: string | null, end: string): Promise<DailyRow[]> {
  const db = supabase();
  const raw = await fetchAll<Record<string, unknown>>((from, to) => {
    let query = db.from("daily_stats").select(DAILY_COLUMNS).lte("day", end);
    if (start) query = query.gte("day", start);
    // A stable order keeps pages from overlapping or skipping rows.
    return query.order("day").order("pair_id").order("target").range(from, to);
  });
  return raw.map(toDailyRow);
}

/** Usable attempts (ok = true) in the Manila date range, for the retry chart. */
export async function queryRetryAttempts({ start, end, focus }: DashboardQuery): Promise<AttemptRow[]> {
  const db = supabase();
  const raw = await fetchAll<Record<string, unknown>>((from, to) => {
    let query = db
      .from("attempts")
      .select("attempt_no,perfect")
      .eq("ok", true)
      .lt("created_at", manilaDayStartTimestamp(addDays(end, 1)));
    if (start) query = query.gte("created_at", manilaDayStartTimestamp(start));
    if (focus) query = query.eq("sound_focus", focus);
    return query.order("id").range(from, to);
  });
  return raw.map((row) => ({ attempt_no: Number(row.attempt_no), perfect: row.perfect === true }));
}
