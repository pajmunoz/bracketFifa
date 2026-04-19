"use client";

import { useTranslations } from "next-intl";
import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { GROUPS, isValidGroupOrder } from "@/data/worldCup2026";
import {
  buildFinalMatch,
  buildQFMatches,
  buildR16FromR32Results,
  buildR32Fixtures,
  buildSFMatches,
  buildThirdPlaceMatch,
} from "@/lib/bracketKnockout";
import { useBracket } from "@/context/BracketContext";
import { Footer } from "@/components/Footer";
import { GroupPanel } from "@/components/GroupPanel";
import { KnockoutRound } from "@/components/KnockoutRound";
import { NavBar } from "@/components/NavBar";
import { RegistrationSidebar } from "@/components/RegistrationSidebar";

function SidebarSlot() {
  const t = useTranslations("Bracket");
  const { formUnlocked } = useBracket();
  if (formUnlocked) {
    return <RegistrationSidebar />;
  }
  return (
    <div
      className="sticky top-40 space-y-4 rounded-2xl border border-dashed border-outline-variant/30 bg-surface-container-low p-8 text-center shadow-sm"
      id="register"
    >
      <span className="material-symbols-outlined text-4xl text-outline-variant">
        lock
      </span>
      <p className="font-headline text-lg font-bold text-on-surface">
        {t("sidebarLockedTitle")}
      </p>
      <p className="text-sm text-on-surface-variant">{t("sidebarLockedBody")}</p>
    </div>
  );
}

