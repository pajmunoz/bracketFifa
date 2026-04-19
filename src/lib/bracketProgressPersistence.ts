import {
  GROUPS,
  isValidGroupOrder,
  sanitizeGroupOrder,
} from "@/data/worldCup2026";
import {
  QF_IDS,
  R16_IDS,
  R32_IDS,
  SF_IDS,
} from "@/lib/bracketKnockout";
import {
  BRACKET_PROGRESS_STORAGE_KEY,
  type BracketPhase,
  type RegistrationForm,
} from "@/types/bracket";

const PROGRESS_VERSION = 1 as const;

const VALID_PHASES = new Set<BracketPhase>([
  "final",
  "groups",
  "qf",
  "r16",
  "r32",
  "sf",
  "third",
]);

export type RestoredBracketProgress = {
  championId: string | null;
  form: RegistrationForm;
  groupOrders: Record<string, string[]>;
  groupStepIndex: number;
  phase: BracketPhase;
  qfWinners: Record<string, string>;
  r16Winners: Record<string, string>;
  r32Winners: Record<string, string>;
  sfWinners: Record<string, string>;
  thirdPlaceId: string | null;
};

function emptyWinnerMap(ids: readonly string[]): Record<string, string> {
  return Object.fromEntries(ids.map((id) => [id, ""]));
}

function mergeWinnerMap(
  ids: readonly string[],
  raw: unknown,
): Record<string, string> {
  const out = emptyWinnerMap(ids);
  if (!raw || typeof raw !== "object" || raw === null) {
    return out;
  }
  const o = raw as Record<string, unknown>;
  for (const id of ids) {
    const v = o[id];
    if (typeof v === "string") {
      out[id] = v;
    }
  }
  return out;
}

function parsePhase(raw: unknown): BracketPhase | null {
  if (typeof raw !== "string" || !VALID_PHASES.has(raw as BracketPhase)) {
    return null;
  }
  return raw as BracketPhase;
}

function parseGroupOrders(raw: unknown): Record<string, string[]> {
  if (!raw || typeof raw !== "object" || raw === null) {
    return {};
  }
  const o = raw as Record<string, unknown>;
  const out: Record<string, string[]> = {};
  for (const g of GROUPS) {
    const v = o[g.id];
    if (
      !Array.isArray(v) ||
      v.length === 0 ||
      !v.every((x): x is string => typeof x === "string")
    ) {
      continue;
    }
    if (v.length === 1 && g.teamIds.includes(v[0]!)) {
      out[g.id] = v;
      continue;
    }
    if (isValidGroupOrder(v, g.teamIds)) {
      out[g.id] = sanitizeGroupOrder(v, g.teamIds);
    }
  }
  return out;
}

function parseForm(raw: unknown): RegistrationForm {
  const base: RegistrationForm = {
    contestConsent: false,
    email: "",
    marketingConsent: false,
    name: "",
    whatsapp: "",
  };
  if (!raw || typeof raw !== "object" || raw === null) {
    return base;
  }
  const o = raw as Record<string, unknown>;
  return {
    contestConsent: o.contestConsent === true,
    email: typeof o.email === "string" ? o.email : "",
    marketingConsent: o.marketingConsent === true,
    name: typeof o.name === "string" ? o.name : "",
    whatsapp: typeof o.whatsapp === "string" ? o.whatsapp : "",
  };
}

function parseOptionalTeamId(raw: unknown): string | null {
  if (raw === null || raw === undefined) {
    return null;
  }
  if (typeof raw === "string" && raw.length > 0) {
    return raw;
  }
  return null;
}

function clampGroupStepIndex(raw: unknown): number {
  const max = Math.max(0, GROUPS.length - 1);
  const n = typeof raw === "number" && Number.isFinite(raw) ? Math.trunc(raw) : 0;
  return Math.min(Math.max(0, n), max);
}

export function clearBracketProgress(): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.removeItem(BRACKET_PROGRESS_STORAGE_KEY);
  } catch {
    /* cuota o modo privado */
  }
}

export function readBracketProgress(): RestoredBracketProgress | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const raw = window.localStorage.getItem(BRACKET_PROGRESS_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const data = JSON.parse(raw) as unknown;
    if (!data || typeof data !== "object" || data === null) {
      return null;
    }
    const o = data as Record<string, unknown>;
    if (o.version !== PROGRESS_VERSION) {
      return null;
    }
    const phase = parsePhase(o.phase);
    if (!phase) {
      return null;
    }
    return {
      championId: parseOptionalTeamId(o.championId),
      form: parseForm(o.form),
      groupOrders: parseGroupOrders(o.groupOrders),
      groupStepIndex: clampGroupStepIndex(o.groupStepIndex),
      phase,
      qfWinners: mergeWinnerMap(QF_IDS, o.qfWinners),
      r16Winners: mergeWinnerMap(R16_IDS, o.r16Winners),
      r32Winners: mergeWinnerMap(R32_IDS, o.r32Winners),
      sfWinners: mergeWinnerMap(SF_IDS, o.sfWinners),
      thirdPlaceId: parseOptionalTeamId(o.thirdPlaceId),
    };
  } catch {
    return null;
  }
}

export function writeBracketProgress(snapshot: RestoredBracketProgress): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem(
      BRACKET_PROGRESS_STORAGE_KEY,
      JSON.stringify({
        version: PROGRESS_VERSION,
        ...snapshot,
      }),
    );
  } catch {
    /* cuota o modo privado */
  }
}
