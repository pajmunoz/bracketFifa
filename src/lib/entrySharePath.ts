import { routing } from "@/i18n/routing";

export function entryOgApiPath(entryId: string, locale: string): string {
  return `/api/entrada/${encodeURIComponent(entryId)}/og?locale=${encodeURIComponent(locale)}`;
}

export function entrySharePath(locale: string, entryId: string): string {
  const enc = encodeURIComponent(entryId);
  return locale === routing.defaultLocale
    ? `/entrada/${enc}`
    : `/${locale}/entrada/${enc}`;
}

export function entryShareAbsoluteUrl(
  origin: string,
  locale: string,
  entryId: string,
): string {
  const base = origin.replace(/\/$/, "");
  return `${base}${entrySharePath(locale, entryId)}`;
}
