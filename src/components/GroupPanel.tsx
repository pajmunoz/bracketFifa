"use client";

import { useTranslations } from "next-intl";
import { useLayoutEffect } from "react";
import type { GroupDef } from "@/types/bracket";
import { isValidGroupOrder, TEAMS } from "@/data/worldCup2026";
import { useBracket } from "@/context/BracketContext";
import { TeamPickButton } from "@/components/TeamPickButton";
import { buildGroupOrderFromPicks } from "@/lib/groupOrder";

type Props = {
  group: GroupDef;
};

export function GroupPanel({ group }: Props) {
  const t = useTranslations("GroupPanel");
  const { groupOrders, setTeamOrder } = useBracket();
  const rawOrder = groupOrders[group.id];
  const firstId = rawOrder?.[0] ?? "";
  const secondId =
    rawOrder && rawOrder.length >= 2 ? (rawOrder[1] ?? "") : "";

  useLayoutEffect(() => {
    const raw = groupOrders[group.id];
    if (raw === undefined) {
      return;
    }
    if (raw.length === 1) {
      if (!group.teamIds.includes(raw[0]!)) {
        setTeamOrder(group.id, []);
      }
      return;
    }
    if (!isValidGroupOrder(raw, group.teamIds)) {
      setTeamOrder(group.id, []);
    }
  }, [group.id, group.teamIds, groupOrders, setTeamOrder]);

  function pickFirst(tid: string) {
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
    if (!secondId) {
      setTeamOrder(group.id, [tid]);
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
    if (!firstId) {
      return;
    }
    setTeamOrder(
      group.id,
      buildGroupOrderFromPicks(group.teamIds, firstId, tid),
    );
  }

  const secondChoices = group.teamIds.filter((id) => id !== firstId);
  const orderForRest =
    firstId &&
    secondId &&
    rawOrder &&
    isValidGroupOrder(rawOrder, group.teamIds)
      ? rawOrder
      : firstId && secondId
        ? buildGroupOrderFromPicks(group.teamIds, firstId, secondId)
        : [];
  const restCodes = orderForRest
    .slice(2)
    .map((tid) => TEAMS[tid]?.code)
    .filter((code): code is string => Boolean(code));

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
            {t("firstPlace")}
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {group.teamIds.map((tid) => {
              const team = TEAMS[tid];
              if (!team) {
                return null;
              }
              return (
                <TeamPickButton
                  key={`${group.id}-1-${tid}`}
                  badge={team.host ? t("hostBadge") : undefined}
                  selected={tid === firstId}
                  team={team}
                  onClick={() => {
                    pickFirst(tid);
                  }}
                />
              );
            })}
          </div>
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
                  key={`${group.id}-2-${tid}`}
                  badge={team.host ? t("hostBadge") : undefined}
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
        {restCodes.length > 0 ? (
          <p className="border-outline-variant/15 font-label border-t pt-4 text-xs text-on-surface-variant">
            <span className="font-bold tracking-widest uppercase">
              {t("restTitle")}
            </span>
            {": "}
            {restCodes.join(" · ")}
          </p>
        ) : null}
      </div>
    </div>
  );
}
