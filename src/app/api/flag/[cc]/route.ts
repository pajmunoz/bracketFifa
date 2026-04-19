import { NextRequest, NextResponse } from "next/server";

/** ISO 3166-1 alpha-2 o variantes usadas por flagcdn (p. ej. gb-eng). */
const CC_RE = /^[a-z0-9-]{2,12}$/i;

type RouteContext = { params: Promise<{ cc: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  const { cc: raw } = await context.params;
  const cc = raw.toLowerCase().replace(/[^a-z0-9-]/g, "");
  if (!CC_RE.test(cc)) {
    return new NextResponse("Invalid cc", { status: 400 });
  }

  const upstream = `https://flagcdn.com/w80/${cc}.png`;
  const res = await fetch(upstream, { next: { revalidate: 86_400 } });
  if (!res.ok) {
    return new NextResponse("Upstream not found", { status: 404 });
  }

  const buf = await res.arrayBuffer();
  const contentType = res.headers.get("content-type") ?? "image/png";

  return new NextResponse(buf, {
    headers: {
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
      "Content-Type": contentType,
    },
  });
}
