/**
 * Uso: node --env-file=.env scripts/resend-test-send.mjs
 * Envía un correo de prueba vía Resend (requiere RESEND_API_KEY en .env).
 */
import { Resend } from "resend";

const key = process.env.RESEND_API_KEY?.trim();
if (!key) {
  console.error("Falta RESEND_API_KEY en el entorno (.env).");
  process.exit(1);
}

const resend = new Resend(key);
const { data, error } = await resend.emails.send({
  from: "Sierra Labs <marketing@sierra-labs.digital>",
  html: "<p>Correo de prueba desde <strong>bracketFifa</strong>. Si lees esto, Resend y el dominio <code>sierra-labs.digital</code> están bien configurados.</p>",
  subject: "Prueba Resend — bracketFifa",
  text: "Correo de prueba desde bracketFifa. Resend y el dominio sierra-labs.digital OK.",
  to: "pablojaramunoz@gmail.com",
});

if (error) {
  console.error("Resend error:", error);
  process.exit(1);
}

console.log("Enviado. id:", data?.id);
