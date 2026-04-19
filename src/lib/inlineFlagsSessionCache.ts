const PREFIX = "bracketFifa.inlineFlags.v1:";

export function readInlineFlagsCache(entryId: string): Record<string, string> | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const raw = window.sessionStorage.getItem(PREFIX + entryId);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return null;
    }
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(parsed)) {
      if (typeof v === "string" && v.startsWith("data:")) {
        out[k] = v;
      }
    }
    return out;
  } catch {
    return null;
  }
}

export function writeInlineFlagsCache(
  entryId: string,
  map: Record<string, string>,
): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.sessionStorage.setItem(PREFIX + entryId, JSON.stringify(map));
  } catch {
    /* cuota de sessionStorage o modo privado */
  }
}

export function inlineFlagsCacheCoversCodes(
  map: Record<string, string>,
  codes: readonly string[],
): boolean {
  return codes.every((cc) => {
    const v = map[cc];
    return typeof v === "string" && v.startsWith("data:");
  });
}
