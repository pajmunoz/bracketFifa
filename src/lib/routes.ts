/**
 * Pathnames sin prefijo de idioma; `next-intl` añade `/en` cuando el locale es inglés.
 */
export const ROUTES = {
  /** Pantalla de confirmación tras enviar (solo accesible con predicción en sessionStorage). */
  confirmacion: "/actividad/confirmacion",
  /** Panel del bracket (la ruta `/` redirige siempre a bienvenida). */
  home: "/bracket",
  /** Pantalla de bienvenida animada; entrada por defecto desde `/`. */
  welcome: "/bienvenida",
} as const;
