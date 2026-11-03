'use strict';
// Mejoras gráficas: terreno V2, acabado de criaturas, postproceso (director de arte)
const drawWaterTileLegacy=(v,f)=>drawTerrainTileOld(WATER,v,f);
// ===================================================================
//  M1 · TERRENO V2 — suelo con ruido teselable + relieve + detalles sin costuras
//  Fichero: sprites.js  → sustituir el cuerpo de drawTerrainTile (conservar la firma)
//  Añadir justo antes de drawTerrainTile. Coste: ~2 ms/tile, se ejecuta 1 vez (6x8 tiles).
// ===================================================================
// ruido de valor teselable: p = nº de celdas por tile (periodo)
function tnoise(seed){
  const hh=(i,j,p)=>hash2(((i%p)+p)%p,((j%p)+p)%p,seed),sm=t=>t*t*(3-2*t);
  return (x,y,p)=>{const i=Math.floor(x),j=Math.floor(y),fx=sm(x-i),fy=sm(y-j),a=hh(i,j,p),b=hh(i+1,j,p),c=hh(i,j+1,p),d=hh(i+1,j+1,p);return a+(b-a)*fx+(c-a)*fy+(a-b-c+d)*fx*fy}
}
const _hx=h=>{h=h.replace('#','');if(h.length===3)h=h.split('').map(c=>c+c).join('');const n=parseInt(h,16);return[n>>16&255,n>>8&255,n&255]};
// paleta por terreno: [sombra, base, luz, brillo]
const TPAL={[GRASS]:['#2f6a2c','#4f9a36','#7cc04a','#b4e070'],[DIRT]:['#5e4228','#8f6e46','#b08c5c','#d0aa78'],[SAND]:['#b8975a','#dcc07c','#efd896','#fff0c0'],
  [SNOW]:['#a8bcd8','#dce8f4','#f2f8ff','#ffffff'],[SWAMP]:['#26382c','#41603a','#5f7f48','#8aa860'],[ROUGH]:['#524a40','#80786a','#a29a88','#c8c0aa'],
  [ASH]:['#1e1618','#3c2e2e','#5a4846','#7a6460'],[SUBT]:['#1c1628','#382e48','#554866','#7a6a92']};
