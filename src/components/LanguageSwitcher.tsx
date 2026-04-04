"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";

export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations("LanguageSwitcher");
  const otherLocale = locale === "es" ? "en" : "es";
  const label = locale === "es" ? t("toEnglish") : t("toSpanish");

  return (
    <div className="flex items-center gap-2">
      <span className="font-label text-xs text-slate-500 dark:text-slate-400">
        {t("label")}
      </span>
      <Link
        className="font-label rounded-full border border-outline-variant/30 px-3 py-1 text-xs font-bold text-emerald-600 transition-colors hover:bg-emerald-500/10 dark:text-emerald-400"
        href={pathname}
        locale={otherLocale}
      >
        {label}
      </Link>
    </div>
  );
}
