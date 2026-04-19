import { flagCcFromFlagUrl } from "@/lib/flagCc";

/**
 * Misma ruta que en `TEAM_ROWS` (flagcdn w80). Sirve la bandera vía `/api/flag`
 * como respaldo si aún no hay data URL en memoria.
 */
export function flagImageProxyPath(flagUrl: string): string {
  const cc = flagCcFromFlagUrl(flagUrl);
  if (!cc) {
    return flagUrl;
  }
  return `/api/flag/${encodeURIComponent(cc)}`;
}
