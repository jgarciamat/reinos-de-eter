'use strict';
// =====================================================================
//  Ciudad, ficha de héroe y diálogos (reclutar, mercado, taberna…)
// =====================================================================
S.pick=null;S.town=null;S.townFx=null;
function openTown(t,h){S.selTown=null;
  if(S.scr==='adv'){startCastleEntry(t,h,()=>{S.town={t,h:h&&h.pid===t.owner?h:null};S.pick=null})}
  else{S.town={t,h:h&&h.pid===t.owner?h:null};S.scr='town';S.townFx={t:0}}
}
function closeTown(){const t=S.town&&S.town.t;S.town=null;S.pick=null;const d=S.townDone;S.townDone=null;if(t){fadeTo(()=>{S.scr='adv';startCastleExit(t,null);fadeIn(3);d&&d()},3.2)}else{S.scr='adv';d&&d()}}
function armyPanel(x,y,arr,label,o={}){
  const s=62;text(label,x,y-6,{size:12,bold:true,color:'#c8a24a'});
  for(let i=0;i<7;i++){const sx=x+(i%4)*(s+4),sy=y+Math.floor(i/4)*(s+4);const u=arr[i];
    const sel=S.pick&&S.pick.arr===arr&&S.pick.i===i;
    slot(sx,sy,s,{id:u&&u.id,n:u&&u.n,sel,tip:u?[CR[u.id].name,`Ataque ${CR[u.id].atk} · Defensa ${CR[u.id].def}`,`Daño ${CR[u.id].mn}-${CR[u.id].mx} · Vida ${CR[u.id].hp} · Vel. ${CR[u.id].spd}`,'Clic: mover · Clic derecho: información']:'Espacio libre',
      fn:()=>{const p=S.pick;
        if(!p){if(u)S.pick={arr,i,hero:o.hero};return}
        if(p.arr===arr&&p.i===i){S.pick=null;return}
        const a=p.arr[p.i],b=arr[i];if(!a){S.pick=null;return}
        if(b&&a.id===b.id){b.n+=a.n;p.arr[p.i]=null}else{p.arr[p.i]=b;arr[i]=a}
        // un héroe no puede quedarse sin ejército
        if([o.hero,p.hero].some(q=>q&&armyEmpty(q.army))){const t=p.arr[p.i];p.arr[p.i]=arr[i];arr[i]=t;toast('El héroe necesita al menos una criatura','bad')}
        S.pick=null},right:()=>{if(u)creatureInfo(u.id,u.n)}})}
}
function townHalls(t){return t.b.hall4?4:t.b.hall3?3:t.b.hall2?2:1}
// tamaño de fuente: en móvil horizontal (lienzo escalado) se agranda para que se lea
const fz=n=>UI.ph?Math.round(n*1.3):n;
// ---- acciones compartidas de la ciudad (escritorio y móvil) ----
function townMoveAll(t,h){mergeArmy(h.army,t.gar);sortArmy(h.army)}
function townLeave(t,h){const first=h.army.find(s=>s);for(let i=0;i<7;i++){const s=h.army[i];if(s&&s!==first){if(addToArmy(t.gar,s.id,s.n))h.army[i]=null}}}
function townSplit(){const u=S.pick&&S.pick.arr[S.pick.i];if(!u)return;const n=Math.floor(u.n/2);if(n<1)return;const a=S.pick.arr;const e=a.findIndex(s=>!s);if(e<0){toast('No hay espacio','bad');return}u.n-=n;a[e]={id:u.id,n};S.pick=null}
function townUpgrade(t,p){if(doUpgrade(p,t,S.pick.arr,S.pick.i)){toast('¡Criaturas mejoradas!','good');sfx('level')}}
function townBoat(t,p){const e=buyBoat(t,p);if(e)toast(e,'bad');else{sfx('build');toast('Barco amarrado en el muelle','good')}}
// fila de 7 casillas del ejército (se reutiliza para guarnición y héroe)
function armyRow(x,y,arr,s,gap,o={}){
  for(let i=0;i<7;i++){const sx=x+i*(s+gap),u=arr[i];const sel=S.pick&&S.pick.arr===arr&&S.pick.i===i;
    slot(sx,y,s,{id:u&&u.id,n:u&&u.n,sel,tip:u?[CR[u.id].name,`Ataque ${CR[u.id].atk} · Defensa ${CR[u.id].def}`,`Daño ${CR[u.id].mn}-${CR[u.id].mx} · Vida ${CR[u.id].hp} · Vel. ${CR[u.id].spd}`,'Clic: mover · Clic derecho: información']:'Espacio libre',
      fn:()=>{const p=S.pick;
        if(!p){if(u)S.pick={arr,i,hero:o.hero};return}
        if(p.arr===arr&&p.i===i){S.pick=null;return}
        const a=p.arr[p.i],b=arr[i];if(!a){S.pick=null;return}
        if(b&&a.id===b.id){b.n+=a.n;p.arr[p.i]=null}else{p.arr[p.i]=b;arr[i]=a}
        if([o.hero,p.hero].some(q=>q&&armyEmpty(q.army))){const t=p.arr[p.i];p.arr[p.i]=arr[i];arr[i]=t;toast('El héroe necesita al menos una criatura','bad')}
        S.pick=null},right:()=>{if(u)creatureInfo(u.id,u.n)}})}
}
// ---- disposición de los edificios sobre el panorama ----
// Fondo: el castillo ocupa el centro (con la puerta libre). Fila trasera: Ayuntamiento y defensa a la izquierda,
// magia y servicios a la derecha. Delante, las viviendas en una fila y sus mejoras justo debajo de cada una.
const TOWN_LAYOUT=[['hall1','hall2','hall3','hall4','fort1','fort2','fort3'],['mage1','mage2','mage3','mage4','tavern','market','shipyard'],['dw1','dw2','dw3','dw4','dw5','dw6','dw7'],['up1','up2','up3','up4','up5','up6','up7']];
const BCATS=[['all','Todo'],['hall','Ayuntamiento'],['fort','Defensa'],['mage','Magia'],['serv','Servicios'],['dw','Viviendas'],['up','Mejoras']];
const BCATN={hall:'Ayuntamiento y Capitolio',fort:'Fortificaciones',mage:'Gremio de magos',serv:'Servicios',dw:'Viviendas de criaturas',up:'Mejoras de viviendas'};
function bCat(b){return /^hall/.test(b)?'hall':/^fort/.test(b)?'fort':/^mage/.test(b)?'mage':/^dw/.test(b)?'dw':/^up/.test(b)?'up':'serv'}
function townSpot(b,t){
  const P=UI.ph;let row=0,col=0,up=0;TOWN_LAYOUT.forEach((r,i)=>{const j=r.indexOf(b);if(j>=0){row=i;col=j}});
  // filas 0 y 1: fondo (izquierda/derecha del castillo); filas 2 y 3: cada vivienda con su mejora al lado
  if(/^hall/.test(b)){const hw=P?160:150,hh=hw*112/124,hb=P?436:442;return{x:16,y:hb-hh,w:hw,h:hh,row:0,base:hb,cx:16+hw/2}} // Ayuntamiento: mitad del castillo
  const front=row>=2,w=front?(P?92:90):(P?92:90),h=w*112/124,base=front?(P?518:528):(P?436:442);
  const cx=front?640+(col-3)*172+(row===3?46:-46):(row===0?200+(col-4)*84:676)+(row===0?0:col*84)+w/2;
  return{x:cx-w/2,y:base-h,w,h,row:front?1:0,base,cx}}
// estado detallado de un edificio: requisitos y recursos que faltan (para mostrarlos en rojo)
function buildStatus(t,b,p){
  const built=!!t.b[b],cost=bCost(b,t.fi),miss=[],low={};
  if(!built){
    for(const r of bReq(b,t))if(!t.b[r])miss.push({req:r,txt:'Requiere: '+bTitle(r,t.fi)});
    if(b==='hall4'&&ownedTowns(p.id).some(q=>q.b.hall4))miss.push({txt:'Solo un Capitolio por jugador'});
    for(const k in cost)if((p.res[k]||0)<cost[k]){low[k]=1;miss.push({res:k,txt:`Faltan ${cost[k]-(p.res[k]||0)} de ${RESN[k].toLowerCase()}`})}
  }
  const day=!built&&!!t.builtToday;
  return{built,cost,miss,low,day,ready:!built&&!miss.length,ok:!built&&!miss.length&&!day}}
