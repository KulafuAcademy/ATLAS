import { parseDashboardQuery } from "@/lib/dashboard/query";
import { queryRetryAttempts } from "@/lib/dashboard/server";
import { requireStaff } from "@/lib/staff-auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { response } = await requireStaff();
  if (response) return response;
  const query = parseDashboardQuery(request.url);
  if (!query) return Response.json({ error: "Invalid date range or sound focus." }, { status: 400 });
  try {
    const rows = await queryRetryAttempts(query);
    return Response.json({ rows }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("dashboard retry-attempts failed", error);
    return Response.json({ error: "Could not load retry stats." }, { status: 502 });
  }
}
