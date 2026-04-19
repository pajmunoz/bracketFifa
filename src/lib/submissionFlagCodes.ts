import { GROUPS, TEAMS } from "@/data/worldCup2026";
import {
  buildFinalMatch,
  buildQFMatches,
  buildR16FromR32Results,
  buildR32Fixtures,
  buildSFMatches,
} from "@/lib/bracketKnockout";
import { flagCcFromFlagUrl } from "@/lib/flagCc";
import type { BracketSubmission } from "@/types/bracket";

function addTeamId(set: Set<string>, tid: string | undefined): void {
  if (!tid) {
    return;
  }
  const t = TEAMS[tid];
  const cc = t ? flagCcFromFlagUrl(t.flagUrl) : null;
  if (cc) {
    set.add(cc);
  }
}

/** Códigos ISO de todas las banderas que aparecen en la tarjeta de compartir. */
export function collectSubmissionFlagCodes(data: BracketSubmission): string[] {
  const set = new Set<string>();

  for (const g of GROUPS) {
    const order = data.groups[g.id];
    if (!order) {
      continue;
    }
    for (const tid of order) {
      addTeamId(set, tid);
    }
  }

  const k = data.knockout;
  const r32 = buildR32Fixtures(data.groups);
  for (const m of r32) {
    addTeamId(set, k.r32[m.id]);
  }
  const r16 = buildR16FromR32Results(k.r32);
  for (const m of r16) {
    addTeamId(set, k.r16[m.id]);
  }
  const qf = buildQFMatches(k.r16);
  for (const m of qf) {
    addTeamId(set, k.qf[m.id]);
  }
  const sf = buildSFMatches(k.qf);
  for (const m of sf) {
    addTeamId(set, k.sf[m.id]);
  }

  addTeamId(set, k.championId);
  addTeamId(set, k.thirdPlaceId);
  const finalMatch = buildFinalMatch(k.sf);
  addTeamId(set, finalMatch.homeId);
  addTeamId(set, finalMatch.awayId);

  return [...set];
}
