"use client";

import { forwardRef, useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { GROUPS, TEAMS } from "@/data/worldCup2026";
import {
  buildFinalMatch,
  buildQFMatches,
  buildR16FromR32Results,
  buildR32Fixtures,
  buildSFMatches,
} from "@/lib/bracketKnockout";
import { flagCcFromFlagUrl } from "@/lib/flagCc";
import { fetchFlagsAsDataUrls } from "@/lib/fetchFlagDataUrls";
import { flagImageProxyPath } from "@/lib/flagProxyPath";
import {
  inlineFlagsCacheCoversCodes,
  readInlineFlagsCache,
  writeInlineFlagsCache,
} from "@/lib/inlineFlagsSessionCache";
import { collectSubmissionFlagCodes } from "@/lib/submissionFlagCodes";
import { teamDisplayName } from "@/lib/teamDisplayName";
import type { BracketSubmission } from "@/types/bracket";
import styles from "@/components/bracket-share/BracketShareCard.module.css";

type BracketShareCardProps = {
  data: BracketSubmission;
};

function ShareFlag({
  className,
  inlineByCc,
  team,
}: {
  className: string;
  inlineByCc: Record<string, string>;
  team: { code: string; flagUrl: string; name: string };
}) {
  const cc = flagCcFromFlagUrl(team.flagUrl);
  const inlined = cc ? inlineByCc[cc] : undefined;
  const src =
    inlined && inlined.length > 0 ? inlined : flagImageProxyPath(team.flagUrl);
  const isData = src.startsWith("data:");
  return (
    // eslint-disable-next-line @next/next/no-img-element -- data URL / proxy para captura
    <img
      alt=""
      className={className}
      crossOrigin={isData ? undefined : "anonymous"}
      decoding="async"
      fetchPriority="high"
      loading="eager"
      src={src}
    />
  );
}

export const BracketShareCard = forwardRef<HTMLDivElement, BracketShareCardProps>(
  function BracketShareCard({ data }, ref) {
    const locale = useLocale();
    const t = useTranslations("Success");
    const [inlineByCc, setInlineByCc] = useState<Record<string, string>>({});

    const codes = useMemo(() => collectSubmissionFlagCodes(data), [data]);

    const flagsInlineComplete =
      codes.length === 0 ||
      codes.every((cc) => {
        const v = inlineByCc[cc];
        return typeof v === "string" && v.startsWith("data:");
      });

    useEffect(() => {
      let cancelled = false;
      const list = collectSubmissionFlagCodes(data);
      if (list.length === 0) {
        setInlineByCc({});
        return;
      }

      const cached = readInlineFlagsCache(data.entryId);
      if (cached && inlineFlagsCacheCoversCodes(cached, list)) {
        setInlineByCc(cached);
        return;
      }

      void (async () => {
        const fresh = await fetchFlagsAsDataUrls(list);
        if (cancelled) {
          return;
        }
        setInlineByCc(fresh);
        writeInlineFlagsCache(data.entryId, fresh);
      })();

      return () => {
        cancelled = true;
      };
    }, [data]);

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
      <div
        ref={ref}
        className={styles.root}
        data-flags-inline={flagsInlineComplete ? "complete" : "pending"}
      >
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
              inlineByCc={inlineByCc}
              team={champion}
            />
            <p className={styles.championName}>
              {teamDisplayName(champion, locale)}
            </p>
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
                    <ShareFlag
                      className={styles.imgWin}
                      inlineByCc={inlineByCc}
                      team={team}
                    />
                  </span>
                ))}
              </div>
            </div>

            <div className={styles.phaseBlock}>
              <span className={styles.phaseLabel}>{t("sharePhaseR16")}</span>
              <div className={styles.flagRow}>
                {r16WinnerTeams.map((team, i) => (
                  <span className={styles.flagSlot} key={`${team.id}-r16-${i}`}>
                    <ShareFlag
                      className={styles.imgWin}
                      inlineByCc={inlineByCc}
                      team={team}
                    />
                  </span>
                ))}
              </div>
            </div>

            <div className={styles.phaseBlock}>
              <span className={styles.phaseLabel}>{t("sharePhaseQf")}</span>
              <div className={styles.flagRow}>
                {qfWinnerTeams.map((team) => (
                  <span className={styles.flagSlot} key={team.id}>
                    <ShareFlag
                      className={styles.imgWin}
                      inlineByCc={inlineByCc}
                      team={team}
                    />
                  </span>
                ))}
              </div>
            </div>

            <div className={styles.phaseBlock}>
              <span className={styles.phaseLabel}>{t("sharePhaseSf")}</span>
              <div className={styles.flagRow}>
                {sfWinnerTeams.map((team) => (
                  <span className={styles.flagSlot} key={team.id}>
                    <ShareFlag
                      className={styles.imgWin}
                      inlineByCc={inlineByCc}
                      team={team}
                    />
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
                    <ShareFlag
                      className={styles.imgMd}
                      inlineByCc={inlineByCc}
                      team={homeFinal}
                    />
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
                    <ShareFlag
                      className={styles.imgMd}
                      inlineByCc={inlineByCc}
                      team={awayFinal}
                    />
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
                          <ShareFlag
                            className={styles.imgSm}
                            inlineByCc={inlineByCc}
                            team={team}
                          />
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
