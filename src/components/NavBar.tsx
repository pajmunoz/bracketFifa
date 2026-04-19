"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { ROUTES } from "@/lib/routes";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export function NavBar() {
  const t = useTranslations("Nav");

  return (
    <nav className="glass-nav fixed top-0 z-50 w-full shadow-sm">
      <div className="mx-auto flex max-w-screen-2xl items-center justify-between gap-2 px-4 py-3 sm:gap-4 sm:px-6 sm:py-4">
        <Link
          className="font-headline text-lg font-black uppercase italic leading-tight tracking-tight text-emerald-600 whitespace-nowrap dark:text-emerald-400 sm:text-xl md:text-2xl"
          href={ROUTES.home}
        >
          {t("siteTitle")}
        </Link>
        <div className="flex shrink-0 items-center gap-3 md:gap-4">
          <LanguageSwitcher />
        </div>
      </div>
    </nav>
  );
}
