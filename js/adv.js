'use strict';
// =====================================================================
//  Mapa de aventura: dibujo, cámara, movimiento animado, entrada a castillos
// =====================================================================
const VPW=1008,VPH=720;
const S={scr:'menu',cam:{x:0,y:0},sel:null,path:null,target:null,mov:null,anim:null,later:[],fx:null,ai:null,hov:null,busy:false,mini:null,miniT:0,t:0,banner:null,sync:0,clock:0,flyTo:null,vis:null};
const objName=o=>{switch(o.t){case'town':return o.name;case'mine':return'Mina de '+RESN[o.res];case'dwell':return'Vivienda: '+CR[o.cr].name;
  case'site':return(typeof SITEDEF!=='undefined'&&SITEDEF[o.k]?SITEDEF[o.k].n:{shrine:'Santuario de hechizos',hut:'Cabaña de la bruja',well:'Pozo mágico',stone:'Piedra de aprendizaje',stable:'Establos',mill:'Molino',shop:'Mercader de artefactos'}[o.k]);
  case'res':return o.res==='gold'?o.n+' de oro':o.n+' de '+RESN[o.res];case'chest':return'Cofre del tesoro';case'art':return'Artefacto: '+ART[o.art].n;case'mon':return`${sizeLabel(o.n)} de ${CR[o.cr].name}`;case'gate':return levelOf(G.map,o.y)?'Puerta a la superficie':'Puerta al subsuelo';case'mono':return o.dir==='two'?`Monolito ${MONO_N[o.col%8]} (bidireccional)`:o.dir==='in'?`Monolito ${MONO_N[o.col%8]} (entrada)`:`Monolito ${MONO_N[o.col%8]} (salida)`;case'boat':return'Barco'}return'?'};
