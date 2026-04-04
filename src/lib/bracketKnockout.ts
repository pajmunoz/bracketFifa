import type { Team } from "@/types/bracket";

export type KnockoutMatch = {
  awayId: string;
  homeId: string;
  id: string;
};

const GROUP_LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H"] as const;

function firstPlace(groupId: string, orders: Record<string, string[]>): string {
  return orders[groupId]?.[0] ?? "";
}

function secondPlace(groupId: string, orders: Record<string, string[]>): string {
  return orders[groupId]?.[1] ?? "";
}

/** Octavos: 1º vs 2º del grupo emparejado. */
export function buildR16Fixtures(
  orders: Record<string, string[]>,
): KnockoutMatch[] {
  const [a, b, c, d, e, f, g, h] = GROUP_LETTERS;
  return [
    {
      awayId: secondPlace(b, orders),
      homeId: firstPlace(a, orders),
      id: "r16-0",
    },
    {
      awayId: secondPlace(a, orders),
      homeId: firstPlace(b, orders),
      id: "r16-1",
    },
    {
      awayId: secondPlace(d, orders),
      homeId: firstPlace(c, orders),
      id: "r16-2",
    },
    {
      awayId: secondPlace(c, orders),
      homeId: firstPlace(d, orders),
      id: "r16-3",
    },
    {
      awayId: secondPlace(f, orders),
      homeId: firstPlace(e, orders),
      id: "r16-4",
    },
    {
      awayId: secondPlace(e, orders),
      homeId: firstPlace(f, orders),
      id: "r16-5",
    },
    {
      awayId: secondPlace(h, orders),
      homeId: firstPlace(g, orders),
      id: "r16-6",
    },
    {
      awayId: secondPlace(g, orders),
      homeId: firstPlace(h, orders),
      id: "r16-7",
    },
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
