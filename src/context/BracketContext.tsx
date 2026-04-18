"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useLocale } from "next-intl";
import { GROUPS, sanitizeGroupOrder, TEAMS } from "@/data/worldCup2026";
import { teamDisplayName } from "@/lib/teamDisplayName";
import { R32_IDS } from "@/lib/bracketKnockout";
import type {
  BracketPhase,
  BracketSubmission,
  KnockoutData,
  RegistrationForm,
} from "@/types/bracket";
import { STORAGE_KEY } from "@/types/bracket";

type GroupOrders = Record<string, string[]>;

const R16_IDS = [
  "r16-0",
  "r16-1",
  "r16-2",
  "r16-3",
  "r16-4",
  "r16-5",
  "r16-6",
  "r16-7",
] as const;
const QF_IDS = ["qf-0", "qf-1", "qf-2", "qf-3"] as const;
const SF_IDS = ["sf-0", "sf-1"] as const;

function initialOrders(): GroupOrders {
  const o: GroupOrders = {};
  for (const g of GROUPS) {
    o[g.id] = sanitizeGroupOrder([...g.teamIds], g.teamIds);
  }
  return o;
}

function randomEntryId(): string {
  const n = Math.floor(1000 + Math.random() * 9000);
  return `2026-WK-${n}`;
}

function emptyR32(): Record<string, string> {
  return Object.fromEntries(R32_IDS.map((id) => [id, ""]));
}

function emptyR16(): Record<string, string> {
  return Object.fromEntries(R16_IDS.map((id) => [id, ""]));
}

function emptyQf(): Record<string, string> {
  return Object.fromEntries(QF_IDS.map((id) => [id, ""]));
}

function emptySf(): Record<string, string> {
  return Object.fromEntries(SF_IDS.map((id) => [id, ""]));
}

function countFilledWinners(
  ids: readonly string[],
  map: Record<string, string>,
): number {
  return ids.filter((id) => (map[id] ?? "").length > 0).length;
}

/**
 * Progreso solo del bracket (sin formulario). Misma proporción que antes entre
 * fases; escala a 100 al elegir tercer lugar.
 */
const W_GROUPS = (100 * 10) / 100;
const W_R32 = (100 * 20) / 100;
const W_R16 = (100 * 20) / 100;
const W_QF = (100 * 15) / 100;
const W_SF = (100 * 10) / 100;
const W_FINAL = (100 * 12) / 100;
const W_THIRD = (100 * 13) / 100;

type BracketContextValue = {
  advancePhase: () => void;
  bracketComplete: boolean;
  canAdvancePhase: boolean;
  championId: string | null;
  formUnlocked: boolean;
  groupOrders: GroupOrders;
  knockoutForPayload: KnockoutData;
  phase: BracketPhase;
  phaseIndex: number;
  prepareSubmission: () => BracketSubmission;
  progressPercent: number;
  qfWinners: Record<string, string>;
  r16Winners: Record<string, string>;
  r32Winners: Record<string, string>;
  registrationUnlocked: boolean;
  setChampion: (teamId: string) => void;
  setForm: (patch: Partial<RegistrationForm>) => void;
  setQfWinner: (matchId: string, teamId: string) => void;
  setR16Winner: (matchId: string, teamId: string) => void;
  setR32Winner: (matchId: string, teamId: string) => void;
  setSfWinner: (matchId: string, teamId: string) => void;
  setTeamOrder: (groupId: string, teamIds: string[]) => void;
  setThirdPlace: (teamId: string) => void;
  sfWinners: Record<string, string>;
  submitPrediction: () => BracketSubmission;
  thirdPlaceId: string | null;
  canSubmit: boolean;
  form: RegistrationForm;
};

const BracketContext = createContext<BracketContextValue | null>(null);

const PHASE_ORDER: BracketPhase[] = [
  "groups",
  "r32",
  "r16",
  "qf",
  "sf",
  "final",
  "third",
];

/** Orden inicial de grupos (solo lectura) para medir personalización en la barra de progreso. */
const SNAPSHOT_GROUP_ORDERS: GroupOrders = initialOrders();

