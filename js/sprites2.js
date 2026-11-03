'use strict';
// =====================================================================
//  Gráficos 2: lava, subsuelo, montañas, portales, barcos, iconos de
//  artefactos, luces, sombras proyectadas y nubes
// =====================================================================
function drawNewTile(t,v,frame=0){
  const c=mkc(TILE,TILE),x=c.ctx,r=mulberry(t*1777+v*97+frame*31+5);
  if(t===LAVA){
    x.fillStyle=lg(x,0,0,TILE,TILE,['#ff8a20','#e04a0c','#b02c08']);x.fillRect(0,0,TILE,TILE);
    for(let k=0;k<4;k++){const px=((k*17+v*9+frame*3.2)%TILE),py=((k*29+v*13+frame*2)%TILE);ell(x,px,py,6+r()*6,3+r()*3,'rgba(48,14,6,.78)');ell(x,px-1,py-1,4,1.6,'rgba(90,30,10,.7)')}
    for(let k=0;k<5;k++){let px=r()*TILE,py=r()*TILE;x.strokeStyle=k%2?'rgba(255,224,110,.85)':'rgba(255,170,50,.8)';x.lineWidth=1.4;x.beginPath();x.moveTo(px,py);for(let q=0;q<4;q++){px+=(r()-.5)*14+Math.sin(frame*1.05+k)*2;py+=(r()-.4)*10;x.lineTo(px,py)}x.stroke()}
    for(let k=0;k<3;k++){const px=r()*TILE,py=r()*TILE,rr=1+((frame+k)%3);x.strokeStyle='rgba(255,236,150,.7)';x.lineWidth=.9;x.beginPath();x.arc(px,py,rr,0,6.28);x.stroke()}
    return c}
  // SUBT
  x.fillStyle=shade(TBASE[SUBT],(r()-.5)*.04);x.fillRect(0,0,TILE,TILE);
  for(let i=0;i<34;i++){x.fillStyle=r()<.5?'rgba(10,6,20,.38)':'rgba(150,130,180,.26)';const px=r()*TILE,py=r()*TILE;x.beginPath();x.arc(px,py,1+r()*2.6,0,6.28);x.fill()}
  for(let i=0;i<3;i++){const px=6+r()*34,py=6+r()*34,s=3+r()*5;poly(x,[[px-s,py+s*.5],[px-s*.4,py-s*.6],[px+s*.6,py-s*.6],[px+s,py+s*.4]],'rgba(92,80,108,.85)','rgba(18,10,28,.55)',1);poly(x,[[px-s*.4,py-s*.6],[px+s*.6,py-s*.6],[px+s*.2,py-s*.1]],'rgba(170,150,196,.45)')}
  if(v%3===1)for(let i=0;i<2;i++){const px=8+r()*32,py=8+r()*32;ell(x,px,py,4,2.4,'rgba(80,220,200,.22)');x.fillStyle='rgba(150,255,230,.8)';x.fillRect(px-.7,py-.7,1.6,1.6)}
  if(v%3===2){let px=r()*TILE,py=r()*TILE;x.strokeStyle='rgba(12,6,22,.7)';x.lineWidth=1.3;x.beginPath();x.moveTo(px,py);for(let q=0;q<4;q++){px+=(r()-.5)*14;py+=(r()-.5)*14;x.lineTo(px,py)}x.stroke()}
  return c;
}
function buildLavaShores(){
  Gfx.lavaL=[];Gfx.lavaW=[];
  for(let s=0;s<4;s++){
    const gr=(x,a,b)=>{if(s===0)return lg(x,0,0,0,a,b);if(s===1)return lg(x,TILE,0,TILE-a,0,b);if(s===2)return lg(x,0,TILE,0,TILE-a,b);return lg(x,0,0,a,0,b)};
    const L=mkc(TILE,TILE),lx=L.ctx;lx.fillStyle=gr(lx,16,['rgba(255,110,20,.55)','rgba(180,50,10,.28)','rgba(0,0,0,0)']);lx.fillRect(0,0,TILE,TILE);lx.fillStyle=gr(lx,5,['rgba(20,8,6,.8)','rgba(20,8,6,0)']);lx.fillRect(0,0,TILE,TILE);Gfx.lavaL.push(L);
    const W2=mkc(TILE,TILE),wx=W2.ctx;wx.fillStyle=gr(wx,14,['rgba(30,10,6,.7)','rgba(60,20,8,.25)','rgba(0,0,0,0)']);wx.fillRect(0,0,TILE,TILE);Gfx.lavaW.push(W2);
  }
}
// ---------- sombra silueta y brillo ----------
function silhouette(img,k=.4){const key=img.__sil;if(key)return key;const c=mkc(img.lw,img.lh);const x=c.ctx;x.drawImage(img,0,0,img.lw,img.lh);x.globalCompositeOperation='source-in';x.fillStyle=`rgba(8,6,18,${k})`;x.fillRect(0,0,img.lw,img.lh);return img.__sil=c}
function drawCast(c,img,bx,by,dx,dy,w,h,sway=0){ // sombra proyectada hacia la derecha-abajo
  const s=silhouette(img);c.save();c.translate(bx,by);c.transform(1,0,-.55+sway*.4,-.34,0,0);c.drawImage(s,dx,-dy-h+h,w,h);c.restore()}
