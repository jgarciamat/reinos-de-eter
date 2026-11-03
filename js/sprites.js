'use strict';
// =====================================================================
//  Gráficos procedurales: terrenos, decorados, objetos del mapa, héroes
// =====================================================================
const IS_TOUCH=('ontouchstart' in window)||(navigator.maxTouchPoints||0)>1; // móvil: menos memoria de canvas
const IS_PHONE=IS_TOUCH&&Math.min(screen.width,screen.height)<600;
const NVAR=10,TILE=48,SC=IS_PHONE?1:IS_TOUCH?1.5:2;
const FONT='"Palatino Linotype",Palatino,"Book Antiqua",Georgia,serif';
function mkc(w,h,s=SC){const c=document.createElement('canvas');c.width=Math.ceil(w*s);c.height=Math.ceil(h*s);const x=c.getContext('2d');x.scale(s,s);c.lw=w;c.lh=h;c.ctx=x;return c}
const _shc={};
function shade(col,k){const key=col+k;if(_shc[key])return _shc[key];let r,g,b;
  if(col.charCodeAt(0)===35){let h=col.slice(1);if(h.length===3)h=h[0]+h[0]+h[1]+h[1]+h[2]+h[2];const n=parseInt(h,16);r=n>>16&255;g=n>>8&255;b=n&255}
  else{const m=col.match(/[\d.]+/g);r=+m[0];g=+m[1];b=+m[2]}
  const t=k<0?0:255,p=Math.abs(k),f=q=>Math.round(q+(t-q)*p);return _shc[key]=`rgb(${f(r)},${f(g)},${f(b)})`}
function lg(c,x0,y0,x1,y1,stops){const g=c.createLinearGradient(x0,y0,x1,y1);stops.forEach((s,i)=>g.addColorStop(i/(stops.length-1),s));return g}
function rg(c,x,y,r0,r1,stops){const g=c.createRadialGradient(x,y,r0,x,y,r1);stops.forEach((s,i)=>g.addColorStop(i/(stops.length-1),s));return g}
const vg=(c,y0,y1,col,k=.28)=>lg(c,0,y0,0,y1,[shade(col,k),col,shade(col,-k*1.1)]);
function poly(c,pts,fill,stroke,lw=1.5){c.beginPath();c.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)c.lineTo(pts[i][0],pts[i][1]);c.closePath();if(fill){c.fillStyle=fill;c.fill()}if(stroke){c.strokeStyle=stroke;c.lineWidth=lw;c.lineJoin='round';c.stroke()}}
function ell(c,x,y,rx,ry,fill,stroke,lw=1.5){c.beginPath();c.ellipse(x,y,rx,ry,0,0,6.2832);if(fill){c.fillStyle=fill;c.fill()}if(stroke){c.strokeStyle=stroke;c.lineWidth=lw;c.stroke()}}
function rrect(c,x,y,w,h,r,fill,stroke,lw=1.5){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();if(fill){c.fillStyle=fill;c.fill()}if(stroke){c.strokeStyle=stroke;c.lineWidth=lw;c.stroke()}}
const OUT='#1a1220';
function shadowE(c,x,y,rx,ry,a=.35){c.save();c.translate(x,y);c.scale(1,ry/rx);c.fillStyle=rg(c,0,0,0,rx,[`rgba(0,0,10,${a})`,`rgba(0,0,10,${a*.5})`,'rgba(0,0,10,0)']);c.beginPath();c.arc(0,0,rx,0,6.2832);c.fill();c.restore()}
const hash2=(x,y,s=0)=>{let h=(x*374761393+y*668265263+s*982451653)|0;h=Math.imul(h^(h>>>13),1274126177);return((h^(h>>>16))>>>0)/4294967296};

