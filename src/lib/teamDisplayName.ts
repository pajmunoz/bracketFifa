import { TEAMS } from "@/data/worldCup2026";
import type { BracketSubmission, Team } from "@/types/bracket";

export function teamDisplayName(team: Team, locale: string): string {
  return locale.toLowerCase().startsWith("es") ? team.nameEs : team.name;
}

/** Nombre del campeón según idioma de la página; respaldo al texto guardado. */
export function submissionChampionDisplayName(
  submission: BracketSubmission,
  locale: string,
): string {
  const byId = submission.knockout?.championId
    ? TEAMS[submission.knockout.championId]
    : undefined;
  if (byId) {
    return teamDisplayName(byId, locale);
  }
  const code = submission.predictedWinnerCode;
  const byCode = code
    ? Object.values(TEAMS).find((t) => t.code === code)
    : undefined;
  if (byCode) {
    return teamDisplayName(byCode, locale);
  }
  return submission.predictedWinnerName;
}
