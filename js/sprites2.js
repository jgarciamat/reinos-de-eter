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
function silhouette(img,k=.4){const key=img.__sil;if(key)return key;const c=mkc(img.lw,img.lh,1);const x=c.ctx;x.drawImage(img,0,0,img.lw,img.lh);x.globalCompositeOperation='source-in';x.fillStyle=`rgba(8,6,18,${k})`;x.fillRect(0,0,img.lw,img.lh);return img.__sil=c}
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

// =====================================================================
//  CASTILLOS V2 — 8 siluetas de facción dibujadas por código (sillería, techos, puertas, luces)
//  API: townSprite(fi) -> {c,flagX,flagY}   (lienzo 4*TILE x 3*TILE+130)
// =====================================================================
function mound(x,cx,by,rx,c1,c2,ry=.2){x.save();x.translate(cx,by-2);x.scale(1,ry);x.beginPath();x.arc(0,0,rx,0,6.2832);x.fillStyle=rg(x,0,-rx*.15,rx*.05,rx,[c1,c2,'rgba(0,0,0,0)']);x.fill();x.restore()}
function brick(x,x0,y0,w,h,col,o={}){
  x.fillStyle=lg(x,x0,0,x0+w,0,[shade(col,.32),shade(col,.08),col,shade(col,-.16),shade(col,-.42)]);x.fillRect(x0,y0,w,h);
  x.save();x.beginPath();x.rect(x0,y0,w,h);x.clip();
  const bh=o.bh||6,bw=o.bw||10;let r=0;
  for(let y=y0;y<y0+h;y+=bh,r++){for(let xx=x0-(r%2?bw/2:0);xx<x0+w;xx+=bw){const k=hash2(xx*3|0,y*3|0,r);if(k<.3){x.fillStyle='rgba(255,245,220,.10)';x.fillRect(xx+.5,y+.5,bw-1,bh-1)}else if(k>.72){x.fillStyle='rgba(0,0,0,.10)';x.fillRect(xx+.5,y+.5,bw-1,bh-1)}}}
  x.strokeStyle=o.mortar||'rgba(0,0,0,.24)';x.lineWidth=.6;r=0;
  for(let y=y0;y<y0+h;y+=bh,r++){x.beginPath();x.moveTo(x0,y);x.lineTo(x0+w,y);for(let xx=x0-(r%2?bw/2:0);xx<x0+w;xx+=bw){x.moveTo(xx,y);x.lineTo(xx,y+bh)}x.stroke()}
  x.fillStyle=lg(x,0,y0,0,y0+h,['rgba(0,0,0,.3)','rgba(0,0,0,0)','rgba(0,0,0,0)','rgba(0,0,0,.26)']);x.fillRect(x0,y0,w,h);
  x.restore();x.strokeStyle=OUT;x.lineWidth=1.3;x.strokeRect(x0,y0,w,h)}
function merl(x,x0,y,w,col,n){n=n||Math.max(2,Math.round(w/11));const mw=w/(2*n-1);
  for(let i=0;i<n;i++){const mx=x0+i*mw*2;x.fillStyle=lg(x,mx,0,mx+mw,0,[shade(col,.25),col,shade(col,-.3)]);x.fillRect(mx,y-7,mw,8);x.strokeStyle=OUT;x.lineWidth=1.1;x.strokeRect(mx,y-7,mw,8)}
  x.fillStyle=shade(col,-.12);x.fillRect(x0,y,w,3);x.strokeStyle=OUT;x.lineWidth=1.1;x.strokeRect(x0,y,w,3)}
function awin(x,cx,y,w,h,glow,frame){x.beginPath();x.moveTo(cx-w/2,y+h);x.lineTo(cx-w/2,y+w/2);x.arc(cx,y+w/2,w/2,Math.PI,0);x.lineTo(cx+w/2,y+h);x.closePath();
  x.fillStyle=lg(x,0,y,0,y+h,[glow,shade(glow,-.45)]);x.fill();x.strokeStyle=frame||OUT;x.lineWidth=1.3;x.stroke();x.strokeStyle='rgba(20,10,10,.6)';x.lineWidth=.8;x.beginPath();x.moveTo(cx,y+1);x.lineTo(cx,y+h);x.stroke()}
function slit(x,cx,y,h,glow){x.fillStyle=glow||'#0c0810';x.fillRect(cx-1.2,y,2.4,h);x.strokeStyle=OUT;x.lineWidth=.8;x.strokeRect(cx-1.2,y,2.4,h)}
function cone(x,cx,y,w,h,col,o={}){const hw=w/2+(o.ov==null?3:o.ov),cv=o.cv==null?.32:o.cv;
  x.beginPath();x.moveTo(cx-hw,y);x.quadraticCurveTo(cx-hw*.35,y-h*cv*1.2,cx,y-h);x.quadraticCurveTo(cx+hw*.35,y-h*cv*1.2,cx+hw,y);x.quadraticCurveTo(cx,y+3,cx-hw,y);x.closePath();
  x.fillStyle=lg(x,cx-hw,0,cx+hw,0,[shade(col,.4),shade(col,.1),col,shade(col,-.45)]);x.fill();
  x.save();x.clip();x.strokeStyle='rgba(0,0,0,.22)';x.lineWidth=.7;
  for(let i=-4;i<=4;i++){x.beginPath();x.moveTo(cx,y-h);x.lineTo(cx+i*hw/4,y);x.stroke()}
  const rows=Math.max(3,h/7|0);for(let k=1;k<rows;k++){const yy=y-h*k/rows,ww=hw*(1-k/rows);x.beginPath();x.ellipse(cx,yy,ww,2.2,0,0,Math.PI);x.stroke()}
  x.fillStyle='rgba(255,255,255,.2)';x.beginPath();x.moveTo(cx-hw*.7,y);x.lineTo(cx,y-h);x.lineTo(cx-hw*.2,y);x.fill();x.restore();
  x.strokeStyle=OUT;x.lineWidth=1.3;x.beginPath();x.moveTo(cx-hw,y);x.quadraticCurveTo(cx-hw*.35,y-h*cv*1.2,cx,y-h);x.quadraticCurveTo(cx+hw*.35,y-h*cv*1.2,cx+hw,y);x.stroke();
  if(o.fin){x.strokeStyle=OUT;x.lineWidth=2.4;x.beginPath();x.moveTo(cx,y-h);x.lineTo(cx,y-h-o.fin);x.stroke();x.strokeStyle=o.fc||'#e8c25a';x.lineWidth=1.2;x.stroke();ell(x,cx,y-h-o.fin,2.4,2.4,o.fc||'#e8c25a',OUT,.9)}}
