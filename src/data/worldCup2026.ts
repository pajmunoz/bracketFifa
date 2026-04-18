import type { GroupDef, Team } from "@/types/bracket";
import { buildGroupOrderFromPicks } from "@/lib/groupOrder";

/** Anfitriones 2026: 1.º fijo en su grupo (México A, Canadá B, EE. UU. D). */
export const HOST_TEAM_ID_BY_GROUP: Partial<Record<string, string>> = {
  A: "t01",
  B: "t05",
  D: "t13",
};

const HOST_TEAM_IDS = new Set(
  Object.values(HOST_TEAM_ID_BY_GROUP).filter(Boolean),
);

/** Fila: código FIFA, nombre (EN), código ISO para flagcdn.com */
const TEAM_ROWS: readonly [string, string, string][] = [
  ["MEX", "Mexico", "mx"],
  ["RSA", "South Africa", "za"],
  ["KOR", "Korea Republic", "kr"],
  ["CZE", "Czechia", "cz"],
  ["CAN", "Canada", "ca"],
  ["BIH", "Bosnia and Herzegovina", "ba"],
  ["QAT", "Qatar", "qa"],
  ["SUI", "Switzerland", "ch"],
  ["BRA", "Brazil", "br"],
  ["MAR", "Morocco", "ma"],
  ["HAI", "Haiti", "ht"],
  ["SCO", "Scotland", "gb-sct"],
  ["USA", "United States", "us"],
  ["PAR", "Paraguay", "py"],
  ["AUS", "Australia", "au"],
  ["TUR", "Türkiye", "tr"],
  ["GER", "Germany", "de"],
  ["CUW", "Curaçao", "cw"],
  ["CIV", "Côte d'Ivoire", "ci"],
  ["ECU", "Ecuador", "ec"],
  ["NED", "Netherlands", "nl"],
  ["JPN", "Japan", "jp"],
  ["SWE", "Sweden", "se"],
  ["TUN", "Tunisia", "tn"],
  ["BEL", "Belgium", "be"],
  ["EGY", "Egypt", "eg"],
  ["IRN", "IR Iran", "ir"],
  ["NZL", "New Zealand", "nz"],
  ["ESP", "Spain", "es"],
  ["CPV", "Cabo Verde", "cv"],
  ["KSA", "Saudi Arabia", "sa"],
  ["URU", "Uruguay", "uy"],
  ["FRA", "France", "fr"],
  ["SEN", "Senegal", "sn"],
  ["NOR", "Norway", "no"],
  ["IRQ", "Iraq", "iq"],
  ["ARG", "Argentina", "ar"],
  ["ALG", "Algeria", "dz"],
  ["AUT", "Austria", "at"],
  ["JOR", "Jordan", "jo"],
  ["POR", "Portugal", "pt"],
  ["COD", "DR Congo", "cd"],
  ["UZB", "Uzbekistan", "uz"],
  ["COL", "Colombia", "co"],
  ["ENG", "England", "gb-eng"],
  ["CRO", "Croatia", "hr"],
  ["GHA", "Ghana", "gh"],
  ["PAN", "Panama", "pa"],
];

function teamId(index: number): string {
  return `t${String(index + 1).padStart(2, "0")}`;
}

export const TEAMS: Record<string, Team> = Object.fromEntries(
  TEAM_ROWS.map((row, i) => {
    const id = teamId(i);
    const [code, name, cc] = row;
    return [
      id,
      {
        code,
        flagUrl: `https://flagcdn.com/w80/${cc}.png`,
        host: HOST_TEAM_IDS.has(id),
        id,
        name,
      } satisfies Team,
    ];
  }),
);

function groupTeamSlice(start: number, len: number): string[] {
  return Array.from({ length: len }, (_, j) => teamId(start + j));
}

export const GROUPS: GroupDef[] = [
  { id: "A", label: "Grupo A", teamIds: groupTeamSlice(0, 4) },
  { id: "B", label: "Grupo B", teamIds: groupTeamSlice(4, 4) },
  { id: "C", label: "Grupo C", teamIds: groupTeamSlice(8, 4) },
  { id: "D", label: "Grupo D", teamIds: groupTeamSlice(12, 4) },
  { id: "E", label: "Grupo E", teamIds: groupTeamSlice(16, 4) },
  { id: "F", label: "Grupo F", teamIds: groupTeamSlice(20, 4) },
  { id: "G", label: "Grupo G", teamIds: groupTeamSlice(24, 4) },
  { id: "H", label: "Grupo H", teamIds: groupTeamSlice(28, 4) },
  { id: "I", label: "Grupo I", teamIds: groupTeamSlice(32, 4) },
  { id: "J", label: "Grupo J", teamIds: groupTeamSlice(36, 4) },
  { id: "K", label: "Grupo K", teamIds: groupTeamSlice(40, 4) },
  { id: "L", label: "Grupo L", teamIds: groupTeamSlice(44, 4) },
];

/** Garantiza anfitrión en 1.º si el estado quedara incoherente (p. ej. datos viejos). */
export function normalizeHostGroupOrder(
  groupId: string,
  teamIds: readonly string[],
): string[] {
  const hostId = HOST_TEAM_ID_BY_GROUP[groupId];
  if (!hostId) {
    return [...teamIds];
  }
  const g = GROUPS.find((gr) => gr.id === groupId);
  if (!g) {
    return [...teamIds];
  }
  if (teamIds[0] === hostId) {
    const set = new Set(teamIds);
    if (teamIds.length === g.teamIds.length && g.teamIds.every((id) => set.has(id))) {
      return [...teamIds];
    }
    const second = teamIds[1] ?? g.teamIds.find((id) => id !== hostId) ?? "";
    return buildGroupOrderFromPicks(g.teamIds, hostId, second);
  }
  const oldFirst = teamIds[0] ?? "";
  let secondPick =
    oldFirst && oldFirst !== hostId
      ? oldFirst
      : (teamIds.find((id, i) => i > 0 && id !== hostId) ??
        g.teamIds.find((id) => id !== hostId) ??
        "");
  if (!secondPick) {
    secondPick = g.teamIds.find((id) => id !== hostId) ?? "";
  }
  return buildGroupOrderFromPicks(g.teamIds, hostId, secondPick);
}
