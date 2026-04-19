"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import type { KnockoutMatch } from "@/lib/bracketKnockout";
import { TEAMS } from "@/data/worldCup2026";
import { TeamPickButton } from "@/components/TeamPickButton";

type Props = {
  advancePhase: () => void;
  canAdvancePhase: boolean;
  /** Texto de ayuda cuando la ronda no está completa (solo en el último paso). */
  incompleteHint?: string;
  label: string;
  matches: KnockoutMatch[];
  /** Vacío en tercer lugar: no hay botón de siguiente fase. */
  nextPhaseLabel: string;
  onPick: (matchId: string, teamId: string) => void;
  /** Debajo del partido si no hay CTA de fase (p. ej. tercer lugar sin elegir). */
  pickReminder?: string;
  picks: Record<string, string>;
};

export function KnockoutRound({
  advancePhase,
  canAdvancePhase,
  incompleteHint,
  label,
  matches,
  nextPhaseLabel,
  onPick,
  pickReminder,
  picks,
}: Props) {
  const t = useTranslations("KnockoutRound");
  const containerRef = useRef<HTMLDivElement>(null);
  const [stepIndex, setStepIndex] = useState(0);

  const validMatches = useMemo(
    () =>
      matches.filter(
        (m) => Boolean(TEAMS[m.homeId]) && Boolean(TEAMS[m.awayId]),
      ),
    [matches],
  );

  const matchIdsKey = useMemo(
    () => validMatches.map((x) => x.id).join("|"),
    [validMatches],
  );

  useEffect(() => {
    setStepIndex(0);
  }, [matchIdsKey]);

  const showAdvanceCta = nextPhaseLabel.trim().length > 0;
  const m = validMatches[stepIndex];
  const isLast = stepIndex >= validMatches.length - 1;
  const home = m ? TEAMS[m.homeId] : undefined;
  const away = m ? TEAMS[m.awayId] : undefined;
  const pick = m ? (picks[m.id] ?? "") : "";
  const hasPick =
    Boolean(m) &&
    Boolean(home) &&
    Boolean(away) &&
    (pick === home!.id || pick === away!.id);

  const primaryDisabled =
    !hasPick ||
    (isLast && !canAdvancePhase && showAdvanceCta);

  const primaryLabel = useMemo(() => {
    if (!hasPick) {
      return t("knockoutStepNeedPick");
    }
    if (!isLast) {
      return t("knockoutStepNextMatch");
    }
    if (!showAdvanceCta) {
      return "";
    }
    if (!canAdvancePhase) {
      return t("knockoutStepLockedRound");
    }
    return nextPhaseLabel;
  }, [
    canAdvancePhase,
    hasPick,
    isLast,
    nextPhaseLabel,
    showAdvanceCta,
    t,
  ]);

  function scrollStepperIntoView() {
    requestAnimationFrame(() => {
      containerRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }

  if (validMatches.length === 0 || !m || !home || !away) {
    return null;
  }

  return (
    <div className="w-full space-y-6" ref={containerRef}>
      <h2 className="font-headline text-2xl font-black text-on-surface">
        {label}
      </h2>
      <div className="scroll-mt-40 w-full space-y-6 rounded-xl border border-outline-variant/15 bg-surface-container-low/40 p-4 sm:p-6">
        <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-label text-center text-xs font-bold tracking-widest text-on-surface-variant uppercase sm:text-left">
            {t("knockoutStepProgress", {
              current: stepIndex + 1,
              total: validMatches.length,
            })}
          </p>
          {validMatches.length > 1 ? (
            <nav
              aria-label={t("knockoutStepProgress", {
                current: stepIndex + 1,
                total: validMatches.length,
              })}
              className="flex w-full flex-wrap justify-center gap-1.5 sm:w-auto sm:justify-end"
            >
              {validMatches.map((match, i) => (
                <button
                  key={match.id}
                  aria-current={i === stepIndex ? "step" : undefined}
                  aria-label={t("knockoutStepDotAria", { id: match.id })}
                  className={`h-2.5 w-2.5 shrink-0 rounded-full transition-all ${
                    i === stepIndex
                      ? "scale-125 bg-primary ring-2 ring-primary/30"
                      : "bg-outline-variant/45 hover:bg-outline-variant/75"
                  }`}
                  type="button"
                  onClick={() => {
                    setStepIndex(i);
                    scrollStepperIntoView();
                  }}
                />
              ))}
            </nav>
          ) : null}
        </div>
        <div className="rounded-xl border border-outline-variant/15 bg-surface-container-lowest p-4 shadow-sm">
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
        {!showAdvanceCta && pickReminder && !hasPick ? (
          <p className="text-center text-sm text-on-surface-variant">
            {pickReminder}
          </p>
        ) : null}
        {showAdvanceCta ? (
          <>
            <button
              className={
                primaryDisabled
                  ? "font-headline w-full cursor-not-allowed rounded-full bg-surface-container-high px-8 py-4 font-black text-on-surface-variant uppercase opacity-60"
                  : "font-headline w-full rounded-full bg-primary px-8 py-4 font-black text-on-primary uppercase transition-all hover:opacity-95 active:scale-[0.99]"
              }
              disabled={primaryDisabled}
              type="button"
              onClick={() => {
                if (primaryDisabled) {
                  return;
                }
                if (!isLast) {
                  setStepIndex((prev) =>
                    Math.min(validMatches.length - 1, prev + 1),
                  );
                  scrollStepperIntoView();
                  return;
                }
                advancePhase();
              }}
            >
              {primaryLabel}
            </button>
            {isLast && !canAdvancePhase && showAdvanceCta ? (
              <p className="text-center text-sm text-on-surface-variant">
                {incompleteHint ?? t("knockoutStepLockedHint")}
              </p>
            ) : null}
          </>
        ) : null}
      </div>
    </div>
  );
}