// pinta el suelo (c = canvas de mkc). o.k = contraste, o.rel = fuerza del relieve
function bakeGround(c,t,seed,o={}){
  const S=c.width,pal=TPAL[t].map(_hx),n=tnoise(seed),n2=tnoise(seed+91),nc=tnoise(t*31+5),k=o.k||1.3,rel=o.rel==null?34:o.rel;
  const H=new Float32Array(S*S),sm=q=>q*q*(3-2*q);
  for(let y=0;y<S;y++)for(let x=0;x<S;x++){const u=x/S,v=y/S;
    // campo COMÚN a todas las variantes (periodo 1 tile): en el borde vale igual en cualquier variante => sin costuras entre variantes
    const com=.5+(nc(u*5,v*5,5)*.6+nc(u*10,v*10,10)*.4-.5)*.45; // amplitud reducida: evita el patrón de rejilla
    // campo propio de la variante (más detalle), fundido a 0 en los bordes
    const own=n(u*6,v*6,6)*.4+n2(u*12,v*12,12)*.35+n2(u*24,v*24,24)*.25;
    const d=Math.min(u,v,1-u,1-v)/.4,w=sm(d>1?1:d);
    H[y*S+x]=com+(own-com)*w}
  const g=c.ctx;const img=g.createImageData(S,S),D=img.data;
  for(let y=0;y<S;y++)for(let x=0;x<S;x++){const i=y*S+x,h=H[i];
    const hl=H[y*S+((x+S-1)%S)],hr=H[y*S+((x+1)%S)],hu=H[((y+S-1)%S)*S+x],hd=H[((y+1)%S)*S+x];
    const lit=((hl-hr)*.7+(hu-hd)*.7)*rel;            // luz desde arriba-izquierda
    let q=(h-.5)*k+.5;q=q<0?0:q>1?1:q;
    // rampa de 3 colores: sombra -> base -> luz
    let a,b,f;if(q<.5){a=pal[0];b=pal[1];f=q*2}else{a=pal[1];b=pal[2];f=(q-.5)*2}
    for(let ch=0;ch<3;ch++){let v=a[ch]+(b[ch]-a[ch])*f+lit;D[i*4+ch]=v<0?0:v>255?255:v}
    D[i*4+3]=255}
  g.save();g.setTransform(1,0,0,1,0,0);g.putImageData(img,0,0);g.restore();
}
// dibuja fn en las 9 posiciones necesarias para que los detalles cruzando el borde se enrollen (sin costuras)
function w9(px,py,m,fn){for(let dx=-1;dx<=1;dx++){if(dx<0&&px<TILE-m)continue;if(dx>0&&px>m)continue;for(let dy=-1;dy<=1;dy++){if(dy<0&&py<TILE-m)continue;if(dy>0&&py>m)continue;fn(px+dx*TILE,py+dy*TILE)}}}
function drawTerrainTile(t,v,frame=0){
  if(t===LAVA||t===SUBT)return drawNewTile(t,v,frame);
  if(t===WATER)return drawWaterTileLegacy?drawWaterTileLegacy(v,frame):mkc(TILE,TILE); // el agua pasa a buildWaterPatches (M5)
  const c=mkc(TILE,TILE),x=c.ctx,r=mulberry(t*977+v*131+17),P=TPAL[t];
  bakeGround(c,t,t*53+v*7+1);
  const dot=(px,py,s,col)=>w9(px,py,s+1,(X,Y)=>{x.fillStyle=col;x.beginPath();x.arc(X,Y,s,0,6.2832);x.fill()});
  switch(t){
    case GRASS:{
      // macollas: sombra de contacto + 4-6 briznas en abanico con 3 tonos
      for(let i=0;i<11;i++){const px=r()*TILE,py=r()*TILE,nb=4+(r()*3|0);
        w9(px,py,9,(X,Y)=>{x.fillStyle='rgba(20,60,20,.28)';x.beginPath();x.ellipse(X,Y+1,4.2,1.6,0,0,6.28);x.fill();
          for(let b=0;b<nb;b++){const a=-1.57+(b-(nb-1)/2)*.42+(r()-.5)*.2,h=4+r()*4.5,ex=X+Math.cos(a)*h,ey=Y+Math.sin(a)*h;
            x.lineCap='round';x.strokeStyle='rgba(18,70,28,.9)';x.lineWidth=1.9;x.beginPath();x.moveTo(X,Y);x.quadraticCurveTo(X+Math.cos(a)*h*.4+1,Y+Math.sin(a)*h*.5,ex,ey);x.stroke();
            x.strokeStyle=b%2?P[2]:P[1];x.lineWidth=1.1;x.stroke();
            x.fillStyle=P[3];x.fillRect(ex-.4,ey-.4,.9,.9)}})}
      for(let i=0;i<10;i++)dot(r()*TILE,r()*TILE,1+r()*1.2,r()<.5?'rgba(190,235,110,.22)':'rgba(15,60,25,.2)');
      if(v%3===0)for(let i=0;i<2;i++){const px=4+r()*40,py=4+r()*40,col=['#fff','#ffe46a','#ff9ac0','#b8a0ff'][r()*4|0];dot(px,py+.9,1.5,'rgba(0,0,0,.25)');dot(px,py,1.3,col);dot(px-.4,py-.4,.5,'#fff')}
      break}
    case DIRT:{
      for(let i=0;i<9;i++){const px=r()*TILE,py=r()*TILE,rx=1.6+r()*3,ry=rx*(.5+r()*.3);
        w9(px,py,rx+2,(X,Y)=>{x.fillStyle='rgba(30,16,6,.38)';x.beginPath();x.ellipse(X+.9,Y+1.2,rx,ry,0,0,6.28);x.fill();
          x.fillStyle=lg(x,X,Y-ry,X,Y+ry,[P[3],'#8a6a44','#5a4128']);x.beginPath();x.ellipse(X,Y,rx,ry,0,0,6.28);x.fill();
          x.strokeStyle='rgba(30,16,6,.55)';x.lineWidth=.7;x.stroke()})}
      for(let i=0;i<3;i++){let px=r()*TILE,py=r()*TILE;const pts=[[px,py]];for(let q=0;q<4;q++){px+=(r()-.5)*12;py+=(r()-.5)*12;pts.push([px,py])}
        x.strokeStyle='rgba(30,16,6,.45)';x.lineWidth=.9;x.beginPath();pts.forEach((p,q)=>q?x.lineTo(p[0],p[1]):x.moveTo(p[0],p[1]));x.stroke()}
      break}
    case SAND:{
      // rizos de viento con luz y sombra (periodo entero => teselable en X)
      for(let k=0;k<5;k++){const py=5+k*9.5+r()*2,ph=r()*6.28,amp=1+r()*1.6;
        for(const[dy,col,lw]of[[1.2,'rgba(120,88,40,.3)',1.6],[0,'rgba(255,246,205,.5)',1]]){x.strokeStyle=col;x.lineWidth=lw;x.beginPath();
          for(let px=0;px<=TILE;px+=2){const yy=py+dy+Math.sin(px/TILE*6.2832*2+ph)*amp;px?x.lineTo(px,yy):x.moveTo(px,yy)}x.stroke()}}
      for(let i=0;i<18;i++)dot(r()*TILE,r()*TILE,.5+r()*.7,r()<.5?'rgba(255,250,215,.6)':'rgba(130,95,45,.35)');break}
    case SNOW:{
      for(let i=0;i<5;i++){const px=r()*TILE,py=r()*TILE,rx=5+r()*6,ry=2+r()*2;w9(px,py,rx+1,(X,Y)=>{x.fillStyle='rgba(110,140,190,.18)';x.beginPath();x.ellipse(X+1,Y+1.5,rx,ry,0,0,6.28);x.fill();x.fillStyle='rgba(255,255,255,.55)';x.beginPath();x.ellipse(X-.6,Y-.6,rx*.85,ry*.8,0,0,6.28);x.fill()})}
      for(let i=0;i<26;i++){const px=r()*TILE,py=r()*TILE;x.fillStyle=r()<.5?'#fff':'rgba(190,225,255,.9)';x.fillRect(px,py,1.1,1.1)}break}
    case SWAMP:{
      for(let i=0;i<3;i++){const px=r()*TILE,py=r()*TILE,rx=4+r()*7,ry=2.4+r()*3;
        w9(px,py,rx+2,(X,Y)=>{x.fillStyle='#1c2c26';x.beginPath();x.ellipse(X,Y,rx+1,ry+.8,0,0,6.28);x.fill();x.fillStyle=lg(x,X,Y-ry,X,Y+ry,['#3a5a50','#26403a']);x.beginPath();x.ellipse(X,Y,rx,ry,0,0,6.28);x.fill();
          x.fillStyle='rgba(200,240,230,.4)';x.beginPath();x.ellipse(X-rx*.3,Y-ry*.35,rx*.35,ry*.22,0,0,6.28);x.fill()})}
      for(let i=0;i<14;i++){const px=r()*TILE,py=r()*TILE;w9(px,py,4,(X,Y)=>{x.strokeStyle=r()<.5?'#233e1e':'#8aa858';x.lineWidth=1;x.beginPath();x.moveTo(X,Y);x.lineTo(X+(r()-.5)*2,Y-3-r()*3);x.stroke()})}break}
    case ROUGH:{
      // rocas facetadas pequeñas con cara iluminada y sombra
      for(let i=0;i<5;i++){const px=r()*TILE,py=r()*TILE,s=3+r()*5;
        w9(px,py,s+2,(X,Y)=>{x.fillStyle='rgba(20,16,12,.35)';x.beginPath();x.ellipse(X+1.5,Y+s*.5,s*1.1,s*.4,0,0,6.28);x.fill();
          poly(x,[[X-s,Y+s*.4],[X-s*.6,Y-s*.5],[X+s*.1,Y-s*.8],[X+s*.8,Y-s*.3],[X+s,Y+s*.4]],P[1],'rgba(25,20,16,.7)',.9);
          poly(x,[[X-s*.6,Y-s*.5],[X+s*.1,Y-s*.8],[X+s*.8,Y-s*.3],[X,Y-s*.1]],P[3],null);
          poly(x,[[X+s*.8,Y-s*.3],[X+s,Y+s*.4],[X-s*.2,Y+s*.4],[X,Y-s*.1]],'rgba(20,16,26,.35)',null)})}
      for(let i=0;i<3;i++){let px=r()*TILE,py=r()*TILE;x.strokeStyle='rgba(25,20,16,.5)';x.lineWidth=.9;x.beginPath();x.moveTo(px,py);for(let q=0;q<3;q++){px+=(r()-.5)*10;py+=(r()-.2)*8;x.lineTo(px,py)}x.stroke()}break}
    case ASH:{
      for(let i=0;i<3;i++){let px=r()*TILE,py=r()*TILE;const pts=[[px,py]];for(let k=0;k<4;k++){px+=(r()-.5)*12;py+=(r()-.3)*9;pts.push([px,py])}
        for(const[col,lw]of[['rgba(255,70,10,.35)',4],['rgba(255,120,30,.85)',1.5],['rgba(255,225,130,.7)',.6]]){x.strokeStyle=col;x.lineWidth=lw;x.beginPath();pts.forEach((p,q)=>q?x.lineTo(p[0],p[1]):x.moveTo(p[0],p[1]));x.stroke()}}
      for(let i=0;i<6;i++){const px=r()*TILE,py=r()*TILE;x.fillStyle='rgba(255,170,60,.8)';x.fillRect(px,py,1.2,1.2)}break}
  }
  // viñeta de borde muy sutil: marca la rejilla lo justo para dar "baldosa de mapa" sin costuras duras
  return c;
}

