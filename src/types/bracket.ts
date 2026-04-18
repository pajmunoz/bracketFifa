export type Team = {
  code: string;
  flagUrl: string;
  host?: boolean;
  id: string;
  name: string;
};

export type GroupDef = {
  id: string;
  label: string;
  teamIds: string[];
};

/** Fases del asistente (sin contar el formulario). */
export type BracketPhase =
  | "final"
  | "groups"
  | "qf"
  | "r16"
  | "r32"
  | "sf"
  | "third";

export type KnockoutData = {
  championId: string;
  qf: Record<string, string>;
  r16: Record<string, string>;
  r32: Record<string, string>;
  sf: Record<string, string>;
  thirdPlaceId: string;
};

export type RegistrationForm = {
  email: string;
  name: string;
  whatsapp: string;
};

export type BracketSubmission = {
  email: string;
  entryId: string;
  groups: Record<string, string[]>;
  knockout: KnockoutData;
  name: string;
  predictedWinnerCode: string;
  predictedWinnerName: string;
  submittedAt: string;
  whatsapp: string;
};

export const STORAGE_KEY = "bracketFifaSubmission";