function hallNext(t,p){const l=townHalls(t);return l<4&&buildStatus(t,'hall'+(l+1),p).ok}
function buildableCount(t,p){return BUILD_ORDER.filter(b=>(b!=='shipyard'||t.dock)&&buildStatus(t,b,p).ok).length}
// construir desde la interfaz: marca el último edificio y lanza la animación
function doBuild(t,b){const p=G.players[0];if(!build(t,b,p))return false;t.lastBuilt=b;sfx('build');toast(`${bTitle(b,t.fi)} construido`,'good');if(S.townFx)S.townFx.bld={b,t:0,burst:0};return true}
// fila de costes con iconos; en rojo lo que no alcanza. Devuelve el ancho usado
function costChips(x,y,cost,low,sz=18,fs=13){let cx=x;for(const k of RES){if(!cost[k])continue;ctx.drawImage(resIcon(k,sz),cx,y-sz+3,sz,sz);const s=String(cost[k]);text(s,cx+sz+2,y,{size:fs,bold:true,color:low&&low[k]?'#ff7a68':'#ffe9a0'});cx+=sz+2+measure(s,fs,true)+9}return cx-x}
function buildBadge(x,y,n){if(!n)return;const r=UI.ph?13:11;ell(ctx,x,y,r,r,'#c83a2a','#ffd0c0',1.6);text(String(n),x,y+4.5,{size:UI.ph?15:13,bold:true,align:'center',color:'#fff',shadow:false})}
function drawTown(dt){
  if(!S.town){ctx.fillStyle='#120c14';ctx.fillRect(0,0,VW,VH);return}
  const c=ctx,{t,h}=S.town,p=G.players[0],F=FDEF[t.fi],P=UI.ph;const tf=S.townFx;if(tf){tf.t+=dt;if(tf.bld)tf.bld.t+=dt}
  c.fillStyle='#120c14';c.fillRect(0,0,VW,VH);
  // ---- panorama a todo lo ancho ----
  const PY=42,PH=P?500:522,pan=townPanorama(t.fi);const k=tf?1+.3*Math.max(0,1-tf.t/1.2)**2:1;
  c.save();c.beginPath();c.rect(0,PY,1280,PH);c.clip();c.translate(640,PY+PH*.7);c.scale(k,k);c.translate(-640,-(PY+PH*.7));
  const ps=pan.width/960;c.drawImage(pan,0,35*ps,960*ps,395*ps,0,PY,1280,PH); // panorama completo: el castillo queda centrado
  for(let i=0;i<14;i++){const px=(i*137+S.clock*(12+i%5*6))%1280,py=PY+30+((i*61)%170)+Math.sin(S.clock*1.3+i)*6;c.fillStyle=F.id==='brasa'?'rgba(255,170,60,.7)':F.id==='cripta'?'rgba(180,220,255,.45)':'rgba(255,255,255,.35)';c.fillRect(px,py,2.4,2.4)}
  if(F.id==='alba'||F.id==='marea'){for(let i=0;i<3;i++){const bx=(S.clock*30+i*420)%1300;c.strokeStyle='rgba(30,30,40,.7)';c.lineWidth=1.6;c.beginPath();c.moveTo(bx,PY+60+i*22);c.quadraticCurveTo(bx+5,PY+54+i*22+Math.sin(S.clock*8+i)*3,bx+10,PY+60+i*22);c.quadraticCurveTo(bx+15,PY+54+i*22+Math.sin(S.clock*8+i)*3,bx+20,PY+60+i*22);c.stroke()}}
  if(t.owner===0)drawFlag(c,p.col,640-12,PY+14,S.clock);
  c.restore();
  hit(500,PY+30,282,PH*.62,()=>recruitModal(t,h),{tip:[t.name,'Clic: reclutar criaturas (todas las viviendas)'],cursor:'pointer'});
  drawTownBuildings(t,p);
  rrect(c,2,PY,1276,PH,3,null,'#c8a24a',2.4);
  drawTownList(t);
  drawTownTop(t,p,F);
  drawTownBottom(t,h,p,F);
  if(tf&&tf.t<.8){c.fillStyle=`rgba(0,0,0,${1-tf.t/.8})`;c.fillRect(0,0,VW,VH)}
  for(const e of UI.keyq||[])if(e.code==='Escape'&&!UI.modals.length)closeTown();
}
function drawTownTop(t,p,F){
  const c=ctx,P=UI.ph;panel(4,3,1272,36,{plain:1,r:8,noshadow:1});
  const nm=t.name+'  ·  '+F.name;text(nm,18,29,{size:P?21:20,bold:true,color:'#ffe9a0'});
  // recursos
  const rx0=P?470:430,sp=P?114:118;RES.forEach((r,i)=>{const rx=rx0+i*sp;c.drawImage(resIcon(r,26),rx,8,26,26);text(String(p.res[r]),rx+30,29,{size:P?17:15,bold:true,color:r==='gold'?'#ffe27a':'#fff'});hit(rx,6,sp-4,30,null,{tip:RESN[r]})});
  text(`Día ${G.day}`,1262,29,{size:P?19:17,bold:true,align:'right',color:'#ffe9a0'});
}
// polvo y chispas mientras se levanta un edificio
function buildFxTick(s,bl){if(Math.random()<.55)FX.add({x:s.x+8+Math.random()*(s.w-16),y:s.base-2,vx:(Math.random()-.5)*50,vy:-14-Math.random()*26,col:'rgba(214,196,160,.8)',size:3+Math.random()*3,life:.8,drag:.96,shrink:1});
  if(Math.random()<.4)FX.add({x:s.x+10+Math.random()*(s.w-20),y:s.base-s.h*(0.15+0.75*Math.min(1,bl.t/1.4)),vx:(Math.random()-.5)*90,vy:-30-Math.random()*40,g:160,col:'#ffe27a',size:1.8,life:.5,add:true})}
