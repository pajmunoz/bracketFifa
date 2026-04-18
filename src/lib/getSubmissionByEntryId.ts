import type { RowDataPacket } from "mysql2";
import { getPool } from "@/lib/db";
import { rowToBracketSubmission } from "@/lib/submissionPayload";
import type { BracketSubmission } from "@/types/bracket";

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

export async function getSubmissionByEntryId(
  entryId: string,
): Promise<BracketSubmission | null> {
  const id = decodeURIComponent(entryId).trim();
  if (id.length < 4 || id.length > 64) {
    return null;
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
      return null;
    }
    return rowToBracketSubmission(row);
  } catch {
    return null;
  }
}
