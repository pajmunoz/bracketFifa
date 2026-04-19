"use client";

import { useLocale, useTranslations } from "next-intl";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { BracketShareCard } from "@/components/bracket-share/BracketShareCard";
import { Footer } from "@/components/Footer";
import { NavBar } from "@/components/NavBar";
import { Link } from "@/i18n/routing";
import { entryShareAbsoluteUrl } from "@/lib/entrySharePath";
import { ROUTES } from "@/lib/routes";
import type { BracketSubmission } from "@/types/bracket";

const SHARE_CARD_WIDTH = 1200;
const SHARE_CARD_HEIGHT = 630;

export function EntryPublicView({ data }: { data: BracketSubmission }) {
  const locale = useLocale();
  const t = useTranslations("EntryPublic");
  const [copied, setCopied] = useState(false);
  const shareViewportRef = useRef<HTMLDivElement>(null);
  const [shareScale, setShareScale] = useState(1);

  useLayoutEffect(() => {
    const el = shareViewportRef.current;
    if (!el) {
      return;
    }
    const apply = () => {
      const w = el.clientWidth;
      if (w <= 0) {
        return;
      }
      setShareScale(Math.min(1, w / SHARE_CARD_WIDTH));
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => {
      ro.disconnect();
    };
  }, []);

  const shareUrl =
    typeof window !== "undefined"
      ? entryShareAbsoluteUrl(window.location.origin, locale, data.entryId)
      : "";

  const copyLink = useCallback(async () => {
    if (!shareUrl) {
      return;
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      window.prompt(t("copyFallback"), shareUrl);
    }
  }, [shareUrl, t]);

  return (
    <div className="flex min-h-screen flex-col bg-surface font-body text-on-surface antialiased">
      <NavBar />
      <main className="mx-auto w-full min-w-0 max-w-6xl flex-1 overflow-x-hidden px-6 pt-24 pb-16">
        <h1 className="font-headline mb-2 text-3xl font-black text-primary md:text-4xl">
          {t("title")}
        </h1>
        <p className="mb-2 text-on-surface-variant">
          {t("subtitle", { id: data.entryId })}
        </p>
        <p className="mb-8 text-sm text-on-surface-variant">{t("shareHint")}</p>
        <div className="mb-10 rounded-xl border border-outline-variant/20 bg-surface-container-lowest py-6 shadow-sm">
          <div
            ref={shareViewportRef}
            className="relative mx-auto w-full min-w-0 max-w-full overflow-hidden px-2 sm:px-4"
            style={{ height: SHARE_CARD_HEIGHT * shareScale }}
          >
            <div
              className="absolute top-0 left-1/2"
              style={{
                height: SHARE_CARD_HEIGHT,
                transform: `translateX(-50%) scale(${shareScale})`,
                transformOrigin: "top center",
                width: SHARE_CARD_WIDTH,
              }}
            >
              <BracketShareCard data={data} />
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
          <button
            type="button"
            className="font-headline inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-bold text-on-primary transition-opacity hover:opacity-95"
            onClick={() => {
              void copyLink();
            }}
          >
            <span className="material-symbols-outlined text-xl">link</span>
            {copied ? t("copied") : t("copyCta")}
          </button>
          <Link
            className="font-headline inline-flex items-center justify-center gap-2 rounded-xl border-2 border-primary px-6 py-3 font-bold text-primary transition-colors hover:bg-primary/5"
            href={ROUTES.home}
          >
            <span className="material-symbols-outlined text-xl">sports_soccer</span>
            {t("ctaBracket")}
          </Link>
        </div>
        <p className="mt-4 text-sm text-on-surface-variant">{t("ctaBracketHint")}</p>
      </main>
      <Footer />
    </div>
  );
}