function drawTownBuildings(t,p){
  const c=ctx,tf=S.townFx,bl=tf&&tf.bld,T=S.clock;
  const list=BUILD_ORDER.filter(b=>(b!=='shipyard'||t.dock)&&!/^hall[234]$/.test(b)).map(b=>{if(b==='hall1')b='hall'+townHalls(t);return{b,s:townSpot(b,t),st:buildStatus(t,b,p),hall:/^hall/.test(b)}}).sort((a,b)=>a.s.base-b.s.base||a.s.x-b.s.x);
  let lab=null;
  for(const{b,s,st,hall}of list){
    const built=st.built,ok=st.ok;
    const hov=hit(s.x,s.y,s.w,s.h,hall?()=>townHallModal(t,'hall'):()=>buildDialog(t,b),{tip:hall?[bTitle(b,t.fi)+' (nivel '+townHalls(t)+')',`Ingreso de ${townIncome(t.b)} oro/día`,hallNext(t,p)?'Se puede mejorar hoy':'Mejoras del Ayuntamiento en el menú','Clic: abrir el menú de construcción']:built?[...buildTip(t,b,p,{ok:1},st.cost),'Clic: usar este edificio']:[...buildTip(t,b,p,{ok:ok},st.cost),ok?'Clic: construir':'Clic: ver detalles']});
    const anim=bl&&(bl.b===b||(hall&&/^hall/.test(bl.b)))&&bl.t<1.7;
    if(anim){ // obra: el edificio sube desde el suelo entre andamios
      const pr=Math.min(1,bl.t/1.4),e=1-(1-pr)**2;ell(c,s.cx,s.base-s.w*.04,s.w*.42,s.w*.075,'rgba(0,0,0,.4)');
      c.save();c.beginPath();c.rect(s.x-4,s.base-s.h*e,s.w+8,s.h*e+6);c.clip();c.drawImage(buildingSprite(b,t.fi),s.x,s.y,s.w,s.h);c.restore();
      if(pr<1){c.strokeStyle='#8a5a2e';c.lineWidth=2;c.beginPath();for(let i=0;i<4;i++){const px=s.x+6+i*(s.w-12)/3;c.moveTo(px,s.base);c.lineTo(px,s.y+s.h*.1)}for(let i=0;i<4;i++){const py=s.base-i*s.h*.27;c.moveTo(s.x+4,py);c.lineTo(s.x+s.w-4,py)}c.stroke()}
      buildFxTick(s,bl);
      if(bl.t>1.3&&!bl.burst){bl.burst=1;FX.burst(s.cx,s.y+s.h*.4,34,['#ffe27a','#fff','#ffb040'],{spd:170,life:1.1,up:30});FX.add({x:s.cx,y:s.y+s.h*.5,vx:0,vy:-24,col:'#c8ffb0',size:20,life:1.6,text:'¡Construido!'})}
      if(bl.t>1.3){const q=(bl.t-1.3)/.4;c.save();c.globalAlpha=Math.max(0,.6*(1-q));c.strokeStyle='#fff2b0';c.lineWidth=3;c.beginPath();c.ellipse(s.cx,s.base-s.h*.4,s.w*(.5+q*.8),s.h*(.5+q*.6),0,0,6.3);c.stroke();c.restore()}
      continue}
    if(built){
      ell(c,s.cx,s.base-s.w*.04,s.w*.42,s.w*.075,'rgba(0,0,0,.4)');
      if(hov){c.save();c.shadowColor='rgba(255,230,120,.95)';c.shadowBlur=18}
      c.drawImage(buildingSprite(b,t.fi),s.x,s.y,s.w,s.h);
      if(hov)c.restore();
      const m=/^dw(\d)$/.exec(b);if(m){const av=t.avail[+m[1]-1];if(av>0){const r=UI.ph?12:10;ell(c,s.x+s.w-r-2,s.y+r+4,r,r,'#2a6a2a','#c8ffb0',1.4);text(String(av>99?'99+':av),s.x+s.w-r-2,s.y+r+8,{size:av>99?9:UI.ph?12:10,bold:true,align:'center',color:'#fff'})}}
      if(hall&&hallNext(t,p)){const bob=Math.sin(T*4)*2.5;ell(c,s.cx,s.y-2+bob,11,11,'#e8b42a','#fff2b0',1.8);text('+',s.cx,s.y+5+bob,{size:19,bold:true,align:'center',color:'#3a2200',shadow:false})}
      if(t.lastBuilt===b||(hall&&/^hall/.test(t.lastBuilt||''))){const bob=Math.sin(T*3)*1.6;ell(c,s.x+9,s.y+9+bob,8,8,'#3a9a3a','#d0ffc0',1.4);text('★',s.x+9,s.y+13+bob,{size:11,bold:true,align:'center',color:'#fff',shadow:false})}
    }else{
      // silueta: gris si falta algo; en color con brillo pulsante si se puede construir hoy
      const pul=.5+.5*Math.sin(T*3.2+s.x*.02);
      c.save();
      if(ok){c.shadowColor=`rgba(255,226,110,${.55+.4*pul})`;c.shadowBlur=14+8*pul;c.globalAlpha=hov?.95:.6+.12*pul;c.filter='saturate(.6)'}
      else{c.filter=st.ready?'grayscale(.7) brightness(.85)':'grayscale(1) brightness(.8)';c.globalAlpha=hov?.75:st.ready?.34:.2}
      c.drawImage(buildingSprite(b,t.fi),s.x,s.y,s.w,s.h);c.restore();
      if(ok){const bob=Math.sin(T*4+s.x)*2.5,bx=s.cx,by=s.y-4+bob;ell(c,bx,by,10,10,'#e8b42a','#fff2b0',1.8);text('+',bx,by+6,{size:17,bold:true,align:'center',color:'#3a2200',shadow:false})}
    }
    if(hov)lab={s,b,built,ok};
  }
  // etiquetas de grupo sobre el suelo
  const P=UI.ph,fs=P?14:12,lt=(s0,x0,y0,al='center')=>text(s0,x0,y0,{size:fs,bold:true,align:al,color:'rgba(255,240,200,.85)',outline:1});
  const sh=townSpot('fort1',t),sd=townSpot('dw4',t);
  lt('DEFENSA',200+3*84/2,sh.y-8);const hs=townSpot('hall1',t);lt('AYUNTAMIENTO',hs.cx,hs.y-6);lt('MAGIA Y SERVICIOS',676+7*84/2,sh.y-8);lt('VIVIENDAS Y SUS MEJORAS  (cada mejora, junto a su vivienda)',640,sd.base+(P?15:19));
  if(lab){const{s,b,built,ok}=lab,nm=bTitle(b,t.fi)+(built?'':ok?' · ¡construible!':' (sin construir)'),tw=measure(nm,13,true)+16,ly=s.row?s.y-22:s.base+2;
    rrect(c,s.cx-tw/2,ly,tw,19,5,'rgba(10,6,16,.92)',built||ok?'#e8c25a':'#9a8a6a',1.2);text(nm,s.cx,ly+14,{size:13,bold:true,align:'center',color:built||ok?'#ffe9a0':'#c8b890',shadow:false})}
}
function drawTownBottom(t,h,p,F){
  const c=ctx,P=UI.ph,y0=P?546:568,bh=720-y0-4;
  const ss=P?66:62,gap=4,ax=ss+26,aw=ax+7*(ss+gap)+(P?6:60);
  panel(4,y0,aw,bh,{plain:1,r:8,noshadow:1});
  // fila de guarnición (arriba) y héroe visitante (abajo)
  const gy=y0+(P?10:8),hy=y0+bh-ss-(P?10:8);
  hit(16,gy,ss,ss,null,{tip:['Guarnición de '+t.name,'Las tropas de la guarnición defienden la ciudad']});rrect(c,16,gy,ss,ss,6,lg(c,0,gy,0,gy+ss,[shade(FDEF[t.fi].col[1],-.2),'#1a1420']),'#7a6a48',1.6);c.drawImage(townSprite(t.fi).c,18,gy+ss*.25,ss-4,(ss-4)*.55);
    armyRow(ax,gy,t.gar,ss,gap,{});
  if(h){c.drawImage(portrait(h.fi,h.port,h.cls),16,hy,ss,ss);rrect(c,16,hy,ss,ss,6,null,'#e8c25a',1.8);hit(16,hy,ss,ss,()=>openHeroScreen(h),{tip:[h.name,`Nivel ${h.lvl} ${HERO_CLASS[h.fi][h.cls]}`,'Clic: ver ficha del héroe']});
    armyRow(ax,hy,h.army,ss,gap,{hero:h})}
  else{rrect(c,16,hy,ss,ss,6,'rgba(0,0,0,.35)','#4a3e34',1.4);text('Sin héroe',ax,hy+ss/2+4,{size:fz(13),italic:true,color:'#9a8a70'})}
  if(h&&!P){button(ax+7*(ss+gap)+2,gy+4,54,ss-8,'Todo ↓',()=>townMoveAll(t,h),{size:11,tip:'Pasar la guarnición al héroe'});button(ax+7*(ss+gap)+2,hy+4,54,ss-8,'↑ Dejar',()=>townLeave(t,h),{size:11,tip:'Dejar todas menos la primera unidad en la guarnición'})}
  // botones de acción
  const bx=aw+10;
  const sel=S.pick&&S.pick.arr[S.pick.i];const up=sel&&upgradeCostFor(t,S.pick.arr,S.pick.i);
  if(!P){const bw=170,bw2=bw+6;panel(bx,y0,bw2*2+14,bh,{plain:1,r:8,noshadow:1});
    const B=[['Construir',()=>townHallModal(t),{primary:1,tip:'Menú de construcción: qué construir, coste y requisitos'}],['Reclutar',()=>recruitModal(t,h),{primary:1,tip:'Reclutar criaturas'}],
      ['Taberna',()=>tavernModal(t),{disabled:!t.b.tavern,tip:t.b.tavern?'Contratar héroes (2500 de oro)':'Construye una Taberna'}],['Mercado',()=>marketModal(),{disabled:!t.b.market,tip:t.b.market?null:'Construye un Mercado'}],
      ['Gremio de magos',()=>guildModal(t,h),{disabled:!t.b.mage1,tip:t.b.mage1?null:'Construye un Gremio de magos'}],t.dock?['Astillero',()=>townBoat(t,p),{disabled:!t.b.shipyard,tip:t.b.shipyard?'Comprar barco: 1000 de oro y 10 de madera':'Construye un Astillero'}]:['Resumen',()=>townSummary(t),{tip:'Producción e ingresos de la ciudad'}],
      ['Dividir',()=>townSplit(),{disabled:!sel||sel.n<2,tip:'Divide la pila seleccionada'}],['Mejorar',()=>townUpgrade(t,p),{disabled:!up||!canAfford(p,up.cost),tip:up?`Cuesta ${costText(up.cost)}`:'Selecciona una criatura con mejora disponible'}]];
    B.forEach((q,i)=>button(bx+8+(i%2)*bw2,y0+8+Math.floor(i/2)*((bh-16)/4),bw,(bh-16)/4-4,q[0],q[1],Object.assign({size:14},q[2])));
    buildBadge(bx+8+bw-6,y0+14,buildableCount(t,p));
    // panel de datos de la ciudad
    const ix=bx+bw2*2+22,iw=1276-ix;panel(ix,y0,iw,bh,{plain:1,r:8,noshadow:1});
    text(F.name,ix+iw/2,y0+24,{size:15,bold:true,align:'center',color:'#ffe9a0'});
    text(`Ayuntamiento nivel ${townHalls(t)}`,ix+14,y0+48,{size:12,color:'#d8c8a0'});
    const inc=townIncome(t.b);text(`Ingreso: +${inc} oro/día`,ix+14,y0+68,{size:13,bold:true,color:'#ffe27a'});
    const nb=BUILD_ORDER.filter(b=>t.b[b]).length;text(`Edificios: ${nb}/${BUILD_ORDER.filter(b=>b!=='shipyard'||t.dock).length}`,ix+14,y0+88,{size:12,color:'#d8c8a0'});
    if(h){const st=hstat(h);text(`${h.name} · Nv ${h.lvl}`,ix+14,y0+110,{size:12,bold:true,color:'#ffe9a0'});text(`Ata ${st.a} · Def ${st.d} · Pod ${st.sp} · Con ${st.kn}`,ix+14,y0+127,{size:12,color:'#bfe8ff'})}
    button(ix+10,y0+bh-48,iw-20,38,'Salir de la ciudad',()=>closeTown(),{size:15})}
  else{const bw=316,bh2=(bh-12)/3-4;panel(bx,y0,1276-bx,bh,{plain:1,r:8,noshadow:1});
    const B=[['Construir',()=>townHallModal(t),{primary:1}],['Reclutar',()=>recruitModal(t,h),{primary:1}],
      sel?['Dividir',()=>townSplit(),{disabled:sel.n<2}]:['Taberna',()=>tavernModal(t),{disabled:!t.b.tavern}],sel?['Mejorar',()=>townUpgrade(t,p),{disabled:!up||!canAfford(p,up.cost)}]:['Mercado',()=>marketModal(),{disabled:!t.b.market}],
      ['Más…',()=>townMore(t,h,p),{}],['Salir',()=>closeTown(),{}]];
    B.forEach((q,i)=>button(bx+6+(i%2)*(bw+6),y0+6+Math.floor(i/2)*(bh2+4),bw,bh2,q[0],q[1],Object.assign({size:19},q[2])));
    buildBadge(bx+bw-6,y0+16,buildableCount(t,p))}
}
function townSummary(t){const inc=townIncome(t.b);Dlg.show({title:t.name,w:480,text:`${FDEF[t.fi].name}\nIngreso: +${inc} de oro al día\nEdificios construidos: ${BUILD_ORDER.filter(b=>t.b[b]).length}`,buttons:[{label:'Cerrar',primary:1}]})}
// móvil: acciones menos frecuentes en un diálogo con botones grandes
function townMore(t,h,p){
  Dlg.show({w:640,title:'Más acciones',draw:m=>{const x=320,y=150,w=640,hh=420;panel(x,y,w,hh,{title:'Acciones de la ciudad'});
    const B=[['Taberna',()=>tavernModal(t),!t.b.tavern],['Mercado',()=>marketModal(),!t.b.market],['Gremio de magos',()=>guildModal(t,h),!t.b.mage1],t.dock?['Astillero',()=>townBoat(t,p),!t.b.shipyard]:['Resumen',()=>townSummary(t),false],
      ['Mover todo ↓',()=>townMoveAll(t,h),!h],['↑ Dejar tropas',()=>townLeave(t,h),!h],['Dividir',()=>townSplit(),!(S.pick&&S.pick.arr[S.pick.i]&&S.pick.arr[S.pick.i].n>1)]];
    B.forEach((q,i)=>button(x+20+(i%2)*306,y+40+Math.floor(i/2)*66,294,56,q[0],()=>{Dlg.close();q[1]()},{size:20,disabled:q[2]}));
    button(x+w/2-80,y+hh-64,160,50,'Cerrar',()=>Dlg.close(),{size:20,primary:1})}});
}
// lista de castillos propios (como en el mapa): clic para pasar a otro castillo
function drawTownList(t){
  const c=ctx,ts=ownedTowns(0);if(ts.length<2)return;const P=UI.ph,w=P?64:58,hh=P?42:32;
  rrect(c,8,48,ts.length*(w+4)+8,hh+8,6,'rgba(8,4,14,.6)','#5a4a30',1.2);
  ts.forEach((q,i)=>{const x=12+i*(w+4),y=52,cur=q===t;
    const hov=hit(x,y,w,hh,()=>{if(!cur){const hh2=heroAt(q.x+q.ex,q.y+q.ey);S.town={t:q,h:hh2&&hh2.pid===q.owner?hh2:null};S.pick=null;S.townFx={t:0};sfx('click')}},{tip:[q.name,FDEF[q.fi].name,cur?'Estás aquí':'Clic: ir a este castillo']});
    rrect(c,x,y,w,hh,4,lg(c,0,y,0,y+hh,[hov?'#5a4a30':'#3a2e22','#1a1410']),cur?'#ffe27a':FDEF[q.fi].col[0],cur?2.6:1.4);
    fitImg(c,townSprite(q.fi).c,x+2,y+2,w-4,(w-4)*.5)});
}
// Menú de construcción: lista por categorías con icono, coste, requisitos que faltan (en rojo) y botón Construir
function bBrief(t,b){const L=buildTip(t,b,G.players[0],{ok:1},bCost(b,t.fi));return L.slice(1).filter(l=>!/^(Coste|✖)/.test(l)).join(' · ')}
function townHallModal(t,c0){
  const p=G.players[0],P=UI.ph;let cat=c0||'all',only=false,top=0;
  const ORD=['hall','fort','mage','serv','dw','up'];
  Dlg.show({w:1060,title:'Construcción',draw:m=>{
    const x=110,y=34,w=1060,hh=652,RH=P?72:68,HH=28;
    panel(x,y,w,hh,{title:'Construcción · '+t.name});
    // pestañas de categoría y filtro de construibles
    const all=BUILD_ORDER.filter(b=>b!=='shipyard'||t.dock),sts={};all.forEach(b=>sts[b]=buildStatus(t,b,p));
    const nOk=all.filter(b=>sts[b].ok).length,nReady=all.filter(b=>sts[b].ready).length;
    BCATS.forEach((q,i)=>{const tx=x+16+i*116,on=cat===q[0],cnt=q[0]==='all'?0:all.filter(b=>bCat(b)===q[0]&&sts[b].ready).length;
      button(tx,y+24,112,P?42:38,q[1],()=>{cat=q[0];top=0},{size:fz(13),col:on?'#8a3a1a':'#3a2e44',tip:q[0]==='all'?'Todos los edificios':'Solo: '+BCATN[q[0]]});
      if(cnt)buildBadge(tx+104,y+27,cnt)});
    button(x+w-196,y+24,180,P?42:38,(only?'☑ ':'☐ ')+`Construibles (${nReady})`,()=>{only=!only;top=0},{size:fz(13),col:only?'#2a6a3a':'#3a2e44',tip:'Mostrar solo lo que ya cumple los requisitos y tiene recursos'});
    // aviso del día
    if(t.builtToday)text('Hoy ya has construido aquí: solo se permite un edificio por día. Vuelve mañana.',x+w/2,y+74+(P?4:0)+9,{size:fz(13),bold:true,align:'center',color:'#ffb060'});
    else text(`Un edificio por día. ${nOk} se pueden construir ahora${t.lastBuilt&&t.b[t.lastBuilt]?' · Último construido: '+bTitle(t.lastBuilt,t.fi):''}`,x+w/2,y+74+(P?4:0)+9,{size:fz(13),align:'center',color:'#c8b890'});
    // elementos visibles (con cabeceras de grupo)
    const items=[];let last=null;
    all.filter(b=>(cat==='all'||bCat(b)===cat)&&(!only||sts[b].ready)).sort((a,b)=>ORD.indexOf(bCat(a))-ORD.indexOf(bCat(b))).forEach(b=>{const c0=bCat(b);if(cat==='all'&&c0!==last){items.push({hdr:c0});last=c0}items.push({b})});
    const ly=y+(P?104:100),ley=y+hh-58,vh=ley-ly;
    // cuántos caben desde 'top'
    const fits=s0=>{let h=0,n=0;for(let i=s0;i<items.length;i++){const ih=items[i].hdr?HH:RH;if(h+ih>vh)break;h+=ih;n++}return n};
    if(UI.wheel&&hovered(x,ly,w,vh))top+=UI.wheel*2;
    // mt: mayor desplazamiento útil (hasta ver el final de la lista)
    let mt=0;while(mt<items.length&&mt+fits(mt)<items.length)mt++;
    top=clamp(top,0,mt);
    const n=fits(top);let cy=ly;
    if(!items.length)text(only?'Nada cumple ahora los requisitos. Quita el filtro para ver qué falta.':'Sin edificios en esta categoría.',x+w/2,ly+60,{size:fz(15),align:'center',color:'#c8b890',italic:true});
    for(let i=top;i<top+n;i++){const it=items[i];
      if(it.hdr){text(BCATN[it.hdr].toUpperCase(),x+22,cy+20,{size:fz(13),bold:true,color:'#e8c25a'});ctx.fillStyle='rgba(232,194,90,.4)';ctx.fillRect(x+22+measure(BCATN[it.hdr].toUpperCase(),fz(13),true)+10,cy+15,w-100-measure(BCATN[it.hdr].toUpperCase(),fz(13),true),1.4);cy+=HH;continue}
      const b=it.b,st=sts[b],rw=w-70,rx=x+16,ry=cy+2,rh=RH-5;
      const hovR=hit(rx,ry,rw,rh,st.built?()=>{Dlg.close();buildDialog(t,b)}:null,{tip:st.built?'Clic: usar este edificio':buildTip(t,b,p,{ok:st.ok},st.cost)});
      rrect(ctx,rx,ry,rw,rh,8,lg(ctx,0,ry,0,ry+rh,[st.built?'#2e4a2a':st.ok?'#4e3c2a':'#2c2428','#18121a']),st.built?'#7ac060':st.ok?(hovR?'#fff0b0':'#e8c25a'):'#5a4a38',st.ok?2.2:1.4);
      if(st.ok){ctx.save();ctx.globalAlpha=.12+.08*Math.sin(S.clock*4);rrect(ctx,rx,ry,rw,rh,8,'#ffe27a');ctx.restore()}
      ctx.save();ctx.beginPath();ctx.rect(rx+4,ry+3,76,rh-6);ctx.clip();if(!st.built&&!st.ready)ctx.globalAlpha=.5;ctx.drawImage(buildingSprite(b,t.fi),rx+2,ry+rh-70,78,70);ctx.restore();
      const nm=bTitle(b,t.fi);text(nm,rx+90,ry+22,{size:fz(16),bold:true,color:st.built?'#c8ffb0':st.ready?'#ffe9a0':'#d8c8b0'});
      const br=bBrief(t,b);text(wrap(br,430,fz(12))[0]||'',rx+90,ry+40,{size:fz(12),color:'#b8a888'});
      if(st.built){text('✔ Construido'+(t.lastBuilt===b?' (el último)':''),rx+90,ry+rh-8,{size:fz(13),bold:true,color:'#8ae070'})}
      else{costChips(rx+90,ry+rh-8,st.cost,st.low,18,fz(13));
        const rl=st.miss.filter(q=>!q.res);
        rl.slice(0,2).forEach((q,k)=>text('✖ '+q.txt,rx+560,ry+22+k*18,{size:fz(12),bold:true,color:'#ff7a68'}));
        const lw=st.miss.filter(q=>q.res);if(lw.length&&rl.length<2)text('✖ '+(lw.length>1?`Faltan recursos (${lw.length})`:lw[0].txt),rx+560,ry+22+rl.length*18,{size:fz(12),bold:true,color:'#ff7a68'});
        if(!st.miss.length&&st.day)text('Disponible mañana',rx+560,ry+22,{size:fz(12),bold:true,color:'#ffb060'});
        if(st.ok)text('¡Listo para construir!',rx+560,ry+22,{size:fz(12),bold:true,color:'#9aff9a'})}
      if(!st.built)button(rx+rw-146,ry+(rh-(P?50:46))/2,138,P?50:46,'Construir',()=>{if(doBuild(t,b))Dlg.close()},{size:fz(15),primary:1,disabled:!st.ok,tip:st.ok?'Construir por '+costText(st.cost):st.day?'Ya has construido hoy en esta ciudad':st.miss.map(q=>q.txt)});
      cy+=RH}
    // indicador de desplazamiento y botones ▲▼
    const sx=x+w-48;
    if(mt>0){button(sx,ly,34,40,'▲',()=>{top=Math.max(0,top-1)},{size:15,disabled:top<=0});button(sx,ley-40,34,40,'▼',()=>{top=Math.min(mt,top+1)},{size:15,disabled:top>=mt});
      const th=ley-ly-96,ty0=ly+48;rrect(ctx,sx+13,ty0,8,th,4,'rgba(0,0,0,.5)','#5a4a30',1);const kh=Math.max(24,th*n/Math.max(1,items.length));rrect(ctx,sx+12,ty0+(th-kh)*top/mt,10,kh,4,'#c8a24a')}
    // pie: recursos, ingreso y cerrar
    let px=x+22;for(const r of RES){ctx.drawImage(resIcon(r,24),px,y+hh-46,24,24);text(String(p.res[r]),px+27,y+hh-28,{size:fz(13),bold:true});px+=P?88:84}
    text(`+${townIncome(t.b)} oro/día`,x+w-190,y+hh-26,{size:fz(14),bold:true,align:'right',color:'#ffe27a'});
    button(x+w-170,y+hh-52,150,P?44:40,'Cerrar',()=>Dlg.close(),{size:fz(15),primary:1});
  }});
}
function buildTip(t,b,p,cb,cost){const L=[bTitle(b,t.fi)];let m;
  if(m=/^dw(\d)$/.exec(b)){const cr=CR[FDEF[t.fi].units[+m[1]-1]];const ex=dwellExtra(t,+m[1]);L.push(`Cría: ${cr.name} (${cr.grow}${ex?' +'+ex+' de moradas conquistadas':''}/semana)`,`Atq ${cr.atk} · Def ${cr.def} · Vida ${cr.hp} · Daño ${cr.mn}-${cr.mx}`)}
  else if(m=/^up(\d)$/.exec(b)){const cr=CR[FDEF[t.fi].units[+m[1]-1+7]];L.push(`Mejora a: ${cr.name}`,`Atq ${cr.atk} · Def ${cr.def} · Vida ${cr.hp}`)}
  else L.push({shipyard:'Permite comprar barcos (1000 de oro y 10 de madera) para navegar',hall1:`Ingreso de ${HALL_INC[0]} oro/día`,hall2:`Ingreso de ${HALL_INC[1]} oro/día`,hall3:`Ingreso de ${HALL_INC[2]} oro/día`,hall4:`Ingreso de ${HALL_INC[3]} oro/día (solo uno por jugador)`,fort1:'Defensa de la ciudad',fort2:'+50% de crecimiento semanal',fort3:'+100% de crecimiento semanal',tavern:'Permite contratar héroes',market:'Permite comerciar recursos',mage1:'Hechizos de nivel 1',mage2:'Hechizos de nivel 2',mage3:'Hechizos de nivel 3',mage4:'Hechizos de nivel 4'}[b]||'');
  if(!t.b[b]){const st=buildStatus(t,b,p);L.push('Coste: '+costText(cost));st.miss.forEach(q=>L.push('✖ '+q.txt));if(st.day&&!st.miss.length)L.push('✖ Solo una construcción por día')}return L}
