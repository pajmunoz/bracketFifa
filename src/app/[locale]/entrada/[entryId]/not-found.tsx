"use client";

import { useTranslations } from "next-intl";
import { Footer } from "@/components/Footer";
import { NavBar } from "@/components/NavBar";
import { Link } from "@/i18n/routing";
import { ROUTES } from "@/lib/routes";

export default function EntryDetailNotFound() {
  const t = useTranslations("EntryNotFound");
  return (
    <div className="flex min-h-screen flex-col bg-surface font-body text-on-surface antialiased">
      <NavBar />
      <main className="mx-auto flex max-w-lg flex-1 flex-col items-center justify-center px-6 pt-24 pb-16 text-center">
        <h1 className="font-headline mb-4 text-2xl font-black text-primary md:text-3xl">
          {t("title")}
        </h1>
        <p className="mb-8 text-on-surface-variant">{t("body")}</p>
        <Link
          className="font-headline inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-bold text-on-primary transition-opacity hover:opacity-95"
          href={ROUTES.home}
        >
          <span className="material-symbols-outlined text-xl">sports_soccer</span>
          {t("cta")}
        </Link>
      </main>
      <Footer />
    </div>
  );
}
