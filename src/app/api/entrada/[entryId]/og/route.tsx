import { ImageResponse } from "next/og";
import { EntryOgImage } from "@/lib/entryOgImage";
import { getSubmissionByEntryId } from "@/lib/getSubmissionByEntryId";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  request: Request,
  context: { params: Promise<{ entryId: string }> },
) {
  const { entryId } = await context.params;
  const submission = await getSubmissionByEntryId(entryId);
  if (!submission) {
    return new Response("Not found", { status: 404 });
  }

  const localeRaw = new URL(request.url).searchParams.get("locale");
  const locale = localeRaw === "en" ? "en" : "es";

  return new ImageResponse(
    <EntryOgImage data={submission} locale={locale} />,
    { height: 630, width: 1200 },
  );
}