let _glow={};
function glowSprite(col,sz=128){const k=col+sz;if(_glow[k])return _glow[k];const c=mkc(sz,sz,1),x=c.ctx;x.fillStyle=rg(x,sz/2,sz/2,0,sz/2,[col,col.replace(/[\d.]+\)$/,'.25)'),col.replace(/[\d.]+\)$/,'0)')]);x.fillRect(0,0,sz,sz);return _glow[k]=c}
function cloudTex(){const k='cloud';if(Gfx.cache[k])return Gfx.cache[k];const S=256,c=document.createElement('canvas');c.width=c.height=S;const x=c.getContext('2d'),img=x.createImageData(S,S);
  const fr=[[1,1,.5],[2,1,.25],[2,3,.14],[4,2,.11]],ph=fr.map(()=>[Math.random()*6.28,Math.random()*6.28]);
  for(let j=0;j<S;j++)for(let i=0;i<S;i++){let v=0;fr.forEach((f,q)=>{v+=f[2]*Math.sin(i/S*6.2832*f[0]+ph[q][0])*Math.sin(j/S*6.2832*f[1]+ph[q][1])});v=(v+1)/2;const a=Math.max(0,(v-.5)*2.4);const o=(j*S+i)*4;img.data[o]=10;img.data[o+1]=14;img.data[o+2]=40;img.data[o+3]=Math.min(255,a*190)}
  x.putImageData(img,0,0);return Gfx.cache[k]=c}
