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
function townHalls(t){return t.b.hall3?3:t.b.hall2?2:1}
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
// huecos fijos de los edificios sobre el panorama (el castillo ocupa la derecha): tres filas de profundidad
const TOWN_ROWS=[['hall1','hall2','hall3','fort1','fort2','fort3','mage1','mage2','mage3','mage4'],['tavern','market','shipyard','up1','up2','up3','up4','up5','up6','up7'],['dw1','dw2','dw3','dw4','dw5','dw6','dw7']];
function townSpot(b,t){
  let row=0,col=0;TOWN_ROWS.forEach((r,i)=>{const j=r.indexOf(b);if(j>=0){row=i;col=j}});
  const sw=[66,78,92][row]*(UI.ph?1.22:1),base=[444,500,558][row]-(UI.ph?18:0),step=[76,76,108][row]+(UI.ph?6:0);
  return{x:16+col*step+(row===1?30:0),y:base-sw*112/124,w:sw,h:sw*112/124,row,base}}
function drawTown(dt){
  if(!S.town){ctx.fillStyle='#120c14';ctx.fillRect(0,0,VW,VH);return}
  const c=ctx,{t,h}=S.town,p=G.players[0],F=FDEF[t.fi],P=UI.ph;const tf=S.townFx;if(tf)tf.t+=dt;
  c.fillStyle='#120c14';c.fillRect(0,0,VW,VH);
  // ---- panorama a todo lo ancho ----
  const PY=42,PH=P?500:522,pan=townPanorama(t.fi);const k=tf?1+.3*Math.max(0,1-tf.t/1.2)**2:1;
  c.save();c.beginPath();c.rect(0,PY,1280,PH);c.clip();c.translate(640,PY+PH*.7);c.scale(k,k);c.translate(-640,-(PY+PH*.7));
  c.drawImage(pan,0,430-395,960,395,0,PY,1280,PH);
  for(let i=0;i<14;i++){const px=(i*137+S.clock*(12+i%5*6))%1280,py=PY+30+((i*61)%170)+Math.sin(S.clock*1.3+i)*6;c.fillStyle=F.id==='brasa'?'rgba(255,170,60,.7)':F.id==='cripta'?'rgba(180,220,255,.45)':'rgba(255,255,255,.35)';c.fillRect(px,py,2.4,2.4)}
  if(F.id==='alba'||F.id==='marea'){for(let i=0;i<3;i++){const bx=(S.clock*30+i*420)%1300;c.strokeStyle='rgba(30,30,40,.7)';c.lineWidth=1.6;c.beginPath();c.moveTo(bx,PY+60+i*22);c.quadraticCurveTo(bx+5,PY+54+i*22+Math.sin(S.clock*8+i)*3,bx+10,PY+60+i*22);c.quadraticCurveTo(bx+15,PY+54+i*22+Math.sin(S.clock*8+i)*3,bx+20,PY+60+i*22);c.stroke()}}
  if(t.owner===0)drawFlag(c,p.col,640-12,PY+14,S.clock);
  c.restore();
  // edificios construidos, de atrás hacia delante
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
function drawTownBuildings(t,p){
  const c=ctx,list=BUILD_ORDER.filter(b=>t.b[b]&&(b!=='shipyard'||t.dock)).map(b=>({b,s:townSpot(b,t)})).sort((a,b)=>a.s.base-b.s.base);
  for(const{b,s}of list){
    const hov=hit(s.x,s.y,s.w,s.h,()=>buildDialog(t,b),{tip:[...buildTip(t,b,p,{ok:1},bCost(b,t.fi)),'Clic: usar este edificio']});
    ell(c,s.x+s.w/2,s.base-s.w*.04,s.w*.42,s.w*.075,'rgba(0,0,0,.4)');
    if(hov){c.save();c.shadowColor='rgba(255,230,120,.95)';c.shadowBlur=18}
    c.drawImage(buildingSprite(b,t.fi),s.x,s.y,s.w,s.h);
    if(hov)c.restore();
    const m=/^dw(\d)$/.exec(b);if(m){const av=t.avail[+m[1]-1];if(av>0){const r=UI.ph?12:10;ell(c,s.x+s.w-r-2,s.y+r+4,r,r,'#2a6a2a','#c8ffb0',1.4);text(String(av>99?'99+':av),s.x+s.w-r-2,s.y+r+8,{size:av>99?9:UI.ph?12:10,bold:true,align:'center',color:'#fff'})}}
    if(hov){const nm=bTitle(b,t.fi),tw=measure(nm,13,true)+16;rrect(c,s.x+s.w/2-tw/2,s.base+2,tw,19,5,'rgba(10,6,16,.9)','#e8c25a',1.2);text(nm,s.x+s.w/2,s.base+16,{size:13,bold:true,align:'center',color:'#ffe9a0',shadow:false})}
  }
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
    const B=[['Ayuntamiento',()=>townHallModal(t),{primary:1,tip:'Construir y mejorar edificios'}],['Reclutar',()=>recruitModal(t,h),{primary:1,tip:'Reclutar criaturas'}],
      ['Taberna',()=>tavernModal(t),{disabled:!t.b.tavern,tip:t.b.tavern?'Contratar héroes (2500 de oro)':'Construye una Taberna'}],['Mercado',()=>marketModal(),{disabled:!t.b.market,tip:t.b.market?null:'Construye un Mercado'}],
      ['Gremio de magos',()=>guildModal(t,h),{disabled:!t.b.mage1,tip:t.b.mage1?null:'Construye un Gremio de magos'}],t.dock?['Astillero',()=>townBoat(t,p),{disabled:!t.b.shipyard,tip:t.b.shipyard?'Comprar barco: 1000 de oro y 10 de madera':'Construye un Astillero'}]:['Resumen',()=>townSummary(t),{tip:'Producción e ingresos de la ciudad'}],
      ['Dividir',()=>townSplit(),{disabled:!sel||sel.n<2,tip:'Divide la pila seleccionada'}],['Mejorar',()=>townUpgrade(t,p),{disabled:!up||!canAfford(p,up.cost),tip:up?`Cuesta ${costText(up.cost)}`:'Selecciona una criatura con mejora disponible'}]];
    B.forEach((q,i)=>button(bx+8+(i%2)*bw2,y0+8+Math.floor(i/2)*((bh-16)/4),bw,(bh-16)/4-4,q[0],q[1],Object.assign({size:14},q[2])));
    // panel de datos de la ciudad
    const ix=bx+bw2*2+22,iw=1276-ix;panel(ix,y0,iw,bh,{plain:1,r:8,noshadow:1});
    text(F.name,ix+iw/2,y0+24,{size:15,bold:true,align:'center',color:'#ffe9a0'});
    text(`Ayuntamiento nivel ${townHalls(t)}`,ix+14,y0+48,{size:12,color:'#d8c8a0'});
    const inc=250+(t.b.hall2?500:0)+(t.b.hall3?1000:0);text(`Ingreso: +${inc} oro/día`,ix+14,y0+68,{size:13,bold:true,color:'#ffe27a'});
    const nb=BUILD_ORDER.filter(b=>t.b[b]).length;text(`Edificios: ${nb}/${BUILD_ORDER.filter(b=>b!=='shipyard'||t.dock).length}`,ix+14,y0+88,{size:12,color:'#d8c8a0'});
    if(h){const st=hstat(h);text(`${h.name} · Nv ${h.lvl}`,ix+14,y0+110,{size:12,bold:true,color:'#ffe9a0'});text(`Ata ${st.a} · Def ${st.d} · Pod ${st.sp} · Con ${st.kn}`,ix+14,y0+127,{size:12,color:'#bfe8ff'})}
    button(ix+10,y0+bh-48,iw-20,38,'Salir de la ciudad',()=>closeTown(),{size:15})}
  else{const bw=316,bh2=(bh-12)/3-4;panel(bx,y0,1276-bx,bh,{plain:1,r:8,noshadow:1});
    const B=[['Ayuntamiento',()=>townHallModal(t),{primary:1}],['Reclutar',()=>recruitModal(t,h),{primary:1}],
      sel?['Dividir',()=>townSplit(),{disabled:sel.n<2}]:['Taberna',()=>tavernModal(t),{disabled:!t.b.tavern}],sel?['Mejorar',()=>townUpgrade(t,p),{disabled:!up||!canAfford(p,up.cost)}]:['Mercado',()=>marketModal(),{disabled:!t.b.market}],
      ['Más…',()=>townMore(t,h,p),{}],['Salir',()=>closeTown(),{}]];
    B.forEach((q,i)=>button(bx+6+(i%2)*(bw+6),y0+6+Math.floor(i/2)*(bh2+4),bw,bh2,q[0],q[1],Object.assign({size:19},q[2])))}
}
function townSummary(t){const inc=250+(t.b.hall2?500:0)+(t.b.hall3?1000:0);Dlg.show({title:t.name,w:480,text:`${FDEF[t.fi].name}\nIngreso: +${inc} de oro al día\nEdificios construidos: ${BUILD_ORDER.filter(b=>t.b[b]).length}`,buttons:[{label:'Cerrar',primary:1}]})}
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
    c.drawImage(townSprite(q.fi).c,x+2,y+2,w-4,(w-4)*.5)});
}
// Ayuntamiento: lista completa de edificios para construir (verde = construido)
function townHallModal(t){
  const p=G.players[0],P=UI.ph;
  Dlg.show({w:1060,title:'Ayuntamiento',draw:m=>{
    const cw=P?140:134,ch=P?124:116,cols=7,w=cols*(cw+6)+26,list=BUILD_ORDER.filter(b=>b!=='shipyard'||t.dock),rows=Math.ceil(list.length/cols),hh=70+rows*(ch+6)+60,x=(1280-w)/2,y=Math.max(6,(720-hh)/2);
    panel(x,y,w,hh,{title:'Ayuntamiento · '+t.name});
    text('Clic en un edificio para ver su coste y construirlo. Verde: ya construido.',x+w/2,y+40,{size:fz(13),align:'center',color:'#c8b890'});
    const inc=250+(t.b.hall2?500:0)+(t.b.hall3?1000:0);
    list.forEach((b,i)=>{const bx=x+16+(i%cols)*(cw+6),by=y+54+Math.floor(i/cols)*(ch+6);
      const built=!!t.b[b],cb=canBuild(t,b,p),cost=bCost(b,t.fi);
      const hov=hit(bx,by,cw,ch,()=>buildDialog(t,b),{tip:buildTip(t,b,p,cb,cost)});
      rrect(ctx,bx,by,cw,ch,7,lg(ctx,0,by,0,by+ch,[built?'#3a4a30':cb.ok?'#4a3a2e':'#2a2224','#1a1418']),built?'#7ac060':cb.ok?(hov?'#ffe9a0':'#c8a24a'):'#5a4a38',hov?2.4:1.6);
      ctx.save();ctx.beginPath();ctx.rect(bx+3,by+3,cw-6,ch-6);ctx.clip();if(!built&&!cb.ok)ctx.globalAlpha=.42;else if(!built)ctx.globalAlpha=.85;
      ctx.drawImage(buildingSprite(b,t.fi),bx+(cw-86)/2,by+2,86,78);ctx.restore();
      const lines=wrap(bTitle(b,t.fi),cw-8,fz(11),true);lines.slice(0,2).forEach((l,k)=>text(l,bx+cw/2,by+ch-(P?30:26)+k*fz(12)-(lines.length>1?4:0),{size:fz(11),bold:true,align:'center',color:built?'#c8ffb0':'#f2e6c8'}));
      if(built){ctx.fillStyle='#7ae070';ctx.font='bold 18px '+FONT;ctx.fillText('✔',bx+cw-22,by+20)}
      else if(cost.gold<900000)text(cost.gold,bx+cw/2,by+ch-3,{size:fz(11),bold:true,align:'center',color:canAfford(p,cost)?'#ffe27a':'#e08070'})});
    let rx=x+22;for(const r of RES){ctx.drawImage(resIcon(r,24),rx,y+hh-46,24,24);text(String(p.res[r]),rx+27,y+hh-28,{size:fz(13),bold:true});rx+=P?86:80}
    text(`+${inc} oro/día`,x+w-170,y+hh-28,{size:fz(14),bold:true,align:'right',color:'#ffe27a'});
    button(x+w-150,y+hh-54,130,40,'Cerrar',()=>Dlg.close(),{size:fz(15),primary:1});
  }});
}
function buildTip(t,b,p,cb,cost){const L=[bTitle(b,t.fi)];let m;
  if(m=/^dw(\d)$/.exec(b)){const cr=CR[FDEF[t.fi].units[+m[1]-1]];const ex=dwellExtra(t,+m[1]);L.push(`Cría: ${cr.name} (${cr.grow}${ex?' +'+ex+' de moradas conquistadas':''}/semana)`,`Atq ${cr.atk} · Def ${cr.def} · Vida ${cr.hp} · Daño ${cr.mn}-${cr.mx}`)}
  else if(m=/^up(\d)$/.exec(b)){const cr=CR[FDEF[t.fi].units[+m[1]-1+7]];L.push(`Mejora a: ${cr.name}`,`Atq ${cr.atk} · Def ${cr.def} · Vida ${cr.hp}`)}
  else L.push({shipyard:'Permite comprar barcos (1000 de oro y 10 de madera) para navegar',hall1:'Ingreso base de 250 oro/día',hall2:'+500 de oro al día',hall3:'+1000 de oro al día',fort1:'Defensa de la ciudad',fort2:'+50% de crecimiento semanal',fort3:'+100% de crecimiento semanal',tavern:'Permite contratar héroes',market:'Permite comerciar recursos',mage1:'Hechizos de nivel 1',mage2:'Hechizos de nivel 2',mage3:'Hechizos de nivel 3',mage4:'Hechizos de nivel 4'}[b]||'');
  if(!t.b[b]){L.push('Coste: '+costText(cost));if(!cb.ok)L.push('✖ '+cb.why)}return L}
