'use strict';
// =====================================================================
//  Menú principal y selección de escenarios (200 mapas)
// =====================================================================
const SEL={idx:0,scroll:0,biome:'todos',sort:'num',fac:0,color:0,diff:1,prev:null,prevIdx:-1,loading:false,list:[],q:''};
const SORTS=[['num','Orden'],['size','Tamaño'],['name','Nombre']];
function buildList(){
  let l=[];for(let i=0;i<MAP_COUNT;i++){const sp=mapSpec(i);l.push(sp)}
  if(SEL.biome!=='todos')l=l.filter(s=>s.biome===SEL.biome);
  if(SEL.q)l=l.filter(s=>s.name.toLowerCase().includes(SEL.q.toLowerCase()));
  if(SEL.sort==='size')l.sort((a,b)=>b.size-a.size||a.i-b.i);else if(SEL.sort==='name')l.sort((a,b)=>a.name.localeCompare(b.name));
  SEL.list=l;
}
function openSelect(){S.scr='select';buildList();pickMap(SEL.list[0]?SEL.list[0].i:0)}
function pickMap(i){SEL.idx=i;SEL.prev=null;SEL.loading=true;const my=++SEL.token||(SEL.token=1);SEL.token=my;
  setTimeout(()=>{if(SEL.token!==my)return;try{const sp0=mapSpec(i),m=genMap(Object.assign({},sp0,{size:Math.round(sp0.size/MAP_SCALE/2)*2}),{fac0:SEL.fac,surfaceOnly:true});SEL.prev=previewOf(m);SEL.prevIdx=i}catch(e){SEL.prev=null;console.error(e)}SEL.loading=false},40)}
