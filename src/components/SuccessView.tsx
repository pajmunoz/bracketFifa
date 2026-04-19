"use client";

import Image from "next/image";
import { useTransitionRouter } from "next-transition-router";
import { useLocale, useTranslations } from "next-intl";
import {
  startTransition,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { TEAMS } from "@/data/worldCup2026";
import { teamDisplayName } from "@/lib/teamDisplayName";
import { buildSFMatches } from "@/lib/bracketKnockout";
import { SUCCESS_BALL_TEXTURE, SUCCESS_STADIUM_BG } from "@/data/successAssets";
import { entryShareAbsoluteUrl } from "@/lib/entrySharePath";
import { ROUTES } from "@/lib/routes";
import { routing } from "@/i18n/routing";
import type { BracketSubmission } from "@/types/bracket";
import { clearBracketProgress } from "@/lib/bracketProgressPersistence";
import { STORAGE_KEY } from "@/types/bracket";
import { Footer } from "@/components/Footer";
import { SuccessHeader } from "@/components/SuccessHeader";

export function SuccessView() {
  const router = useTransitionRouter();
  const locale = useLocale();
  const t = useTranslations("Success");
  const tVs = useTranslations("KnockoutRound");
  const [data, setData] = useState<BracketSubmission | null>(null);
  const [entryLinkCopied, setEntryLinkCopied] = useState(false);
  const entryLinkCopiedTimer = useRef<number | null>(null);

  useEffect(() => {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      router.replace(ROUTES.home);
      return;
    }
    try {
      const parsed = JSON.parse(raw) as BracketSubmission;
      if (!parsed.knockout?.championId) {
        router.replace(ROUTES.home);
        return;
      }
      startTransition(() => {
        setData(parsed);
      });
    } catch {
      router.replace(ROUTES.home);
    }
  }, [router]);

  const handleCopyEntryLink = useCallback(() => {
    if (!data) {
      return;
    }
    const baseOrigin = window.location.origin.replace(/\/$/, "");
    const entryLink = entryShareAbsoluteUrl(baseOrigin, locale, data.entryId);
    const bracketPath =
      locale === routing.defaultLocale
        ? ROUTES.home
        : `/${locale}${ROUTES.home}`;
    const bracketLink = `${baseOrigin}${bracketPath}`;
    const text = t("copyEntryLinkClipboard", {
      bracketLink,
      entryId: data.entryId,
      entryLink,
    });
    void navigator.clipboard
      .writeText(text)
      .then(() => {
        setEntryLinkCopied(true);
        if (entryLinkCopiedTimer.current !== null) {
          window.clearTimeout(entryLinkCopiedTimer.current);
        }
        entryLinkCopiedTimer.current = window.setTimeout(() => {
          setEntryLinkCopied(false);
          entryLinkCopiedTimer.current = null;
        }, 2500);
      })
      .catch(() => {
        window.prompt(t("copyEntryLinkFallback"), text);
      });
  }, [data, locale, t]);

  useEffect(() => {
    return () => {
      if (entryLinkCopiedTimer.current !== null) {
        window.clearTimeout(entryLinkCopiedTimer.current);
      }
    };
  }, []);

  const handleAnotherPrediction = useCallback(() => {
    if (typeof window !== "undefined") {
      clearBracketProgress();
      window.sessionStorage.removeItem(STORAGE_KEY);
    }
    router.replace(ROUTES.home);
  }, [router]);

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface text-on-surface">
        <p className="font-headline text-sm">{t("loading")}</p>
      </div>
    );
  }

  const k = data.knockout;
  const winnerTeam =
    TEAMS[k.championId] ??
    Object.values(TEAMS).find((team) => team.code === data.predictedWinnerCode) ??
    TEAMS.t01;
  const thirdTeam = TEAMS[k.thirdPlaceId];
  const sfMatches = buildSFMatches(k.qf);
  const winnerLabel = teamDisplayName(winnerTeam, locale);

  return (
    <div className="flex min-h-screen flex-col bg-surface font-body text-on-surface antialiased">
      <SuccessHeader />
      <main className="relative z-10 min-h-screen pb-16 pt-24">
        <section className="relative min-h-[280px] overflow-hidden px-6 py-12 text-center lg:min-h-[320px] lg:py-20">
          <div className="absolute inset-0 -z-10 opacity-10">
            <Image
              alt=""
              className="object-cover"
              fill
              priority
              sizes="100vw"
              src={SUCCESS_STADIUM_BG}
            />
          </div>
          <div className="pointer-events-none absolute inset-0 -z-5 opacity-40">
            <div className="absolute top-10 left-1/4 h-4 w-4 rotate-45 rounded-sm bg-primary-container" />
            <div className="absolute top-20 right-1/3 h-3 w-3 rounded-full bg-secondary-container" />
            <div className="absolute top-40 left-10 h-2 w-5 -rotate-12 rounded-lg bg-primary" />
            <div className="absolute right-1/4 bottom-20 h-4 w-4 rounded-full border-2 border-primary-container" />
          </div>
          <div className="mx-auto max-w-4xl">
            <h1 className="font-headline mb-6 text-5xl font-black tracking-tighter text-primary italic md:text-7xl lg:text-8xl">
              {t("congrats")}
            </h1>
            <p className="font-headline mx-auto max-w-2xl text-xl font-medium text-on-surface-variant md:text-2xl">
              {t("subtitle")}
            </p>
            <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-primary-container/20 bg-primary-container/10 px-4 py-2">
              <span
                className="material-symbols-outlined text-primary"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                check_circle
              </span>
              <span className="font-label text-xs font-bold tracking-widest text-primary uppercase">
                {t("entryId", { id: data.entryId })}
              </span>
            </div>
          </div>
        </section>
        <section className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-6 lg:grid-cols-12">
          <div className="flex flex-col overflow-hidden rounded-xl bg-surface-container-lowest shadow-sm md:flex-row lg:col-span-8">
            <div className="kinetic-gradient relative flex min-h-[220px] w-full flex-col items-center justify-center overflow-hidden p-8 text-on-primary md:w-1/3 md:min-h-0">
              <div className="absolute inset-0 opacity-10">
                <Image
                  alt=""
                  className="object-cover"
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  src={SUCCESS_BALL_TEXTURE}
                />
              </div>
              <span className="font-label mb-2 text-xs tracking-widest uppercase opacity-80">
                {t("predictedWinner")}
              </span>
              <div className="mb-4 rounded-full border-4 border-on-primary p-2">
                <Image
                  alt={winnerLabel}
                  className="h-24 w-24 rounded-full object-cover"
                  height={96}
                  src={winnerTeam.flagUrl}
                  width={96}
                />
              </div>
              <h3 className="font-headline text-3xl font-black tracking-tight italic">
                {winnerLabel.toUpperCase()}
              </h3>
              {thirdTeam ? (
                <p className="font-label mt-4 rounded-full bg-black/20 px-4 py-1 text-sm font-bold">
                  {t("thirdPlace", { code: thirdTeam.code })}
                </p>
              ) : null}
            </div>
            <div className="flex w-full flex-col justify-between p-8 md:w-2/3">
              <div>
                <h4 className="font-headline mb-6 border-b border-surface-container-high pb-2 text-lg font-bold text-on-surface">
                  {t("pathSummary")}
                </h4>
                <div className="relative space-y-6">
                  {sfMatches.map((m) => {
                    const home = TEAMS[m.homeId];
                    const away = TEAMS[m.awayId];
                    const win = TEAMS[k.sf[m.id]];
                    if (!home || !away || !win) {
                      return null;
                    }
                    const homeLabel = teamDisplayName(home, locale);
                    const awayLabel = teamDisplayName(away, locale);
                    return (
                      <div
                        key={m.id}
                        className="flex flex-col gap-2 border-b border-surface-container-high pb-4 last:border-0"
                      >
                        <p className="font-label text-xs text-on-surface-variant uppercase">
                          {t("semifinalPick", { code: win.code })}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 overflow-hidden rounded-lg border border-outline-variant/30 bg-surface-container">
                              <Image
                                alt={homeLabel}
                                className="h-full w-full object-cover"
                                height={32}
                                src={home.flagUrl}
                                width={32}
                              />
                            </div>
                            <span
                              className={
                                win.id === home.id
                                  ? "font-headline text-sm font-black text-primary"
                                  : "font-headline text-sm font-semibold"
                              }
                            >
                              {home.code}
                            </span>
                          </div>
                          <span className="font-label text-xs text-outline-variant">
                            {tVs("vs")}
                          </span>
                          <div className="flex items-center gap-3 text-right">
                            <span
                              className={
                                win.id === away.id
                                  ? "font-headline text-sm font-black text-primary"
                                  : "font-headline text-sm font-semibold"
                              }
                            >
                              {away.code}
                            </span>
                            <div className="h-8 w-8 overflow-hidden rounded-lg border border-outline-variant/30 bg-surface-container">
                              <Image
                                alt={awayLabel}
                                className="h-full w-full object-cover"
                                height={32}
                                src={away.flagUrl}
                                width={32}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="mt-8">
                <button
                  type="button"
                  className="group flex w-full items-center justify-center gap-2 rounded-xl border-2 border-primary bg-primary py-4 font-headline font-black text-on-primary transition-all hover:opacity-95 active:scale-[0.99]"
                  onClick={() => {
                    handleCopyEntryLink();
                  }}
                >
                  <span className="material-symbols-outlined transition-transform group-hover:scale-110">
                    link
                  </span>
                  {entryLinkCopied
                    ? t("copyEntryLinkCopied")
                    : t("shareResultButton")}
                </button>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-6 lg:col-span-4">
            <div className="flex h-full flex-col rounded-xl bg-surface-container-high/50 p-8">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/15">
                <span
                  className="material-symbols-outlined text-2xl text-primary"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  ios_share
                </span>
              </div>
              <h4 className="font-headline mb-2 text-lg font-extrabold text-on-surface">
                {t("challengeTitle")}
              </h4>
              <p className="mb-6 text-sm font-medium text-on-surface-variant">
                {t("challengeBody")}
              </p>
              <div className="mt-auto rounded-xl border border-primary/10 bg-primary/5 p-4">
                <p className="text-xs leading-relaxed font-bold text-primary">
                  <span className="material-symbols-outlined mr-1 align-middle text-base">
                    info
                  </span>
                  {t("winnersNote")}
                </p>
              </div>
            </div>
          </div>
        </section>
        <section className="mx-auto mt-12 max-w-7xl px-6 text-center">
          <p className="mb-4 text-sm text-on-surface-variant">{t("anotherHint")}</p>
          <button
            type="button"
            className="font-headline inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 font-black text-on-primary uppercase transition-all hover:opacity-95 active:scale-[0.99]"
            onClick={() => {
              handleAnotherPrediction();
            }}
          >
            <span className="material-symbols-outlined">add_circle</span>
            {t("anotherCta")}
          </button>
        </section>
      </main>
      <Footer />
    </div>
  );
}
