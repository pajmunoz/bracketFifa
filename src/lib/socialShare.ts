export function openWhatsApp(text: string): void {
  const encoded = encodeURIComponent(text);
  window.open(`https://wa.me/?text=${encoded}`, "_blank", "noopener,noreferrer");
}

export function openTwitter(text: string): void {
  const encoded = encodeURIComponent(text);
  window.open(
    `https://twitter.com/intent/tweet?text=${encoded}`,
    "_blank",
    "noopener,noreferrer",
  );
}

export function openFacebook(origin: string): void {
  const u = encodeURIComponent(origin);
  window.open(
    `https://www.facebook.com/sharer/sharer.php?u=${u}`,
    "_blank",
    "noopener,noreferrer",
  );
}

export function openInstagramHint(message: string): void {
  window.alert(message);
}

export async function shareNative(
  text: string,
  title: string,
  url: string,
): Promise<boolean> {
  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share({ text, title, url });
      return true;
    } catch {
      return false;
    }
  }
  return false;
}
