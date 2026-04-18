import { toBlob } from "html-to-image";

const SHARE_HEIGHT = 630;
const SHARE_WIDTH = 1200;

/* fontEmbedCSS vacío + skipFonts: no leer cssRules de hojas cross-origin (Next/fonts → SecurityError). */
const captureOptions = {
  backgroundColor: "#0f172a",
  cacheBust: true,
  fetchRequestInit: { mode: "cors" } as RequestInit,
  fontEmbedCSS: "",
  height: SHARE_HEIGHT,
  pixelRatio: 2,
  skipFonts: true,
  width: SHARE_WIDTH,
} as const;

async function waitForShareImages(element: HTMLElement): Promise<void> {
  const images = [...element.querySelectorAll("img")];
  await Promise.all(
    images.map((img) => {
      if (img.complete && img.naturalWidth > 0) {
        return Promise.resolve();
      }
      return new Promise<void>((resolve) => {
        const done = (): void => {
          img.removeEventListener("load", done);
          img.removeEventListener("error", done);
          resolve();
        };
        img.addEventListener("load", done, { once: true });
        img.addEventListener("error", done, { once: true });
      });
    }),
  );
}

export async function captureBracketShareCardAsPng(
  element: HTMLElement,
): Promise<Blob> {
  await waitForShareImages(element);
  const blob = await toBlob(element, { ...captureOptions });
  if (!blob) {
    throw new Error("toBlob returned null");
  }
  return blob;
}

export async function downloadBracketSharePng(
  element: HTMLElement,
): Promise<void> {
  const blob = await captureBracketShareCardAsPng(element);
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.download = "bracket-fifa-26-share.png";
  anchor.href = objectUrl;
  anchor.click();
  URL.revokeObjectURL(objectUrl);
}