// ficha de un edificio: si ya existe se usa; si no, muestra descripción, requisitos y el botón Construir
function buildDialog(t,b){
  const p=G.players[0];
  if(t.b[b]){if(/^dw/.test(b))recruitModal(t,S.town.h);else if(b==='tavern')tavernModal(t);else if(b==='market')marketModal();else if(b==='shipyard'){const e=buyBoat(t,p);if(e)toast(e,'bad');else{sfx('build');toast('Barco amarrado en el muelle','good')}}else if(/^mage/.test(b))guildModal(t,S.town.h);else Dlg.show({title:bTitle(b,t.fi),w:480,text:buildTip(t,b,p,{ok:1},bCost(b,t.fi)).slice(1).join('\n'),buttons:[{label:'Cerrar',primary:1}]});return}
  Dlg.show({w:640,title:bTitle(b,t.fi),draw:m=>{
    const st=buildStatus(t,b,p),x=320,y=120,w=640,hh=P0()?470:450;
    panel(x,y,w,hh,{title:bTitle(b,t.fi)});
    rrect(ctx,x+22,y+38,176,160,8,lg(ctx,0,y+38,0,y+198,[SKY[t.fi][1],'#1a1420']),'#c8a24a',1.6);ctx.drawImage(buildingSprite(b,t.fi),x+28,y+44,164,148);
    const L=buildTip(t,b,p,{ok:1},st.cost).slice(1).filter(l=>!/^(Coste|✖)/.test(l));
    let ty=y+62;L.forEach(l=>{ty+=paragraph(l,x+216,ty,w-240,{size:fz(14),color:'#e8dcc0'})+4});
    text('Coste',x+216,y+158,{size:fz(13),bold:true,color:'#e8c25a'});costChips(x+216,y+184,st.cost,st.low,22,fz(15));
    text('Requisitos',x+22,y+232,{size:fz(14),bold:true,color:'#e8c25a'});
    const reqs=bReq(b,t),rows=[...reqs.map(r=>({ok:!!t.b[r],txt:bTitle(r,t.fi)})),...(b==='hall4'?[{ok:!ownedTowns(p.id).some(q=>q.b.hall4),txt:'Un solo Capitolio por jugador'}]:[]),{ok:!Object.keys(st.low).length,txt:Object.keys(st.low).length?st.miss.filter(q=>q.res).map(q=>q.txt).join(' · '):'Recursos suficientes'},{ok:!t.builtToday,txt:t.builtToday?'Hoy ya has construido aquí (vuelve mañana)':'Una construcción por día: disponible'}];
    rows.forEach((r,i)=>text((r.ok?'✔ ':'✖ ')+r.txt,x+30,y+258+i*26,{size:fz(14),bold:true,color:r.ok?'#9aff9a':'#ff7a68'}));
    button(x+w/2-170,y+hh-62,200,P0()?52:48,'Construir',()=>{if(doBuild(t,b))Dlg.close()},{size:fz(17),primary:1,disabled:!st.ok});
    button(x+w/2+50,y+hh-62,120,P0()?52:48,'Cerrar',()=>Dlg.close(),{size:fz(16)});
  }});
}
const P0=()=>!!UI.ph;
// ---------- reclutamiento ----------
function recruitModal(t,h){
  const p=G.players[0];S.rq={};
  Dlg.show({w:900,title:'Reclutar criaturas',draw:m=>{
    const x=190,y=90,w=900,hh=520;panel(x-0,y,w,hh,{title:'Reclutar criaturas · '+t.name});
    text('Cada semana crece la población disponible. Las criaturas se unen al héroe visitante (si hay espacio) o a la guarnición.',x+w/2,y+44,{size:13,align:'center',color:'#c8b890'});
    for(let tier=1;tier<=7;tier++){
      const built=t.b['dw'+tier];const id=townUnit(t,tier),cr=CR[id];const col=(tier-1)%4,row=Math.floor((tier-1)/4);const cx=x+20+col*215,cy=y+64+row*210;
      rrect(ctx,cx,cy,205,200,8,lg(ctx,0,cy,0,cy+200,['#3a2e3a','#1a1420']),built?'#c8a24a':'#4a3e34',1.6);
      ctx.save();ctx.beginPath();ctx.rect(cx+2,cy+2,201,196);ctx.clip();if(!built)ctx.globalAlpha=.3;ctx.drawImage(creatureSprite(id,false),cx+25,cy+8,150,150);ctx.restore();
      text(cr.name,cx+102,cy+22,{size:13,bold:true,align:'center',color:'#ffe9a0',base:'alphabetic'});
      if(!built){text('No construido',cx+102,cy+110,{size:14,align:'center',color:'#9a8a70'});continue}
      const av=t.avail[tier-1];text(`Disponible: ${av}`,cx+8,cy+146,{size:13,bold:true,color:av?'#c8ffb0':'#e08070'});
      text(`A${cr.atk} D${cr.def} ${cr.mn}-${cr.mx} PV${cr.hp} V${cr.spd}`,cx+102,cy+161,{size:11,align:'center',color:'#d8c8a0'});
      hit(cx,cy,205,150,null,{tip:[cr.name,`Ataque ${cr.atk} · Defensa ${cr.def}`,`Daño ${cr.mn}-${cr.mx} · Vida ${cr.hp} · Velocidad ${cr.spd}`,abilText(cr),`Coste: ${costText(cr.cost)}`,'Clic derecho: ficha'],right:()=>creatureInfo(id,0)});
      const q=S.rq[tier]||0,mx=Math.min(av,maxRecruit(p,id,av));
      button(cx+6,cy+170,28,24,'−',()=>{S.rq[tier]=Math.max(0,q-Math.max(1,Math.ceil(mx/10)))},{size:16,disabled:!q});
      text(String(q),cx+62,cy+187,{size:15,bold:true,align:'center'});
      button(cx+90,cy+170,28,24,'+',()=>{S.rq[tier]=Math.min(mx,q+Math.max(1,Math.ceil(mx/10)))},{size:16,disabled:q>=mx});
      button(cx+122,cy+170,34,24,'Máx',()=>{S.rq[tier]=mx},{size:11,disabled:!mx});
      button(cx+160,cy+170,40,24,'OK',()=>{const n=recruit(t,tier,q,p,h);if(n){sfx('recruit');toast(`${n} × ${cr.name}`,'good');FX.burst(cx+102+0,cy+100,14,['#ffe27a','#fff'],{spd:120,life:.7})}S.rq[tier]=0},{size:12,primary:1,disabled:!q,tip:q?`Coste: ${costText(cr.cost,q)}`:null});
    }
    // resumen de recursos
    let rx=x+30;for(const r of RES){ctx.drawImage(resIcon(r,22),rx,y+hh-34,22,22);text(String(p.res[r]),rx+24,y+hh-17,{size:13,bold:true});rx+=82}
    button(x+w-250,y+hh-44,110,32,'Reclutar todo',()=>{for(let tr=7;tr>=1;tr--){if(t.b['dw'+tr]){const n=maxRecruit(p,townUnit(t,tr),t.avail[tr-1]);if(n)recruit(t,tr,n,p,h)}}sfx('recruit')},{size:12,primary:1});
    button(x+w-130,y+hh-44,110,32,'Cerrar',()=>Dlg.close(),{size:14});
  }});
}
function dwellModal(o,h,cb){
  const p=G.players[h.pid],cr=CR[o.cr];let q=0;
  Dlg.show({w:520,title:objName(o),draw:m=>{
    const x=380,y=130,w=520,hh=440;panel(x,y,w,hh,{title:objName(o)});
    ctx.drawImage(creatureSprite(o.cr,false),x+w/2-85,y+36,170,170);
    text(`Disponibles: ${o.n}`,x+w/2,y+226,{size:18,bold:true,align:'center',color:'#c8ffb0'});
    text(`Ataque ${cr.atk} · Defensa ${cr.def} · Daño ${cr.mn}-${cr.mx} · Vida ${cr.hp} · Vel. ${cr.spd}`,x+w/2,y+250,{size:14,align:'center'});text(abilText(cr),x+w/2,y+270,{size:13,align:'center',color:'#d8c8a0'});
    text(`Coste por unidad: ${costText(cr.cost)}`,x+w/2,y+296,{size:14,align:'center',color:'#ffe27a'});
    const mx=Math.min(o.n,maxRecruit(p,o.cr,o.n));
    button(x+60,y+320,40,34,'−',()=>{q=Math.max(0,q-Math.max(1,Math.ceil(mx/10)))},{size:20,disabled:!q});text(String(q),x+w/2,y+345,{size:22,bold:true,align:'center'});button(x+w-100,y+320,40,34,'+',()=>{q=Math.min(mx,q+Math.max(1,Math.ceil(mx/10)))},{size:20,disabled:q>=mx});
    button(x+w/2-130,y+380,120,38,'Reclutar',()=>{if(q>0&&addToArmy(h.army,o.cr,q)){spend(p,recruitCost(o.cr,q));o.n-=q;sfx('recruit');toast(`${q} × ${cr.name} se unen a ${h.name}`,'good');q=0}else if(q>0)toast('El ejército está completo','bad')},{primary:1,disabled:!q,size:15});
    button(x+w/2+10,y+380,120,38,'Salir',()=>{Dlg.close();cb&&cb()},{size:15});
  }});
}
// ---------- taberna / gremio / mercado ----------
function tavernModal(t){
  const p=G.players[0];
  Dlg.show({w:980,title:'Taberna',draw:m=>{const x=150,y=120,w=980,hh=470;panel(x,y,w,hh,{title:'Taberna de '+t.name});
    text(`Campeones únicos disponibles (${HIRE_COST} de oro) · cambian cada semana · héroes ${p.heroes.length}/8`,x+w/2,y+46,{size:14,align:'center',color:'#c8b890'});
    p.pool.slice(0,4).forEach((o,i)=>{const cx=x+136+i*236,cy=y+62,CW=224;rrect(ctx,cx,cy,CW,340,8,lg(ctx,0,cy,0,cy+340,['#3a2e3a','#1a1420']),'#c8a24a',1.6);
      const hh2=o.hero;const fi=hh2?hh2.fi:o.fi,cls=hh2?hh2.cls:o.cls,ni=hh2?hh2.port:o.ni;ctx.drawImage(portrait(fi,ni,cls),cx+60,cy+10,104,104);
      const nm=hh2?hh2.name:HERO_NAMES[fi][ni];text(nm,cx+CW/2,cy+136,{size:18,bold:true,align:'center',color:'#ffe9a0'});text(HERO_CLASS[fi][cls]+(hh2?` · Nv ${hh2.lvl}`:''),cx+CW/2,cy+154,{size:12,align:'center'});text(FDEF[fi].name,cx+CW/2,cy+171,{size:11,align:'center',color:'#c8b890'});
      const sks=hh2?Object.entries(hh2.skills):o.sk;
      sks.slice(0,3).forEach(([k,lv],q)=>{const sy=cy+182+q*30;rrect(ctx,cx+12,sy,CW-24,26,5,'rgba(40,30,44,.85)','#7a6a48',1);text(SKILLS[k].n,cx+20,sy+17,{size:12,bold:true});for(let z=0;z<3;z++){ctx.fillStyle=z<lv?'#ffd24a':'#4a4030';ctx.beginPath();ctx.arc(cx+CW-60+z*14,sy+13,4.2,0,6.28);ctx.fill();ctx.strokeStyle='#000';ctx.lineWidth=1;ctx.stroke()}hit(cx+12,sy,CW-24,26,null,{tip:[SKILLS[k].n+' — '+['Básico','Avanzado','Experto'][lv-1],SKILLS[k].d[lv-1]]})});
      const u=FDEF[fi].units;text(hh2?'Sin tropas (se retira)':`Tropas: ${o.n1} ${CR[u[0]].name} · ${o.n2} ${CR[u[1]].name}`,cx+CW/2,cy+282,{size:10,align:'center',color:'#d8c8a0'});
      text(specText(hh2||{spec:o.spec,lvl:1}).slice(0,38),cx+CW/2,cy+298,{size:10,align:'center',italic:true,color:'#bfe8ff'});
      button(cx+32,cy+304,160,30,'Contratar',()=>{const e=heroAt(t.x+t.ex,t.y+t.ey);if(e){toast('La entrada de la ciudad está ocupada','bad');return}const hr=hireHero(p,t,i);if(hr){sfx('recruit');toast(`${hr.name} se une a tu causa`,'good');S.town.h=hr;Dlg.close()}},{primary:1,size:14,disabled:p.res.gold<HIRE_COST||p.heroes.length>=8,tip:p.heroes.length>=8?'Máximo 8 héroes':null})});
    button(x+w/2-60,y+hh-52,120,34,'Cerrar',()=>Dlg.close())}});
}
function guildModal(t,h){
  const gl=t.b.mage4?4:t.b.mage3?3:t.b.mage2?2:1;
  Dlg.show({w:620,title:'Gremio de magos',draw:m=>{const x=330,y=140,w=620,hh=420;panel(x,y,w,hh,{title:`Gremio de magos (nivel ${gl})`});
    text('Hechizos del gremio — los héroes que visitan la ciudad los aprenden',x+w/2,y+46,{size:13,align:'center',color:'#c8b890'});
    t.spells.forEach((s,i)=>{const S2=SPELLS[s],cx=x+24+(i%2)*292,cy=y+64+Math.floor(i/2)*44;const ok=S2.lv<=gl,known=h&&h.spells.includes(s);
      rrect(ctx,cx,cy,280,38,6,ok?'rgba(60,50,80,.7)':'rgba(30,24,34,.7)',ok?'#8a7ac0':'#3a3040',1.3);text(`${S2.n}`,cx+10,cy+17,{size:14,bold:true,color:ok?'#e8e0ff':'#6a6070'});text(`Nivel ${S2.lv} · ${S2.cost} maná${known?' · conocido':''}`,cx+10,cy+32,{size:11,color:known?'#9aff9a':'#a898c8'});hit(cx,cy,280,38,null,{tip:[S2.n,S2.d]})});
    button(x+w/2-60,y+hh-48,120,34,'Cerrar',()=>Dlg.close())}});
}
function marketModal(){
  const p=G.players[0];let give='gold',get='wood',q=1;
  Dlg.show({w:640,title:'Mercado',draw:m=>{const x=320,y=130,w=640,hh=460;panel(x,y,w,hh,{title:'Mercado'});
    text(`Intercambia recursos · ${marketCount(0)} mercado${marketCount(0)===1?'':'s'} → se pierde un ${Math.round((1-marketEff(0))*100)}% en cada trato`,x+w/2,y+46,{size:13,align:'center',color:'#c8b890'});text('Cada mercado extra abarata el comercio un 3% más (máximo 95% de eficiencia)',x+w/2,y+62,{size:11,align:'center',italic:true,color:'#9a8a70'});
    text('Entregas:',x+30,y+78,{size:14,bold:true,color:'#ffe9a0'});text('Recibes:',x+30,y+170,{size:14,bold:true,color:'#ffe9a0'});
    RES.forEach((r,i)=>{const bx=x+30+i*84;const s1=give===r,s2=get===r;
      rrect(ctx,bx,y+86,76,64,6,'rgba(40,30,44,.9)',s1?'#ffe27a':'#6a5a40',s1?3:1.3);ctx.drawImage(resIcon(r,36),bx+20,y+90,36,36);text(String(p.res[r]),bx+38,y+143,{size:13,bold:true,align:'center'});hit(bx,y+86,76,64,()=>{give=r;if(get===r)get=RES.find(z=>z!==r)},{tip:RESN[r]});
      rrect(ctx,bx,y+178,76,64,6,'rgba(40,30,44,.9)',s2?'#7ae0ff':'#6a5a40',s2?3:1.3);ctx.drawImage(resIcon(r,36),bx+20,y+182,36,36);text(RESN[r],bx+38,y+235,{size:12,align:'center'});hit(bx,y+178,76,64,()=>{get=r;if(give===r)give=RES.find(z=>z!==r)},{tip:RESN[r]})});
    // cálculo: q = unidades que se reciben
    const eff=marketEff(0),rate=RV[give]/RV[get]*eff;const cost=Math.ceil(q/rate);const mxGet=Math.floor(p.res[give]*rate);
    text(`Quieres recibir:  ${q}  ${RESN[get]}`,x+w/2,y+292,{size:20,bold:true,align:'center'});text(`Costará:  ${cost}  ${RESN[give]}`,x+w/2,y+322,{size:17,align:'center',color:p.res[give]>=cost?'#ffe27a':'#e08070'});
    button(x+w/2-130,y+338,50,32,'−',()=>{q=Math.max(1,q-(q>20?10:1))},{size:18});button(x+w/2-70,y+338,50,32,'+',()=>{q=q+(q>=20?10:1)},{size:18});button(x+w/2-10,y+338,80,32,'Máx',()=>{q=Math.max(1,mxGet)},{size:13});
    button(x+w/2+80,y+338,60,32,'×10',()=>{q=q*10},{size:13});
    button(x+w/2-130,y+390,150,38,'Comerciar',()=>{if(p.res[give]>=cost&&q>0){p.res[give]-=cost;p.res[get]+=q;sfx('coin');toast(`+${q} ${RESN[get]}`,'good')}},{primary:1,disabled:p.res[give]<cost||give===get});
    button(x+w/2+30,y+390,100,38,'Cerrar',()=>Dlg.close())}});
}
// ---------- información ----------
function creatureInfo(id,n){
  const cr=CR[id];
  Dlg.show({w:520,title:cr.name,draw:m=>{const x=380,y=150,w=520,hh=420;panel(x,y,w,hh,{title:cr.name+(cr.up?' ★':'')});
    rrect(ctx,x+20,y+40,200,200,8,lg(ctx,0,y+40,0,y+240,[F2(cr),'#1a1420']),'#c8a24a',1.5);ctx.drawImage(creatureSprite(id,false),x+10,y+40,220,220);
    const lines=[['Ataque',cr.atk],['Defensa',cr.def],['Daño',`${cr.mn}-${cr.mx}`],['Vida',cr.hp],['Velocidad',cr.spd],['Disparos',cr.shoot?cr.shots:'—'],['Crecimiento',cr.grow+'/semana'],['Valor de combate',cr.val]];
    lines.forEach((l,i)=>{text(l[0],x+245,y+66+i*26,{size:15,color:'#c8b890'});text(String(l[1]),x+w-30,y+66+i*26,{size:15,bold:true,align:'right'})});
    text(abilText(cr),x+w/2,y+282,{size:14,align:'center',color:'#ffe9a0'});
    if(n)text(`Cantidad: ${sizeLabel(n)} (${sizeRange(n)})`,x+w/2,y+310,{size:15,align:'center'});
    text(`Coste: ${costText(cr.cost)}`,x+w/2,y+336,{size:13,align:'center',color:'#ffe27a'});
    button(x+w/2-55,y+hh-50,110,34,'Cerrar',()=>Dlg.close())}});
}
const F2=cr=>cr.f>=0?shade(FDEF[cr.f].col[1],-.3):'#4a4040';
function inspect(tx,ty){
  const m=G.map,vis=isVis(tx,ty);const h=vis?heroAt(tx,ty):null;if(h)return openHeroScreen(h,true);
  const fp=m.fp[ty*m.w+tx];const o=fp?m.objs[fp-1]:null;if(!o||o.dead||(!vis&&!isExpl(tx,ty)))return;
  if(o.t==='mon'&&vis)return creatureInfo(o.cr,o.n);
  if(o.t==='town'){const gp=armyPower(o.gar);Dlg.show({title:o.name,w:480,text:`${FDEF[o.fi].name}\n${o.owner>=0?'Propietario: '+G.players[o.owner].name:'Ciudad neutral'}\n${FDEF[o.fi].desc}`+(o.owner!==0&&vis?`\nGuarnición: ${o.gar.filter(s=>s).map(s=>sizeLabel(s.n)+' '+CR[s.id].name).join(', ')||'vacía'}`:''),buttons:[{label:'Cerrar'}]});return}
  if(o.t==='dwell'){creatureInfo(o.cr,o.n);return}
  Dlg.show({title:objName(o),w:420,text:{mine:`Produce ${RESN[o.res]} cada día. ${o.owner>=0?'Propietario: '+G.players[o.owner].name:'Sin dueño.'}`,site:{shrine:'Enseña un hechizo al héroe que la visita.',hut:'Enseña una habilidad secundaria.',well:'Restaura el maná del héroe.',stone:'Otorga 1000 de experiencia (una vez por héroe).',stable:'Da movimiento extra durante la semana.',mill:'Da oro y recursos cada semana.',shop:'Vende artefactos por oro.'}[o.k]||'',gate:'Une la superficie con el subsuelo.',mono:'Transporta al héroe a su monolito gemelo.',boat:'Sube a bordo para navegar por el mar.',res:'Recursos para recoger.',chest:'Oro o experiencia.',art:ART[o.art]?`${ART[o.art].n}: ${artText(o.art)}`:''}[o.t]||'',buttons:[{label:'Cerrar'}]});
}
// ---------- ficha de héroe ----------
const EQPOS={helm:[139,4],neck:[80,62],cloak:[198,62],weapon:[14,124],armor:[139,124],shield:[264,124],gloves:[14,196],ring1:[80,196],ring2:[198,196],boots:[139,200],misc1:[14,296],misc2:[94,296],misc3:[174,296],misc4:[254,296]};
const EQSLOT={helm:'helm',neck:'neck',cloak:'cloak',weapon:'weapon',armor:'armor',shield:'shield',gloves:'gloves',ring1:'ring',ring2:'ring',boots:'boots',misc1:'misc',misc2:'misc',misc3:'misc',misc4:'misc'};
function artTip(id){const a=ART[id];const L=[a.n,`${SLOTN[a.slot]} · ${['','Tesoro','Menor','Mayor','Reliquia','Conjunto','Fusión'][a.v]||''}`,...Object.keys(a.b).map(k=>`${BNAMES[k]||k}: ${k==='pf'?'sí':(a.b[k]>0?'+':'')+a.b[k]}`)];if(a.set){const S2=ARTSET[a.set];L.push(`Conjunto: ${S2.n} (${S2.pieces.length} piezas)`)}if(a.lin)L.push(`Linaje ${LIN[a.lin].short}: arma+escudo+yelmo+anillo = fusión`);if(a.fusion)L.push('Ocupa Arma, Escudo, Yelmo y Anillo');return L}
// ---- piezas de la ficha del héroe (se componen en escritorio o por pestañas en móvil) ----
function heroHead(h,x,y,w,P){
  const p=G.players[h.pid],S0=P?150:120;
  ctx.drawImage(portrait(h.fi,h.port,h.cls),x,y,S0,S0);rrect(ctx,x,y,S0,S0,4,null,'#c8a24a',2.4);
  const tx=x+S0+14,bw=w-S0-14;
  text(`Nivel ${h.lvl}`,tx,y+(P?26:20),{size:P?26:20,bold:true,color:'#ffe9a0'});text(p.name,tx,y+(P?50:40),{size:fz(13),color:p.col,bold:true});
  const nx=xpForLevel(h.lvl+1),cur=xpForLevel(h.lvl),bh=P?20:13,gp=P?30:20,by=y+(P?62:50);
  const B=[[(h.xp-cur)/(nx-cur),'#b87aff','#6a3aa0',`${h.xp}/${nx} exp.`],[h.mana/Math.max(1,maxMana(h)),'#6aa0ff','#2a5ac0',`Maná ${Math.floor(h.mana)}/${maxMana(h)}`],[h.mp/Math.max(1,maxMP(h)),'#5ad87a','#2a8a4a',`Mov. ${Math.round(h.mp)}/${maxMP(h)}${h.boat?' (barco)':''}`]];
  B.forEach((q,i)=>{bar(tx,by+i*gp,bw,bh,q[0],q[1],q[2]);text(q[3],tx+bw/2,by+i*gp+bh-(P?5:2),{size:P?13:10,bold:true,align:'center',shadow:false})});
  return S0}
