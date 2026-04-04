"use client";

import { useTranslations } from "next-intl";

export function Footer() {
  const t = useTranslations("Footer");
  const links = [
    { href: "#", key: "rules" as const },
    { href: "#", key: "privacy" as const },
    { href: "#", key: "contact" as const },
    { href: "#", key: "fifa" as const },
  ];

  return (
    <footer className="mt-auto w-full border-t border-slate-200/15 bg-slate-100 py-12 dark:border-slate-800/15 dark:bg-slate-900">
      <div className="mx-auto flex max-w-screen-2xl flex-col items-center justify-between gap-4 px-8 md:flex-row">
        <div className="font-headline font-bold text-slate-900 dark:text-white">
          {t("title")}
        </div>
        <div className="flex flex-wrap justify-center gap-6">
          {links.map(({ href, key }) => (
            <a
              className="font-headline text-sm text-slate-500 transition-colors hover:text-emerald-400 hover:underline dark:text-slate-400"
              href={href}
              key={key}
            >
              {t(`links.${key}`)}
            </a>
          ))}
        </div>
        <div className="font-headline text-sm text-slate-500 dark:text-slate-400">
          {t("copyright")}
        </div>
      </div>
    </footer>
  );
}
