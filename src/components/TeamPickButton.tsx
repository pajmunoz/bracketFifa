"use client";

import Image from "next/image";
import type { Team } from "@/types/bracket";

type Props = {
  badge?: string;
  className?: string;
  disabled?: boolean;
  onClick: () => void;
  selected: boolean;
  team: Team;
};

export function TeamPickButton({
  badge,
  className = "",
  disabled = false,
  onClick,
  selected,
  team,
}: Props) {
  const base =
    selected
      ? "flex items-center gap-3 rounded-xl border-2 border-primary bg-primary/10 p-4 text-left transition-all"
      : "flex items-center gap-3 rounded-xl border border-outline-variant/20 bg-surface-container-low p-4 text-left transition-all hover:border-primary/40";
  const state = disabled ? `${base} cursor-default opacity-90` : base;
  return (
    <button
      className={`${state} ${className}`.trim()}
      disabled={disabled}
      onClick={disabled ? () => {} : onClick}
      type="button"
    >
      <Image
        alt=""
        className="h-8 w-10 shrink-0 rounded-sm object-cover shadow-sm"
        height={32}
        src={team.flagUrl}
        width={40}
      />
      <span className="font-headline shrink-0 font-bold">{team.code}</span>
      <span className="font-label flex min-w-0 flex-1 flex-col items-start gap-1 truncate text-left text-sm text-on-surface-variant">
        <span className="min-w-0 truncate">{team.name}</span>
        {badge ? (
          <span className="font-label shrink-0 rounded bg-primary/15 px-2 py-0.5 text-[0.65rem] font-bold tracking-wide text-primary uppercase">
            {badge}
          </span>
        ) : null}
      </span>
    </button>
  );
}
