"use client";

import {useEffect,useRef,useState} from 'react';
import {ArrowUpRight,ArrowRight,Check,ShieldCheck,Ruler,Wrench,Pause,Play,ChevronLeft} from 'lucide-react';

const projects=['Frente de parrilla','Frente e interior de parrilla','Renovar una parrilla existente'];
const timings=['En el próximo mes','En los próximos 3 meses','Más adelante'];
const photos=['Sí, tengo fotos.','No tengo, pero puedo sacarlas.','No tengo y no puedo sacarlas.'];

function Brand(){return <a className="brand" href="#inicio" aria-label="HG Herrería Galván, inicio"><span className="mark" aria-hidden="true">H<span>G</span></span><span>HERRERÍA GALVÁN<small>FRENTES DE PARRILLA A MEDIDA</small></span></a>}

function HeroVideo({assetBase}:{assetBase:string}){
 const video=useRef<HTMLVideoElement>(null);
 const [playing,setPlaying]=useState(false),[failed,setFailed]=useState(false);
 useEffect(()=>{
  const element=video.current;if(!element)return;
  const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
  const connection=(navigator as Navigator & {connection?:{saveData?:boolean}}).connection;
  if(!motion.matches&&!connection?.saveData) void element.play().catch(()=>setPlaying(false));
  const onMotion=()=>{if(motion.matches)element.pause()};motion.addEventListener('change',onMotion);
  return ()=>motion.removeEventListener('change',onMotion);
 },[]);
 async function toggle(){if(!video.current)return;if(playing){video.current.pause()}else{try{await video.current.play()}catch{setFailed(true)}}}
 return <div className="hero-media">
  <video ref={video} muted playsInline loop preload="none" poster={`${assetBase}images/parrillas-video-poster.jpg`} onPlay={()=>setPlaying(true)} onPause={()=>setPlaying(false)} onError={()=>setFailed(true)} aria-label="Trabajos reales de HG: frentes de parrilla, apertura y detalles de acero inoxidable"><source src={`${assetBase}video/parrillas-sin-bordes-web.mp4`} type="video/mp4"/></video>
  {!failed&&<button type="button" className="video-control" onClick={toggle} aria-label={playing?'Pausar video':'Reproducir video'}>{playing?<Pause size={17}/>:<Play size={17}/>}</button>}
 </div>
}

