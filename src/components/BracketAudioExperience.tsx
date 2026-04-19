"use client";

import { animate, cubicBezier } from "animejs";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import type { MouseEvent } from "react";
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
const AUTO_COLLAPSE_MS = 4000;
const SPACER_EXPANDED = "5.75rem";
const SPACER_COLLAPSED = "4.25rem";

const EASE_DOCK = cubicBezier(0.16, 1, 0.3, 1);
const EASE_META = cubicBezier(0.22, 1, 0.36, 1);
/** Separación visual entre el faldón y el borde superior del footer al hacer scroll. */
const FOOTER_GAP_PX = 14;

type AnimInstance = ReturnType<typeof animate>;

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
  const dockRef = useRef<HTMLDivElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const metaAnimRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<AnimInstance[]>([]);
  const footerLiftRafRef = useRef<number | null>(null);
  const lastFooterLiftPxRef = useRef(-1);
  const [reduceMotion, setReduceMotion] = useState(false);

  const src = useMemo(() => bracketAudioSrc(), []);
  const [loadError, setLoadError] = useState(false);
  const [muted, setMuted] = useState(false);
  const [needsTap, setNeedsTap] = useState(false);
  const [docked, setDocked] = useState(false);

  useLayoutEffect(() => {
    setReduceMotion(prefersReducedMotion());
    try {
      if (sessionStorage.getItem(MUTED_KEY) === "1") {
        setMuted(true);
      }
    } catch {
      /* */
    }
  }, []);

  const clearAnims = useCallback(() => {
    for (const a of animRef.current) {
      a.revert();
    }
    animRef.current = [];
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
    const spacer = docked ? SPACER_COLLAPSED : SPACER_EXPANDED;
    document.documentElement.style.setProperty("--bracket-audio-spacer", spacer);
    return () => {
      document.documentElement.style.removeProperty("--bracket-audio-spacer");
    };
  }, [docked, isEntryShareRoute]);

  useEffect(() => {
    return () => {
      clearAnims();
    };
  }, [clearAnims]);

  const commitFooterLift = useCallback(() => {
    const shell = shellRef.current;
    if (!shell) {
      return;
    }
    const list = document.querySelectorAll<HTMLElement>("[data-site-footer]");
    const footer =
      list.length > 0 ? (list.item(list.length - 1) as HTMLElement) : null;
    let liftPx = 0;
    if (footer) {
      const h = window.innerHeight;
      const top = footer.getBoundingClientRect().top;
      liftPx = Math.max(0, Math.round(h - top + FOOTER_GAP_PX));
    }
    if (liftPx === lastFooterLiftPxRef.current) {
      return;
    }
    lastFooterLiftPxRef.current = liftPx;
    shell.style.bottom = liftPx > 0 ? `${liftPx}px` : "";
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
      lastFooterLiftPxRef.current = -1;
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

  const runDockCollapse = useCallback(() => {
    const dock = dockRef.current;
    if (!dock) {
      return;
    }
    clearAnims();
    if (reduceMotion) {
      setDocked(true);
      return;
    }

    const metaEl = metaAnimRef.current;

    const dockAnim = animate(dock, {
      borderBottomLeftRadius: ["0px", "18px"],
      borderBottomRightRadius: ["0px", "18px"],
      borderTopLeftRadius: ["0px", "18px"],
      borderTopRightRadius: ["0px", "18px"],
      boxShadow: [
        "0 -8px 32px rgba(0, 0, 0, 0.35)",
        "0 14px 36px rgba(0, 0, 0, 0.48)",
      ],
      duration: 820,
      ease: EASE_DOCK,
      gap: [14, 8],
      paddingBottom: [
        "calc(12px + env(safe-area-inset-bottom, 0px))",
        "calc(10px + env(safe-area-inset-bottom, 0px))",
      ],
      paddingLeft: [
        "calc(14px + env(safe-area-inset-left, 0px))",
        "12px",
      ],
      paddingRight: [
        "calc(14px + env(safe-area-inset-right, 0px))",
        "12px",
      ],
      paddingTop: [10, 8],
      rotate: ["0deg", "-0.9deg"],
      translateY: ["0px", "-6px"],
      width: ["100%", "280px"],
    });
    animRef.current.push(dockAnim);

    if (metaEl && !needsTap && !loadError) {
      const m = animate(metaEl, {
        duration: 560,
        ease: EASE_META,
        maxHeight: [120, 0],
        opacity: [1, 0],
      });
      animRef.current.push(m);
    }

    void dockAnim.then(() => {
      setDocked(true);
    });
  }, [clearAnims, loadError, needsTap, reduceMotion]);

  const runDockExpand = useCallback(() => {
    const dock = dockRef.current;
    if (!dock) {
      return;
    }
    clearAnims();
    setDocked(false);

    if (reduceMotion) {
      return;
    }

    const metaEl = metaAnimRef.current;

    const dockAnim = animate(dock, {
      borderBottomLeftRadius: ["18px", "0px"],
      borderBottomRightRadius: ["18px", "0px"],
      borderTopLeftRadius: ["18px", "0px"],
      borderTopRightRadius: ["18px", "0px"],
      boxShadow: [
        "0 14px 36px rgba(0, 0, 0, 0.48)",
        "0 -8px 32px rgba(0, 0, 0, 0.35)",
      ],
      duration: 760,
      ease: EASE_DOCK,
      gap: [8, 14],
      paddingBottom: [
        "calc(10px + env(safe-area-inset-bottom, 0px))",
        "calc(12px + env(safe-area-inset-bottom, 0px))",
      ],
      paddingLeft: [
        "12px",
        "calc(14px + env(safe-area-inset-left, 0px))",
      ],
      paddingRight: [
        "12px",
        "calc(14px + env(safe-area-inset-right, 0px))",
      ],
      paddingTop: [8, 10],
      rotate: ["-0.9deg", "0deg"],
      translateY: ["-6px", "0px"],
      width: ["280px", "100%"],
    });
    animRef.current.push(dockAnim);

    if (metaEl && !needsTap && !loadError) {
      const m = animate(metaEl, {
        delay: 100,
        duration: 520,
        ease: EASE_META,
        maxHeight: [0, 120],
        opacity: [0, 1],
      });
      animRef.current.push(m);
    }
  }, [clearAnims, loadError, needsTap, reduceMotion]);

  useEffect(() => {
    if (docked || loadError || needsTap) {
      return;
    }
    const id = window.setTimeout(() => {
      runDockCollapse();
    }, AUTO_COLLAPSE_MS);
    return () => {
      window.clearTimeout(id);
    };
  }, [docked, loadError, needsTap, runDockCollapse]);

  const onTapToPlay = useCallback(() => {
    tryPlay();
  }, [tryPlay]);

  const toggleMute = useCallback(() => {
    setMuted((m) => !m);
  }, []);

  const onDockSurfaceClick = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      if (!docked) {
        return;
      }
      const target = event.target as HTMLElement | null;
      if (target?.closest("button")) {
        return;
      }
      runDockExpand();
    },
    [docked, runDockExpand],
  );

  const barClass =
    `${styles.bar} ${docked && reduceMotion ? styles.barCollapsedRm : ""}`.trim();

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
      <div
        ref={shellRef}
        className={`${styles.shell} ${docked ? styles.shellPadded : ""}`.trim()}
      >
        <div
          ref={dockRef}
          aria-expanded={!docked}
          aria-label={docked ? t("expandDock") : t("badge")}
          className={barClass}
          role="region"
          onClick={onDockSurfaceClick}
        >
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
