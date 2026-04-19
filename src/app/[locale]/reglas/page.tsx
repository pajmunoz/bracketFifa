import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LegalPageShell } from "@/components/LegalPageShell";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "LegalRules" });
  return { title: t("metaTitle") };
}

export default async function ReglasPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "LegalRules" });
  return (
    <LegalPageShell>
      <article className="space-y-6 text-on-surface">
        <h1 className="font-headline text-3xl font-black tracking-tight text-on-surface md:text-4xl">
          {t("title")}
        </h1>
        <div className="space-y-5 text-sm leading-relaxed text-on-surface-variant md:text-base">
          {(["p1", "p2", "p3", "p4", "p5"] as const).map((key) => (
            <p key={key}>{t(key)}</p>
          ))}
        </div>
      </article>
    </LegalPageShell>
  );
}
