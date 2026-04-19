"use client";

import { useGSAP } from "@gsap/react";
import { animate, createTimeline, stagger } from "animejs";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Link } from "@/i18n/routing";
import {
  drawImageCover,
  sizeCanvasToElement,
} from "@/lib/welcomeFilmDraw";
import { ROUTES } from "@/lib/routes";
import styles from "@/components/welcome/WelcomeHero.module.css";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const WELCOME_FRAME_COUNT = 150;
/** Fotograma a partir del cual comienza a mostrarse título y botón (solo con scroll). */
const WELCOME_HERO_GATE = 40;
/** Fotograma hasta el que termina la entrada del bloque título + botón. */
const HERO_INTRO_END = 56;
/** Fotogramas ~1–18: entrada del logo (fade + desde arriba). */
const INTRO_LOGO_END = 18;
/** Primer fotograma donde comienza a verse "presenta". */
const INTRO_PRESENTA_START = 12;
/** Último fotograma donde termina la entrada de "presenta" (antes del gate). */
const INTRO_PRESENTA_END = 36;
/** Por debajo de este frame el velo oscuro de lectura está totalmente apagado (fade out). */
const READABILITY_SCRIM_OFF_UNTIL = 70;
/** Fotograma en el que el velo alcanza opacidad plena (fade in tras el 70). */
const READABILITY_SCRIM_FULL_BY = 108;
/** Opacidad máxima del velo (0–1). */
const READABILITY_SCRIM_MAX = 0.82;
const FRAME_BASE = "/welcome_video/webp";
const SIERRA_LOGO_SRC = "/sierra-labs-logo.png";

function smoothstep01(t: number): number {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
}

function frameUrl(index: number): string {
  const n = Math.min(WELCOME_FRAME_COUNT, Math.max(1, Math.round(index)));
  return `${FRAME_BASE}/${String(n).padStart(3, "0")}.webp`;
}

/** Carga paralela acotada para no saturar conexiones HTTP del navegador. */
const WELCOME_FRAME_PRELOAD_CONCURRENCY = 8;

function loadFrameIntoCache(
  cache: Map<number, HTMLImageElement>,
  index: number,
): Promise<void> {
  const clamped = Math.min(
    WELCOME_FRAME_COUNT,
    Math.max(1, Math.round(index)),
  );
  let img = cache.get(clamped);
  if (!img) {
    img = new Image();
    img.decoding = "async";
    cache.set(clamped, img);
  }
  /* Sin datos útiles, muchos navegadores dan complete===true y naturalWidth===0;
   * salir solo con complete rompía la precarga (nunca se asignaba src). */
  if (img.complete && img.naturalWidth > 0) {
    return Promise.resolve();
  }
  if (img.src && img.complete) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) {
        return;
      }
      settled = true;
      img.removeEventListener("load", finish);
      img.removeEventListener("error", finish);
      if (typeof img.decode === "function") {
        void img.decode().catch(() => {
          /* decode opcional; el bitmap ya está tras load */
        });
      }
      resolve();
    };
    img.addEventListener("load", finish, { once: true });
    img.addEventListener("error", finish, { once: true });
    const url = frameUrl(clamped);
    if (!img.src) {
      img.src = url;
    }
    if (img.complete && img.naturalWidth > 0) {
      finish();
    }
  });
}

async function preloadAllWelcomeFrames(
  cache: Map<number, HTMLImageElement>,
  shouldAbort: () => boolean,
): Promise<void> {
  const indices = Array.from({ length: WELCOME_FRAME_COUNT }, (_, i) => i + 1);
  for (let i = 0; i < indices.length; i += WELCOME_FRAME_PRELOAD_CONCURRENCY) {
    if (shouldAbort()) {
      return;
    }
    const slice = indices.slice(i, i + WELCOME_FRAME_PRELOAD_CONCURRENCY);
    await Promise.all(slice.map((n) => loadFrameIntoCache(cache, n)));
  }
}

const GRID_COLS = 10;
const GRID_ROWS = 6;
const PERF_COUNT = 6;
/** Duración del scroll automático de la bienvenida (solo móvil al cargar). */
const WELCOME_REPLAY_SCROLL_SEC = 4.75;

