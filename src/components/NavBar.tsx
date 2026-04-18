"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import { ROUTES } from "@/lib/routes";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export function NavBar() {
  const pathname = usePathname();
  const t = useTranslations("Nav");
  const onBracket = pathname === ROUTES.home;

  return (
    <nav className="glass-nav fixed top-0 z-50 w-full shadow-sm">
      <div className="mx-auto flex max-w-screen-2xl items-center justify-between gap-4 px-6 py-4">
        <Link
          className="font-headline text-2xl font-black uppercase italic tracking-tight text-emerald-600 dark:text-emerald-400"
          href={ROUTES.home}
        >
          {t("siteTitle")}
        </Link>
        <div className="flex flex-1 items-center justify-center md:flex-none md:justify-end">
          {onBracket ? (
            <span className="font-headline border-b-2 border-emerald-500 pb-1 font-bold text-emerald-600 dark:text-emerald-400">
              {t("bracket")}
            </span>
          ) : (
            <Link
              className="font-headline font-medium text-slate-600 transition-colors hover:text-emerald-500 dark:text-slate-400 dark:hover:text-emerald-300"
              href={ROUTES.home}
            >
              {t("bracket")}
            </Link>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-3 md:gap-4">
          <LanguageSwitcher />
        </div>
      </div>
    </nav>
  );
}
