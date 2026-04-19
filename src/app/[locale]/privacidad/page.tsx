import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LegalPageShell } from "@/components/LegalPageShell";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "LegalPrivacy" });
  return { title: t("metaTitle") };
}

const PRIVACY_KEYS = [
  "p1",
  "p2",
  "p3",
  "p4",
  "p5",
  "p6",
  "p7",
  "p8",
] as const;

export default async function PrivacidadPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "LegalPrivacy" });
  return (
    <LegalPageShell>
      <article className="space-y-6 text-on-surface">
        <h1 className="font-headline text-3xl font-black tracking-tight text-on-surface md:text-4xl">
          {t("title")}
        </h1>
        <p className="font-label text-xs font-bold tracking-widest text-primary uppercase">
          {t("updated")}
        </p>
        <div className="space-y-5 text-sm leading-relaxed text-on-surface-variant md:text-base">
          {PRIVACY_KEYS.map((key) => (
            <p key={key}>{t(key)}</p>
          ))}
        </div>
      </article>
    </LegalPageShell>
  );
}