// ===================================================================
//  M4 · ACABADO DE CRIATURAS (y retratos): contorno uniforme, luz de recorte, luz de rebote,
//       grano de material, oclusión en los pies y ligera saturación. ~1 ms por sprite, 1 vez.
//  Fichero: creatures.js → en drawCreatureRaw(), justo después del bloque "iluminación" (source-atop)
//           y ANTES de `if(cr.up){`:   polishSprite(c,{rim:'#fff3c8',bounce:P[2]||'#6aa0ff',grain:.2,mat:matOf(cr)});
//           (el contorno exterior sale del propio canvas: mantener 2 px de margen; el sprite actual toca bordes en
//            dragones/grifos -> ver nota de escala en el informe)
//  Añadir también matOf() para elegir textura por arquetipo.
// ===================================================================
let _grainTex={};
// textura de ruido 64x64 teselable (cacheada por tipo): 'skin' fino, 'scale' escamas, 'metal' cepillado, 'cloth' tejido, 'stone' granular
function grainTex(kind){
  if(_grainTex[kind])return _grainTex[kind];const S=64,c=document.createElement('canvas');c.width=c.height=S;const g=c.getContext('2d'),img=g.createImageData(S,S),D=img.data,n=tnoise(kind.length*17+kind.charCodeAt(0));
  for(let y=0;y<S;y++)for(let x=0;x<S;x++){const u=x/S,v=y/S;let h;
    if(kind==='metal')h=.5+(n(u*2,v*32,32)-.5)*.9+(n(u*8,v*8,8)-.5)*.25;                       // cepillado horizontal
    else if(kind==='scale'){const a=(x%8)/8-.5,b=((y+(((x/8)|0)%2)*4)%8)/8-.5;h=.5+(.5-Math.hypot(a,b))*.9+(n(u*16,v*16,16)-.5)*.2}  // escamas en media luna
    else if(kind==='cloth')h=.5+(((x+y)%4<2)?.12:-.12)+(n(u*16,v*16,16)-.5)*.3;
    else if(kind==='stone')h=.35+n(u*8,v*8,8)*.4+n(u*32,v*32,32)*.4;
    else h=.5+(n(u*16,v*16,16)-.5)*.8+(n(u*32,v*32,32)-.5)*.5;                                    // piel/pelaje
    const q=Math.max(0,Math.min(255,h*255)),i=(y*S+x)*4;D[i]=D[i+1]=D[i+2]=q;D[i+3]=255}
  g.putImageData(img,0,0);return _grainTex[kind]=c}