function heroStats(h,x,y,w,hh){
  const st=hstat(h),g=6,tw=(w-g*3)/4;
  [['Ataque',st.a,h.a],['Defensa',st.d,h.d],['Poder',st.sp,h.sp],['Conocim.',st.kn,h.kn]].forEach((q,i)=>{const sx=x+i*(tw+g);rrect(ctx,sx,y,tw,hh,6,'rgba(40,30,44,.85)','#7a6a48',1.3);text(q[0],sx+tw/2,y+hh*.3,{size:fz(11),align:'center',color:'#c8b890'});text(String(q[1])+(q[1]>q[2]?` (+${q[1]-q[2]})`:''),sx+tw/2,y+hh*.8,{size:hh>70?30:24,bold:true,align:'center',color:q[1]>q[2]?'#9aff9a':'#fff'})});
  text(`Moral ${st.lead>=0?'+':''}${st.lead} · Suerte ${st.luck>=0?'+':''}${st.luck} · Visión ${heroVis(h)}`,x,y+hh+20,{size:fz(12),color:'#d8c8a0'});
}
function heroSkills(h,x,y,cols,cw,ch,P){
  const sks=Object.keys(h.skills);
  sks.forEach((k,i)=>{const lv=h.skills[k],cx=x+(i%cols)*(cw+6),cy=y+Math.floor(i/cols)*(ch+6);rrect(ctx,cx,cy,cw,ch,6,'rgba(40,30,44,.85)','#7a6a48',1.2);
    text(SKILLS[k].n,cx+8,cy+ch*.42,{size:fz(12),bold:true});for(let q=0;q<3;q++){ctx.fillStyle=q<lv?'#ffd24a':'#4a4030';ctx.beginPath();ctx.arc(cx+14+q*(P?18:14),cy+ch*.78,P?5.4:4.4,0,6.28);ctx.fill();ctx.strokeStyle='#000';ctx.lineWidth=1;ctx.stroke()}
    text(['Básico','Avanzado','Experto'][lv-1],cx+cw-6,cy+ch*.84,{size:fz(10),align:'right',color:'#ffe27a'});hit(cx,cy,cw,ch,null,{tip:[SKILLS[k].n+' — '+['Básico','Avanzado','Experto'][lv-1],SKILLS[k].d[lv-1]]})});
  if(!sks.length)text('Sin habilidades secundarias',x,y+16,{size:fz(12),italic:true,color:'#9a8a70'});
}
function heroDoll(h,ex,ey,q,mine){
  rrect(ctx,ex-8,ey-8,356*q+16,372*q,8,'rgba(18,12,24,.55)','rgba(200,162,74,.4)',1.2);
  ctx.save();ctx.globalAlpha=.1;ctx.drawImage(portrait(h.fi,h.port,h.cls),ex+60*q,ey+130*q,220*q,220*q);ctx.restore();
  for(const k of EQKEYS){const[ox,oy]=EQPOS[k],sx=ex+ox*q,sy=ey+oy*q,sz=52*q,id0=h.eq[k],blk=id0&&id0.charCodeAt(0)===35,id=blk?id0.slice(1):id0;
    const hov=hit(sx,sy,sz,sz,mine&&id?()=>{if(unequip(h,k))sfx('click');else toast('Mochila llena','bad')}:null,{tip:id?[...artTip(id),mine?'Clic: guardar en la mochila':'']:SLOTN[EQSLOT[k]]});
    rrect(ctx,sx,sy,sz,sz,6,lg(ctx,0,sy,0,sy+sz,['#3a3044','#1a1420']),id?TIERCOL[ART[id].v]:hov?'#c8b890':'#6a5a3e',id?2.2:1.4);
    if(id){if(blk)ctx.globalAlpha=.35;ctx.drawImage(artIcon(id),sx+4,sy+4,sz-8,sz-8);ctx.globalAlpha=1;if(blk){ctx.fillStyle='rgba(255,170,60,.9)';ctx.font='bold 11px sans-serif';ctx.textAlign='center';ctx.fillText('FUSIÓN',sx+sz/2,sy+sz/2+4);ctx.textAlign='left'}}else ctx.drawImage(slotGlyph(EQSLOT[k]),sx+4,sy+4,sz-8,sz-8)}
}
function heroPack(h,ex,ey,q,mine,cols=7){
  const sz=46*q;
  for(let i=0;i<14;i++){const sx=ex+(i%cols)*(sz+4),sy=ey+Math.floor(i/cols)*(sz+4),id=h.pack[i];
    hit(sx,sy,sz,sz,mine&&id?()=>{const keys=SLOTKEYS[ART[id].slot];const k=keys.find(z=>!h.eq[z])||keys[0];if(equipFromPack(h,i,k))sfx('level')}:null,{tip:id?[...artTip(id),mine?'Clic: equipar':'']:'Mochila'});
    rrect(ctx,sx,sy,sz,sz,5,'rgba(30,24,36,.9)',id?TIERCOL[ART[id].v]:'#4a3e34',id?2:1.2);if(id)ctx.drawImage(artIcon(id),sx+1,sy+1,sz-2,sz-2)}
}
function heroSpells(h,x,y,cols,cw,ch,maxY){
  h.spells.slice().sort((a,b)=>SPELLS[a].lv-SPELLS[b].lv).forEach((sp,i)=>{const cx=x+(i%cols)*(cw+6),cy=y+Math.floor(i/cols)*(ch+4);if(cy+ch>maxY)return;rrect(ctx,cx,cy,cw,ch,6,'rgba(60,50,90,.8)','#8a7ac0',1.1);text(SPELLS[sp].n,cx+6,cy+ch*.46,{size:fz(11),bold:true});text(`Nv ${SPELLS[sp].lv} · ${SPELLS[sp].cost} maná`,cx+6,cy+ch*.86,{size:fz(9),color:'#b8a8e0'});hit(cx,cy,cw,ch,null,{tip:[SPELLS[sp].n,SPELLS[sp].d,'Coste: '+SPELLS[sp].cost+' de maná']})});
  if(!h.spells.length)text('Sin hechizos. Visita un gremio de magos.',x,y+16,{size:fz(12),italic:true,color:'#9a8a70'});
}
function heroSets(h,rx,y0,mine){
  const sets=setProgress(h);if(sets.length){text('CONJUNTOS DE ARTEFACTOS',rx,y0,{size:12,bold:true,color:'#c8a24a'});sets.forEach((q,i)=>{text(`${q.name}: ${q.n}/${q.tot}`+(q.n===q.tot?' ✔':''),rx,y0+18+i*16,{size:fz(11),color:q.n===q.tot?'#9aff9a':'#d8c8a0'})})}
  let fy=y0+(sets.length?sets.length*16+34:0);text('FUSIÓN DE LINAJES (arma+escudo+yelmo+anillo)',rx,fy,{size:12,bold:true,color:'#ff9a3a'});fy+=8;
  const fi=fusionInfo(h).slice(0,4);if(!fi.length)text('Reúne las 4 piezas de un linaje para fundirlas',rx,fy+14,{size:fz(11),italic:true,color:'#9a8a70'});
  fi.forEach((q,i)=>{const yy=fy+4+i*24,done=fusedOf(h).includes(q.id),full=q.n===4;text(`${q.L.short}: ${done?'FUSIONADO':q.n+'/4'}`,rx,yy+14,{size:fz(11),color:done?'#ff9a3a':full?'#9aff9a':'#d8c8a0'});
    if(mine&&(full||done)){button(rx+170,yy,100,22,done?'Separar':'Fusionar',()=>{const r=done?unfuse(h,q.L.fus):fuseLineage(h,q.id);if(r)toast(r,'bad');else{sfx('level');toast(done?'Piezas separadas':`¡${q.L.name} forjada!`,'good')}},{size:11,primary:!done})}
    hit(rx,yy,150,22,null,{tip:q.L.pieces.map(pid=>`${hasPiece(h,pid)?'✔':'✘'} ${ART[pid].n}`).concat(['Fusión: '+artText(q.L.fus)])})});
}
function heroArmyRow(h,x,y,s,ro){
  for(let i=0;i<7;i++){const sx=x+i*(s+6),u=h.army[i];const sel=S.pick&&S.pick.arr===h.army&&S.pick.i===i;
    slot(sx,y,s,{id:u&&u.id,n:u&&u.n,sel,tip:u?[CR[u.id].name,abilText(CR[u.id]),'Clic: mover · Clic derecho: información']:null,fn:ro?null:()=>{const p=S.pick;if(!p){if(u)S.pick={arr:h.army,i};return}
      if(p.arr===h.army&&p.i===i){S.pick=null;return}const a=p.arr[p.i],b=h.army[i];if(!a){S.pick=null;return}if(b&&a.id===b.id){b.n+=a.n;p.arr[p.i]=null}else{p.arr[p.i]=b;h.army[i]=a}
      if(armyEmpty(h.army)){const t=p.arr[p.i];p.arr[p.i]=h.army[i];h.army[i]=t}S.pick=null},right:()=>{if(u)creatureInfo(u.id,u.n)}})}
}
function openHeroScreen(h,readonly){
  const mine=h.pid===0&&!readonly;let tab=0;
  Dlg.show({w:1200,title:h.name,draw:m=>{
    const P=UI.ph,x=P?20:40,y=P?8:8,w=P?1240:1200,hh=P?704:704;
    panel(x,y,w,hh,{title:`${h.name} — ${HERO_CLASS[h.fi][h.cls]} (${FDEF[h.fi].short})`});
    const close=()=>{S.pick=null;Dlg.close()};
    if(!P){
      // ---- escritorio: todo a la vez, como la ficha clásica ----
      const lx=x+22;const S0=heroHead(h,lx,y+36,330,false);
      heroStats(h,lx,y+170,330,64);
      paragraph(specText(h),lx,y+270,330,{size:11,color:'#bfe8ff',italic:true});
      text('HABILIDADES SECUNDARIAS',lx,y+322,{size:12,bold:true,color:'#c8a24a'});heroSkills(h,lx,y+332,2,162,40,false);
      const ex=x+390,ey=y+52;text('EQUIPO',ex+170,ey-18,{size:12,bold:true,align:'center',color:'#c8a24a'});heroDoll(h,ex,ey,1,mine);
      text('MOCHILA',ex+170,ey+388,{size:12,bold:true,align:'center',color:'#c8a24a'});heroPack(h,ex,ey+398,1,mine);
      const rx=x+800;text('LIBRO DE HECHIZOS',rx,y+54,{size:12,bold:true,color:'#c8a24a'});heroSpells(h,rx,y+62,3,126,34,y+360);
      heroSets(h,rx,y+388,mine);
      // franja inferior: ejército
      const ay=y+hh-124;rrect(ctx,x+14,ay,w-28,112,8,'rgba(18,12,24,.55)','rgba(200,162,74,.4)',1.2);
      text('EJÉRCITO',x+28,ay+18,{size:12,bold:true,color:'#c8a24a'});heroArmyRow(h,x+28,ay+26,76,!mine);
      text(`Poder del ejército: ${armyPower(h.army)}`,x+28+7*82+16,ay+46,{size:14,bold:true,color:'#ffe27a'});
      button(x+w-180,ay+54,150,42,'Cerrar',close,{size:16,primary:1});
    }else{
      // ---- móvil: tres pestañas con letra grande ----
      ['Héroe','Equipo','Hechizos'].forEach((n,i)=>button(x+20+i*210,y+16,200,46,n,()=>{tab=i},{size:20,primary:tab===i}));
      button(x+w-190,y+16,170,46,'Cerrar',close,{size:20,primary:1});
      const cy=y+74;
      if(tab===0){const lx=x+24;heroHead(h,lx,cy,520,true);heroStats(h,x+600,cy,600,96);
        text('HABILIDADES',lx,cy+190,{size:15,bold:true,color:'#c8a24a'});heroSkills(h,lx,cy+200,3,264,50,true);
        const ay=y+hh-130;text(`EJÉRCITO · Poder ${armyPower(h.army)}`,lx,ay-6,{size:15,bold:true,color:'#c8a24a'});heroArmyRow(h,lx,ay,100,!mine)}
      else if(tab===1){const q=1.18,ex=x+60;heroDoll(h,ex,cy+8,q,mine);heroPack(h,x+560,cy+30,1.5,mine,6);text('MOCHILA',x+560,cy+16,{size:15,bold:true,color:'#c8a24a'});
        paragraph('Clic en una pieza equipada para guardarla; clic en la mochila para equiparla.',x+560,cy+300,600,{size:15,color:'#c8b890'})}
      else{text('LIBRO DE HECHIZOS',x+24,cy+16,{size:15,bold:true,color:'#c8a24a'});heroSpells(h,x+24,cy+28,4,290,50,cy+330);heroSets(h,x+24,cy+360,mine)}
    }
  }});
}
function armyPanelBig(x,y,h,ro){
  const s=64;
  for(let i=0;i<7;i++){const sx=x+(i%4)*(s+6),sy=y+Math.floor(i/4)*(s+6);const u=h.army[i];const sel=S.pick&&S.pick.arr===h.army&&S.pick.i===i;
    slot(sx,sy,s,{id:u&&u.id,n:u&&u.n,sel,tip:u?[CR[u.id].name,abilText(CR[u.id])]:null,fn:ro?null:()=>{const p=S.pick;if(!p){if(u)S.pick={arr:h.army,i};return}
      if(p.arr===h.army&&p.i===i){S.pick=null;return}const a=p.arr[p.i],b=h.army[i];if(!a){S.pick=null;return}if(b&&a.id===b.id){b.n+=a.n;p.arr[p.i]=null}else{p.arr[p.i]=b;h.army[i]=a}
      if(armyEmpty(h.army)){const t=p.arr[p.i];p.arr[p.i]=h.army[i];h.army[i]=t}S.pick=null},right:()=>{if(u)creatureInfo(u.id,u.n)}})}
}
// ---------- subida de nivel / cofre ----------
G.hooks.levelUp=(h,opts,cb)=>later(()=>{
  Dlg.show({title:`¡${h.name} sube a nivel ${h.lvl}!`,w:560,text:'Elige una nueva habilidad secundaria:',buttons:opts.map(o=>({label:`${SKILLS[o].n} (${['Básico','Avanzado','Experto'][h.skills[o]||0]})`,primary:1,fn:()=>{cb(o)}})),
    body:(x,y,w)=>{opts.forEach((o,i)=>text(SKILLS[o].d[h.skills[o]||0],x+w/2,y+10+i*20,{size:13,align:'center',color:'#bfe8ff'}));},extra:50});sfx('level')});