const MONO_N=['azul','rojo','verde','amarillo','púrpura','turquesa','naranja','rosa'];
function curPlayer(){return G.players[0]}
function selHero(){return S.sel!=null?G.heroes[S.sel]:null}
function myHeroes(){return G.players[0].heroes.map(i=>G.heroes[i])}
function selectHero(h,center=true){S.sel=h.id;S.path=null;S.target=null;S.exTarget=null;if(center)camTo(h.x,h.y)}
function camTo(x,y,instant){S.flyTo={x:x*TILE+TILE/2-VPW/2,y:y*TILE+TILE/2-VPH/2};if(instant){S.cam.x=S.flyTo.x;S.cam.y=S.flyTo.y;clampCam()}}
function clampCam(){const m=G.map;S.cam.x=clamp(S.cam.x,0,m.w*TILE-VPW);S.cam.y=clamp(S.cam.y,0,m.h*TILE-VPH)}
// ---------- visibilidad ----------
function computeVis(){
  const m=G.map,p=G.players[0],x0=Math.max(0,Math.floor(S.cam.x/TILE)-1),y0=Math.max(0,Math.floor(S.cam.y/TILE)-1),x1=Math.min(m.w-1,x0+Math.ceil(VPW/TILE)+2),y1=Math.min(m.h-1,y0+Math.ceil(VPH/TILE)+2);
  const w=x1-x0+1,h=y1-y0+1,vis=new Uint8Array(w*h);const src=visSources(p);
  for(const[sx,sy,r]of src){const r2=r*r;for(let j=Math.max(y0,sy-r);j<=Math.min(y1,sy+r);j++)for(let i=Math.max(x0,sx-r);i<=Math.min(x1,sx+r);i++)if((i-sx)**2+(j-sy)**2<=r2)vis[(j-y0)*w+i-x0]=1}
  S.vis={x0,y0,w,h,a:vis};
}
const isVis=(x,y)=>{const v=S.vis;if(!v)return true;if(x<v.x0||y<v.y0||x>=v.x0+v.w||y>=v.y0+v.h)return false;return v.a[(y-v.y0)*v.w+x-v.x0]===1};
const isExpl=(x,y)=>G.players[0].fog[y*G.map.w+x]===1;
// ---------- dibujo ----------
const LIGHT_COL={shrine:'rgba(150,220,255,.5)',stone:'rgba(150,220,255,.5)',well:'rgba(120,200,255,.4)'};
function blit(c,o,img,dx,dy,dw,dh,under,tr){if(!under&&dh>40){c.save();c.translate(dx+dw/2,dy+dh-6);c.transform(1,0,-.5,-.26,0,0);c.globalAlpha=.55;c.drawImage(silhouette(img),-dw/2,-dh+6,dw,dh);c.restore()}c.drawImage(img,dx,dy,dw,dh)}
function drawObjSprite(o,t,under,lights){
  const c=ctx;const px=o.x*TILE,py=o.y*TILE;let img;
  switch(o.t){
    case'town':{const sp=townSprite(o.fi);img=sp.c;const dy=(o.y+o.h)*TILE-img.lh+6;blit(c,o,img,px,dy,img.lw,img.lh,under);if(o.owner>=0)drawFlag(c,G.players[o.owner].col,px+sp.flagX-1,dy+sp.flagY,t);
      if(lights)lights.push({x:px+90,y:dy+img.lh-60,r:130,col:'rgba(255,190,100,.5)'});
      // humo de las chimeneas
      if(Math.random()<.06)FX.add({x:px+34+Math.random()*10,y:dy+img.lh-90,vx:8,vy:-14,col:'rgba(220,220,230,.5)',size:3+Math.random()*2,life:1.6,shrink:true});return}
    case'mine':{img=mineSprite(o.res);const dy=(o.y+o.h)*TILE-img.lh+4;blit(c,o,img,px,dy,img.lw,img.lh,under);if(o.owner>=0)drawFlag(c,G.players[o.owner].col,px+12,dy+img.lh-92,t);if(lights)lights.push({x:px+72,y:dy+img.lh-30,r:70,col:'rgba(255,180,90,.35)'});return}
    case'dwell':{img=dwellSprite(o.cr).c;blit(c,o,img,px,(o.y+o.h)*TILE-img.lh+4,img.lw,img.lh,under);return}
    case'gate':{img=gateSprite(levelOf(G.map,o.y));const dy=(o.y+2)*TILE-img.lh+4;c.drawImage(img,px,dy,img.lw,img.lh);if(lights)lights.push({x:px+TILE,y:dy+img.lh-30,r:120,col:levelOf(G.map,o.y)?'rgba(255,220,150,.6)':'rgba(140,120,255,.35)'});return}
    case'mono':{img=monoSprite(o.col);const pc=PCOL[o.col%8];const dy=(o.y+1)*TILE-img.lh+8;c.drawImage(img,px+TILE/2-28,dy,img.lw,img.lh);
      c.save();c.globalCompositeOperation='lighter';c.globalAlpha=.35+.25*Math.sin(t*3+o.id);c.drawImage(glowSprite(pc.replace('#','')?'rgba('+parseInt(pc.slice(1,3),16)+','+parseInt(pc.slice(3,5),16)+','+parseInt(pc.slice(5,7),16)+',.9)':'rgba(255,255,255,.9)',96),px-16,dy+10,96,96);c.restore();
      if(lights)lights.push({x:px+TILE/2,y:dy+50,r:90,col:'rgba('+parseInt(pc.slice(1,3),16)+','+parseInt(pc.slice(3,5),16)+','+parseInt(pc.slice(5,7),16)+',.55)'});return}
    case'boat':{img=boatSprite();const b=Math.sin(t*2+o.id)*2;c.drawImage(img,px-8,(o.y+1)*TILE-img.lh+8+b,img.lw,img.lh);return}
    case'site':img=o.k==='shop'?shopSprite():SITEDEF[o.k]?siteSprite2(o.k):siteSprite(o.k);{const dx=px+TILE/2-img.lw/2,dy=(o.y+1)*TILE-img.lh+4;blit(c,o,img,dx,dy,img.lw,img.lh,under);
      if(o.k==='shrine'||o.k==='stone'||o.k==='well'){c.save();c.globalCompositeOperation='lighter';c.fillStyle=rg(c,px+TILE/2,dy+img.lh-36,2,26,[`rgba(150,220,255,${.25+.15*Math.sin(t*3+o.id)})`,'rgba(150,220,255,0)']);c.fillRect(px-10,dy+img.lh-64,TILE+20,56);c.restore();if(lights)lights.push({x:px+TILE/2,y:dy+img.lh-36,r:80,col:'rgba(150,220,255,.5)'})}}return;
    case'res':img=resPile(o.res);c.drawImage(img,px,(o.y+1)*TILE-img.lh+4,img.lw,img.lh);
      if((Math.floor(t*2+o.id)%5)===0){const a=Math.abs(Math.sin(t*6+o.id));c.fillStyle=`rgba(255,255,255,${a*.8})`;const sx=px+10+(o.id*7)%28,sy=(o.y+1)*TILE-30-(o.id*3)%16;c.fillRect(sx-3,sy,6,1.2);c.fillRect(sx-.6,sy-3,1.2,6)}return;
    case'chest':img=chestSprite();c.drawImage(img,px,(o.y+1)*TILE-img.lh+4,img.lw,img.lh);return;
    case'art':{const b=Math.sin(t*2.4+o.id)*3;shadowE(c,px+TILE/2,(o.y+1)*TILE-4,13,4,.4);const ic=artIcon(o.art);c.save();c.globalCompositeOperation='lighter';c.globalAlpha=.4+.2*Math.sin(t*3+o.id);c.drawImage(glowSprite('rgba(255,230,150,.9)',96),px-24,(o.y+1)*TILE-62+b,96,96);c.restore();c.drawImage(ic,px+2,(o.y+1)*TILE-48+b,44,44);return}
    case'mon':{const cr=CR[o.cr];const sp=creatureSprite(o.cr,(o.id&1)===1);const k=(cr.big?1.22:1.02)*(cr.tier>=6?1.1:1);const w=96*k;const bob=Math.sin(t*2.2+o.id*1.7)*1.8;
      shadowE(c,px+TILE/2,(o.y+1)*TILE-2,22*k,6*k,.5);if(o.fresh&&G.day-o.fresh<=2){c.save();c.translate(px+TILE/2,(o.y+1)*TILE-4);c.scale(1,.42);c.strokeStyle=`rgba(120,255,200,${.55+.35*Math.sin(t*5)})`;c.lineWidth=3;c.beginPath();c.arc(0,0,26+Math.sin(t*3)*3,0,6.28);c.stroke();c.restore()}c.save();c.translate(px+TILE/2,(o.y+1)*TILE+2);c.scale(1,1+Math.sin(t*2.2+o.id*1.7)*.014);c.drawImage(sp,-w/2,-w+bob+4,w,w);c.restore();return}
  }
}
function decalAt(tc,x,y,tr){
  const h1=hash2(x,y,21),h2=hash2(x,y,22),h3=hash2(x,y,23);const ox=x*TILE+6+h2*(TILE-12),oy=y*TILE+6+h3*(TILE-12);
  switch(tr){
    case GRASS:if(h1<.20){tc.strokeStyle='rgba(30,90,30,.8)';tc.lineWidth=1.2;for(let i=-2;i<=2;i++){tc.beginPath();tc.moveTo(ox+i*1.8,oy+3);tc.quadraticCurveTo(ox+i*2.6,oy-2,ox+i*3.4,oy-5-Math.abs(i));tc.stroke()}}
      else if(h1<.30){for(let i=0;i<3;i++){tc.fillStyle=['#fff','#ffe46a','#ff9ac0','#b8a0ff'][(x+y+i)%4];tc.beginPath();tc.arc(ox+i*3-3,oy+(i%2)*2,1.5,0,6.28);tc.fill()}}
      else if(h1<.33){tc.fillStyle='#e8e0d0';tc.fillRect(ox-.8,oy,1.6,3);ell(tc,ox,oy,3.2,2,'#c0342a');tc.fillStyle='rgba(255,255,255,.8)';tc.fillRect(ox-1,oy-1,1,1)}
      else if(h1<.37){ell(tc,ox,oy+1,3.4,2,'#7a786e');ell(tc,ox-.6,oy,2.4,1.3,'#a8a69a')}break;
    case DIRT:if(h1<.2){ell(tc,ox,oy,2.4,1.5,'#6a5238');ell(tc,ox-.4,oy-.4,1.5,.9,'#a89070')}else if(h1<.24){tc.strokeStyle='#e8e0cc';tc.lineWidth=1.4;tc.beginPath();tc.moveTo(ox-3,oy);tc.lineTo(ox+3,oy+1);tc.stroke();ell(tc,ox+3,oy+1,1.4,1.4,'#e8e0cc')}break;
    case SAND:if(h1<.14){tc.strokeStyle='rgba(150,115,55,.4)';tc.lineWidth=1;tc.beginPath();tc.moveTo(ox-6,oy);tc.quadraticCurveTo(ox,oy-3,ox+6,oy);tc.stroke()}else if(h1<.19){ell(tc,ox,oy,2.6,2,'#f4d6c0');tc.strokeStyle='#caa088';tc.lineWidth=.7;tc.beginPath();tc.moveTo(ox,oy-2);tc.lineTo(ox,oy+2);tc.stroke()}break;
    case SNOW:if(h1<.16){ell(tc,ox,oy,6,2,'rgba(150,180,220,.35)')}else if(h1<.22){tc.strokeStyle='rgba(180,220,255,.9)';tc.lineWidth=1;for(let i=0;i<3;i++){tc.beginPath();tc.moveTo(ox,oy);tc.lineTo(ox+Math.cos(i*2.1)*4,oy+Math.sin(i*2.1)*4);tc.stroke()}}break;
    case SWAMP:if(h1<.16){ell(tc,ox,oy,4,2.4,'#3c7a3a');tc.fillStyle='#4a8a44';tc.beginPath();tc.moveTo(ox,oy);tc.lineTo(ox+4,oy-1);tc.lineTo(ox+4,oy+1);tc.fill();ell(tc,ox-1,oy-.6,1.2,.8,'#ffa8d0')}else if(h1<.26){tc.strokeStyle='#4a6a30';tc.lineWidth=1.2;for(let i=-1;i<=1;i++){tc.beginPath();tc.moveTo(ox+i*2,oy+3);tc.lineTo(ox+i*2.6,oy-5);tc.stroke()}ell(tc,ox,oy-5,1.2,2.4,'#6a4a2a')}break;
    case ROUGH:if(h1<.2){ell(tc,ox,oy+1,3.4,2,'#4a463c');ell(tc,ox-.8,oy,2.2,1.3,'#9a9484')}else if(h1<.26){ell(tc,ox,oy,2,1.4,'#5a564c');ell(tc,ox+4,oy+2,1.5,1,'#6e6a5e')}break;
    case ASH:if(h1<.16){tc.strokeStyle='rgba(255,110,30,.8)';tc.lineWidth=1.2;tc.beginPath();tc.moveTo(ox-4,oy);tc.lineTo(ox,oy+2);tc.lineTo(ox+4,oy-1);tc.stroke()}else if(h1<.22){ell(tc,ox,oy,2.4,1.6,'#241a1a');ell(tc,ox-.4,oy-.4,1.4,.8,'#5a4040')}break;
    case SUBT:if(h1<.12){tc.fillStyle='#d8d0e0';tc.fillRect(ox-.7,oy,1.4,3);ell(tc,ox,oy,3.2,2,['#c04a8a','#5ae8ff','#8a7aff'][(x*3+y)%3]);tc.fillStyle='rgba(255,255,255,.9)';tc.fillRect(ox-1,oy-1,1,1)}else if(h1<.19){poly(tc,[[ox-2,oy+2],[ox,oy-4],[ox+2,oy+2]],'#7ad8ff',OUT,.6)}else if(h1<.23){tc.strokeStyle='#e0dccc';tc.lineWidth=1.2;tc.beginPath();tc.moveTo(ox-3,oy);tc.lineTo(ox+3,oy+1);tc.stroke();ell(tc,ox+3,oy+1,1.5,1.5,'#e0dccc')}break;
  }
}
const TREEY=new Set([GRASS,SWAMP]);
const AMBK={[GRASS]:'pollen',[SNOW]:'snow',[ASH]:'ember',[LAVA]:'ember',[SAND]:'dust',[ROUGH]:'dust',[DIRT]:'dust',[SWAMP]:'fly',[WATER]:'pollen',[SUBT]:'spore'};
function updateAmbient(dt,under){
  S.amb=S.amb||[];const m=G.map;const cx=clamp(Math.floor((S.cam.x+VPW/2)/TILE),0,m.w-1),cy=clamp(Math.floor((S.cam.y+VPH/2)/TILE),0,m.h-1);const tr=m.terr[cy*m.w+cx];const kind=under?'spore':AMBK[tr]||'pollen';
  while(S.amb.length<46)S.amb.push({k:kind,x:S.cam.x+Math.random()*VPW,y:S.cam.y+Math.random()*VPH,ph:Math.random()*6.28,l:Math.random()*8});
  for(const p of S.amb){p.l+=dt;p.k=kind;const sp=p.k==='snow'?[10,60]:p.k==='ember'?[8,-34]:p.k==='dust'?[40,3]:p.k==='spore'?[2,-5]:[4,-2];
    p.x+=(sp[0]+Math.sin(p.l*1.3+p.ph)*10)*dt;p.y+=(sp[1]+Math.cos(p.l*1.1+p.ph)*6)*dt;
    if(p.x<S.cam.x-20||p.x>S.cam.x+VPW+20||p.y<S.cam.y-20||p.y>S.cam.y+VPH+20){p.x=S.cam.x+(sp[0]>20?-10:Math.random()*VPW);p.y=S.cam.y+(sp[1]>20?-10:sp[1]<-20?VPH+10:Math.random()*VPH);}}
}
function drawAmbient(c,t){
  for(const p of S.amb||[]){const k=p.k;
    if(k==='snow'){c.fillStyle='rgba(255,255,255,.85)';c.fillRect(p.x,p.y,2.2,2.2)}
    else if(k==='ember'){c.globalCompositeOperation='lighter';c.fillStyle=`rgba(255,${120+Math.sin(p.l*8+p.ph)*60|0},40,${.5+.3*Math.sin(p.l*6)})`;c.fillRect(p.x,p.y,2.4,2.4);c.globalCompositeOperation='source-over'}
    else if(k==='dust'){c.fillStyle='rgba(230,215,170,.22)';c.fillRect(p.x,p.y,6,1.2)}
    else if(k==='spore'){c.globalCompositeOperation='lighter';c.globalAlpha=.55+.35*Math.sin(p.l*3+p.ph);c.drawImage(glowSprite(p.ph>3?'rgba(200,120,255,1)':'rgba(120,230,255,1)',32),p.x-6,p.y-6,12,12);c.globalAlpha=1;c.globalCompositeOperation='source-over'}
    else if(k==='fly'){c.globalCompositeOperation='lighter';c.globalAlpha=.3+.6*Math.max(0,Math.sin(p.l*2.2+p.ph));c.drawImage(glowSprite('rgba(220,255,120,1)',32),p.x-7,p.y-7,14,14);c.globalAlpha=1;c.globalCompositeOperation='source-over'}
    else{c.fillStyle=p.ph>3?'rgba(255,240,140,.7)':'rgba(255,255,255,.65)';c.fillRect(p.x,p.y+Math.sin(p.l*4+p.ph)*2,1.8,1.8)}}
}
let _DK=null;
function advDraw(dt){
  const c=ctx,m=G.map,t=S.clock;
  computeVis();
  const lvl=levelOf(m,Math.floor((S.cam.y+VPH/2)/TILE)),under=lvl===1;S.lvl=lvl;
  const lights=[];
  c.save();c.beginPath();c.rect(0,0,VPW,VPH);c.clip();
  const cx=Math.round(S.cam.x+(UI.shake?(Math.random()-.5)*UI.shake*6:0)),cy=Math.round(S.cam.y);
  if(S.fx&&S.fx.zoom!==1){const fx=S.fx.gx-cx,fy=S.fx.gy-cy;c.translate(fx,fy);c.scale(S.fx.zoom,S.fx.zoom);c.translate(-fx,-fy)}
  c.translate(-cx,-cy);
  const x0=Math.max(0,Math.floor(cx/TILE)-1),y0=Math.max(0,Math.floor(cy/TILE)-1),x1=Math.min(m.w-1,Math.floor((cx+VPW)/TILE)+1),y1=Math.min(m.h-1,Math.floor((cy+VPH)/TILE)+2);
  const wf=Math.floor(t*2.5)%6;
  const terrAt=(x,y)=>x<0||y<0||x>=m.w||y>=m.h?-1:m.terr[y*m.w+x];
  const TLw=(x1-x0+1)*TILE,TLh=(y1-y0+1)*TILE;
  const TLS=UI.scale>1.5?2:UI.scale>1?1.5:1; // píxeles de canvas por píxel lógico realmente necesarios
  if(!S.TL||S.TL.lw!==TLw||S.TL.lh!==TLh||S.TLS!==TLS){S.TL=document.createElement('canvas');S.TL.width=Math.ceil(TLw*TLS);S.TL.height=Math.ceil(TLh*TLS);S.TL.lw=TLw;S.TL.lh=TLh;S.TLS=TLS;S.TLkey=null}
  const tlKey=x0+','+y0+','+(S.TLliq?wf:0)+','+(S.noTint?1:0);
  if(S.TLkey!==tlKey){ // (re)pintar el terreno solo si la ventana de casillas o la fase del agua cambian
  const tc=S.TL.getContext('2d');tc.setTransform(TLS,0,0,TLS,0,0);tc.translate(-x0*TILE,-y0*TILE);tc.imageSmoothingEnabled=true;
  const tlLights=[];let liq=false;
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){
    const i=y*m.w+x,tr=m.terr[i],hv=Math.floor(hash2(x,y,3)*6);const px=x*TILE,py=y*TILE;
    tc.drawImage((tr===WATER||tr===LAVA)?Gfx.tiles[tr][(wf+hv)%6]:Gfx.tiles[tr][hv],px,py,TILE,TILE);
    const nb=[terrAt(x,y-1),terrAt(x+1,y),terrAt(x,y+1),terrAt(x-1,y)];
    for(let s=0;s<4;s++){const n=nb[s];if(n<0||n===tr)continue;
      const lq=tr===WATER||tr===LAVA,nq=n===WATER||n===LAVA;
      if(lq){if(!nq)tc.drawImage((tr===WATER?Gfx.shoreW:Gfx.lavaW)[s],px,py,TILE,TILE)}
      else if(nq){tc.drawImage((n===WATER?Gfx.shoreL:Gfx.lavaL)[s],px,py,TILE,TILE)}
      else if(TPRIO[n]>TPRIO[tr]&&Gfx.edges[n])tc.drawImage(Gfx.edges[n][s],px,py,TILE,TILE)}
    if(tr===LAVA){tlLights.push({x:px+TILE/2,y:py+TILE/2,r:56,col:'rgba(255,140,50,.38)'})}
    if(tr===WATER||tr===LAVA)liq=true;
  }
  // decoración del suelo (matas, flores, huesos...)
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const i=y*m.w+x;const tr=m.terr[i];if(m.deco[i]||m.fp[i]||m.road[i]||tr===WATER||tr===LAVA)continue;decalAt(tc,x,y,tr)}
  // variación suave de luz a gran escala
  if(!S.noTint)for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const n=NZ(x/10,y/10)*.7+NZ(x/5+40,y/5)*.3;if(m.terr[y*m.w+x]===WATER||m.terr[y*m.w+x]===LAVA)continue;tc.fillStyle=n>.5?`rgba(255,255,220,${(n-.5)*.16})`:`rgba(0,0,30,${(.5-n)*.2})`;tc.fillRect(x*TILE,y*TILE,TILE,TILE)}
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){if(!m.road[y*m.w+x])continue;tc.drawImage(Gfx.road[8],x*TILE,y*TILE,TILE,TILE);
    Gfx.roadDirs.forEach((d,k)=>{const nx=x+d[0],ny=y+d[1];if(nx>=0&&ny>=0&&nx<m.w&&ny<m.h&&m.road[ny*m.w+nx])tc.drawImage(Gfx.road[k],x*TILE,y*TILE,TILE,TILE)})}
  S.TLkey=tlKey;S.TLliq=liq;S.TLlights=tlLights}
  for(const l of S.TLlights)lights.push(l);
  c.drawImage(S.TL,x0*TILE,y0*TILE,TLw,TLh);
  // elementos ordenados por y
  const L=[];
  for(let y=y0;y<=y1+2;y++)for(let x=x0;x<=x1;x++){if(y>=m.h)continue;const d=m.deco[y*m.w+x];if(!d)continue;
    if(!isExpl(x,y)&&!isVis(x,y))continue;const tr=m.terr[y*m.w+x];
    L.push({y:y+1,f:()=>{const sp=decorSprite(tr,d,Math.floor(hash2(x,y,9)*5));const bx=x*TILE+TILE/2,by=(y+1)*TILE;
      if(!under){c.save();c.translate(bx,by);c.transform(1,0,-.5,-.3,0,0);c.globalAlpha=.5;c.drawImage(silhouette(sp),-32,-76,64,84);c.restore()}
      const tree=d<4&&TREEY.has(tr)||d<4&&tr===SNOW;const sw=tree?Math.sin(t*1.5+x*.9+y*.5)*.03:0;
      c.save();c.translate(bx,by);if(sw)c.transform(1,0,sw,1,0,0);c.drawImage(sp,-32,-76,64,84);c.restore();
      if(tr===SUBT&&d===2)lights.push({x:bx,y:by-26,r:80,col:'rgba(120,220,255,.5)'});else if(tr===SUBT&&d===3)lights.push({x:bx,y:by-20,r:60,col:'rgba(220,100,200,.4)'});else if(tr===ASH&&d===1)lights.push({x:bx,y:by-30,r:50,col:'rgba(255,120,40,.35)'})}})}
  const seenObj=new Set();
  for(let y=y0;y<=y1+3;y++)for(let x=x0-4;x<=x1;x++){if(x<0||y<0||y>=m.h)continue;const fp=m.fp[y*m.w+x];if(!fp||seenObj.has(fp))continue;seenObj.add(fp);const o=m.objs[fp-1];if(o.dead)continue;
    const ex=o.x+o.ex,ey=o.y+o.ey,vis=isVis(ex,ey),expl=isExpl(ex,ey)||vis;if(!expl)continue;
    if(o.t==='mon'&&!vis)continue;
    L.push({y:o.y+o.h,f:()=>{if(!vis&&!(o.t==='town'||o.t==='mine'))c.globalAlpha=.8;drawObjSprite(o,t,under,vis?lights:null);c.globalAlpha=1;
      if(S.hov&&S.hov.o===o){c.save();c.globalCompositeOperation='lighter';c.globalAlpha=.18;drawObjSprite(o,t,under,null);c.restore()}}})}
  for(const h of G.heroes){if(!h.alive||h.x<0)continue;const hx=h.ax!=null?h.ax:h.x,hy=h.ay!=null?h.ay:h.y;if(h.pid!==0&&!isVis(Math.round(hx),Math.round(hy)))continue;
    L.push({y:hy+1,f:()=>{drawHeroOnMap(h,hx,hy,t);lights.push({x:hx*TILE+TILE/2,y:hy*TILE+TILE/2,r:150,col:'rgba(255,230,180,.55)'})}})}
  L.sort((a,b)=>a.y-b.y);for(const e of L)e.f();
  drawPath(c,t);
  if(S.hov&&S.hov.tx!=null&&UI.mx<VPW)drawHoverCursor(c);
  FX.draw(c,0,0);
  updateAmbient(dt,under);drawAmbient(c,t);
  c.restore();
  // sombras de nubes (superficie) o oscuridad con luces (subsuelo)
  if(!S.fx){
    if(!under){c.save();c.beginPath();c.rect(0,0,VPW,VPH);c.clip();c.globalAlpha=.6;const tx=cloudTex(),sz=640,ox=-((S.cam.x*.92+t*14)%sz),oy=-((S.cam.y*.92+t*5)%sz);for(let X=ox-sz;X<VPW;X+=sz)for(let Y=oy-sz;Y<VPH;Y+=sz)c.drawImage(tx,X,Y,sz,sz);c.restore()}
    else{
      if(!_DK){_DK=document.createElement('canvas');_DK.width=VPW;_DK.height=VPH}const dk=_DK.getContext('2d');dk.globalCompositeOperation='source-over';dk.clearRect(0,0,VPW,VPH);dk.fillStyle='rgba(6,3,16,.74)';dk.fillRect(0,0,VPW,VPH);dk.globalCompositeOperation='destination-out';
      for(const l of lights){const sx=l.x-cx,sy=l.y-cy;if(sx<-200||sy<-200||sx>VPW+200||sy>VPH+200)continue;const g=glowSprite('rgba(0,0,0,1)',128);dk.drawImage(g,sx-l.r,sy-l.r,l.r*2,l.r*2)}
      c.drawImage(_DK,0,0);c.save();c.globalCompositeOperation='lighter';for(const l of lights){const sx=l.x-cx,sy=l.y-cy;if(sx<-200||sy<-200||sx>VPW+200||sy>VPH+200)continue;c.globalAlpha=.55;c.drawImage(glowSprite(l.col,128),sx-l.r*.9,sy-l.r*.9,l.r*1.8,l.r*1.8)}c.restore()}
  }
  c.save();c.beginPath();c.rect(0,0,VPW,VPH);c.clip();
  if(!S.fx&&!S.noFog)drawFog(c,cx,cy,x0,y0,x1,y1);
  try{postFX(c,0,0,VPW,VPH,{mood:S.lvl?'cave':'day',bloom:.16})}catch(e){c.fillStyle=rg(c,VPW/2,VPH/2,VPH*.45,VPW*.75,['rgba(0,0,0,0)','rgba(8,4,16,.42)']);c.fillRect(0,0,VPW,VPH)}c.restore();
}
const NZ=noise2(4242);
let _fogC=null,_fogB=null,_fogM=null,_fogMk='',_fogDirty=true;
function drawFog(c,cx,cy,x0,y0,x1,y1){
  const w=x1-x0+1,h=y1-y0+1;if(!_fogC||_fogC.width!==w||_fogC.height!==h){_fogC=document.createElement('canvas');_fogC.width=w;_fogC.height=h;_fogDirty=true}
  const m=G.map,fog=G.players[0].fog;
  const msk=new Uint8Array(w*h);
  for(let j=0;j<h;j++)for(let i=0;i<w;i++){const x=x0+i,y=y0+j;let a=0;
    if(x>=m.w||y>=m.h)a=255;else if(isVis(x,y))a=0;else if(fog[y*m.w+x])a=110;else a=255;msk[j*w+i]=a}
  let same=_fogM&&_fogM.length===msk.length&&_fogMk===x0+','+y0+','+w;if(same)for(let q=0;q<msk.length;q++)if(msk[q]!==_fogM[q]){same=false;break}
  if(!same){_fogM=msk;_fogMk=x0+','+y0+','+w;_fogDirty=true}
  if(_fogDirty){const fx=_fogC.getContext('2d'),img=fx.createImageData(w,h);
    for(let q=0;q<msk.length;q++){const k=q*4;img.data[k]=6;img.data[k+1]=4;img.data[k+2]=16;img.data[k+3]=msk[q]}
    fx.putImageData(img,0,0)}
  c.save();c.beginPath();c.rect(0,0,VPW,VPH);c.clip();c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';
  // se amplía con suavizado -> bordes difuminados
  if(!_fogB||_fogB.width!==w*12||_fogB.height!==h*12){_fogB=document.createElement('canvas');_fogB.width=w*12;_fogB.height=h*12;_fogDirty=true}
  if(_fogDirty){const bx=_fogB.getContext('2d');bx.clearRect(0,0,_fogB.width,_fogB.height);bx.imageSmoothingEnabled=true;bx.filter='blur(7px)';bx.drawImage(_fogC,-6,-6,_fogB.width+12,_fogB.height+12);bx.filter='none';_fogDirty=false}
  c.drawImage(_fogB,x0*TILE-cx,y0*TILE-cy,w*TILE,h*TILE);c.restore();
}
function drawHeroOnMap(h,hx,hy,t){
  const c=ctx,p=G.players[h.pid];const moving=h.moving;const fr=moving?Math.floor(t*9)%2:0;const sp=h.boat?shipHeroSprite(p.col,fr):heroSprite(p.col,fr);
  const px=hx*TILE+TILE/2,py=(hy+1)*TILE;const flip=h.face===-1;
  if(h.id===S.sel&&h.pid===0){c.save();c.translate(px,py-4);c.scale(1,.34);c.strokeStyle=`rgba(255,235,140,${.65+.3*Math.sin(t*5)})`;c.lineWidth=5;c.beginPath();c.arc(0,0,27,0,6.28);c.stroke();c.restore()}
  const bob=moving?Math.abs(Math.sin(t*18))*-2.4:Math.sin(t*2+h.id)*-.8;
  c.save();c.translate(px,py+2+(h.boat?Math.sin(t*2.2+h.id)*2:bob));if(flip)c.scale(-1,1);if(h.boat)c.drawImage(sp,-36,-62,72,72);else c.drawImage(sp,-32-4,-68,64,72);c.restore();
  if(moving&&Math.random()<.5)FX.add({x:px-(flip?-1:1)*18+(Math.random()-.5)*8,y:py-3,vx:-(flip?-1:1)*12,vy:-8-Math.random()*8,col:'rgba(190,160,110,.7)',size:2+Math.random()*2,life:.55,shrink:true});
}
function drawPath(c,t){
  if(!S.path||!S.path.length)return;const h=selHero();if(!h)return;let mp=h.mp,reach=true;
  S.path.forEach((s,i)=>{const cost=s.c;if(reach&&mp<cost&&!(mp>=50))reach=false;if(reach)mp-=cost;
    const col=reach?'rgba(120,255,140,':'rgba(255,100,90,';const px=s.x*TILE+TILE/2,py=s.y*TILE+TILE/2;
    const last=i===S.path.length-1;
    if(last){c.save();c.translate(px,py);c.strokeStyle=col+'1)';c.lineWidth=3.4;const k=8+Math.sin(t*6)*1.2;c.beginPath();c.moveTo(-k,-k);c.lineTo(k,k);c.moveTo(k,-k);c.lineTo(-k,k);c.stroke();c.restore()}
    else{const nx=S.path[i+1],a=Math.atan2(nx.y-s.y,nx.x-s.x);c.save();c.translate(px,py);c.rotate(a);c.fillStyle=col+'.85)';c.strokeStyle='rgba(0,0,0,.55)';c.lineWidth=1;c.beginPath();c.moveTo(7,0);c.lineTo(-4,-5);c.lineTo(-1,0);c.lineTo(-4,5);c.closePath();c.fill();c.stroke();c.restore()}});
}
// ---------- minimapa ----------
const TCOLM={[WATER]:[44,108,181],[GRASS]:[88,150,58],[DIRT]:[143,110,70],[SAND]:[220,192,124],[SNOW]:[230,238,246],[SWAMP]:[74,106,60],[ROUGH]:[128,120,104],[ASH]:[74,59,57],[LAVA]:[220,80,16],[SUBT]:[70,60,86]};
function buildMini(){
  const m=G.map,c=document.createElement('canvas');c.width=m.w;c.height=m.h;const x=c.getContext('2d'),img=x.createImageData(m.w,m.h);
  for(let i=0;i<m.w*m.h;i++){const col=TCOLM[m.terr[i]];let r=col[0],g=col[1],b=col[2];if(m.deco[i]){r*=.55;g*=.62;b*=.55}if(m.road[i]){r=176;g=140;b=96}img.data[i*4]=r;img.data[i*4+1]=g;img.data[i*4+2]=b;img.data[i*4+3]=255}
  x.putImageData(img,0,0);S.mini=c;S.miniFog=document.createElement('canvas');S.miniFog.width=m.w;S.miniFog.height=m.h;S.miniFogN=-1;
}
function updateMiniFog(){
  const m=G.map,fog=G.players[0].fog;let n=0;for(let i=0;i<fog.length;i+=7)n+=fog[i];const key=n;if(key===S.miniFogN&&S.miniT>0)return;S.miniFogN=key;
  const x=S.miniFog.getContext('2d'),img=x.createImageData(m.w,m.h);for(let i=0;i<m.w*m.h;i++){img.data[i*4]=4;img.data[i*4+1]=2;img.data[i*4+2]=10;img.data[i*4+3]=fog[i]?0:235}x.putImageData(img,0,0);S.miniT=1;
}
function switchLevel(){const m=G.map,off=m.lh+2;const cx=(S.cam.x+VPW/2)/TILE,cy=(S.cam.y+VPH/2)/TILE;camTo(cx,S.lvl?cy-off:cy+off,true)}
function drawMinimap(x,y,sz){
  const m=G.map,c=ctx,sc=sz/m.w,lvl=S.lvl||0,y0=lvl*(m.lh+2);updateMiniFog();
  panel(x-6,y-6,sz+12,sz+12,{plain:1,r:6,noshadow:1});
  c.save();c.beginPath();c.rect(x,y,sz,sz);c.clip();c.imageSmoothingEnabled=true;c.drawImage(S.mini,0,y0,m.w,m.lh,x,y,sz,sz);
  const fog=G.players[0].fog;
  for(const o of objsWhere('mm',o=>o.t==='town'||o.t==='mine'||o.t==='gate')){if(o.dead||levelOf(m,o.y)!==lvl||!(o.t==='town'||(o.t==='mine'&&o.owner>=0)||o.t==='gate'))continue;const ex=o.x+o.ex,ey=o.y+o.ey;if(!fog[ey*m.w+ex]&&o.owner!==0)continue;
    const col=o.t==='gate'?'#ffd890':o.owner>=0?G.players[o.owner].col:'#bbb';c.fillStyle='#000';const s=o.t==='town'?5:3;const px=x+(o.x+o.w/2)*sc,py=y+(o.y-y0+o.h/2)*sc;c.fillRect(px-s/2-1,py-s/2-1,s+2,s+2);c.fillStyle=col;c.fillRect(px-s/2,py-s/2,s,s)}
  c.drawImage(S.miniFog,0,y0,m.w,m.lh,x,y,sz,sz);
  for(const h of G.heroes){if(!h.alive||h.x<0||levelOf(m,h.y)!==lvl)continue;if(h.pid!==0&&!isVis(h.x,h.y))continue;c.fillStyle='#000';c.fillRect(x+h.x*sc-3,y+(h.y-y0)*sc-3,6,6);c.fillStyle=G.players[h.pid].col;c.fillRect(x+h.x*sc-2,y+(h.y-y0)*sc-2,4,4)}
  {const vi=m.vic;if(vi&&vi.x!=null&&lvl===0&&(vi.t==='grail'||vi.t==='capital')){const g=vi.t==='grail',px=x+(vi.x+(g?((vi.x*31)%17-8):0))*sc,py=y+(vi.y+(g?((vi.y*17)%15-7):0)-y0)*sc;c.strokeStyle=`rgba(255,220,80,${.6+.4*Math.sin(S.t*4)})`;c.lineWidth=2;c.beginPath();c.arc(px,py,g?22:8,0,6.28);c.stroke()}}
  c.strokeStyle='#fff';c.lineWidth=1.4;c.strokeRect(x+S.cam.x/TILE*sc,y+(S.cam.y/TILE-y0)*sc,VPW/TILE*sc,VPH/TILE*sc);c.restore();
  const go=e=>{S.flyTo=null;S.cam.x=(e.x-x)/sc*TILE-VPW/2;S.cam.y=((e.y-y)/sc+y0)*TILE-VPH/2;clampCam()};
  hit(x,y,sz,sz,go,{down:e=>{S.mmDrag=true;go(e)},cursor:'crosshair'});
  if(UI.down&&S.mmDrag&&hovered(x,y,sz,sz))go({x:UI.mx,y:UI.my});if(!UI.down)S.mmDrag=false;
  button(x+2,y+sz-24,90,22,'Objetivos',()=>openObjectives(),{size:11,tip:'Condición de victoria y misiones (tecla O)'});
  button(x+sz-92,y+sz-24,90,22,lvl?'▲ Superficie':'▼ Subsuelo',()=>switchLevel(),{size:11,tip:'Cambiar de nivel (la cámara pasa al otro mundo)'});
}
// ciudad seleccionada: aro, nombre y botones
function drawTownSel(){
  const t=S.selTown;if(!t||t.dead||t.owner!==0||S.scr!=='adv'||S.fx){return}
  const x=t.x*TILE-S.cam.x,y=t.y*TILE-S.cam.y,w=t.w*TILE,hh=t.h*TILE;
  if(x<VPW&&y<VPH){ctx.save();ctx.beginPath();ctx.rect(0,0,VPW,VPH);ctx.clip();ctx.strokeStyle=`rgba(255,226,122,${.65+.3*Math.sin(S.t*6)})`;ctx.lineWidth=3;ctx.setLineDash([10,6]);ctx.lineDashOffset=-S.t*20;ctx.strokeRect(x-6,y-6,w+12,hh+12);ctx.restore()}
  const bx=VPW/2-250,by=VPH-62;rrect(ctx,bx,by,500,52,10,'rgba(16,10,22,.88)','#c8a24a',1.6);
  text(t.name,bx+14,by+22,{size:15,bold:true,color:'#ffe9a0'});text(`${FDEF[t.fi].name} · guarnición ${t.gar.filter(s=>s&&s.n>0).length}/7`,bx+14,by+40,{size:12,color:'#d8c8a0'});
  button(bx+260,by+8,110,36,'Entrar',()=>{S.selTown=null;const hh2=heroAt(t.x+t.ex,t.y+t.ey);openTown(t,hh2&&hh2.pid===0?hh2:null)},{primary:1,size:15});
  const h=selHero();button(bx+378,by+8,114,36,'Mover héroe',()=>{if(!h)return;const path=planPath(h,t.x+t.ex,t.y+t.ey);if(!path){toast('No hay camino hasta allí','bad');return}S.selTown=null;h.path=path;S.path=path;S.target={x:t.x+t.ex,y:t.y+t.ey};startMove(h)},{size:13,disabled:!h||(h.x===t.x+t.ex&&h.y===t.y+t.ey),tip:'Enviar el héroe seleccionado a esta ciudad'});
}
// ---------- panel lateral ----------
function drawSidePanel(dt){
  drawTownSel();
  const c=ctx,px=VPW,pw=VW-VPW;const p=G.players[0];
  c.fillStyle=lg(c,px,0,px+pw,0,['#241a1a','#1a1220']);c.fillRect(px,0,pw,VH);c.strokeStyle='#c8a24a';c.lineWidth=3;c.beginPath();c.moveTo(px,0);c.lineTo(px,VH);c.stroke();
  drawMinimap(px+16,16,240);
  // calendario
  const day=(G.day-1)%7+1,week=Math.floor((G.day-1)/7)%4+1,month=Math.floor((G.day-1)/28)+1;
  rrect(c,px+10,274,pw-20,30,6,'rgba(0,0,0,.4)','#7a6a48',1.2);text(`Mes ${month} · Semana ${week} · Día ${day}`,px+pw/2,295,{size:15,bold:true,align:'center',color:'#ffe9a0'});
  if(G.week&&G.week.t!=='normal')text(weekLabel(G.week),px+pw/2,317,{size:11,bold:true,align:'center',color:G.week.t==='plague'?'#ff8a7a':'#9affc8'});
  // héroes
  text('HÉROES',px+14,326,{size:12,bold:true,color:'#c8a24a'});
  const hs=myHeroes();
  for(let i=0;i<8;i++){const x=px+14+(i%4)*64,y=334+Math.floor(i/4)*72;const h=hs[i];
    if(h){const sel=h.id===S.sel;const hov=hit(x,y,58,58,()=>{if(sel&&S.lastClick&&S.t-S.lastClick<.4)openHeroScreen(h);else selectHero(h);S.lastClick=S.t},{tip:[h.name,`Nivel ${h.lvl} · ${hstat(h).a}/${hstat(h).d}/${hstat(h).sp}/${hstat(h).kn}`,'Clic: seleccionar · doble clic: ficha']});
      c.drawImage(portrait(h.fi,h.port,h.cls),x,y,58,58);if(sel){c.strokeStyle='#ffe27a';c.lineWidth=3;c.strokeRect(x-1,y-1,60,60)}if(hov){c.fillStyle='rgba(255,255,255,.12)';c.fillRect(x,y,58,58)}
      bar(x,y+60,58,7,h.mp/maxMP(h),'#5ad87a','#2a8a4a');if(h.sleep){text('Zzz',x+29,y+18,{size:14,bold:true,align:'center',color:'#bfe8ff'})}}
    else{rrect(c,x,y,58,58,4,'rgba(0,0,0,.35)','#3a2e22',1)}}
  // ciudades
  text('CIUDADES',px+14,490,{size:12,bold:true,color:'#c8a24a'});
  const ts=ownedTowns(0);
  for(let i=0;i<8;i++){const x=px+14+(i%4)*64,y=498+Math.floor(i/4)*34;const t=ts[i];
    if(t){const hov=hit(x,y,58,30,()=>{if(S.selTown===t){S.selTown=null;const hh=heroAt(t.x+t.ex,t.y+t.ey);openTown(t,hh&&hh.pid===0?hh:null)}else{S.selTown=t;S.sel=null;S.path=null;S.target=null;S.exTarget=null;camTo(t.x+2,t.y+1)}},{tip:[t.name,FDEF[t.fi].name,'Clic: seleccionar (suelta al héroe) · otro clic: entrar']});
      rrect(c,x,y,58,30,4,lg(c,0,y,0,y+30,[hov?'#5a4a30':'#3a2e22','#1a1410']),FDEF[t.fi].col[0],1.4);
      c.drawImage(townSprite(t.fi).c,x+2,y+2,54,26*1.2,);}
    else rrect(c,x,y,58,30,4,'rgba(0,0,0,.35)','#3a2e22',1)}
  // botones
  const h=selHero(),by=578;
  button(px+12,by,118,32,'Siguiente',()=>nextHero(),{size:14,tip:'Seleccionar el siguiente héroe con movimiento (Espacio)'});
  button(px+142,by,118,32,h&&h.sleep?'Despertar':'Dormir',()=>{if(h){h.sleep=!h.sleep;h.path=null;S.path=null}},{size:14,disabled:!h});
  button(px+12,by+38,118,32,'Héroe',()=>h&&openHeroScreen(h),{size:14,disabled:!h,tip:'Ficha del héroe (H)'});
  button(px+142,by+38,118,32,'Sistema',()=>openSystemMenu(),{size:14,tip:'Guardar, cargar, opciones'});
  const busy=!!(S.mov||S.ai||G.busy||S.anim||S.fx||UI.modals.length);
  button(px+12,by+76,248,40,S.ai?'Turnos rivales…':'FIN DEL TURNO',()=>endTurn(),{primary:1,size:17,disabled:busy,tip:'Terminar el turno (E)'});
}
function drawTopBar(){
  const c=ctx,p=G.players[0],inc=incomeOf(p);
  c.save();c.globalAlpha=.94;rrect(c,8,6,VPW-16,38,8,lg(c,0,6,0,44,['rgba(40,30,36,.95)','rgba(18,12,24,.95)']),'#c8a24a',1.6);c.restore();
  let x=22;for(const r of RES){const v=p.res[r];hit(x-4,10,100,30,null,{tip:[RESN[r],`Tienes ${v}`,`Ingreso diario: +${inc[r]}`]});
    ctx.drawImage(resIcon(r,28),x,12,28,28);text(String(v),x+31,33,{size:17,bold:true,color:r==='gold'?'#ffe27a':'#fff'});x+=r==='gold'?124:104}
}
function drawStatus(){
  const c=ctx;let s='';const hv=S.hov;if(hv&&hv.tx!=null&&UI.mx<VPW&&UI.my>=0){const x=hv.tx,y=hv.ty;
    if(!isExpl(x,y)&&!isVis(x,y))s='Territorio inexplorado';else{const h=isVis(x,y)?heroAt(x,y):null;const o=hv.o;
      if(h)s=`${h.name} (${G.players[h.pid].name}) · Nivel ${h.lvl}`;else if(o){s=objName(o);if(o.t==='mon'&&isVis(x,y))s+='  [clic para atacar]';else if((o.t==='mine')&&o.owner>=0)s+=`  (${G.players[o.owner].name})`;else if(o.t==='town')s+=` · ${FDEF[o.fi].name}${o.owner>=0?' ('+G.players[o.owner].name+')':' (neutral)'}`}
      else s=TERR[G.map.terr[y*G.map.w+x]].n}}
  if(!s)return;const w=measure(s,15,true)+28;rrect(c,VPW/2-w/2,VPH-34,w,26,7,'rgba(16,12,24,.9)','#c8a24a',1.4);text(s,VPW/2,VPH-15,{size:15,bold:true,align:'center'});
}
// ---------- bucle de aventura ----------
function advUpdate(dt){
  S.clock+=dt;S.t+=dt;
  // cámara
  const sp=700*dt;
  if(!UI.modals.length&&!S.fx){const k=UI.keys;let dx=0,dy=0;if(k.ArrowLeft||k.KeyA)dx=-1;if(k.ArrowRight||k.KeyD)dx=1;if(k.ArrowUp||k.KeyW)dy=-1;if(k.ArrowDown||k.KeyS)dy=1;
    if(UI.mx>=0&&UI.mx<VPW&&UI.my>=0&&!UI.down){if(UI.mx<8)dx=-1;if(UI.mx>VPW-8)dx=1;if(UI.my<6)dy=-1;if(UI.my>VPH-6)dy=1}
    if(dx||dy){S.flyTo=null;S.cam.x+=dx*sp;S.cam.y+=dy*sp}}
  if(S.flyTo){const k=1-Math.pow(.0009,dt);S.cam.x+=(S.flyTo.x-S.cam.x)*k;S.cam.y+=(S.flyTo.y-S.cam.y)*k;if(Math.abs(S.flyTo.x-S.cam.x)<1&&Math.abs(S.flyTo.y-S.cam.y)<1)S.flyTo=null}
  clampCam();
  // ratón sobre el mapa
  S.hov=null;if(UI.mx>=0&&UI.mx<VPW&&UI.my>=0&&UI.my<VPH&&!UI.modals.length){const tx=Math.floor((UI.mx+S.cam.x)/TILE),ty=Math.floor((UI.my+S.cam.y)/TILE);
    if(tx>=0&&ty>=0&&tx<G.map.w&&ty<G.map.h){const fp=G.map.fp[ty*G.map.w+tx];S.hov={tx,ty,o:fp?G.map.objs[fp-1]:null};if(S.hov.o&&S.hov.o.dead)S.hov.o=null}}
  // animación de paso
  if(S.anim){const a=S.anim;a.t+=dt;const k=Math.min(1,a.t/a.dur);const e=k;a.h.ax=a.fx+(a.tx-a.fx)*e;a.h.ay=a.fy+(a.ty-a.fy)*e;
    if(S.mov&&S.mov.h===a.h){S.flyTo=null;const ax=a.h.ax*TILE+TILE/2-VPW/2,ay=a.h.ay*TILE+TILE/2-VPH/2;S.cam.x+=(ax-S.cam.x)*Math.min(1,dt*7);S.cam.y+=(ay-S.cam.y)*Math.min(1,dt*7)}
    if(k>=1){a.h.ax=null;a.h.ay=null;const cb=a.next;S.anim=null;a.h.moving=!!S.mov;const L=S.later;S.later=[];for(const f of L)f();if(cb)cb()}}
  // ejecución del movimiento
  if(S.mov&&!S.anim&&!S.mov.wait)advStep();
  // un clic en el mapa mientras el héroe camina lo detiene (tras el paso en curso)
  if(S.mov&&!S.ai&&!S.mov.stop&&S.mapClicks&&S.mapClicks.length){S.mov.stop=true;toast('Héroe detenido')}
  // clics del mapa
  if(!S.mov&&!S.anim&&!S.fx&&!G.busy&&!S.ai){
    for(const c of S.mapClicks||[])advClick(c);}
  S.mapClicks=[];
  // atajos
  for(const e of UI.keyq||[]){if(UI.modals.length)break;
    if(e.code==='KeyE'||e.code==='Enter'){if(!S.mov&&!S.ai&&!G.busy)endTurn()}
    else if(e.code==='Space'||e.code==='Tab')nextHero();
    else if(e.code==='KeyO')openObjectives();
    else if(e.code==='KeyH'&&selHero())openHeroScreen(selHero());
    else if(e.code==='Escape'){if(S.path){S.path=null}else openSystemMenu()}
    else if(e.code==='KeyT'){const t=ownedTowns(0)[0];if(t)openTown(t,heroAt(t.x+t.ex,t.y+t.ey))}
    else if(e.code==='KeyM'){}}
  if(S.fx)updateFx(dt);
  // IA
  if(S.ai)S.ai.t+=dt;
  FX.update(dt);
}
function advStep(){
  const h=S.mov.h;S.mov.wait=true;
  if(S.mov.stop){h.path=null;advEndMove();return}
  if(!h.alive||!h.path||!h.path.length){advEndMove();return}
  let sync=true,res=null;
  const handle=r=>{G.busy=false;const cont=()=>{if(!S.mov)return;S.mov.wait=false;if(r!=='moved')advEndMove()};if(S.anim)S.anim.next=cont;else cont()};
  stepHero(h,r=>{if(sync)res=r;else handle(r)});sync=false;if(res!==null)handle(res);else G.busy=true;
}
G.hooks.heroStep=(h,fx,fy,tx,ty)=>{
  if(h.pid!==0||!S.mov||S.mov.h!==h)return;const road=G.map.road[ty*G.map.w+tx];const dx=tx-fx,dy=ty-fy;h.face=dx<0?-1:dx>0?1:(h.face||1);
  h.moving=true;h.ax=fx;h.ay=fy;S.anim={h,fx,fy,tx,ty,t:0,dur:(road?.085:.13)*(dx&&dy?1.25:1),next:null};
};
function advEndMove(){const h=S.mov&&S.mov.h;S.mov=null;const exId=S.exTarget;S.exTarget=null;G.busy=false;if(h){h.moving=false;h.ax=null;h.ay=null;if(h.path&&!h.path.length)h.path=null}S.path=null;S.target=null;checkMine();if(exId!=null&&h&&h.alive){const eh=G.heroes[exId];if(eh&&eh.alive&&eh.pid===0&&Math.max(Math.abs(eh.x-h.x),Math.abs(eh.y-h.y))<=1)setTimeout(()=>openExchange(h,eh),150)}}
function checkMine(){}
function startMove(h){
  if(!h.path||!h.path.length)return;h.sleep=false;S.mov={h,wait:false,cont:true};h.moving=true;
}
function advClick(c){
  const tx=Math.floor((c.x+S.cam.x)/TILE),ty=Math.floor((c.y+S.cam.y)/TILE),m=G.map;if(tx<0||ty<0||tx>=m.w||ty>=m.h)return;
  const vis=isVis(tx,ty),expl=isExpl(tx,ty)||vis;
  const fp=m.fp[ty*m.w+tx];let o=fp?m.objs[fp-1]:null;if(o&&o.dead)o=null;
  const h=selHero();
  // héroe propio bajo el ratón: seleccionar
  const eh=vis?heroAt(tx,ty):null;const ex0=S.exTarget;S.exTarget=null;
  // otro héroe propio con uno seleccionado: ir hasta él (1º ruta, 2º mover) y abrir el intercambio
  if(eh&&eh.pid===0&&h&&eh!==h){
    if(Math.max(Math.abs(eh.x-h.x),Math.abs(eh.y-h.y))<=1){openExchange(h,eh);return}
    if(ex0===eh.id&&S.path&&S.path.length){S.exTarget=eh.id;h.path=S.path.slice();startMove(h);return}
    let best=null;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){if(!dx&&!dy)continue;const nx=eh.x+dx,ny=eh.y+dy;if(nx<0||ny<0||nx>=m.w||ny>=m.h||G.hmap[ny*m.w+nx])continue;const pth=planPath(h,nx,ny);if(pth&&(!best||pth.length<best.p.length))best={p:pth,x:nx,y:ny}}
    if(!best){toast('No hay camino hasta ese héroe','bad');S.path=null;S.target=null;return}
    S.path=best.p;S.target={x:best.x,y:best.y};S.exTarget=eh.id;h.path=null;return}
  if(eh&&eh.pid===0){if(S.sel===eh.id&&S.lastClick&&S.t-S.lastClick<.5){const t=objAtTownTile(eh);if(t)openTown(t,eh);else openHeroScreen(eh)}else selectHero(eh,false);S.lastClick=S.t;return}
  // ciudad propia: un clic la selecciona, otro clic entra (con o sin héroe)
  if(!(o&&o.t==='town'&&o.owner===0))S.selTown=null;
  if(o&&o.t==='town'&&o.owner===0){const hh=heroAt(o.x+o.ex,o.y+o.ey);
    const goHero=h&&!(h.x===o.x+o.ex&&h.y===o.y+o.ey)&&planPath(h,o.x+o.ex,o.y+o.ey);
    if(goHero){S.selTown=o} // con un héroe seleccionado, el clic lo manda hacia la ciudad (1º ruta, 2º mover); el botón «Entrar» abre la ciudad sin héroe
    else{
      if(S.selTown===o){S.selTown=null;openTown(o,hh&&hh.pid===0?hh:null);return}
      S.selTown=o;S.path=null;S.target=null;if(hh&&hh.pid===0)selectHero(hh,false);if(G.hooks.sfx)G.hooks.sfx('click');return}}
  if(!h)return;
  if(!expl){toast('Territorio inexplorado','bad');return}
  let gx=tx,gy=ty;if(o){gx=o.x+o.ex;gy=o.y+o.ey}
  if(gx===h.x&&gy===h.y){const t=objAtTownTile(h);if(t)openTown(t,h);return}
  if(S.target&&S.target.x===gx&&S.target.y===gy&&S.path&&S.path.length){h.path=S.path.slice();startMove(h);return}
  const path=planPath(h,gx,gy);
  if(!path){toast('No hay camino hasta allí','bad');S.path=null;S.target=null;return}
  S.path=path;S.target={x:gx,y:gy};h.path=null;
}
function planPathCheck(h,x,y){return planPath(h,x,y)}
function nextHero(){const hs=myHeroes().filter(h=>!h.sleep&&h.mp>=100);if(!hs.length){toast('Ningún héroe puede moverse','bad');return}let i=hs.findIndex(h=>h.id===S.sel);const h=hs[(i+1)%hs.length];selectHero(h)}
// ---------- turnos ----------
function endTurn(){
  if(S.ai||S.mov||G.busy)return;
  const idle=myHeroes().filter(h=>!h.sleep&&h.mp>=600);
  const go=()=>{autosave();S.ai={pi:1,t:0};S.path=null;S.target=null;runAI()};
  if(idle.length&&!S.noConfirm)Dlg.show({title:'¿Terminar el turno?',text:`${idle.map(h=>h.name).join(', ')} todavía ${idle.length>1?'tienen':'tiene'} movimiento disponible.`,buttons:[{label:'Terminar',primary:1,fn:go},{label:'Seguir jugando'}]});else go();
}
function runAI(){
  const ai=S.ai;if(!ai)return;
  if(G.over){S.ai=null;return}
  if(ai.pi>=G.players.length){// fin de día
    endDayAll();for(const t of ownedTowns(0))t.builtToday=false;startDayFor(G.players[0]);S.ai=null;G.cur=0;
    autosave();banner(`Día ${G.day}`+((G.day-1)%7===0?' · ¡Nueva semana!':''));
    const hs=myHeroes();if(hs.length&&(S.sel==null||!G.heroes[S.sel].alive))selectHero(hs[0]);else if(selHero())camTo(selHero().x,selHero().y);
    return}
  const p=G.players[ai.pi];if(!p.alive){ai.pi++;return setTimeout(runAI,0)}
  G.sync=false;
  aiPlayerTurn(p,()=>{ai.pi++;setTimeout(runAI,20)});
}
function banner(txt,sub){S.banner={txt,sub,t:0}}
function drawBanner(dt){const b=S.banner;if(!b)return;b.t+=dt;if(b.t>2.4){S.banner=null;return}const a=Math.min(1,b.t*4,(2.4-b.t)*3);const c=ctx;c.save();c.globalAlpha=a;
  const w=360;rrect(c,VPW/2-w/2,VPH*.3,w,64,12,lg(c,0,0,0,64,['rgba(60,40,24,.92)','rgba(20,12,16,.92)']),'#e8c25a',2.4);text(b.txt,VPW/2,VPH*.3+42,{size:30,bold:true,align:'center',color:'#ffe9a0',outline:1});c.restore()}