const MATOF={golem:'stone',tree:'stone',dragon:'scale',serp:'scale',naga:'scale',crab:'scale',hydra:'scale',insect:'scale',frog:'scale',hum:'metal',cav:'metal',orc:'cloth',giant:'cloth',beast:'skin',bird:'skin'};
const matOf=cr=>MATOF[cr.arch]||'skin';
// c = canvas de mkc con el sprite ya pintado. Modifica c en sitio.
function polishSprite(c,o={}){
  const _tmp=[];const mkc=(a,b)=>{const q=window.mkc(a,b);_tmp.push(q);return q};
  const w=c.lw,h=c.lh,x=c.ctx;
  const src=mkc(w,h),sx=src.ctx;sx.drawImage(c,0,0,w,h);                       // copia del sprite original
  // máscara 'sólida': descarta sombras suaves y destellos (alfa < 55%) para que contorno/luces sigan solo el cuerpo
  const msk=mkc(w,h),mx=msk.ctx;mx.drawImage(src,0,0,w,h);{const id=mx.getImageData(0,0,msk.width,msk.height),D=id.data;for(let i=3;i<D.length;i+=4)D[i]=D[i]>140?255:0;mx.save();mx.setTransform(1,0,0,1,0,0);mx.putImageData(id,0,0);mx.restore()}
  const rim=o.rim||'#fff0c0',bounce=o.bounce||'#7aa8ff',ol=o.outline||'#100818',R=o.ow||1.6;
  const tint=(img,col)=>{const t=mkc(w,h),g=t.ctx;g.drawImage(img,0,0,w,h);g.globalCompositeOperation='source-in';g.fillStyle=col;g.fillRect(0,0,w,h);return t};
  x.clearRect(0,0,w,h);
  // 1) contorno exterior de grosor constante: silueta oscura desplazada en 12 direcciones
  const sil=tint(msk,ol);for(let i=0;i<12;i++){const a=i/12*6.2832;x.drawImage(sil,Math.cos(a)*R,Math.sin(a)*R,w,h)}
  // 2) sprite
  x.drawImage(src,0,0,w,h);
  // 3) textura de material (overlay recortado a la silueta)
  if(o.grain!==0){const t=mkc(w,h),g=t.ctx;g.fillStyle=g.createPattern(grainTex(o.mat||'skin'),'repeat');g.fillRect(0,0,w,h);g.globalCompositeOperation='destination-in';g.drawImage(msk,0,0,w,h);
    x.save();x.globalCompositeOperation='overlay';x.globalAlpha=o.grain==null?.22:o.grain;x.drawImage(t,0,0,w,h);x.restore()}
  // 4) luz de recorte (arriba-izq): silueta menos silueta desplazada (+1.5,+1.5)
  {const t=mkc(w,h),g=t.ctx;g.drawImage(msk,0,0,w,h);g.globalCompositeOperation='destination-out';g.drawImage(msk,1.5,1.5,w,h);g.globalCompositeOperation='source-in';g.fillStyle=rim;g.fillRect(0,0,w,h);
    x.save();x.globalCompositeOperation='lighter';x.globalAlpha=.5;x.drawImage(t,0,0,w,h);x.restore()}
  // 5) luz de rebote (abajo-der), fría y suave: da separación del fondo
  {const t=mkc(w,h),g=t.ctx;g.drawImage(msk,0,0,w,h);g.globalCompositeOperation='destination-out';g.drawImage(msk,-1.6,-1.6,w,h);g.globalCompositeOperation='source-in';g.fillStyle=bounce;g.fillRect(0,0,w,h);
    x.save();x.globalCompositeOperation='screen';x.globalAlpha=.42;x.drawImage(t,0,0,w,h);x.restore()}
  // 6) oclusión ambiental en el tercio inferior y gradiente tonal global (3 tonos: luz / media / sombra)
  {const t=mkc(w,h),g=t.ctx;g.drawImage(msk,0,0,w,h);g.globalCompositeOperation='source-in';
    g.fillStyle=lg(g,0,h*.55,0,h*.97,['rgba(14,6,30,0)','rgba(14,6,30,.34)']);g.fillRect(0,0,w,h);x.drawImage(t,0,0,w,h)}
  for(const q of _tmp){q.width=q.height=0}
  return c;
}

