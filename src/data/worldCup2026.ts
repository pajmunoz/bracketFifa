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

/** Fila: código FIFA, nombre (EN), nombre (ES), código ISO para flagcdn.com */
const TEAM_ROWS: readonly [string, string, string, string][] = [
  ["MEX", "Mexico", "México", "mx"],
  ["RSA", "South Africa", "Sudáfrica", "za"],
  ["KOR", "Korea Republic", "Corea del Sur", "kr"],
  ["CZE", "Czechia", "Chequia", "cz"],
  ["CAN", "Canada", "Canadá", "ca"],
  ["BIH", "Bosnia and Herzegovina", "Bosnia y Herzegovina", "ba"],
  ["QAT", "Qatar", "Catar", "qa"],
  ["SUI", "Switzerland", "Suiza", "ch"],
  ["BRA", "Brazil", "Brasil", "br"],
  ["MAR", "Morocco", "Marruecos", "ma"],
  ["HAI", "Haiti", "Haití", "ht"],
  ["SCO", "Scotland", "Escocia", "gb-sct"],
  ["USA", "United States", "Estados Unidos", "us"],
  ["PAR", "Paraguay", "Paraguay", "py"],
  ["AUS", "Australia", "Australia", "au"],
  ["TUR", "Türkiye", "Turquía", "tr"],
  ["GER", "Germany", "Alemania", "de"],
  ["CUW", "Curaçao", "Curazao", "cw"],
  ["CIV", "Côte d'Ivoire", "Costa de Marfil", "ci"],
  ["ECU", "Ecuador", "Ecuador", "ec"],
  ["NED", "Netherlands", "Países Bajos", "nl"],
  ["JPN", "Japan", "Japón", "jp"],
  ["SWE", "Sweden", "Suecia", "se"],
  ["TUN", "Tunisia", "Túnez", "tn"],
  ["BEL", "Belgium", "Bélgica", "be"],
  ["EGY", "Egypt", "Egipto", "eg"],
  ["IRN", "IR Iran", "Irán", "ir"],
  ["NZL", "New Zealand", "Nueva Zelanda", "nz"],
  ["ESP", "Spain", "España", "es"],
  ["CPV", "Cabo Verde", "Cabo Verde", "cv"],
  ["KSA", "Saudi Arabia", "Arabia Saudita", "sa"],
  ["URU", "Uruguay", "Uruguay", "uy"],
  ["FRA", "France", "Francia", "fr"],
  ["SEN", "Senegal", "Senegal", "sn"],
  ["NOR", "Norway", "Noruega", "no"],
  ["IRQ", "Iraq", "Irak", "iq"],
  ["ARG", "Argentina", "Argentina", "ar"],
  ["ALG", "Algeria", "Argelia", "dz"],
  ["AUT", "Austria", "Austria", "at"],
  ["JOR", "Jordan", "Jordania", "jo"],
  ["POR", "Portugal", "Portugal", "pt"],
  ["COD", "DR Congo", "R. D. Congo", "cd"],
  ["UZB", "Uzbekistan", "Uzbekistán", "uz"],
  ["COL", "Colombia", "Colombia", "co"],
  ["ENG", "England", "Inglaterra", "gb-eng"],
  ["CRO", "Croatia", "Croacia", "hr"],
  ["GHA", "Ghana", "Ghana", "gh"],
  ["PAN", "Panama", "Panamá", "pa"],
];

function teamId(index: number): string {
  return `t${String(index + 1).padStart(2, "0")}`;
}

export const TEAMS: Record<string, Team> = Object.fromEntries(
  TEAM_ROWS.map((row, i) => {
    const id = teamId(i);
    const [code, name, nameEs, cc] = row;
    return [
      id,
      {
        code,
        flagUrl: `https://flagcdn.com/w80/${cc}.png`,
        host: HOST_TEAM_IDS.has(id),
        id,
        name,
        nameEs,
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

/** Detecta orden inválido (duplicados, longitud o equipos que no son del grupo). */
export function isValidGroupOrder(
  order: readonly string[] | undefined,
  base: readonly string[],
): boolean {
  if (!order || order.length !== base.length) {
    return false;
  }
  if (new Set(order).size !== order.length) {
    return false;
  }
  const baseSet = new Set(base);
  return order.every((id) => baseSet.has(id));
}

/** Repara orden corrupto y aplica regla de anfitrión. */
export function sanitizeGroupOrder(
  groupId: string,
  order: readonly string[] | undefined,
  base: readonly string[],
): string[] {
  if (!isValidGroupOrder(order, base)) {
    return normalizeHostGroupOrder(groupId, [...base]);
  }
  return normalizeHostGroupOrder(groupId, order ?? [...base]);
}

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
