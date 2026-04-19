/**
 * Envía el mismo correo de confirmación que en producción (sendSubmissionConfirmationEmail).
 * Uso: npx tsx --env-file=.env scripts/send-confirmation-realistic.ts
 */
import { sendSubmissionConfirmationEmail } from "@/lib/sendSubmissionConfirmationEmail";
import type { BracketSubmission } from "@/types/bracket";

const payload = {
  contestConsent: true,
  email: "pablojaramunoz@gmail.com",
  entryId: "2026-WK-4521",
  groups: {},
  knockout: {
    championId: "placeholder",
    qf: {},
    r16: {},
    r32: {},
    sf: {},
    thirdPlaceId: "placeholder",
  },
  locale: "es",
  marketingConsent: true,
  name: "Pablo Jara",
  predictedWinnerCode: "ARG",
  predictedWinnerName: "Argentina",
  submittedAt: new Date().toISOString(),
  whatsapp: "+56 9 1234 5678",
} as BracketSubmission;

void (async () => {
  const result = await sendSubmissionConfirmationEmail(payload);
  if (!result.ok) {
    console.error("Error:", result.error);
    process.exit(1);
  }
  console.log("Correo de confirmación enviado a", payload.email);
})();