export function BracketDashboard() {
  const t = useTranslations("Bracket");
  const {
    advancePhase,
    canAdvancePhase,
    championId,
    groupOrders,
    groupStepIndex,
    phase,
    progressPercent,
    qfWinners,
    r16Winners,
    r32Winners,
    setChampion,
    setGroupStepIndex,
    setQfWinner,
    setR16Winner,
    setR32Winner,
    setSfWinner,
    setThirdPlace,
    sfWinners,
    thirdPlaceId,
  } = useBracket();

  const currentGroupDef = GROUPS[groupStepIndex];
  const isCurrentGroupComplete = useMemo(() => {
    if (!currentGroupDef) {
      return false;
    }
    const raw = groupOrders[currentGroupDef.id];
    return Boolean(raw && isValidGroupOrder(raw, currentGroupDef.teamIds));
  }, [currentGroupDef, groupOrders]);

  const isLastGroupStep = groupStepIndex >= GROUPS.length - 1;
  const groupPrimaryDisabled =
    !isCurrentGroupComplete ||
    (isLastGroupStep && !canAdvancePhase);

  const groupPrimaryLabel = useMemo(() => {
    if (!isCurrentGroupComplete) {
      return t("groupStepNeedPicks");
    }
    if (!isLastGroupStep) {
      return t("groupStepNext");
    }
    if (canAdvancePhase) {
      return t("next.groups");
    }
    return t("groupStepLockedOther");
  }, [
    canAdvancePhase,
    isCurrentGroupComplete,
    isLastGroupStep,
    t,
  ]);

  const r32Matches = useMemo(
    () => buildR32Fixtures(groupOrders),
    [groupOrders],
  );
  const r16Matches = useMemo(
    () => buildR16FromR32Results(r32Winners),
    [r32Winners],
  );
  const qfMatches = useMemo(() => buildQFMatches(r16Winners), [r16Winners]);
  const sfMatches = useMemo(() => buildSFMatches(qfWinners), [qfWinners]);
  const finalMatch = useMemo(() => buildFinalMatch(sfWinners), [sfWinners]);
  const thirdMatch = useMemo(
    () => buildThirdPlaceMatch(sfMatches, sfWinners),
    [sfMatches, sfWinners],
  );

  const phaseTitle = t(`phase.${phase}`);
  const nextLabel = phase === "third" ? "" : t(`next.${phase}`);

  const skipScrollToTopRef = useRef(true);
  useLayoutEffect(() => {
    if (skipScrollToTopRef.current) {
      skipScrollToTopRef.current = false;
      return;
    }
    window.scrollTo({ behavior: "auto", left: 0, top: 0 });
  }, [phase]);

  return (
    <div className="flex min-h-screen flex-col bg-surface font-body text-on-surface">
      <NavBar />
      <main className="mx-auto max-w-screen-2xl px-4 pb-32 pt-24 md:px-8">
        <section className="mb-6">
          <p className="font-label text-primary">{phaseTitle}</p>
          <h1 className="font-headline text-4xl font-black uppercase leading-none tracking-tighter text-on-surface md:text-5xl">
            {t("heroTitle")}
          </h1>
          <p className="font-label mt-2 text-on-surface-variant">
            {t("heroSubtitle")}
          </p>
        </section>
        <div
          className="border-outline-variant/15 -mx-4 sticky top-16 z-40 mb-8 border-b bg-surface/90 px-4 py-3 shadow-md backdrop-blur-md md:-mx-8 md:px-8"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <span className="font-label text-xs font-bold tracking-widest text-on-surface-variant uppercase">
              {t("progressLabel")}
            </span>
            <div className="font-headline text-2xl font-black text-primary sm:text-3xl">
              {progressPercent}%
            </div>
          </div>
          <div className="relative mt-3 h-4 w-full overflow-hidden rounded-full bg-surface-container-highest">
            <div
              className="kinetic-gradient relative h-full transition-[width] duration-500"
              style={{ width: `${progressPercent}%` }}
            >
              <div className="absolute top-0 right-0 bottom-0 w-8 bg-white/20 blur-sm" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="space-y-10 lg:col-span-8">
            {phase === "groups" && currentGroupDef ? (
              <div className="w-full space-y-6" id="groups-stepper-top">
                <div className="scroll-mt-40 w-full space-y-6 rounded-xl border border-outline-variant/15 bg-surface-container-low/40 p-4 sm:p-6">
                  <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="font-label text-center text-xs font-bold tracking-widest text-on-surface-variant uppercase sm:text-left">
                      {t("groupStepProgress", {
                        current: groupStepIndex + 1,
                        total: GROUPS.length,
                      })}
                    </p>
                    <nav
                      aria-label={t("groupStepProgress", {
                        current: groupStepIndex + 1,
                        total: GROUPS.length,
                      })}
                      className="flex w-full flex-wrap justify-center gap-1.5 sm:w-auto sm:justify-end"
                    >
                      {GROUPS.map((g, i) => (
                        <button
                          key={g.id}
                          aria-current={i === groupStepIndex ? "step" : undefined}
                          aria-label={t("groupStepDotAria", { label: g.label })}
                          className={`h-2.5 w-2.5 shrink-0 rounded-full transition-all ${
                            i === groupStepIndex
                              ? "scale-125 bg-primary ring-2 ring-primary/30"
                              : "bg-outline-variant/45 hover:bg-outline-variant/75"
                          }`}
                          type="button"
                          onClick={() => {
                            setGroupStepIndex(i);
                            requestAnimationFrame(() => {
                              document
                                .getElementById("groups-stepper-top")
                                ?.scrollIntoView({
                                  behavior: "smooth",
                                  block: "start",
                                });
                            });
                          }}
                        />
                      ))}
                    </nav>
                  </div>
                  <GroupPanel group={currentGroupDef} />
                  <button
                    className={
                      groupPrimaryDisabled
                        ? "font-headline w-full cursor-not-allowed rounded-full bg-surface-container-high px-8 py-4 font-black text-on-surface-variant uppercase opacity-60"
                        : "font-headline w-full rounded-full bg-primary px-8 py-4 font-black text-on-primary uppercase transition-all hover:opacity-95 active:scale-[0.99]"
                    }
                    disabled={groupPrimaryDisabled}
                    type="button"
                    onClick={() => {
                      if (groupPrimaryDisabled) {
                        return;
                      }
                      if (isLastGroupStep) {
                        advancePhase();
                        return;
                      }
                      setGroupStepIndex((prev) =>
                        Math.min(GROUPS.length - 1, prev + 1),
                      );
                      requestAnimationFrame(() => {
                        document
                          .getElementById("groups-stepper-top")
                          ?.scrollIntoView({
                            behavior: "smooth",
                            block: "start",
                          });
                      });
                    }}
                  >
                    {groupPrimaryLabel}
                  </button>
                  {isLastGroupStep &&
                  isCurrentGroupComplete &&
                  !canAdvancePhase ? (
                    <p className="text-center text-sm text-on-surface-variant">
                      {t("groupStepLockedOtherHint")}
                    </p>
                  ) : null}
                </div>
              </div>
            ) : null}
            {phase === "r32" ? (
              <KnockoutRound
                advancePhase={advancePhase}
                canAdvancePhase={canAdvancePhase}
                incompleteHint={t("hintR32")}
                label={t("knockout.r32")}
                matches={r32Matches}
                nextPhaseLabel={nextLabel}
                picks={r32Winners}
                onPick={setR32Winner}
              />
            ) : null}
            {phase === "r16" ? (
              <KnockoutRound
                advancePhase={advancePhase}
                canAdvancePhase={canAdvancePhase}
                incompleteHint={t("hintR16")}
                label={t("knockout.r16")}
                matches={r16Matches}
                nextPhaseLabel={nextLabel}
                picks={r16Winners}
                onPick={setR16Winner}
              />
            ) : null}
            {phase === "qf" ? (
              <KnockoutRound
                advancePhase={advancePhase}
                canAdvancePhase={canAdvancePhase}
                incompleteHint={t("hintQf")}
                label={t("knockout.qf")}
                matches={qfMatches}
                nextPhaseLabel={nextLabel}
                picks={qfWinners}
                onPick={setQfWinner}
              />
            ) : null}
            {phase === "sf" ? (
              <KnockoutRound
                advancePhase={advancePhase}
                canAdvancePhase={canAdvancePhase}
                incompleteHint={t("hintSf")}
                label={t("knockout.sf")}
                matches={sfMatches}
                nextPhaseLabel={nextLabel}
                picks={sfWinners}
                onPick={setSfWinner}
              />
            ) : null}
            {phase === "final" && finalMatch.homeId && finalMatch.awayId ? (
              <KnockoutRound
                advancePhase={advancePhase}
                canAdvancePhase={canAdvancePhase}
                incompleteHint={t("hintFinal")}
                label={t("knockout.final")}
                matches={[finalMatch]}
                nextPhaseLabel={nextLabel}
                picks={{ final: championId ?? "" }}
                onPick={(mid, tid) => {
                  if (mid === "final") {
                    setChampion(tid);
                  }
                }}
              />
            ) : null}
            {phase === "third" &&
            thirdMatch.homeId &&
            thirdMatch.awayId ? (
              <KnockoutRound
                advancePhase={advancePhase}
                canAdvancePhase={canAdvancePhase}
                label={t("knockout.third")}
                matches={[thirdMatch]}
                nextPhaseLabel=""
                pickReminder={t("hintThirdPick")}
                picks={{ third: thirdPlaceId ?? "" }}
                onPick={(mid, tid) => {
                  if (mid === "third") {
                    setThirdPlace(tid);
                  }
                }}
              />
            ) : null}

            {phase === "third" && thirdPlaceId ? (
              <div
                className="scroll-mt-40 rounded-xl border border-primary/20 bg-primary/5 p-6 text-center"
                id="bracket-third-footer"
              >
                <p className="font-headline font-bold text-primary">
                  {t("bracketCompleteTitle")}
                </p>
                <p className="mt-2 text-sm text-on-surface-variant">
                  {t("bracketCompleteLine1")}{" "}
                  <strong>{t("bracketCompleteStrong")}</strong>{" "}
                  {t("bracketCompleteLine2")}
                </p>
              </div>
            ) : null}
          </div>
          <div className="lg:col-span-4">
            <SidebarSlot />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
