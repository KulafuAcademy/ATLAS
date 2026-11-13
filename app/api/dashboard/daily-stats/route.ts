import { parseDashboardQuery } from "@/lib/dashboard/query";
import { queryDailyStats } from "@/lib/dashboard/server";
import { requireStaff } from "@/lib/staff-auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { response } = await requireStaff();
  if (response) return response;
  const query = parseDashboardQuery(request.url);
  if (!query) return Response.json({ error: "Invalid date range." }, { status: 400 });
  try {
    const rows = await queryDailyStats(query.start, query.end);
    return Response.json({ rows }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("dashboard daily-stats failed", error);
    return Response.json({ error: "Could not load practice stats." }, { status: 502 });
  }
}
