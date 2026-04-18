"use client";

import { useTranslations } from "next-intl";
import { useLayoutEffect, useMemo, useRef } from "react";
import { GROUPS } from "@/data/worldCup2026";
import {
  buildFinalMatch,
  buildQFMatches,
  buildR16Fixtures,
  buildSFMatches,
  buildThirdPlaceMatch,
} from "@/lib/bracketKnockout";
import { useBracket } from "@/context/BracketContext";
import { Footer } from "@/components/Footer";
import { GroupPanel } from "@/components/GroupPanel";
import { KnockoutRound } from "@/components/KnockoutRound";
import { NavBar } from "@/components/NavBar";
import { RegistrationSidebar } from "@/components/RegistrationSidebar";

function GroupsPhase() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {GROUPS.map((g) => (
        <GroupPanel key={g.id} group={g} />
      ))}
    </div>
  );
}

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
    phase,
    progressPercent,
    qfWinners,
    r16Winners,
    setChampion,
    setQfWinner,
    setR16Winner,
    setSfWinner,
    setThirdPlace,
    sfWinners,
    thirdPlaceId,
  } = useBracket();

  const r16Matches = useMemo(
    () => buildR16Fixtures(groupOrders),
    [groupOrders],
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
            {phase === "groups" ? <GroupsPhase /> : null}
            {phase === "r16" ? (
              <KnockoutRound
                label={t("knockout.r16")}
                matches={r16Matches}
                picks={r16Winners}
                onPick={setR16Winner}
              />
            ) : null}
            {phase === "qf" ? (
              <KnockoutRound
                label={t("knockout.qf")}
                matches={qfMatches}
                picks={qfWinners}
                onPick={setQfWinner}
              />
            ) : null}
            {phase === "sf" ? (
              <KnockoutRound
                label={t("knockout.sf")}
                matches={sfMatches}
                picks={sfWinners}
                onPick={setSfWinner}
              />
            ) : null}
            {phase === "final" && finalMatch.homeId && finalMatch.awayId ? (
              <KnockoutRound
                label={t("knockout.final")}
                matches={[finalMatch]}
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
                label={t("knockout.third")}
                matches={[thirdMatch]}
                picks={{ third: thirdPlaceId ?? "" }}
                onPick={(mid, tid) => {
                  if (mid === "third") {
                    setThirdPlace(tid);
                  }
                }}
              />
            ) : null}

            {phase === "third" && thirdPlaceId ? (
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 text-center">
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

            {phase !== "third" ? (
              <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  className={
                    canAdvancePhase
                      ? "font-headline rounded-full bg-primary px-8 py-4 font-black text-on-primary uppercase transition-all hover:opacity-95 active:scale-[0.99]"
                      : "font-headline cursor-not-allowed rounded-full bg-surface-container-high px-8 py-4 font-black text-on-surface-variant uppercase opacity-60"
                  }
                  disabled={!canAdvancePhase}
                  onClick={() => {
                    advancePhase();
                  }}
                >
                  {nextLabel}
                </button>
                {!canAdvancePhase && phase === "r16" ? (
                  <p className="text-sm text-on-surface-variant">
                    {t("hintR16")}
                  </p>
                ) : null}
                {!canAdvancePhase && phase === "qf" ? (
                  <p className="text-sm text-on-surface-variant">
                    {t("hintQf")}
                  </p>
                ) : null}
                {!canAdvancePhase && phase === "sf" ? (
                  <p className="text-sm text-on-surface-variant">
                    {t("hintSf")}
                  </p>
                ) : null}
                {!canAdvancePhase && phase === "final" ? (
                  <p className="text-sm text-on-surface-variant">
                    {t("hintFinal")}
                  </p>
                ) : null}
              </div>
            ) : !thirdPlaceId ? (
              <p className="text-sm text-on-surface-variant">
                {t("hintThirdPick")}
              </p>
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
