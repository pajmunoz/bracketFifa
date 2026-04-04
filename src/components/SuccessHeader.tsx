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
      <div className="mx-auto flex max-w-screen-2xl items-center justify-between px-6 py-4">
        <span className="font-headline text-2xl font-black uppercase italic tracking-tight text-emerald-600 dark:text-emerald-400">
          {tNav("siteTitle")}
        </span>
        <span className="font-label text-xs font-bold tracking-widest text-slate-500 uppercase dark:text-slate-400">
          {t("confirmation")}
        </span>
      </div>
    </header>
  );
}
