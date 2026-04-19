/** Código ISO (flagcdn w80) extraído de la URL guardada en `TEAM.flagUrl`. */
export function flagCcFromFlagUrl(flagUrl: string): string | null {
  const m = /\/w80\/([^/?#]+)\.png/i.exec(flagUrl);
  const cc = m?.[1]?.toLowerCase();
  return cc && cc.length >= 2 ? cc : null;
}