// ---------- entrada a castillos ----------
function startCastleEntry(t,h,cb){
  const gx=(t.x+t.ex+.5)*TILE,gy=(t.y+t.ey+.5)*TILE;
  S.fx={type:'enter',t:0,dur:1.5,town:t,hero:h,cb,gx,gy,sx:S.cam.x,sy:S.cam.y,zoom:1};
  S.flyTo=null;
}
function startCastleExit(t,h){
  const gx=(t.x+t.ex+.5)*TILE,gy=(t.y+t.ey+.5)*TILE;S.scr='adv';camTo(t.x+t.ex,t.y+t.ey,true);
  S.fx={type:'exit',t:0,dur:.9,town:t,hero:h,gx,gy,zoom:2.4};
}
function updateFx(dt){
  const f=S.fx;f.t+=dt;const k=Math.min(1,f.t/f.dur);
  if(f.type==='enter'){f.zoom=1+1.6*easeIn(k);
    if(f.t>.5&&!f.opened){f.opened=true;sfx&&sfx('gate');FX.burst(f.gx,f.gy-20,18,['#e8d0a0','#c8a870'],{spd:50,life:.9})}
    if(k>=1){const cb=f.cb;S.fx=null;S.scr='town';S.townFx={t:0};cb&&cb()}}
  else if(f.type==='exit'){f.zoom=2.4-1.4*easeOut(k);if(k>=1)S.fx=null}
}
const easeIn=k=>k*k*(3-2*k);const easeOut=k=>1-Math.pow(1-k,3);
function drawFxOverlay(){
  if(S.flash){S.flash.t+=.016;const a=Math.max(0,1-S.flash.t/.6);if(a<=0)S.flash=null;else{ctx.fillStyle=`rgba(210,230,255,${a*.85})`;ctx.fillRect(0,0,VPW,VPH)}}
  const f=S.fx;if(!f)return;const c=ctx;const k=Math.min(1,f.t/f.dur);
  if(f.type==='enter'){
    // iris de cierre sobre la puerta
    const sx=f.gx-S.cam.x,sy=f.gy-S.cam.y;const r=Math.max(0,(1-easeIn(Math.max(0,(k-.35)/.65)))*Math.hypot(VPW,VPH));
    c.save();c.beginPath();c.rect(0,0,VW,VH);c.arc(sx,sy,r,0,6.2832,true);c.fillStyle='#000';c.fill('evenodd');c.restore();
    // luz cálida de la puerta
    c.save();c.globalCompositeOperation='lighter';c.fillStyle=rg(c,sx,sy-10,2,70,[`rgba(255,200,120,${.5*k})`,'rgba(255,200,120,0)']);c.fillRect(sx-80,sy-90,160,160);c.restore()}
  else{const sx=f.gx-S.cam.x,sy=f.gy-S.cam.y;const r=Math.min(1,k*1.4)*Math.hypot(VPW,VPH);c.save();c.beginPath();c.rect(0,0,VW,VH);c.arc(sx,sy,r,0,6.2832,true);c.fillStyle='#000';c.fill('evenodd');c.restore()}
}

