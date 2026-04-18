import { getSubmissionByEntryId } from "@/lib/getSubmissionByEntryId";

export const maxDuration = 30;
export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: { params: Promise<{ entryId: string }> },
) {
  const { entryId } = await context.params;
  const id = decodeURIComponent(entryId).trim();
  if (id.length < 4 || id.length > 64) {
    return Response.json({ error: "Invalid entry id" }, { status: 400 });
  }

  try {
    const submission = await getSubmissionByEntryId(id);
    if (!submission) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }
    return Response.json(submission);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Query failed";
    return Response.json({ error: message }, { status: 500 });
  }
}
