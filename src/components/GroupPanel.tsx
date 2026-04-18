"use client";

import { useTranslations } from "next-intl";
import type { GroupDef } from "@/types/bracket";
import { HOST_TEAM_ID_BY_GROUP, TEAMS } from "@/data/worldCup2026";
import { useBracket } from "@/context/BracketContext";
import { TeamPickButton } from "@/components/TeamPickButton";
import { buildGroupOrderFromPicks } from "@/lib/groupOrder";

type Props = {
  group: GroupDef;
};

export function GroupPanel({ group }: Props) {
  const t = useTranslations("GroupPanel");
  const { groupOrders, setTeamOrder } = useBracket();
  const hostId = HOST_TEAM_ID_BY_GROUP[group.id];
  const hostTeam = hostId ? TEAMS[hostId] : undefined;
  const order = groupOrders[group.id] ?? group.teamIds;
  const firstId = order[0] ?? "";
  const secondId = order[1] ?? "";

  function pickFirst(tid: string) {
    if (hostId) {
      return;
    }
    if (tid === firstId) {
      return;
    }
    if (tid === secondId) {
      setTeamOrder(
        group.id,
        buildGroupOrderFromPicks(group.teamIds, secondId, firstId),
      );
      return;
    }
    setTeamOrder(
      group.id,
      buildGroupOrderFromPicks(group.teamIds, tid, secondId),
    );
  }

  function pickSecond(tid: string) {
    if (tid === secondId) {
      return;
    }
    setTeamOrder(
      group.id,
      buildGroupOrderFromPicks(group.teamIds, firstId, tid),
    );
  }

  const secondChoices = group.teamIds.filter((id) => id !== firstId);
  const restIds = group.teamIds.filter((id) => id !== firstId && id !== secondId);

  return (
    <div className="rounded-xl border border-outline-variant/15 bg-surface-container-lowest p-4 shadow-sm">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-headline text-2xl font-black text-on-surface">
          {group.label}
        </h2>
        <span className="font-label w-fit rounded bg-surface-container-low px-3 py-1 text-xs font-bold tracking-widest text-on-surface-variant uppercase">
          {t("badge")}
        </span>
      </div>
      <div className="space-y-6">
        <div>
          <p className="font-label mb-3 text-xs font-bold tracking-widest text-on-surface-variant uppercase">
            {hostId ? t("hostFirstTitle") : t("firstPlace")}
          </p>
          {hostId && hostTeam ? (
            <TeamPickButton
              badge={t("hostBadge")}
              disabled
              selected
              team={hostTeam}
              onClick={() => {}}
            />
          ) : !hostId ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {group.teamIds.map((tid) => {
                const team = TEAMS[tid];
                if (!team) {
                  return null;
                }
                return (
                  <TeamPickButton
                    key={tid}
                    selected={tid === firstId}
                    team={team}
                    onClick={() => {
                      pickFirst(tid);
                    }}
                  />
                );
              })}
            </div>
          ) : null}
        </div>
        <div>
          <p className="font-label mb-3 text-xs font-bold tracking-widest text-on-surface-variant uppercase">
            {t("secondPlace")}
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {secondChoices.map((tid) => {
              const team = TEAMS[tid];
              if (!team) {
                return null;
              }
              return (
                <TeamPickButton
                  key={tid}
                  selected={tid === secondId}
                  team={team}
                  onClick={() => {
                    pickSecond(tid);
                  }}
                />
              );
            })}
          </div>
        </div>
        {restIds.length > 0 ? (
          <div className="border-outline-variant/15 border-t pt-4">
            <p className="font-label mb-2 text-xs font-bold tracking-widest text-on-surface-variant uppercase">
              {t("restTitle")}
            </p>
            <ul className="flex flex-wrap gap-2">
              {restIds.map((tid) => {
                const team = TEAMS[tid];
                if (!team) {
                  return null;
                }
                return (
                  <li
                    className="font-label rounded-lg bg-surface-container-high px-3 py-1.5 text-xs text-on-surface-variant"
                    key={tid}
                  >
                    {team.code} — {team.name}
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );
}
