# HG Herrería Galván

Landing para captar consultas por frentes de parrilla a medida desde Instagram.

Sitio actual: https://hg-herreria-galvan.skrotox.chatgpt.site

## Incluye

- Diseño responsive para mobile y escritorio.
- Video de portada `public/video/parrillas-sin-bordes-web.mp4`, con reproducción sin audio, loop, imagen de respaldo y control de pausa.
- Antes y después de trabajos reales.
- Formulario en dos pasos con validación del servidor y guardado en Cloudflare D1.
- WhatsApp para quienes tienen fotos o pueden sacarlas. Quienes no pueden conseguirlas dejan su contacto y reciben el agradecimiento sin enlace al chat.
- Receptor de Google Apps Script y conexión de servidor preparados para Google Sheets.

## Requisitos y desarrollo

Node.js 22.13 o posterior. El proyecto usa React, Vinext/Vite y Cloudflare Workers; el backend requiere D1 y no funciona como una exportación HTML estática.

```sh
npm run install:ci
npm run dev
```

El servidor de desarrollo usa normalmente http://127.0.0.1:5173.

```sh
npm run build
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_swift_peter_quill.sql
npm start
```

La migración anterior inicializa únicamente la base local. En el hosting de Sites, las migraciones se aplican al publicar.

## Google Sheets con Apps Script

El código está en [`integrations/HG-Contactos.gs`](integrations/HG-Contactos.gs), con instrucciones en [`integrations/Configurar-Sheets.md`](integrations/Configurar-Sheets.md).

La conexión con Sheets todavía requiere desplegar el Apps Script y configurar en el servidor:

- `HG_SHEETS_URL`: URL de la aplicación web terminada en `/exec`.
- `HG_SHEETS_SECRET`: clave generada por el script, configurada como secreto.

Sin esa configuración, las consultas se guardan en D1. Con ella, el servidor también solicita el registro en Sheets y verifica su confirmación antes de mostrar el éxito al visitante. Los reintentos del mismo envío no duplican contactos.

No colocar credenciales en el código público, en variables de cliente ni en `.openai/hosting.json`. Las variables de producción se configuran en el hosting y requieren desplegar una versión para aplicarlas.

## Verificación

```sh
npx tsc --noEmit
node scripts/test-sheets.mjs
```

Las pruebas de Sheets usan dobles locales y no envían contactos reales a Google.

## Estructura

- `app/page.tsx`: landing, video y formulario.
- `app/globals.css`: estilos y puntos de adaptación responsive.
- `app/api/leads/`: validación, persistencia y conexión con Apps Script.
- `db/` y `drizzle/`: esquema y migraciones de contactos.
- `public/`: imágenes y videos.
- `integrations/`: Apps Script e instrucciones de configuración.
- `.openai/hosting.json`: identidad y bindings del sitio existente.

Las dependencias, builds, credenciales, bases locales y archivos temporales están excluidos mediante `.gitignore`.
