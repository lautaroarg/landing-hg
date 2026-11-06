/** HG Herrería Galván · receptor de contactos de la landing.
 * Pegar en Extensiones > Apps Script de la planilla destino.
 * Ejecutar configurar() una vez y desplegar como aplicación web.
 */
var HG_HEADERS = ['ID', 'Fecha', 'Nombre', 'WhatsApp', 'Localidad', 'Proyecto', 'Plazo', 'Fotos del espacio', 'Habilita WhatsApp', 'Estado'];
var HG_PHOTOS = {'1':'Sí, tengo fotos.', '2':'No tengo, pero puedo sacarlas.', '3':'No tengo y no puedo sacarlas.'};

function configurar() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  if (!spreadsheet) throw new Error('Abrí este script desde la planilla destino.');
  var props = PropertiesService.getScriptProperties();
  if (!props.getProperty('HG_FORM_SECRET')) {
    props.setProperty('HG_FORM_SECRET', Utilities.getUuid() + Utilities.getUuid());
  }
  props.setProperty('SPREADSHEET_ID', spreadsheet.getId());
  // Receptor público de escritura para la landing de GitHub Pages.
  // No expone una lectura de contactos ni devuelve datos de la planilla.
  props.setProperty('HG_PUBLIC_FORM_ENABLED', 'true');
  spreadsheet.setSpreadsheetTimeZone('America/Argentina/Buenos_Aires');
  var sheet = spreadsheet.getSheetByName('Contactos HG') || spreadsheet.insertSheet('Contactos HG');
  ensureHeaders_(sheet);
  sheet.setFrozenRows(1);
  sheet.getRange(1,1,1,HG_HEADERS.length).setBackground('#1c2b4d').setFontColor('#ffffff').setFontWeight('bold');
  sheet.setColumnWidth(1,285);
  sheet.setColumnWidths(2,HG_HEADERS.length-1,185);
  sheet.setColumnWidth(8,310);
  if (!sheet.getFilter()) sheet.getRange(1,1,Math.max(sheet.getLastRow(),2),HG_HEADERS.length).createFilter();
}

function doPost(e) {
  var lock;
  try {
    if (!e || !e.postData || e.postData.contents.length > 5000) return json_({ok:false});
    var d = JSON.parse(e.postData.contents);
    var props = PropertiesService.getScriptProperties();
    var secret = props.getProperty('HG_FORM_SECRET');
    var serverAuthorized = secret && d.secret === secret;
    var publicFormEnabled = props.getProperty('HG_PUBLIC_FORM_ENABLED') === 'true';
    if (!serverAuthorized && !(publicFormEnabled && !d.secret)) return json_({ok:false});
    var keys = ['id','name','phone','location','project','timing','photo'];
    if (keys.some(function(k){return typeof d[k] !== 'string';})) return json_({ok:false});
    if (!/^[0-9a-f-]{36}$/i.test(d.id) || !d.name.trim() || d.name.length>100 || !d.location.trim() || d.location.length>120 || !/^\+?[0-9 ()-]{8,30}$/.test(d.phone) || d.phone.replace(/\D/g,'').length<8 || ['1','2','3'].indexOf(d.photo)<0 || ['Frente de parrilla','Frente e interior de parrilla','Renovar una parrilla existente'].indexOf(d.project)<0 || ['En el próximo mes','En los próximos 3 meses','Más adelante'].indexOf(d.timing)<0) return json_({ok:false});
    var spreadsheetId = props.getProperty('SPREADSHEET_ID');
    if (!spreadsheetId) return json_({ok:false});
    lock = LockService.getScriptLock();
    lock.waitLock(15000);
    var sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName('Contactos HG');
    if (!sheet) throw new Error('Falta ejecutar configurar().');
    ensureHeaders_(sheet);
    var last = sheet.getLastRow();
    if (last>1 && sheet.getRange(2,1,last-1,1).createTextFinder(d.id).matchEntireCell(true).findNext()) {
      return success_(d);
    }
    var row = [d.id,new Date(),safeText_(d.name),safeText_(d.phone),safeText_(d.location),safeText_(d.project),safeText_(d.timing),HG_PHOTOS[d.photo],d.photo==='3'?'No':'Sí','Nuevo'];
    sheet.getRange(last+1,1,1,row.length).setValues([row]);
    sheet.getRange(last+1,2).setNumberFormat('dd/MM/yyyy HH:mm:ss');
    SpreadsheetApp.flush();
    return success_(d);
  } catch (err) {
    console.error('No se pudo registrar la consulta de HG.');
    return json_({ok:false});
  } finally {
    if (lock && lock.hasLock()) lock.releaseLock();
  }
}

function ensureHeaders_(sheet) {
  if (sheet.getLastRow()===0) sheet.getRange(1,1,1,HG_HEADERS.length).setValues([HG_HEADERS]);
  var current = sheet.getRange(1,1,1,HG_HEADERS.length).getValues()[0];
  if (current.join('|')!==HG_HEADERS.join('|')) throw new Error('Los encabezados de Contactos HG no coinciden. No se modificaron los datos.');
}
function safeText_(value) {
  var text=value.trim();
  return /^[=+\-@\t\r]/.test(text)?"'"+text:text;
}
function json_(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}

function success_(d) {
  var message = 'Hola HG, soy ' + d.name.trim() + '. Envié una consulta desde la web.\nLocalidad: ' + d.location.trim() + '\nProyecto: ' + d.project + '\nPlazo: ' + d.timing + '\n' + (d.photo === '1' ? 'Tengo fotos del espacio para enviarles.' : 'Puedo sacar fotos del espacio para enviarles.');
  return json_({ok:true,id:d.id,whatsapp:d.photo==='3'?null:'https://wa.me/5491149486842?text='+encodeURIComponent(message)});
}

