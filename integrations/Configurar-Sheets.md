# Conectar HG con Google Sheets

1. Abrí la planilla que recibirá los contactos. Entrá en **Extensiones → Apps Script**.
2. Pegá el contenido de `HG-Contactos.gs` y guardá.
3. Ejecutá **configurar** una vez y autorizá el acceso a la planilla. Se crea la pestaña **Contactos HG**, sin modificar otras pestañas.
4. En **Configuración del proyecto → Propiedades del script**, vas a encontrar **HG_FORM_SECRET** y **SPREADSHEET_ID**. La clave se genera automáticamente; no hace falta editarla.
5. Elegí **Implementar → Nueva implementación → Aplicación web**. Ejecutar como: **yo**. Acceso: **cualquier persona**. Esto habilita el receptor; la planilla conserva sus permisos. El receptor comprueba una clave que solo conoce el servidor de la landing.
6. Copiá la URL de implementación terminada en **/exec**. Necesitamos esa URL para terminar la conexión.

## Configuración del servidor de la landing

En los secretos del servidor, configurar:

- `HG_SHEETS_URL`: URL de implementación terminada en `/exec`.
- `HG_SHEETS_SECRET`: el valor de la propiedad `HG_FORM_SECRET` del script. No se coloca en el código público ni en el navegador.

Después hay que desplegar la landing y verificar que una consulta de prueba aparezca en la planilla.

## Funcionamiento

Cada envío agrega ID, fecha, nombre, WhatsApp, localidad, proyecto, plazo, respuesta sobre fotos, habilitación de WhatsApp y estado «Nuevo».

Los reintentos del mismo envío no duplican filas. Las tres opciones de fotos se registran; solo las opciones 1 y 2 muestran el botón de WhatsApp. Si Sheets no confirma el guardado, el formulario permite reintentar y no muestra una confirmación falsa. La base actual de la landing queda como respaldo.

Al actualizar el código de Apps Script, actualizá también su implementación a una versión nueva conservando la URL.

Referencia oficial: https://developers.google.com/apps-script/guides/web
