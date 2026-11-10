import { requireStaff } from "@/lib/staff-auth";
export const dynamic = "force-dynamic";
export async function GET() { const { user, response } = await requireStaff(); return response ?? Response.json({ id: user!.id }, { headers: { "Cache-Control": "no-store" } }); }
