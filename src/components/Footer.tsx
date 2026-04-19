"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { ROUTES, SIERRA_LABS_SITE_URL } from "@/lib/routes";

export function Footer() {
  const t = useTranslations("Footer");
  const internal = [
    { href: ROUTES.rules, key: "rules" as const },
    { href: ROUTES.privacy, key: "privacy" as const },
    { href: ROUTES.support, key: "contact" as const },
  ];

  return (
    <footer
      className="mt-auto w-full border-t border-slate-200/15 bg-slate-100 py-12 dark:border-slate-800/15 dark:bg-slate-900"
      data-site-footer=""
    >
      <div className="mx-auto flex max-w-screen-2xl flex-col items-center justify-between gap-4 px-8 md:flex-row">
        <div className="font-headline font-bold text-slate-900 dark:text-white">
          {t("title")}
        </div>
        <div className="flex flex-wrap justify-center gap-6">
          {internal.map(({ href, key }) => (
            <Link
              className="font-headline text-sm text-slate-500 transition-colors hover:text-emerald-400 hover:underline dark:text-slate-400"
              href={href}
              key={key}
            >
              {t(`links.${key}`)}
            </Link>
          ))}
          <a
            className="font-headline text-sm text-slate-500 transition-colors hover:text-emerald-400 hover:underline dark:text-slate-400"
            href={SIERRA_LABS_SITE_URL}
            rel="noopener noreferrer"
            target="_blank"
          >
            {t("links.sierraLabs")}
          </a>
        </div>
        <div className="font-headline text-sm text-slate-500 dark:text-slate-400">
          {t("copyright")}
        </div>
      </div>
    </footer>
  );
}
