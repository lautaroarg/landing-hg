import {getDb} from '../../../db';
import {leads} from '../../../db/schema';
export async function POST(request:Request){
 try{
 if(request.headers.get('origin')&&request.headers.get('origin')!==new URL(request.url).origin)return Response.json({error:'Solicitud no permitida.'},{status:403});
 const raw=await request.text();if(raw.length>4000)return Response.json({error:'Consulta demasiado larga.'},{status:413});const d=JSON.parse(raw);
 for(const k of ['id','name','phone','location','project','timing','photo'])if(typeof d[k]!=='string')return Response.json({error:'Completá todos los datos.'},{status:400});
 const name=d.name.trim(),phone=d.phone.trim(),location=d.location.trim();
 if(!/^[0-9a-f-]{36}$/i.test(d.id)||!name||name.length>100||!location||location.length>120||!/^\+?[0-9 ()-]{8,30}$/.test(phone)||phone.replace(/\D/g,'').length<8||!['Frente de parrilla','Frente e interior de parrilla','Renovar una parrilla existente'].includes(d.project)||!['En el próximo mes','En los próximos 3 meses','Más adelante'].includes(d.timing)||!['1','2','3'].includes(d.photo))return Response.json({error:'Revisá los datos del formulario.'},{status:400});
 await getDb().insert(leads).values({id:d.id,name,phone,location,project:d.project,timing:d.timing,photo:d.photo,createdAt:new Date().toISOString()}).onConflictDoNothing();
 const message=`Hola HG, soy ${name}. Envié una consulta desde la web.\nLocalidad: ${location}\nProyecto: ${d.project}\nPlazo: ${d.timing}\n${d.photo==='1'?'Tengo fotos del espacio para enviarles.':'Puedo sacar fotos del espacio para enviarles.'}`;
 return Response.json({ok:true,whatsapp:d.photo==='3'?null:`https://wa.me/5491149486842?text=${encodeURIComponent(message)}`},{headers:{'Cache-Control':'no-store'}});
 }catch{console.error('Lead submission failed');return Response.json({error:'No pudimos guardar tu consulta. Por favor, intentá de nuevo.'},{status:500})}
}
