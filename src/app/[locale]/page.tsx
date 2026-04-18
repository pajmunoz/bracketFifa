import { routing } from "@/i18n/routing";
import { ROUTES } from "@/lib/routes";
import { setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function Home({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const welcomePath =
    locale === routing.defaultLocale
      ? ROUTES.welcome
      : `/${locale}${ROUTES.welcome}`;
  redirect(welcomePath);
}
