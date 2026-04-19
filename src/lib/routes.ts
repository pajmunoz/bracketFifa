/**
 * Pathnames sin prefijo de idioma; `next-intl` añade `/en` cuando el locale es inglés.
 */
export const ROUTES = {
  /** Pantalla de confirmación tras enviar (solo accesible con predicción en sessionStorage). */
  confirmacion: "/actividad/confirmacion",
  /** Panel del bracket (la ruta `/` redirige siempre a bienvenida). */
  home: "/bracket",
  /** Política de privacidad y tratamiento de datos. */
  privacy: "/privacidad",
  /** Reglas del concurso y del torneo. */
  rules: "/reglas",
  /** Contacto y soporte. */
  support: "/soporte",
  /** Pantalla de bienvenida animada; entrada por defecto desde `/`. */
  welcome: "/bienvenida",
} as const;

/** Sitio de Sierra Labs (footer). */
export const SIERRA_LABS_SITE_URL = "https://sierra-labs.digital/";