// ---------------- terrenos ----------------
const TBASE={[GRASS]:'#5a9e3a',[DIRT]:'#8f6e46',[SAND]:'#dcc07c',[SNOW]:'#e6eef6',[SWAMP]:'#4a6a3c',[ROUGH]:'#807868',[ASH]:'#4a3b39',[WATER]:'#2b6cb5',[LAVA]:'#d2480c',[SUBT]:'#3c3446'};
const TPRIO={[WATER]:0,[SAND]:1,[SWAMP]:2,[GRASS]:3,[DIRT]:4,[ASH]:5,[ROUGH]:6,[SNOW]:7,[SUBT]:4.5,[LAVA]:0};
const Gfx={tiles:{},edges:{},shoreL:[],shoreW:[],road:[],cache:{},ready:false};
function drawTerrainTileOld(t,v,frame=0){
  if(t===LAVA||t===SUBT)return drawNewTile(t,v,frame);
  const c=mkc(TILE,TILE),x=c.ctx,r=mulberry(t*977+v*131+17);const base=shade(TBASE[t],(r()-.5)*.03);
  x.fillStyle=base;x.fillRect(0,0,TILE,TILE);
  const speck=(n,cols,sz,shape)=>{for(let i=0;i<n;i++){x.fillStyle=cols[Math.floor(r()*cols.length)];const px=r()*TILE,py=r()*TILE;if(shape==='r')x.fillRect(px,py,sz,sz);else{x.beginPath();x.arc(px,py,sz*(.6+r()*.6),0,6.28);x.fill()}}};
  switch(t){
    case GRASS:
      speck(30,['rgba(40,90,30,.35)','rgba(120,190,70,.35)','rgba(90,150,50,.3)'],3,'c');
      for(let i=0;i<46;i++){const px=r()*TILE,py=r()*TILE,h=2+r()*3.5;x.strokeStyle=r()<.5?'rgba(35,100,35,.55)':'rgba(150,215,90,.55)';x.lineWidth=1;x.beginPath();x.moveTo(px,py);x.quadraticCurveTo(px+(r()-.5)*2,py-h*.6,px+(r()-.5)*3,py-h);x.stroke()}
      if(v%3===0)for(let i=0;i<3;i++){const px=4+r()*40,py=4+r()*40;x.fillStyle=['#fff','#ffe46a','#ff9ac0','#b8a0ff'][Math.floor(r()*4)];x.beginPath();x.arc(px,py,1.3,0,6.28);x.fill()}break;
    case DIRT:speck(34,['rgba(60,40,20,.35)','rgba(200,170,120,.3)','rgba(90,62,36,.3)'],2.2,'c');
      for(let i=0;i<5;i++){const px=r()*TILE,py=r()*TILE;ell(x,px,py,2+r()*3,1.5+r()*2,'rgba(70,50,30,.5)');ell(x,px-.6,py-.7,1.6,1,'rgba(220,190,150,.5)')}break;
    case SAND:for(let k=0;k<5;k++){const py=6+k*9+r()*3;x.strokeStyle=k%2?'rgba(255,240,190,.35)':'rgba(150,115,55,.28)';x.lineWidth=1.2;x.beginPath();x.moveTo(0,py);for(let px=0;px<=TILE;px+=8)x.quadraticCurveTo(px+4,py+(r()-.5)*4,px+8,py);x.stroke()}
      speck(24,['rgba(255,245,200,.4)','rgba(150,110,60,.25)'],1.6,'c');break;
    case SNOW:speck(14,['rgba(150,180,220,.28)','rgba(255,255,255,.7)'],4,'c');for(let i=0;i<6;i++){const px=r()*TILE,py=r()*TILE;ell(x,px,py,5+r()*5,2+r()*2,'rgba(140,170,215,.22)')}
      for(let i=0;i<8;i++){x.fillStyle='rgba(255,255,255,.9)';x.fillRect(r()*TILE,r()*TILE,1.2,1.2)}break;
    case SWAMP:for(let i=0;i<3;i++){const px=6+r()*36,py=6+r()*36,rx=4+r()*7,ry=2.5+r()*3.5;ell(x,px,py,rx,ry,'#2a3d34');ell(x,px,py-.5,rx*.8,ry*.7,'#35544a');ell(x,px-rx*.3,py-ry*.3,rx*.3,ry*.2,'rgba(190,230,220,.35)')}
      for(let i=0;i<12;i++){const px=r()*TILE,py=r()*TILE;x.strokeStyle=r()<.5?'#2a4a22':'#7a9a4a';x.lineWidth=1;x.beginPath();x.moveTo(px,py);x.lineTo(px+(r()-.5)*2,py-3-r()*3);x.stroke()}
      speck(14,['rgba(30,50,30,.3)','rgba(120,150,70,.3)'],2.4,'c');break;
    case ROUGH:speck(40,['rgba(40,35,30,.35)','rgba(190,180,160,.3)','rgba(100,92,80,.35)'],2,'c');
      for(let i=0;i<3;i++){const px=6+r()*34,py=6+r()*34,s=3+r()*5;poly(x,[[px-s,py+s*.5],[px-s*.5,py-s*.6],[px+s*.6,py-s*.7],[px+s,py+s*.4]],'rgba(120,112,98,.8)','rgba(40,34,28,.5)',1);poly(x,[[px-s*.5,py-s*.6],[px+s*.6,py-s*.7],[px+s*.3,py-s*.2],[px-s*.4,py-s*.1]],'rgba(200,192,175,.6)')}break;
    case ASH:speck(40,['rgba(20,14,14,.45)','rgba(110,90,85,.3)'],2.4,'c');
      for(let i=0;i<3;i++){let px=r()*TILE,py=r()*TILE;x.strokeStyle='rgba(255,110,30,.75)';x.lineWidth=1.4;x.beginPath();x.moveTo(px,py);for(let k=0;k<4;k++){px+=(r()-.5)*12;py+=(r()-.3)*9;x.lineTo(px,py)}x.stroke();x.strokeStyle='rgba(255,210,100,.45)';x.lineWidth=.6;x.stroke()}
      for(let i=0;i<5;i++){x.fillStyle='rgba(255,170,60,.7)';x.fillRect(r()*TILE,r()*TILE,1.3,1.3)}break;
    case WATER:{x.fillStyle=lg(x,0,0,0,TILE,['#3a7fc8','#2b6cb5','#215a9e']);x.fillRect(0,0,TILE,TILE);
      for(let k=0;k<4;k++){const py=((k*12+frame*3+v*5)%TILE);x.strokeStyle=k%2?'rgba(190,230,255,.28)':'rgba(10,50,110,.22)';x.lineWidth=1.3;x.beginPath();x.moveTo(0,py);for(let px=0;px<=TILE;px+=12)x.quadraticCurveTo(px+6,py+(k%2?-3:3),px+12,py);x.stroke()}
      for(let i=0;i<3;i++){x.fillStyle='rgba(255,255,255,.35)';x.fillRect(((i*17+v*11+frame*7)%46),((i*23+v*7)%46),2,1)}break}
  }
  return c;
}
// máscara de transición orgánica: devuelve alpha 0..1 por píxel; s = lado (0 N,1 E,2 S,3 W); periódica a lo largo del borde => continua entre casillas
function edgeAlpha(S,s,seed,reach,soft){
  const n1=tnoise(seed),n2=tnoise(seed+7),A=new Float32Array(S*S);
  for(let py=0;py<S;py++)for(let px=0;px<S;px++){
    let u,d;const fx=(px+.5)/S,fy=(py+.5)/S;
    if(s===0){u=fx;d=fy}else if(s===2){u=fx;d=1-fy}else if(s===3){u=fy;d=fx}else{u=fy;d=1-fx}
    const q1=(n1(u*3+.37,.5,3)-.5)*1.7+.5,q2=(n2(u*6,.3,6)-.5)*1.4+.5,thr=reach*(.6+.6*q1+.25*q2);
    const g=(n2(px/S*14+s*3,py/S*14,14)-.5)*.07;
    let a=(thr-(d+g))/soft+.5;a=a<0?0:a>1?1:a;A[py*S+px]=a*a*(3-2*a)}
  return A}
