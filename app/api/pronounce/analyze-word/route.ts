import { proxyAnalyze } from "@/lib/pronunciationProxy";

export function POST(request: Request) {
  return proxyAnalyze(request, "/analyze-word");
}
