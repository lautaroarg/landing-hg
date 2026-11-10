import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
import ts from 'typescript';

const rows=[];
const sheet={getLastRow:()=>rows.length,getRange(row,col,height=1,width=1){return {
 setValues(values){values.forEach((value,i)=>{rows[row-1+i]=value;});return this;},
 getValues(){return rows.slice(row-1,row-1+height).map(value=>value.slice(col-1,col-1+width));},
 setNumberFormat(){return this;},
 createTextFinder(id){return {matchEntireCell(){return this;},findNext(){return rows.slice(1).find(value=>value[0]===id)||null;}};}
};}};
let held=false;
const context={
 console,PropertiesService:{getScriptProperties:()=>({getProperty:key=>({HG_FORM_SECRET:'test-secret',SPREADSHEET_ID:'test-sheet',HG_PUBLIC_FORM_ENABLED:'true'})[key]})},
 LockService:{getScriptLock:()=>({waitLock(){held=true;},hasLock:()=>held,releaseLock(){held=false;}})},
 SpreadsheetApp:{openById:()=>({getSheetByName:()=>sheet}),flush(){}},
 ContentService:{MimeType:{JSON:'json'},createTextOutput:text=>({setMimeType:()=>JSON.parse(text)})},
};
vm.createContext(context);
vm.runInContext(fs.readFileSync('integrations/HG-Contactos.gs','utf8'),context);
const lead={id:'11111111-1111-4111-8111-111111111111',name:'Prueba',phone:'1100000000',location:'Prueba',project:'Frente de parrilla',timing:'En el próximo mes',photo:'1'};
const post=d=>context.doPost({postData:{contents:JSON.stringify(d)}});
assert.equal(post({...lead,secret:'wrong'}).ok,false);
assert.equal(rows.length,0);
for(const photo of ['1','2','3']){
 const d={...lead,id:lead.id.slice(0,-1)+photo,photo,secret:'test-secret'};
 const result=post(d);
 assert.equal(result.ok,true);
 if(photo==='3')assert.equal(result.whatsapp,null);
 else assert.match(result.whatsapp,/^https:\/\/wa\.me\/5491169304334\?text=/);
 assert.equal(post(d).ok,true);
 assert.equal(held,false);
}
assert.equal(rows.length,4);
assert.equal(rows[1][8],'Sí');assert.equal(rows[2][8],'Sí');assert.equal(rows[3][8],'No');
assert.equal(context.safeText_('=IMPORTXML(1)'),"'=IMPORTXML(1)");
assert.equal(post({...lead,name:'',secret:'test-secret'}).ok,false);
assert.equal(post({...lead,id:lead.id.slice(0,-1)+'4'}).ok,true);
assert.equal(post({...lead,id:lead.id.slice(0,-1)+'4'}).ok,true);
assert.equal(rows.length,5);
assert.equal(post({...lead,photo:'__proto__'}).ok,false);

const compiled=ts.transpileModule(fs.readFileSync('app/api/leads/sheets.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
const {saveToSheets}=await import('data:text/javascript;base64,'+Buffer.from(compiled).toString('base64'));
const original=globalThis.fetch;let calls=0;
try{
 globalThis.fetch=async(url,options)=>{calls++;assert.equal(url,'https://script.google.com/macros/s/test/exec');assert.equal(JSON.parse(options.body).secret,'test-secret');return {ok:true,json:async()=>({ok:true,id:lead.id})};};
 await saveToSheets(lead,'https://script.google.com/macros/s/test/exec','test-secret');
 await assert.rejects(()=>saveToSheets(lead,'https://example.org/exec','test-secret'));
 assert.equal(calls,1);
 globalThis.fetch=async()=>({ok:true,json:async()=>({ok:false})});
 await assert.rejects(()=>saveToSheets(lead,'https://script.google.com/macros/s/test/exec','test-secret'));
 globalThis.fetch=async()=>({ok:true,json:async()=>({ok:true,id:'another-id'})});
 await assert.rejects(()=>saveToSheets(lead,'https://script.google.com/macros/s/test/exec','test-secret'));
}finally{globalThis.fetch=original;}
console.log('OK: tres opciones, deduplicación, autorización, validación y confirmación de Sheets.');