function buildEdges(){
  for(const n of [SAND,SWAMP,GRASS,DIRT,ASH,ROUGH,SNOW,SUBT]){Gfx.edges[n]=[];
    const src=Gfx.tiles[n][0];
    for(let s=0;s<4;s++){const c=mkc(TILE,TILE),x=c.ctx;x.drawImage(src,0,0,TILE,TILE);const S=c.width;
      const img=x.getImageData(0,0,S,S),D=img.data,A=edgeAlpha(S,s,n*13+s*5+3,.34,.2);
      for(let i=0;i<S*S;i++){const a=A[i],rim=a*(1-a)*4;D[i*4+3]=a*255;const k=1-.2*rim;D[i*4]*=k;D[i*4+1]*=k;D[i*4+2]*=k}
      x.putImageData(img,0,0);Gfx.edges[n].push(c)}}
  // orillas: espuma ondulada (tierra) y aguas someras (agua)
  for(let s=0;s<4;s++){
    const fn=tnoise(77),mk=(land)=>{const c=mkc(TILE,TILE),x=c.ctx,S=c.width;const img=x.createImageData(S,S),D=img.data;
      const A=edgeAlpha(S,s,s*11+(land?5:9),land?.30:.34,land?.16:.3),W=edgeAlpha(S,s,s*11+(land?5:9),.2,.09),W2=edgeAlpha(S,s,s*11+3,.2,.1);
      for(let i=0;i<S*S;i++){let r,g,b,a;
        if(land){const nf=fn((i%S)/S*12,((i/S)|0)/S*12,12),wet=A[i]*.55,foam=Math.min(1,W[i]*(.35+1.2*nf)),fm=W2[i]*.35;r=30+215*foam;g=62+195*foam;b=84+171*foam;a=Math.min(1,wet*(1-foam*.5)+foam*.9+fm*.25)}
        else{const sh=A[i];r=150;g=228;b=232;a=sh*.5+W[i]*.2}
        D[i*4]=r;D[i*4+1]=g;D[i*4+2]=b;D[i*4+3]=a*255}
      x.putImageData(img,0,0);return c};
    Gfx.shoreL.push(mk(true));Gfx.shoreW.push(mk(false))}
}
function buildRoads(){
  const c0=mkc(TILE,TILE),x0=c0.ctx;
  const dirs=[[0,-1],[1,-1],[1,0],[1,1],[0,1],[-1,1],[-1,0],[-1,-1]];
  const stroke=(x,dx,dy)=>{const cx=TILE/2,cy=TILE/2,ex=cx+dx*TILE/2,ey=cy+dy*TILE/2;
    x.lineCap='round';x.strokeStyle='rgba(50,34,18,.65)';x.lineWidth=15;x.beginPath();x.moveTo(cx,cy);x.lineTo(ex,ey);x.stroke();
    x.strokeStyle='#b8905c';x.lineWidth=12;x.beginPath();x.moveTo(cx,cy);x.lineTo(ex,ey);x.stroke();
    x.strokeStyle='rgba(235,210,160,.55)';x.lineWidth=5;x.beginPath();x.moveTo(cx,cy);x.lineTo(ex,ey);x.stroke()};
  ell(x0,TILE/2,TILE/2,8.5,8.5,'rgba(50,34,18,.65)');ell(x0,TILE/2,TILE/2,7,7,'#b8905c');ell(x0,TILE/2,TILE/2,3.5,3.5,'rgba(235,210,160,.55)');Gfx.road[8]=c0;
  dirs.forEach((d,i)=>{const c=mkc(TILE,TILE);stroke(c.ctx,d[0],d[1]);Gfx.road[i]=c});
  Gfx.roadDirs=dirs;
}
function mountain(t,x,cx,by,r){
  const pal={[ROUGH]:['#aaa498','#7a746a','#4a4640'],[SNOW]:['#dde6f0','#9aa6b8','#5a6478'],[ASH]:['#6a5250','#3e2e2c','#1c1414'],[SAND]:['#d8b878','#a88850','#6a5430'],[DIRT]:['#a88a62','#7a5e3e','#4a3822'],[SUBT]:['#6a5a7e','#42365a','#201830'],[GRASS]:['#9a9a8c','#6a6a5e','#3e3e36'],[SWAMP]:['#7a8070','#4e5448','#2a3026']}[t]||['#a09a8e','#6e685e','#403c34'];
  const peak=(px,w,h,snow,al)=>{poly(x,[[px-w,by],[px-w*.4,by-h*.55],[px-w*.12,by-h*.7],[px+w*.1,by-h],[px+w*.45,by-h*.5],[px+w,by]],lg(x,px-w,by-h,px+w,by,[pal[0],pal[1],pal[2]]),OUT,1.8);
    poly(x,[[px+w*.1,by-h],[px+w*.45,by-h*.5],[px+w*.2,by-h*.45],[px,by-h*.6]],'rgba(0,0,0,.3)');poly(x,[[px-w*.4,by-h*.55],[px-w*.12,by-h*.7],[px+w*.1,by-h],[px-w*.1,by-h*.5]],'rgba(255,255,255,.22)');
    if(snow){poly(x,[[px+w*.1,by-h],[px-w*.1,by-h*.78],[px-w*.02,by-h*.72],[px+w*.12,by-h*.8],[px+w*.26,by-h*.7],[px+w*.34,by-h*.74]],'#f4f8fc')}
    x.strokeStyle='rgba(0,0,0,.28)';x.lineWidth=1.2;for(let i=0;i<3;i++){x.beginPath();x.moveTo(px+(r()-.5)*w*.6,by-h*(.3+r()*.4));x.lineTo(px+(r()-.5)*w*.8,by-h*.05);x.stroke()}
    if(t===ASH){x.strokeStyle='rgba(255,110,30,.9)';x.lineWidth=1.6;x.beginPath();x.moveTo(px+w*.05,by-h*.9);x.lineTo(px-w*.05,by-h*.5);x.lineTo(px+w*.1,by-h*.2);x.stroke()}};
  shadowE(x,cx,by+2,28,7,.45);peak(cx-13,24,48,t===SNOW||t===ROUGH);peak(cx+14,22,40,t===SNOW);peak(cx,28,64,t===SNOW||t===ROUGH||t===SUBT&&false);
}
// ---------------- decorados ----------------
function decorSprite(t,v,seed){
  const key='d'+t+'_'+v+'_'+seed;if(Gfx.cache[key])return Gfx.cache[key];
  const c=mkc(64,84),x=c.ctx,r=mulberry(seed*131+t*17+v);const cx=32,by=76;
  const tint=(col)=>shade(col,(r()-.5)*.18);
  shadowE(x,cx,by+2,20,6,.4);
  const tree=(col,tr)=>{const col2=tint(col);x.fillStyle=lg(x,cx-3,by-26,cx+3,by-26,['#4a2e18','#6a4426','#3a2412']);x.fillRect(cx-3,by-30,6,30);x.strokeStyle=OUT;x.lineWidth=1.2;x.strokeRect(cx-3,by-30,6,30);
    const blob=(bx,by2,rr,k)=>{x.fillStyle=rg(x,bx-rr*.3,by2-rr*.4,1,rr,[shade(col2,.32+k),col2,shade(col2,-.3)]);x.beginPath();x.arc(bx,by2,rr,0,6.28);x.fill();x.strokeStyle=OUT;x.lineWidth=1.2;x.stroke()};
    blob(cx-12,by-44,13,0);blob(cx+12,by-42,13,0);blob(cx,by-58,16,.05);blob(cx-4,by-38,12,0);blob(cx+6,by-50,12,.04)};
  const pine=(col,snow)=>{const cc=tint(col);x.fillStyle='#4a2e18';x.fillRect(cx-3,by-12,6,12);
    for(let i=0;i<4;i++){const y0=by-10-i*15,w=24-i*4.5;poly(x,[[cx-w,y0],[cx,y0-22],[cx+w,y0]],lg(x,cx-w,y0,cx+w,y0,[shade(cc,.2),cc,shade(cc,-.35)]),OUT,1.2);
      if(snow){poly(x,[[cx-w*.55,y0-9.5],[cx,y0-22],[cx+w*.55,y0-9.5],[cx+w*.3,y0-7],[cx,y0-11],[cx-w*.3,y0-7]],'#f4f8fc')}}};
  const rock=(col,n)=>{for(let i=0;i<n;i++){const ox=cx+(i-(n-1)/2)*14+(r()-.5)*5,s=11+r()*9,oy=by-3-r()*3;
      poly(x,[[ox-s,oy],[ox-s*.8,oy-s*.8],[ox-s*.15,oy-s*1.35],[ox+s*.7,oy-s*1.05],[ox+s,oy-s*.1],[ox+s*.5,oy]],lg(x,ox-s,oy-s,ox+s,oy,[shade(col,.3),shade(col,0),shade(col,-.38)]),OUT,1.3);
      poly(x,[[ox-s*.8,oy-s*.8],[ox-s*.15,oy-s*1.35],[ox+s*.7,oy-s*1.05],[ox+s*.2,oy-s*.6]],'rgba(255,255,255,.28)')}};
  if(v===4){mountain(t,x,cx,by,r);Gfx.cache[key]=c;return c}
  switch(t){
    case SUBT:{if(v===1){for(const[ox,h,w]of[[-12,34,6],[0,52,8],[12,28,5]]){poly(x,[[cx+ox-w,by],[cx+ox,by-h],[cx+ox+w,by]],lg(x,cx+ox-w,by-h,cx+ox+w,by,['#8a7a9a','#4a3e5a','#241c30']),OUT,1.3)}}
      else if(v===2){for(const[ox,h,w,col]of[[-10,36,6,'#5ae8ff'],[2,54,8,'#8a7aff'],[13,30,5,'#5ae8ff']]){poly(x,[[cx+ox-w,by],[cx+ox-w*.5,by-h*.7],[cx+ox,by-h],[cx+ox+w*.5,by-h*.7],[cx+ox+w,by]],lg(x,cx+ox-w,by-h,cx+ox+w,by,[shade(col,.6),col,shade(col,-.5)]),OUT,1.2)}x.fillStyle=rg(x,cx,by-30,2,36,['rgba(140,220,255,.4)','rgba(140,220,255,0)']);x.fillRect(cx-40,by-70,80,80)}
      else{for(const[ox,h,rr,col]of[[-12,20,10,'#c04a8a'],[8,32,13,'#6a5ae0'],[18,16,7,'#c04a8a']]){x.fillStyle=lg(x,cx+ox-rr,0,cx+ox+rr,0,['#d8d0e0','#a898b8']);x.fillRect(cx+ox-2.5,by-h,5,h);x.strokeStyle=OUT;x.lineWidth=1;x.strokeRect(cx+ox-2.5,by-h,5,h);
          x.beginPath();x.ellipse(cx+ox,by-h,rr,rr*.62,0,Math.PI,0);x.fillStyle=rg(x,cx+ox-rr*.3,by-h-rr*.3,1,rr*1.1,[shade(col,.5),col,shade(col,-.4)]);x.fill();x.strokeStyle=OUT;x.lineWidth=1.3;x.stroke();for(let q=0;q<3;q++)ell(x,cx+ox-rr*.5+q*rr*.5,by-h-rr*.25,1.3,1.3,'rgba(255,255,255,.7)')}}break}
    case GRASS:if(v===1)tree('#3f8a32');else if(v===2)pine('#2b6a36');else{tree('#6a9a30')}break;
    case DIRT:if(v===2){x.strokeStyle='#3a2a1c';x.lineWidth=4;x.beginPath();x.moveTo(cx,by);x.quadraticCurveTo(cx-4,by-24,cx-8,by-44);x.stroke();for(const[bx,bb]of[[-14,-38],[10,-46],[-4,-56]]){x.lineWidth=2.5;x.beginPath();x.moveTo(cx-5,by-34-(bb<-40?8:0));x.lineTo(cx+bx,by+bb);x.stroke()}}else rock('#8c8070',v===3?3:2);break;
    case SAND:if(v===1){for(const[ox,h,w]of[[0,50,7],[-11,32,5.5],[11,38,5.5]]){x.fillStyle=lg(x,cx+ox-w,0,cx+ox+w,0,['#5aa84a','#3a8a3a','#2a6a2a']);rrect(x,cx+ox-w,by-h,w*2,h,w,x.fillStyle,OUT,1.2)}x.strokeStyle='#e8f0b0';x.lineWidth=.8;for(let i=0;i<6;i++){x.beginPath();x.moveTo(cx-5+i*2,by-46);x.lineTo(cx-5+i*2,by-6);x.stroke()}}
      else if(v===2){x.strokeStyle='#6a4a2a';x.lineWidth=5;x.beginPath();x.moveTo(cx-2,by);x.quadraticCurveTo(cx+8,by-26,cx+2,by-52);x.stroke();for(let i=0;i<6;i++){const a=-2.4+i*.8;x.strokeStyle='#2f8a3a';x.lineWidth=3;x.beginPath();x.moveTo(cx+2,by-52);x.quadraticCurveTo(cx+2+Math.cos(a)*14,by-62+Math.sin(a)*6,cx+2+Math.cos(a)*24,by-52+Math.sin(a)*-6+12);x.stroke()}}
      else rock('#c8b080',2);break;
    case SNOW:if(v===3)rock('#a8c4dc',2);else pine('#3f7a62',true);break;
    case SWAMP:if(v===1){x.strokeStyle='#2e2a20';x.lineWidth=4;x.beginPath();x.moveTo(cx,by);x.quadraticCurveTo(cx-5,by-24,cx-2,by-42);x.stroke();x.lineWidth=2;for(const[bx,bb]of[[-14,-34],[12,-40],[-8,-52],[8,-56]]){x.beginPath();x.moveTo(cx-2,by-36);x.quadraticCurveTo(cx+bx*.4,by+bb+8,cx+bx,by+bb);x.stroke()}x.fillStyle='rgba(90,130,70,.55)';for(let i=0;i<5;i++)ell(x,cx+(r()-.5)*28,by-34-r()*20,5,2.5,'rgba(90,130,70,.55)')}
      else if(v===2){x.strokeStyle='#4a3a22';x.lineWidth=3;for(let i=-2;i<=2;i++){x.beginPath();x.moveTo(cx+i*6,by);x.quadraticCurveTo(cx+i*5,by-14,cx+i*2,by-24);x.stroke()}tree('#4a6a38')}
      else{for(let i=0;i<9;i++){const px=cx-14+i*3.5;x.strokeStyle=i%2?'#4a7a3a':'#7a9a4a';x.lineWidth=2;x.beginPath();x.moveTo(px,by);x.quadraticCurveTo(px+(r()-.5)*5,by-18,px+(r()-.5)*7,by-26-r()*14);x.stroke()}}break;
    case ROUGH:if(v===2){poly(x,[[cx-26,by],[cx-8,by-48],[cx,by-40],[cx+10,by-62],[cx+28,by]],lg(x,cx-26,by-60,cx+28,by,['#a09a8c','#78706a','#4a4440']),OUT,1.4);poly(x,[[cx+10,by-62],[cx+2,by-44],[cx+14,by-44],[cx+20,by-34]],'#eef2f8');poly(x,[[cx-8,by-48],[cx,by-40],[cx-4,by-30],[cx-14,by-34]],'#f2f4f8')}else rock('#8c847c',v===3?3:2);break;
    case ASH:if(v===1){poly(x,[[cx-16,by],[cx-8,by-34],[cx-2,by-20],[cx+4,by-52],[cx+12,by-24],[cx+20,by]],lg(x,cx,by-52,cx,by,['#6a4a46','#3a2a2a','#1c1414']),OUT,1.3);x.strokeStyle='rgba(255,120,30,.9)';x.lineWidth=1.6;x.beginPath();x.moveTo(cx+4,by-50);x.lineTo(cx+2,by-30);x.lineTo(cx+6,by-14);x.stroke();x.fillStyle=rg(x,cx+4,by-52,1,12,['rgba(255,160,60,.9)','rgba(255,80,20,0)']);x.fillRect(cx-10,by-66,28,28)}
      else if(v===2){x.strokeStyle='#241818';x.lineWidth=4;x.beginPath();x.moveTo(cx,by);x.quadraticCurveTo(cx-6,by-26,cx-3,by-46);x.stroke();x.lineWidth=2;for(const[bx,bb]of[[-14,-40],[12,-48],[-9,-58]]){x.beginPath();x.moveTo(cx-3,by-36);x.lineTo(cx+bx,by+bb);x.stroke()}}
      else rock('#4e3e3c',2);break;
  }
  Gfx.cache[key]=c;return c;
}
// ---------------- iconos de recursos y objetos pequeños ----------------
function resPile(res,sz=48){
  const key='r'+res+sz;if(Gfx.cache[key])return Gfx.cache[key];
  const c=mkc(48,52),x=c.ctx,cx=24,by=44;shadowE(x,cx,by+2,16,5,.4);
  const coin=(px,py)=>{ell(x,px,py,6,3,'#b8860b',OUT,1);ell(x,px,py-1.4,6,3,lg(x,px-6,py,px+6,py,['#ffe27a','#ffd24a','#d09a1a']),OUT,1);};
  switch(res){
    case'gold':for(const[px,py]of[[14,by-3],[26,by-2],[20,by-8],[32,by-7],[24,by-14],[16,by-12]])coin(px,py);break;
    case'wood':for(let i=0;i<3;i++)for(let j=0;j<3-i;j++){const px=12+j*12+i*6,py=by-4-i*8;ell(x,px+4,py,13,4.5,lg(x,px,py-4,px,py+4,['#9a6a3a','#7a4e28','#5a381c']),OUT,1.1);ell(x,px+15,py,4,4.5,'#d8a868',OUT,1);ell(x,px+15,py,2,2.2,'#b88848')}break;
    case'ore':for(const[px,py,s]of[[14,by-4,9],[28,by-3,10],[21,by-12,8]]){poly(x,[[px-s,py],[px-s*.7,py-s*.9],[px+s*.2,py-s*1.1],[px+s,py-s*.4],[px+s*.8,py]],lg(x,px-s,py-s,px+s,py,['#cdd5e0','#8a94a4','#4e5664']),OUT,1.2)}break;
    case'mercury':for(const[px,py]of[[17,by-6],[31,by-5]]){x.fillStyle=lg(x,px-7,0,px+7,0,['#a8b8d0','#e8f0ff','#8a9ab8']);rrect(x,px-7,py-14,14,15,5,x.fillStyle,OUT,1.2);rrect(x,px-3,py-20,6,7,2,'#caa86a',OUT,1);ell(x,px-2,py-9,2,3,'rgba(255,255,255,.7)')}break;
    case'sulfur':poly(x,[[8,by],[16,by-12],[24,by-6],[30,by-16],[40,by]],lg(x,0,by-16,0,by,['#f6f070','#d8cc30','#9a8a14']),OUT,1.3);for(const[px,py]of[[18,by-9],[30,by-10],[26,by-4]])ell(x,px,py,2,1.5,'#fffbb0');break;
    case'crystal':for(const[px,py,s,h]of[[16,by,7,26],[26,by,8,34],[35,by-1,6,20]]){poly(x,[[px-s,py],[px-s*.5,py-h*.7],[px,py-h],[px+s*.5,py-h*.7],[px+s,py]],lg(x,px-s,py-h,px+s,py,['#d0faff','#5ad8f0','#1c8aaa']),OUT,1.2);poly(x,[[px-s*.5,py-h*.7],[px,py-h],[px,py]],'rgba(255,255,255,.35)')}break;
    case'gems':for(const[px,py,col]of[[15,by-3,'#ff5aa0'],[28,by-4,'#5a8aff'],[22,by-11,'#5aff9a'],[34,by-2,'#ffd04a']]){poly(x,[[px-6,py-5],[px-3,py-9],[px+3,py-9],[px+6,py-5],[px,py+1]],lg(x,px-6,py-9,px+6,py+1,[shade(col,.45),col,shade(col,-.4)]),OUT,1.1);x.strokeStyle='rgba(255,255,255,.6)';x.lineWidth=.8;x.beginPath();x.moveTo(px-3,py-9);x.lineTo(px,py-5);x.lineTo(px+3,py-9);x.stroke()}break;
  }
  return Gfx.cache[key]=c;
}
function chestSprite(){const key='chest';if(Gfx.cache[key])return Gfx.cache[key];const c=mkc(48,52),x=c.ctx;shadowE(x,24,44,18,5,.4);
  rrect(x,9,24,30,18,2,lg(x,0,24,0,42,['#9a6a3a','#7a4a22','#4a2a12']),OUT,1.3);
  x.beginPath();x.moveTo(9,24);x.quadraticCurveTo(24,6,39,24);x.closePath();x.fillStyle=lg(x,0,10,0,24,['#b8824a','#8a5a2a']);x.fill();x.strokeStyle=OUT;x.lineWidth=1.3;x.stroke();
  x.fillStyle='#e8c25a';x.fillRect(9,28,30,3);x.fillRect(21,19,6,16);rrect(x,21,27,6,7,1.5,'#ffe27a',OUT,1);x.fillStyle='#ffe27a';for(const px of[12,34])x.fillRect(px,24,2.5,18);
  return Gfx.cache[key]=c}
