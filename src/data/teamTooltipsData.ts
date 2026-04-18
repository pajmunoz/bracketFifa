type Confed = "AFC" | "CAF" | "CONCACAF" | "CONMEBOL" | "OFC" | "UEFA";

/** Misma secuencia que `TEAM_ROWS` en worldCup2026.ts (código FIFA). */
const TEAM_META: readonly [string, string, string, Confed][] = [
  ["MEX", "Mexico City", "Ciudad de México", "CONCACAF"],
  ["RSA", "Pretoria", "Pretoria", "CAF"],
  ["KOR", "Seoul", "Seúl", "AFC"],
  ["CZE", "Prague", "Praga", "UEFA"],
  ["CAN", "Ottawa", "Ottawa", "CONCACAF"],
  ["BIH", "Sarajevo", "Sarajevo", "UEFA"],
  ["QAT", "Doha", "Doha", "AFC"],
  ["SUI", "Bern", "Berna", "UEFA"],
  ["BRA", "Brasília", "Brasilia", "CONMEBOL"],
  ["MAR", "Rabat", "Rabat", "CAF"],
  ["HAI", "Port-au-Prince", "Puerto Príncipe", "CONCACAF"],
  ["SCO", "Edinburgh", "Edimburgo", "UEFA"],
  ["USA", "Washington, D.C.", "Washington D. C.", "CONCACAF"],
  ["PAR", "Asunción", "Asunción", "CONMEBOL"],
  ["AUS", "Canberra", "Canberra", "AFC"],
  ["TUR", "Ankara", "Ankara", "UEFA"],
  ["GER", "Berlin", "Berlín", "UEFA"],
  ["CUW", "Willemstad", "Willemstad", "CONCACAF"],
  ["CIV", "Yamoussoukro", "Yamusukro", "CAF"],
  ["ECU", "Quito", "Quito", "CONMEBOL"],
  ["NED", "Amsterdam", "Ámsterdam", "UEFA"],
  ["JPN", "Tokyo", "Tokio", "AFC"],
  ["SWE", "Stockholm", "Estocolmo", "UEFA"],
  ["TUN", "Tunis", "Túnez", "CAF"],
  ["BEL", "Brussels", "Bruselas", "UEFA"],
  ["EGY", "Cairo", "El Cairo", "CAF"],
  ["IRN", "Tehran", "Teherán", "AFC"],
  ["NZL", "Wellington", "Wellington", "OFC"],
  ["ESP", "Madrid", "Madrid", "UEFA"],
  ["CPV", "Praia", "Praia", "CAF"],
  ["KSA", "Riyadh", "Riad", "AFC"],
  ["URU", "Montevideo", "Montevideo", "CONMEBOL"],
  ["FRA", "Paris", "París", "UEFA"],
  ["SEN", "Dakar", "Dakar", "CAF"],
  ["NOR", "Oslo", "Oslo", "UEFA"],
  ["IRQ", "Baghdad", "Bagdad", "AFC"],
  ["ARG", "Buenos Aires", "Buenos Aires", "CONMEBOL"],
  ["ALG", "Algiers", "Argel", "CAF"],
  ["AUT", "Vienna", "Viena", "UEFA"],
  ["JOR", "Amman", "Amán", "AFC"],
  ["POR", "Lisbon", "Lisboa", "UEFA"],
  ["COD", "Kinshasa", "Kinshasa", "CAF"],
  ["UZB", "Tashkent", "Taskent", "AFC"],
  ["COL", "Bogotá", "Bogotá", "CONMEBOL"],
  ["ENG", "London", "Londres", "UEFA"],
  ["CRO", "Zagreb", "Zagreb", "UEFA"],
  ["GHA", "Accra", "Acra", "CAF"],
  ["PAN", "Panama City", "Ciudad de Panamá", "CONCACAF"],
];

const HOST_CODES = new Set(["MEX", "CAN", "USA"]);

function buildTooltips(): Record<string, { en: string; es: string }> {
  const out: Record<string, { en: string; es: string }> = {};
  for (const [code, capEn, capEs, z] of TEAM_META) {
    const hostEn = HOST_CODES.has(code)
      ? " Co-host of the 2026 World Cup; automatically qualified."
      : "";
    const hostEs = HOST_CODES.has(code)
      ? " Anfitrión del Mundial 2026; clasificado automáticamente."
      : "";
    out[code] = {
      en: `FIFA confederation: ${z}. Capital: ${capEn}.${hostEn}`,
      es: `Confederación FIFA: ${z}. Capital: ${capEs}.${hostEs}`,
    };
  }
  return out;
}

export const TEAM_TOOLTIPS = buildTooltips();

export function getTeamTooltipText(team: {
  code: string;
  name: string;
  nameEs: string;
}): string {
  const facts = TEAM_TOOLTIPS[team.code];
  const header = `${team.name} · ${team.nameEs} (${team.code})`;
  if (!facts) {
    return header;
  }
  return `${header}\n${facts.en}\n${facts.es}`;
}