function dome(x,cx,y,w,h,col,o={}){const hw=w/2+(o.ov==null?3:o.ov);
  x.beginPath();x.moveTo(cx-hw,y);x.bezierCurveTo(cx-hw*1.15,y-h*.75,cx-hw*.25,y-h*.7,cx,y-h);x.bezierCurveTo(cx+hw*.25,y-h*.7,cx+hw*1.15,y-h*.75,cx+hw,y);x.closePath();
  x.fillStyle=rg(x,cx-hw*.4,y-h*.55,1,hw*1.6,[shade(col,.55),col,shade(col,-.5)]);x.fill();
  x.save();x.clip();x.strokeStyle='rgba(0,0,0,.2)';x.lineWidth=.8;for(let i=-3;i<=3;i++){x.beginPath();x.moveTo(cx,y-h);x.quadraticCurveTo(cx+i*hw*.7,y-h*.5,cx+i*hw*.33,y);x.stroke()}x.restore();
  x.strokeStyle=OUT;x.lineWidth=1.4;x.stroke();
  x.strokeStyle=OUT;x.lineWidth=2.4;x.beginPath();x.moveTo(cx,y-h);x.lineTo(cx,y-h-(o.fin||8));x.stroke();x.strokeStyle='#f0d070';x.lineWidth=1.2;x.stroke();ell(x,cx,y-h-(o.fin||8),2.2,2.2,'#f0d070',OUT,.9)}
function gate(x,cx,by,w,h,o={}){const top=by-h,path=(ww)=>{x.beginPath();x.moveTo(cx-ww/2,by);x.lineTo(cx-ww/2,top+w/2);if(o.pointed){x.lineTo(cx,top-w*.35)}else x.arc(cx,top+w/2,ww/2,Math.PI,0);x.lineTo(cx+ww/2,by);x.closePath()};
  path(w+8);x.fillStyle=lg(x,cx-w/2,0,cx+w/2,0,[shade(o.trim||'#bdb8aa',.2),o.trim||'#bdb8aa',shade(o.trim||'#bdb8aa',-.35)]);x.fill();x.strokeStyle=OUT;x.lineWidth=1.3;x.stroke();
  path(w);x.fillStyle=o.in||'#120a10';x.fill();
  if(o.glow){x.save();x.clip();x.fillStyle=rg(x,cx,by-4,1,w*.9,[o.glow,'rgba(0,0,0,0)']);x.fillRect(cx-w,top-10,w*2,h+12);x.restore()}
  else{x.save();x.clip();x.fillStyle=lg(x,cx-w/2,0,cx+w/2,0,[shade(o.wood||'#7a4e2a',.15),o.wood||'#7a4e2a',shade(o.wood||'#7a4e2a',-.4)]);x.fillRect(cx-w/2,top-6,w,h+6);
    x.strokeStyle='rgba(20,10,4,.6)';x.lineWidth=.8;for(let i=1;i<6;i++){x.beginPath();x.moveTo(cx-w/2+i*w/6,top);x.lineTo(cx-w/2+i*w/6,by);x.stroke()}
    x.strokeStyle='#2a2024';x.lineWidth=2;for(const f of[.35,.7]){x.beginPath();x.moveTo(cx-w/2,top+h*f);x.lineTo(cx+w/2,top+h*f);x.stroke()}
    x.fillStyle='#c8c8d0';for(let i=0;i<5;i++){x.fillRect(cx-w/2+3+i*(w-6)/4,top+h*.35-1,1.6,1.6);x.fillRect(cx-w/2+3+i*(w-6)/4,top+h*.7-1,1.6,1.6)}
    if(o.port){x.strokeStyle='#4a4a54';x.lineWidth=1.6;for(let i=1;i<5;i++){x.beginPath();x.moveTo(cx-w/2+i*w/5,top);x.lineTo(cx-w/2+i*w/5,top+h*.5);x.stroke()}for(let k=0;k<4;k++){x.beginPath();x.moveTo(cx-w/2,top+k*h*.12);x.lineTo(cx+w/2,top+k*h*.12);x.stroke()}}
    x.restore()}
  path(w);x.strokeStyle=OUT;x.lineWidth=1.6;x.stroke()}
function pole(x,px,py,len,col){x.strokeStyle=OUT;x.lineWidth=3;x.beginPath();x.moveTo(px,py);x.lineTo(px,py-len);x.stroke();x.strokeStyle=col||'#6a4a2a';x.lineWidth=1.6;x.stroke();ell(x,px,py-len,2,2,'#e8c25a',OUT,.8)}
function pennant(x,px,py,col,len=14){poly(x,[[px,py],[px+len,py+2.5],[px,py+5]],col,OUT,.8)}
function tw(x,cx,gy,w,h,col,o={}){ // torre: cuerpo + cornisa + ventanas
  const x0=cx-w/2;if(o.flare)poly(x,[[x0-3,gy],[x0,gy-10],[x0+w,gy-10],[x0+w+3,gy]],shade(col,-.22),OUT,1.1);
  brick(x,x0,gy-h,w,h,col,o);x.fillStyle=shade(col,-.1);x.fillRect(x0-2,gy-h,w+4,3.5);x.strokeStyle=OUT;x.lineWidth=1;x.strokeRect(x0-2,gy-h,w+4,3.5);
  if(o.win!==0)for(let y=gy-h+16;y<gy-18;y+=o.wy||26){if(w>=22&&!o.slits)awin(x,cx,y,6,11,o.glow||'#ffe9a0');else slit(x,cx,y,10,o.glow)}
  return gy-h}