function artSprite(){const key='art';if(Gfx.cache[key])return Gfx.cache[key];const c=mkc(48,52),x=c.ctx;shadowE(x,24,44,13,4,.35);
  x.fillStyle=rg(x,24,28,2,22,['rgba(255,240,150,.9)','rgba(255,200,60,.3)','rgba(255,200,60,0)']);x.fillRect(0,0,48,52);
  poly(x,[[24,10],[34,24],[28,38],[20,38],[14,24]],lg(x,14,10,34,38,['#fff4b0','#e8b83a','#9a6a14']),OUT,1.4);poly(x,[[24,10],[34,24],[24,26],[14,24]],'rgba(255,255,255,.55)');ell(x,24,24,4,4,'#fff',null);return Gfx.cache[key]=c}
// ---------------- sitios ----------------
function siteSprite(k){
  if(typeof SITEDEF!=='undefined'&&SITEDEF[k])return siteSprite2(k);
  const key='s'+k;if(Gfx.cache[key])return Gfx.cache[key];const c=mkc(56,84),x=c.ctx,cx=28,by=76;shadowE(x,cx,by+1,22,6,.4);
  const stone=(x0,y0,w,h,col='#8c8a96')=>rrect(x,x0,y0,w,h,2,lg(x,x0,y0,x0+w,y0,[shade(col,.25),col,shade(col,-.35)]),OUT,1.2);
  switch(k){
    case'shrine':stone(cx-20,by-6,40,6,'#7a788a');stone(cx-15,by-52,8,48);stone(cx+7,by-52,8,48);stone(cx-19,by-60,38,9,'#9a98aa');ell(x,cx,by-30,9,14,rg(x,cx,by-30,1,14,['rgba(180,230,255,.95)','rgba(100,160,255,.5)','rgba(100,160,255,0)']));
      x.strokeStyle='rgba(200,240,255,.9)';x.lineWidth=1.4;x.beginPath();x.moveTo(cx-4,by-36);x.lineTo(cx,by-22);x.lineTo(cx+4,by-36);x.stroke();break;
    case'hut':poly(x,[[cx-20,by],[cx-18,by-26],[cx+18,by-26],[cx+20,by]],lg(x,cx-20,0,cx+20,0,['#8a6a4a','#6a4a30','#4a3220']),OUT,1.3);poly(x,[[cx-26,by-24],[cx,by-56],[cx+26,by-24]],lg(x,cx-26,by-56,cx+26,by-24,['#6a4a8a','#4a2a6a','#2a1a40']),OUT,1.4);
      rrect(x,cx-6,by-18,12,18,5,'#241420',OUT,1);ell(x,cx-12,by-14,3,3,'rgba(255,220,120,.9)');ell(x,cx,by-60,3,3,'#b8f0ff');break;
    case'well':{ell(x,cx,by-6,18,7,'#7a788a',OUT);ell(x,cx,by-8,15,5.5,'#101830',OUT,1);ell(x,cx,by-8,12,4,'#2a6ab8');stone(cx-17,by-14,6,10);stone(cx+11,by-14,6,10);
      x.strokeStyle='#5a3a1e';x.lineWidth=3;x.beginPath();x.moveTo(cx-14,by-14);x.lineTo(cx-14,by-40);x.moveTo(cx+14,by-14);x.lineTo(cx+14,by-40);x.stroke();poly(x,[[cx-20,by-38],[cx,by-52],[cx+20,by-38]],'#a05a3a',OUT,1.2);break}
    case'stone':poly(x,[[cx-10,by],[cx-9,by-52],[cx,by-62],[cx+9,by-52],[cx+11,by]],lg(x,cx-10,0,cx+11,0,['#aeb4c8','#7a8098','#4a5068']),OUT,1.4);x.strokeStyle='rgba(120,220,255,.95)';x.lineWidth=1.5;for(let i=0;i<4;i++){x.beginPath();x.moveTo(cx-4,by-14-i*10);x.lineTo(cx+4,by-18-i*10);x.stroke()}ell(x,cx,by-40,10,14,rg(x,cx,by-40,1,14,['rgba(120,220,255,.35)','rgba(120,220,255,0)']));break;
    case'stable':poly(x,[[cx-24,by],[cx-24,by-26],[cx,by-44],[cx+24,by-26],[cx+24,by]],lg(x,cx-24,0,cx+24,0,['#b8663a','#9a4a28','#6a2e18']),OUT,1.3);rrect(x,cx-9,by-22,18,22,2,'#2a1810',OUT,1);x.strokeStyle='#e8d8b0';x.lineWidth=2;x.beginPath();x.moveTo(cx-9,by-22);x.lineTo(cx+9,by);x.moveTo(cx+9,by-22);x.lineTo(cx-9,by);x.stroke();poly(x,[[cx-28,by-24],[cx,by-48],[cx+28,by-24]],'#6a3a22',OUT,1.3);break;
    case'mill':poly(x,[[cx-12,by],[cx-9,by-34],[cx+9,by-34],[cx+12,by]],lg(x,cx-12,0,cx+12,0,['#e8dcc0','#c8b890','#8a7a58']),OUT,1.3);poly(x,[[cx-13,by-32],[cx,by-48],[cx+13,by-32]],'#9a4a32',OUT,1.3);rrect(x,cx-3,by-12,6,12,2,'#3a2412',OUT,1);
      x.save();x.translate(cx,by-38);for(let i=0;i<4;i++){x.rotate(Math.PI/2);poly(x,[[0,0],[-3,-24],[3,-24]],'#8a5a30',OUT,1);rrect(x,-9,-30,8,18,1,'#f0e8d0',OUT,1)}x.restore();ell(x,cx,by-38,3.5,3.5,'#5a3a1e',OUT,1);break;
  }
  return Gfx.cache[key]=c;
}
// ---------------- minas ----------------
function mineSprite(res){
  const key='m'+res;if(Gfx.cache[key])return Gfx.cache[key];const W=3*TILE,H=2*TILE+36,c=mkc(W,H),x=c.ctx,r=mulberry(res.length*91+res.charCodeAt(0));
  shadowE(x,W/2,H-6,66,14,.4);
  // colina rocosa
  poly(x,[[10,H-10],[18,H-52],[44,H-74],[76,H-86],[104,H-70],[128,H-48],[136,H-10]],lg(x,0,H-86,0,H-10,({gold:['#b09c6e','#7e6a48','#46391f'],wood:['#6c9050','#4a6c34','#2a4020'],ore:['#8e929c','#60646f','#34363e'],mercury:['#908aa8','#625c7c','#383250'],sulfur:['#b8a864','#7e723c','#4a4224'],crystal:['#7c90b0','#4e5e80','#2a3454'],gems:['#907e92','#60506a','#382c40']}[res])||['#9a8a78','#6a5c50','#3c322c']),OUT,1.8);
  poly(x,[[18,H-52],[44,H-74],[76,H-86],[70,H-60],[40,H-48]],'rgba(255,240,210,.22)');
  for(let i=0;i<10;i++){const px=18+r()*108,py=H-80+r()*60;ell(x,px,py,2+r()*3,1.5+r()*2,'rgba(0,0,0,.18)')}
  // entrada y vigas
  rrect(x,52,H-48,40,38,8,'#0e0a0e',OUT,1.5);ell(x,72,H-40,14,18,rg(x,72,H-40,2,18,['rgba(255,190,90,.35)','rgba(0,0,0,0)']));
  x.fillStyle='#6a4426';x.fillRect(48,H-52,6,44);x.fillRect(90,H-52,6,44);x.fillRect(46,H-56,52,6);x.strokeStyle=OUT;x.lineWidth=1.2;x.strokeRect(48,H-52,6,44);x.strokeRect(90,H-52,6,44);x.strokeRect(46,H-56,52,6);
  const col=RESC[res];
  if(res==='gold'){for(const[px,py]of[[28,H-14],[40,H-12],[104,H-14],[114,H-12]]){poly(x,[[px-7,py],[px-5,py-8],[px+4,py-9],[px+8,py]],lg(x,px,py-9,px,py,['#ffe27a','#d8a21a']),OUT,1.1)}}
  else if(res==='wood'){for(let i=0;i<4;i++){ell(x,100+(i%2)*14,H-12-Math.floor(i/2)*9,13,4.5,'#8a5a2e',OUT,1);ell(x,114+(i%2)*14,H-12-Math.floor(i/2)*9,3.5,4.5,'#d8a868',OUT,1)}x.fillStyle='#5a3a1e';x.fillRect(20,H-34,16,24);poly(x,[[16,H-34],[28,H-46],[40,H-34]],'#a05a32',OUT,1.2)}
  else if(res==='ore'){for(const[px,py]of[[26,H-14],[112,H-14]]){poly(x,[[px-10,py],[px-6,py-10],[px+6,py-10],[px+10,py]],lg(x,px,py-10,px,py,['#c8d0dc','#7a8494']),OUT,1.2)}rrect(x,100,H-24,24,12,2,'#4a4a56',OUT,1.2);ell(x,106,H-10,4,4,'#222',OUT,1);ell(x,118,H-10,4,4,'#222',OUT,1)}
  else{const g=(px,py,h,w=6)=>poly(x,[[px-w,py],[px-w*.5,py-h*.7],[px,py-h],[px+w*.5,py-h*.7],[px+w,py]],lg(x,px-w,py-h,px+w,py,[shade(col,.5),col,shade(col,-.45)]),OUT,1.2);
    g(28,H-12,22);g(40,H-11,14,5);g(108,H-12,26,7);g(120,H-11,15,5);g(100,H-10,12,4);
    if(res==='mercury'||res==='sulfur'){ell(x,72,H-8,22,5,shade(col,-.2),null)}}
  // detalles propios de cada recurso
  const sparkle=(px,py,sz,cl)=>{x.fillStyle=cl;x.beginPath();x.moveTo(px,py-sz);x.lineTo(px+sz*.28,py-sz*.28);x.lineTo(px+sz,py);x.lineTo(px+sz*.28,py+sz*.28);x.lineTo(px,py+sz);x.lineTo(px-sz*.28,py+sz*.28);x.lineTo(px-sz,py);x.lineTo(px-sz*.28,py-sz*.28);x.fill()};
  const puff=(px,py,n,cl)=>{for(let i=0;i<n;i++)ell(x,px+i*3+(i%2)*2,py-i*8,5+i*1.6,4.4+i*1.2,cl)};
  if(res==='gold'){sparkle(34,H-26,5,'#fff6c0');sparkle(110,H-28,4,'#fff6c0');sparkle(122,H-20,3,'#fff6c0');
    x.strokeStyle='#4a4a54';x.lineWidth=1.6;x.beginPath();x.moveTo(24,H-6);x.lineTo(54,H-8);x.stroke()}
  else if(res==='wood'){x.save();x.translate(26,H-38);ell(x,0,0,12,12,'#cfd4de',OUT,1.3);for(let i=0;i<12;i++){x.rotate(.5236);poly(x,[[10,-2],[15,0],[10,2]],'#cfd4de',OUT,.8)}ell(x,0,0,3,3,'#5a3a1e',OUT,1);x.restore();
    for(let i=0;i<4;i++){x.fillStyle='#d8b078';x.fillRect(108,H-18-i*4,26,3.4);x.strokeStyle=OUT;x.lineWidth=.8;x.strokeRect(108,H-18-i*4,26,3.4)}}
  else if(res==='ore'){rrect(x,14,H-92,8,22,1,'#4a4a56',OUT,1.2);puff(18,H-96,3,'rgba(120,120,130,.45)');x.fillStyle='#e8e8f0';sparkle(30,H-24,3.4,'#e8f0ff')}
  else if(res==='mercury'){for(const[px,py]of[[20,H-14],[30,H-12]]){x.beginPath();x.moveTo(px-3,py-12);x.lineTo(px-3,py-17);x.lineTo(px+3,py-17);x.lineTo(px+3,py-12);x.quadraticCurveTo(px+9,py-8,px+7,py-2);x.lineTo(px-7,py-2);x.quadraticCurveTo(px-9,py-8,px-3,py-12);x.fillStyle=lg(x,px-8,0,px+8,0,['#e8f0ff','#b8c8e8']);x.fill();x.strokeStyle=OUT;x.lineWidth=1.1;x.stroke();ell(x,px,py-6,5,3,'#dfe8f8',null)}sparkle(112,H-32,4,'#ffffff')}
  else if(res==='sulfur'){puff(98,H-84,4,'rgba(230,220,90,.4)');puff(34,H-76,3,'rgba(230,220,90,.35)');x.strokeStyle='rgba(60,50,10,.6)';x.lineWidth=1.2;for(let i=0;i<4;i++){x.beginPath();x.moveTo(38+i*14,H-60);x.lineTo(34+i*14,H-44);x.stroke()}}
  else{x.fillStyle=rg(x,72,H-30,4,60,[col+'88','rgba(0,0,0,0)']);x.fillRect(10,H-100,124,100);sparkle(30,H-34,4.4,'#ffffff');sparkle(114,H-40,5,'#ffffff');sparkle(66,H-70,3.4,'#ffffff')}
  return Gfx.cache[key]=c;
}
// ---------------- ciudades ----------------
const TSTYLE=[
 {wall:'#d8d4c8',roof:'#3b6fd0',trim:'#e8c25a',kind:'cone',towers:[[-52,60],[52,60],[0,84]],win:'#ffe9a0',base:'#9a9a8a'},
 {wall:'#7a5a3a',roof:'#3f9a46',trim:'#c8e870',kind:'round',towers:[[-50,52],[50,52],[0,72]],win:'#fff0a0',base:'#5a4a2a'},
 {wall:'#4a4458',roof:'#2a2038',trim:'#b8e0c0',kind:'spike',towers:[[-54,70],[54,70],[0,92]],win:'#9affc0',base:'#34303c'},
 {wall:'#4a2a28',roof:'#a02a1a',trim:'#ffb040',kind:'spike',towers:[[-52,64],[52,64],[0,88]],win:'#ff8a30',base:'#2a1818'},
 {wall:'#8a8a94',roof:'#5a5a64',trim:'#e8a040',kind:'flat',towers:[[-52,54],[52,54],[0,70]],win:'#ffd070',base:'#6a6a74'},
 {wall:'#f0ece0',roof:'#2a8ac0',trim:'#f0e0a0',kind:'dome',towers:[[-52,58],[52,58],[0,80]],win:'#a0f0ff',base:'#c8b890'},
 {wall:'#6a5a3a',roof:'#6a8a2a',trim:'#e0e070',kind:'hut',towers:[[-50,50],[50,50],[0,66]],win:'#f0f080',base:'#4a4a2a'},
 {wall:'#7a6a58',roof:'#5a6a98',trim:'#f0f4ff',kind:'flat',towers:[[-52,60],[52,60],[0,80]],win:'#fff0b0',base:'#5a5a68'}];
