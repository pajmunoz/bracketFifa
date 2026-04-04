import type { ResultSetHeader } from "mysql2";
import { getPool } from "@/lib/db";
import { parseBracketSubmissionBody } from "@/lib/submissionPayload";

export const maxDuration = 30;
export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const payload = parseBracketSubmissionBody(body);
  if (!payload) {
    return Response.json({ error: "Invalid submission payload" }, { status: 400 });
  }

  let submittedAt: Date;
  try {
    submittedAt = new Date(payload.submittedAt);
    if (Number.isNaN(submittedAt.getTime())) {
      return Response.json({ error: "Invalid submittedAt" }, { status: 400 });
    }
  } catch {
    return Response.json({ error: "Invalid submittedAt" }, { status: 400 });
  }

  try {
    const pool = getPool();
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO bracket_submissions (
        entry_id, email, name, whatsapp,
        predicted_winner_code, predicted_winner_name,
        submitted_at, groups_json, scores_json, knockout_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        payload.entryId,
        payload.email,
        payload.name,
        payload.whatsapp,
        payload.predictedWinnerCode,
        payload.predictedWinnerName,
        submittedAt,
        JSON.stringify(payload.groups),
        JSON.stringify({}),
        JSON.stringify(payload.knockout),
      ],
    );

    return Response.json(
      { entryId: payload.entryId, insertId: result.insertId },
      { status: 201 },
    );
  } catch (err) {
    const code = err as { code?: string };
    if (code.code === "ER_DUP_ENTRY") {
      return Response.json(
        { error: "Duplicate entry id; submit again to get a new id." },
        { status: 409 },
      );
    }
    const message = err instanceof Error ? err.message : "Insert failed";
    return Response.json({ error: message }, { status: 500 });
  }
}