const CAST=[
// 0 · Alba: ciudadela de piedra clara, techos azules, torre del homenaje y pendones
function(x,cx,by){const gy=by-14,W='#dcd8cc',B='#2f62c8';mound(x,cx,by,100,'#7ab050','#4a8a38');
  tw(x,cx,gy-34,50,116,W,{flare:1});const kt=gy-34-116;
  for(const s of[-1,1]){tw(x,cx+s*28,kt+8,14,28,W,{win:0});cone(x,cx+s*28,kt-20,14,28,B,{fin:6})}
  awin(x,cx,kt+36,12,24,'#8ad0ff','#e8c25a');poly(x,[[cx-16,gy-60],[cx+16,gy-60],[cx+16,gy-46],[cx,gy-38],[cx-16,gy-46]],B,'#e8c25a',1.4);ell(x,cx,gy-52,4,4,'#e8c25a',OUT,.8);
  cone(x,cx,kt-4,50,70,B,{cv:.4});
  for(const s of[-1,1]){tw(x,cx+s*54,gy-26,32,92,W,{flare:1});cone(x,cx+s*54,gy-26-92,32,48,B,{fin:8});pennant(x,cx+s*54,gy-26-92-56,'#e8c25a',10)}
  brick(x,cx-92,gy-52,184,42,shade(W,-.06));merl(x,cx-92,gy-52,184,W);
  for(let i=0;i<8;i++)if(Math.abs(i-3.5)>1.2)slit(x,cx-80+i*23,gy-42,12);
  for(const s of[-1,1]){tw(x,cx+s*86,gy-2,26,66,W,{flare:1,slits:1});cone(x,cx+s*86,gy-2-66,26,36,B,{fin:6})}
  brick(x,cx-28,gy-74,56,68,shade(W,.04));merl(x,cx-28,gy-74,56,W,5);
  for(const s of[-1,1]){x.fillStyle=B;poly(x,[[cx+s*20-6,gy-70],[cx+s*20+6,gy-70],[cx+s*20+6,gy-44],[cx+s*20,gy-38],[cx+s*20-6,gy-44]],B,'#e8c25a',1);}
  gate(x,cx,gy-4,26,36,{port:1,trim:'#e8dcb0'});
  pole(x,cx,kt-4-70,26);return[cx,kt-4-70-26]},
// 1 · Bosque: árboles-torre con copas, pasarelas y cabañas
function(x,cx,by){const gy=by-14;mound(x,cx,by,100,'#6aa848','#3c7a30');
  const canopy=(px,py,r,seed)=>{const rr=mulberry(seed);const cols=['#2a6a2e','#3f8a38','#5aa845','#86c85a'];
    for(let k=0;k<4;k++)for(let i=0;i<9;i++){const a=rr()*6.28,d=rr()*r*.7*(1-k*.12),rad=r*(.34+rr()*.2);ell(x,px+Math.cos(a)*d,py+Math.sin(a)*d*.7-k*r*.1,rad,rad*.85,cols[k],k===0?OUT:null,1.2)}
    for(let i=0;i<10;i++){const a=rr()*6.28,d=rr()*r*.8;ell(x,px+Math.cos(a)*d,py-r*.2+Math.sin(a)*d*.55,1.5,1.5,['#ffd0e8','#fff6b0','#ffffff'][i%3])}};
  const trunk=(px,w,h,tw2)=>{x.beginPath();x.moveTo(px-w/2-8,gy);x.quadraticCurveTo(px-w/2,gy-12,px-w/2+2,gy-h*.4);x.lineTo(px-tw2/2,gy-h);x.lineTo(px+tw2/2,gy-h);x.lineTo(px+w/2-2,gy-h*.4);x.quadraticCurveTo(px+w/2,gy-12,px+w/2+8,gy);x.closePath();
    x.fillStyle=lg(x,px-w/2,0,px+w/2,0,['#9a7048','#7a5232','#5a3a22','#3a261a']);x.fill();x.save();x.clip();x.strokeStyle='rgba(30,16,8,.45)';x.lineWidth=.9;for(let i=0;i<9;i++){const gx=px-w/2+(i+.5)*w/9;x.beginPath();x.moveTo(gx,gy);x.bezierCurveTo(gx+3,gy-h*.3,gx-3,gy-h*.6,gx+1,gy-h);x.stroke()}x.restore();x.strokeStyle=OUT;x.lineWidth=1.4;x.stroke()};
  canopy(cx-60,gy-82,36,11);trunk(cx-60,24,84,16);canopy(cx+60,gy-76,34,13);trunk(cx+60,22,76,14);
  // pasarelas
  x.strokeStyle='#4a3220';x.lineWidth=2;for(const s of[-1,1]){x.beginPath();x.moveTo(cx+s*60,gy-52);x.quadraticCurveTo(cx+s*34,gy-40,cx+s*20,gy-58);x.stroke();x.strokeStyle='#a88458';x.lineWidth=.9;x.stroke();x.strokeStyle='#4a3220';x.lineWidth=2}
  trunk(cx,46,150,28);
  // salón en el tronco
  poly(x,[[cx-26,gy-84],[cx+26,gy-84],[cx+22,gy-70],[cx-22,gy-70]],'#6a4a2c',OUT,1.2);
  for(const s of[-1,0,1]){rrect(x,cx+s*14-4,gy-110,8,14,4,'#fff0a0',OUT,1);x.fillStyle='rgba(255,240,150,.25)';ell(x,cx+s*14,gy-103,10,10,'rgba(255,240,150,.22)')}
  poly(x,[[cx-24,gy-118],[cx,gy-142],[cx+24,gy-118]],'#5a8a2a',OUT,1.3);
  canopy(cx,gy-168,50,29);canopy(cx-26,gy-150,26,31);canopy(cx+28,gy-152,26,37);
  // puerta de raíz y arco de piedra marfil
  gate(x,cx,gy-2,24,34,{trim:'#cfc8a8',wood:'#6a4a2a'});
  for(const s of[-1,1])for(let k=0;k<4;k++){x.strokeStyle='#4a8a30';x.lineWidth=1.6;x.beginPath();x.moveTo(cx+s*(18+k*3),gy-30+k*8);x.quadraticCurveTo(cx+s*(24+k*3),gy-20+k*6,cx+s*(16+k*3),gy-8);x.stroke()}
  for(const px of[-84,-34,34,86]){const hx=cx+px;x.fillStyle='#8a7a50';x.beginPath();x.moveTo(hx-9,gy-2);x.lineTo(hx-9,gy-16);x.quadraticCurveTo(hx,gy-30,hx+9,gy-16);x.lineTo(hx+9,gy-2);x.closePath();x.fill();x.strokeStyle=OUT;x.lineWidth=1.2;x.stroke();rrect(x,hx-3,gy-14,6,8,3,'#ffe27a',OUT,.8)}
  for(let i=0;i<14;i++){const a=hash2(i,5)*6.28;ell(x,cx+(hash2(i,9)-.5)*190,gy-hash2(i,3)*30+8,1.6,1.6,['#ff9ac0','#ffe46a','#fff'][i%3])}
  pole(x,cx,gy-168-48,18,'#5a3a22');return[cx,gy-168-48-18]},
// 2 · Cripta: catedral gótica de agujas retorcidas, calavera y luz verde
function(x,cx,by){const gy=by-14,W='#4e4660';mound(x,cx,by,100,'#5a4a5e','#2c2230');
  const glowC='#9affc0';x.fillStyle=rg(x,cx,gy-80,5,110,['rgba(120,255,180,.25)','rgba(120,255,180,0)']);x.fillRect(0,gy-190,192,200);
  const spire=(px,y,w,h,col,lean=0)=>{x.beginPath();x.moveTo(px-w/2-3,y);x.quadraticCurveTo(px-w*.12+lean*.3,y-h*.55,px+lean,y-h);x.quadraticCurveTo(px+w*.12+lean*.3,y-h*.55,px+w/2+3,y);x.closePath();x.fillStyle=lg(x,px-w/2,0,px+w/2,0,[shade(col,.35),col,shade(col,-.5)]);x.fill();x.strokeStyle=OUT;x.lineWidth=1.3;x.stroke();
    for(let k=1;k<4;k++){const yy=y-h*k/5;poly(x,[[px-w*.3*(1-k/5)+lean*k/5-2,yy],[px+lean*k/5,yy-6],[px+w*.3*(1-k/5)+lean*k/5+2,yy]],shade(col,.3),OUT,.8)}};
  tw(x,cx-56,gy-30,26,100,W,{flare:1,glow:glowC});spire(cx-56,gy-130,26,70,'#2e2640',-5);
  tw(x,cx+56,gy-30,26,100,W,{flare:1,glow:glowC});spire(cx+56,gy-130,26,70,'#2e2640',5);
  tw(x,cx,gy-30,56,130,shade(W,.06),{flare:1,glow:glowC});spire(cx,gy-160,56,100,'#2a2238');
  for(const s of[-1,1]){tw(x,cx+s*30,gy-110,12,40,W,{win:0});spire(cx+s*30,gy-150,12,40,'#2e2640',s*3)}
  // contrafuertes
  x.strokeStyle=OUT;x.lineWidth=5;for(const s of[-1,1]){x.beginPath();x.moveTo(cx+s*28,gy-90);x.quadraticCurveTo(cx+s*44,gy-96,cx+s*46,gy-60);x.stroke();x.strokeStyle=shade(W,.1);x.lineWidth=2.6;x.stroke();x.strokeStyle=OUT;x.lineWidth=5}
  // rosetón
  ell(x,cx,gy-98,10,10,'#1a1022',OUT,1.4);ell(x,cx,gy-98,7,7,glowC);for(let i=0;i<8;i++){x.strokeStyle='#1a1022';x.lineWidth=1;x.beginPath();x.moveTo(cx,gy-98);x.lineTo(cx+Math.cos(i*.785)*7,gy-98+Math.sin(i*.785)*7);x.stroke()}
  brick(x,cx-92,gy-46,184,36,shade(W,-.1),{bh:5,bw:8});for(let i=0;i<10;i++){const px=cx-88+i*19.5;poly(x,[[px,gy-46],[px+4,gy-58],[px+8,gy-46]],shade(W,-.1),OUT,1)}
  // calavera sobre la puerta
  ell(x,cx,gy-56,9,8,'#e8e4d0',OUT,1.2);rrect(x,cx-5,gy-50,10,6,2,'#e8e4d0',OUT,1);ell(x,cx-3.5,gy-56,2.3,2.8,'#10180f');ell(x,cx+3.5,gy-56,2.3,2.8,'#10180f');x.fillStyle=glowC;x.fillRect(cx-3.8,gy-56.5,1.4,1.4);x.fillRect(cx+2.4,gy-56.5,1.4,1.4);
  gate(x,cx,gy-4,24,38,{pointed:1,glow:'rgba(120,255,180,.9)',in:'#06140e',trim:'#8a7ea0'});
  // lápidas y árboles muertos
  for(const[px,py]of[[-84,2],[-70,6],[74,4],[88,0]]){rrect(x,cx+px-5,gy+py-16,10,16,4,'#8a8498',OUT,1);x.strokeStyle='#4a4458';x.lineWidth=.9;x.beginPath();x.moveTo(cx+px,gy+py-12);x.lineTo(cx+px,gy+py-6);x.moveTo(cx+px-2.5,gy+py-9.5);x.lineTo(cx+px+2.5,gy+py-9.5);x.stroke()}
  for(const s of[-1,1]){x.strokeStyle=OUT;x.lineWidth=3.4;x.lineCap='round';x.beginPath();x.moveTo(cx+s*90,gy+4);x.quadraticCurveTo(cx+s*86,gy-24,cx+s*92,gy-44);x.moveTo(cx+s*88,gy-18);x.lineTo(cx+s*78,gy-34);x.moveTo(cx+s*90,gy-30);x.lineTo(cx+s*96,gy-42);x.stroke();x.strokeStyle='#5a4a52';x.lineWidth=1.8;x.stroke()}
  for(let i=0;i<5;i++){const bx=cx+(hash2(i,2)-.5)*150,byy=gy-150-hash2(i,4)*30;x.fillStyle='#1a1022';x.beginPath();x.moveTo(bx,byy);x.quadraticCurveTo(bx-5,byy-4,bx-8,byy);x.quadraticCurveTo(bx-5,byy-1,bx-4,byy+2);x.quadraticCurveTo(bx,byy,bx+4,byy+2);x.quadraticCurveTo(bx+5,byy-1,bx+8,byy);x.quadraticCurveTo(bx+5,byy-4,bx,byy);x.fill()}
  pole(x,cx,gy-160-100-12,20,'#4a4458');return[cx,gy-160-100-12-20]},
// 3 · Brasa: fortaleza de roca roja con cuernos, puerta-fauces y ríos de lava
function(x,cx,by){const gy=by-14,W='#563230';mound(x,cx,by,100,'#3a2220','#1a0e0e');
  x.fillStyle=rg(x,cx,gy-30,5,120,['rgba(255,100,30,.35)','rgba(255,60,20,0)']);x.fillRect(0,gy-160,192,190);
  const horn=(px,y,w,h,col,dir)=>{x.beginPath();x.moveTo(px-w/2,y);x.quadraticCurveTo(px-w/2+dir*h*.1,y-h*.6,px+dir*h*.45,y-h);x.quadraticCurveTo(px+w/2+dir*h*.05,y-h*.55,px+w/2,y);x.closePath();x.fillStyle=lg(x,px-w/2,0,px+w/2,0,[shade(col,.3),col,shade(col,-.5)]);x.fill();x.strokeStyle=OUT;x.lineWidth=1.3;x.stroke()};
  const spk=(px,y,w,h,col)=>{poly(x,[[px-w/2-3,y],[px-w*.15,y-h*.55],[px,y-h],[px+w*.2,y-h*.5],[px+w/2+3,y]],lg(x,px-w/2,0,px+w/2,0,[shade(col,.3),col,shade(col,-.5)]),OUT,1.3)};
  for(const s of[-1,1]){tw(x,cx+s*60,gy-24,30,96,W,{flare:1,glow:'#ff9030'});spk(cx+s*60,gy-120,30,52,'#3a1a18');horn(cx+s*74,gy-100,10,34,'#2a1210',s);}
  tw(x,cx,gy-26,60,126,shade(W,.05),{flare:1,glow:'#ff9030'});spk(cx,gy-152,60,72,'#2e1412');horn(cx-24,gy-148,14,52,'#1e0c0c',-1);horn(cx+24,gy-148,14,52,'#1e0c0c',1);
  // ojo flamígero
  ell(x,cx,gy-104,12,7,'#1a0a08',OUT,1.3);ell(x,cx,gy-104,9,5,'#ff9a30');ell(x,cx,gy-104,2,5,'#200a04');
  brick(x,cx-92,gy-46,184,36,shade(W,-.12),{mortar:'rgba(0,0,0,.4)'});for(let i=0;i<9;i++){const px=cx-90+i*22;poly(x,[[px,gy-46],[px+5,gy-58],[px+10,gy-46]],shade(W,-.12),OUT,1)}
  // fauces de la puerta
  poly(x,[[cx-24,gy-4],[cx-24,gy-46],[cx-14,gy-58],[cx+14,gy-58],[cx+24,gy-46],[cx+24,gy-4]],'#2a1210',OUT,1.5);
  gate(x,cx,gy-4,24,38,{glow:'rgba(255,160,40,.95)',in:'#701c08',trim:'#2a1210'});
  for(let i=0;i<5;i++){const px=cx-12+i*6;poly(x,[[px-3,gy-42],[px,gy-34],[px+3,gy-42]],'#e8e0c0',OUT,.8)}
  for(const s of[-1,1])horn(cx+s*22,gy-56,8,24,'#2a1210',s*.6);
  // lava delante
  for(const s of[-1,1]){x.beginPath();x.moveTo(cx+s*20,gy-2);x.bezierCurveTo(cx+s*50,gy+4,cx+s*60,gy+2,cx+s*96,gy+10);x.lineTo(cx+s*96,gy+16);x.lineTo(cx+s*20,gy+8);x.closePath();x.fillStyle=lg(x,0,gy,0,gy+12,['#ffd060','#ff6a10','#a02808']);x.fill();x.strokeStyle='#300';x.lineWidth=1;x.stroke()}
  // braseros
  for(const s of[-1,1]){const bx=cx+s*38,byy=gy-46;poly(x,[[bx-5,byy],[bx+5,byy],[bx+3,byy+6],[bx-3,byy+6]],'#2a2024',OUT,1);x.fillStyle=lg(x,0,byy-12,0,byy,['rgba(255,220,100,0)','#ffd060','#ff6a10']);x.beginPath();x.moveTo(bx-4,byy);x.quadraticCurveTo(bx-6,byy-8,bx,byy-14);x.quadraticCurveTo(bx+6,byy-8,bx+4,byy);x.fill()}
  pole(x,cx,gy-152-72-14,22,'#2a1210');return[cx,gy-152-72-14-22]},
// 4 · Baluarte: fortaleza enana excavada en la montaña, torres cuadradas, forja y puerta blindada
function(x,cx,by){const gy=by-14,W='#9a9488';mound(x,cx,by,100,'#8a7a64','#5a4e3e');
  // montaña de fondo
  poly(x,[[cx-96,gy-30],[cx-70,gy-96],[cx-44,gy-120],[cx-20,gy-170],[cx+8,gy-130],[cx+34,gy-176],[cx+62,gy-110],[cx+96,gy-30]],lg(x,0,gy-176,0,gy-30,['#8a8478','#6a6458','#4a443a']),OUT,1.6);
  poly(x,[[cx-20,gy-170],[cx-8,gy-146],[cx-14,gy-142],[cx-24,gy-156]],'#f2f6fa',null);poly(x,[[cx+34,gy-176],[cx+44,gy-150],[cx+30,gy-148],[cx+24,gy-160]],'#f2f6fa',null);
  x.strokeStyle='rgba(0,0,0,.25)';x.lineWidth=1;for(let i=0;i<10;i++){x.beginPath();x.moveTo(cx-80+hash2(i,1)*160,gy-60-hash2(i,2)*80);x.lineTo(cx-80+hash2(i,3)*160,gy-40);x.stroke()}
  const sqt=(px,y,w,h,roofH)=>{brick(x,px-w/2,y-h,w,h,W,{bh:8,bw:14});x.fillStyle=shade(W,-.1);x.fillRect(px-w/2-3,y-h,w+6,5);x.strokeStyle=OUT;x.strokeRect(px-w/2-3,y-h,w+6,5);merl(x,px-w/2-3,y-h-1,w+6,W,3);
    for(let yy=y-h+20;yy<y-16;yy+=26)slit(x,px,yy,12,'#ffb040');
    if(roofH)cone(x,px,y-h-8,w-2,roofH,'#a0502a',{ov:4,cv:.2})};
  for(const s of[-1,1]){sqt(cx+s*64,gy-26,36,92,34);sqt(cx+s*92,gy-2,26,56,0)}
  // gran sala
  brick(x,cx-50,gy-96,100,90,shade(W,.06),{bh:8,bw:14});merl(x,cx-50,gy-96,100,W,7);
  // chimeneas con humo
  for(const s of[-1,1]){const px=cx+s*30;rrect(x,px-5,gy-128,10,34,1,'#6a6258',OUT,1.2);x.fillStyle='rgba(120,120,120,.35)';for(let k=0;k<4;k++)ell(x,px+k*s*3,gy-134-k*9,5+k*1.6,4+k,'rgba(130,130,130,.3)')}
  // escudos y yunque
  for(const px of[-34,34]){poly(x,[[cx+px-8,gy-76],[cx+px+8,gy-76],[cx+px+8,gy-62],[cx+px,gy-54],[cx+px-8,gy-62]],'#e8a040',OUT,1.2);x.fillStyle='#3a3030';x.fillRect(cx+px-4,gy-67,8,3);x.fillRect(cx+px-2,gy-64,4,5)}
  // puerta blindada con dintel
  rrect(x,cx-24,gy-60,48,10,2,shade(W,.15),OUT,1.3);gate(x,cx,gy-4,34,48,{wood:'#6a4a30',trim:'#bdb4a0'});
  for(const s of[-1,1]){const bx=cx+s*28,byy=gy-30;poly(x,[[bx-4,byy],[bx+4,byy],[bx+3,byy+5],[bx-3,byy+5]],'#2a2024',OUT,1);x.fillStyle=lg(x,0,byy-10,0,byy,['rgba(255,220,100,0)','#ffd060','#ff7a10']);x.beginPath();x.moveTo(bx-3,byy);x.quadraticCurveTo(bx-5,byy-7,bx,byy-12);x.quadraticCurveTo(bx+5,byy-7,bx+3,byy);x.fill()}
  pole(x,cx+34,gy-176-4,14,'#4a3a2a');return[cx+34,gy-176-18]},
// 5 · Marea: palacio de arenisca con cúpulas azules, faro y barco amarrado
function(x,cx,by){const gy=by-14,W='#f0e8d4';mound(x,cx,by,100,'#e6d09a','#b8975a');
  ell(x,cx,by-1,104,10,lg(x,0,by-10,0,by+8,['#58c0e0','#2a78b8']),null);x.strokeStyle='rgba(255,255,255,.55)';x.lineWidth=1;for(let i=0;i<6;i++){x.beginPath();x.ellipse(cx-70+i*28,by-1+(i%2)*2,8,1.5,0,0,Math.PI);x.stroke()}
  // faro izquierda
  poly(x,[[cx-96,gy],[cx-90,gy-100],[cx-72,gy-100],[cx-66,gy]],lg(x,cx-96,0,cx-66,0,['#fff','#e8e0d0','#a8a090']),OUT,1.4);for(const yy of[-30,-60,-88]){x.fillStyle='#2a78b8';x.fillRect(cx-94+(yy/-100)*-1.5,gy+yy-6,28-(-yy)*.0,8)}
  rrect(x,cx-90,gy-122,18,22,3,'#1a1018',OUT,1.3);x.fillStyle=rg(x,cx-81,gy-111,1,22,['rgba(255,240,150,.95)','rgba(255,240,150,0)']);x.fillRect(cx-110,gy-140,60,60);ell(x,cx-81,gy-111,4,4,'#fff6b0');dome(x,cx-81,gy-120,18,16,'#2a78b8',{fin:6});
  const bt=(px,y,w,h,dh,dw)=>{brick(x,px-w/2,y-h,w,h,W,{bh:7,bw:12,mortar:'rgba(120,90,50,.2)'});x.fillStyle='#2fa0d0';x.fillRect(px-w/2-2,y-h,w+4,4);x.strokeStyle=OUT;x.strokeRect(px-w/2-2,y-h,w+4,4);
    for(let yy=y-h+14;yy<y-18;yy+=24)awin(x,px,yy,6,11,'#a0f0ff','#2a78b8');dome(x,px,y-h,dw||w,dh,'#2f9ad0',{fin:9})};
  bt(cx+56,gy-24,34,80,34);bt(cx,gy-30,56,124,58,60);
  for(const s of[-1,1]){const px=cx+s*30,yy=gy-120;dome(x,px,yy,12,16,'#2f9ad0',{fin:5})}
  // arcada frontal
  brick(x,cx-64,gy-46,128,38,shade(W,-.04),{bh:7,bw:12,mortar:'rgba(120,90,50,.2)'});for(let i=0;i<6;i++){const px=cx-52+i*21;if(Math.abs(px-cx)<14)continue;x.beginPath();x.moveTo(px-7,gy-8);x.lineTo(px-7,gy-30);x.arc(px,gy-30,7,Math.PI,0);x.lineTo(px+7,gy-8);x.closePath();x.fillStyle='#2a78b8';x.fill();x.strokeStyle=OUT;x.lineWidth=1.1;x.stroke()}
  gate(x,cx,gy-4,24,38,{wood:'#2a6898',trim:'#fff6e0'});
  // barco amarrado
  const bx=cx+76,byy=by-6;x.fillStyle=OUT;x.fillRect(bx-1,byy-52,2.6,52);poly(x,[[bx+2,byy-50],[bx+26,byy-18],[bx+2,byy-18]],'#f4f0e0',OUT,1);poly(x,[[bx-2,byy-44],[bx-18,byy-20],[bx-2,byy-20]],'#e8e0cc',OUT,1);
  x.beginPath();x.moveTo(bx-26,byy-14);x.lineTo(bx+30,byy-14);x.quadraticCurveTo(bx+22,byy+2,bx+4,byy+2);x.lineTo(bx-16,byy+2);x.quadraticCurveTo(bx-24,byy-4,bx-26,byy-14);x.fillStyle=lg(x,0,byy-14,0,byy+2,['#9a6a3a','#5a3a22']);x.fill();x.strokeStyle=OUT;x.lineWidth=1.3;x.stroke();
  pole(x,cx,gy-30-124-58-4,16,'#d8c898');return[cx,gy-30-124-58-4-16]},
// 6 · Ciénaga: empalizada de troncos, cabañas sobre pilotes, tótems y caldero verde
function(x,cx,by){const gy=by-14,W='#7a6a42';mound(x,cx,by,100,'#566a38','#2c3a22');
  ell(x,cx-70,by-2,26,6,'#2a3c2c',null);ell(x,cx+72,by-3,24,5,'#2a3c2c',null);
  const thatch=(px,y,w,h,col)=>{x.beginPath();x.moveTo(px-w/2-6,y);x.quadraticCurveTo(px-w*.15,y-h*.6,px+3,y-h);x.quadraticCurveTo(px+w*.2,y-h*.55,px+w/2+6,y);x.closePath();x.fillStyle=lg(x,px-w/2,0,px+w/2,0,[shade(col,.3),col,shade(col,-.45)]);x.fill();x.save();x.clip();x.strokeStyle='rgba(30,26,8,.5)';x.lineWidth=.9;for(let i=0;i<18;i++){const yy=y-h*(i+1)/19;x.beginPath();x.moveTo(px-w,yy);x.lineTo(px+w,yy);x.stroke()}for(let i=-5;i<=5;i++){x.beginPath();x.moveTo(px+3,y-h);x.lineTo(px+i*w/9,y);x.stroke()}x.restore();x.strokeStyle=OUT;x.lineWidth=1.3;x.stroke()};
  const logs=(px,y,w,h,col,lean=0)=>{const n=Math.round(w/7);for(let i=0;i<n;i++){const lx=px-w/2+i*w/n;x.fillStyle=lg(x,lx,0,lx+w/n,0,[shade(col,.25),col,shade(col,-.4)]);x.fillRect(lx+lean*(i%2),y-h-(i%3)*3,w/n,h+(i%3)*3);x.strokeStyle=OUT;x.lineWidth=1;x.strokeRect(lx+lean*(i%2),y-h-(i%3)*3,w/n,h+(i%3)*3)}};
  // torres de troncos inclinadas
  for(const s of[-1,1]){const px=cx+s*58;logs(px,gy-26,30,90,'#6a5a34');thatch(px,gy-116,34,52,'#8a7a3a');pennant(x,px+3,gy-168,'#7ab038',10);slit(x,px,gy-84,10,'#9aff70');slit(x,px,gy-58,10,'#9aff70')}
  logs(cx,gy-30,56,120,'#5a4a2c');
  for(let k=0;k<3;k++){x.strokeStyle='#2a2010';x.lineWidth=2;x.beginPath();x.moveTo(cx-28,gy-36-k*34);x.lineTo(cx+28,gy-36-k*34);x.stroke()}
  thatch(cx,gy-150,62,78,'#948440');for(const s of[-1,1]){x.strokeStyle=OUT;x.lineWidth=2.4;x.beginPath();x.moveTo(cx+s*8,gy-160);x.lineTo(cx+s*18,gy-176);x.stroke()}
  awin(x,cx,gy-110,10,16,'#9aff70');
  // calaveras en el tótem
  for(const[px,py]of[[-26,-92],[26,-92],[0,-72]]){ell(x,cx+px,gy+py,6,5.5,'#e8e4cc',OUT,1);ell(x,cx+px-2,gy+py-.5,1.5,1.8,'#10180f');ell(x,cx+px+2,gy+py-.5,1.5,1.8,'#10180f')}
  // empalizada
  for(let i=0;i<20;i++){const px=cx-96+i*10,hh=34+(i%3)*5;x.fillStyle=lg(x,px,0,px+9,0,['#8a7444','#6a5630','#3e3220']);x.beginPath();x.moveTo(px,gy);x.lineTo(px,gy-hh+4);x.lineTo(px+4.5,gy-hh-6);x.lineTo(px+9,gy-hh+4);x.lineTo(px+9,gy);x.closePath();x.fill();x.strokeStyle=OUT;x.lineWidth=1.1;x.stroke()}
  x.strokeStyle='#d0c8a0';x.lineWidth=1;x.beginPath();x.moveTo(cx-96,gy-14);x.lineTo(cx+96,gy-14);x.stroke();
  // puerta de colmillos
  gate(x,cx,gy-2,26,36,{wood:'#4a3a22',trim:'#6a5a34',pointed:0});for(const s of[-1,1])poly(x,[[cx+s*20,gy-30],[cx+s*26,gy-52],[cx+s*14,gy-34]],'#e8e4cc',OUT,1);
  // caldero
  const kx=cx+80,ky=gy+4;ell(x,kx,ky-2,12,5,'#10180f',OUT,1);x.beginPath();x.moveTo(kx-12,ky-12);x.quadraticCurveTo(kx-14,ky+8,kx,ky+6);x.quadraticCurveTo(kx+14,ky+8,kx+12,ky-12);x.fillStyle=lg(x,kx-12,0,kx+12,0,['#4a4a50','#2a2a30','#16161a']);x.fill();x.strokeStyle=OUT;x.stroke();ell(x,kx,ky-12,12,4,'#8aff50',OUT,1);for(let i=0;i<4;i++)ell(x,kx-6+i*4,ky-15-i%2*3,1.6,1.6,'rgba(180,255,120,.8)');
  x.fillStyle=rg(x,kx,ky-14,1,26,['rgba(150,255,100,.4)','rgba(150,255,100,0)']);x.fillRect(kx-30,ky-44,60,50);
  pole(x,cx+3,gy-150-78-4,16,'#3a2a14');return[cx+3,gy-150-78-4-16]},
// 7 · Tormenta: torre de mago de mármol nevado con orbe de rayos y agujas esbeltas
function(x,cx,by){const gy=by-14,W='#b4b8cc';mound(x,cx,by,100,'#f2f6fc','#b4c4dc');
  const needle=(px,y,w,h,col)=>{x.beginPath();x.moveTo(px-w/2-2,y);x.lineTo(px,y-h);x.lineTo(px+w/2+2,y);x.closePath();x.fillStyle=lg(x,px-w/2,0,px+w/2,0,[shade(col,.5),col,shade(col,-.4)]);x.fill();x.strokeStyle=OUT;x.lineWidth=1.2;x.stroke();poly(x,[[px-w/2-2,y],[px-1,y-h*.5],[px+1,y-h*.5],[px+w/2+2,y]],'rgba(255,255,255,.55)',null)};
  const snowcap=(px,y,w)=>{x.fillStyle='#fafcff';x.beginPath();x.moveTo(px-w/2-3,y);for(let i=0;i<=6;i++)x.quadraticCurveTo(px-w/2-3+(i+.5)*(w+6)/6,y+(i%2?4:7),px-w/2-3+(i+1)*(w+6)/6,y);x.lineTo(px+w/2+3,y-4);x.lineTo(px-w/2-3,y-4);x.fill()};
  for(const s of[-1,1]){tw(x,cx+s*62,gy-20,22,112,W,{flare:1,glow:'#a0d8ff'});needle(cx+s*62,gy-132,22,54,'#5a70b8');pennant(x,cx+s*62,gy-186-10,'#5a7ab0',9);
    tw(x,cx+s*88,gy-2,18,70,W,{flare:1,slits:1,glow:'#a0d8ff'})}
  tw(x,cx,gy-24,40,150,shade(W,.08),{flare:1,glow:'#a0d8ff',wy:30});
  for(const yy of[-50,-92,-130]){x.fillStyle='#8aa8e8';x.fillRect(cx-22,gy+yy,44,4);x.strokeStyle=OUT;x.lineWidth=1;x.strokeRect(cx-22,gy+yy,44,4)}
  for(const s of[-1,1]){tw(x,cx+s*26,gy-110,10,60,W,{win:0});needle(cx+s*26,gy-170,10,44,'#7a90d0')}
  needle(cx,gy-174,34,56,'#6a80c8');
  // orbe
  const oy=gy-250;x.fillStyle=rg(x,cx,oy,2,52,['rgba(180,220,255,.85)','rgba(120,160,255,.25)','rgba(120,160,255,0)']);x.fillRect(cx-56,oy-56,112,112);
  ell(x,cx,oy,12,12,rg(x,cx-3,oy-3,1,13,['#fff','#9ad0ff','#4a78e0']),OUT,1.3);
  x.strokeStyle='rgba(255,255,255,.9)';x.lineWidth=1.3;x.lineJoin='miter';for(const a of[-2.4,-.7,.9,2.2]){x.beginPath();let px=cx+Math.cos(a)*12,py=oy+Math.sin(a)*12;x.moveTo(px,py);for(let k=1;k<4;k++){px+=Math.cos(a)*6+(hash2(k,a*9|0)-.5)*7;py+=Math.sin(a)*6+(hash2(k,a*7|0)-.5)*7;x.lineTo(px,py)}x.stroke()}
  x.strokeStyle=OUT;x.lineWidth=2.6;x.beginPath();x.moveTo(cx,gy-230);x.lineTo(cx,gy-238);x.stroke();
  snowcap(cx-62,gy-132+2,22);snowcap(cx+62,gy-132+2,22);
  // arcos entre torres y muro
  brick(x,cx-100,gy-40,200,32,shade(W,-.1),{bh:6,bw:11});merl(x,cx-100,gy-40,200,W);for(let i=0;i<9;i++)if(Math.abs(i-4)>1)slit(x,cx-88+i*22,gy-32,10,'#a0d8ff');
  snowcap(cx,gy-40,200);
  gate(x,cx,gy-4,24,38,{pointed:0,glow:'rgba(150,200,255,.95)',in:'#1a2a5a',trim:'#e8f0ff'});
  for(let i=0;i<12;i++)ell(x,cx-90+hash2(i,7)*180,gy+2+hash2(i,8)*8,4+hash2(i,9)*6,1.8,'rgba(255,255,255,.8)');
  return[cx,oy-14]}
];
function townSprite(fi,level=1){
  const key='t'+fi;if(Gfx.cache[key])return Gfx.cache[key];const W=4*TILE,H=3*TILE+130,c=mkc(W,H),x=c.ctx,cx=W/2,by=H-6;
  shadowE(x,cx,by-2,98,15,.5);
  const f=CAST[fi]||CAST[0];const K=.88;x.save();x.lineJoin='round';x.translate(cx,by);x.scale(K,K);x.translate(-cx,-by);const fl=f(x,cx,by);x.restore();
  Gfx.cache[key]={c,flagX:cx+(fl[0]-cx)*K,flagY:by+(fl[1]-by)*K};return Gfx.cache[key];
}
