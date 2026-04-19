"use client";

import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import styles from "@/components/BracketAudioExperience.module.css";

const MUTED_KEY = "bracketExperienceAudioMuted";
/** Reserva espacio bajo el contenido (altura del faldón + safe-area típico en móvil). */
const SPACER_FOR_FLOATING_BAR = "5.75rem";
/** Sin hueco: el borde inferior del faldón coincide con el borde superior del footer. */
const FOOTER_GAP_PX = 0;

function bracketAudioSrc(): string {
  const u = process.env.NEXT_PUBLIC_BRACKET_AUDIO_URL?.trim();
  if (u && u.length > 0) {
    return u;
  }
  return "/audio/StandBackUp.mp3";
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/** Vista pública `/entrada/[entryId]` (con o sin prefijo de locale, p. ej. `/en/entrada/…`). */
function isBracketEntrySharePathname(pathname: string): boolean {
  const path = pathname.split("?")[0].split("#")[0];
  const parts = path.split("/").filter(Boolean);
  for (let i = 0; i < parts.length - 1; i += 1) {
    if (parts[i] === "entrada" && parts[i + 1] !== "") {
      return true;
    }
  }
  return false;
}

export function BracketAudioExperience() {
  const t = useTranslations("BracketAudio");
  const pathname = usePathname();
  const isEntryShareRoute = isBracketEntrySharePathname(pathname);
  const audioRef = useRef<HTMLAudioElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const metaAnimRef = useRef<HTMLDivElement>(null);
  const footerLiftRafRef = useRef<number | null>(null);
  const lastFooterBottomStyleRef = useRef<string | null>(null);

  const src = useMemo(() => bracketAudioSrc(), []);
  const [loadError, setLoadError] = useState(false);
  const [muted, setMuted] = useState(false);
  const [needsTap, setNeedsTap] = useState(false);

  useLayoutEffect(() => {
    try {
      if (sessionStorage.getItem(MUTED_KEY) === "1") {
        setMuted(true);
      }
    } catch {
      /* */
    }
  }, []);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) {
      return;
    }
    a.muted = muted;
    try {
      sessionStorage.setItem(MUTED_KEY, muted ? "1" : "0");
    } catch {
      /* */
    }
  }, [muted]);

  useEffect(() => {
    if (isEntryShareRoute) {
      document.documentElement.style.setProperty("--bracket-audio-spacer", "0px");
      return () => {
        document.documentElement.style.removeProperty("--bracket-audio-spacer");
      };
    }
    document.documentElement.style.setProperty(
      "--bracket-audio-spacer",
      SPACER_FOR_FLOATING_BAR,
    );
    return () => {
      document.documentElement.style.removeProperty("--bracket-audio-spacer");
    };
  }, [isEntryShareRoute]);

  const commitFooterLift = useCallback(() => {
    const shell = shellRef.current;
    if (!shell) {
      return;
    }
    const list = document.querySelectorAll<HTMLElement>("[data-site-footer]");
    const footer =
      list.length > 0 ? (list.item(list.length - 1) as HTMLElement) : null;
    let liftFromFooterPx = 0;
    if (footer) {
      const h = window.innerHeight;
      const top = footer.getBoundingClientRect().top;
      liftFromFooterPx = Math.max(
        0,
        Math.ceil(h - top + FOOTER_GAP_PX),
      );
    }
    const nextBottom =
      liftFromFooterPx > 0 ? `${liftFromFooterPx}px` : "";
    if (nextBottom === lastFooterBottomStyleRef.current) {
      return;
    }
    lastFooterBottomStyleRef.current = nextBottom;
    shell.style.bottom = nextBottom;
  }, []);

  const scheduleFooterLift = useCallback(() => {
    if (footerLiftRafRef.current != null) {
      return;
    }
    footerLiftRafRef.current = requestAnimationFrame(() => {
      footerLiftRafRef.current = null;
      commitFooterLift();
    });
  }, [commitFooterLift]);

  useLayoutEffect(() => {
    commitFooterLift();
    const onScrollOrResize = () => {
      scheduleFooterLift();
    };
    document.addEventListener("scroll", onScrollOrResize, {
      capture: true,
      passive: true,
    });
    window.addEventListener("resize", onScrollOrResize);
    const bootId = window.setTimeout(() => {
      commitFooterLift();
    }, 0);
    return () => {
      document.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
      window.clearTimeout(bootId);
      if (footerLiftRafRef.current != null) {
        cancelAnimationFrame(footerLiftRafRef.current);
        footerLiftRafRef.current = null;
      }
      lastFooterBottomStyleRef.current = null;
      if (shellRef.current) {
        shellRef.current.style.bottom = "";
      }
    };
  }, [commitFooterLift, pathname, scheduleFooterLift]);

  const tryPlay = useCallback(() => {
    const a = audioRef.current;
    if (!a || loadError) {
      return;
    }
    void a.play().catch(() => {
      setNeedsTap(true);
    });
  }, [loadError]);

  useEffect(() => {
    if (isEntryShareRoute) {
      return;
    }
    const a = audioRef.current;
    if (!a) {
      return;
    }
    a.volume = 0.32;
    const onError = () => {
      setLoadError(true);
      setNeedsTap(false);
    };
    const onPlaying = () => {
      setNeedsTap(false);
    };
    a.addEventListener("error", onError);
    a.addEventListener("playing", onPlaying);

    if (prefersReducedMotion()) {
      setNeedsTap(true);
    } else {
      void a.play().catch(() => {
        setNeedsTap(true);
      });
    }

    return () => {
      a.pause();
      a.removeEventListener("error", onError);
      a.removeEventListener("playing", onPlaying);
    };
  }, [isEntryShareRoute]);

  const onTapToPlay = useCallback(() => {
    tryPlay();
  }, [tryPlay]);

  const toggleMute = useCallback(() => {
    setMuted((m) => !m);
  }, []);

  if (isEntryShareRoute) {
    return null;
  }

  return (
    <>
      <audio
        ref={audioRef}
        aria-hidden
        className="sr-only"
        loop
        preload="auto"
        src={src}
      />
      <div ref={shellRef} className={styles.shell}>
        <div aria-label={t("badge")} className={styles.bar} role="region">
          <div className={styles.badge}>{t("badge")}</div>
          {loadError ? (
            <div className={styles.metaAnim} ref={metaAnimRef}>
              <div className={styles.meta}>
                <span className={styles.nowPlaying}>{t("nowPlaying")}</span>
                <span className={styles.track}>{t("loadError")}</span>
              </div>
            </div>
          ) : needsTap ? (
            <>
              <button
                className={`${styles.tapOverlay} ${styles.tapAnim}`}
                type="button"
                onClick={onTapToPlay}
              >
                {t("tapToPlay")}
              </button>
              <button
                aria-label={t("mute")}
                className={`${styles.muteBtn} pointer-events-none opacity-40`}
                disabled
                type="button"
              >
                <span className="material-symbols-outlined text-2xl">
                  volume_off
                </span>
              </button>
            </>
          ) : (
            <>
              <div className={styles.metaAnim} ref={metaAnimRef}>
                <div className={styles.meta}>
                  <span className={styles.nowPlaying}>{t("nowPlaying")}</span>
                  <span className={styles.track}>{t("track")}</span>
                  <span className={styles.artist}>{t("artist")}</span>
                </div>
              </div>
              <button
                aria-label={muted ? t("unmute") : t("mute")}
                aria-pressed={muted}
                className={`${styles.muteBtn} ${muted ? styles.muteBtnMuted : ""}`}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleMute();
                }}
              >
                <span
                  className="material-symbols-outlined text-2xl"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {muted ? "volume_off" : "volume_up"}
                </span>
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
