import { GROUPS, TEAMS } from "@/data/worldCup2026";
import {
  buildFinalMatch,
  buildQFMatches,
  buildR16Fixtures,
  buildSFMatches,
} from "@/lib/bracketKnockout";
import type { BracketSubmission } from "@/types/bracket";

type OgLocale = "en" | "es";

const copy: Record<
  OgLocale,
  {
    champion: string;
    entry: string;
    footer: string;
    knockout: string;
    subtitle: string;
    thirdShort: string;
    title: string;
  }
> = {
  en: {
    champion: "Predicted winner",
    entry: "Entry",
    footer: "Bracket FIFA 26 · FIFA World Cup 2026",
    knockout: "Knockout picks",
    subtitle: "Prediction card",
    thirdShort: "3rd",
    title: "Bracket FIFA 26",
  },
  es: {
    champion: "Campeón predicho",
    entry: "Entrada",
    footer: "Bracket FIFA 26 · Mundial FIFA 2026",
    knockout: "Picks eliminatoria",
    subtitle: "Tarjeta de predicción",
    thirdShort: "3.er",
    title: "Bracket FIFA 26",
  },
};

export function EntryOgImage({
  data,
  locale,
}: {
  data: BracketSubmission;
  locale: OgLocale;
}) {
  const L = copy[locale];
  const k = data.knockout;
  const r16Fixtures = buildR16Fixtures(data.groups);
  const qfMatches = buildQFMatches(k.r16);
  const sfMatches = buildSFMatches(k.qf);
  const finalMatch = buildFinalMatch(k.sf);

  const champion =
    TEAMS[k.championId] ??
    Object.values(TEAMS).find((team) => team.code === data.predictedWinnerCode) ??
    TEAMS.t01;
  const third = TEAMS[k.thirdPlaceId];
  const homeFinal = TEAMS[finalMatch.homeId];
  const awayFinal = TEAMS[finalMatch.awayId];

  const r16WinnerTeams = r16Fixtures
    .map((m) => TEAMS[k.r16[m.id]])
    .filter((team): team is NonNullable<typeof team> => Boolean(team));
  const qfWinnerTeams = qfMatches
    .map((m) => TEAMS[k.qf[m.id]])
    .filter((team): team is NonNullable<typeof team> => Boolean(team));
  const sfWinnerTeams = sfMatches
    .map((m) => TEAMS[k.sf[m.id]])
    .filter((team): team is NonNullable<typeof team> => Boolean(team));

  return (
    <div
      style={{
        backgroundColor: "#022c22",
        backgroundImage:
          "linear-gradient(135deg, #022c22 0%, #0f172a 45%, #064e3b 100%)",
        boxSizing: "border-box",
        color: "#ecfdf5",
        display: "flex",
        flexDirection: "column",
        fontFamily: "system-ui, sans-serif",
        height: "100%",
        padding: 28,
        width: "100%",
      }}
    >
      <div
        style={{
          alignItems: "flex-start",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 32, fontWeight: 900, letterSpacing: -1 }}>
            {L.title}
          </div>
          <div
            style={{
              color: "rgba(203,213,225,0.95)",
              fontSize: 16,
              fontWeight: 600,
              marginTop: 6,
            }}
          >
            {L.subtitle}
          </div>
        </div>
        <div
          style={{
            backgroundColor: "rgba(16,185,129,0.18)",
            border: "1px solid rgba(16,185,129,0.45)",
            borderRadius: 9999,
            color: "#6ee7b7",
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: 1,
            padding: "8px 16px",
          }}
        >
          {L.entry}: {data.entryId}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flex: 1,
          flexDirection: "row",
          gap: 20,
          marginTop: 20,
          minHeight: 0,
        }}
      >
        <div
          style={{
            alignItems: "center",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            minWidth: 260,
          }}
        >
          <span
            style={{
              color: "rgba(236,253,245,0.75)",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 2.2,
              textTransform: "uppercase",
            }}
          >
            {L.champion}
          </span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt=""
            height={120}
            src={champion.flagUrl}
            style={{
              border: "4px solid rgba(236,253,245,0.35)",
              borderRadius: 9999,
              marginTop: 10,
              objectFit: "cover",
            }}
            width={120}
          />
          <div
            style={{
              fontSize: 22,
              fontWeight: 900,
              marginTop: 8,
              textAlign: "center",
              textTransform: "uppercase",
            }}
          >
            {champion.name}
          </div>
          {third ? (
            <div
              style={{
                backgroundColor: "rgba(0,0,0,0.25)",
                borderRadius: 9999,
                color: "#a7f3d0",
                fontSize: 12,
                fontWeight: 700,
                marginTop: 8,
                padding: "6px 12px",
              }}
            >
              {L.thirdShort} {third.code}
            </div>
          ) : null}
        </div>

        <div
          style={{
            display: "flex",
            flex: 1,
            flexDirection: "column",
            gap: 10,
            minWidth: 0,
          }}
        >
          <span
            style={{
              color: "#34d399",
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: 1.6,
              textTransform: "uppercase",
            }}
          >
            {L.knockout}
          </span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {r16WinnerTeams.map((team) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                alt=""
                height={40}
                key={team.id}
                src={team.flagUrl}
                style={{
                  border: "2px solid rgba(16,185,129,0.55)",
                  borderRadius: 8,
                  objectFit: "cover",
                }}
                width={40}
              />
            ))}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {qfWinnerTeams.map((team) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                alt=""
                height={40}
                key={team.id}
                src={team.flagUrl}
                style={{
                  border: "2px solid rgba(16,185,129,0.55)",
                  borderRadius: 8,
                  objectFit: "cover",
                }}
                width={40}
              />
            ))}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {sfWinnerTeams.map((team) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                alt=""
                height={40}
                key={team.id}
                src={team.flagUrl}
                style={{
                  border: "2px solid rgba(16,185,129,0.55)",
                  borderRadius: 8,
                  objectFit: "cover",
                }}
                width={40}
              />
            ))}
          </div>
          <div style={{ alignItems: "center", display: "flex", gap: 8 }}>
            {homeFinal ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                alt=""
                height={34}
                src={homeFinal.flagUrl}
                style={{
                  border:
                    champion.id === homeFinal.id
                      ? "2px solid rgba(16,185,129,0.85)"
                      : "2px solid rgba(148,163,184,0.35)",
                  borderRadius: 8,
                }}
                width={34}
              />
            ) : null}
            <span style={{ color: "rgba(148,163,184,0.9)", fontSize: 10 }}>vs</span>
            {awayFinal ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                alt=""
                height={34}
                src={awayFinal.flagUrl}
                style={{
                  border:
                    champion.id === awayFinal.id
                      ? "2px solid rgba(16,185,129,0.85)"
                      : "2px solid rgba(148,163,184,0.35)",
                  borderRadius: 8,
                }}
                width={34}
              />
            ) : null}
          </div>
        </div>
      </div>

      <div
        style={{
          borderTop: "1px solid rgba(148,163,184,0.2)",
          display: "flex",
          flexWrap: "wrap",
          gap: "12px 16px",
          justifyContent: "space-between",
          marginTop: 12,
          paddingTop: 12,
        }}
      >
        {GROUPS.map((g) => {
          const order = data.groups[g.id];
          if (!order?.length) {
            return null;
          }
          return (
            <div
              key={g.id}
              style={{
                alignItems: "center",
                display: "flex",
                flexDirection: "column",
                gap: 4,
              }}
            >
              <span
                style={{
                  color: "rgba(148,163,184,0.95)",
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: 1.2,
                }}
              >
                {g.label}
              </span>
              <div style={{ display: "flex", gap: 3 }}>
                {order.map((tid) => {
                  const team = TEAMS[tid];
                  if (!team) {
                    return null;
                  }
                  return (
                    // eslint-disable-next-line @next/next/no-img-element -- render OG (satori)
                    <img
                      alt=""
                      height={22}
                      key={tid}
                      src={team.flagUrl}
                      style={{ borderRadius: 6, objectFit: "cover" }}
                      width={22}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          color: "rgba(148,163,184,0.85)",
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: 1.4,
          marginTop: 10,
          textAlign: "center",
          textTransform: "uppercase",
        }}
      >
        {L.footer}
      </div>
    </div>
  );
}