// cursor del mapa: silueta de caballo donde el héroe puede ir; flecha amarilla donde no
let _horse=null;
function horsePath(){
  if(_horse)return _horse;
  const P=[[92,38],[86,30],[80,22],[78,12],[74,22],[62,32],[44,35],[24,38],[16,42],[7,60],[14,68],[20,52],[22,58],[18,90],[26,90],[31,66],[47,66],[60,66],[59,90],[68,90],[71,68],[73,58],[80,45],[88,48]];
  const p=new Path2D(),n=P.length,mid=(a,b)=>[(a[0]+b[0])/2,(a[1]+b[1])/2];
  let m0=mid(P[n-1],P[0]);p.moveTo(m0[0],m0[1]);
  for(let i=0;i<n;i++){const q=P[i],m=mid(q,P[(i+1)%n]);p.quadraticCurveTo(q[0],q[1],m[0],m[1])}
  p.closePath();return _horse=p;
}
function hoverReach(){
  const hv=S.hov,h=selHero();if(!h||!h.alive)return null;
  const o=hv.o,gx=o?o.x+o.ex:hv.tx,gy=o?o.y+o.ey:hv.ty,key=h.id+':'+h.x+','+h.y+':'+gx+','+gy+':'+(h.boat?1:0);
  if(S.hovKey!==key){S.hovKey=key;S.hovOk=(isExpl(hv.tx,hv.ty)||isVis(hv.tx,hv.ty))&&((gx===h.x&&gy===h.y)||!!planPath(h,gx,gy))}
  return S.hovOk;
}
function drawHoverCursor(c){
  const hv=S.hov,sh=selHero(),oh=!S.mov&&!S.ai&&sh&&isVis(hv.tx,hv.ty)?heroAt(hv.tx,hv.ty):null;
  if(oh&&oh.pid===0&&oh!==sh){const cx=hv.tx*TILE+TILE/2,cy=hv.ty*TILE+TILE/2;c.save();c.translate(cx,cy);c.fillStyle='rgba(30,20,10,.65)';c.beginPath();c.arc(0,0,TILE*.46,0,6.29);c.fill();c.strokeStyle='#ffe27a';c.lineWidth=2.4;c.lineCap='round';c.lineJoin='round';
    const arrow=(y,d)=>{c.beginPath();c.moveTo(-14*d,y);c.lineTo(14*d,y);c.moveTo(14*d-7*d,y-6);c.lineTo(14*d,y);c.lineTo(14*d-7*d,y+6);c.stroke()};arrow(-7,1);arrow(7,-1);c.restore();return}
  if(!sh&&!S.mov&&!S.ai&&hv.o&&hv.o.t==='town'&&hv.o.owner===0){const cx=hv.tx*TILE+TILE/2,cy=hv.ty*TILE+TILE/2;c.save();c.translate(cx,cy);c.fillStyle='rgba(30,20,10,.65)';c.beginPath();c.arc(0,0,TILE*.46,0,6.29);c.fill();
    c.fillStyle='#ffe27a';c.strokeStyle='#3a2a08';c.lineWidth=1.6;c.beginPath();c.moveTo(-14,12);c.lineTo(-14,-6);c.lineTo(-14,-10);c.lineTo(-10,-10);c.lineTo(-10,-6);c.lineTo(-5,-6);c.lineTo(-5,-13);c.lineTo(-1,-13);c.lineTo(-1,-9);c.lineTo(1,-9);c.lineTo(1,-13);c.lineTo(5,-13);c.lineTo(5,-6);c.lineTo(10,-6);c.lineTo(10,-10);c.lineTo(14,-10);c.lineTo(14,12);c.closePath();c.fill();c.stroke();
    c.fillStyle='#3a2a08';c.beginPath();c.moveTo(-4,12);c.lineTo(-4,4);c.quadraticCurveTo(0,-2,4,4);c.lineTo(4,12);c.closePath();c.fill();c.restore();return}
  const ok=S.mov||S.ai?true:hoverReach();
  if(ok===null){c.strokeStyle='rgba(255,240,170,.85)';c.lineWidth=2;c.strokeRect(hv.tx*TILE+1,hv.ty*TILE+1,TILE-2,TILE-2);return}
  if(ok){const k=TILE*.9/100,x=hv.tx*TILE+TILE*.05,y=hv.ty*TILE+TILE*.05;c.save();c.translate(x,y);c.scale(k,k);c.shadowColor='rgba(0,0,0,.5)';c.shadowBlur=4;c.fillStyle='rgba(255,226,110,.92)';c.fill(horsePath());c.shadowBlur=0;c.strokeStyle='#3a2a08';c.lineWidth=2.6;c.stroke(horsePath());c.restore();return}
  UI.cursor='none';const ax=UI.mx+S.cam.x,ay=UI.my+S.cam.y;c.save();c.translate(ax,ay);c.fillStyle='#ffe27a';c.strokeStyle='#3a2a08';c.lineWidth=1.8;c.beginPath();c.moveTo(0,0);c.lineTo(0,19);c.lineTo(5,14.5);c.lineTo(9,23);c.lineTo(12.5,21.5);c.lineTo(8.5,13);c.lineTo(15,13);c.closePath();c.fill();c.stroke();c.restore();
}