// ===================================================================
//  M7 · POSTPROCESO BARATO: gradación de color unificada + viñeta + bloom de luces
//  Fichero: adv.js → al final de advDraw(), SUSTITUIR la viñeta radial actual (última línea con rg(...'rgba(8,4,16,.42)')) por
//             postFX(c,0,0,VPW,VPH,{mood:S.lvl?'cave':'day',bloom:.16});
//           battleui.js → al final de battleDraw (antes del HUD): postFX(ctx,0,0,VW,VH,{mood:'battle',bloom:.18});
//  Coste por frame: 4 drawImage + 2 pequeños; sin getImageData ni ctx.filter (compatible Safari).
//  c.canvas puede estar escalado por UI.scale: se lee con el factor real canvas/lógico.
// ===================================================================
const PFX={ov:{},bl:null,bl2:null};
// ajustes por ambiente: tinte de luces (soft-light), tinte de sombras (multiply), viñeta, saturación implícita
const MOODS={day:{hi:'rgba(255,214,150,.15)',lo:'rgba(80,70,140,.20)',vig:.44},cave:{hi:'rgba(150,200,255,.10)',lo:'rgba(60,20,110,.40)',vig:.62},
             battle:{hi:'rgba(255,205,140,.18)',lo:'rgba(60,40,110,.30)',vig:.52},town:{hi:'rgba(255,225,170,.18)',lo:'rgba(60,40,90,.24)',vig:.40}};