function QuoteForm({onDone,formEndpoint,formMode}:{onDone:()=>void;formEndpoint:string;formMode:'server'|'apps-script'}){
 const [step,setStep]=useState(1),[busy,setBusy]=useState(false),[done,setDone]=useState(false),[error,setError]=useState(''),[whatsapp,setWhatsapp]=useState('');
 const requestId=useRef(''),card=useRef<HTMLDivElement>(null),focusTitle=useRef<HTMLHeadingElement>(null);
 const [data,setData]=useState({name:'',phone:'',location:'',project:'',timing:'',photo:''});
 const set=(key:string,value:string)=>setData(d=>({...d,[key]:value}));
 function changeStep(next:number){setStep(next);setError('');requestAnimationFrame(()=>{card.current?.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});focusTitle.current?.focus({preventScroll:true})})}
 async function send(event:React.FormEvent){
  event.preventDefault();setBusy(true);setError('');
  try{
   if(!formEndpoint)throw Error('Estamos habilitando las solicitudes de presupuesto. Por favor, volvé a intentar más tarde.');
   if(!requestId.current)requestId.current=crypto.randomUUID();
   const response=await fetch(formEndpoint,{method:'POST',headers:{'Content-Type':formMode==='apps-script'?'text/plain;charset=utf-8':'application/json'},body:JSON.stringify({...data,id:requestId.current}),redirect:'follow',credentials:'omit',signal:AbortSignal.timeout(30000)});
   const result=await response.json() as {ok?:boolean;id?:string;error?:string;whatsapp?:string};
   if(!response.ok||result.ok!==true||(formMode==='apps-script'&&result.id!==requestId.current))throw Error(result.error||'No pudimos confirmar tu consulta. Intentá de nuevo.');
   setWhatsapp(result.whatsapp||'');setDone(true);onDone();
   requestAnimationFrame(()=>{focusTitle.current?.focus({preventScroll:true});card.current?.scrollIntoView({behavior:'smooth',block:'start'})});
  }catch(err){setError(err instanceof Error?err.message:'No pudimos enviar tu consulta. Intentá de nuevo.')}finally{setBusy(false)}
 }
 return <div ref={card} className="form-card" id="formulario">
  {done?<div className="success" role="status"><span className="success-icon"><Check size={30}/></span><span className="eyebrow blue">CONSULTA RECIBIDA</span><h3 ref={focusTitle} tabIndex={-1}>¡Gracias por dejarnos tu contacto!</h3><p>Pronto te escribiremos.</p>{whatsapp&&<><p className="reminder">{data.photo==='1'?'Envianos las fotos del espacio y seguimos con tu presupuesto.':'Sacá una foto del espacio y envianosla para avanzar con tu presupuesto.'}</p><a className="button whatsapp" href={whatsapp} target="_blank" rel="noopener noreferrer">Continuar por WhatsApp <ArrowUpRight size={20}/></a></>}</div>:<>
   <div className="form-heading"><span>TU PRESUPUESTO EMPIEZA ACÁ</span><span>PASO {step} DE 2</span></div>
   <div className="progress" aria-hidden="true"><span style={{width:step===1?'50%':'100%'}}/></div>
   <h3 ref={focusTitle} tabIndex={-1}>{step===1?'Contanos qué necesitás':'Dejanos tu contacto'}</h3>
   <p className="form-subtitle">{step===1?'Elegí las opciones que mejor describen tu proyecto.':'Una foto nos ayuda a preparar tu presupuesto.'}</p>
   {!formEndpoint&&<p className="form-pending" role="status">Estamos habilitando las solicitudes de presupuesto online. Volvé pronto.</p>}
   <form onSubmit={step===1?event=>{event.preventDefault();changeStep(2)}:send}>
    {step===1?<>
     <label className="field-label" htmlFor="location">¿En qué localidad es el proyecto?</label>
     <input id="location" autoComplete="address-level2" placeholder="Ej.: Pilar, Buenos Aires" maxLength={120} required value={data.location} onChange={event=>set('location',event.target.value)}/>
     <fieldset><legend>¿Qué querés hacer?</legend><div className="choices project-choices">{projects.map((text,index)=><label className={'choice '+(data.project===text?'selected':'')} key={text}><input type="radio" name="project" required value={text} checked={data.project===text} onChange={event=>set('project',event.target.value)}/><span>{['Solo el frente','Frente + interior','Renovar mi parrilla'][index]}</span><Check size={16}/></label>)}</div></fieldset>
     <fieldset><legend>¿Cuándo pensás hacerlo?</legend><div className="choices timing-choices">{timings.map((text,index)=><label className={'choice '+(data.timing===text?'selected':'')} key={text}><input type="radio" name="timing" required value={text} checked={data.timing===text} onChange={event=>set('timing',event.target.value)}/><span>{['Este mes','En 3 meses','Más adelante'][index]}</span><Check size={16}/></label>)}</div></fieldset>
     <button className="button" type="submit">Continuar <ArrowRight size={19}/></button>
     <p className="form-note">En el próximo paso te pedimos nombre y WhatsApp.</p>
    </>:<>
     <div className="contact-fields"><div><label className="field-label" htmlFor="name">Tu nombre</label><input id="name" autoComplete="name" required maxLength={100} placeholder="Nombre y apellido" value={data.name} onChange={event=>set('name',event.target.value)}/></div><div><label className="field-label" htmlFor="phone">Tu WhatsApp</label><input id="phone" type="tel" inputMode="tel" autoComplete="tel" required pattern="[+0-9 ()-]{8,30}" maxLength={30} placeholder="11 1234 5678" value={data.phone} onChange={event=>set('phone',event.target.value)}/></div></div>
     <fieldset className="photo-field"><legend>¿Tenés una foto de la parrilla o del espacio?</legend><p>La necesitamos para preparar tu presupuesto.</p><div className="photo-choices">{photos.map((text,index)=><label className={'choice photo-choice '+(data.photo===String(index+1)?'selected':'')} key={text}><input type="radio" name="photo" required value={index+1} checked={data.photo===String(index+1)} onChange={event=>set('photo',event.target.value)}/><span>{text}</span><Check size={17}/></label>)}</div></fieldset>
     <p className="privacy">Al enviar, aceptás que HG Herrería Galván te contacte para conversar sobre tu proyecto.</p>
     {error&&<p className="error" role="alert">{error}</p>}
     <button className="button" type="submit" disabled={busy||!formEndpoint}>{!formEndpoint?'Solicitudes online · Próximamente':busy?'Enviando consulta…':'Solicitar mi presupuesto'}{!busy&&formEndpoint&&<ArrowUpRight size={20}/>}</button>
     <button className="back" type="button" disabled={busy} onClick={()=>changeStep(1)}><ChevronLeft size={15}/> Volver al proyecto</button>
    </>}
   </form>
  </>}
 </div>
}