function previewOf(m){
  const c=document.createElement('canvas');c.width=m.w;c.height=m.h;const x=c.getContext('2d'),img=x.createImageData(m.w,m.h);
  for(let i=0;i<m.w*m.h;i++){const col=TCOLM[m.terr[i]];let r=col[0],g=col[1],b=col[2];if(m.deco[i]){r*=.55;g*=.62;b*=.55}if(m.road[i]){r=176;g=140;b=96}img.data[i*4]=r;img.data[i*4+1]=g;img.data[i*4+2]=b;img.data[i*4+3]=255}
  x.putImageData(img,0,0);
  const n={towns:m.objs.filter(o=>o.t==='town').length,mines:m.objs.filter(o=>o.t==='mine'&&!o.dead).length,mons:m.objs.filter(o=>o.t==='mon'&&!o.dead).length,dw:m.objs.filter(o=>o.t==='dwell'&&!o.dead).length};
  const hs=m.starts.map((s,k)=>({x:s.x,y:s.y,k}));
  return{c,w:m.w,h:m.h,n,starts:hs,objs:m.objs.filter(o=>o.t==='town').map(o=>({x:o.x+2,y:o.y+1,start:o.start}))};
}
function drawMenu(dt){
  const c=ctx,t=S.clock;S.clock+=dt;
  const f=Math.floor(t/9)%8,f2=(f+1)%8,k=(t%9)/9;
  const pan=townPanorama(f),pan2=townPanorama(f2);
  c.fillStyle='#000';c.fillRect(0,0,VW,VH);
  const draw=(img,a)=>{c.globalAlpha=a;const h=VH*1.12,w=h*960/430;const ox=-(w-VW)*(.5+.5*Math.sin(t*.07));c.drawImage(img,0,0,960,430,ox,-30,w,h)};
  draw(pan,1);if(k>.88)draw(pan2,(k-.88)/.12);c.globalAlpha=1;
  c.fillStyle=lg(c,0,0,0,VH,['rgba(8,4,16,.55)','rgba(8,4,16,.15)','rgba(8,4,16,.8)']);c.fillRect(0,0,VW,VH);
  for(let i=0;i<40;i++){const px=(i*97+t*12*(1+i%3))%VW,py=(i*53+Math.sin(t+i)*10)%VH;c.fillStyle=`rgba(255,230,160,${.2+.2*Math.sin(t*2+i)})`;c.fillRect(px,py,2,2)}
  // título
  c.save();c.textAlign='center';c.shadowColor='rgba(255,190,70,.8)';c.shadowBlur=30;
  c.font='bold 84px '+FONT;c.fillStyle=lg(c,0,110,0,190,['#fff6c8','#e8b83a','#8a5a14']);c.strokeStyle='#2a1608';c.lineWidth=8;c.strokeText('REINOS DE ÉTER',VW/2,170);c.fillText('REINOS DE ÉTER',VW/2,170);c.restore();
  text('Estrategia por turnos · 200 mundos gigantes · 8 castillos · 126 criaturas',VW/2,208,{size:19,align:'center',color:'#e8d8b0',italic:1});
  const has=!!S.hasSaves;
  const bx=VW/2-150;
  button(bx,300,300,52,'Nueva partida',()=>openSelect(),{primary:1,size:21});
  button(bx,364,300,46,'Continuar partida',()=>loadMenu(),{size:18,disabled:!has});
  button(bx,422,300,46,'Cómo se juega',()=>helpDlg(),{size:18});
  button(bx,480,300,46,S.sound===false?'Sonido: NO':'Sonido: SÍ',()=>{S.sound=S.sound===false;sfx('click')},{size:16});
  text('v1.0 — inspirado en los clásicos de estrategia por turnos con héroes',VW/2,VH-22,{size:13,align:'center',color:'#9a8a70'});
}
function helpDlg(){
  Dlg.show({title:'Cómo se juega',w:760,text:'OBJETIVO: elimina a los 7 jugadores rivales (conquista o destruye todas sus ciudades y héroes).\n\nMAPA: clic en un destino para ver la ruta; segundo clic para caminar. Clic derecho: información. Mueve la cámara con las flechas/WASD, el borde de la pantalla o el minimapa.\n\nECONOMÍA: captura minas y recoge recursos. Cada día recibes oro de tus ciudades; cada semana crece la población de criaturas. Construye una estructura por día y recluta tropas.\n\nCOMBATE: por turnos en un campo hexagonal. Los más rápidos actúan primero. Esperar, Defender y hechizos (uno por ronda). Los tiradores sufren penalización a corta/larga distancia.\n\nATAJOS: E fin de turno · Espacio siguiente héroe · H ficha del héroe · T primera ciudad · Esc cancelar/menú.',buttons:[{label:'Entendido',primary:1}]});
}
// ---------- selección de escenario ----------
function drawSelect(dt){
  const c=ctx;S.clock+=dt;
  c.fillStyle=lg(c,0,0,0,VH,['#1c1424','#0e0a14']);c.fillRect(0,0,VW,VH);
  const pan=townPanorama(SEL.fac);c.globalAlpha=.22;c.drawImage(pan,0,0,VW,VH);c.globalAlpha=1;
  text('ELIGE UN ESCENARIO',VW/2,46,{size:32,bold:true,align:'center',color:'#ffe9a0',outline:1});
  // lista
  panel(24,66,460,636,{plain:1});
  text('Mundos (200)',40,92,{size:15,bold:true,color:'#c8a24a'});
  const biomes=['todos',...BIOME_IDS];
  button(40,100,150,28,'Bioma: '+(SEL.biome==='todos'?'Todos':BIOMES[SEL.biome].n),()=>{const i=biomes.indexOf(SEL.biome);SEL.biome=biomes[(i+1)%biomes.length];SEL.scroll=0;buildList()},{size:12});
  button(198,100,130,28,'Orden: '+SORTS.find(s=>s[0]===SEL.sort)[1],()=>{const i=SORTS.findIndex(s=>s[0]===SEL.sort);SEL.sort=SORTS[(i+1)%3][0];buildList()},{size:12});
  button(336,100,134,28,SEL.q?`Buscar: ${SEL.q}▮`:'Buscar (escribe)',()=>{SEL.q=''; buildList()},{size:12,tip:'Escribe para filtrar por nombre; clic para borrar'});
  for(const e of UI.keyq||[]){if(e.key.length===1&&/[\p{L}\d ]/u.test(e.key)&&!e.ctrlKey&&!e.metaKey){SEL.q+=e.key;buildList()}else if(e.code==='Backspace'){SEL.q=SEL.q.slice(0,-1);buildList()}
    else if(e.code==='ArrowDown'){const i=SEL.list.findIndex(s=>s.i===SEL.idx);if(i<SEL.list.length-1)pickMap(SEL.list[i+1].i)}else if(e.code==='ArrowUp'){const i=SEL.list.findIndex(s=>s.i===SEL.idx);if(i>0)pickMap(SEL.list[i-1].i)}}
  const rows=14,rh=36,lx=36,ly=140;
  if(hovered(24,66,460,636)&&UI.wheel){SEL.scroll=clamp(SEL.scroll+UI.wheel*2,0,Math.max(0,SEL.list.length-rows))}
  c.save();c.beginPath();c.rect(lx,ly,436,rows*rh);c.clip();
  for(let r=0;r<rows;r++){const sp=SEL.list[SEL.scroll+r];if(!sp)break;const y=ly+r*rh;const sel=sp.i===SEL.idx;
    const hov=hit(lx,y,436,rh-2,()=>{if(SEL.idx!==sp.i)pickMap(sp.i)},{});
    rrect(c,lx,y,436,rh-3,5,sel?lg(c,0,y,0,y+rh,['#6a4a22','#3a2610']):hov?'rgba(80,64,52,.8)':'rgba(34,26,36,.7)',sel?'#ffe27a':'#4a3e34',sel?2:1);
    text(`#${String(sp.i+1).padStart(3,'0')}`,lx+8,y+23,{size:12,color:'#a89870'});text(sp.name,lx+52,y+16,{size:14,bold:true,color:sel?'#ffe9a0':'#f2e6c8'});text(`${BIOMES[sp.biome].n} · ${sp.size}×${sp.size}`,lx+52,y+30,{size:11,color:'#b8a888'})}
  c.restore();
  const maxS=Math.max(0,SEL.list.length-rows);if(maxS>0){const th=rows*rh,hh=Math.max(30,th*rows/SEL.list.length);const ty=ly+(th-hh)*SEL.scroll/maxS;rrect(c,474,ly,6,th,3,'rgba(0,0,0,.4)');rrect(c,474,ty,6,hh,3,'#c8a24a')}
  text(`${SEL.list.length} escenarios`,40,ly+rows*rh+22,{size:12,color:'#a89870'});
  // detalle
  const sp=mapSpec(SEL.idx);panel(500,66,756,636,{plain:1});
  text(sp.name,520,100,{size:26,bold:true,color:'#ffe9a0'});text(`${BIOMES[sp.biome].n} · ${sp.size}×${sp.size} casillas (enorme) · 8 jugadores`,520,124,{size:14,color:'#c8b890'});
  const pw=330;rrect(c,520,138,pw+8,pw+8,6,'#000','#c8a24a',2);
  if(SEL.loading||!SEL.prev||SEL.prevIdx!==SEL.idx){text('Generando mundo…',520+pw/2+4,138+pw/2,{size:18,align:'center',color:'#c8b890'});c.strokeStyle='#ffe27a';c.lineWidth=3;c.beginPath();c.arc(520+pw/2+4,138+pw/2+30,14,S.clock*6,S.clock*6+4);c.stroke()}
  else{const P=SEL.prev;c.imageSmoothingEnabled=true;c.drawImage(P.c,524,142,pw,pw);const k=pw/P.w;
    P.objs.forEach(o=>{if(o.start!==undefined&&o.start!=null){c.fillStyle='#000';c.beginPath();c.arc(524+o.x*k,142+o.y*k,7,0,6.28);c.fill();c.fillStyle=PCOL[(o.start===0?SEL.color:(o.start<=SEL.color?o.start-1:o.start))%8];c.beginPath();c.arc(524+o.x*k,142+o.y*k,5.4,0,6.28);c.fill();if(o.start===0){c.strokeStyle='#fff';c.lineWidth=2;c.stroke()}}else{c.fillStyle='#ddd';c.fillRect(524+o.x*k-2,142+o.y*k-2,4,4)}});
    text(`${P.n.towns} ciudades · ${P.n.mines} minas · ${P.n.dw} viviendas · ${P.n.mons} grupos de monstruos`,524,142+pw+26,{size:13,color:'#d8c8a0'})}
  // opciones
  const ox=880;
  text('Tu facción',ox,100,{size:14,bold:true,color:'#c8a24a'});
  for(let i=0;i<8;i++){const x=ox+(i%4)*86,y=108+Math.floor(i/4)*62;const sel=SEL.fac===i;const hov=hit(x,y,80,56,()=>{SEL.fac=i;pickMap(SEL.idx)},{tip:[FDEF[i].name,FDEF[i].desc]});
    rrect(c,x,y,80,56,6,lg(c,0,y,0,y+56,[hov?'#5a4a3a':'#3a2e30','#1a1418']),sel?'#ffe27a':FDEF[i].col[0],sel?3:1.4);c.drawImage(townSprite(i).c,x+4,y+2,72,50);text(FDEF[i].short,x+40,y+54,{size:11,bold:true,align:'center',shadow:true,color:sel?'#ffe9a0':'#fff'})}
  text(FDEF[SEL.fac].name,ox,246,{size:15,bold:true,color:FDEF[SEL.fac].col[0]});paragraph(FDEF[SEL.fac].desc,ox,264,360,{size:13,color:'#d8c8a0'});
  text('Tu color',ox,320,{size:14,bold:true,color:'#c8a24a'});
  for(let i=0;i<8;i++){const x=ox+i*46,y=328;const sel=SEL.color===i;hit(x,y,40,36,()=>{SEL.color=i},{tip:PNAME[i]});rrect(c,x,y,40,36,6,lg(c,0,y,0,y+36,[shade(PCOL[i],.3),PCOL[i],shade(PCOL[i],-.4)]),sel?'#fff':'#1a1220',sel?3.4:1.5);if(sel){c.fillStyle='#fff';c.font='bold 20px '+FONT;c.textAlign='center';c.fillText('✔',x+20,y+26)}}
  text('Dificultad',ox,396,{size:14,bold:true,color:'#c8a24a'});
  DIFF.forEach((d,i)=>{const x=ox+(i%2)*190,y=406+Math.floor(i/2)*38;button(x,y,182,32,d.n,()=>{SEL.diff=i},{size:14,col:SEL.diff===i?'#8a5a1a':'#3a2e44',tip:[d.n,`Recursos iniciales: tú ×${d.res} · rivales ×${d.ai}`]})});
  text('Rivales: 7 jugadores controlados por la IA',ox,500,{size:13,color:'#bfe8ff'});
  button(ox,516,376,54,'¡COMENZAR!',()=>startNewGame(),{primary:1,size:24,disabled:SEL.loading||!SEL.prev});
  button(ox,582,376,38,'Volver',()=>{S.scr='menu'},{size:15});
  text('Rueda del ratón / ↑↓ para recorrer la lista',ox,650,{size:12,color:'#8a7a60'});
}
function startNewGame(){
  S.loading='Generando el mundo…';
  setTimeout(()=>{
    try{newGame(SEL.idx,{fac:SEL.fac,diff:SEL.diff,color:SEL.color});initWorldUI();banner('Día 1',mapSpec(SEL.idx).name);sfx('battle');
      G.sync=false}catch(e){console.error(e);UI.err=String(e.stack||e)}
    S.loading=null},40);
}
function initWorldUI(){
  buildMini();S.sel=null;S.path=null;S.target=null;S.mov=null;S.anim=null;S.fx=null;S.ai=null;S.later=[];S.scr='adv';UI.modals.length=0;
  const hs=myHeroes();selectHero(hs[0],false);const t=ownedTowns(0)[0];S.cam.x=0;S.cam.y=0;camTo(t.x+2,t.y+1,true);fadeIn(2);
}
// ---------- guardado / carga ----------
function openSystemMenu(){
  Dlg.show({title:'Sistema',w:420,draw:m=>{const x=430,y=120,w=420,hh=490;panel(x,y,w,hh,{title:'Sistema'});let by=y+34;
    button(x+40,by,w-80,40,'Continuar',()=>Dlg.close(),{primary:1});by+=50;
    button(x+40,by,(w-80)/2-4,36,'Guardar',()=>saveManual(),{size:14,tip:'Guarda esta partida (también se autoguarda cada día)'});button(x+40+(w-80)/2+4,by,(w-80)/2-4,36,'Cargar…',()=>loadMenu(),{size:14});by+=42;
    button(x+40,by,w-80,36,S.sound===false?'Sonido: NO':'Sonido: SÍ',()=>{S.sound=S.sound===false},{size:14});by+=42;
    button(x+40,by,w-80,36,G.quick?'Combate rápido: SÍ':'Combate rápido: NO',()=>toggleQuick(),{size:14,tip:['Combate rápido','El resultado se calcula al instante (muros, catapulta y torres incluidos) sin entrar en la pantalla de combate']});by+=42;
    button(x+40,by,w-80,36,'Ayuda',()=>helpDlg(),{size:14});by+=42;
    button(x+40,by,w-80,36,'Salir al menú principal',()=>Dlg.show({title:'¿Salir?',text:'Se perderá el progreso no guardado.',buttons:[{label:'Salir',primary:1,fn:()=>{UI.modals.length=0;S.scr='menu'}},{label:'Cancelar'}]}),{size:14})}});
}
