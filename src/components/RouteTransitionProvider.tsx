"use client";

import gsap from "gsap";
import { TransitionRouter } from "next-transition-router";
import { startTransition, useCallback, useRef, type ReactNode } from "react";
import styles from "@/components/RouteTransitionProvider.module.css";

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function RouteTransitionProvider({ children }: { children: ReactNode }) {
  const firstLayerRef = useRef<HTMLDivElement | null>(null);
  const secondLayerRef = useRef<HTMLDivElement | null>(null);

  const leave = useCallback((next: () => void) => {
    if (prefersReducedMotion()) {
      next();
      return undefined;
    }
    const first = firstLayerRef.current;
    const second = secondLayerRef.current;
    if (!first || !second) {
      next();
      return undefined;
    }

    const tl = gsap
      .timeline({
        onComplete: next,
      })
      .fromTo(
        first,
        { y: "100%" },
        {
          duration: 0.5,
          ease: "circ.inOut",
          y: 0,
        },
      )
      .fromTo(
        second,
        { y: "100%" },
        {
          duration: 0.5,
          ease: "circ.inOut",
          y: 0,
        },
        "<50%",
      );

    return () => {
      tl.kill();
    };
  }, []);

  const enter = useCallback((completeEnter: () => void) => {
    if (prefersReducedMotion()) {
      completeEnter();
      return undefined;
    }
    const first = firstLayerRef.current;
    const second = secondLayerRef.current;
    if (!first || !second) {
      completeEnter();
      return undefined;
    }

    const tl = gsap
      .timeline()
      .fromTo(
        second,
        { y: 0 },
        {
          duration: 0.5,
          ease: "circ.inOut",
          y: "-100%",
        },
      )
      .fromTo(
        first,
        { y: 0 },
        {
          duration: 0.5,
          ease: "circ.inOut",
          y: "-100%",
        },
        "<50%",
      )
      .call(
        () => {
          requestAnimationFrame(() => {
            startTransition(completeEnter);
          });
        },
        undefined,
        "<50%",
      );

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <TransitionRouter auto enter={enter} leave={leave}>
      <div className={styles.pageWrap} data-route-transition-shell>
        {children}
      </div>
      <div
        ref={firstLayerRef}
        aria-hidden
        className={styles.transitionLayer1}
      />
      <div
        ref={secondLayerRef}
        aria-hidden
        className={styles.transitionLayer2}
      />
    </TransitionRouter>
  );
}
