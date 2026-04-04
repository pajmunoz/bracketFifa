import { GROUPS, TEAMS } from "@/data/worldCup2026";
import {
  buildFinalMatch,
  buildQFMatches,
  buildR16Fixtures,
  buildSFMatches,
  buildThirdPlaceMatch,
} from "@/lib/bracketKnockout";
import type { BracketSubmission, KnockoutData } from "@/types/bracket";

const R16_IDS = [
  "r16-0",
  "r16-1",
  "r16-2",
  "r16-3",
  "r16-4",
  "r16-5",
  "r16-6",
  "r16-7",
] as const;
const QF_IDS = ["qf-0", "qf-1", "qf-2", "qf-3"] as const;
const SF_IDS = ["sf-0", "sf-1"] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseKnockout(raw: unknown): KnockoutData | null {
  if (!isRecord(raw)) {
    return null;
  }
  const r16In = raw.r16;
  const qfIn = raw.qf;
  const sfIn = raw.sf;
  const championId = raw.championId;
  const thirdPlaceId = raw.thirdPlaceId;
  if (
    !isRecord(r16In) ||
    !isRecord(qfIn) ||
    !isRecord(sfIn) ||
    typeof championId !== "string" ||
    typeof thirdPlaceId !== "string"
  ) {
    return null;
  }
  if (Object.keys(r16In).length !== R16_IDS.length) {
    return null;
  }
  if (Object.keys(qfIn).length !== QF_IDS.length) {
    return null;
  }
  if (Object.keys(sfIn).length !== SF_IDS.length) {
    return null;
  }

  const r16: Record<string, string> = {};
  for (const id of R16_IDS) {
    const v = r16In[id];
    if (typeof v !== "string" || !v) {
      return null;
    }
    r16[id] = v;
  }
  const qf: Record<string, string> = {};
  for (const id of QF_IDS) {
    const v = qfIn[id];
    if (typeof v !== "string" || !v) {
      return null;
    }
    qf[id] = v;
  }
  const sf: Record<string, string> = {};
  for (const id of SF_IDS) {
    const v = sfIn[id];
    if (typeof v !== "string" || !v) {
      return null;
    }
    sf[id] = v;
  }
  return {
    championId: championId.trim(),
    qf,
    r16,
    sf,
    thirdPlaceId: thirdPlaceId.trim(),
  };
}

function validateGroupOrders(groups: Record<string, string[]>): boolean {
  for (const g of GROUPS) {
    const order = groups[g.id];
    if (!Array.isArray(order)) {
      return false;
    }
    const ids = order.map((x) => (typeof x === "string" ? x : ""));
    if (ids.length !== g.teamIds.length) {
      return false;
    }
    const set = new Set(ids);
    if (set.size !== g.teamIds.length) {
      return false;
    }
    for (const tid of g.teamIds) {
      if (!set.has(tid) || !TEAMS[tid]) {
        return false;
      }
    }
  }
  return true;
}

function validateKnockoutCoherence(
  groups: Record<string, string[]>,
  k: KnockoutData,
): boolean {
  const r16 = buildR16Fixtures(groups);
  for (const m of r16) {
    const w = k.r16[m.id];
    if (w !== m.homeId && w !== m.awayId) {
      return false;
    }
  }
  const qfMatches = buildQFMatches(k.r16);
  for (const m of qfMatches) {
    const w = k.qf[m.id];
    if (w !== m.homeId && w !== m.awayId) {
      return false;
    }
  }
  const sfMatches = buildSFMatches(k.qf);
  for (const m of sfMatches) {
    const w = k.sf[m.id];
    if (w !== m.homeId && w !== m.awayId) {
      return false;
    }
  }
  const fin = buildFinalMatch(k.sf);
  if (
    k.championId !== fin.homeId &&
    k.championId !== fin.awayId
  ) {
    return false;
  }
  const thirdM = buildThirdPlaceMatch(sfMatches, k.sf);
  if (
    k.thirdPlaceId !== thirdM.homeId &&
    k.thirdPlaceId !== thirdM.awayId
  ) {
    return false;
  }
  if (!TEAMS[k.championId] || !TEAMS[k.thirdPlaceId]) {
    return false;
  }
  return true;
}

export function parseBracketSubmissionBody(
  raw: unknown,
): BracketSubmission | null {
  if (!isRecord(raw)) {
    return null;
  }

  const email = raw.email;
  const entryId = raw.entryId;
  const name = raw.name;
  const predictedWinnerCode = raw.predictedWinnerCode;
  const predictedWinnerName = raw.predictedWinnerName;
  const submittedAt = raw.submittedAt;
  const whatsapp = raw.whatsapp;
  const groups = raw.groups;
  const knockout = parseKnockout(raw.knockout);

  if (
    typeof email !== "string" ||
    typeof entryId !== "string" ||
    typeof name !== "string" ||
    typeof predictedWinnerCode !== "string" ||
    typeof predictedWinnerName !== "string" ||
    typeof submittedAt !== "string" ||
    typeof whatsapp !== "string" ||
    knockout === null
  ) {
    return null;
  }

  if (!isRecord(groups)) {
    return null;
  }

  const groupOrders: Record<string, string[]> = {};
  for (const g of GROUPS) {
    const order = groups[g.id];
    if (!Array.isArray(order)) {
      return null;
    }
    groupOrders[g.id] = order.map((x) => (typeof x === "string" ? x : ""));
  }

  if (!validateGroupOrders(groupOrders)) {
    return null;
  }

  if (!validateKnockoutCoherence(groupOrders, knockout)) {
    return null;
  }

  const champ = TEAMS[knockout.championId];
  const codeTrim = predictedWinnerCode.trim().slice(0, 8);
  if (!champ || champ.code !== codeTrim) {
    return null;
  }

  const emailTrim = email.trim();
  if (
    emailTrim.length < 3 ||
    emailTrim.length > 254 ||
    !emailTrim.includes("@")
  ) {
    return null;
  }

  const entryTrim = entryId.trim();
  if (entryTrim.length < 4 || entryTrim.length > 64) {
    return null;
  }

  return {
    email: emailTrim,
    entryId: entryTrim,
    groups: groupOrders,
    knockout,
    name: name.trim().slice(0, 255),
    predictedWinnerCode: predictedWinnerCode.trim().slice(0, 8),
    predictedWinnerName: predictedWinnerName.trim().slice(0, 128),
    submittedAt,
    whatsapp: whatsapp.trim().slice(0, 64),
  };
}

function parseJsonColumn(value: unknown): unknown {
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as unknown;
    } catch {
      return null;
    }
  }
  return value;
}

export function rowToBracketSubmission(row: {
  entry_id: string;
  email: string;
  name: string;
  whatsapp: string;
  predicted_winner_code: string;
  predicted_winner_name: string;
  submitted_at: Date | string;
  groups_json: unknown;
  knockout_json?: unknown;
  scores_json?: unknown;
}): BracketSubmission | null {
  const groups = parseJsonColumn(row.groups_json);
  const knockoutRaw =
    row.knockout_json !== undefined && row.knockout_json !== null
      ? parseJsonColumn(row.knockout_json)
      : null;

  const submittedAt =
    row.submitted_at instanceof Date
      ? row.submitted_at.toISOString()
      : String(row.submitted_at);

  const base = {
    email: row.email,
    entryId: row.entry_id,
    groups,
    knockout: knockoutRaw,
    name: row.name,
    predictedWinnerCode: row.predicted_winner_code,
    predictedWinnerName: row.predicted_winner_name,
    submittedAt,
    whatsapp: row.whatsapp,
  };

  return parseBracketSubmissionBody(base);
}
