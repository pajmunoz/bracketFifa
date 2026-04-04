import { jsPDF } from "jspdf";
import { GROUPS, TEAMS } from "@/data/worldCup2026";
import {
  buildFinalMatch,
  buildQFMatches,
  buildR16Fixtures,
  buildSFMatches,
  buildThirdPlaceMatch,
} from "@/lib/bracketKnockout";
import type { BracketSubmission } from "@/types/bracket";

export function generateBracketPdf(data: BracketSubmission): void {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 48;
  let y = margin;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("2026 World Cup — Bracket prediction", margin, y);
  y += 28;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Entry ID: ${data.entryId}`, margin, y);
  y += 16;
  doc.text(`Name: ${data.name}`, margin, y);
  y += 14;
  doc.text(`Email: ${data.email}`, margin, y);
  y += 14;
  doc.text(`WhatsApp: ${data.whatsapp}`, margin, y);
  y += 24;

  doc.setFontSize(12);
  doc.text("Fase de grupos (orden 1º / 2º)", margin, y);
  y += 18;

  doc.setFontSize(10);
  for (const g of GROUPS) {
    const order = data.groups[g.id];
    if (!order) {
      continue;
    }
    doc.setFont("helvetica", "bold");
    doc.text(`${g.label}`, margin, y);
    y += 14;
    doc.setFont("helvetica", "normal");
    order.forEach((tid, i) => {
      const t = TEAMS[tid];
      if (t) {
        doc.text(`${i + 1}º ${t.name} (${t.code})`, margin + 12, y);
        y += 12;
      }
    });
    y += 8;
    if (y > 720) {
      doc.addPage();
      y = margin;
    }
  }

  const k = data.knockout;
  const r16 = buildR16Fixtures(data.groups);

  doc.setFont("helvetica", "bold");
  doc.text("Octavos — ganadores", margin, y);
  y += 14;
  doc.setFont("helvetica", "normal");
  for (const m of r16) {
    const w = TEAMS[k.r16[m.id]];
    const h = TEAMS[m.homeId];
    const a = TEAMS[m.awayId];
    if (w && h && a) {
      doc.text(
        `${m.id}: ${h.code} vs ${a.code} → ${w.code}`,
        margin,
        y,
      );
      y += 12;
    }
    if (y > 720) {
      doc.addPage();
      y = margin;
    }
  }

  const qfM = buildQFMatches(k.r16);
  doc.setFont("helvetica", "bold");
  doc.text("Cuartos — ganadores", margin, y);
  y += 14;
  doc.setFont("helvetica", "normal");
  for (const m of qfM) {
    const w = TEAMS[k.qf[m.id]];
    const h = TEAMS[m.homeId];
    const a = TEAMS[m.awayId];
    if (w && h && a) {
      doc.text(`${m.id}: ${h.code} vs ${a.code} → ${w.code}`, margin, y);
      y += 12;
    }
    if (y > 720) {
      doc.addPage();
      y = margin;
    }
  }

  const sfM = buildSFMatches(k.qf);
  doc.setFont("helvetica", "bold");
  doc.text("Semifinales — ganadores", margin, y);
  y += 14;
  doc.setFont("helvetica", "normal");
  for (const m of sfM) {
    const w = TEAMS[k.sf[m.id]];
    const h = TEAMS[m.homeId];
    const a = TEAMS[m.awayId];
    if (w && h && a) {
      doc.text(`${m.id}: ${h.code} vs ${a.code} → ${w.code}`, margin, y);
      y += 12;
    }
    if (y > 720) {
      doc.addPage();
      y = margin;
    }
  }

  const fin = buildFinalMatch(k.sf);
  const champ = TEAMS[k.championId];
  doc.setFont("helvetica", "bold");
  doc.text(
    `Final: ${TEAMS[fin.homeId]?.code ?? "?"} vs ${TEAMS[fin.awayId]?.code ?? "?"} — campeón: ${champ?.code ?? ""}`,
    margin,
    y,
  );
  y += 16;

  const thirdM = buildThirdPlaceMatch(sfM, k.sf);
  const third = TEAMS[k.thirdPlaceId];
  doc.text(
    `Tercer lugar: ${TEAMS[thirdM.homeId]?.code ?? "?"} vs ${TEAMS[thirdM.awayId]?.code ?? "?"} → ${third?.code ?? ""}`,
    margin,
    y,
  );

  doc.save("bracket-2026-prediction.pdf");
}