function buildDialog(t,b){
  const p=G.players[0],cb=canBuild(t,b,p),cost=bCost(b,t.fi);
  if(t.b[b]){if(/^dw/.test(b))recruitModal(t,S.town.h);else if(b==='tavern')tavernModal(t);else if(b==='market')marketModal();else if(b==='shipyard'){const e=buyBoat(t,p);if(e)toast(e,'bad');else{sfx('build');toast('Barco amarrado en el muelle','good')}}else if(/^mage/.test(b))guildModal(t,S.town.h);else Dlg.show({title:bTitle(b,t.fi),w:480,text:buildTip(t,b,p,cb,cost).slice(1).join('\n'),buttons:[{label:'Cerrar',primary:1}]});return}
  Dlg.show({title:bTitle(b,t.fi),w:480,text:buildTip(t,b,p,cb,cost).slice(1).join('\n'),buttons:[{label:'Construir',primary:1,disabled:!cb.ok,fn:()=>{if(build(t,b,p)){sfx('build');toast(`${bTitle(b,t.fi)} construido`,'good');FX.burst(640,200,30,['#ffe27a','#fff'],{spd:160,life:1})}}},{label:'Cancelar'}]});
}
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
function openHeroScreen(h,readonly){
  const mine=h.pid===0&&!readonly;
  Dlg.show({w:1020,title:h.name,draw:m=>{
    const x=130,y=18,w=1020,hh=684,p=G.players[h.pid],st=hstat(h);panel(x,y,w,hh,{title:`${h.name} — ${HERO_CLASS[h.fi][h.cls]} (${FDEF[h.fi].short})`});
    // columna izquierda
    ctx.drawImage(portrait(h.fi,h.port,h.cls),x+22,y+34,120,120);rrect(ctx,x+22,y+34,120,120,4,null,'#c8a24a',2);
    text(`Nivel ${h.lvl}`,x+156,y+54,{size:20,bold:true,color:'#ffe9a0'});text(p.name,x+156,y+74,{size:13,color:p.col,bold:true});
    const nx=xpForLevel(h.lvl+1),cur=xpForLevel(h.lvl);bar(x+156,y+84,170,13,(h.xp-cur)/(nx-cur),'#b87aff','#6a3aa0');text(`${h.xp}/${nx} exp.`,x+241,y+95,{size:10,bold:true,align:'center',shadow:false});
    bar(x+156,y+104,170,12,h.mana/Math.max(1,maxMana(h)),'#6aa0ff','#2a5ac0');text(`Maná ${Math.floor(h.mana)}/${maxMana(h)}`,x+241,y+114,{size:10,bold:true,align:'center',shadow:false});
    bar(x+156,y+122,170,12,h.mp/Math.max(1,maxMP(h)),'#5ad87a','#2a8a4a');text(`Mov. ${Math.round(h.mp)}/${maxMP(h)}${h.boat?' (barco)':''}`,x+241,y+132,{size:10,bold:true,align:'center',shadow:false});
    [['Ataque',st.a,h.a],['Defensa',st.d,h.d],['Poder',st.sp,h.sp],['Conocim.',st.kn,h.kn]].forEach((q,i)=>{const sx=x+22+(i%2)*154,sy=y+164+Math.floor(i/2)*60;rrect(ctx,sx,sy,148,54,6,'rgba(40,30,44,.85)','#7a6a48',1.3);text(q[0],sx+10,sy+20,{size:12,color:'#c8b890'});text(String(q[1])+(q[1]>q[2]?` (+${q[1]-q[2]})`:''),sx+138,sy+42,{size:24,bold:true,align:'right',color:q[1]>q[2]?'#9aff9a':'#fff'})});
    text(`Moral ${st.lead>=0?'+':''}${st.lead} · Suerte ${st.luck>=0?'+':''}${st.luck} · Visión ${heroVis(h)}`,x+22,y+296,{size:12,color:'#d8c8a0'});
    paragraph(specText(h),x+22,y+314,300,{size:11,color:'#bfe8ff',italic:true});
    text('HABILIDADES',x+22,y+356,{size:12,bold:true,color:'#c8a24a'});const sks=Object.keys(h.skills);
    sks.forEach((k,i)=>{const lv=h.skills[k],cx=x+22+(i%2)*154,cy=y+364+Math.floor(i/2)*44;rrect(ctx,cx,cy,148,38,6,'rgba(40,30,44,.85)','#7a6a48',1.2);text(SKILLS[k].n,cx+8,cy+16,{size:12,bold:true});for(let q=0;q<3;q++){ctx.fillStyle=q<lv?'#ffd24a':'#4a4030';ctx.beginPath();ctx.arc(cx+14+q*14,cy+28,4.4,0,6.28);ctx.fill();ctx.strokeStyle='#000';ctx.lineWidth=1;ctx.stroke()}text(['Básico','Avanzado','Experto'][lv-1],cx+142,cy+31,{size:10,align:'right',color:'#ffe27a'});hit(cx,cy,148,38,null,{tip:[SKILLS[k].n+' — '+['Básico','Avanzado','Experto'][lv-1],SKILLS[k].d[lv-1]]})});
    if(!sks.length)text('Sin habilidades',x+22,y+384,{size:12,italic:true,color:'#9a8a70'});
    // centro: muñeco de equipo
    const ex=x+350,ey=y+44;rrect(ctx,ex-8,ey-8,356,420,8,'rgba(18,12,24,.55)','rgba(200,162,74,.4)',1.2);
    ctx.save();ctx.globalAlpha=.1;ctx.drawImage(portrait(h.fi,h.port,h.cls),ex+60,ey+130,220,220);ctx.restore();
    text('EQUIPO',ex+170,ey-14,{size:12,bold:true,align:'center',color:'#c8a24a'});
    for(const k of EQKEYS){const[ox,oy]=EQPOS[k],sx=ex+ox,sy=ey+oy,id0=h.eq[k],blk=id0&&id0.charCodeAt(0)===35,id=blk?id0.slice(1):id0;
      const hov=hit(sx,sy,52,52,mine&&id?()=>{if(unequip(h,k))sfx('click');else toast('Mochila llena','bad')}:null,{tip:id?[...artTip(id),mine?'Clic: guardar en la mochila':'']:SLOTN[EQSLOT[k]]});
      rrect(ctx,sx,sy,52,52,6,lg(ctx,0,sy,0,sy+52,['#3a3044','#1a1420']),id?TIERCOL[ART[id].v]:hov?'#c8b890':'#6a5a3e',id?2.2:1.4);
      if(id){if(blk)ctx.globalAlpha=.35;ctx.drawImage(artIcon(id),sx+4,sy+4,44,44);ctx.globalAlpha=1;if(blk){ctx.fillStyle='rgba(255,170,60,.9)';ctx.font='bold 11px sans-serif';ctx.textAlign='center';ctx.fillText('FUSIÓN',sx+26,sy+30);ctx.textAlign='left'}}else ctx.drawImage(slotGlyph(EQSLOT[k]),sx+4,sy+4,44,44)}
    // mochila
    text('MOCHILA',ex+170,ey+388,{size:12,bold:true,align:'center',color:'#c8a24a'});
    for(let i=0;i<14;i++){const sx=ex+(i%7)*50,sy=ey+398+Math.floor(i/7)*50,id=h.pack[i];
      const hov=hit(sx,sy,46,46,mine&&id?()=>{const keys=SLOTKEYS[ART[id].slot];const k=keys.find(q=>!h.eq[q])||keys[0];if(equipFromPack(h,i,k))sfx('level')}:null,{tip:id?[...artTip(id),mine?'Clic: equipar':'']:'Mochila'});
      rrect(ctx,sx,sy,46,46,5,'rgba(30,24,36,.9)',id?TIERCOL[ART[id].v]:'#4a3e34',id?2:1.2);if(id)ctx.drawImage(artIcon(id),sx+1,sy+1,44,44)}
    // derecha: ejército, hechizos, conjuntos
    const rx=x+730;
    text('EJÉRCITO',rx,y+54,{size:12,bold:true,color:'#c8a24a'});armyPanelBig(rx,y+62,h,!mine);
    text(`Poder del ejército: ${armyPower(h.army)}`,rx,y+210,{size:12,color:'#ffe27a'});
    text('LIBRO DE HECHIZOS',rx,y+236,{size:12,bold:true,color:'#c8a24a'});
    h.spells.slice().sort((a,b)=>SPELLS[a].lv-SPELLS[b].lv).forEach((sp,i)=>{const cx=rx+(i%2)*140,cy=y+244+Math.floor(i/2)*32;if(cy>y+470)return;rrect(ctx,cx,cy,134,28,6,'rgba(60,50,90,.8)','#8a7ac0',1.1);text(SPELLS[sp].n,cx+6,cy+13,{size:11,bold:true});text(`Nv ${SPELLS[sp].lv} · ${SPELLS[sp].cost}`,cx+6,cy+24,{size:9,color:'#b8a8e0'});hit(cx,cy,134,28,null,{tip:[SPELLS[sp].n,SPELLS[sp].d,'Coste: '+SPELLS[sp].cost+' de maná']})});
    const sets=setProgress(h);if(sets.length){text('CONJUNTOS DE ARTEFACTOS',rx,y+498,{size:12,bold:true,color:'#c8a24a'});sets.forEach((q,i)=>{text(`${q.name}: ${q.n}/${q.tot}`+(q.n===q.tot?' ✔':''),rx,y+516+i*16,{size:11,color:q.n===q.tot?'#9aff9a':'#d8c8a0'})})}
    {let fy=y+516+(sets.length?sets.length*16+26:0);if(!sets.length)fy=y+498;text('FUSIÓN DE LINAJES (arma+escudo+yelmo+anillo)',rx,fy,{size:12,bold:true,color:'#ff9a3a'});fy+=8;
      const fi=fusionInfo(h).slice(0,4);if(!fi.length)text('Reúne las 4 piezas de un linaje para fundirlas',rx,fy+14,{size:11,italic:true,color:'#9a8a70'});
      fi.forEach((q,i)=>{const yy=fy+4+i*24,done=fusedOf(h).includes(q.id),full=q.n===4;text(`${q.L.short}: ${done?'FUSIONADO':q.n+'/4'}`,rx,yy+14,{size:11,color:done?'#ff9a3a':full?'#9aff9a':'#d8c8a0'});
        if(mine&&(full||done)){button(rx+170,yy,100,22,done?'Separar':'Fusionar',()=>{const r=done?unfuse(h,q.L.fus):fuseLineage(h,q.id);if(r)toast(r,'bad');else{sfx('level');toast(done?'Piezas separadas':`¡${q.L.name} forjada!`,'good')}},{size:11,primary:!done})}
        hit(rx,yy,150,22,null,{tip:q.L.pieces.map(pid=>`${hasPiece(h,pid)?'✔':'✘'} ${ART[pid].n}`).concat(['Fusión: '+artText(q.L.fus)])})})}
    button(x+w/2-60,y+hh-48,120,34,'Cerrar',()=>{S.pick=null;Dlg.close()},{size:15});
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