G.hooks.askChest=(h,r,cb)=>later(()=>{Dlg.show({title:'Cofre del tesoro',w:520,text:'Dentro hay un tesoro. ¿Qué prefieres llevarte?',buttons:[{label:`${r.gold} de oro`,primary:1,fn:()=>cb('gold')},{label:`${r.xp} de exp.`,fn:()=>cb('xp')}]});sfx('chest')});
G.hooks.dwell=(o,h,cb)=>later(()=>dwellModal(o,h,cb));
G.hooks.town=(t,h,cb)=>later(()=>{openTown(t,h);S.townDone=cb});
function later(fn){if(S.anim)S.later.push(fn);else fn()}

G.hooks.shop=(o,h,cb)=>later(()=>shopModal(o,h,cb));
G.hooks.askMon=(h,mo,att,cb)=>later(()=>{
  const c=CR[mo.cr],n=`${sizeLabel(mo.n)} de ${c.name} (${mo.n})`,gold=G.players[h.pid].res.gold;
  const T={join:['¡Criaturas dispuestas a unirse!',`${n} se ofrecen a unirse a ${h.name} sin luchar.`,[{label:'Aceptar',primary:1,fn:()=>cb(true)},{label:'Luchar',fn:()=>cb(false)}]],
    gold:['Criaturas mercenarias',`${n} se unirían a ${h.name} a cambio de ${att.cost} de oro. Tienes ${gold}.`,[{label:`Pagar ${att.cost}`,primary:1,disabled:gold<att.cost,fn:()=>cb(true)},{label:'Luchar',fn:()=>cb(false)}]],
    flee:['¡Las criaturas huyen!',`Ante el poder de ${h.name}, ${n} quieren huir sin combatir. Si luchas obtendrás experiencia, pero perderás tropas.`,[{label:'Dejarlas huir',primary:1,fn:()=>cb(true)},{label:'Atacar',fn:()=>cb(false)}]],
    surrender:['¡Las criaturas se rinden!',`${n} se rinden ante ${h.name} y ofrecen ${att.gold} de oro de tributo para que las dejes marchar.`,[{label:`Aceptar ${att.gold} de oro`,primary:1,fn:()=>cb(true)},{label:'Atacar',fn:()=>cb(false)}]]}[att.kind];
  Dlg.show({title:T[0],w:560,text:T[1],extra:96,body:(x,y,w)=>{const sp=creatureSprite(mo.cr,false);ctx.drawImage(sp,x+w/2-45,y+6,90,90)},buttons:T[2]})});
