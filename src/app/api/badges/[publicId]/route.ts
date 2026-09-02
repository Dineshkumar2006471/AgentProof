import { getPublicReport } from "@/lib/aws/dynamodb";
import { isEligibleForBadge } from "@/lib/report-badge";

type BadgeContext = { params: Promise<{ publicId: string }> };

function badgeSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="220" height="48" role="img" aria-label="AgentProof Verified"><rect width="220" height="48" rx="6" fill="#1A2B4C"/><path d="M20 25l6 6 13-15" fill="none" stroke="#F2992E" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><text x="52" y="21" fill="#FFFFFF" font-family="Arial, sans-serif" font-size="12" font-weight="700">AGENTPROOF</text><text x="52" y="36" fill="#BEE7DF" font-family="Arial, sans-serif" font-size="11" font-weight="700">VERIFIED</text></svg>`;
}

export async function GET(_request: Request, context: BadgeContext) {
  const report = await getPublicReport((await context.params).publicId);
  const valid = isEligibleForBadge(report);
  if (!valid) return new Response("Not found", { status: 404 });
  return new Response(badgeSvg(), { headers: { "content-type": "image/svg+xml; charset=utf-8", "cache-control": "public, max-age=3600, s-maxage=3600", "x-content-type-options": "nosniff" } });
}
