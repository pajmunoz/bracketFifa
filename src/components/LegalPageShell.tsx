"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { ROUTES } from "@/lib/routes";
import { Footer } from "@/components/Footer";
import { NavBar } from "@/components/NavBar";

type Props = {
  children: ReactNode;
};

export function LegalPageShell({ children }: Props) {
  const t = useTranslations("LegalCommon");
  return (
    <div className="flex min-h-screen flex-col bg-surface font-body text-on-surface antialiased">
      <NavBar />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16 md:py-20">
        <Link
          className="font-label mb-10 inline-flex items-center gap-2 text-sm font-bold tracking-wide text-primary uppercase transition-colors hover:underline"
          href={ROUTES.home}
        >
          <span aria-hidden className="material-symbols-outlined text-lg">
            arrow_back
          </span>
          {t("backToBracket")}
        </Link>
        {children}
      </main>
      <Footer />
    </div>
  );
}