// ---------------- viviendas neutrales ----------------
function dwellSprite(cid){
  const key='w'+cid;if(Gfx.cache[key])return Gfx.cache[key];const cr=CR[cid],W=3*TILE,H=2*TILE+30,c=mkc(W,H),x=c.ctx,cx=W/2,by=H-6;shadowE(x,cx,by-2,60,12,.4);
  const pal=cr.pal;
  poly(x,[[cx-52,by-4],[cx-48,by-38],[cx+48,by-38],[cx+52,by-4]],lg(x,0,by-38,0,by,['#a89070','#8a7050','#5a4430']),OUT,1.5);
  poly(x,[[cx-60,by-34],[cx,by-82],[cx+60,by-34]],lg(x,cx-60,by-82,cx+60,by-34,[shade(pal[0],.3),pal[0],shade(pal[0],-.4)]),OUT,1.6);
  rrect(x,cx-14,by-34,28,30,4,'#1a1018',OUT,1.3);for(let i=0;i<6;i++){x.strokeStyle='rgba(255,255,255,.12)';x.beginPath();x.moveTo(cx-60+i*20,by-34);x.lineTo(cx,by-82);x.stroke()}
  poly(x,[[cx-34,by-60],[cx-22,by-60],[cx-22,by-44],[cx-28,by-40],[cx-34,by-44]],pal[1],OUT,1);
  const spr=creatureSprite(cid,false);const k=.55;x.drawImage(spr,cx+14,by-62,96*k,96*k);
  return Gfx.cache[key]={c};
}
// ---------------- héroe en el mapa ----------------
function heroSprite(color,frame){
  const key='h'+color+frame;if(Gfx.cache[key])return Gfx.cache[key];const c=mkc(64,72),x=c.ctx,cx=30,by=64;shadowE(x,cx,by+2,22,6,.45);
  const leg=frame?3:-3;
  // caballo
  const horse='#e8e4dc';x.strokeStyle=OUT;x.lineWidth=1.3;
  for(const[lx,dl]of[[-14,leg],[-8,-leg],[10,-leg],[16,leg]]){x.fillStyle=shade(horse,-.25);x.fillRect(cx+lx-2,by-18,4.5,14+dl*.4);x.strokeRect(cx+lx-2,by-18,4.5,14+dl*.4);x.fillStyle='#3a3030';x.fillRect(cx+lx-2.5,by-5+dl*.4,5.5,4)}
  ell(x,cx,by-24,22,11,lg(x,0,by-35,0,by-13,[shade(horse,.1),horse,shade(horse,-.3)]),OUT,1.4);
  poly(x,[[cx+17,by-30],[cx+30,by-48],[cx+37,by-44],[cx+31,by-26]],lg(x,cx+17,by-48,cx+37,by-26,[horse,shade(horse,-.3)]),OUT,1.3);
  ell(x,cx+36,by-43,6,4.5,horse,OUT,1.2);ell(x,cx+38,by-44,1,1,'#222');poly(x,[[cx+22,by-48],[cx+26,by-58],[cx+30,by-48]],'#d8d0c4',OUT,1);
  x.strokeStyle='#6a4a2a';x.lineWidth=5;x.beginPath();x.moveTo(cx+24,by-46);x.quadraticCurveTo(cx+18,by-36,cx+14,by-28);x.stroke();
  x.strokeStyle='#c8c0b0';x.lineWidth=5;x.beginPath();x.moveTo(cx-20,by-28);x.quadraticCurveTo(cx-30,by-20,cx-27,by-8);x.stroke();
  // silla y capa
  poly(x,[[cx-12,by-32],[cx+4,by-32],[cx+8,by-20],[cx-20,by-20]],color,OUT,1.2);
  // jinete
  rrect(x,cx-7,by-52,13,22,3,lg(x,cx-7,0,cx+6,0,['#d8dce8','#9aa4b8','#6a7288']),OUT,1.3);
  rrect(x,cx-9,by-48,6,18,2,color,OUT,1);
  ell(x,cx,by-58,6.5,6.5,lg(x,cx-6,by-64,cx+6,by-52,['#e8ecf4','#8e98ac']),OUT,1.3);x.fillStyle='#2a2430';x.fillRect(cx-1,by-60,6,2.5);
  x.fillStyle=color;poly(x,[[cx-2,by-64],[cx+2,by-72],[cx+6,by-64]],color,OUT,1);
  // lanza con pendón
  x.strokeStyle='#6a4a2a';x.lineWidth=2;x.beginPath();x.moveTo(cx+6,by-30);x.lineTo(cx+10,by-70);x.stroke();poly(x,[[cx+10,by-70],[cx+26,by-66],[cx+10,by-60]],color,OUT,1);
  return Gfx.cache[key]=c;
}
function flagSprite(color){const key='f'+color;if(Gfx.cache[key])return Gfx.cache[key];const c=mkc(24,20),x=c.ctx;poly(x,[[1,2],[22,5],[17,10],[22,15],[1,18]],lg(x,0,0,24,0,[shade(color,.3),color,shade(color,-.3)]),OUT,1.1);return Gfx.cache[key]=c}
function drawFlag(ctx,color,x,y,t){const f=flagSprite(color);const w=Math.sin(t*5+x*.1)*1.6;ctx.drawImage(f,x,y+w*.4,24,20)}
// ---------------- iconos UI ----------------
function resIcon(res,s=22){const key='i'+res+s;if(Gfx.cache[key])return Gfx.cache[key];const c=mkc(s,s),x=c.ctx;const p=resPile(res);x.drawImage(p,-s*.05,-s*.15,s*1.1,s*1.15);return Gfx.cache[key]=c}
function initGfx(){
  if(Gfx.ready)return;
  for(const t of [GRASS,DIRT,SAND,SNOW,SWAMP,ROUGH,ASH,SUBT]){Gfx.tiles[t]=[];for(let v=0;v<NVAR;v++)Gfx.tiles[t].push(drawTerrainTile(t,v))}
  Gfx.tiles[LAVA]=[];for(let f=0;f<6;f++)Gfx.tiles[LAVA].push(drawTerrainTile(LAVA,f,f));
  Gfx.tiles[WATER]=[];for(let f=0;f<6;f++)Gfx.tiles[WATER].push(drawTerrainTile(WATER,f,f));
  buildEdges();buildRoads();buildLavaShores();Gfx.ready=true;
}
