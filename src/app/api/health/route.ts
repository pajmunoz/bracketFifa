import { pingDb } from "@/lib/db";

export const maxDuration = 15;
export const runtime = "nodejs";

function hasDbEnv(): boolean {
  return Boolean(
    process.env.DB_HOST &&
      process.env.DB_USER &&
      process.env.DB_PASSWORD !== undefined &&
      process.env.DB_NAME,
  );
}

export async function GET() {
  if (!hasDbEnv()) {
    return Response.json(
      {
        db: "not_configured",
        message:
          "Define DB_HOST, DB_USER, DB_PASSWORD, DB_NAME for database checks.",
        ok: true,
      },
      { status: 200 },
    );
  }

  try {
    await pingDb();
    return Response.json({ db: "up", ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Database unreachable";
    return Response.json({ db: "down", error: message, ok: false }, { status: 503 });
  }
}