export default function Home({assetBase='/',formEndpoint='/api/leads',formMode='server'}:{assetBase?:string;formEndpoint?:string;formMode?:'server'|'apps-script'}={}){
 const [showSticky,setShowSticky]=useState(false),[heroCtaVisible,setHeroCtaVisible]=useState(true),[done,setDone]=useState(false);
 useEffect(()=>{
  const quote=document.getElementById('cotizar');if(!quote)return;
  const observer=new IntersectionObserver(entries=>{for(const entry of entries){if(entry.target===quote)setShowSticky(!entry.isIntersecting);else setHeroCtaVisible(entry.isIntersecting)}},{threshold:0});observer.observe(quote);const heroCta=document.querySelector('.hero-actions .button');if(heroCta)observer.observe(heroCta);return ()=>observer.disconnect();
 },[]);
 return <><a className="skip-link" href="#cotizar">Ir al formulario de presupuesto</a>
  <header className="site-header"><div className="header-inner"><Brand/><nav aria-label="Navegación principal"><a className="work-link" href="#trabajos">Nuestros trabajos</a><a className="nav-cta" href="#cotizar">Cotizar mi proyecto <ArrowUpRight size={17}/></a></nav></div></header>
  <main id="inicio">
   <section className="hero"><div className="hero-inner">
    <div className="hero-intro"><span className="eyebrow">HECHO A MEDIDA. HECHO PARA DURAR.</span><h1>Frentes de parrilla <br/><em>a tu medida.</em></h1></div>
    <HeroVideo assetBase={assetBase}/>
    <div className="hero-actions"><p>Renová tu quincho con diseño, fabricación e instalación en un solo lugar.</p><a className="button" href="#cotizar">Cotizar mi proyecto <ArrowUpRight size={21}/></a><span className="hero-note"><Check size={15}/> Cada proyecto se diseña para tu espacio.</span><a className="hero-secondary" href="#trabajos">Mirá el antes y después <ArrowRight size={15}/></a></div>
   </div></section>
   <div className="trust-strip"><span><Ruler/>100% a medida</span><span><Wrench/>Instalación incluida</span><span><ShieldCheck/>6 meses de garantía</span></div>
   <section className="work section-width" id="trabajos"><div className="section-intro"><div><span className="eyebrow blue">EL CAMBIO SE NOTA</span><h2>Tu quincho puede <br/>verse así.</h2></div><p>De una parrilla abierta a un frente que integra diseño, protección y guardado.</p></div><div className="comparison"><figure><img src={`${assetBase}images/parrilla-antes.jpg`} width="960" height="1200" alt="Parrilla de ladrillo abierta antes de la renovación" loading="lazy"/><figcaption><span className="comparison-tag">ANTES</span><span>El punto de partida</span></figcaption></figure><figure><img src={`${assetBase}images/parrilla-despues.jpg`} width="960" height="1200" alt="La misma parrilla renovada con frente metálico y puertas de guardado" loading="lazy"/><figcaption><span className="comparison-tag">DESPUÉS</span><span>El sello de HG <ArrowUpRight size={17}/></span></figcaption></figure></div></section>
   <section className="quote" id="cotizar"><div className="quote-inner section-width"><div className="quote-copy"><span className="eyebrow">HABLEMOS DE TU PROYECTO</span><h2>Tu nuevo frente <br/>empieza <em>acá.</em></h2><p>Contanos qué necesitás y dónde es la instalación. Después vemos el espacio y preparamos tu presupuesto.</p><div className="quote-benefits"><div><Ruler/><span><strong>Diseño a medida</strong>Según tu espacio y el estilo de tu quincho.</span></div><div><Wrench/><span><strong>Nos ocupamos de todo</strong>Diseño, fabricación e instalación.</span></div><div><ShieldCheck/><span><strong>Respaldo después de la entrega</strong>6 meses de garantía.</span></div></div></div><QuoteForm onDone={()=>setDone(true)} formEndpoint={formEndpoint} formMode={formMode}/></div></section>
   <section className="faq section-width"><div><span className="eyebrow blue">ANTES DE EMPEZAR</span><h2>Algunas respuestas.</h2></div><div>{[['¿Trabajan con medidas estándar?','Cada frente e interior se diseña a medida, según el espacio, el uso y el estilo del quincho.'],['¿Qué incluye el servicio?','Diseño, fabricación e instalación del frente e interior de parrilla, según el alcance de tu proyecto. Las terminaciones y los accesorios se definen al cotizar.'],['¿Los trabajos tienen garantía?','Sí, los trabajos cuentan con 6 meses de garantía y acompañamiento después de la entrega.']].map(([q,a])=><details key={q}><summary>{q}<span aria-hidden="true">+</span></summary><p>{a}</p></details>)}</div></section>
  </main><footer className="section-width"><Brand/><a href="https://www.instagram.com/parrillas.asadores.hg/" target="_blank" rel="noopener noreferrer">Seguinos en Instagram <ArrowUpRight size={16}/></a><span>© {new Date().getFullYear()} HG Herrería Galván</span></footer>
  {showSticky&&!heroCtaVisible&&!done&&<div className="mobile-cta"><a className="button" href="#cotizar">Pedir presupuesto <ArrowUpRight size={20}/></a></div>}
 </>
}


