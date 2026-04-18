"use client";

import { forwardRef } from "react";
import { useTranslations } from "next-intl";
import { GROUPS, TEAMS } from "@/data/worldCup2026";
import {
  buildFinalMatch,
  buildQFMatches,
  buildR16FromR32Results,
  buildR32Fixtures,
  buildSFMatches,
} from "@/lib/bracketKnockout";
import type { BracketSubmission } from "@/types/bracket";
import styles from "@/components/bracket-share/BracketShareCard.module.css";

type BracketShareCardProps = {
  data: BracketSubmission;
};

function ShareFlag({
  className,
  team,
}: {
  className: string;
  team: { code: string; flagUrl: string; name: string };
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- CORS + html-to-image requiere <img>
    <img
      alt=""
      className={className}
      crossOrigin="anonymous"
      decoding="async"
      referrerPolicy="no-referrer"
      src={team.flagUrl}
    />
  );
}

export const BracketShareCard = forwardRef<HTMLDivElement, BracketShareCardProps>(
  function BracketShareCard({ data }, ref) {
    const t = useTranslations("Success");
    const k = data.knockout;
    const r32Fixtures = buildR32Fixtures(data.groups);
    const r16Fixtures = buildR16FromR32Results(k.r32);
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

    const r32WinnerTeams = r32Fixtures
      .map((m) => TEAMS[k.r32[m.id]])
      .filter((team): team is NonNullable<typeof team> => Boolean(team));
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
      <div ref={ref} className={styles.root}>
        <header className={styles.header}>
          <div className={styles.titleBlock}>
            <h1 className={styles.title}>{t("shareCardTitle")}</h1>
            <p className={styles.subtitle}>{t("shareCardSubtitle")}</p>
          </div>
          <span className={styles.entryChip}>
            {t("entryId", { id: data.entryId })}
          </span>
        </header>

        <div className={styles.mainRow}>
          <div className={styles.championCol}>
            <span className={styles.championLabel}>{t("predictedWinner")}</span>
            <ShareFlag
              className={styles.championFlag}
              team={champion}
            />
            <p className={styles.championName}>{champion.name}</p>
            {third ? (
              <p className={styles.thirdLine}>{t("thirdPlace", { code: third.code })}</p>
            ) : null}
          </div>

          <div className={styles.knockoutCol}>
            <p className={styles.phaseLabel}>{t("shareCardKnockout")}</p>

            <div className={styles.phaseBlock}>
              <span className={styles.phaseLabel}>{t("sharePhaseR32")}</span>
              <div className={styles.flagRow}>
                {r32WinnerTeams.map((team, i) => (
                  <span className={styles.flagSlot} key={`${team.id}-r32-${i}`}>
                    <ShareFlag className={styles.imgWin} team={team} />
                  </span>
                ))}
              </div>
            </div>

            <div className={styles.phaseBlock}>
              <span className={styles.phaseLabel}>{t("sharePhaseR16")}</span>
              <div className={styles.flagRow}>
                {r16WinnerTeams.map((team, i) => (
                  <span className={styles.flagSlot} key={`${team.id}-r16-${i}`}>
                    <ShareFlag className={styles.imgWin} team={team} />
                  </span>
                ))}
              </div>
            </div>

            <div className={styles.phaseBlock}>
              <span className={styles.phaseLabel}>{t("sharePhaseQf")}</span>
              <div className={styles.flagRow}>
                {qfWinnerTeams.map((team) => (
                  <span className={styles.flagSlot} key={team.id}>
                    <ShareFlag className={styles.imgWin} team={team} />
                  </span>
                ))}
              </div>
            </div>

            <div className={styles.phaseBlock}>
              <span className={styles.phaseLabel}>{t("sharePhaseSf")}</span>
              <div className={styles.flagRow}>
                {sfWinnerTeams.map((team) => (
                  <span className={styles.flagSlot} key={team.id}>
                    <ShareFlag className={styles.imgWin} team={team} />
                  </span>
                ))}
              </div>
            </div>

            <div className={styles.phaseBlock}>
              <span className={styles.phaseLabel}>{t("sharePhaseFinal")}</span>
              <div className={styles.finalRow}>
                {homeFinal ? (
                  <span
                    className={
                      champion.id === homeFinal.id
                        ? styles.flagSlot
                        : `${styles.flagSlot} ${styles.flagSlotMuted}`
                    }
                  >
                    <ShareFlag className={styles.imgMd} team={homeFinal} />
                  </span>
                ) : null}
                <span className={styles.vsTiny}>{t("shareVs")}</span>
                {awayFinal ? (
                  <span
                    className={
                      champion.id === awayFinal.id
                        ? styles.flagSlot
                        : `${styles.flagSlot} ${styles.flagSlotMuted}`
                    }
                  >
                    <ShareFlag className={styles.imgMd} team={awayFinal} />
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <div className={styles.groupsSection}>
          <p className={styles.groupsHeading}>{t("shareCardGroups")}</p>
          <div className={styles.groupsInner}>
            {GROUPS.map((g) => {
              const order = data.groups[g.id];
              if (!order?.length) {
                return null;
              }
              return (
                <div className={styles.groupCol} key={g.id}>
                  <span className={styles.groupLabel}>{g.label}</span>
                  <div className={styles.groupFlags}>
                    {order.map((tid) => {
                      const team = TEAMS[tid];
                      if (!team) {
                        return null;
                      }
                      return (
                        <span className={styles.groupFlagWrap} key={tid}>
                          <ShareFlag className={styles.imgSm} team={team} />
                        </span>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <p className={styles.footerBrand}>{t("shareCardFooter")}</p>
      </div>
    );
  },
);
