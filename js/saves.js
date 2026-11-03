'use strict';
// =====================================================================
//  Partidas guardadas: cada partida tiene su propio autoguardado y su
//  guardado manual (IndexedDB, con respaldo en localStorage)
// =====================================================================
const SaveDB={
  db:null,
  open(){return new Promise((res,rej)=>{if(this.db)return res(this.db);if(!window.indexedDB)return rej(new Error('sin IndexedDB'));
    const r=indexedDB.open('reinos-de-eter',1);r.onupgradeneeded=()=>{const d=r.result;d.createObjectStore('meta',{keyPath:'id'});d.createObjectStore('data')};
    r.onsuccess=()=>{this.db=r.result;res(this.db)};r.onerror=()=>rej(r.error)})},
  async put(id,meta,data){
    try{const db=await this.open();await new Promise((res,rej)=>{const tx=db.transaction(['meta','data'],'readwrite');tx.objectStore('meta').put(Object.assign({id},meta));tx.objectStore('data').put(data,id);tx.oncomplete=res;tx.onerror=()=>rej(tx.error)})}
    catch(e){localStorage.setItem('reinos_m_'+id,JSON.stringify(Object.assign({id},meta)));localStorage.setItem('reinos_d_'+id,data)}
  },
  async get(id){
    if(id.startsWith('legacy:'))return localStorage.getItem(id.slice(7));
    try{const db=await this.open();return await new Promise((res,rej)=>{const r=db.transaction('data').objectStore('data').get(id);r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)})}
    catch(e){return localStorage.getItem('reinos_d_'+id)}
  },
  async list(){
    let out=[];
    try{const db=await this.open();out=await new Promise((res,rej)=>{const r=db.transaction('meta').objectStore('meta').getAll();r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)})}catch(e){}
    try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k.startsWith('reinos_m_'))out.push(JSON.parse(localStorage.getItem(k)))}}catch(e){}
    for(const k of['reinos_save_auto','reinos_save_1','reinos_save_2','reinos_save_3']){try{const s=localStorage.getItem(k);if(!s)continue;const m=/"idx":(\d+).*?"day":(\d+)/.exec(s);
      if(m)out.push({id:'legacy:'+k,name:mapSpec(+m[1]).name,day:+m[2],kind:k==='reinos_save_auto'?'auto':'manual',ts:0,fac:'',legacy:1})}catch(e){}}
    return out.sort((a,b)=>(b.ts||0)-(a.ts||0));
  },
  async del(id){
    if(id.startsWith('legacy:')){localStorage.removeItem(id.slice(7));return}
    try{const db=await this.open();await new Promise((res,rej)=>{const tx=db.transaction(['meta','data'],'readwrite');tx.objectStore('meta').delete(id);tx.objectStore('data').delete(id);tx.oncomplete=res;tx.onerror=()=>rej(tx.error)})}catch(e){}
    localStorage.removeItem('reinos_m_'+id);localStorage.removeItem('reinos_d_'+id);
  }
};
function saveMeta(kind){const p=G.players[0];return{gid:G.gid,kind,ts:Date.now(),name:mapSpec(G.map.spec.i).name,day:G.day,fac:FDEF[p.fac].name,col:p.col,towns:ownedTowns(0).length,heroes:p.heroes.length}}
let _autoBusy=false;
function autosave(){if(!G.map||G.over||_autoBusy)return;_autoBusy=true;let s;try{s=saveState()}catch(e){_autoBusy=false;console.warn(e);return}
  const id=G.slot||G.gid+':auto';SaveDB.put(id,saveMeta(/:manual$/.test(id)?'manual':'auto'),s).catch(e=>console.warn('no se pudo guardar',e)).finally(()=>{_autoBusy=false;refreshSaves()})}
function saveManual(){let s;try{s=saveState()}catch(e){toast('No se pudo guardar','bad');return}
  G.slot=G.gid+':manual';SaveDB.put(G.slot,saveMeta('manual'),s).then(()=>toast('Partida guardada','good')).catch(()=>toast('No se pudo guardar (sin espacio)','bad'))}
function loadSaveId(id){S.loading='Cargando partida…';
  SaveDB.get(id).then(s=>{if(!s)throw new Error('vacío');setTimeout(()=>{try{loadState(s);G.slot=/^legacy:/.test(id)?null:id;G.sync=false;initWorldUI();for(const p of G.players)if(p.alive)p.human=p.id===0;toast('Partida cargada','good')}catch(e){console.error(e);toast('Error al cargar','bad')}S.loading=null},40)})
  .catch(e=>{console.error(e);toast('No se pudo cargar','bad');S.loading=null})}
const SV={list:[],page:0,loaded:false};
function refreshSaves(){return SaveDB.list().then(l=>{SV.list=l;SV.loaded=true;S.hasSaves=l.length>0})}
function loadMenu(){
  SV.loaded=false;SV.page=0;refreshSaves();
  Dlg.show({title:'Cargar partida',w:760,draw:m=>{const x=260,y=90,w=760,hh=540;panel(x,y,w,hh,{title:'Partidas guardadas'});
    const per=6,n=SV.list.length,pages=Math.max(1,Math.ceil(n/per));SV.page=Math.min(SV.page,pages-1);
    if(!SV.loaded)text('Buscando partidas…',x+w/2,y+120,{size:16,align:'center',color:'#c8b890'});
    else if(!n)text('Todavía no hay partidas guardadas.',x+w/2,y+120,{size:16,align:'center',color:'#c8b890'});
    SV.list.slice(SV.page*per,SV.page*per+per).forEach((s,i)=>{const yy=y+46+i*70;rrect(ctx,x+20,yy,w-40,62,8,'rgba(40,30,44,.85)','#7a6a48',1.4);
      if(s.col){ctx.fillStyle=s.col;ctx.fillRect(x+20,yy,6,62)}
      text(`${s.name}`,x+38,yy+24,{size:17,bold:true,color:'#ffe9a0'});
      text(`Día ${s.day}${s.fac?' · '+s.fac:''}${s.towns!=null?` · ${s.towns} ciudades · ${s.heroes} héroes`:''} · ${s.kind==='auto'?'Auto':'Manual'}${s.ts?' · '+new Date(s.ts).toLocaleString('es-ES',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}):''}`,x+38,yy+46,{size:12,color:'#d8c8a0'});
      button(x+w-150,yy+12,100,38,'Cargar',()=>{Dlg.close();loadSaveId(s.id)},{primary:1,size:15});
      button(x+w-258,yy+12,96,38,'Borrar',()=>Dlg.show({title:'¿Borrar?',text:`Se eliminará ${s.name} (día ${s.day}).`,buttons:[{label:'Borrar',primary:1,fn:()=>SaveDB.del(s.id).then(refreshSaves)},{label:'Cancelar'}]}),{size:14})});
    if(pages>1){button(x+30,y+hh-52,90,36,'◀',()=>{SV.page=Math.max(0,SV.page-1)},{disabled:SV.page===0});text(`${SV.page+1}/${pages}`,x+150,y+hh-28,{size:14,align:'center'});button(x+185,y+hh-52,90,36,'▶',()=>{SV.page=Math.min(pages-1,SV.page+1)},{disabled:SV.page>=pages-1})}
    button(x+w/2-60,y+hh-52,120,36,'Cerrar',()=>Dlg.close())}});
}
refreshSaves();
