import { Resend } from "resend";
import { entryShareAbsoluteUrl } from "@/lib/entrySharePath";
import { routing } from "@/i18n/routing";
import { ROUTES } from "@/lib/routes";
import type { BracketSubmission } from "@/types/bracket";

const RESEND_FROM = "Sierra Labs <marketing@sierra-labs.digital>";

/** Colores alineados con `src/app/globals.css` (@theme). */
const THEME = {
  accent: "#4edea3",
  footerBg: "#141b2b",
  footerMuted: "#9ca3b2",
  footerText: "#dce2f7",
  headerEnd: "#10b981",
  headerMid: "#0a7d59",
  headerStart: "#006c49",
  linkFooter: "#6ffbbe",
  onPrimary: "#ffffff",
  outline: "#bbcabf",
  primary: "#006c49",
  surface: "#f8f9fb",
  surfaceContainer: "#edeef0",
  text: "#191c1e",
  textMuted: "#575e70",
  white: "#ffffff",
} as const;

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function siteOrigin(): string | null {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) {
    return null;
  }
  return raw.replace(/\/$/, "");
}

function absoluteLocalizedPath(
  origin: string,
  locale: "es" | "en",
  pathname: string,
): string {
  const base = origin.replace(/\/$/, "");
  const path =
    locale === routing.defaultLocale ? pathname : `/${locale}${pathname}`;
  return `${base}${path}`;
}

type Locale = "en" | "es";

const COPY: Record<
  Locale,
  {
    cta: string;
    entryLabel: string;
    footerLegal: string;
    footerNav: string;
    greeting: (name: string) => string;
    lead: string;
    preheader: string;
    subject: string;
    tagline: string;
    transactionalNote: string;
  }
> = {
  en: {
    cta: "View your registered bracket",
    entryLabel: "Entry ID",
    footerLegal:
      "You receive this transactional email because you submitted a prediction and provided this address as part of your participation. Controller: Sierra Labs (sierra-labs.digital). We process your data as described in our Privacy policy. You may exercise your rights of access, rectification, erasure, restriction, portability and objection by contacting us via Support or the contact details in Privacy.",
    footerNav: "Legal & support",
    greeting: (name: string) => `Hello, ${name}.`,
    lead: "Thank you for taking part. You can review your registered bracket at any time using the button below.",
    preheader: "Your World Cup 2026 prediction is confirmed — view your entry.",
    subject: "bracketFifa · Your prediction is confirmed",
    tagline: "Your participation was saved successfully.",
    transactionalNote:
      "This is an automated transactional message related to your participation. Please do not reply to this email unless you need assistance; use Support instead.",
  },
  es: {
    cta: "Ver mi bracket registrado",
    entryLabel: "ID de participación",
    footerLegal:
      "Recibes este correo transaccional porque enviaste una predicción e indicaste esta dirección como parte de tu participación. Responsable del tratamiento: Sierra Labs (sierra-labs.digital). Tratamos tus datos según nuestra Política de privacidad. Puedes ejercer los derechos de acceso, rectificación, supresión, limitación, portabilidad y oposición contactándonos vía Soporte o los datos indicados en Privacidad.",
    footerNav: "Legal y soporte",
    greeting: (name: string) => `Hola, ${name}.`,
    lead: "Gracias por participar. Puedes consultar tu bracket registrado en cualquier momento con el botón siguiente.",
    preheader:
      "Tu predicción del Mundial 2026 está confirmada — enlace a tu participación.",
    subject: "bracketFifa · Confirmación de tu predicción",
    tagline: "Tu participación se guardó correctamente.",
    transactionalNote:
      "Mensaje transaccional automático vinculado a tu participación. Para consultas, utiliza Soporte; este buzón puede no estar monitorizado para respuestas.",
  },
};

