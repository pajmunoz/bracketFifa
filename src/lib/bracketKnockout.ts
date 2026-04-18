import type { Team } from "@/types/bracket";

export type KnockoutMatch = {
  awayId: string;
  homeId: string;
  id: string;
};

export const R32_IDS = [
  "r32-0",
  "r32-1",
  "r32-2",
  "r32-3",
  "r32-4",
  "r32-5",
  "r32-6",
  "r32-7",
  "r32-8",
  "r32-9",
  "r32-10",
  "r32-11",
  "r32-12",
  "r32-13",
  "r32-14",
  "r32-15",
] as const;

function firstPlace(groupId: string, orders: Record<string, string[]>): string {
  return orders[groupId]?.[0] ?? "";
}

function secondPlace(groupId: string, orders: Record<string, string[]>): string {
  return orders[groupId]?.[1] ?? "";
}

function thirdPlace(groupId: string, orders: Record<string, string[]>): string {
  return orders[groupId]?.[2] ?? "";
}

/**
 * Huecos FIFA "3.er del grupo X/Y/…": se usa el 3.er del grupo con letra
 * alfabéticamente más temprana del pool (predicción simplificada).
 */
function pickThirdFromPool(
  orders: Record<string, string[]>,
  pool: readonly string[],
): string {
  const sorted = [...pool].sort((a, b) => a.localeCompare(b));
  for (const g of sorted) {
    const t = thirdPlace(g, orders);
    if (t) {
      return t;
    }
  }
  return "";
}

/** Partidos 73–88 del Mundial 2026 (orden FIFA). */
export function buildR32Fixtures(
  orders: Record<string, string[]>,
): KnockoutMatch[] {
  const p1 = (g: string) => firstPlace(g, orders);
  const p2 = (g: string) => secondPlace(g, orders);
  const p3 = (pool: readonly string[]) => pickThirdFromPool(orders, pool);

  return [
    { awayId: p2("B"), homeId: p2("A"), id: "r32-0" },
    { awayId: p3(["A", "B", "C", "D", "F"]), homeId: p1("E"), id: "r32-1" },
    { awayId: p2("C"), homeId: p1("F"), id: "r32-2" },
    { awayId: p2("F"), homeId: p1("C"), id: "r32-3" },
    { awayId: p3(["C", "D", "F", "G", "H"]), homeId: p1("I"), id: "r32-4" },
    { awayId: p2("I"), homeId: p2("E"), id: "r32-5" },
    { awayId: p3(["C", "E", "F", "H", "I"]), homeId: p1("A"), id: "r32-6" },
    { awayId: p3(["E", "H", "I", "J", "K"]), homeId: p1("L"), id: "r32-7" },
    { awayId: p3(["B", "E", "F", "I", "J"]), homeId: p1("D"), id: "r32-8" },
    { awayId: p3(["A", "E", "H", "I", "J"]), homeId: p1("G"), id: "r32-9" },
    { awayId: p2("L"), homeId: p2("K"), id: "r32-10" },
    { awayId: p2("J"), homeId: p1("H"), id: "r32-11" },
    { awayId: p3(["E", "F", "G", "I", "J"]), homeId: p1("B"), id: "r32-12" },
    { awayId: p2("H"), homeId: p1("J"), id: "r32-13" },
    { awayId: p3(["D", "E", "I", "J", "L"]), homeId: p1("K"), id: "r32-14" },
    { awayId: p2("G"), homeId: p2("D"), id: "r32-15" },
  ];
}

/** Octavos (partidos 89–96) a partir de ganadores de dieciseisavos. */
export function buildR16FromR32Results(
  r32Winners: Record<string, string>,
): KnockoutMatch[] {
  const win = (fifaMatchNum: number) =>
    r32Winners[`r32-${fifaMatchNum - 73}`] ?? "";
  return [
    { awayId: win(77), homeId: win(74), id: "r16-0" },
    { awayId: win(75), homeId: win(73), id: "r16-1" },
    { awayId: win(78), homeId: win(76), id: "r16-2" },
    { awayId: win(80), homeId: win(79), id: "r16-3" },
    { awayId: win(84), homeId: win(83), id: "r16-4" },
    { awayId: win(82), homeId: win(81), id: "r16-5" },
    { awayId: win(88), homeId: win(86), id: "r16-6" },
    { awayId: win(87), homeId: win(85), id: "r16-7" },
  ];
}

export function buildQFMatches(
  r16Winners: Record<string, string>,
): KnockoutMatch[] {
  const w = (id: string) => r16Winners[id] ?? "";
  return [
    { awayId: w("r16-1"), homeId: w("r16-0"), id: "qf-0" },
    { awayId: w("r16-3"), homeId: w("r16-2"), id: "qf-1" },
    { awayId: w("r16-5"), homeId: w("r16-4"), id: "qf-2" },
    { awayId: w("r16-7"), homeId: w("r16-6"), id: "qf-3" },
  ];
}

export function buildSFMatches(
  qfWinners: Record<string, string>,
): KnockoutMatch[] {
  const w = (id: string) => qfWinners[id] ?? "";
  return [
    { awayId: w("qf-1"), homeId: w("qf-0"), id: "sf-0" },
    { awayId: w("qf-3"), homeId: w("qf-2"), id: "sf-1" },
  ];
}

export function buildFinalMatch(
  sfWinners: Record<string, string>,
): KnockoutMatch {
  return {
    awayId: sfWinners["sf-1"] ?? "",
    homeId: sfWinners["sf-0"] ?? "",
    id: "final",
  };
}

export function loserOfMatch(
  match: KnockoutMatch,
  winnerId: string | undefined,
): string {
  if (!winnerId) {
    return "";
  }
  if (winnerId === match.homeId) {
    return match.awayId;
  }
  if (winnerId === match.awayId) {
    return match.homeId;
  }
  return "";
}

export function buildThirdPlaceMatch(
  sfMatches: KnockoutMatch[],
  sfWinners: Record<string, string>,
): KnockoutMatch {
  const m0 = sfMatches[0];
  const m1 = sfMatches[1];
  if (!m0 || !m1) {
    return { awayId: "", homeId: "", id: "third" };
  }
  return {
    awayId: loserOfMatch(m1, sfWinners["sf-1"]),
    homeId: loserOfMatch(m0, sfWinners["sf-0"]),
    id: "third",
  };
}

export function teamOrPlaceholder(
  id: string,
  teams: Record<string, Team>,
): Team | null {
  if (!id) {
    return null;
  }
  return teams[id] ?? null;
}
