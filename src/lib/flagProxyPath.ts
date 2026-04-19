/**
 * Misma ruta que en `TEAM_ROWS` (flagcdn w80). Sirve la bandera vía `/api/flag`
 * para que html-to-image haga fetch same-origin (evita CORS / caché rota en móvil).
 */
export function flagImageProxyPath(flagUrl: string): string {
  const m = /\/w80\/([^/?#]+)\.png/i.exec(flagUrl);
  const cc = m?.[1];
  if (!cc) {
    return flagUrl;
  }
  return `/api/flag/${encodeURIComponent(cc.toLowerCase())}`;
}
