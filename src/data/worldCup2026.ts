import type { GroupDef, Team } from "@/types/bracket";

/** Fila: código FIFA, nombre, código ISO para flagcdn.com */
const TEAM_ROWS: readonly [string, string, string][] = [
  ["USA", "United States", "us"],
  ["MEX", "Mexico", "mx"],
  ["CAN", "Canada", "ca"],
  ["JAM", "Jamaica", "jm"],
  ["ARG", "Argentina", "ar"],
  ["BRA", "Brazil", "br"],
  ["URU", "Uruguay", "uy"],
  ["COL", "Colombia", "co"],
  ["ESP", "Spain", "es"],
  ["GER", "Germany", "de"],
  ["FRA", "France", "fr"],
  ["NED", "Netherlands", "nl"],
  ["ITA", "Italy", "it"],
  ["POR", "Portugal", "pt"],
  ["BEL", "Belgium", "be"],
  ["SUI", "Switzerland", "ch"],
  ["ENG", "England", "gb-eng"],
  ["CRO", "Croatia", "hr"],
  ["POL", "Poland", "pl"],
  ["DEN", "Denmark", "dk"],
  ["SWE", "Sweden", "se"],
  ["NOR", "Norway", "no"],
  ["AUT", "Austria", "at"],
  ["SCO", "Scotland", "gb-sct"],
  ["TUR", "Türkiye", "tr"],
  ["GRE", "Greece", "gr"],
  ["UKR", "Ukraine", "ua"],
  ["ALB", "Albania", "al"],
  ["EGY", "Egypt", "eg"],
  ["NGA", "Nigeria", "ng"],
  ["RSA", "South Africa", "za"],
  ["SEN", "Senegal", "sn"],
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
];
