import type { Metadata } from "next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { Inter, Lexend, Space_Grotesk } from "next/font/google";
import { BracketAudioExperience } from "@/components/BracketAudioExperience";
import { routing } from "@/i18n/routing";

const inter = Inter({
  display: "optional",
  subsets: ["latin"],
  variable: "--font-inter",
});

const lexend = Lexend({
  display: "optional",
  subsets: ["latin"],
  variable: "--font-lexend",
});

const spaceGrotesk = Space_Grotesk({
  display: "optional",
  subsets: ["latin"],
  variable: "--font-space",
});

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  return {
    description: t("description"),
    title: t("title"),
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html
      className={`${inter.variable} ${lexend.variable} ${spaceGrotesk.variable} h-full`}
      lang={locale}
    >
      <head>
        <link href="https://fonts.googleapis.com" rel="preconnect" />
        <link
          crossOrigin="anonymous"
          href="https://fonts.gstatic.com"
          rel="preconnect"
        />
        {/* display=swap: con optional la fuente puede no aplicarse en la 1ª carga si llega tarde (caché en recarga). */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- Material Symbols not exposed via next/font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full overflow-x-hidden pb-[var(--bracket-audio-spacer,5.75rem)]">
        <NextIntlClientProvider messages={messages}>
          <BracketAudioExperience />
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