G.hooks.teleport=(h,from,to)=>{if(h.pid!==0)return;S.flash={t:0};setTimeout(()=>{camTo(to.x,to.y,true)},120);sfx('spell');FX.burst(to.x*TILE+TILE/2,to.y*TILE+TILE/2,30,['#bfe8ff','#fff','#c8a0ff'],{spd:160,life:.9,add:1})};
function shopModal(o,h,cb){
  const p=G.players[h.pid];
  Dlg.show({w:760,title:'Mercader de artefactos',draw:m=>{const x=260,y=150,w=760,hh=420;panel(x,y,w,hh,{title:'Mercader de artefactos'});
    text(`Tu oro: ${p.res.gold}`,x+w-24,y+46,{size:15,bold:true,align:'right',color:'#ffe27a'});
    if(!o.stock.length)text('El mercader se ha quedado sin existencias.',x+w/2,y+200,{size:16,align:'center',italic:true});
    o.stock.forEach((id,i)=>{const cx=x+20+(i%2)*364,cy=y+64+Math.floor(i/2)*160;const price=ART_PRICE[ART[id].v]||1000;rrect(ctx,cx,cy,350,150,8,lg(ctx,0,cy,0,cy+150,['#3a2e3a','#1a1420']),'#c8a24a',1.4);
      ctx.drawImage(artIcon(id),cx+12,cy+12,64,64);text(ART[id].n,cx+90,cy+30,{size:15,bold:true,color:'#ffe9a0'});text(`${SLOTN[ART[id].slot]} · ${['','Tesoro','Menor','Mayor','Reliquia','Conjunto'][ART[id].v]}`,cx+90,cy+48,{size:11,color:'#c8b890'});
      Object.keys(ART[id].b).forEach((k,q)=>text(`${BNAMES[k]||k}: ${k==='pf'?'sí':(ART[id].b[k]>0?'+':'')+ART[id].b[k]}`,cx+90,cy+66+q*14,{size:11}));
      button(cx+200,cy+112,140,30,`Comprar ${price}`,()=>{const e=buyArt(h,o,i,p);if(e)toast(e,'bad');else{sfx('coin');toast(`${ART[id].n} comprado`,'good')}},{size:13,primary:1,disabled:p.res.gold<price})});
    button(x+w/2-60,y+hh-46,120,34,'Salir',()=>{Dlg.close();cb&&cb()})}});
}

