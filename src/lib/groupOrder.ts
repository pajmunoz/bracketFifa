/** Orden del grupo: [1º, 2º, …resto] según el fixture original para 3º/4º. */
export function buildGroupOrderFromPicks(
  baseTeamIds: readonly string[],
  firstId: string,
  secondId: string,
): string[] {
  const rest = baseTeamIds.filter((id) => id !== firstId && id !== secondId);
  return [firstId, secondId, ...rest];
}
