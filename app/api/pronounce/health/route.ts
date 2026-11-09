import { proxyHealth } from "@/lib/pronunciationProxy";

export const dynamic = "force-dynamic";

export function GET() {
  return proxyHealth();
}
