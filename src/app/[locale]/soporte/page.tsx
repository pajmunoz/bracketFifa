import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LegalPageShell } from "@/components/LegalPageShell";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "LegalSupport" });
  return { title: t("metaTitle") };
}

export default async function SoportePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "LegalSupport" });
  const mail = t("emailValue");
  return (
    <LegalPageShell>
      <article className="space-y-8 text-on-surface">
        <h1 className="font-headline text-3xl font-black tracking-tight text-on-surface md:text-4xl">
          {t("title")}
        </h1>
        <p className="text-sm leading-relaxed text-on-surface-variant md:text-base">
          {t("intro")}
        </p>
        <div className="rounded-xl border border-outline-variant/20 bg-surface-container-low p-6">
          <p className="font-label mb-2 text-xs font-bold tracking-widest text-on-surface-variant uppercase">
            {t("emailLabel")}
          </p>
          <a
            className="font-headline break-all text-lg font-bold text-primary underline decoration-primary/40 underline-offset-4 transition-colors hover:text-primary-container"
            href={`mailto:${mail}`}
          >
            {mail}
          </a>
        </div>
        <p className="text-sm text-on-surface-variant">{t("response")}</p>
      </article>
    </LegalPageShell>
  );
}
