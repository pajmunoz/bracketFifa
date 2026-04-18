export type NativeShareResult = "cancelled" | "failed" | "shared" | "unsupported";

/**
 * `window.open("about:blank", "_blank")` sin `features` suele aplicar `noopener` implícito:
 * el opener no puede usar `popup.document` ni `popup.location`, queda una pestaña vacía y
 * el enlace real se abre en otra. Con tamaño de ventana el navegador trata el destino como
 * popup y normalmente conserva el opener para redirigir tras un `await`.
 */
export const SOCIAL_PREOPEN_POPUP_FEATURES =
  "height=720,left=120,popup=yes,resizable=yes,scrollbars=yes,top=80,width=640";

/**
 * Tras `await`, `window.open(url)` se bloquea. Se abre `about:blank` en el click y luego
 * se redirige. Con `noopener` en el popup, `popup.location = url` suele fallar: hay que
 * escribir en el documento del popup y hacer `location.replace` desde su propio contexto.
 */
export function assignPopupOrOpen(fallbackTab: Window | null, url: string): void {
  if (typeof window === "undefined") {
    return;
  }
  if (fallbackTab && !fallbackTab.closed) {
    try {
      const doc = fallbackTab.document;
      doc.open();
      doc.write(
        `<!DOCTYPE html><html><head><meta charset="utf-8"/></head><body><script>location.replace(${JSON.stringify(url)})<\/script></body></html>`,
      );
      doc.close();
      return;
    } catch {
      try {
        fallbackTab.location.replace(url);
        return;
      } catch {
        try {
          fallbackTab.location.href = url;
          return;
        } catch {
          try {
            fallbackTab.close();
          } catch {
            /* ignore */
          }
        }
      }
    }
  }
  window.open(url, "_blank", "noopener,noreferrer");
}

const FACEBOOK_DIALOG_CLOSE = "https://www.facebook.com/dialog/return/close";
/** Límite práctico para no romper URLs largas en el diálogo / sharer. */
const FACEBOOK_QUOTE_MAX = 2400;

function truncateFacebookQuote(text: string): string {
  if (text.length <= FACEBOOK_QUOTE_MAX) {
    return text;
  }
  return `${text.slice(0, FACEBOOK_QUOTE_MAX - 1)}…`;
}

/**
 * Facebook suele ignorar `quote` en `sharer.php`. Con `NEXT_PUBLIC_FACEBOOK_APP_ID` se usa
 * `dialog/share`, donde `href` y `quote` suelen respetarse (hay que añadir `redirect_uri`
 * en la app de Meta → Valid OAuth Redirect URIs: https://www.facebook.com/dialog/return/close ).
 */
export function buildFacebookShareUrl(shareUrl: string, quote?: string): string {
  const u = encodeURIComponent(shareUrl);
  const appId =
    typeof process !== "undefined" &&
    typeof process.env.NEXT_PUBLIC_FACEBOOK_APP_ID === "string"
      ? process.env.NEXT_PUBLIC_FACEBOOK_APP_ID.trim()
      : "";
  const safeQuote =
    quote !== undefined && quote.length > 0 ? truncateFacebookQuote(quote) : "";

  if (appId.length > 0) {
    const params = new URLSearchParams();
    params.set("app_id", appId);
    params.set("display", "popup");
    params.set("href", shareUrl);
    params.set("redirect_uri", FACEBOOK_DIALOG_CLOSE);
    if (safeQuote.length > 0) {
      params.set("quote", safeQuote);
    }
    return `https://www.facebook.com/dialog/share?${params.toString()}`;
  }

  const base = `https://www.facebook.com/sharer/sharer.php?u=${u}`;
  if (safeQuote.length === 0) {
    return base;
  }
  return `${base}&quote=${encodeURIComponent(safeQuote)}`;
}

export function buildTwitterIntentUrl(text: string, url?: string): string {
  const params = new URLSearchParams();
  params.set("text", text);
  if (url) {
    params.set("url", url);
  }
  return `https://twitter.com/intent/tweet?${params.toString()}`;
}

export function buildWhatsAppShareUrl(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export function openWhatsApp(text: string): void {
  window.open(
    buildWhatsAppShareUrl(text),
    "_blank",
    "noopener,noreferrer",
  );
}

export function openTwitter(text: string, url?: string): void {
  window.open(
    buildTwitterIntentUrl(text, url),
    "_blank",
    "noopener,noreferrer",
  );
}

export function openFacebook(shareUrl: string, quote?: string): void {
  window.open(
    buildFacebookShareUrl(shareUrl, quote),
    "_blank",
    "noopener,noreferrer",
  );
}

export function openInstagramHint(message: string): void {
  window.alert(message);
}

/**
 * Comparte el PNG con el menú nativo (móvil / escritorio compatible).
 * Si no hay soporte o el usuario cancela, el caller puede usar enlaces por red.
 *
 * Nota: `title` + `files` hace que `canShare` falle en varios Chromium; solo files+text.
 */
export async function shareBracketImageNative(
  blob: Blob,
  payload: { text: string; title: string; url: string },
): Promise<NativeShareResult> {
  if (typeof navigator === "undefined" || typeof navigator.share !== "function") {
    return "unsupported";
  }

  const file = new File([blob], "bracket-fifa-26-share.png", {
    lastModified: Date.now(),
    type: "image/png",
  });

  const textWithLink = `${payload.text}\n\n${payload.url}`.trim();

  const shareData: ShareData = {
    files: [file],
    text: textWithLink,
  };

  if (typeof navigator.canShare === "function") {
    try {
      if (!navigator.canShare(shareData)) {
        return "unsupported";
      }
    } catch {
      /* algunos navegadores lanzan si la forma del payload no es válida */
      return "unsupported";
    }
  }

  try {
    await navigator.share(shareData);
    return "shared";
  } catch (e: unknown) {
    if (e instanceof DOMException && e.name === "AbortError") {
      return "cancelled";
    }
    return "failed";
  }
}
