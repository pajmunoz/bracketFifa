function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => {
      reject(new Error("FileReader failed"));
    };
    reader.onloadend = () => {
      resolve(typeof reader.result === "string" ? reader.result : "");
    };
    reader.readAsDataURL(blob);
  });
}

/** Descarga cada `/api/flag/[cc]` y devuelve mapa cc → data URL para incrustar en la tarjeta. */
export async function fetchFlagsAsDataUrls(
  codes: readonly string[],
): Promise<Record<string, string>> {
  const uniq = [...new Set(codes)].filter((c) => c.length >= 2);
  const pairs = await Promise.all(
    uniq.map(async (cc) => {
      try {
        const res = await fetch(`/api/flag/${encodeURIComponent(cc)}`);
        if (!res.ok) {
          return null;
        }
        const blob = await res.blob();
        const dataUrl = await blobToDataUrl(blob);
        if (!dataUrl.startsWith("data:")) {
          return null;
        }
        return [cc, dataUrl] as const;
      } catch {
        return null;
      }
    }),
  );
  return Object.fromEntries(
    pairs.filter((p): p is readonly [string, string] => p !== null),
  );
}