export function WelcomeHero() {
  const scrollTrackRef = useRef<HTMLDivElement>(null);
  const filmWrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(1);
  const imageCacheRef = useRef<Map<number, HTMLImageElement>>(new Map());
  const filmReadyNotified = useRef(false);
  const welcomeFilmStRef = useRef<ScrollTrigger | null>(null);
  const playReplayRef = useRef<(() => void) | null>(null);
  const welcomeProgressSyncRef = useRef<(p: number) => void>(() => {});
  const replayProxyRef = useRef({ p: 0 });
  const filmReadyRef = useRef(false);
  const t = useTranslations("Welcome");
  const heroTitle = t("heroTitle");

  const [frame, setFrame] = useState(1);
  const [filmReady, setFilmReady] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const scrollRafRef = useRef(0);

  filmReadyRef.current = filmReady;

  useLayoutEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncReduce = () => {
      setReducedMotion(mq.matches);
    };
    syncReduce();
    mq.addEventListener("change", syncReduce);
    return () => {
      mq.removeEventListener("change", syncReduce);
    };
  }, []);

  useLayoutEffect(() => {
    const prevRestoration = history.scrollRestoration;
    history.scrollRestoration = "manual";

    const root = document.scrollingElement ?? document.documentElement;
    root.scrollTop = 0;
    root.scrollLeft = 0;
    window.scrollTo(0, 0);

    const onPageShow = (event: PageTransitionEvent) => {
      if (!event.persisted) {
        return;
      }
      root.scrollTop = 0;
      root.scrollLeft = 0;
      window.scrollTo(0, 0);
      setFrame(1);
      requestAnimationFrame(() => {
        ScrollTrigger.refresh(true);
        const mobile = window.matchMedia("(max-width: 767px)").matches;
        const reduce = window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        ).matches;
        if (filmReadyRef.current && mobile && !reduce) {
          window.setTimeout(() => {
            playReplayRef.current?.();
          }, 500);
        }
      });
    };

    window.addEventListener("pageshow", onPageShow);

    return () => {
      history.scrollRestoration = prevRestoration;
      window.removeEventListener("pageshow", onPageShow);
    };
  }, []);

  const scrollElementForSt = useCallback((st: ScrollTrigger): HTMLElement => {
    if (st.scroller === window) {
      return (document.scrollingElement ?? document.documentElement) as HTMLElement;
    }
    return st.scroller as HTMLElement;
  }, []);

  const playWelcomeScrollReplay = useCallback(() => {
    const st = welcomeFilmStRef.current;
    if (!st || reducedMotion) {
      return;
    }
    const mobile = window.matchMedia("(max-width: 767px)").matches;
    if (!mobile) {
      return;
    }
    const start = st.start;
    const end = st.end;
    if (!Number.isFinite(start) || !Number.isFinite(end)) {
      return;
    }

    const scrollEl = scrollElementForSt(st);
    const sync = welcomeProgressSyncRef.current;
    const range = end - start;

    gsap.killTweensOf(scrollEl);
    gsap.killTweensOf(replayProxyRef.current);
    replayProxyRef.current.p = 0;

    st.disable();
    scrollEl.scrollTop = start;
    sync(0);

    let restored = false;
    const restore = () => {
      if (restored) {
        return;
      }
      restored = true;
      st.enable();
      scrollEl.scrollTop = end;
      sync(1);
      ScrollTrigger.refresh();
      ScrollTrigger.update();
    };

    gsap.to(replayProxyRef.current, {
      duration: WELCOME_REPLAY_SCROLL_SEC,
      ease: "none",
      onComplete: restore,
      onKill: restore,
      onUpdate: () => {
        const p = replayProxyRef.current.p;
        scrollEl.scrollTop = start + p * range;
        sync(p);
      },
      p: 1,
    });
  }, [reducedMotion, scrollElementForSt]);

  useEffect(() => {
    if (!filmReady || reducedMotion) {
      return;
    }
    const mobileMq = window.matchMedia("(max-width: 767px)");
    if (!mobileMq.matches) {
      return;
    }
    const tid = window.setTimeout(() => {
      playWelcomeScrollReplay();
    }, 500);
    return () => {
      window.clearTimeout(tid);
    };
  }, [filmReady, reducedMotion, playWelcomeScrollReplay]);

  useLayoutEffect(() => {
    const cache = imageCacheRef.current;
    let cancelled = false;
    filmReadyNotified.current = false;

    void (async () => {
      await preloadAllWelcomeFrames(cache, () => cancelled);
      if (cancelled || filmReadyNotified.current) {
        return;
      }
      filmReadyNotified.current = true;
      setFilmReady(true);
      requestAnimationFrame(() => {
        ScrollTrigger.refresh();
      });
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    const wrap = filmWrapRef.current;
    if (!canvas || !wrap) {
      return undefined;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return undefined;
    }

    const cache = imageCacheRef.current;

    const ensureImage = (index: number): HTMLImageElement => {
      const clamped = Math.min(
        WELCOME_FRAME_COUNT,
        Math.max(1, Math.round(index)),
      );
      let img = cache.get(clamped);
      if (!img) {
        img = new Image();
        img.decoding = "async";
        img.src = frameUrl(clamped);
        cache.set(clamped, img);
      } else if (!img.src) {
        img.src = frameUrl(clamped);
      }
      return img;
    };

    const prefetchNeighbors = (center: number) => {
      for (let d = -3; d <= 3; d += 1) {
        if (d === 0) {
          continue;
        }
        ensureImage(center + d);
      }
    };

    const paint = (index: number) => {
      sizeCanvasToElement(canvas, wrap);
      const img = ensureImage(index);
      prefetchNeighbors(index);

      const draw = () => {
        drawImageCover(ctx, canvas, img);
      };

      if (img.complete && img.naturalWidth > 0) {
        draw();
      } else {
        img.addEventListener(
          "load",
          () => {
            draw();
          },
          { once: true },
        );
      }
    };

    paint(frame);
    frameRef.current = frame;

    const ro = new ResizeObserver(() => {
      sizeCanvasToElement(canvas, wrap);
      const current = frameRef.current;
      const img = cache.get(current);
      if (img?.complete && img.naturalWidth > 0) {
        drawImageCover(ctx, canvas, img);
      }
      requestAnimationFrame(() => {
        ScrollTrigger.refresh();
      });
    });

    ro.observe(wrap);
    return () => {
      ro.disconnect();
    };
  }, [frame]);

  useGSAP(
    () => {
      const track = scrollTrackRef.current;
      if (!track) {
        return undefined;
      }

      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      const frameScale = track.querySelector<HTMLElement>(
        ".welcome-frame-scale",
      );
      const progressInner = track.querySelector<HTMLElement>(
        ".welcome-progress-inner",
      );

      if (reduce) {
        setFrame(WELCOME_FRAME_COUNT);
        filmReadyNotified.current = true;
        setFilmReady(true);
        if (frameScale) {
          gsap.set(frameScale, { scale: 1 });
        }
        if (progressInner) {
          gsap.set(progressInner, { scaleX: 1, transformOrigin: "left center" });
        }
        const logo = track.querySelector<HTMLElement>(".welcome-intro-logo");
        const presenta = track.querySelector<HTMLElement>(
          ".welcome-intro-presenta",
        );
        if (logo) {
          gsap.set(logo, { autoAlpha: 1, clearProps: "transform", y: 0 });
        }
        if (presenta) {
          gsap.set(presenta, { autoAlpha: 1, clearProps: "transform", y: 0 });
        }
        const heroLayer = track.querySelector<HTMLElement>(".welcome-hero-layer");
        const titleEl = track.querySelector<HTMLElement>(".welcome-title-main");
        const btnEl = track.querySelector<HTMLElement>(".welcome-continue");
        if (heroLayer) {
          gsap.set(heroLayer, {
            autoAlpha: 1,
            clearProps: "visibility",
            pointerEvents: "auto",
            visibility: "visible",
          });
        }
        if (titleEl) {
          gsap.set(titleEl, {
            autoAlpha: 1,
            clearProps: "transform",
            pointerEvents: "none",
            rotationX: 0,
            y: 0,
          });
        }
        if (btnEl) {
          gsap.set(btnEl, {
            autoAlpha: 1,
            clearProps: "transform",
            pointerEvents: "auto",
            scale: 1,
            y: 0,
          });
        }
        const scrimEl = track.querySelector<HTMLElement>(
          ".welcome-readability-scrim",
        );
        if (scrimEl) {
          gsap.set(scrimEl, {
            autoAlpha: READABILITY_SCRIM_MAX,
            pointerEvents: "none",
          });
        }
        return undefined;
      }

      if (progressInner) {
        gsap.set(progressInner, {
          scaleX: 0.004,
          transformOrigin: "left center",
        });
      }

      const logoInit = track.querySelector<HTMLElement>(".welcome-intro-logo");
      const presentaInit = track.querySelector<HTMLElement>(
        ".welcome-intro-presenta",
      );
      if (logoInit) {
        gsap.set(logoInit, { autoAlpha: 0, y: -56 });
      }
      if (presentaInit) {
        gsap.set(presentaInit, { autoAlpha: 0, y: 18 });
      }

      const heroLayerInit = track.querySelector<HTMLElement>(
        ".welcome-hero-layer",
      );
      const titleInit = track.querySelector<HTMLElement>(".welcome-title-main");
      const btnInit = track.querySelector<HTMLElement>(".welcome-continue");
      if (heroLayerInit) {
        gsap.set(heroLayerInit, {
          autoAlpha: 0,
          pointerEvents: "none",
          visibility: "hidden",
        });
      }
      if (titleInit) {
        gsap.set(titleInit, {
          autoAlpha: 0,
          pointerEvents: "none",
          rotationX: 0,
          y: 24,
        });
      }
      if (btnInit) {
        gsap.set(btnInit, {
          autoAlpha: 0,
          pointerEvents: "none",
          scale: 0.88,
          y: 14,
        });
      }

      const scrimInit = track.querySelector<HTMLElement>(
        ".welcome-readability-scrim",
      );
      if (scrimInit) {
        gsap.set(scrimInit, {
          autoAlpha: 0,
          pointerEvents: "none",
        });
      }

      const applyReadabilityScrim = (clamped: number) => {
        const scrim = track.querySelector<HTMLElement>(
          ".welcome-readability-scrim",
        );
        if (!scrim) {
          return;
        }
        const span = Math.max(
          1,
          READABILITY_SCRIM_FULL_BY - READABILITY_SCRIM_OFF_UNTIL,
        );
        const raw = (clamped - READABILITY_SCRIM_OFF_UNTIL) / span;
        const eased = smoothstep01(Math.min(1, Math.max(0, raw)));
        const alpha = eased * READABILITY_SCRIM_MAX;
        gsap.set(scrim, {
          autoAlpha: alpha,
          pointerEvents: "none",
        });
      };

      const applyHeroForFrame = (clamped: number) => {
        const heroLayer = track.querySelector<HTMLElement>(
          ".welcome-hero-layer",
        );
        const titleEl = track.querySelector<HTMLElement>(".welcome-title-main");
        const btnEl = track.querySelector<HTMLElement>(".welcome-continue");
        if (!heroLayer || !titleEl || !btnEl) {
          return;
        }

        if (clamped < WELCOME_HERO_GATE) {
          gsap.set(heroLayer, {
            autoAlpha: 0,
            pointerEvents: "none",
            visibility: "hidden",
          });
          gsap.set(titleEl, {
            autoAlpha: 0,
            pointerEvents: "none",
            rotationX: 0,
            y: 24,
          });
          gsap.set(btnEl, {
            autoAlpha: 0,
            pointerEvents: "none",
            scale: 0.88,
            y: 14,
          });
          return;
        }

        const span = Math.max(1, HERO_INTRO_END - WELCOME_HERO_GATE);
        const t = Math.min(1, Math.max(0, (clamped - WELCOME_HERO_GATE) / span));

        gsap.set(heroLayer, { visibility: "visible" });
        gsap.set(heroLayer, {
          autoAlpha: Math.min(1, t * 1.02),
          pointerEvents: t > 0.92 ? "auto" : "none",
        });

        const tTitle = Math.min(1, Math.max(0, (t - 0.18) / 0.82));
        gsap.set(titleEl, {
          autoAlpha: tTitle,
          pointerEvents: "none",
          rotationX: (1 - tTitle) * -22,
          y: (1 - tTitle) * 22,
        });

        const tBtn = Math.min(1, Math.max(0, (t - 0.38) / 0.62));
        gsap.set(btnEl, {
          autoAlpha: tBtn,
          pointerEvents: tBtn > 0.55 ? "auto" : "none",
          scale: 0.86 + 0.14 * tBtn,
          y: (1 - tBtn) * 14,
        });
      };

      const applyWelcomeFilmProgress = (progress: number) => {
        const p = Math.min(1, Math.max(0, progress));
        const nextFrame = 1 + Math.round(p * (WELCOME_FRAME_COUNT - 1));
        const clamped = Math.min(
          WELCOME_FRAME_COUNT,
          Math.max(1, nextFrame),
        );
        setFrame(clamped);
        if (frameScale) {
          gsap.set(frameScale, { scale: 1 + p * 0.08 });
        }
        if (progressInner) {
          gsap.set(progressInner, {
            scaleX: Math.max(0.004, p),
            transformOrigin: "left center",
          });
        }

        const logo = track.querySelector<HTMLElement>(".welcome-intro-logo");
        const presenta = track.querySelector<HTMLElement>(
          ".welcome-intro-presenta",
        );
        if (logo) {
          const logoSpan = Math.max(1, INTRO_LOGO_END - 1);
          const logoP = Math.min(
            1,
            Math.max(0, (clamped - 1) / logoSpan),
          );
          gsap.set(logo, {
            autoAlpha: logoP,
            y: (1 - logoP) * -56,
          });
        }
        if (presenta) {
          if (clamped <= INTRO_PRESENTA_START) {
            gsap.set(presenta, { autoAlpha: 0, y: 18 });
          } else {
            const span = Math.max(
              1,
              INTRO_PRESENTA_END - INTRO_PRESENTA_START,
            );
            const presP = Math.min(
              1,
              Math.max(0, (clamped - INTRO_PRESENTA_START) / span),
            );
            gsap.set(presenta, {
              autoAlpha: presP,
              y: (1 - presP) * 16,
            });
          }
        }

        applyReadabilityScrim(clamped);
        applyHeroForFrame(clamped);
      };

      welcomeProgressSyncRef.current = applyWelcomeFilmProgress;

      const st = ScrollTrigger.create({
        end: "bottom bottom",
        onUpdate: (self) => {
          cancelAnimationFrame(scrollRafRef.current);
          scrollRafRef.current = requestAnimationFrame(() => {
            welcomeProgressSyncRef.current(self.progress);
          });
        },
        scrub: 0.75,
        start: "top top",
        trigger: track,
      });

      welcomeFilmStRef.current = st;

      ScrollTrigger.update();

      requestAnimationFrame(() => {
        window.scrollTo(0, 0);
        ScrollTrigger.refresh(true);
        ScrollTrigger.update();
      });

      return () => {
        cancelAnimationFrame(scrollRafRef.current);
        gsap.killTweensOf(replayProxyRef.current);
        welcomeProgressSyncRef.current = () => {};
        try {
          st.enable();
        } catch {
          /* noop */
        }
        welcomeFilmStRef.current = null;
        st.kill();
      };
    },
    { scope: scrollTrackRef },
  );

  useGSAP(
    () => {
      const track = scrollTrackRef.current;
      if (!track) {
        return undefined;
      }

      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      const cells = gsap.utils.toArray<HTMLElement>(
        track.querySelectorAll(".welcome-cell"),
      );

      const animeCleanups: Array<() => void> = [];

      if (cells.length && !reduce) {
        const gridTl = createTimeline({ autoplay: true });
        gridTl.add(cells, {
          delay: stagger(18, { from: "center" }),
          duration: 640,
          ease: "outExpo",
          opacity: [0, 0.38],
          scale: [0.2, 1],
        });
        animeCleanups.push(() => {
          gridTl.revert();
        });
      } else if (cells.length) {
        gsap.set(cells, { opacity: 0.12, scale: 1 });
      }

      const perfs = track.querySelectorAll(".welcome-perf");
      if (perfs.length && !reduce) {
        const perfAnim = animate(perfs, {
          delay: stagger(80, { from: "random" }),
          duration: 900,
          ease: "outQuad",
          loop: true,
          opacity: [0.15, 0.55, 0.15],
        });
        animeCleanups.push(() => {
          perfAnim.revert();
        });
      }

      return () => {
        animeCleanups.forEach((fn) => {
          fn();
        });
      };
    },
    { scope: scrollTrackRef },
  );

  playReplayRef.current = playWelcomeScrollReplay;

  const gridCells = Array.from(
    { length: GRID_COLS * GRID_ROWS },
    (_, index) => (
      <div
        aria-hidden
        className={`welcome-cell ${styles.cell}`}
        key={`cell-${index}`}
      />
    ),
  );

  const leftPerfs = Array.from({ length: PERF_COUNT }, (_, i) => (
    <span
      aria-hidden
      className={`welcome-perf ${styles.perf}`}
      key={`pl-${i}`}
    />
  ));
  const rightPerfs = Array.from({ length: PERF_COUNT }, (_, i) => (
    <span
      aria-hidden
      className={`welcome-perf ${styles.perf}`}
      key={`pr-${i}`}
    />
  ));

  return (
    <section aria-labelledby="welcome-title" className={styles.outer}>
      <div className={styles.topBar}>
        <div className="rounded-full border border-white/15 bg-black/35 px-2 py-1 backdrop-blur-md">
          <LanguageSwitcher />
        </div>
      </div>

      <div className={styles.scrollTrack} ref={scrollTrackRef}>
        <div className={styles.stickyStage}>
          <div
            className={`welcome-frame-scale ${styles.frameScale}`}
            ref={filmWrapRef}
          >
            <canvas
              aria-hidden
              className={`welcome-film-canvas ${styles.filmCanvas}`}
              ref={canvasRef}
            />
          </div>

          <div aria-hidden className={styles.vignette} />
          <div
            aria-hidden
            className={`welcome-readability-scrim ${styles.readabilityScrim}`}
          />
          <div aria-hidden className={styles.gridOverlay}>
            {gridCells}
          </div>

          <div
            aria-hidden
            className={`${styles.perfCol} ${styles.perfColLeft}`}
          >
            {leftPerfs}
          </div>
          <div
            aria-hidden
            className={`${styles.perfCol} ${styles.perfColRight}`}
          >
            {rightPerfs}
          </div>

          {!filmReady && (
            <div aria-busy className={styles.loading}>
              <div className={styles.loadingBar} />
              <p className={styles.loadingLabel}>{t("loadingFilm")}</p>
            </div>
          )}

          {frame < WELCOME_HERO_GATE && (
            <div aria-hidden className={styles.scrollHint}>
              <span
                className={`material-symbols-outlined ${styles.scrollIcon}`}
              >
                expand_more
              </span>
            </div>
          )}

          <div className={styles.bottomHud}>
            <div className={styles.progressTrack}>
              <div
                className={`welcome-progress-inner ${styles.progressBar}`}
              />
            </div>
          </div>

          <div className={styles.contentStack}>
            <div className={styles.introBlock}>
              {/* eslint-disable-next-line @next/next/no-img-element -- asset estático PNG */}
              <img
                alt="Sierra Labs"
                className={`welcome-intro-logo ${styles.introLogo}`}
                decoding="async"
                draggable={false}
                height={302}
                src={SIERRA_LOGO_SRC}
                width={753}
              />
              <p className={`welcome-intro-presenta ${styles.presenta}`}>
                {t("presenta")}
              </p>
            </div>

            <div className={`welcome-hero-layer ${styles.heroLayer}`}>
              <h1
                className={`welcome-title-main ${styles.titleMain}`}
                id="welcome-title"
              >
                {heroTitle}
              </h1>
              <Link
                className="welcome-continue pointer-events-auto relative z-10 inline-flex min-h-12 min-w-48 items-center justify-center rounded-full bg-linear-to-br from-emerald-400 via-emerald-500 to-indigo-500 px-10 py-3 font-headline text-lg font-black uppercase tracking-wide text-slate-950 shadow-[0_0_48px_rgba(16,185,129,0.5)] ring-2 ring-white/35 transition-transform duration-150 hover:scale-[1.03] active:scale-[0.98]"
                href={ROUTES.home}
              >
                {t("enter")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
