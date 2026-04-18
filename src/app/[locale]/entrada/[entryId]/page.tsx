import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { EntryPublicView } from "@/components/entry-public/EntryPublicView";
import { routing } from "@/i18n/routing";
import { entryOgApiPath } from "@/lib/entrySharePath";
import { getSubmissionByEntryId } from "@/lib/getSubmissionByEntryId";
import { submissionChampionDisplayName } from "@/lib/teamDisplayName";
import { siteBaseUrl } from "@/lib/siteBaseUrl";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ entryId: string; locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { entryId, locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    return { title: "Not found" };
  }

  const decoded = decodeURIComponent(entryId).trim();
  const submission = await getSubmissionByEntryId(decoded);
  if (!submission) {
    return { title: "Not found" };
  }

  const t = await getTranslations({ locale, namespace: "EntryMetadata" });
  const title = t("title", { id: submission.entryId });
  const description = t("description", {
    winner: submissionChampionDisplayName(submission, locale),
  });
  const base = siteBaseUrl().replace(/\/$/, "");
  const ogPath = entryOgApiPath(submission.entryId, locale);
  const ogUrl = base ? `${base}${ogPath}` : undefined;

  return {
    description,
    openGraph: ogUrl
      ? {
          description,
          images: [{ alt: title, height: 630, url: ogUrl, width: 1200 }],
          title,
          type: "website",
        }
      : { description, title },
    title,
    twitter: ogUrl
      ? {
          card: "summary_large_image",
          description,
          images: [ogUrl],
          title,
        }
      : { card: "summary", description, title },
  };
}

export default async function EntradaPublicaPage({ params }: Props) {
  const { entryId, locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const decoded = decodeURIComponent(entryId).trim();
  const submission = await getSubmissionByEntryId(decoded);
  if (!submission) {
    notFound();
  }

  setRequestLocale(locale);
  return <EntryPublicView data={submission} />;
}