function buildConfirmationHtml(
  locale: Locale,
  displayName: string,
  entryLink: string,
  entryId: string,
  rulesUrl: string,
  privacyUrl: string,
  supportUrl: string,
): string {
  const t = COPY[locale];
  const safeName = escapeHtml(displayName);
  const safeEntry = escapeHtml(entryId);
  const safeEntryLink = escapeHtml(entryLink);
  const safeRules = escapeHtml(rulesUrl);
  const safePrivacy = escapeHtml(privacyUrl);
  const safeSupport = escapeHtml(supportUrl);

  const rulesLabel = locale === "en" ? "Rules" : "Reglas";
  const privacyLabel = locale === "en" ? "Privacy" : "Privacidad";
  const supportLabel = locale === "en" ? "Support" : "Soporte";

  return `<!DOCTYPE html>
<html lang="${locale}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
  <title>${escapeHtml(t.subject)}</title>
</head>
<body style="margin:0;padding:0;background-color:${THEME.surfaceContainer};color:${THEME.text};font-family:Inter,system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;font-size:16px;line-height:1.55;">
  <div style="display:none;max-height:0;overflow:hidden;font-size:1px;line-height:1px;color:${THEME.surfaceContainer};opacity:0;">${escapeHtml(t.preheader)}</div>
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:${THEME.surfaceContainer};padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;">
          <tr>
            <td style="background:linear-gradient(135deg,${THEME.headerStart} 0%,${THEME.headerMid} 48%,${THEME.headerEnd} 100%);border-radius:12px 12px 0 0;padding:28px 24px 24px;">
              <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:${THEME.accent};">bracketFifa</p>
              <h1 style="margin:0;font-size:22px;font-weight:800;line-height:1.2;color:${THEME.white};letter-spacing:-0.02em;">${locale === "en" ? "Prediction confirmed" : "Predicción confirmada"}</h1>
              <p style="margin:10px 0 0;font-size:14px;color:rgba(255,255,255,0.88);">${escapeHtml(t.tagline)}</p>
            </td>
          </tr>
          <tr>
            <td style="background-color:${THEME.white};padding:28px 24px 8px;border-left:1px solid ${THEME.outline};border-right:1px solid ${THEME.outline};">
              <p style="margin:0 0 12px;font-size:17px;color:${THEME.text};">${t.greeting(safeName)}</p>
              <p style="margin:0 0 20px;color:${THEME.textMuted};font-size:15px;">${t.lead}</p>
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 20px;background-color:${THEME.surface};border-radius:10px;border:1px solid ${THEME.outline};">
                <tr>
                  <td style="padding:14px 16px;">
                    <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:${THEME.textMuted};">${t.entryLabel}</p>
                    <p style="margin:0;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:14px;color:${THEME.text};">${safeEntry}</p>
                  </td>
                </tr>
              </table>
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
                <tr>
                  <td style="border-radius:999px;background:linear-gradient(135deg,${THEME.headerStart} 0%,${THEME.headerEnd} 100%);">
                    <a href="${safeEntryLink}" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:800;text-decoration:none;color:${THEME.onPrimary};letter-spacing:0.02em;text-transform:uppercase;">${escapeHtml(t.cta)}</a>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 20px;font-size:13px;color:${THEME.textMuted};">${escapeHtml(t.transactionalNote)}</p>
              <p style="margin:0;font-size:13px;color:${THEME.textMuted};">${locale === "en" ? "If you did not take part, you can ignore this message." : "Si no has participado, puedes ignorar este mensaje."}</p>
            </td>
          </tr>
          <tr>
            <td style="background-color:${THEME.footerBg};padding:22px 24px 26px;border-radius:0 0 12px 12px;border:1px solid ${THEME.footerBg};">
              <p style="margin:0 0 12px;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:${THEME.footerMuted};">${escapeHtml(t.footerNav)}</p>
              <p style="margin:0 0 16px;font-size:14px;line-height:1.5;">
                <a href="${safeRules}" style="color:${THEME.linkFooter};text-decoration:underline;">${rulesLabel}</a>
                <span style="color:${THEME.footerMuted};">&nbsp;·&nbsp;</span>
                <a href="${safePrivacy}" style="color:${THEME.linkFooter};text-decoration:underline;">${privacyLabel}</a>
                <span style="color:${THEME.footerMuted};">&nbsp;·&nbsp;</span>
                <a href="${safeSupport}" style="color:${THEME.linkFooter};text-decoration:underline;">${supportLabel}</a>
              </p>
              <p style="margin:0;font-size:12px;line-height:1.55;color:${THEME.footerText};opacity:0.92;">${escapeHtml(t.footerLegal)}</p>
              <p style="margin:16px 0 0;font-size:11px;line-height:1.45;color:${THEME.footerMuted};">© ${new Date().getFullYear()} Sierra Labs · sierra-labs.digital</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildConfirmationText(
  locale: Locale,
  displayName: string,
  entryLink: string,
  entryId: string,
  rulesUrl: string,
  privacyUrl: string,
  supportUrl: string,
): string {
  const t = COPY[locale];
  const rulesLabel = locale === "en" ? "Rules" : "Reglas";
  const privacyLabel = locale === "en" ? "Privacy" : "Privacidad";
  const supportLabel = locale === "en" ? "Support" : "Soporte";
  return [
    t.greeting(displayName),
    "",
    t.lead,
    "",
    t.tagline,
    "",
    `${t.entryLabel}: ${entryId}`,
    `${t.cta}: ${entryLink}`,
    "",
    t.transactionalNote,
    "",
    locale === "en"
      ? "If you did not take part, you can ignore this message."
      : "Si no has participado, puedes ignorar este mensaje.",
    "",
    "---",
    t.footerNav,
    `${rulesLabel}: ${rulesUrl}`,
    `${privacyLabel}: ${privacyUrl}`,
    `${supportLabel}: ${supportUrl}`,
    "",
    t.footerLegal,
    "",
    `© ${new Date().getFullYear()} Sierra Labs · sierra-labs.digital`,
  ].join("\n");
}

export async function sendSubmissionConfirmationEmail(
  payload: BracketSubmission,
): Promise<{ error?: string; ok: boolean }> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    return { error: "missing_api_key", ok: false };
  }
  const origin = siteOrigin();
  if (!origin) {
    return { error: "missing_site_url", ok: false };
  }

  const locale: Locale = payload.locale === "en" ? "en" : "es";
  const displayName =
    payload.name.trim() || (locale === "en" ? "there" : "participante");
  const entryLink = entryShareAbsoluteUrl(origin, locale, payload.entryId);
  const rulesUrl = absoluteLocalizedPath(origin, locale, ROUTES.rules);
  const privacyUrl = absoluteLocalizedPath(origin, locale, ROUTES.privacy);
  const supportUrl = absoluteLocalizedPath(origin, locale, ROUTES.support);

  const t = COPY[locale];
  const html = buildConfirmationHtml(
    locale,
    displayName,
    entryLink,
    payload.entryId,
    rulesUrl,
    privacyUrl,
    supportUrl,
  );
  const text = buildConfirmationText(
    locale,
    displayName,
    entryLink,
    payload.entryId,
    rulesUrl,
    privacyUrl,
    supportUrl,
  );

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from: RESEND_FROM,
    headers: {
      "X-Entity-Ref-ID": payload.entryId,
    },
    html,
    replyTo: "marketing@sierra-labs.digital",
    subject: t.subject,
    text,
    to: payload.email,
  });

  if (error) {
    return { error: error.message, ok: false };
  }
  return { ok: true };
}
