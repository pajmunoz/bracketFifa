import { WelcomeHero } from "@/components/welcome/WelcomeHero";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "WelcomeMetadata",
  });
  return {
    description: t("description"),
    title: t("title"),
  };
}

export default async function BienvenidaPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <WelcomeHero />;
}