// ---------- intercambio entre dos héroes ----------
function exMoveArt(from,to,src,key){
  if(to.pack.length>=14){toast('La mochila del otro héroe está llena','bad');return}
  let id;
  if(src==='pack'){id=from.pack[key];if(!id)return;from.pack.splice(key,1);to.pack.push(id)}
  else{const id0=from.eq[key];if(!id0)return;if(id0.charCodeAt(0)===35||ART[id0].fusion){toast('Separa la fusión antes de traspasarla','bad');return}
    if(from.pack.length>=14){toast('Tu mochila está llena','bad');return}
    if(!unequip(from,key)){toast('Mochila llena','bad');return}
    const i=from.pack.lastIndexOf(id0);if(i<0)return;from.pack.splice(i,1);to.pack.push(id0)}
  sfx('click');
}
function openExchange(a,b){
  S.pick=null;
  Dlg.show({w:1100,title:'Intercambio',draw:m=>{
    const x=90,y=30,w=1100,hh=660;panel(x,y,w,hh,{title:`Intercambio · ${a.name} y ${b.name}`});
    [[a,b,x+22],[b,a,x+w/2+12]].forEach(([h,o,cx])=>{
      const st=hstat(h);ctx.drawImage(portrait(h.fi,h.port,h.cls),cx,y+44,64,64);rrect(ctx,cx,y+44,64,64,4,null,'#c8a24a',1.6);
      text(h.name,cx+76,y+66,{size:17,bold:true,color:'#ffe9a0'});text(`Nivel ${h.lvl} ${HERO_CLASS[h.fi][h.cls]}`,cx+76,y+86,{size:12});
      text(`Ata ${st.a}  Def ${st.d}  Pod ${st.sp}  Con ${st.kn}`,cx+76,y+104,{size:12,color:'#d8c8a0'});
      armyPanel(cx,y+142,h.army,'EJÉRCITO',{hero:h});
      text('EQUIPO (clic: pasar al otro héroe)',cx,y+300,{size:12,bold:true,color:'#c8a24a'});
      EQKEYS.forEach((k,i)=>{const sx=cx+(i%7)*44,sy=y+308+Math.floor(i/7)*44,id0=h.eq[k],blk=id0&&id0.charCodeAt(0)===35,id=blk?id0.slice(1):id0;
        hit(sx,sy,40,40,id&&!blk?()=>exMoveArt(h,o,'eq',k):null,{tip:id?[...artTip(id),blk?'Parte de una fusión':'Clic: pasar al otro héroe']:SLOTN[EQSLOT[k]]});
        rrect(ctx,sx,sy,40,40,5,lg(ctx,0,sy,0,sy+40,['#3a3044','#1a1420']),id?TIERCOL[ART[id].v]:'#5a4a38',id?2:1.2);
        if(id){if(blk)ctx.globalAlpha=.35;ctx.drawImage(artIcon(id),sx+2,sy+2,36,36);ctx.globalAlpha=1}else ctx.drawImage(slotGlyph(EQSLOT[k]),sx+2,sy+2,36,36)});
      text('MOCHILA (clic: pasar al otro héroe)',cx,y+414,{size:12,bold:true,color:'#c8a24a'});
      for(let i=0;i<14;i++){const sx=cx+(i%7)*44,sy=y+422+Math.floor(i/7)*44,id=h.pack[i];
        hit(sx,sy,40,40,id?()=>exMoveArt(h,o,'pack',i):null,{tip:id?[...artTip(id),'Clic: pasar al otro héroe']:'Mochila'});
        rrect(ctx,sx,sy,40,40,5,'rgba(30,24,36,.9)',id?TIERCOL[ART[id].v]:'#4a3e34',id?2:1.2);if(id)ctx.drawImage(artIcon(id),sx+2,sy+2,36,36)}
      button(cx,y+524,150,30,'Equipar lo mejor',()=>{autoEquipBest(h);sfx('level')},{size:12,tip:'Equipa automáticamente los mejores objetos de la mochila'});
      button(cx+160,y+524,140,30,'Ver ficha',()=>openHeroScreen(h),{size:12});
    });
    ctx.fillStyle='rgba(200,162,74,.35)';ctx.fillRect(x+w/2,y+44,2,500);
    text('Clic en una criatura y luego en otra casilla (también del otro héroe) para moverla. Cada héroe necesita al menos una criatura.',x+w/2,y+hh-62,{size:12,align:'center',color:'#c8b890'});
    button(x+w/2-70,y+hh-48,140,34,'Cerrar',()=>{S.pick=null;Dlg.close()},{size:15,primary:1});
  }});
}