export function BracketProvider({ children }: { children: ReactNode }) {
  const locale = useLocale();
  const [phase, setPhase] = useState<BracketPhase>("groups");
  const [groupOrders, setGroupOrders] = useState<GroupOrders>(() => ({
    ...SNAPSHOT_GROUP_ORDERS,
  }));
  const [r32Winners, setR32Winners] = useState<Record<string, string>>(
    emptyR32,
  );
  const [r16Winners, setR16Winners] = useState<Record<string, string>>(
    emptyR16,
  );
  const [qfWinners, setQfWinners] = useState<Record<string, string>>(emptyQf);
  const [sfWinners, setSfWinners] = useState<Record<string, string>>(emptySf);
  const [championId, setChampionId] = useState<string | null>(null);
  const [thirdPlaceId, setThirdPlaceId] = useState<string | null>(null);
  const [form, setFormState] = useState<RegistrationForm>({
    email: "",
    name: "",
    whatsapp: "",
  });

  const setForm = useCallback((patch: Partial<RegistrationForm>) => {
    setFormState((prev) => ({ ...prev, ...patch }));
  }, []);

  const setTeamOrder = useCallback((groupId: string, teamIds: string[]) => {
    const g = GROUPS.find((gr) => gr.id === groupId);
    const base = g?.teamIds ?? teamIds;
    const normalized = sanitizeGroupOrder(teamIds, base);
    setGroupOrders((prev) => ({ ...prev, [groupId]: normalized }));
  }, []);

  const setR16Winner = useCallback((matchId: string, teamId: string) => {
    setR16Winners((prev) => ({ ...prev, [matchId]: teamId }));
  }, []);

  const setR32Winner = useCallback((matchId: string, teamId: string) => {
    setR32Winners((prev) => ({ ...prev, [matchId]: teamId }));
  }, []);

  const setQfWinner = useCallback((matchId: string, teamId: string) => {
    setQfWinners((prev) => ({ ...prev, [matchId]: teamId }));
  }, []);

  const setSfWinner = useCallback((matchId: string, teamId: string) => {
    setSfWinners((prev) => ({ ...prev, [matchId]: teamId }));
  }, []);

  const setChampion = useCallback((teamId: string) => {
    setChampionId(teamId);
  }, []);

  const setThirdPlace = useCallback((teamId: string) => {
    setThirdPlaceId(teamId);
  }, []);

  const r32Complete = useMemo(
    () => R32_IDS.every((id) => (r32Winners[id] ?? "").length > 0),
    [r32Winners],
  );

  const r16Complete = useMemo(
    () => R16_IDS.every((id) => (r16Winners[id] ?? "").length > 0),
    [r16Winners],
  );

  const qfComplete = useMemo(
    () => QF_IDS.every((id) => (qfWinners[id] ?? "").length > 0),
    [qfWinners],
  );

  const sfComplete = useMemo(
    () => SF_IDS.every((id) => (sfWinners[id] ?? "").length > 0),
    [sfWinners],
  );

  const finalComplete = useMemo(
    () => championId !== null && championId.length > 0,
    [championId],
  );

  const thirdComplete = useMemo(
    () => thirdPlaceId !== null && thirdPlaceId.length > 0,
    [thirdPlaceId],
  );

  const canAdvancePhase = useMemo(() => {
    if (phase === "groups") {
      return true;
    }
    if (phase === "r32") {
      return r32Complete;
    }
    if (phase === "r16") {
      return r16Complete;
    }
    if (phase === "qf") {
      return qfComplete;
    }
    if (phase === "sf") {
      return sfComplete;
    }
    if (phase === "final") {
      return finalComplete;
    }
    if (phase === "third") {
      return false;
    }
    return false;
  }, [
    phase,
    r16Complete,
    r32Complete,
    qfComplete,
    sfComplete,
    finalComplete,
  ]);

  const advancePhase = useCallback(() => {
    if (!canAdvancePhase) {
      return;
    }
    const idx = PHASE_ORDER.indexOf(phase);
    if (idx < 0 || idx >= PHASE_ORDER.length - 1) {
      return;
    }
    const next = PHASE_ORDER[idx + 1];
    if (next) {
      setPhase(next);
    }
  }, [canAdvancePhase, phase]);

  const phaseIndex = PHASE_ORDER.indexOf(phase);

  const customizedGroupCount = useMemo(() => {
    return GROUPS.filter(
      (g) =>
        JSON.stringify(groupOrders[g.id]) !==
        JSON.stringify(SNAPSHOT_GROUP_ORDERS[g.id]),
    ).length;
  }, [groupOrders]);

  const progressPercent = useMemo(() => {
    const idx = phaseIndex;
    let p = 0;

    if (idx === 0) {
      p +=
        (customizedGroupCount / GROUPS.length) * W_GROUPS;
    } else {
      p += W_GROUPS;
    }

    if (idx === 1) {
      p += (countFilledWinners(R32_IDS, r32Winners) / R32_IDS.length) * W_R32;
    } else if (idx > 1) {
      p += W_R32;
    }

    if (idx === 2) {
      p += (countFilledWinners(R16_IDS, r16Winners) / R16_IDS.length) * W_R16;
    } else if (idx > 2) {
      p += W_R16;
    }

    if (idx === 3) {
      p += (countFilledWinners(QF_IDS, qfWinners) / QF_IDS.length) * W_QF;
    } else if (idx > 3) {
      p += W_QF;
    }

    if (idx === 4) {
      p += (countFilledWinners(SF_IDS, sfWinners) / SF_IDS.length) * W_SF;
    } else if (idx > 4) {
      p += W_SF;
    }

    if (idx === 5) {
      p += finalComplete ? W_FINAL : 0;
    } else if (idx > 5) {
      p += W_FINAL;
    }

    if (idx === 6) {
      p += thirdComplete ? W_THIRD : 0;
    }

    return Math.min(100, Math.round(p));
  }, [
    customizedGroupCount,
    finalComplete,
    phaseIndex,
    qfWinners,
    r16Winners,
    r32Winners,
    sfWinners,
    thirdComplete,
  ]);

  const registrationUnlocked = thirdComplete;
  const formUnlocked = registrationUnlocked;
  const bracketComplete = registrationUnlocked;

  const knockoutForPayload = useMemo((): KnockoutData => {
    const r32: Record<string, string> = {};
    for (const id of R32_IDS) {
      r32[id] = r32Winners[id] ?? "";
    }
    const r16: Record<string, string> = {};
    for (const id of R16_IDS) {
      r16[id] = r16Winners[id] ?? "";
    }
    const qf: Record<string, string> = {};
    for (const id of QF_IDS) {
      qf[id] = qfWinners[id] ?? "";
    }
    const sf: Record<string, string> = {};
    for (const id of SF_IDS) {
      sf[id] = sfWinners[id] ?? "";
    }
    return {
      championId: championId ?? "",
      qf,
      r16,
      r32,
      sf,
      thirdPlaceId: thirdPlaceId ?? "",
    };
  }, [championId, qfWinners, r16Winners, r32Winners, sfWinners, thirdPlaceId]);

  const prepareSubmission = useCallback((): BracketSubmission => {
    const champ = championId ? TEAMS[championId] : null;
    return {
      email: form.email.trim(),
      entryId: randomEntryId(),
      groups: { ...groupOrders },
      knockout: knockoutForPayload,
      name: form.name.trim(),
      predictedWinnerCode: champ?.code ?? "",
      predictedWinnerName: champ ? teamDisplayName(champ, locale) : "",
      submittedAt: new Date().toISOString(),
      whatsapp: form.whatsapp.trim(),
    };
  }, [championId, form, groupOrders, knockoutForPayload, locale]);

  const submitPrediction = useCallback((): BracketSubmission => {
    const payload = prepareSubmission();
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    }
    return payload;
  }, [prepareSubmission]);

  const canSubmit = useMemo(() => {
    const formFilled =
      form.name.trim() !== "" &&
      form.email.trim() !== "" &&
      form.whatsapp.trim() !== "" &&
      form.email.includes("@");
    return bracketComplete && formFilled;
  }, [bracketComplete, form]);

  const value = useMemo(
    () => ({
      advancePhase,
      bracketComplete,
      canAdvancePhase,
      championId,
      form,
      formUnlocked,
      groupOrders,
      knockoutForPayload,
      phase,
      phaseIndex,
      prepareSubmission,
      progressPercent,
      qfWinners,
      r16Winners,
      r32Winners,
      registrationUnlocked,
      setChampion,
      setForm,
      setQfWinner,
      setR16Winner,
      setR32Winner,
      setSfWinner,
      setTeamOrder,
      setThirdPlace,
      sfWinners,
      submitPrediction,
      thirdPlaceId,
      canSubmit,
    }),
    [
      advancePhase,
      bracketComplete,
      canAdvancePhase,
      championId,
      form,
      formUnlocked,
      groupOrders,
      knockoutForPayload,
      phase,
      phaseIndex,
      prepareSubmission,
      progressPercent,
      qfWinners,
      r16Winners,
      r32Winners,
      registrationUnlocked,
      setChampion,
      setForm,
      setQfWinner,
      setR16Winner,
      setR32Winner,
      setSfWinner,
      setTeamOrder,
      setThirdPlace,
      sfWinners,
      submitPrediction,
      thirdPlaceId,
      canSubmit,
    ],
  );

  return (
    <BracketContext.Provider value={value}>{children}</BracketContext.Provider>
  );
}

export function useBracket(): BracketContextValue {
  const ctx = useContext(BracketContext);
  if (!ctx) {
    throw new Error("useBracket must be used within BracketProvider");
  }
  return ctx;
}
