# Contactos de HG en Google Sheets

## Preparar Apps Script

1. Abrí la planilla de contactos y elegí **Extensiones → Apps Script**.
2. Pegá el contenido de `HG-Contactos.gs` y guardá.
3. Ejecutá **configurar** una vez y autorizá el acceso. Se prepara la pestaña **Contactos HG**, sin borrar otras pestañas ni contactos existentes.
4. Elegí **Implementar → Nueva implementación → Aplicación web**.
5. Seleccioná **Ejecutar como: yo** y **Acceso: cualquier persona**.
6. Implementá y copiá la URL terminada en **/exec**.

La planilla conserva sus permisos. El receptor público permite agregar consultas validadas y devuelve únicamente la confirmación del envío y el enlace de WhatsApp que corresponda. No tiene una operación para consultar los contactos guardados.

## Conectar GitHub Pages

En el repositorio `lautaroarg/landing-hg`:

1. Abrí **Settings → Secrets and variables → Actions → Variables**.
2. Creá **HG_APPS_SCRIPT_URL** con la URL `/exec`. Es una URL pública del receptor, no una contraseña.
3. Entrá en **Actions → Publish HG landing to GitHub Pages → Run workflow**, elegí `main` y ejecutalo.
4. Al terminar, enviá una consulta de prueba desde la landing y verificá que aparezca en **Contactos HG**.

La aplicación muestra una confirmación solo si Apps Script responde `ok:true` con el ID del envío. No se usa `no-cors`, porque impediría verificar el guardado. Si la implementación no permite leer la respuesta desde el navegador, la consulta no se presenta como confirmada y se deberá revisar el despliegue de Apps Script antes de dar la integración por terminada.

Sin `HG_APPS_SCRIPT_URL`, la landing se publica para revisión y el formulario informa que las solicitudes están pendientes de habilitación. No guarda contactos en el navegador ni simula un envío exitoso.

## Versión de Sites

El sitio original puede seguir usando el servidor y D1 como respaldo. Para sincronizarlo con Sheets, configurar en sus secretos:

- `HG_SHEETS_URL`: URL `/exec`.
- `HG_SHEETS_SECRET`: propiedad `HG_FORM_SECRET` del Apps Script. Esta clave no se publica en GitHub Pages.

Después hay que desplegar una versión para aplicar los secretos.

## Filtro de fotos

Las tres opciones se registran. Las opciones 1 y 2 reciben el botón de WhatsApp después del guardado. La opción 3 recibe «¡Gracias por dejarnos tu contacto! Pronto te escribiremos.», sin enlace al chat.

Los reintentos de un mismo envío no duplican filas. Al cambiar el script, actualizá su implementación conservando la URL.