function postOverlay(w,h,mood){
  const key=mood+w+'x'+h;if(PFX.ov[key])return PFX.ov[key];
  for(const k in PFX.ov)if(k.startsWith(mood)&&k!==key){const o=PFX.ov[k];for(const q in o)if(o[q]&&o[q].width!==undefined)o[q].width=o[q].height=0;delete PFX.ov[k]}const M=MOODS[mood]||MOODS.day,c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');
  // gradación: luz cálida desde arriba-izquierda (soft-light) y sombras frías/violetas hacia abajo-derecha (multiply)
  g.globalCompositeOperation='source-over';g.fillStyle='rgba(0,0,0,0)';
  const hi=g.createLinearGradient(0,0,w,h);hi.addColorStop(0,M.hi);hi.addColorStop(.6,'rgba(0,0,0,0)');
  const lo=g.createLinearGradient(w,h,0,0);lo.addColorStop(0,M.lo);lo.addColorStop(.55,'rgba(255,255,255,0)');
  // dos capas pre-compuestas en canvases propios para poder aplicar blend distinto al pintarlas
  const a=document.createElement('canvas');a.width=w;a.height=h;{const q=a.getContext('2d');q.fillStyle=hi;q.fillRect(0,0,w,h)}
  const b=document.createElement('canvas');b.width=w;b.height=h;{const q=b.getContext('2d');q.fillStyle=lo;q.fillRect(0,0,w,h);
    // viñeta elíptica (más oscura en las esquinas, centro intacto), con un poco de azul para no ensuciar
    q.fillStyle=(()=>{const r=q.createRadialGradient(w/2,h*.52,Math.min(w,h)*.32,w/2,h*.52,Math.hypot(w,h)*.55);r.addColorStop(0,'rgba(8,4,20,0)');r.addColorStop(.6,`rgba(8,4,20,${M.vig*.45})`);r.addColorStop(1,`rgba(4,2,14,${M.vig})`);return r})();q.fillRect(0,0,w,h)}
  PFX.ov[key]={a,b};return PFX.ov[key]}
// bloom: reduce el frame a 1/8, 'multiply' consigo mismo (realza solo los brillos), vuelve a escalar con suavizado y suma en 'lighter'
function postFX(c,vx,vy,vw,vh,o={}){
  const cv=c.canvas,k=cv.width/(typeof VW==='number'?VW:cv.width),mood=o.mood||'day';          // k = píxeles de canvas por píxel lógico
  const ov=postOverlay(Math.ceil(vw*k),Math.ceil(vh*k),mood);
  c.save();c.setTransform(1,0,0,1,0,0);
  const px=Math.round(vx*k),py=Math.round(vy*k),pw=Math.ceil(vw*k),ph=Math.ceil(vh*k);
  const bloom=o.bloom==null?.2:o.bloom;
  if(bloom>0){
    const sw=Math.max(8,pw>>3),sh=Math.max(8,ph>>3);
    if(!PFX.bl||PFX.bl.width!==sw||PFX.bl.height!==sh){PFX.bl=document.createElement('canvas');PFX.bl.width=sw;PFX.bl.height=sh;PFX.bl2=document.createElement('canvas');PFX.bl2.width=sw>>2;PFX.bl2.height=sh>>2}
    const b=PFX.bl.getContext('2d'),b2=PFX.bl2.getContext('2d');b.imageSmoothingEnabled=b2.imageSmoothingEnabled=true;
    b.globalCompositeOperation='copy';b.drawImage(cv,px,py,pw,ph,0,0,sw,sh);
    b.globalCompositeOperation='multiply';b.drawImage(PFX.bl,0,0);b.drawImage(PFX.bl,0,0);      // x^3: solo sobreviven las zonas claras
    b2.globalCompositeOperation='copy';b2.drawImage(PFX.bl,0,0,PFX.bl2.width,PFX.bl2.height);    // segundo desenfoque (otro 1/4)
    c.globalCompositeOperation='lighter';c.globalAlpha=bloom;c.imageSmoothingEnabled=true;
    c.drawImage(PFX.bl,0,0,sw,sh,px,py,pw,ph);c.globalAlpha=bloom*1.6;c.drawImage(PFX.bl2,0,0,PFX.bl2.width,PFX.bl2.height,px,py,pw,ph)}
  c.globalAlpha=1;c.globalCompositeOperation='soft-light';c.drawImage(ov.a,px,py,pw,ph);          // luz cálida
  c.globalCompositeOperation='multiply';c.drawImage(ov.b,px,py,pw,ph);                            // sombras frías + viñeta
  c.restore()}