// ---------- puertas, monolitos, barcos ----------
function gateSprite(under){
  const key='g'+under;if(Gfx.cache[key])return Gfx.cache[key];const c=mkc(2*TILE,2*TILE+34),x=c.ctx,W=2*TILE,H=2*TILE+34,cx=W/2,by=H-4;
  shadowE(x,cx,by-2,44,9,.45);
  if(!under){poly(x,[[2,by],[8,by-52],[30,by-82],[cx,by-90],[W-30,by-82],[W-8,by-52],[W-2,by]],lg(x,0,by-90,0,by,['#8c8274','#6a6258','#3e3830']),OUT,1.8);
    for(let i=0;i<8;i++)ell(x,12+i*10,by-20-(i*13%40),3+i%3,2,'rgba(0,0,0,.18)');poly(x,[[10,by-52],[30,by-82],[44,by-70],[24,by-48]],'rgba(255,255,255,.2)')}
  else{poly(x,[[2,by],[8,by-52],[30,by-82],[cx,by-90],[W-30,by-82],[W-8,by-52],[W-2,by]],lg(x,0,by-90,0,by,['#5a4a68','#3e3250','#241a30']),OUT,1.8)}
  // arco de piedra
  x.fillStyle=OUT;x.beginPath();x.moveTo(cx-24,by);x.lineTo(cx-24,by-42);x.quadraticCurveTo(cx,by-76,cx+24,by-42);x.lineTo(cx+24,by);x.closePath();x.fill();
  if(!under){const g=lg(x,0,by-70,0,by,['#0a0510','#2a1a40']);x.fillStyle=g;x.fill();for(let i=0;i<4;i++){x.fillStyle='#9a8e7e';rrect(x,cx-28+i*1,by-10-i*10,56-i*2,8,2,lg(x,0,by-10-i*10,0,by-2-i*10,['#b0a490','#7a6e5c']),OUT,1)}}
  else{x.fillStyle=lg(x,0,by-70,0,by,['rgba(255,235,170,.95)','rgba(255,190,90,.7)']);x.fill();for(let i=0;i<4;i++){rrect(x,cx-22+i*2,by-8-i*10,44-i*4,8,2,lg(x,0,by-8-i*10,0,by-i*10,['#c8b8a0','#8a7a62']),OUT,1)}}
  x.lineWidth=7;x.strokeStyle=OUT;x.beginPath();x.moveTo(cx-24,by);x.lineTo(cx-24,by-42);x.quadraticCurveTo(cx,by-76,cx+24,by-42);x.lineTo(cx+24,by);x.stroke();
  x.lineWidth=4.4;x.strokeStyle=under?'#a89aaa':'#b4a890';x.stroke();
  x.fillStyle=under?'#ffd890':'#9aa0c0';x.font='bold 11px '+FONT;x.textAlign='center';x.fillText(under?'▲':'▼',cx,by-80);
  return Gfx.cache[key]=c;
}
function monoSprite(col){
  const key='mo'+col;if(Gfx.cache[key])return Gfx.cache[key];const c=mkc(56,92),x=c.ctx,cx=28,by=84,pc=PCOL[col%8];shadowE(x,cx,by+1,20,6,.45);
  x.fillStyle=lg(x,0,by-10,0,by,['#7a7684','#4a4654']);ell(x,cx,by-4,20,7,x.fillStyle,OUT,1.4);ell(x,cx,by-7,15,5,'#aaa6b8',null);
  poly(x,[[cx-11,by-6],[cx-9,by-58],[cx-2,by-72],[cx+6,by-60],[cx+11,by-8]],lg(x,cx-11,0,cx+11,0,['#aeaabe','#7a768c','#46425a']),OUT,1.6);
  poly(x,[[cx-9,by-58],[cx-2,by-72],[cx+1,by-62]],'rgba(255,255,255,.35)');
  x.strokeStyle=pc;x.lineWidth=2;x.shadowColor=pc;x.shadowBlur=8;for(let i=0;i<4;i++){x.beginPath();x.moveTo(cx-5,by-16-i*11);x.lineTo(cx+1,by-20-i*11);x.lineTo(cx+5,by-16-i*11);x.stroke()}x.shadowBlur=0;
  x.strokeStyle=pc;x.globalAlpha=.8;x.lineWidth=2.2;x.beginPath();x.ellipse(cx,by-4,17,6,0,0,6.28);x.stroke();x.globalAlpha=1;
  return Gfx.cache[key]=c;
}
function boatSprite(){
  const key='boat';if(Gfx.cache[key])return Gfx.cache[key];const c=mkc(64,60),x=c.ctx,cx=32,by=48;shadowE(x,cx,by+2,24,6,.3);
  poly(x,[[cx-24,by-12],[cx+26,by-12],[cx+20,by],[cx-16,by]],lg(x,0,by-12,0,by,['#a8743c','#7a4c24','#4a2c14']),OUT,1.6);
  x.strokeStyle='#e8d8b0';x.lineWidth=1.4;x.beginPath();x.moveTo(cx-22,by-8);x.lineTo(cx+22,by-8);x.stroke();
  x.strokeStyle=OUT;x.lineWidth=3.4;x.beginPath();x.moveTo(cx,by-12);x.lineTo(cx,by-48);x.stroke();x.strokeStyle='#6a4426';x.lineWidth=1.8;x.stroke();
  poly(x,[[cx+2,by-46],[cx+22,by-24],[cx+2,by-18]],lg(x,cx,by-46,cx+22,by-18,['#fffaf0','#d8d0b8']),OUT,1.3);poly(x,[[cx-2,by-44],[cx-16,by-26],[cx-2,by-20]],'#ece4cc',OUT,1.3);
  return Gfx.cache[key]=c;
}
function shipHeroSprite(color,frame){
  const key='sh'+color+frame;if(Gfx.cache[key])return Gfx.cache[key];const c=mkc(72,72),x=c.ctx,cx=36,by=60;shadowE(x,cx,by+2,28,7,.3);
  poly(x,[[cx-28,by-16],[cx+30,by-16],[cx+22,by],[cx-18,by]],lg(x,0,by-16,0,by,['#a8743c','#7a4c24','#4a2c14']),OUT,1.7);
  x.fillStyle=color;x.fillRect(cx-26,by-12,54,4);x.strokeStyle=OUT;x.lineWidth=1;x.strokeRect(cx-26,by-12,54,4);
  x.strokeStyle=OUT;x.lineWidth=3.6;x.beginPath();x.moveTo(cx+2,by-16);x.lineTo(cx+2,by-60);x.stroke();x.strokeStyle='#6a4426';x.lineWidth=2;x.stroke();
  const sw=frame?2:-2;poly(x,[[cx+4,by-58],[cx+26+sw,by-34],[cx+4,by-24]],lg(x,cx,by-58,cx+26,by-24,[shade(color,.5),color,shade(color,-.3)]),OUT,1.4);
  poly(x,[[cx,by-56],[cx-20-sw,by-34],[cx,by-26]],shade(color,.2),OUT,1.4);
  rrect(x,cx-6,by-34,11,18,3,lg(x,cx-6,0,cx+5,0,['#d8dce8','#8e98ac']),OUT,1.2);ell(x,cx,by-38,5.4,5.4,lg(x,cx-5,by-44,cx+5,by-32,['#e8ecf4','#8e98ac']),OUT,1.2);
  return Gfx.cache[key]=c;
}
function shopSprite(){
  const key='shop';if(Gfx.cache[key])return Gfx.cache[key];const c=mkc(56,84),x=c.ctx,cx=28,by=76;shadowE(x,cx,by+1,24,6,.4);
  rrect(x,cx-20,by-24,40,24,2,lg(x,0,by-24,0,by,['#a8743c','#6a4426']),OUT,1.4);
  for(let i=0;i<5;i++){const px=cx-24+i*10;poly(x,[[px,by-48],[px+10,by-48],[px+10,by-30],[px,by-30]],i%2?'#f4f0e0':'#c8302a',OUT,1.1)}
  x.strokeStyle='#5a3a1e';x.lineWidth=3;x.beginPath();x.moveTo(cx-22,by-48);x.lineTo(cx-22,by-6);x.moveTo(cx+22,by-48);x.lineTo(cx+22,by-6);x.stroke();
  for(const[px,py,col]of[[cx-12,by-28,'#ffd24a'],[cx,by-28,'#6ae6ff'],[cx+12,by-28,'#ff6aae']]){poly(x,[[px-4,py],[px,py-8],[px+4,py]],col,OUT,1)}
  x.fillStyle='#ffe9a0';x.font='bold 14px '+FONT;x.textAlign='center';x.fillText('$',cx,by-52);
  return Gfx.cache[key]=c;
}
// ---------- iconos de artefactos ----------
const TIERCOL=['#a0a0a0','#b87a44','#c0c8d8','#f0c040','#b070ff','#50e0ff','#ff9a3a'];
function artIcon(id,sz=44){
  const key='ai'+id+sz;if(Gfx.cache[key])return Gfx.cache[key];const a=ART[id],c=mkc(44,44),x=c.ctx,r=mulberry(hash2(id.length,id.charCodeAt(0),3)*1e6|0);
  const hue=a.hue!=null?a.hue:(hash2(id.charCodeAt(1)+id.charCodeAt(id.length-1)*7,id.length,5)*360)|0;const col=`hsl(${hue},45%,58%)`,tc=TIERCOL[a.v]||'#c0c8d8';
  x.fillStyle=rg(x,22,22,2,22,[tc+'55',tc+'00']);x.fillRect(0,0,44,44);
  const metal=lg(x,0,0,44,44,['#f4f6fa','#a8b2c4','#5a6478']),gold=lg(x,0,0,44,44,['#fff2a0','#e8b82a','#9a6a14']),leather=lg(x,0,0,44,44,['#a8743c','#6a4426','#3a2412']);
  const gem=(px,py,s)=>{poly(x,[[px-s,py],[px,py-s],[px+s,py],[px,py+s]],col,OUT,1);poly(x,[[px-s,py],[px,py-s],[px,py]],'rgba(255,255,255,.55)')};
  switch(a.slot){
    case'fusion':{ell(x,22,22,18,18,rg(x,22,22,2,18,['#fff6c0',col,shade(col,-.55)]),OUT,1.8);for(let i=0;i<4;i++){const an=i*1.5708+.785;poly(x,[[22+Math.cos(an)*6,22+Math.sin(an)*6],[22+Math.cos(an-.3)*17,22+Math.sin(an-.3)*17],[22+Math.cos(an)*21,22+Math.sin(an)*21],[22+Math.cos(an+.3)*17,22+Math.sin(an+.3)*17]],lg(x,0,0,44,44,['#fff2a0','#e8b82a','#9a6a14']),OUT,1.1)}gem(22,22,5);break}
    case'weapon':x.save();x.translate(22,22);x.rotate(-.78);poly(x,[[-3,-20],[3,-20],[3,10],[-3,10]],metal,OUT,1.3);poly(x,[[-3,-20],[0,-26],[3,-20]],metal,OUT,1.2);x.fillStyle=gold;x.fillRect(-9,10,18,4);x.strokeStyle=OUT;x.lineWidth=1;x.strokeRect(-9,10,18,4);x.fillStyle=leather;x.fillRect(-2,14,4,8);gem(0,12,3);x.restore();break;
    case'shield':poly(x,[[8,8],[36,8],[36,24],[22,40],[8,24]],lg(x,8,8,36,40,[col,shade(col,-.4)]),OUT,1.6);poly(x,[[12,12],[32,12],[32,23],[22,35],[12,23]],null,'rgba(255,230,150,.9)',1.6);gem(22,22,5);break;
    case'helm':x.beginPath();x.arc(22,24,15,Math.PI,0);x.lineTo(37,34);x.lineTo(7,34);x.closePath();x.fillStyle=metal;x.fill();x.strokeStyle=OUT;x.lineWidth=1.6;x.stroke();x.fillStyle=gold;x.fillRect(20,9,4,22);gem(22,14,3.4);break;
    case'armor':poly(x,[[10,8],[18,6],[26,6],[34,8],[40,18],[34,22],[34,38],[10,38],[10,22],[4,18]],lg(x,0,0,44,44,[col,shade(col,-.45)]),OUT,1.6);x.strokeStyle='rgba(255,230,150,.8)';x.lineWidth=1.4;x.beginPath();x.moveTo(22,8);x.lineTo(22,38);x.stroke();gem(22,20,3.6);break;
    case'neck':x.strokeStyle='#e8c25a';x.lineWidth=2;x.beginPath();x.moveTo(8,6);x.quadraticCurveTo(22,40,36,6);x.stroke();poly(x,[[22,26],[28,34],[22,42],[16,34]],lg(x,16,26,28,42,[col,shade(col,-.4)]),OUT,1.4);break;
    case'cloak':poly(x,[[12,6],[32,6],[40,40],[22,36],[4,40]],lg(x,0,0,44,44,[col,shade(col,-.5)]),OUT,1.6);x.strokeStyle='rgba(255,255,255,.3)';x.lineWidth=1;for(let i=0;i<4;i++){x.beginPath();x.moveTo(14+i*5,10);x.lineTo(10+i*8,36);x.stroke()}gem(22,10,3);break;
    case'boots':poly(x,[[12,6],[24,6],[24,26],[38,32],[38,40],[10,40],[10,22]],leather,OUT,1.6);x.fillStyle=gold;x.fillRect(12,10,12,3);poly(x,[[10,36],[38,36],[38,40],[10,40]],metal,OUT,1);break;
    case'gloves':poly(x,[[10,22],[14,6],[18,6],[20,16],[22,4],[26,4],[26,16],[30,6],[34,8],[32,22],[34,36],[14,36]],lg(x,0,0,44,44,[col,shade(col,-.4)]),OUT,1.5);x.fillStyle=gold;x.fillRect(12,30,22,5);break;
    case'ring':x.strokeStyle=OUT;x.lineWidth=7;x.beginPath();x.arc(22,26,11,0,6.28);x.stroke();x.strokeStyle=gold;x.lineWidth=4;x.stroke();gem(22,13,5);break;
    default:{const k=(hash2(id.length,id.charCodeAt(2),9)*5)|0;
      if(k===0){x.fillStyle=rg(x,20,20,2,16,['#fff',col,shade(col,-.5)]);x.beginPath();x.arc(22,22,13,0,6.28);x.fill();x.strokeStyle=OUT;x.lineWidth=1.5;x.stroke();x.strokeStyle='#e8c25a';x.lineWidth=2;x.beginPath();x.arc(22,22,16,.2,2.4);x.stroke()}
      else if(k===1){rrect(x,9,8,26,30,3,lg(x,0,0,44,44,[col,shade(col,-.5)]),OUT,1.6);x.fillStyle=gold;x.fillRect(9,8,5,30);gem(25,22,4)}
      else if(k===2){x.strokeStyle=OUT;x.lineWidth=9;x.beginPath();x.moveTo(10,36);x.quadraticCurveTo(10,10,32,10);x.stroke();x.strokeStyle=lg(x,0,0,44,44,['#fff6e0','#c8a860']);x.lineWidth=6;x.stroke();poly(x,[[32,6],[40,10],[32,14]],gold,OUT,1)}
      else if(k===3){poly(x,[[22,4],[34,18],[28,40],[16,40],[10,18]],lg(x,0,0,44,44,[shade(col,.4),col,shade(col,-.5)]),OUT,1.6);poly(x,[[22,4],[34,18],[22,20],[10,18]],'rgba(255,255,255,.4)')}
      else{x.fillStyle=leather;x.fillRect(20,6,4,32);x.strokeStyle=OUT;x.strokeRect(20,6,4,32);ell(x,22,8,8,8,rg(x,20,6,1,9,['#fff',col,shade(col,-.4)]),OUT,1.4)}}
  }
  if(a.v>=4){x.globalCompositeOperation='lighter';x.fillStyle=rg(x,22,22,4,22,['rgba(255,255,255,.18)','rgba(255,255,255,0)']);x.fillRect(0,0,44,44);x.globalCompositeOperation='source-over'}
  x.strokeStyle=tc;x.lineWidth=1.4;x.globalAlpha=.7;x.strokeRect(1,1,42,42);x.globalAlpha=1;
  return Gfx.cache[key]=c;
}
// iconos de huecos vacíos del equipo
function slotGlyph(slot){const key='sg'+slot;if(Gfx.cache[key])return Gfx.cache[key];const c=mkc(44,44),x=c.ctx;x.globalAlpha=.32;x.strokeStyle='#c8b890';x.fillStyle='#c8b890';x.lineWidth=2;
  const G2={weapon:()=>{x.save();x.translate(22,22);x.rotate(-.78);x.fillRect(-2.5,-18,5,28);x.fillRect(-8,10,16,3.4);x.restore()},shield:()=>{x.beginPath();x.moveTo(10,10);x.lineTo(34,10);x.lineTo(34,24);x.lineTo(22,36);x.lineTo(10,24);x.closePath();x.stroke()},
   helm:()=>{x.beginPath();x.arc(22,24,12,Math.PI,0);x.lineTo(34,32);x.lineTo(10,32);x.closePath();x.stroke()},armor:()=>{x.beginPath();x.moveTo(10,10);x.lineTo(34,10);x.lineTo(36,20);x.lineTo(32,22);x.lineTo(32,36);x.lineTo(12,36);x.lineTo(12,22);x.lineTo(8,20);x.closePath();x.stroke()},
   neck:()=>{x.beginPath();x.moveTo(10,8);x.quadraticCurveTo(22,38,34,8);x.stroke();x.beginPath();x.arc(22,32,4,0,6.28);x.fill()},cloak:()=>{x.beginPath();x.moveTo(14,8);x.lineTo(30,8);x.lineTo(38,36);x.lineTo(6,36);x.closePath();x.stroke()},
   boots:()=>{x.beginPath();x.moveTo(14,8);x.lineTo(24,8);x.lineTo(24,26);x.lineTo(36,30);x.lineTo(36,36);x.lineTo(12,36);x.closePath();x.stroke()},gloves:()=>{x.beginPath();x.moveTo(12,36);x.lineTo(10,16);x.lineTo(16,10);x.lineTo(20,18);x.lineTo(24,8);x.lineTo(30,10);x.lineTo(32,36);x.closePath();x.stroke()},
   ring:()=>{x.beginPath();x.arc(22,26,10,0,6.28);x.stroke();x.beginPath();x.arc(22,12,4,0,6.28);x.fill()},misc:()=>{x.beginPath();x.arc(22,22,12,0,6.28);x.stroke();x.beginPath();x.arc(22,22,4,0,6.28);x.fill()}};
  (G2[slot]||G2.misc)();return Gfx.cache[key]=c}
