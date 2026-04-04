"use client";

import Image from "next/image";
import type { Team } from "@/types/bracket";

type Props = {
  className?: string;
  onClick: () => void;
  selected: boolean;
  team: Team;
};

export function TeamPickButton({
  className = "",
  onClick,
  selected,
  team,
}: Props) {
  const base =
    selected
      ? "flex items-center gap-3 rounded-xl border-2 border-primary bg-primary/10 p-4 text-left transition-all"
      : "flex items-center gap-3 rounded-xl border border-outline-variant/20 bg-surface-container-low p-4 text-left transition-all hover:border-primary/40";
  return (
    <button
      className={`${base} ${className}`.trim()}
      onClick={onClick}
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
      <span className="font-label min-w-0 truncate text-sm text-on-surface-variant">
        {team.name}
      </span>
    </button>
  );
}
