"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import {
  startTransition,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { TEAMS } from "@/data/worldCup2026";
import { buildSFMatches } from "@/lib/bracketKnockout";
import { SUCCESS_BALL_TEXTURE, SUCCESS_STADIUM_BG } from "@/data/successAssets";
import { BracketShareCard } from "@/components/bracket-share/BracketShareCard";
import { captureBracketShareCardAsPng } from "@/lib/downloadBracketSharePng";
import { entryShareAbsoluteUrl } from "@/lib/entrySharePath";
import { ROUTES } from "@/lib/routes";
import { routing, useRouter } from "@/i18n/routing";
import {
  assignPopupOrOpen,
  buildFacebookShareUrl,
  buildTwitterIntentUrl,
  buildWhatsAppShareUrl,
  openInstagramHint,
  shareBracketImageNative,
  SOCIAL_PREOPEN_POPUP_FEATURES,
} from "@/lib/socialShare";
import type { BracketSubmission } from "@/types/bracket";
import { STORAGE_KEY } from "@/types/bracket";
import { Footer } from "@/components/Footer";
import { SuccessHeader } from "@/components/SuccessHeader";

export function SuccessView() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("Success");
  const tVs = useTranslations("KnockoutRound");
  const [data, setData] = useState<BracketSubmission | null>(null);
  const [downloadBusy, setDownloadBusy] = useState(false);
  const [socialBusy, setSocialBusy] = useState(false);
  const shareBlobRef = useRef<Blob | null>(null);
  const shareCardRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    shareBlobRef.current = null;
  }, [data?.entryId]);

  const origin =
    typeof window !== "undefined" ? window.location.origin : "";

  const getShareBlob = useCallback(async () => {
    if (shareBlobRef.current) {
      return shareBlobRef.current;
    }
    if (!shareCardRef.current) {
      throw new Error("missing share card");
    }
    const blob = await captureBracketShareCardAsPng(shareCardRef.current);
    shareBlobRef.current = blob;
    return blob;
  }, []);

  const handleSharePng = useCallback(async () => {
    if (!data || !shareCardRef.current) {
      return;
    }
    setDownloadBusy(true);
    try {
      const blob = await getShareBlob();
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.download = "bracket-fifa-26-share.png";
      anchor.href = objectUrl;
      anchor.click();
      URL.revokeObjectURL(objectUrl);
    } catch {
      window.alert(t("shareExportError"));
    } finally {
      setDownloadBusy(false);
    }
  }, [data, getShareBlob, t]);

  const handleAnotherPrediction = useCallback(() => {
    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem(STORAGE_KEY);
    }
    router.replace(ROUTES.home);
  }, [router]);

  const handleShare = useCallback(
    async (target: "whatsapp" | "twitter" | "instagram" | "facebook") => {
      if (!data || !shareCardRef.current) {
        return;
      }
      const baseOrigin = origin.replace(/\/$/, "");
      const entryUrl = entryShareAbsoluteUrl(baseOrigin, locale, data.entryId);
      const bracketPath =
        locale === routing.defaultLocale
          ? ROUTES.home
          : `/${locale}${ROUTES.home}`;
      const bracketUrl = `${baseOrigin}${bracketPath}`;

      const fallbackTab =
        target === "instagram"
          ? null
          : window.open("about:blank", "_blank", SOCIAL_PREOPEN_POPUP_FEATURES);

      if (target === "facebook") {
        const composer = t("shareChallengeWhatsapp", {
          bracketLink: bracketUrl,
          entryId: data.entryId,
          entryLink: entryUrl,
        });
        void navigator.clipboard.writeText(composer).catch(() => {
          /* sin permiso o sin contexto seguro: el usuario puede copiar a mano */
        });
      }

      setSocialBusy(true);
      try {
        const blob = await getShareBlob();
        const nativeText = t("shareChallengeFull", {
          entryId: data.entryId,
        });
        const nativeResult = await shareBracketImageNative(blob, {
          text: nativeText,
          title: t("shareNativeTitle"),
          url: entryUrl,
        });
        if (nativeResult === "shared" || nativeResult === "cancelled") {
          fallbackTab?.close();
          return;
        }

        if (target === "whatsapp") {
          assignPopupOrOpen(
            fallbackTab,
            buildWhatsAppShareUrl(
              t("shareChallengeWhatsapp", {
                bracketLink: bracketUrl,
                entryId: data.entryId,
                entryLink: entryUrl,
              }),
            ),
          );
          return;
        }
        if (target === "twitter") {
          assignPopupOrOpen(
            fallbackTab,
            buildTwitterIntentUrl(
              t("shareChallengeTweet", { entryId: data.entryId }),
              entryUrl,
            ),
          );
          return;
        }
        if (target === "facebook") {
          assignPopupOrOpen(
            fallbackTab,
            buildFacebookShareUrl(
              entryUrl,
              t("shareChallengeWhatsapp", {
                bracketLink: bracketUrl,
                entryId: data.entryId,
                entryLink: entryUrl,
              }),
            ),
          );
          return;
        }
        fallbackTab?.close();
        openInstagramHint(t("instagramAlert"));
      } catch {
        try {
          if (target === "whatsapp") {
            assignPopupOrOpen(
              fallbackTab,
              buildWhatsAppShareUrl(
                t("shareChallengeWhatsapp", {
                  bracketLink: bracketUrl,
                  entryId: data.entryId,
                  entryLink: entryUrl,
                }),
              ),
            );
          } else if (target === "twitter") {
            assignPopupOrOpen(
              fallbackTab,
              buildTwitterIntentUrl(
                t("shareChallengeTweet", { entryId: data.entryId }),
                entryUrl,
              ),
            );
          } else if (target === "facebook") {
            assignPopupOrOpen(
              fallbackTab,
              buildFacebookShareUrl(
                entryUrl,
                t("shareChallengeWhatsapp", {
                  bracketLink: bracketUrl,
                  entryId: data.entryId,
                  entryLink: entryUrl,
                }),
              ),
            );
          } else {
            openInstagramHint(t("instagramAlert"));
          }
        } catch {
          fallbackTab?.close();
          window.alert(t("shareExportError"));
        }
      } finally {
        setSocialBusy(false);
      }
    },
    [data, getShareBlob, locale, origin, t],
  );

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

  return (
    <div className="flex min-h-screen flex-col bg-surface font-body text-on-surface antialiased">
      <div
        aria-hidden
        className="pointer-events-none fixed top-0 -left-[14000px] z-0"
      >
        <BracketShareCard ref={shareCardRef} data={data} />
      </div>
      <SuccessHeader />
      <main className="min-h-screen pb-16 pt-24">
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
          <div className="pointer-events-none absolute inset-0 -z-[5] opacity-40">
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
                  alt={winnerTeam.name}
                  className="h-24 w-24 rounded-full object-cover"
                  height={96}
                  src={winnerTeam.flagUrl}
                  width={96}
                />
              </div>
              <h3 className="font-headline text-3xl font-black tracking-tight italic">
                {winnerTeam.name.toUpperCase()}
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
                                alt={home.name}
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
                                alt={away.name}
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
              <button
                type="button"
                disabled={downloadBusy || socialBusy}
                className="group mt-8 flex items-center justify-center gap-2 rounded-xl border-2 border-primary py-4 font-headline font-bold text-primary transition-all hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-60"
                onClick={() => {
                  void handleSharePng();
                }}
              >
                <span className="material-symbols-outlined transition-transform group-hover:scale-110">
                  image
                </span>
                {downloadBusy ? t("shareExporting") : t("downloadSharePng")}
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-6 lg:col-span-4">
            <div className="flex h-full flex-col rounded-xl bg-surface-container-high/50 p-8">
              <h4 className="font-headline mb-2 text-lg font-extrabold text-on-surface">
                {t("challengeTitle")}
              </h4>
              <p className="mb-4 text-sm font-medium text-on-surface-variant">
                {t("challengeBody")}
              </p>
              <p className="mb-6 text-xs leading-relaxed text-on-surface-variant">
                {t("shareNativeHint")}
              </p>
              <div className="grid grow grid-cols-2 gap-4">
                <button
                  type="button"
                  disabled={downloadBusy || socialBusy}
                  className="flex flex-col items-center justify-center gap-2 rounded-xl border border-outline-variant/10 bg-surface-container-lowest p-4 shadow-sm transition-all hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                  onClick={() => {
                    void handleShare("whatsapp");
                  }}
                >
                  <span className="material-symbols-outlined text-3xl text-emerald-500">
                    chat
                  </span>
                  <span className="font-label text-xs font-bold uppercase">
                    WhatsApp
                  </span>
                </button>
                <button
                  type="button"
                  disabled={downloadBusy || socialBusy}
                  className="flex flex-col items-center justify-center gap-2 rounded-xl border border-outline-variant/10 bg-surface-container-lowest p-4 shadow-sm transition-all hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                  onClick={() => {
                    void handleShare("twitter");
                  }}
                >
                  <span className="material-symbols-outlined text-3xl text-slate-900">
                    close
                  </span>
                  <span className="font-label text-xs font-bold uppercase">
                    Twitter/X
                  </span>
                </button>
                <button
                  type="button"
                  disabled={downloadBusy || socialBusy}
                  className="flex flex-col items-center justify-center gap-2 rounded-xl border border-outline-variant/10 bg-surface-container-lowest p-4 shadow-sm transition-all hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                  onClick={() => {
                    void handleShare("instagram");
                  }}
                >
                  <span className="material-symbols-outlined text-3xl text-pink-600">
                    photo_camera
                  </span>
                  <span className="font-label text-xs font-bold uppercase">
                    Instagram
                  </span>
                </button>
                <button
                  type="button"
                  disabled={downloadBusy || socialBusy}
                  title={t("shareFacebookPasteHint")}
                  className="flex flex-col items-center justify-center gap-2 rounded-xl border border-outline-variant/10 bg-surface-container-lowest p-4 shadow-sm transition-all hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                  onClick={() => {
                    void handleShare("facebook");
                  }}
                >
                  <span className="material-symbols-outlined text-3xl text-blue-700">
                    social_leaderboard
                  </span>
                  <span className="font-label text-xs font-bold uppercase">
                    Facebook
                  </span>
                </button>
              </div>
              <div className="mt-8 rounded-xl border border-primary/10 bg-primary/5 p-4">
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
