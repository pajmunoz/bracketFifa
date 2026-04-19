"use client";

import { useTranslations } from "next-intl";

/**
 * Cabecera en la pantalla de confirmación: sin enlaces al bracket ni al registro.
 */
export function SuccessHeader() {
  const tNav = useTranslations("Nav");
  const t = useTranslations("SuccessHeader");
  return (
    <header className="glass-nav fixed top-0 z-50 w-full shadow-sm">
      <div className="mx-auto flex max-w-screen-2xl items-center justify-between gap-2 px-4 py-3 sm:gap-4 sm:px-6 sm:py-4">
        <span className="font-headline text-lg font-black uppercase italic leading-tight tracking-tight text-emerald-600 whitespace-nowrap dark:text-emerald-400 sm:text-xl md:text-2xl">
          {tNav("siteTitle")}
        </span>
        <span className="font-label text-xs font-bold tracking-widest text-slate-500 uppercase dark:text-slate-400">
          {t("confirmation")}
        </span>
      </div>
    </header>
  );
}
