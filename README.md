# 2026 BRACKET

Next.js 16 + App Router, i18n (`next-intl`), predicción de bracket y envío a MySQL.

## Desarrollo local

```bash
npm install
cp .env.example .env
# Edita .env con tus credenciales MySQL
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Variables de entorno

Copia [`.env.example`](./.env.example) y rellena los valores. En Vercel: **Settings → Environment Variables** (Production / Preview según necesites).

| Variable | Descripción |
|----------|-------------|
| `DB_HOST` | Host MySQL accesible desde internet |
| `DB_PORT` | Puerto (por defecto `3306`) |
| `DB_USER` | Usuario |
| `DB_PASSWORD` | Contraseña |
| `DB_NAME` | Base de datos |
| `DB_POOL_LIMIT` | Opcional, pool (por defecto `3`) |
| `DB_SSL` | Opcional, `true` si el servidor exige TLS |
| `DB_SSL_REJECT_UNAUTHORIZED` | Opcional, `false` solo si usas certificados autofirmados |

Sin variables de DB, `/api/health` responde `db: not_configured`; las rutas que insertan/consultan fallarán hasta configurarlas.

## Deploy en Vercel

1. Conecta el repositorio en [vercel.com/new](https://vercel.com/new).
2. **Framework Preset:** Next.js (detección automática).
3. **Build:** `npm run build` (por defecto). **Install:** `npm install`.
4. Añade las variables de entorno anteriores en el proyecto Vercel.
5. La base MySQL debe permitir conexiones **remotas** desde las IPs de Vercel (o usar un proveedor con acceso público y SSL). Muchos planes “solo localhost” de hosting compartido no sirven para serverless.

Tras el deploy, la app y `/api/submissions` comparten el mismo dominio (`fetch` relativo funciona sin CORS extra).

## Documentación

- [Next.js](https://nextjs.org/docs)
- [next-intl](https://next-intl.dev)
