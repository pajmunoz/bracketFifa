import type { RowDataPacket } from "mysql2";
import { getPool } from "@/lib/db";
import { rowToBracketSubmission } from "@/lib/submissionPayload";

export const maxDuration = 30;
export const runtime = "nodejs";

type SubmissionRow = RowDataPacket & {
  email: string;
  entry_id: string;
  groups_json: unknown;
  knockout_json?: unknown;
  name: string;
  predicted_winner_code: string;
  predicted_winner_name: string;
  scores_json: unknown;
  submitted_at: Date;
  whatsapp: string;
};

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
    const pool = getPool();
    const [rows] = await pool.execute<SubmissionRow[]>(
      `SELECT entry_id, email, name, whatsapp,
        predicted_winner_code, predicted_winner_name,
        submitted_at, groups_json, scores_json, knockout_json
      FROM bracket_submissions
      WHERE entry_id = ?
      LIMIT 1`,
      [id],
    );

    const row = rows[0];
    if (!row) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }

    const submission = rowToBracketSubmission(row);
    if (!submission) {
      return Response.json({ error: "Corrupt row" }, { status: 500 });
    }

    return Response.json(submission);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Query failed";
    return Response.json({ error: message }, { status: 500 });
  }
}
