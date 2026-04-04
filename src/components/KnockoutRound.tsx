"use client";

import { useTranslations } from "next-intl";
import type { KnockoutMatch } from "@/lib/bracketKnockout";
import { TEAMS } from "@/data/worldCup2026";
import { TeamPickButton } from "@/components/TeamPickButton";

type Props = {
  label: string;
  matches: KnockoutMatch[];
  picks: Record<string, string>;
  onPick: (matchId: string, teamId: string) => void;
};

export function KnockoutRound({ label, matches, onPick, picks }: Props) {
  const t = useTranslations("KnockoutRound");
  return (
    <div className="space-y-6">
      <h2 className="font-headline text-2xl font-black text-on-surface">
        {label}
      </h2>
      <div className="space-y-6">
        {matches.map((m) => {
          const home = TEAMS[m.homeId];
          const away = TEAMS[m.awayId];
          const pick = picks[m.id] ?? "";
          if (!home || !away) {
            return null;
          }
          return (
            <div
              key={m.id}
              className="rounded-xl border border-outline-variant/15 bg-surface-container-lowest p-4 shadow-sm"
            >
              <p className="font-label mb-3 text-xs font-bold tracking-widest text-on-surface-variant uppercase">
                {t("match", { id: m.id })}
              </p>
              <div className="flex flex-col gap-3 md:flex-row md:items-stretch">
                <TeamPickButton
                  className="md:flex-1"
                  selected={pick === home.id}
                  team={home}
                  onClick={() => {
                    onPick(m.id, home.id);
                  }}
                />
                <span className="flex items-center justify-center font-label text-xs font-bold text-outline-variant md:px-1">
                  {t("vs")}
                </span>
                <TeamPickButton
                  className="md:flex-1"
                  selected={pick === away.id}
                  team={away}
                  onClick={() => {
                    onPick(m.id, away.id);
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
