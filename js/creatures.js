'use strict';
// =====================================================================
//  Sprites de criaturas (formas Path2D con sombreado de 3 tonos), retratos y ciudades
// =====================================================================
// ---------- formas y sombreado ----------
const _P=a=>{const p=new Path2D();a.forEach((q,i)=>i?p.lineTo(q[0],q[1]):p.moveTo(q[0],q[1]));p.closePath();return p};
function pSmooth(pts){const p=new Path2D(),n=pts.length,m=i=>{const a=pts[i%n],b=pts[(i+1)%n];return[(a[0]+b[0])/2,(a[1]+b[1])/2]};
  const s=m(n-1);p.moveTo(s[0],s[1]);for(let i=0;i<n;i++){const e=m(i);p.quadraticCurveTo(pts[i][0],pts[i][1],e[0],e[1])}p.closePath();return p}
const _E=(cx,cy,rx,ry,rot=0)=>{const p=new Path2D();p.ellipse(cx,cy,rx,ry,rot,0,6.2832);return p};
// cápsula cónica de (x1,y1) a (x2,y2) con grosores w1,w2
function _cap(x1,y1,x2,y2,w1,w2){const a=Math.atan2(y2-y1,x2-x1),h=Math.PI/2,p=new Path2D();p.arc(x2,y2,w2/2,a+h,a-h,true);p.arc(x1,y1,w1/2,a-h,a+h,true);p.closePath();return p}
const _BIG=(()=>{const p=new Path2D();p.rect(-60,-60,220,220);return p})();
const _M=(e,f)=>({a:1,b:0,c:0,d:1,e,f});
// relleno con 3 tonos (luz, media, sombra) en media luna + contorno
function solid(x,p,col,o={}){
  const d=o.d==null?1.7:o.d,lw=o.lw==null?1.25:o.lw;
  x.save();x.fillStyle=col;x.fill(p);
  if(d>0){x.clip(p);
    const s=new Path2D();s.addPath(_BIG);s.addPath(p,_M(-d*.9,-d));x.fillStyle=o.sh||shade(col,-.34);x.fill(s,'evenodd');
    const h=new Path2D();h.addPath(_BIG);h.addPath(p,_M(d*.75,d*.85));x.fillStyle=o.hl||shade(col,.32);x.fill(h,'evenodd')}
  x.restore();
  if(lw>0){x.save();x.strokeStyle=o.ol||OUT;x.lineWidth=lw;x.lineJoin='round';x.lineCap='round';x.stroke(p);x.restore()}
}
function solidU(x,ps,col,o={}){const lw=o.lw==null?1.25:o.lw;x.save();x.strokeStyle=o.ol||OUT;x.lineWidth=lw*2;x.lineJoin='round';for(const p of ps)x.stroke(p);x.restore();for(const p of ps)solid(x,p,col,Object.assign({},o,{lw:0}))}
function sLimb(x,pts,col,o){const ps=[];for(let i=0;i<pts.length-1;i++)ps.push(_cap(pts[i][0],pts[i][1],pts[i+1][0],pts[i+1][1],pts[i][2],pts[i+1][2]));const w=Math.min(...pts.map(q=>q[2]));solidU(x,ps,col,Object.assign({d:Math.min(1.6,w*.28)},o))}
const sPoly=(x,pts,col,o)=>solid(x,_P(pts),col,o), sEll=(x,cx,cy,rx,ry,col,o,rot)=>solid(x,_E(cx,cy,rx,ry,rot||0),col,o);
const sCap=(x,x1,y1,x2,y2,w1,w2,col,o)=>solid(x,_cap(x1,y1,x2,y2,w1,w2),col,Object.assign({d:Math.min(1.6,Math.min(w1,w2)*.28)},o));
// miembro con codo: 2 cápsulas
function limb(x,x1,y1,x2,y2,w,col){const p=_cap(x1,y1,x2,y2,w,w*.9);x.save();x.lineCap='round';x.strokeStyle=OUT;x.lineWidth=1.2;solid(x,p,col,{d:Math.min(1.5,w*.28)});x.restore()}
function cline(x,pts,col,w){x.save();x.strokeStyle=col;x.lineWidth=w;x.lineCap='round';x.lineJoin='round';x.beginPath();pts.forEach((q,i)=>i?x.lineTo(q[0],q[1]):x.moveTo(q[0],q[1]));x.stroke();x.restore()}
const cdot=(x,px,py,r,col)=>{x.fillStyle=col;x.beginPath();x.arc(px,py,r,0,6.2832);x.fill()};
// ojo expresivo: mood 0 neutro, 1 fiero (ceja caída), 2 astuto/entornado, 3 triste/dulce
function eye(x,px,py,r,col='#fff',pupil='#111',mood=0,iris){
  const lid=mood===2?.55:1;
  x.save();x.beginPath();x.ellipse(px,py,r*1.15,r*lid,0,0,6.2832);x.fillStyle=col;x.fill();x.strokeStyle=OUT;x.lineWidth=.75;x.stroke();x.clip();
  if(iris){cdot(x,px+r*.3,py,r*.78,iris)}
  cdot(x,px+r*.3,py,r*(iris?.42:.55),pupil);x.fillStyle='rgba(255,255,255,.95)';x.fillRect(px+r*.45,py-r*.55,r*.38,r*.38);
  if(mood===1||mood===2){x.fillStyle='rgba(20,10,20,.55)';x.fillRect(px-r*1.3,py-r*1.2,r*2.6,r*.7)}
  x.restore();
}
function brow(x,px,py,w,mood,col='#2a1a14',side=1){const a=mood===1?1.2:mood===3?-1.1:mood===2?.5:0;x.save();x.strokeStyle=col;x.lineWidth=1.3;x.lineCap='round';x.beginPath();x.moveTo(px+side*w/2,py-a);x.lineTo(px-side*w/2,py+a);x.stroke();x.restore()}
function bodyG(x,x0,y0,x1,y1,col){return lg(x,x0,y0,x1,y1,[shade(col,.38),col,shade(col,-.38)])}
// ---------- armas ----------
const GOLD='#f2c93a';
function ca(c,a){if(c[0]!=='#')return c;let h=c.slice(1);if(h.length===3)h=h[0]+h[0]+h[1]+h[1]+h[2]+h[2];const n=parseInt(h,16);return`rgba(${n>>16&255},${n>>8&255},${n&255},${a})`}
const wpn={
  sword(x,hx,hy,ang,col,len=26){x.save();x.translate(hx,hy);x.rotate(ang);
    solid(x,_P([[0,-2.4],[len-5,-2.4],[len,0],[len-5,2.4],[0,2.4]]),'#d8dee8',{d:1,lw:1});cline(x,[[3,0],[len-6,0]],'rgba(60,70,95,.55)',.9);
    solid(x,_P([[-1.5,-6],[1.8,-6],[1.8,6],[-1.5,6]]),col||GOLD,{d:.8,lw:.9});solid(x,_P([[-7,-1.7],[-1.5,-1.7],[-1.5,1.7],[-7,1.7]]),'#6a4228',{d:.6,lw:.9});cdot(x,-8,0,2,col||GOLD);x.strokeStyle=OUT;x.lineWidth=.8;x.beginPath();x.arc(-8,0,2,0,6.3);x.stroke();x.restore()},
  cutlass(x,hx,hy,ang){x.save();x.translate(hx,hy);x.rotate(ang);const p=new Path2D();p.moveTo(0,-2.2);p.quadraticCurveTo(18,-5,27,3);p.lineTo(24,4.4);p.quadraticCurveTo(14,1,0,2.2);p.closePath();solid(x,p,'#d8dee8',{d:.9,lw:1});
    solid(x,_P([[-1,-5],[2,-5],[2,4],[-1,4]]),'#c8962a',{d:.6,lw:.9});solid(x,_P([[-6,-1.6],[-1,-1.6],[-1,1.6],[-6,1.6]]),'#5a3a22',{d:.5,lw:.9});x.restore()},
  spear(x,hx,hy,ang,col,len=50,pen){x.save();x.translate(hx,hy);x.rotate(ang);solid(x,_P([[-20,-1.3],[len-14,-1.3],[len-14,1.3],[-20,1.3]]),'#8a6238',{d:.6,lw:.9});
    solid(x,_P([[len-15,-2],[len-8,-4.4],[len+3,0],[len-8,4.4],[len-15,2]]),'#dfe6f0',{d:1,lw:1});cline(x,[[len-14,0],[len-4,0]],'rgba(70,80,100,.5)',.8);
    if(pen){const p=new Path2D();p.moveTo(len-17,-1);p.quadraticCurveTo(len-24,-7,len-32,-3);p.quadraticCurveTo(len-26,0,len-34,5);p.quadraticCurveTo(len-24,3,len-17,1);p.closePath();solid(x,p,pen,{d:.8,lw:.9})}x.restore()},
  halberd(x,hx,hy,ang,col){x.save();x.translate(hx,hy);x.rotate(ang);solid(x,_P([[-22,-1.4],[34,-1.4],[34,1.4],[-22,1.4]]),'#8a6238',{d:.6,lw:.9});
    solid(x,_P([[28,-1.5],[34,-3],[44,0],[34,3],[28,1.5]]),'#dfe6f0',{d:.9,lw:.9});
    const b=new Path2D();b.moveTo(26,-1.5);b.quadraticCurveTo(24,-14,36,-12);b.quadraticCurveTo(32,-7,34,-1.5);b.closePath();solid(x,b,'#cfd6e2',{d:1,lw:.95});
    solid(x,_P([[24,1.4],[30,1.4],[27,6]]),'#b8c0cc',{d:.5,lw:.8});solid(x,_P([[25,-2],[27,-2],[27,2],[25,2]]),col||GOLD,{d:.4,lw:.7});x.restore()},
  axe(x,hx,hy,ang,col){x.save();x.translate(hx,hy);x.rotate(ang);solid(x,_P([[-8,-1.5],[26,-1.5],[26,1.5],[-8,1.5]]),'#7a5030',{d:.6,lw:.9});
    const b=new Path2D();b.moveTo(18,-2);b.quadraticCurveTo(16,-13,30,-12);b.quadraticCurveTo(26,-3,28,0);b.quadraticCurveTo(26,3,30,12);b.quadraticCurveTo(16,13,18,2);b.closePath();solid(x,b,col||'#b8c0cc',{d:1.3,lw:1.1});cline(x,[[22,-6],[26,-8]],'rgba(255,255,255,.55)',.9);x.restore()},
  pick(x,hx,hy,ang){x.save();x.translate(hx,hy);x.rotate(ang);solid(x,_P([[-10,-1.5],[24,-1.5],[24,1.5],[-10,1.5]]),'#7a5030',{d:.6,lw:.9});
    const b=new Path2D();b.moveTo(18,-1.5);b.quadraticCurveTo(24,-12,36,-9);b.quadraticCurveTo(26,-7,24,-1);b.lineTo(24,1);b.quadraticCurveTo(26,7,36,9);b.quadraticCurveTo(24,12,18,1.5);b.closePath();solid(x,b,'#aeb6c4',{d:1.2,lw:1.1});x.restore()},
  club(x,hx,hy,ang,col){x.save();x.translate(hx,hy);x.rotate(ang);const p=new Path2D();p.moveTo(-8,-1.8);p.lineTo(12,-3);p.quadraticCurveTo(26,-10,32,-3);p.quadraticCurveTo(35,2,30,7);p.quadraticCurveTo(20,9,12,3);p.lineTo(-8,1.8);p.closePath();
    solid(x,p,col||'#8a5a32',{d:1.5,lw:1.2});for(const[a,b]of[[22,-6],[27,-1],[22,4],[16,-2]])solid(x,_P([[a-1.4,b+1.4],[a,b-2.2],[a+1.4,b+1.4]]),'#d8d4c4',{d:.3,lw:.7});x.restore()},
  mace(x,hx,hy,ang,col){x.save();x.translate(hx,hy);x.rotate(ang);solid(x,_P([[-10,-1.4],[22,-1.4],[22,1.4],[-10,1.4]]),'#7a5030',{d:.5,lw:.9});sEll(x,27,0,6,6,col||GOLD,{d:1.5});
    for(let i=0;i<6;i++){const a=i*1.047;solid(x,_P([[27+Math.cos(a)*5,Math.sin(a)*5],[27+Math.cos(a)*9,Math.sin(a)*9],[27+Math.cos(a+.4)*5,Math.sin(a+.4)*5]]),'#d8dee8',{d:0,lw:.7})}x.restore()},
  staff(x,hx,hy,ang,col,orb,kind){x.save();x.translate(hx,hy);x.rotate(ang);const L=kind==='crook'?34:30;solid(x,_P([[-20,-1.5],[L,-1.5],[L,1.5],[-20,1.5]]),'#6a4a2a',{d:.6,lw:.9});
    for(const t of[-6,4])solid(x,_P([[t,-2.4],[t+2,-2.4],[t+2,2.4],[t,2.4]]),'#8a6a3a',{d:0,lw:.7});x.restore();
    const ox=hx+Math.cos(ang)*(L+2),oy=hy+Math.sin(ang)*(L+2),oc=orb||'#a0dcff';
    if(kind==='skull'){sEll(x,ox,oy,4.5,4.8,'#ece8d4',{d:1.2});cdot(x,ox-1.5,oy-.6,1,'#1a1018');cdot(x,ox+1.8,oy-.6,1,'#1a1018');cdot(x,ox-1.5,oy-.6,.5,oc);cdot(x,ox+1.8,oy-.6,.5,oc)}
    else{x.fillStyle=rg(x,ox,oy,1,15,[oc,ca(oc,.4),'rgba(255,255,255,0)']);x.fillRect(ox-16,oy-16,32,32);const c=new Path2D();c.arc(ox,oy,4.6,0,6.3);solid(x,c,oc,{d:1.2,hl:'#fff'});
      x.strokeStyle='#7a5a2a';x.lineWidth=1.6;x.beginPath();x.arc(ox,oy,6.3,Math.PI*.9,Math.PI*2.1);x.stroke()}},
  bow(x,hx,hy,col){x.save();x.lineCap='round';x.strokeStyle=OUT;x.lineWidth=4.6;x.beginPath();x.arc(hx+6,hy,17,-1.2,1.2);x.stroke();x.strokeStyle=col||'#8a5a2e';x.lineWidth=2.8;x.stroke();x.strokeStyle='rgba(255,230,180,.55)';x.lineWidth=.9;x.beginPath();x.arc(hx+5.4,hy-.4,17,-1.15,.2);x.stroke();
    const ax=hx+6+Math.cos(-1.2)*17,ay=hy+Math.sin(-1.2)*17,bx=hx+6+Math.cos(1.2)*17,by=hy+Math.sin(1.2)*17;
    x.strokeStyle='#efe8da';x.lineWidth=.9;x.beginPath();x.moveTo(ax,ay);x.lineTo(hx-3,hy);x.lineTo(bx,by);x.stroke();x.restore();
    x.save();x.strokeStyle='#caa';x.lineWidth=1.4;x.beginPath();x.moveTo(hx-3,hy);x.lineTo(hx+24,hy);x.stroke();solid(x,_P([[hx+22,hy-2.6],[hx+30,hy],[hx+22,hy+2.6]]),'#dde',{d:.4,lw:.8});solid(x,_P([[hx-3,hy-2],[hx+1,hy],[hx-3,hy+2]]),'#e84a3a',{d:0,lw:.6});x.restore()},
  xbow(x,hx,hy,col){x.save();x.translate(hx,hy);solid(x,_P([[-14,-2.4],[14,-2.4],[18,0],[14,2.4],[-14,2.4]]),'#7a5230',{d:.9,lw:1});
    const p=new Path2D();p.moveTo(9,-14);p.quadraticCurveTo(17,0,9,14);p.lineTo(8,13);p.quadraticCurveTo(14,0,8,-13);p.closePath();solid(x,p,col||'#9a6a3a',{d:.8,lw:1});
    x.strokeStyle='#e6dfd0';x.lineWidth=.8;x.beginPath();x.moveTo(9,-14);x.lineTo(-1,0);x.lineTo(9,14);x.stroke();solid(x,_P([[0,-1.1],[18,-1.1],[22,0],[18,1.1],[0,1.1]]),'#dde',{d:0,lw:.7});x.restore()},
  harpoon(x,hx,hy,ang){x.save();x.translate(hx,hy);x.rotate(ang);solid(x,_P([[-20,-1.4],[30,-1.4],[30,1.4],[-20,1.4]]),'#8a6a3a',{d:.5,lw:.9});
    solid(x,_P([[30,-1.6],[38,-1.6],[44,0],[38,1.6],[30,1.6]]),'#cfd6e2',{d:.6,lw:.9});solid(x,_P([[32,-1],[36,-6],[37,-1]]),'#cfd6e2',{d:0,lw:.8});solid(x,_P([[32,1],[36,6],[37,1]]),'#cfd6e2',{d:0,lw:.8});cline(x,[[-20,0],[-26,6],[-24,12]],'#d8c8a0',1.1);x.restore()},
  scythe(x,hx,hy,ang){x.save();x.translate(hx,hy);x.rotate(ang);solid(x,_P([[-22,-1.4],[36,-1.4],[36,1.4],[-22,1.4]]),'#5a4630',{d:.5,lw:.9});const b=new Path2D();b.moveTo(34,-2);b.quadraticCurveTo(50,-14,44,10);b.quadraticCurveTo(46,-4,34,2);b.closePath();solid(x,b,'#cfd6e2',{d:.9,lw:1});x.restore()},
  whip(x,hx,hy,ang,col){x.save();x.translate(hx,hy);x.rotate(ang);x.strokeStyle=OUT;x.lineWidth=3;x.lineCap='round';x.beginPath();x.moveTo(0,0);x.bezierCurveTo(14,-14,30,12,40,-4);x.stroke();x.strokeStyle=col||'#c04a2a';x.lineWidth=1.5;x.stroke();x.restore()}
};
function shield(x,sx,sy,col,acc,r=11,kind){x.save();x.translate(sx,sy);let p;
  if(kind==='round'){p=_E(0,0,r*.95,r*.95)}
  else if(kind==='tower'){p=_P([[-r*.8,-r*1.3],[r*.8,-r*1.3],[r*.8,r*.8],[0,r*1.5],[-r*.8,r*.8]])}
  else{p=pSmooth([[-r,-r],[0,-r*1.1],[r,-r],[r*.9,r*.2],[0,r*1.4],[-r*.9,r*.2]])}
  solid(x,p,col,{d:1.8,lw:1.5});x.save();x.clip(p);x.strokeStyle=acc;x.lineWidth=2.2;x.beginPath();x.moveTo(0,-r*1.4);x.lineTo(0,r*1.6);x.moveTo(-r,-r*.15);x.lineTo(r,-r*.15);x.stroke();x.restore();
  x.strokeStyle=shade(acc,-.4);x.lineWidth=.7;x.stroke(p);sEll(x,0,-r*.15,2.4,2.4,shade(acc,.25),{d:.7,lw:.8});x.restore()}
// ---------- alas ----------
function wingFeather(x,ox,oy,span,col,k=1,tilt=0){x.save();x.translate(ox,oy);x.scale(k,1);x.rotate(tilt);
  const layer=(n,a0,da,Lk,w,c,ds)=>{for(let i=n-1;i>=0;i--){const a=a0+i*da,L=span*Lk*(.62+.38*Math.sin((i+.5)/n*3.0)),ww=span*w;x.save();x.rotate(a);
    const p=new Path2D();p.moveTo(0,-ww*.5);p.quadraticCurveTo(L*.55,-ww*1.05,L,-ww*.1);p.quadraticCurveTo(L*.6,ww*.95,0,ww*.5);p.closePath();solid(x,p,i%2?c:shade(c,ds),{d:1.4,lw:1.05,hl:'#ffffff'});x.restore()}};
  layer(7,-1.8,.2,1,.2,col,-.07);layer(6,-1.75,.24,.55,.2,shade(col,.06),-.1);
  x.restore()}
function wingBat(x,ox,oy,span,col,k=1,o={}){x.save();x.translate(ox,oy);x.scale(k,1);x.rotate(o.tilt||0);
  const tip=[span*.95,-span*.68],a=[span*.45,-span*.86],b=[span*1.0,-span*.15],c=[span*.62,span*.05],d=[span*.25,span*.12];
  const m=new Path2D();m.moveTo(0,0);m.quadraticCurveTo(span*.15,-span*.7,a[0],a[1]);m.quadraticCurveTo(span*.75,-span*1.05,tip[0],tip[1]);
  m.quadraticCurveTo(span*.93,-span*.45,b[0],b[1]);m.quadraticCurveTo(span*.84,-span*.2,c[0],c[1]);m.quadraticCurveTo(span*.5,-span*.08,d[0]+3,d[1]);m.quadraticCurveTo(span*.2,span*.02,0,span*.06);m.closePath();
  solid(x,m,col,{d:2,lw:1.4});
  if(!o.bone){x.save();x.clip(m);x.strokeStyle='rgba(20,5,30,.45)';x.lineWidth=.9;for(const q of[a,tip,b,c]){x.beginPath();x.moveTo(0,0);x.lineTo(q[0],q[1]);x.stroke()}x.restore()}
  if(o.holes){x.save();x.globalCompositeOperation='destination-out';for(const[hx,hy,r]of o.holes){x.beginPath();x.ellipse(hx*span,hy*span,r*span,r*span*.7,.4,0,6.3);x.fill()}x.restore()}
  x.strokeStyle=OUT;x.lineWidth=2.4;x.lineCap='round';x.beginPath();x.moveTo(0,0);x.quadraticCurveTo(span*.2,-span*.72,a[0],a[1]);x.lineTo(tip[0],tip[1]);x.stroke();
  x.strokeStyle=o.arm||shade(col,.3);x.lineWidth=1.3;x.stroke();x.restore()}
// ---------- cabezas especiales ----------
function _hair(x,col,hx,hy,hr,long){ // melena trasera
  if(long){sPoly(x,[[hx-hr-1,hy-3],[hx,hy-hr-2],[hx+hr,hy-4],[hx+hr+2,hy+hr+4],[hx,hy+hr+7],[hx-hr-3,hy+hr+4]],col,{d:1.6,lw:1.1})}
}
// ---------- humanoide general ----------
function humanoid(x,o){
  const P=o.pal,cx=48,by=90,sc=(o.sc||1)*(o.noScale?1:1.03),dw=o.dwarf,sk=o.skull;
  x.save();x.translate(cx+((o.halfBody||o.mounted||o.noShift)?0:-4),by);x.scale(sc,sc);x.translate(-cx,-by);
  const skin=o.skin||'#e8c4a0',arm=o.armor||P[0],cl=o.cloth||P[1],ac=o.accent||P[2],mood=o.mood||0;
  const trim=o.up?GOLD:ac,boot=o.boot||'#3a281c',legc=o.legs||shade(cl,-.28),bone='#d9d4be';
  const hip=by-(dw?21:28),sh=by-(dw?43:53),tw=(o.bulk?14:11)+(dw?2.5:0),ln=o.lean==null?1.5:o.lean,hun=o.hunch||0;
  const sx0=cx+ln,hr=o.head||(dw?7.8:7.3),hx=cx+ln*1.6+hun*.9,hy=sh-(dw?6.5:7.6)+hun*.45;
  if(!o.noShadow)shadowE(x,cx,by+1,(dw?19:21)*(o.bulk?1.15:1),5.5,.45);
  // --- por detrás: alas, capa, cola ---
  if(o.wings){const w=o.wings;
    if(o.wingStyle==='bat'){wingBat(x,sx0-4,sh+9,31,shade(w,-.05),-1,{tilt:.05});wingBat(x,sx0+4,sh+9,31,shade(w,.05),1,{tilt:-.1})}
    else{wingFeather(x,sx0-2,sh+6,38,w,-1,.05);wingFeather(x,sx0+2,sh+6,38,w,1,-.05)}}
  if(o.tail){const t=new Path2D();t.moveTo(cx-4,hip-2);t.bezierCurveTo(cx-22,hip+2,cx-34,hip-12,cx-30,by-6);t.bezierCurveTo(cx-33,hip-8,cx-20,hip+10,cx-3,hip+5);t.closePath();solid(x,t,o.tail,{d:1.6});
    if(o.tailTip)sPoly(x,[[cx-31,by-3],[cx-26,by-12],[cx-36,by-10]],o.tailTip,{d:.5})}
  if(o.cape){const c=o.cape,p=pSmooth([[sx0-tw+3,sh-1],[sx0+tw*.6,sh],[cx+tw*.5,hip+4],[cx+2,by-9],[cx-9,by-4],[cx-17,by-8],[cx-21,hip],[sx0-tw-5,sh+10]]);solid(x,p,c,{d:2.2});
    cline(x,[[cx-6,sh+8],[cx-9,hip+10],[cx-12,by-8]],shade(c,-.42),1.1);cline(x,[[cx+1,hip+2],[cx-1,by-12]],shade(c,-.42),1);
    if(o.up)cline(x,[[cx-9,by-4],[cx-17,by-8],[cx-21,hip]],GOLD,1.3)}
  // --- piernas ---
  const leg=(hxp,kx,fx,back)=>{const c=back?shade(legc,-.2):legc,ky=hip+(by-hip)*.5,ay=by-3.5;
    if(sk){sCap(x,hxp,hip,kx,ky,3.6,3.2,bone);sCap(x,kx,ky,fx,ay,3.2,2.8,bone);cdot(x,kx,ky,2.3,'#ece8d6');sPoly(x,[[fx-2,ay],[fx+8,ay+1],[fx+8,by],[fx-3,by]],bone,{d:.7,lw:1});return}
    if(o.greaves||o.thigh){sCap(x,hxp,hip,kx,ky,dw?10:8.8,7.8,o.thigh?shade(arm,back?-.2:0):c);sCap(x,kx,ky,fx,ay,7.6,6.2,shade(arm,back?-.2:.05))}else sLimb(x,[[hxp,hip,dw?10:8.8],[kx,ky,7.8],[fx,ay,6.2]],c);
    if(o.greaves){sEll(x,kx+.6,ky,4.6,3.6,shade(arm,.12),{d:1})}
    if(o.bareFeet||o.bare2||(o.bare&&!o.boot)){sPoly(x,[[fx-3,ay-1],[fx+3,ay-1],[fx+8,by-2.5],[fx+11,by-1],[fx+10,by],[fx-3.5,by]],skin,{d:1});for(const t of[4,7,10])poly(x,[[fx+t,by-.2],[fx+t+1.4,by+1.6],[fx+t+2,by-.2]],o.claw||'#e8e0c8',OUT,.5)}
    else sPoly(x,[[fx-3.7,ay-3.4],[fx+3.7,ay-3.4],[fx+4,ay+.4],[fx+10.5,by-2.4],[fx+10.5,by],[fx-4.2,by]],boot,{d:1.2,hl:shade(boot,.45)})};
  if(!o.robe&&!o.mounted&&!o.halfBody){leg(cx-4.5,cx-8,cx-10,1);leg(cx+5,cx+8.5,cx+10,0)}
  else if(o.mounted){ // jinete: muslo adelante y pantorrilla colgando
    sCap(x,cx-1,hip+1,cx+9,hip+5,8.4,7.4,legc);sCap(x,cx+9,hip+5,cx+8,hip+20,7.2,6,o.greaves?arm:legc);sPoly(x,[[cx+4,hip+19],[cx+12,hip+19],[cx+17,hip+23],[cx+16,hip+25],[cx+4,hip+25]],boot,{d:1})}
  // --- torso ---
  const T=_P([[sx0-tw,sh],[sx0+tw,sh],[sx0+tw*.94,sh+9],[cx+tw*.64,hip+1],[cx-tw*.64,hip+1],[sx0-tw*.94,sh+9]]);
  if(o.robe){const p=new Path2D();p.moveTo(sx0-tw*.92,sh);p.lineTo(sx0+tw*.92,sh);p.lineTo(sx0+tw*.78,sh+11);p.quadraticCurveTo(cx+8,hip+6,cx+15,by-5);p.quadraticCurveTo(cx+4,by+1,cx-2,by-3);p.quadraticCurveTo(cx-10,by+2,cx-16,by-4);p.quadraticCurveTo(cx-9,hip+8,sx0-tw*.78,sh+11);p.closePath();
    solid(x,p,cl,{d:2.2});x.save();x.clip(p);x.strokeStyle=shade(cl,-.38);x.lineWidth=1;for(let i=-2;i<=2;i++){x.beginPath();x.moveTo(cx+i*4.4,hip+2);x.quadraticCurveTo(cx+i*5.6,hip+14,cx+i*7.2,by-4);x.stroke()}
    x.fillStyle=arm;x.fillRect(sx0-tw,sh,tw*2,5.2);x.fillStyle=shade(arm,.3);x.fillRect(sx0-tw,sh,tw*2,1.5);
    if(!o.noSash){x.fillStyle=trim;x.fillRect(cx-14,hip+1,28,3);x.fillStyle=shade(trim,.3);x.fillRect(cx-14,hip+1,28,1)}x.restore();
    sPoly(x,[[cx+3,sh+5],[cx+7,sh+5],[cx+9,by-5],[cx+3,by-5]],trim,{d:.7,lw:.9});
  }else if(sk){ // caja torácica
    sPoly(x,[[cx-3,hip-1],[cx+3,hip-1],[cx+4,hip-5],[cx-4,hip-5]],bone,{d:.8});cline(x,[[sx0,sh+1],[sx0,hip-2]],'#c8c2aa',2.4);
    for(let i=0;i<4;i++){const y=sh+2+i*4.6,w=tw*(.95-i*.12);const p=new Path2D();p.moveTo(sx0,y);p.quadraticCurveTo(sx0-w,y-1,sx0-w*.9,y+3.5);p.quadraticCurveTo(sx0-w*.4,y+1,sx0,y+2);p.quadraticCurveTo(sx0+w*.4,y+1,sx0+w*.9,y+3.5);p.quadraticCurveTo(sx0+w,y-1,sx0,y);p.closePath();solid(x,p,'#e6e1cc',{d:.9,lw:.9})}
    sPoly(x,[[sx0-tw*.9,sh],[sx0+tw*.9,sh],[sx0+tw*.7,sh+3],[sx0-tw*.7,sh+3]],o.rags||'#8a8570',{d:.8})
    if(o.rags)sPoly(x,[[cx-tw*.6,hip-4],[cx+tw*.6,hip-4],[cx+tw*.5,hip+9],[cx+tw*.2,hip+6],[cx-tw*.1,hip+11],[cx-tw*.5,hip+7]],o.rags,{d:1})
  }else{
    solid(x,T,o.bare?skin:arm,{d:2});x.save();x.clip(T);
    if(o.bare){x.strokeStyle=shade(skin,-.4);x.lineWidth=.9;x.beginPath();x.moveTo(sx0,sh+3);x.lineTo(sx0,hip-4);x.moveTo(sx0-tw*.8,sh+8);x.quadraticCurveTo(sx0-tw*.3,sh+12,sx0,sh+9);x.quadraticCurveTo(sx0+tw*.3,sh+12,sx0+tw*.8,sh+8);x.stroke();
      for(let i=0;i<3;i++){x.beginPath();x.moveTo(sx0-3,sh+15+i*3.4);x.lineTo(sx0+3,sh+15+i*3.4);x.stroke()}
      if(o.ribs){x.strokeStyle='rgba(235,225,190,.85)';x.lineWidth=1.3;for(let i=0;i<4;i++){x.beginPath();x.moveTo(sx0-tw*.7,sh+10+i*3.6);x.quadraticCurveTo(sx0-tw*.2,sh+12+i*3.6,sx0,sh+10+i*3.6);x.stroke()}x.fillStyle='rgba(60,40,30,.55)';x.beginPath();x.ellipse(sx0+5,sh+6,3.4,2.4,0,0,6.3);x.fill()}
      if(o.harness){x.strokeStyle=OUT;x.lineWidth=4.4;x.beginPath();x.moveTo(sx0-tw,sh);x.lineTo(sx0+tw*.8,hip);x.stroke();x.strokeStyle=o.harness;x.lineWidth=3;x.stroke()}}
    else{ // peto con placas
      x.fillStyle=shade(arm,.28);x.beginPath();x.moveTo(sx0-tw*.2,sh+1);x.lineTo(sx0+tw*.2,sh+1);x.lineTo(sx0+tw*.5,sh+9);x.lineTo(sx0,hip-6);x.lineTo(sx0-tw*.5,sh+9);x.closePath();x.globalAlpha=.55;x.fill();x.globalAlpha=1;
      x.strokeStyle=shade(arm,-.5);x.lineWidth=.9;x.beginPath();x.moveTo(sx0,sh+2);x.lineTo(sx0,hip-3);x.moveTo(sx0-tw*.8,sh+13);x.lineTo(sx0+tw*.8,sh+13);x.moveTo(sx0-tw*.7,sh+8);x.quadraticCurveTo(sx0,sh+12,sx0+tw*.7,sh+8);x.stroke();
      if(o.chain){x.strokeStyle='rgba(0,0,0,.28)';x.lineWidth=.8;for(let i=0;i<7;i++){x.beginPath();x.moveTo(sx0-tw,sh+14+i*2);x.lineTo(sx0+tw,sh+14+i*2);x.stroke()}}}
    x.restore();
    // cinturón
    solid(x,_P([[cx-tw*.7,hip-4],[cx+tw*.7,hip-4],[cx+tw*.72,hip+.4],[cx-tw*.72,hip+.4]]),o.beltCol||'#5a3a22',{d:.7,lw:1});sEll(x,cx+1,hip-1.8,2.4,2.2,trim,{d:.8,lw:.8});
    if(o.tabard){const tc=o.tabardCol||cl;solid(x,_P([[cx-5,hip],[cx+7,hip],[cx+8.5,hip+15],[cx+1,hip+12],[cx-6.5,hip+15]]),tc,{d:1.6});cline(x,[[cx+1,hip+1],[cx+1.5,hip+11]],shade(tc,-.4),1);
      if(o.cross){x.fillStyle=trim;x.fillRect(cx-.4,hip+2,2.8,9);x.fillRect(cx-2.6,hip+5,7.2,2.4)}else{cline(x,[[cx-6,hip+14],[cx+1,hip+11.5],[cx+8,hip+14]],trim,1.3)}}
    // hombreras
    if(!o.noPauld&&!o.bare&&!sk)for(const k of[-1,1]){const px=sx0+k*tw,py=sh+1.2;sEll(x,px,py,6.2,4.8,shade(arm,.1),{d:1.4});cdot(x,px,py-.3,1,shade(trim,.1));if(o.spikes){solid(x,_P([[px-2.4,py-3],[px+k*1,py-10],[px+2.4,py-3]]),'#d8d4c4',{d:.4,lw:.8})}}
    else if(o.bare&&o.pauldFur)for(const k of[-1,1])sEll(x,sx0+k*tw,sh+1,6,4.4,o.pauldFur,{d:1.4});
  }
  // --- brazo trasero + escudo ---
  const sleeve=o.sleeve||(sk?bone:cl),gaunt=o.bareArms?skin:(sk?bone:arm);
  const bax=sx0-tw+1,bay=sh+2.5;
  if(o.zombie){sCap(x,bax,bay,bax+9,sh+9,6.4,5.6,sleeve);sCap(x,bax+9,sh+9,bax+22,sh+5,5.6,4.8,gaunt);cdot(x,bax+23,sh+5,2.8,skin);x.strokeStyle=OUT;x.lineWidth=.8;x.beginPath();x.arc(bax+23,sh+5,2.8,0,6.3);x.stroke()}
  else if(!o.noBackArm){sLimb(x,[[bax,bay,6.4],[bax-4,sh+13,5.6],[bax-2,sh+21,4.8]],sleeve);}
  if(o.shield&&!o.zombie){shield(x,bax-5,sh+17,o.shield,trim,o.shieldR||9.5,o.shieldKind)}
  else if(!o.noBackArm&&!o.zombie)cdot(x,bax-2,sh+22,2.7,sk?bone:skin);
  // --- brazo delantero + arma ---
  const fax=sx0+tw-1,fay=sh+2.5,hx2=fax+11+(o.reach||0),hy2=sh+10+(o.handDy||0),aw=o.weapon;
  const drawFront=()=>{sLimb(x,[[fax,fay,6.6],[fax+5,sh+12,5.8],[hx2,hy2,5]],o.bareArms||sk?gaunt:sleeve);if(!o.bareArms&&!sk)sCap(x,fax+6,sh+12,hx2,hy2,5.8,5,shade(gaunt,.05),{d:1});
    if(o.bracer)sCap(x,fax+8,sh+11.5,hx2,hy2,6,5.3,o.bracer,{d:.9})};
  if(aw==='bow'||aw==='xbow'){ // brazo trasero estira la cuerda
    if(aw==='bow'){wpn.bow(x,hx2+1,hy2-1,o.bowCol||ac);drawFront();cdot(x,hx2,hy2,2.8,sk?bone:skin)}
    else{drawFront();wpn.xbow(x,hx2+1,hy2+1,o.bowCol);sCap(x,bax+2,sh+10,cx+9,sh+14,5,4.4,sleeve);cdot(x,hx2-6,hy2+2,2.6,skin)}}
  else{
    if(aw==='sword')wpn.sword(x,hx2,hy2,-1.05,o.bladeCol,o.up?30:26);else if(aw==='cutlass')wpn.cutlass(x,hx2,hy2,-.95);
    else if(aw==='spear')wpn.spear(x,hx2-1,hy2+2,-1.28,null,52,o.pennant);else if(aw==='halberd')wpn.halberd(x,hx2,hy2+2,-1.4,trim);
    else if(aw==='axe')wpn.axe(x,hx2,hy2,-.95,o.axeCol);else if(aw==='pick')wpn.pick(x,hx2,hy2,-.9);else if(aw==='club')wpn.club(x,hx2,hy2,-.95,o.clubCol);
    else if(aw==='mace')wpn.mace(x,hx2,hy2,-1.05,trim);else if(aw==='staff')wpn.staff(x,hx2,hy2+2,-1.45,ac,o.orb,o.staffKind);else if(aw==='harpoon')wpn.harpoon(x,hx2-2,hy2+1,-1.18);
    else if(aw==='scythe')wpn.scythe(x,hx2,hy2+2,-1.3);else if(aw==='whip')wpn.whip(x,hx2,hy2,-.7,ac);
    drawFront();
    if(o.weapon2==='axe')wpn.axe(x,hx2-2,hy2+1,-1.4,o.axeCol);
    cdot(x,hx2,hy2,3,sk?bone:skin);x.strokeStyle=OUT;x.lineWidth=.8;x.beginPath();x.arc(hx2,hy2,3,0,6.3);x.stroke()}
  // --- cabeza ---
  const hk=o.headKind||'human';
  if(o.hairLong&&o.hair)_hair(x,o.hair,hx,hy,hr,1);
  const hl=o.helm;
  if(hl==='hood'){const hc=o.hoodCol||cl;solid(x,pSmooth([[hx-hr-4,hy+3],[hx-hr-2,hy-hr-3],[hx+1,hy-hr-6],[hx+hr+3,hy-hr],[hx+hr+3,hy+6],[hx,hy+hr+8],[hx-hr-3,hy+hr+6]]),hc,{d:2})}
  sCap(x,hx-1,sh-2,hx-.5,hy+4,hr*.8,hr*.7,sk?bone:(hk==='lizard'||hk==='frog'?shade(skin,-.12):shade(skin,-.15)),{d:.8});
  if(o.ears==='elf'){for(const k of[-1,1])sPoly(x,[[hx+k*(hr-1),hy-1.5],[hx+k*(hr+8),hy-5.5],[hx+k*(hr-.5),hy+2.5]],skin,{d:.8,lw:1})}
  if(o.ears==='gob'){for(const k of[-1,1])sPoly(x,[[hx+k*(hr-1),hy-2],[hx+k*(hr+11),hy-9],[hx+k*(hr+8),hy-1],[hx+k*(hr-1),hy+3]],skin,{d:1,lw:1})}
  if(sk){ // calavera
    sEll(x,hx,hy-.5,hr*1.02,hr*1.05,'#ece8d4',{d:1.8});sPoly(x,[[hx-4.5,hy+4],[hx+4.5,hy+4],[hx+3.5,hy+9],[hx-3.5,hy+9]],'#e0dcc6',{d:.8,lw:1});
    sEll(x,hx-2.9,hy-1,2.1,2.5,'#140c14',{d:0,lw:.6});sEll(x,hx+3,hy-1,2.1,2.5,'#140c14',{d:0,lw:.6});
    if(o.glow){cdot(x,hx-2.9,hy-1,1.2,o.glow);cdot(x,hx+3,hy-1,1.2,o.glow);x.fillStyle=rg(x,hx,hy-1,1,9,[ca(o.glow,.16),ca(o.glow,0)]);x.fillRect(hx-10,hy-10,20,20)}
    poly(x,[[hx-.6,hy+2],[hx+1,hy+2],[hx+.2,hy+4]],'#140c14');x.strokeStyle='#4a4030';x.lineWidth=.8;x.beginPath();for(let i=-3;i<=3;i+=1.5){x.moveTo(hx+i,hy+5.4);x.lineTo(hx+i,hy+8.6)}x.stroke()}
  else if(hk==='frog'){
    sEll(x,hx,hy+.5,hr*1.28,hr*.95,skin,{d:1.8});sEll(x,hx,hy+3.6,hr*1.05,hr*.5,shade(skin,.28),{d:.8,lw:.7});
    for(const k of[-1,1]){sEll(x,hx+k*5,hy-5.4,3.4,3.4,skin,{d:1.2});eye(x,hx+k*5,hy-5.4,2.2,'#fff3a0','#111',mood,'#e8a010')}
    cline(x,[[hx-hr*1.1,hy+3],[hx-2,hy+5.6],[hx+hr*1.1,hy+2.6]],'#2a1a10',1.2);cdot(x,hx-1.4,hy-.4,.7,'#2a1a10');cdot(x,hx+2.6,hy-.4,.7,'#2a1a10');
    for(let i=0;i<3;i++)cdot(x,hx-5+i*5,hy-1.5+i%2*2.4,.9,shade(skin,-.3))}
  else if(hk==='lizard'){
    sEll(x,hx+1,hy,hr*.95,hr*.88,skin,{d:1.6});sPoly(x,[[hx+3,hy-4],[hx+16,hy-1.4],[hx+17,hy+2.4],[hx+13,hy+5.4],[hx+2,hy+5]],skin,{d:1.6});
    cline(x,[[hx+4,hy+3.6],[hx+15,hy+2.4]],'#2a1a10',1);for(let i=0;i<3;i++)poly(x,[[hx+8+i*2.8,hy+2.8],[hx+9.2+i*2.8,hy+5],[hx+10.4+i*2.8,hy+2.6]],'#fff',null);
    cdot(x,hx+14.5,hy-.4,.8,'#2a1a10');eye(x,hx+4.2,hy-2.4,2,'#ffe060','#111',1.5>mood?1:mood);
    for(let i=0;i<4;i++)poly(x,[[hx-6+i*2.4,hy-hr*.8+i*.4],[hx-5+i*2.4,hy-hr-4+i*.2],[hx-3+i*2.4,hy-hr*.8+i*.4]],o.frill||shade(skin,-.25),OUT,.7)}
  else if(hk==='orc'){
    sEll(x,hx,hy-.5,hr*1.1,hr,skin,{d:1.8});sPoly(x,[[hx-hr*1.05,hy+1.5],[hx+hr*1.1,hy+1.5],[hx+hr*.9,hy+hr*.95],[hx,hy+hr*1.2],[hx-hr*.9,hy+hr*.95]],shade(skin,-.08),{d:1.2});
    sPoly(x,[[hx-hr*.7,hy+1.8],[hx-hr*.5,hy-4.6],[hx-hr*.3,hy+1.8]],'#f2eed4',{d:.4,lw:.9});sPoly(x,[[hx+hr*.3,hy+1.8],[hx+hr*.5,hy-4.6],[hx+hr*.7,hy+1.8]],'#f2eed4',{d:.4,lw:.9});
    cline(x,[[hx-hr*.6,hy+3.6],[hx,hy+2.8],[hx+hr*.6,hy+3.6]],'#2a1010',1);
    if(o.cyclops){eye(x,hx+.6,hy-2,3.6,'#fff6c0',o.eyeCol||'#d01010',1);brow(x,hx+.6,hy-6.6,9,1,'#2a1a10',1)}else{x.fillStyle='rgba(15,5,5,.5)';x.fillRect(hx-hr,hy-4.5,hr*2,2.4);eye(x,hx-2.6,hy-2,1.7,'#ffe6a0',o.eyeCol||'#d01010',o.zombie?3:1,o.zombie?'#a0a820':null);eye(x,hx+3.4,hy-2,1.7,'#ffe6a0',o.eyeCol||'#d01010',o.zombie?3:1,o.zombie?'#a0a820':null)}
    poly(x,[[hx-.2,hy],[hx+1.6,hy+1.6],[hx-1.4,hy+1.6]],shade(skin,-.35))}
  else{
    sEll(x,hx,hy-.4,hr,hr*1.06,skin,{d:1.7});
    if(o.hair&&o.hair!=='none'&&!hl){x.save();x.beginPath();x.ellipse(hx,hy-.4,hr,hr*1.06,0,0,6.3);x.clip();solid(x,pSmooth([[hx-hr-2,hy-hr*.4],[hx-hr*.4,hy-hr*1.3],[hx+hr+1,hy-hr*.7],[hx+hr*.5,hy-hr*.2],[hx-hr*.2,hy-hr*.6],[hx-hr*.8,hy+1]]),o.hair,{d:1.4,lw:.9});x.restore()}
    else if(o.hair&&o.hair!=='none'){x.save();x.beginPath();x.ellipse(hx,hy-.4,hr,hr*1.06,0,0,6.3);x.clip();solid(x,_P([[hx-hr-1,hy-hr*.2],[hx-hr*.4,hy-hr*.9],[hx+hr+1,hy-hr*.4],[hx+hr+1,hy-hr*1.5],[hx-hr-1,hy-hr*1.5]]),o.hair,{d:1,lw:.7});x.restore()}
    // cara
    const e1=hx-2.7,e2=hx+3.3,ey=hy-.3,er=o.eyeR||1.9;
    eye(x,e1,ey,er,'#fff',o.pupil||'#1a1210',mood,o.eyeCol&&o.eyeCol);eye(x,e2,ey,er,'#fff',o.pupil||'#1a1210',mood,o.eyeCol);
    brow(x,e1,ey-3.4,5,mood,o.hair&&o.hair!=='none'?shade(o.hair,-.3):'#2a1a14',-1);brow(x,e2,ey-3.4,5,mood,o.hair&&o.hair!=='none'?shade(o.hair,-.3):'#2a1a14',1);
    poly(x,[[hx+.4,hy+.6],[hx+2.4,hy+2.8],[hx-.3,hy+3]],shade(skin,-.22));
    if(o.fangs){cline(x,[[hx-2.4,hy+4.6],[hx+3.4,hy+4.6]],'#2a0a10',1.2);poly(x,[[hx-1.6,hy+4.8],[hx-.8,hy+7.2],[hx-.1,hy+4.8]],'#fff',OUT,.5);poly(x,[[hx+1.4,hy+4.8],[hx+2.2,hy+7.2],[hx+2.9,hy+4.8]],'#fff',OUT,.5)}
    else if(o.grin){x.fillStyle='#2a0a10';x.beginPath();x.moveTo(hx-3.4,hy+4);x.quadraticCurveTo(hx+.4,hy+8,hx+4.2,hy+4);x.closePath();x.fill();x.fillStyle='#fff';for(let i=0;i<4;i++)x.fillRect(hx-2.6+i*1.8,hy+4.1,1.1,1.5)}
    else if(mood===3){cline(x,[[hx-2,hy+5.2],[hx+.4,hy+4.2],[hx+3,hy+5.2]],'#7a2a22',1)}
    else cline(x,[[hx-2.4,hy+4.6],[hx+.6,hy+(mood===1?4.2:5.4)],[hx+3.4,hy+4.6]],'#7a2a22',1.05);
    if(o.blush)cdot(x,hx+4.6,hy+3,1.7,'rgba(255,120,130,.35)');
    if(o.eyepatch){cline(x,[[hx-hr,hy-4],[hx+hr,hy-1.5]],'#1a1218',1);sEll(x,hx-2.7,hy-.3,2.7,2.5,'#1a1218',{d:0,lw:.5})}
    if(o.tusks){poly(x,[[hx-3.4,hy+4.6],[hx-2.6,hy+.4],[hx-1.2,hy+4.6]],'#f4f0d8',OUT,.7);poly(x,[[hx+2.6,hy+4.6],[hx+3.6,hy+.4],[hx+5,hy+4.6]],'#f4f0d8',OUT,.7)}
    if(o.beard){const b=o.beard,p=pSmooth([[hx-hr,hy+1],[hx+hr,hy+1],[hx+hr*.95,hy+hr*1.4],[hx+2,hy+hr*2.6+(dw?5:0)],[hx-2,hy+hr*2.4+(dw?5:0)],[hx-hr*.9,hy+hr*1.4]]);solid(x,p,b,{d:1.5});
      cline(x,[[hx-3,hy+hr*.7],[hx-2,hy+hr*1.9]],shade(b,-.4),.8);cline(x,[[hx+3,hy+hr*.7],[hx+2.6,hy+hr*1.9]],shade(b,-.4),.8);
      x.save();x.beginPath();x.rect(hx-4,hy+3.6,9,2);x.clip();x.restore();cline(x,[[hx-3,hy+3.4],[hx,hy+4.2],[hx+3.6,hy+3.2]],shade(b,.15),1.6);
      eye(x,e1,ey,er,'#fff',o.pupil||'#1a1210',mood,o.eyeCol)}
  }
  // --- casco / tocado ---
  const hc2=o.helmCol||'#aeb6c8',pl=o.plume;
  if(hl==='great'){
    if(pl){const p=new Path2D();p.moveTo(hx-2,hy-hr-1);p.bezierCurveTo(hx-8,hy-hr-12,hx-18,hy-hr-6,hx-20,hy-hr+8);p.bezierCurveTo(hx-12,hy-hr+1,hx-6,hy-hr+2,hx+2,hy-hr+1);p.closePath();solid(x,p,pl,{d:1.6})}
    solid(x,pSmooth([[hx-hr-1.4,hy],[hx-hr+1,hy-hr-1.4],[hx+1,hy-hr-3],[hx+hr+.4,hy-hr],[hx+hr+1.5,hy+1],[hx+hr,hy+hr+1.5],[hx,hy+hr+3],[hx-hr,hy+hr+1.5]]),hc2,{d:1.8});
    x.fillStyle='#10080e';x.fillRect(hx-hr-.6,hy-2.4,hr*2+1.2,2.6);x.fillStyle=o.visor||'rgba(255,230,160,.75)';x.fillRect(hx-3.8,hy-1.8,2.6,1.2);x.fillRect(hx+2.2,hy-1.8,2.6,1.2);
    cline(x,[[hx+.2,hy-hr-2],[hx+.2,hy+hr+1.5]],shade(hc2,-.45),1);for(let i=0;i<3;i++)cdot(x,hx+3+i*1.8,hy+4,.55,'#241a22');
    sPoly(x,[[hx-1,hy-hr-3.2],[hx+1.6,hy-hr-3.2],[hx+1.6,hy-hr-1],[hx-1,hy-hr-1]],trim,{d:.4,lw:.7})}
  else if(hl==='kettle'){sEll(x,hx,hy-3.8,hr+5.4,2.8,hc2,{d:1.2});solid(x,pSmooth([[hx-hr-.6,hy-3.4],[hx-hr*.7,hy-hr-2],[hx+1,hy-hr-4.2],[hx+hr*.8,hy-hr-1.8],[hx+hr+.6,hy-3.4]]),hc2,{d:1.6});
    if(pl)for(let i=0;i<3;i++)cline(x,[[hx+1,hy-hr-4],[hx-7-i*2.4,hy-hr-9+i*3.6]],i%2?shade(pl,-.2):pl,2.2);sPoly(x,[[hx-1,hy-hr-2],[hx+1.4,hy-hr-2],[hx+1.4,hy-4.6],[hx-1,hy-4.6]],trim,{d:.3,lw:.6})}
  else if(hl==='nasal'||hl==='dwarf'){solid(x,pSmooth([[hx-hr-1.2,hy-1],[hx-hr+.6,hy-hr-1.6],[hx+1,hy-hr-3.4],[hx+hr-.2,hy-hr-1],[hx+hr+1.2,hy-1],[hx+hr,hy-2.4],[hx-hr,hy-2.4]]),hc2,{d:1.6});
    sPoly(x,[[hx-.8,hy-3],[hx+1.6,hy-3],[hx+1.9,hy+3.2],[hx-.4,hy+3.2]],shade(hc2,.1),{d:.4,lw:.8});
    if(hl==='dwarf'){sPoly(x,[[hx+hr-3,hy-hr-.4],[hx+hr+2,hy-hr+1],[hx+hr+2,hy-hr+4],[hx+hr-3,hy-hr+4]],'#f0c040',{d:.7});cdot(x,hx+hr,hy-hr+2.4,1.8,'#fff6b0');}
    if(pl)for(let i=0;i<3;i++)cline(x,[[hx,hy-hr-3],[hx-5-i*2,hy-hr-9+i*3]],i%2?shade(pl,-.2):pl,2.2)}
  else if(hl==='horns'||hl==='spiked'){solid(x,pSmooth([[hx-hr-1.2,hy-.4],[hx-hr+.4,hy-hr-1.4],[hx+1,hy-hr-3],[hx+hr,hy-hr-1.2],[hx+hr+1.2,hy-.4],[hx+hr-.4,hy-3.8],[hx-hr+.4,hy-3.8]]),o.helmCol||'#7a7a86',{d:1.5});
    for(const k of[-1,1]){const p=new Path2D();p.moveTo(hx+k*(hr-.4),hy-hr+1);p.quadraticCurveTo(hx+k*(hr+8),hy-hr-1,hx+k*(hr+7),hy-hr-11);p.quadraticCurveTo(hx+k*(hr+3.5),hy-hr-4,hx+k*(hr-4),hy-hr-1);p.closePath();solid(x,p,o.hornCol||'#ece0c0',{d:1.1,lw:1.1})}}
  else if(hl==='hood'){const hc=o.hoodCol||cl;x.save();x.beginPath();x.ellipse(hx+1.6,hy+1,hr*.8,hr*.9,0,0,6.3);x.clip();x.fillStyle='rgba(8,4,14,.55)';x.fillRect(hx-8,hy-9,10,20);x.restore();
    const p=new Path2D();p.moveTo(hx-hr-4,hy+7);p.quadraticCurveTo(hx-hr-5,hy-hr-4,hx+2,hy-hr-4.6);p.quadraticCurveTo(hx+hr+4,hy-hr-2,hx+hr+3,hy+5);p.quadraticCurveTo(hx+hr+1.4,hy-hr+1,hx+1,hy-hr+.4);p.quadraticCurveTo(hx-hr-1,hy-hr+2,hx-hr+.4,hy+6);p.closePath();solid(x,p,hc,{d:1.5})}
  else if(hl==='hat'){solid(x,pSmooth([[hx-hr-3,hy-hr+1],[hx-hr+2,hy-hr-9],[hx-1,hy-hr-19],[hx+8,hy-hr-24],[hx+11,hy-hr-18],[hx+4,hy-hr-12],[hx+hr+1,hy-hr+1]]),cl,{d:2});
    sEll(x,hx,hy-hr+1.6,hr+8,3.2,shade(cl,-.12),{d:1.4});solid(x,_P([[hx-hr-1.4,hy-hr-.2],[hx+hr+1.4,hy-hr-.2],[hx+hr+1.4,hy-hr-3.2],[hx-hr-1.4,hy-hr-3.2]]),trim,{d:.6,lw:.8});sEll(x,hx+3,hy-hr-1.8,1.5,1.5,shade(trim,.4),{d:0,lw:.6})}
  else if(hl==='mitre'){solid(x,_P([[hx-hr-.4,hy-hr+1],[hx-hr+.4,hy-hr-4],[hx-2,hy-hr-14],[hx+2.6,hy-hr-16],[hx+hr-.4,hy-hr-4],[hx+hr+.4,hy-hr+1]]),cl,{d:1.8});
    x.fillStyle=trim;x.fillRect(hx-.6,hy-hr-13,2.2,9);x.fillRect(hx-3.4,hy-hr-9.6,7.8,2.2);sEll(x,hx,hy-hr+.4,hr+.6,1.6,trim,{d:.4,lw:.7})}
  else if(hl==='crown'){solid(x,_P([[hx-hr+.4,hy-hr+1.4],[hx-hr+.4,hy-hr-6],[hx-hr*.4,hy-hr-1.4],[hx,hy-hr-7.8],[hx+hr*.4,hy-hr-1.4],[hx+hr-.4,hy-hr-6],[hx+hr-.4,hy-hr+1.4]]),GOLD,{d:1.2});cdot(x,hx,hy-hr-.2,1.1,'#e83a4a')}
  else if(hl==='leaf'){for(let i=0;i<5;i++){const a=-2.5+i*.62,px=hx+Math.cos(a)*(hr+.6),py=hy+Math.sin(a)*(hr+.4)-1;x.save();x.translate(px,py);x.rotate(a+1.57);solid(x,pSmooth([[0,0],[2.2,-3.4],[0,-8],[-2.2,-3.4]]),i%2?'#6ac85a':'#4aa046',{d:.8,lw:.9});x.restore()}
    cdot(x,hx+3,hy-hr-1.6,1.8,'#ff9ac0')}
  else if(hl==='bandana'){solid(x,pSmooth([[hx-hr-1,hy-1.4],[hx-hr+.5,hy-hr-.5],[hx+1,hy-hr-1.8],[hx+hr,hy-hr-.2],[hx+hr+1,hy-1.4],[hx+hr-1,hy-3.6],[hx-hr+1,hy-3.6]]),o.bandCol||'#c02a2a',{d:1.2});
    solid(x,_P([[hx-hr-.4,hy-3],[hx-hr-9,hy-2],[hx-hr-6,hy+2],[hx-hr-1,hy-.6]]),o.bandCol||'#c02a2a',{d:.8})}
  else if(hl==='tricorn'){const p=new Path2D();p.moveTo(hx-hr-9,hy-hr+2);p.quadraticCurveTo(hx-2,hy-hr-12,hx+hr+9,hy-hr+2);p.quadraticCurveTo(hx+2,hy-hr-1,hx-hr-9,hy-hr+2);p.closePath();solid(x,p,o.hatCol||'#3a2a2a',{d:1.6});
    solid(x,pSmooth([[hx-hr,hy-hr+1],[hx-hr+2,hy-hr-6],[hx+hr-2,hy-hr-6],[hx+hr,hy-hr+1]]),shade(o.hatCol||'#3a2a2a',.08),{d:1.4});cline(x,[[hx-hr-8,hy-hr+1.6],[hx+hr+8,hy-hr+1.6]],trim,1.2);
    const f=new Path2D();f.moveTo(hx+hr-1,hy-hr-2);f.quadraticCurveTo(hx+hr+8,hy-hr-12,hx+hr+3,hy-hr-15);f.quadraticCurveTo(hx+hr+4,hy-hr-8,hx+hr-3,hy-hr-4);f.closePath();solid(x,f,'#e8e0d0',{d:.8})}
  else if(hl==='cap'){solid(x,pSmooth([[hx-hr-1,hy-1.4],[hx-hr+.5,hy-hr-.8],[hx+1,hy-hr-3],[hx+hr+1,hy-hr-1.6],[hx+hr+9,hy-hr+3],[hx+hr+1,hy-2.4]]),o.capCol||'#7a5a3a',{d:1.4});}
  else if(hl==='lamp'){}
  else if(hl==='halo'){x.save();x.strokeStyle='rgba(255,236,140,.95)';x.lineWidth=2.6;x.beginPath();x.ellipse(hx,hy-hr-4.4,9.6,3.2,0,0,6.3);x.stroke();x.strokeStyle='#fff8d0';x.lineWidth=1;x.stroke();x.restore()}
  if(o.helm2==='halo'){x.save();x.strokeStyle='rgba(255,236,140,.95)';x.lineWidth=2.6;x.beginPath();x.ellipse(hx,hy-hr-4.4,9.6,3.2,0,0,6.3);x.stroke();x.strokeStyle='#fff8d0';x.lineWidth=1;x.stroke();x.restore()}
  x.restore();
}
// ---------- cuadrúpedos ----------
const _gh='#241a1e';
function pata(x,hx,hy,kx,ky,ax,ay,w,col,kind){
  sLimb(x,[[hx,hy,w],[kx,ky,w*.84],[ax,ay,w*.56]],col);
  if(kind==='hoof')sPoly(x,[[ax-2.6,ay-1],[ax+2.6,ay-1],[ax+3.4,ay+3.4],[ax-3.4,ay+3.4]],_gh,{d:.7,hl:'#5a4a52'});
  else{sEll(x,ax+2,ay+1,w*.62,w*.38,shade(col,-.12),{d:.8});for(let i=0;i<3;i++)poly(x,[[ax+3.4+i*1.8,ay+1.4],[ax+5.4+i*1.8,ay+2.8],[ax+3.2+i*1.8,ay+2.8]],'#eee6cc',OUT,.45)}}
function quadSetup(x,o,r){x.save();const sc=o.sc||1;x.translate(48+(o.dx||0),88);x.scale(sc,sc);x.translate(-48,-88);if(!o.noShadow)shadowE(x,48,89,r||32,6,.45)}
function horse(x,o){
  const cx=48,by=88,c=o.c,dk=shade(c,-.3),mn=o.mane||shade(c,-.55),ac=o.acc||GOLD;quadSetup(x,o,36);
  // cola
  {const t=new Path2D();t.moveTo(cx-24,by-43);t.bezierCurveTo(cx-40,by-44,cx-44,by-28,cx-38,by-12);t.bezierCurveTo(cx-37,by-26,cx-32,by-34,cx-23,by-33);t.closePath();solid(x,t,mn,{d:1.6})}
  pata(x,cx-12,by-30,cx-15,by-17,cx-11,by-4,8,dk,'hoof');
  pata(x,cx+12,by-31,cx+25,by-26,cx+20,by-13,7.6,dk,'hoof');
  const body=pSmooth([[cx-28,by-44],[cx-16,by-52],[cx+4,by-51],[cx+19,by-47],[cx+24,by-34],[cx+12,by-24],[cx-6,by-24],[cx-26,by-30]]);
  solid(x,body,c,{d:2.4});
  x.save();x.clip(body);sEll(x,cx-1,by-27,20,5,o.belly||shade(c,.14),{d:0,lw:0});x.restore();
  pata(x,cx-20,by-33,cx-27,by-20,cx-22,by-4,9,c,'hoof');
  pata(x,cx+15,by-31,cx+15,by-17,cx+14,by-4,8,shade(c,-.05),'hoof');
  if(o.bard){const b=pSmooth([[cx-27,by-46],[cx-6,by-50],[cx+16,by-47],[cx+18,by-30],[cx+11,by-19],[cx+4,by-27],[cx-4,by-18],[cx-12,by-27],[cx-20,by-17],[cx-27,by-31]]);solid(x,b,o.bard,{d:2});
    x.save();x.clip(b);x.strokeStyle=o.up?GOLD:ac;x.lineWidth=2;x.beginPath();x.moveTo(cx-27,by-24);for(let i=0;i<7;i++){x.lineTo(cx-24+i*7,by-19-((i+1)%2)*5)}x.stroke();x.restore();
    sPoly(x,[[cx-8,by-36],[cx-2,by-40],[cx+4,by-36],[cx-2,by-31]],o.up?GOLD:ac,{d:.8,lw:.9})
    if(o.up){sPoly(x,[[cx+14,by-48],[cx+22,by-52],[cx+25,by-40],[cx+17,by-34]],GOLD,{d:1.2});sPoly(x,[[cx+13,by-30],[cx+20,by-31],[cx+19,by-24],[cx+12,by-24]],GOLD,{d:.8})}}
  if(o.noHead){x.restore();return}
  // cuello
  const neck=pSmooth([[cx+8,by-52],[cx+16,by-70],[cx+27,by-74],[cx+31,by-62],[cx+24,by-46],[cx+16,by-40]]);
  // crin
  {const m=new Path2D();m.moveTo(cx+14,by-74);for(let i=0;i<6;i++){m.quadraticCurveTo(cx+10-i*1.2-3,by-69+i*4.6,cx+8-i*1.6,by-66+i*4.7)}m.lineTo(cx+14,by-48);m.closePath();solid(x,m,mn,{d:1.4})}
  solid(x,neck,c,{d:2});
  if(o.bard){sPoly(x,[[cx+17,by-70],[cx+27,by-73],[cx+30,by-62],[cx+22,by-60]],o.bard,{d:1.2})}
  // cabeza
  const hd=pSmooth([[cx+21,by-73],[cx+30,by-78],[cx+37,by-70],[cx+43,by-58],[cx+43,by-53],[cx+37,by-52],[cx+29,by-58],[cx+22,by-63]]);
  solid(x,hd,c,{d:1.8});sEll(x,cx+40,by-55,4.4,3.2,shade(c,.12),{d:.8,lw:.9,ol:shade(c,-.5)});cdot(x,cx+41,by-55.4,.9,'#3a2024');
  sPoly(x,[[cx+23,by-76],[cx+25,by-85],[cx+29,by-77]],c,{d:.8});sPoly(x,[[cx+24,by-77],[cx+25.4,by-82],[cx+27,by-77.4]],'#d8a0a0',{d:0,lw:0});
  eye(x,cx+31,by-68,2,o.eyeGlow?'#ffe0a0':'#fff6e0',o.eyeGlow?'#e01010':'#2a1a14',o.eyeGlow?1:0,o.eyeGlow?'#ff6a20':'#7a4a22');
  cline(x,[[cx+38,by-52.4],[cx+32,by-53.4]],'rgba(40,10,16,.7)',.9);
  if(o.bard){sPoly(x,[[cx+29,by-76],[cx+38,by-70],[cx+36,by-62],[cx+27,by-66]],shade(o.bard,.1),{d:1.2});sPoly(x,[[cx+31,by-79],[cx+33,by-87],[cx+35,by-76]],ac,{d:.6});if(o.up){for(let i=0;i<3;i++)cline(x,[[cx+32,by-80],[cx+26-i*3,by-88+i*2]],i%2?'#fff4b0':GOLD,2)}}
  if(o.horn){x.save();x.translate(cx+30,by-76);x.rotate(.35);const hp=_P([[-2.6,0],[0,-17],[2.6,0]]);solid(x,hp,'#fff4c0',{d:1,hl:'#fff',sh:'#e0b848'});x.strokeStyle='rgba(180,130,30,.5)';x.lineWidth=.8;for(let i=1;i<5;i++){x.beginPath();x.moveTo(-2.4+i*.3,-i*3.2);x.lineTo(2.4-i*.3,-i*3.2+1.6);x.stroke()}x.restore()}
  x.restore();
}
function wolf(x,o){
  const cx=48,by=88,c=o.c,c2=o.c2||shade(c,.35),dk=shade(c,-.3);o.dx=-6;quadSetup(x,o,34);
  // cola
  {const t=new Path2D();t.moveTo(cx-24,by-36);t.bezierCurveTo(cx-40,by-40,cx-46,by-22,cx-42,by-12);t.bezierCurveTo(cx-38,by-20,cx-32,by-26,cx-22,by-28);t.closePath();solid(x,t,dk,{d:1.6});cline(x,[[cx-38,by-32],[cx-42,by-22]],c2,1.2)}
  pata(x,cx-12,by-26,cx-20,by-14,cx-14,by-3,8,dk);
  pata(x,cx+14,by-26,cx+22,by-17,cx+18,by-3,7,dk);
  const body=pSmooth([[cx-28,by-34],[cx-16,by-45],[cx+2,by-47],[cx+16,by-43],[cx+22,by-32],[cx+10,by-23],[cx-8,by-24],[cx-26,by-24]]);solid(x,body,c,{d:2.2});
  x.save();x.clip(body);sEll(x,cx,by-23,22,6,c2,{d:0,lw:0});for(let i=0;i<7;i++)poly(x,[[cx-24+i*5.4,by-42+Math.abs(i-3)*1.2],[cx-22+i*5.4,by-50+Math.abs(i-3)],[cx-19+i*5.4,by-42]],shade(c,.12),null);x.restore();
  pata(x,cx-18,by-28,cx-27,by-14,cx-22,by-3,9,c);
  pata(x,cx+16,by-27,cx+18,by-14,cx+14,by-3,8,shade(c,-.06));
  // pelo del lomo
  for(let i=0;i<6;i++)poly(x,[[cx-22+i*6,by-43],[cx-20+i*6,by-52-(o.spiky?4:0)+(i>3?2:0)],[cx-16+i*6,by-44]],dk,OUT,.8);
  sPoly(x,[[cx+14,by-44],[cx+24,by-30],[cx+30,by-38],[cx+24,by-48]],c,{d:1.4,lw:0});
  // cabeza
  const hd=pSmooth([[cx+20,by-50],[cx+30,by-54],[cx+38,by-47],[cx+48,by-42],[cx+47,by-37],[cx+38,by-35],[cx+28,by-34],[cx+20,by-38]]);
  sPoly(x,[[cx+22,by-52],[cx+21,by-63],[cx+28,by-54]],dk,{d:.8});sPoly(x,[[cx+28,by-54],[cx+30,by-64],[cx+35,by-52]],c,{d:.8});sPoly(x,[[cx+29,by-54],[cx+30,by-60],[cx+33,by-53]],'#d09090',{d:0,lw:0});
  solid(x,hd,c,{d:1.8});sPoly(x,[[cx+34,by-40],[cx+48,by-40],[cx+47,by-37],[cx+38,by-35],[cx+30,by-35]],c2,{d:.8,lw:0});
  cdot(x,cx+47,by-42,1.6,'#1a1014');cline(x,[[cx+46,by-38.2],[cx+37,by-39.4],[cx+32,by-37.5]],'#2a0a12',1);
  poly(x,[[cx+44,by-38.4],[cx+45.4,by-34.6],[cx+46.4,by-38.2]],'#fff',OUT,.5);poly(x,[[cx+38,by-39.2],[cx+39.4,by-35.8],[cx+40.4,by-39.2]],'#fff',OUT,.5);
  eye(x,cx+35,by-46,1.8,o.eyeGlow?'#ffe090':'#ffe8a0',o.eyeGlow?'#e00':'#241008',1,o.eyeGlow?'#ff5020':'#e0a020');brow(x,cx+35,by-49.4,5,1,dk,1);
  x.restore();
}
function bear(x,o){
  const cx=48,by=88,c=o.c,dk=shade(c,-.3);quadSetup(x,o,34);
  pata(x,cx-10,by-26,cx-14,by-14,cx-10,by-3,12,dk,'paw');pata(x,cx+14,by-26,cx+16,by-14,cx+16,by-3,11,dk,'paw');
  const body=pSmooth([[cx-28,by-30],[cx-18,by-50],[cx-2,by-60],[cx+14,by-52],[cx+24,by-40],[cx+20,by-22],[cx+2,by-18],[cx-22,by-19]]);solid(x,body,c,{d:2.6});
  x.save();x.clip(body);for(let i=0;i<8;i++)cline(x,[[cx-24+i*6,by-30-(i%3)*5],[cx-22+i*6,by-24-(i%3)*5]],shade(c,-.35),.9);x.restore();
  pata(x,cx-22,by-27,cx-27,by-14,cx-22,by-3,13,c,'paw');pata(x,cx+8,by-27,cx+10,by-14,cx+8,by-3,12,shade(c,-.05),'paw');
  sEll(x,cx+30,by-44,12,11,c,{d:2});sEll(x,cx+31,by-52,5,4.4,c,{d:.8});sEll(x,cx+22,by-54,4.2,4,c,{d:.8});sEll(x,cx+22,by-54,2,1.8,'#c07a6a',{d:0,lw:0});
  sEll(x,cx+40,by-42,7,5.4,shade(c,.22),{d:1.2});sEll(x,cx+44,by-45,2,1.7,'#150d0f',{d:0,lw:0});cline(x,[[cx+46,by-38.4],[cx+37,by-38.2]],'#2a0a0e',1);
  poly(x,[[cx+38,by-38.2],[cx+39.2,by-35],[cx+40.2,by-38.2]],'#fff',OUT,.5);
  eye(x,cx+34,by-48,1.8,'#ffe6b0','#200c06',1,'#a05a20');brow(x,cx+34,by-51.4,5.4,1,dk,1);
  x.restore();
}
function boar(x,o){
  const cx=48,by=88,c=o.c,dk=shade(c,-.3);quadSetup(x,o,32);
  {const t=new Path2D();t.moveTo(cx-24,by-30);t.quadraticCurveTo(cx-34,by-36,cx-30,by-26);t.quadraticCurveTo(cx-28,by-30,cx-23,by-26);t.closePath();solid(x,t,dk,{d:.8})}
  pata(x,cx-10,by-22,cx-11,by-12,cx-9,by-4,8,dk,'hoof');pata(x,cx+14,by-22,cx+15,by-12,cx+14,by-4,7.4,dk,'hoof');
  const body=pSmooth([[cx-26,by-26],[cx-16,by-38],[cx,by-42],[cx+16,by-36],[cx+24,by-26],[cx+14,by-16],[cx-4,by-14],[cx-22,by-16]]);solid(x,body,c,{d:2.4});
  x.save();x.clip(body);for(let i=0;i<7;i++)poly(x,[[cx-24+i*6,by-34-(i<3?i*1:(6-i))],[cx-22+i*6,by-46+(i>3?i-3:0)*.6],[cx-18+i*6,by-36]],shade(c,-.45),null);x.restore();
  pata(x,cx-19,by-22,cx-22,by-12,cx-19,by-4,9,c,'hoof');pata(x,cx+8,by-22,cx+9,by-12,cx+8,by-4,8,shade(c,-.05),'hoof');
  sEll(x,cx+24,by-28,13,11,c,{d:2});
  sPoly(x,[[cx+22,by-37],[cx+21,by-46],[cx+28,by-38]],dk,{d:.7});
  sEll(x,cx+36,by-25,7.5,6,shade(c,.18),{d:1.2});sEll(x,cx+42,by-25,3.4,4.6,'#d89a90',{d:.9});cdot(x,cx+41.6,by-26.4,.8,'#3a1a1a');cdot(x,cx+42,by-23.6,.8,'#3a1a1a');
  for(const[a,b,s]of[[cx+33,by-24,1],[cx+30,by-22,.8]]){x.save();const p=new Path2D();p.moveTo(a,b+2);p.quadraticCurveTo(a+8*s,b+1,a+9*s,b-11);p.quadraticCurveTo(a+5*s,b-4,a-1,b-2);p.closePath();solid(x,p,'#f4f0d8',{d:.9,lw:1});x.restore()}
  eye(x,cx+29,by-32,1.7,'#ffe0b0','#200',1,'#c03020');brow(x,cx+29,by-35.2,4.6,1,dk,1);
  x.restore();
}
function rat(x,o){
  const cx=48,by=88,c=o.c,dk=shade(c,-.3);quadSetup(x,o,28);
  {x.save();x.lineCap='round';const t=()=>{x.beginPath();x.moveTo(cx-24,by-20);x.bezierCurveTo(cx-44,by-18,cx-38,by-34,cx-46,by-28);x.stroke()};x.strokeStyle=OUT;x.lineWidth=4;t();x.strokeStyle='#d8a09a';x.lineWidth=2.2;t();x.restore()}
  pata(x,cx-12,by-20,cx-16,by-11,cx-12,by-3,6,dk,'paw');pata(x,cx+12,by-20,cx+16,by-11,cx+16,by-3,5.6,dk,'paw');
  const body=pSmooth([[cx-26,by-18],[cx-14,by-30],[cx+4,by-31],[cx+18,by-24],[cx+14,by-14],[cx-4,by-11],[cx-22,by-11]]);solid(x,body,c,{d:2});
  pata(x,cx-18,by-18,cx-23,by-10,cx-19,by-3,7,c,'paw');pata(x,cx+8,by-18,cx+12,by-10,cx+12,by-3,6.4,shade(c,-.05),'paw');
  sPoly(x,[[cx+16,by-29],[cx+34,by-24],[cx+46,by-16],[cx+36,by-11],[cx+18,by-12]],c,{d:1.6});sEll(x,cx+45,by-16,2,1.8,'#e07a8a',{d:0,lw:.8});
  sEll(x,cx+19,by-35,6.4,6.6,'#e0a0a0',{d:1.2});sEll(x,cx+19,by-35,3.6,4,'#b86a7a',{d:0,lw:0});
  poly(x,[[cx+38,by-12],[cx+39.4,by-8],[cx+40.6,by-12.4]],'#fff4d0',OUT,.6);poly(x,[[cx+34,by-11.4],[cx+35.4,by-7.4],[cx+36.4,by-11.8]],'#fff4d0',OUT,.6);
  for(const k of[-3,3])cline(x,[[cx+42,by-17],[cx+52,by-18+k]],'rgba(255,255,255,.75)',.6);
  eye(x,cx+30,by-22,1.7,'#ffd0d0','#200',1,'#c02020');
  x.restore();
}
function cerberus(x,o){
  const cx=48,by=88,c=o.c,dk=shade(c,-.3),fc=o.flame||'#ff8a30';quadSetup(x,o,34);
  pata(x,cx-12,by-24,cx-18,by-13,cx-14,by-3,8,dk,'paw');pata(x,cx+12,by-24,cx+19,by-15,cx+17,by-3,7.4,dk,'paw');
  const body=pSmooth([[cx-28,by-30],[cx-16,by-40],[cx+2,by-42],[cx+16,by-40],[cx+20,by-26],[cx+8,by-18],[cx-10,by-19],[cx-26,by-21]]);solid(x,body,c,{d:2.4});
  pata(x,cx-18,by-25,cx-26,by-13,cx-21,by-3,9,c,'paw');pata(x,cx+14,by-24,cx+16,by-13,cx+12,by-3,8,shade(c,-.05),'paw');
  {const t=new Path2D();t.moveTo(cx-26,by-32);t.bezierCurveTo(cx-40,by-40,cx-44,by-26,cx-38,by-18);t.bezierCurveTo(cx-37,by-28,cx-32,by-30,cx-24,by-26);t.closePath();solid(x,t,dk,{d:1.4});}
  for(let i=0;i<6;i++)poly(x,[[cx-22+i*6,by-40],[cx-20+i*6,by-48-(i%2)*3],[cx-16+i*6,by-40]],o.up?fc:dk,OUT,.8);
  const heads=[[cx+20,by-68,-.35],[cx+28,by-36,.5],[cx+38,by-53,.05]];
  heads.forEach(([hx,hy,t],i)=>{const sx=cx+12,sy=by-40,f=bez([sx,sy],[sx+4,sy-8],[hx-8,hy+10],[hx-3,hy+2]);solid(x,ribbon(f,8,13,9),i===2?shade(c,.04):c,{d:1.4});
    x.save();x.translate(hx,hy);x.rotate(t);
    sPoly(x,[[-5,-6],[-6,-15],[1,-8]],dk,{d:.6});sEll(x,0,0,8.2,7,c,{d:1.4});sPoly(x,[[2,0],[15,2],[15,6],[7,8],[1,6]],shade(c,.12),{d:1.2});cdot(x,14.6,2.4,1.3,'#150a0e');
    cline(x,[[14,6.6],[7,6.2]],'#2a0a12',.9);poly(x,[[11,6.4],[12.2,9.6],[13,6.4]],'#fff',OUT,.4);
    eye(x,3,-2,1.9,'#ffe090','#e01010',1,'#ff5020');x.restore()});
  if(o.up)for(let i=0;i<3;i++){x.fillStyle=rg(x,cx+20+i*8,by-70+i*6,0,9,['rgba(255,240,150,.9)',ca(fc,.66),ca(fc,0)]);x.fillRect(cx+8+i*8,by-82+i*6,24,24)}
  x.restore();
}
// ---------- caballo con jinete / centauro ----------
function mounted(x,o){horse(x,o.h);x.save();x.translate(-4,-35.5);humanoid(x,Object.assign({mounted:1,noShadow:1,sc:.62,lean:2},o.r));x.restore()}
function griffin(x,o){
  const cx=48,by=88,c=o.c,c2=o.c2,fe=o.fe||'#f4ecd8',bk=o.beak||'#f0b838';x.save();shadowE(x,cx,by+1,30,6,.4);
  wingFeather(x,cx-6,by-50,40,shade(c2,-.12),-1,-.25);
  {const t=new Path2D();t.moveTo(cx-24,by-30);t.bezierCurveTo(cx-42,by-34,cx-44,by-14,cx-38,by-8);t.bezierCurveTo(cx-36,by-20,cx-30,by-24,cx-22,by-22);t.closePath();solid(x,t,c,{d:1.4});sEll(x,cx-39,by-9,4.6,5.6,c2,{d:1})}
  pata(x,cx-8,by-26,cx-13,by-14,cx-9,by-3,8,shade(c,-.3),'paw');pata(x,cx+14,by-27,cx+20,by-16,cx+17,by-3,6.6,shade(c,-.3),'paw');
  const body=pSmooth([[cx-28,by-32],[cx-14,by-44],[cx+4,by-46],[cx+18,by-40],[cx+20,by-28],[cx+8,by-20],[cx-10,by-21],[cx-26,by-22]]);solid(x,body,c,{d:2.4});
  x.save();x.clip(body);for(let i=0;i<5;i++){x.fillStyle=shade(c,.2);x.beginPath();x.arc(cx+14,by-42+i*5,5,Math.PI*.5,Math.PI*1.5);x.fill()}x.restore();
  pata(x,cx-20,by-27,cx-26,by-14,cx-21,by-3,9,c,'paw');
  // patas delanteras de águila
  sCap(x,cx+14,by-28,cx+20,by-14,7,5.6,shade(c2,.04));sCap(x,cx+20,by-14,cx+17,by-5,5,3.6,'#f0c850',{d:.8});for(let i=0;i<3;i++)poly(x,[[cx+13+i*2.4,by-4],[cx+14.6+i*2.4,by+.4],[cx+16+i*2.4,by-4]],'#fff4d0',OUT,.5);
  wingFeather(x,cx-2,by-50,44,shade(c2,.06),1,-1.3);
  // pecho con plumas + cuello
  const nk=pSmooth([[cx+8,by-42],[cx+14,by-60],[cx+24,by-66],[cx+28,by-56],[cx+22,by-40]]);solid(x,nk,c2,{d:1.8});
  for(let i=0;i<4;i++){x.save();x.clip(nk);x.fillStyle=shade(c2,.2);x.beginPath();x.arc(cx+18,by-44-i*5,4.4,0,3.1);x.fill();x.restore()}
  sEll(x,cx+24,by-66,9,8,fe,{d:1.7});sPoly(x,[[cx+19,by-72],[cx+17,by-82],[cx+25,by-74]],fe,{d:.7});sPoly(x,[[cx+23,by-73],[cx+24,by-83],[cx+30,by-73]],shade(fe,-.08),{d:.7});
  const bp=new Path2D();bp.moveTo(cx+28,by-71);bp.quadraticCurveTo(cx+42,by-70,cx+43,by-60);bp.quadraticCurveTo(cx+38,by-62,cx+31,by-61);bp.closePath();solid(x,bp,bk,{d:1.2});cline(x,[[cx+31,by-62.2],[cx+40,by-63.6]],'rgba(80,40,0,.6)',.8);
  eye(x,cx+27,by-67.5,2,'#fff8d0','#201000',1,'#e0a000');brow(x,cx+27,by-71.2,5,1,'#5a3a10',1);
  if(o.thunder){x.save();x.shadowColor='#fff';x.shadowBlur=4;cline(x,[[cx-30,by-84],[cx-24,by-72],[cx-30,by-68],[cx-22,by-54]],'#fffbb0',2);cline(x,[[cx+30,by-86],[cx+36,by-76],[cx+31,by-72],[cx+39,by-62]],'#fffbb0',1.6);x.restore()}
  x.restore();
}
function manticora(x,o){
  const cx=48,by=88,c=o.c,m=o.mane||'#8a2a22';x.save();shadowE(x,cx,by+1,32,6,.4);
  wingBat(x,cx-4,by-46,38,shade(o.w||'#7a2a2a',-.1),-1,{tilt:.1});
  // cola de escorpión
  x.save();x.lineCap='round';const tp=()=>{x.beginPath();x.moveTo(cx-24,by-34);x.bezierCurveTo(cx-46,by-38,cx-44,by-60,cx-30,by-62);x.stroke()};x.strokeStyle=OUT;x.lineWidth=7;tp();x.strokeStyle=shade(c,-.1);x.lineWidth=4.6;tp();x.restore();
  sPoly(x,[[cx-33,by-60],[cx-24,by-66],[cx-26,by-58]],'#f4f0d8',{d:.5,lw:.9});sEll(x,cx-31,by-62,3.6,3.2,'#c04a2a',{d:.7});
  pata(x,cx-8,by-26,cx-12,by-14,cx-8,by-3,8,shade(c,-.3),'paw');pata(x,cx+14,by-26,cx+18,by-15,cx+16,by-3,7,shade(c,-.3),'paw');
  const body=pSmooth([[cx-28,by-34],[cx-14,by-46],[cx+4,by-47],[cx+18,by-42],[cx+20,by-28],[cx+8,by-20],[cx-10,by-22],[cx-26,by-24]]);solid(x,body,c,{d:2.4});
  pata(x,cx-20,by-27,cx-26,by-14,cx-21,by-3,9,c,'paw');pata(x,cx+10,by-26,cx+12,by-14,cx+9,by-3,7.6,shade(c,-.05),'paw');
  wingBat(x,cx-2,by-46,40,shade(o.w||'#7a2a2a',.06),1,{tilt:-.45});
  sEll(x,cx+24,by-48,15,15,m,{d:2});for(let i=0;i<8;i++){const a=i*.8;poly(x,[[cx+24+Math.cos(a)*12,by-48+Math.sin(a)*12],[cx+24+Math.cos(a+.2)*18,by-48+Math.sin(a+.2)*18],[cx+24+Math.cos(a+.4)*12,by-48+Math.sin(a+.4)*12]],shade(m,.12),OUT,.8)}
  sEll(x,cx+26,by-48,9.4,9.8,'#f0cf9a',{d:1.6});sPoly(x,[[cx+22,by-60],[cx+18,by-69],[cx+27,by-61]],'#f0cf9a',{d:.5,lw:.9});
  eye(x,cx+23,by-49,2,'#fff4c0','#300',1,'#e02020');eye(x,cx+30.4,by-49,2,'#fff4c0','#300',1,'#e02020');brow(x,cx+23,by-53,5,1,'#4a1a10',-1);brow(x,cx+30.4,by-53,5,1,'#4a1a10',1);
  x.fillStyle='#2a0a10';x.beginPath();x.moveTo(cx+21,by-42);x.quadraticCurveTo(cx+26,by-37,cx+32,by-42);x.closePath();x.fill();for(let i=0;i<3;i++)poly(x,[[cx+22.4+i*3.4,by-42],[cx+23.6+i*3.4,by-38.6],[cx+24.8+i*3.4,by-42]],'#fff',null);
  x.restore();
}
function gargoyle(x,o){
  const cx=48,by=88,c=o.c,lava=o.lava,dk=shade(c,-.3);x.save();shadowE(x,cx,by+1,24,5,.4);
  wingBat(x,cx-3,by-46,42,shade(c,-.15),-1,{arm:shade(c,.3)});
  pata(x,cx-8,by-24,cx-14,by-14,cx-10,by-3,9,dk,'paw');
  {const t=new Path2D();t.moveTo(cx-8,by-26);t.bezierCurveTo(cx-30,by-24,cx-34,by-10,cx-24,by-5);t.bezierCurveTo(cx-26,by-14,cx-20,by-18,cx-6,by-20);t.closePath();solid(x,t,dk,{d:1.2});sPoly(x,[[cx-26,by-6],[cx-21,by-12],[cx-19,by-4]],c,{d:.6})}
  const body=pSmooth([[cx-14,by-44],[cx+4,by-52],[cx+14,by-40],[cx+14,by-24],[cx+2,by-18],[cx-12,by-22],[cx-16,by-34]]);solid(x,body,c,{d:2.2});
  x.save();x.clip(body);for(let i=0;i<4;i++)cline(x,[[cx-12,by-40+i*5],[cx+10,by-42+i*5]],shade(c,-.28),.9);x.restore();
  pata(x,cx+8,by-26,cx+16,by-15,cx+12,by-3,8,c,'paw');
  // brazos
  sCap(x,cx+6,by-44,cx+16,by-34,7,6,c);sCap(x,cx+16,by-34,cx+22,by-22,6,5,shade(c,.05));for(let i=0;i<3;i++)poly(x,[[cx+19+i*2,by-22],[cx+21+i*2,by-18],[cx+22+i*2,by-23]],'#eee6cc',OUT,.5);
  sEll(x,cx+8,by-56,9,8.6,c,{d:1.8});sPoly(x,[[cx+4,by-61],[cx-1,by-72],[cx+7,by-63]],'#d8d0c0',{d:.7});sPoly(x,[[cx+10,by-62],[cx+13,by-73],[cx+16,by-61]],'#e8e0d0',{d:.7});
  sPoly(x,[[cx+10,by-54],[cx+19,by-53],[cx+19,by-49],[cx+9,by-49]],shade(c,.1),{d:1,lw:1});
  const ec=lava?'#ffb030':'#ff5a30';eye(x,cx+6,by-58,1.9,'#ffe090',ec,1,ec);eye(x,cx+12.4,by-58,1.9,'#ffe090',ec,1,ec);brow(x,cx+6,by-61.4,5,1,dk,-1);brow(x,cx+12.4,by-61.4,5,1,dk,1);
  for(let i=0;i<3;i++)poly(x,[[cx+11+i*2.8,by-49.4],[cx+12.2+i*2.8,by-46],[cx+13.4+i*2.8,by-49.4]],'#fff',OUT,.4);
  if(lava){x.save();x.shadowColor='#ff8a20';x.shadowBlur=3;for(const q of[[[cx-8,by-40],[cx-2,by-34],[cx-6,by-26]],[[cx+2,by-46],[cx+6,by-38],[cx+3,by-30]]])cline(x,q,'#ffb040',1.2);x.restore()}
  wingBat(x,cx+6,by-46,40,shade(c,-.04),1,{arm:shade(c,.3),tilt:-.3});
  x.restore();
}
// ---------- cintas (cuellos, colas, tentáculos, serpientes) ----------
const bez=(a,b,c,d)=>t=>{const u=1-t;return[u*u*u*a[0]+3*u*u*t*b[0]+3*u*t*t*c[0]+t*t*t*d[0],u*u*u*a[1]+3*u*u*t*b[1]+3*u*t*t*c[1]+t*t*t*d[1]]};
function ribbon(f,n,w0,w1,wf){const L=[],R=[];for(let i=0;i<=n;i++){const t=i/n,p=f(t),q=f(Math.min(1,t+.02)),pp=f(Math.max(0,t-.02));let dx=q[0]-pp[0],dy=q[1]-pp[1];const l=Math.hypot(dx,dy)||1;dx/=l;dy/=l;const w=(wf?wf(t):w0+(w1-w0)*t)/2;L.push([p[0]-dy*w,p[1]+dx*w]);R.push([p[0]+dy*w,p[1]-dx*w])}
  const p=new Path2D();L.forEach((q,i)=>i?p.lineTo(q[0],q[1]):p.moveTo(q[0],q[1]));R.reverse().forEach(q=>p.lineTo(q[0],q[1]));p.closePath();return p}
// bandas transversales (escamas/vientre) sobre una cinta
function ribBands(x,f,n,w0,w1,col,from=0,to=1,lw=1){x.save();x.strokeStyle=col;x.lineWidth=lw;x.lineCap='round';for(let i=0;i<n;i++){const t=from+(to-from)*(i+.5)/n,p=f(t),q=f(Math.min(1,t+.02)),pp=f(Math.max(0,t-.02));let dx=q[0]-pp[0],dy=q[1]-pp[1];const l=Math.hypot(dx,dy)||1;dx/=l;dy/=l;const w=(w0+(w1-w0)*t)/2*.82;
    x.beginPath();x.moveTo(p[0]-dy*w+dx*1.2,p[1]+dx*w+dy*1.2);x.quadraticCurveTo(p[0]+dx*3,p[1]+dy*3,p[0]+dy*w+dx*1.2,p[1]-dx*w+dy*1.2);x.stroke()}x.restore()}
function spines(x,f,n,w0,w1,col,h=6,from=0,to=1,side=-1){for(let i=0;i<n;i++){const t=from+(to-from)*(i+.5)/n,p=f(t),q=f(Math.min(1,t+.03)),pp=f(Math.max(0,t-.03));let dx=q[0]-pp[0],dy=q[1]-pp[1];const l=Math.hypot(dx,dy)||1;dx/=l;dy/=l;const w=(w0+(w1-w0)*t)/2,hh=h*(.7+.5*Math.sin(i*1.7)),
    bx=p[0]+dy*w*side*-1,by=p[1]+dx*w*side;poly(x,[[bx-dx*2.4,by-dy*2.4],[bx+dy*hh*side*-1-dx*1,by+dx*hh*side-dy*1],[bx+dx*2.4,by+dy*2.4]],col,OUT,.8)}}
// ---------- dragón ----------
function dragon(x,o){
  const cx=48,by=90,c=o.c,c2=o.c2,ac=o.ac||'#ffe060',bone=o.bone,rot=o.rot,dk=shade(c,-.3);x.save();x.translate(cx-3,by+2);x.scale(.88,.88);x.translate(-cx,-by);if(!o.noShadow)shadowE(x,cx,by-1,38,6.5,.45);if(bone)x.globalAlpha=o.ghost?.88:1;
  const wc=bone?(o.wcol||shade(c,-.45)):shade(c,-.14);
  wingBat(x,cx-8,by-50,46,wc,-1,{tilt:.1,bone,arm:bone?shade(c,.1):shade(c,.25),holes:rot||bone?[[.5,-.45,.06],[.74,-.3,.05]]:null});
  const tail=bez([cx-16,by-34],[cx-36,by-34],[cx-48,by-24],[cx-40,by-8]);
  solid(x,ribbon(tail,10,15,2),c,{d:2});ribBands(x,tail,7,15,2,shade(c,-.4),.05,.8,.9);spines(x,tail,6,15,2,c2,5,.05,.85,-1);
  sPoly(x,[[cx-42,by-4],[cx-36,by-14],[cx-33,by-5],[cx-39,by-1]],c2,{d:.6});
  pata(x,cx-10,by-26,cx-16,by-14,cx-12,by-3,11,dk,'paw');
  const body=pSmooth([[cx-30,by-34],[cx-18,by-50],[cx,by-54],[cx+18,by-48],[cx+26,by-34],[cx+14,by-20],[cx-6,by-18],[cx-24,by-22]]);
  solid(x,body,c,{d:2.8});
  x.save();x.clip(body);const bel=pSmooth([[cx-26,by-28],[cx,by-34],[cx+26,by-34],[cx+16,by-20],[cx-6,by-17],[cx-22,by-20]]);x.fillStyle=c2;x.fill(bel);
  x.strokeStyle=shade(c2,-.35);x.lineWidth=1;for(let i=0;i<7;i++){x.beginPath();x.moveTo(cx-20+i*6.4,by-32+Math.abs(i-3)*.6);x.quadraticCurveTo(cx-18+i*6.4,by-26,cx-20+i*6.4,by-19);x.stroke()}
  if(bone){x.strokeStyle='rgba(30,25,20,.55)';x.lineWidth=1.3;for(let i=0;i<6;i++){x.beginPath();x.moveTo(cx-18+i*7,by-48);x.quadraticCurveTo(cx-14+i*7,by-38,cx-16+i*7,by-30);x.stroke()}}
  if(rot){for(const[px,py,r]of[[cx-14,by-40,4],[cx+8,by-44,3],[cx-2,by-30,3.6]]){cdot(x,px,py,r,'rgba(60,70,20,.55)')}x.strokeStyle='rgba(235,225,190,.85)';x.lineWidth=1.8;for(let i=0;i<4;i++){x.beginPath();x.moveTo(cx-18+i*6,by-46);x.quadraticCurveTo(cx-14+i*6,by-40,cx-17+i*6,by-33);x.stroke()}}
  x.restore();
  const neck=bez([cx+12,by-42],[cx+30,by-44],[cx+12,by-58],[cx+24,by-70]);
  spines(x,neck,6,13,8,c2,6,.05,.95,-1);
  solid(x,ribbon(neck,10,14,8.5),c,{d:2});ribBands(x,neck,6,14,8.5,shade(c2,-.15),.1,.9,1.3);
  pata(x,cx+14,by-28,cx+20,by-14,cx+16,by-3,11,shade(c,-.06),'paw');
  // dorso: púas
  for(let i=0;i<6;i++){const px=cx-22+i*8,py=by-49-Math.sin(i/5*3)*4;poly(x,[[px-3,py+2],[px+(rot?-1:0)-.5,py-(bone?9:8)],[px+3.4,py+1.6]],o.spine||c2,OUT,.9)}
    wingBat(x,cx+4,by-52,48,wc,1,{tilt:-.2,bone,arm:bone?shade(c,.1):shade(c,.3),holes:rot||bone?[[.5,-.5,.06],[.68,-.25,.05],[.82,-.55,.04]]:null});
  // cabeza
  const hx=cx+26,hy=by-72,open=o.fire||o.open;
  sPoly(x,[[hx-6,hy-6],[hx-19,hy-17],[hx-12,hy-6]],o.horn||'#efe6cc',{d:.9});sPoly(x,[[hx-1,hy-8],[hx-9,hy-21],[hx+3,hy-9]],o.horn||'#efe6cc',{d:.9});
  if(o.elf){for(const k of[0,1]){cline(x,[[hx-4+k*4,hy-8],[hx-10+k*3,hy-17],[hx-7+k*3,hy-24]],o.horn||c2,2.4);cline(x,[[hx-9+k*3,hy-16],[hx-15+k*3,hy-18]],o.horn||c2,1.8)}}
  const jaw=pSmooth([[hx-6,hy+3],[hx+8,hy+5+(open?5:0)],[hx+22,hy+4+(open?9:0)],[hx+23,hy+7+(open?9:0)],[hx+8,hy+9+(open?5:0)],[hx-4,hy+7]]);solid(x,jaw,shade(c,-.1),{d:1.2});
  for(let i=0;i<4;i++)poly(x,[[hx+7+i*3.8,hy+6+(open?5:0)-i*.3],[hx+8.6+i*3.8,hy+1.4+(open?3.6:0)],[hx+10.2+i*3.8,hy+5+(open?5:0)]],'#fff',OUT,.5);
  const hd=pSmooth([[hx-9,hy-3],[hx-2,hy-9],[hx+10,hy-8],[hx+22,hy-2],[hx+25,hy+2],[hx+12,hy+4],[hx-4,hy+4]]);solid(x,hd,c,{d:1.8});
  if(bone){sEll(x,hx+3,hy-2,3.4,3,'#120a12',{d:0,lw:.6});cdot(x,hx+3.4,hy-2,1.6,ac);cline(x,[[hx+10,hy-6],[hx+22,hy-1]],'rgba(30,25,20,.6)',1)}else eye(x,hx+4,hy-3.2,2.3,'#fff3b0','#200',1,ac);
  brow(x,hx+4,hy-6.6,6,1,dk,1);cdot(x,hx+22,hy-.2,1,'#1a0a0a');
  for(let i=0;i<4;i++)poly(x,[[hx+10+i*3.2,hy+3.6],[hx+11.4+i*3.2,hy+7.6],[hx+12.8+i*3.2,hy+3.8]],'#fff',OUT,.5);
  if(o.fire){x.save();x.globalCompositeOperation='lighter';x.fillStyle=rg(x,hx+27,hy+7,1,17,['rgba(255,230,120,.95)','rgba(255,120,30,.55)','rgba(255,50,0,0)']);x.fillRect(hx+8,hy-12,40,38);x.restore()}
  if(rot){cline(x,[[hx+16,hy+8],[hx+16.5,hy+14]],'rgba(150,200,60,.8)',1.2)}
  x.globalAlpha=1;x.restore();
}
function leviathan(x,o){
  const cx=48,by=90,c=o.c,c2=o.c2,ac=o.ac||'#ffe880';x.save();shadowE(x,cx,by-1,36,6,.3);
  const f=bez([cx-44,by-8],[cx-26,by-62],[cx+4,by+4],[cx+30,by-62]);
  // agua
  x.fillStyle='rgba(120,200,240,.35)';x.beginPath();x.ellipse(cx-10,by-6,38,7,0,0,6.3);x.fill();
  // aleta dorsal
  spines(x,f,9,14,10,c2,10,.12,.9,-1);
  solid(x,ribbon(f,18,8,16,t=>6+Math.sin(t*3.14)*10+t*3),c,{d:2.4});
  x.save();x.clip(ribbon(f,18,8,16,t=>6+Math.sin(t*3.14)*10+t*3));ribBands(x,f,14,16,16,shade(c2,-.1),.05,.95,1.3);x.restore();
  ribBands(x,f,10,14,14,shade(c,-.45),.08,.92,.9);
  const hp=f(1),hx=hp[0],hy=hp[1];
  const jaw=pSmooth([[hx-4,hy+3],[hx+8,hy+6],[hx+18,hy+4],[hx+17,hy+8],[hx+6,hy+10],[hx-5,hy+8]]);solid(x,jaw,shade(c,-.12),{d:1});
  sPoly(x,[[hx-6,hy-6],[hx-15,hy-14],[hx-9,hy-3]],c2,{d:.7});sPoly(x,[[hx-6,hy-2],[hx-18,hy-4],[hx-8,hy+3]],c2,{d:.7});
  solid(x,pSmooth([[hx-8,hy-2],[hx,hy-8],[hx+12,hy-6],[hx+20,hy],[hx+19,hy+4],[hx+6,hy+5],[hx-5,hy+5]]),c,{d:1.6});
  eye(x,hx+3.4,hy-2.2,2.3,'#fff6c0','#200',1,ac);brow(x,hx+3.4,hy-5.6,6,1,shade(c,-.5),1);for(let i=0;i<4;i++)poly(x,[[hx+8+i*2.7,hy+4.4],[hx+9+i*2.7,hy+8],[hx+10.4+i*2.7,hy+4.4]],'#fff',OUT,.4);
  cline(x,[[hx+18,hy+1],[hx+30,hy-6],[hx+34,hy-12]],ac,1.2);cline(x,[[hx+18,hy+3],[hx+31,hy+2],[hx+36,hy+6]],ac,1.2);
  // espuma
  for(let i=0;i<5;i++)cdot(x,cx-40+i*9,by-5+(i%2)*2,2.4,'rgba(235,250,255,.7)');
  x.restore();
}
// ---------- serpiente / hidra ----------
function serpent(x,o){
  const cx=48,by=88,c=o.c,c2=o.c2,ac=o.ac||'#ffe060';x.save();shadowE(x,cx,by+1,32,6,.4);
  const f=bez([cx-38,by-6],[cx-34,by-34],[cx+4,by-6],[cx+2,by-30]),f2=bez([cx+2,by-30],[cx+4,by-42],[cx+30,by-34],[cx+28,by-58]);
  const g=t=>t<.5?f(t*2):f2((t-.5)*2),wf=t=>6+Math.sin(t*3.0)*8+(t>.85?-(t-.85)*30:0);
  if(o.wings){wingBat(x,cx-8,by-34,38,shade(c2,-.2),-1);}
  solid(x,ribbon(g,24,0,0,t=>Math.max(3,wf(t))),c,{d:2});
  x.save();x.clip(ribbon(g,24,0,0,t=>Math.max(3,wf(t))));
  // diamantes
  for(let i=0;i<9;i++){const t=.06+i*.1,p=g(t);const w=wf(t)*.4;poly(x,[[p[0],p[1]-w],[p[0]+w,p[1]],[p[0],p[1]+w],[p[0]-w,p[1]]],c2,shade(c2,-.5),.8)}
  ribBands(x,g,22,14,14,shade(c,-.4),.04,.9,.8);x.restore();
  const hp=g(1),hx=hp[0]+1,hy=hp[1]-1;
  if(o.crest)for(let i=0;i<6;i++)poly(x,[[hx-8+i*2.6,hy-7],[hx-8+i*2.6+(i<3?-2:1),hy-17+Math.abs(i-2)*1.4],[hx-5.4+i*2.6,hy-7]],o.crest===1?ac:o.crest,OUT,.8);
  solid(x,pSmooth([[hx-10,hy+1],[hx-5,hy-8],[hx+6,hy-9],[hx+17,hy-3],[hx+16,hy+4],[hx+6,hy+7],[hx-6,hy+6]]),c,{d:1.6});
  if(o.goat){for(const k of[0,1]){const p=new Path2D();p.moveTo(hx-5+k*5,hy-8);p.quadraticCurveTo(hx-14+k*5,hy-14,hx-10+k*5,hy-24);p.quadraticCurveTo(hx-8+k*5,hy-14,hx-1+k*5,hy-8);p.closePath();solid(x,p,'#e8dcc0',{d:.8})}}
  eye(x,hx+3,hy-2.6,2.3,'#fff8a0','#300',1,ac);brow(x,hx+3,hy-5.8,6,1,shade(c,-.5),1);cdot(x,hx+15,hy-1.4,.8,'#150a0a');
  cline(x,[[hx+16,hy+1.6],[hx+7,hy+3.2]],'#2a0a0e',.9);poly(x,[[hx+11,hy+2.4],[hx+11.8,hy+6],[hx+12.8,hy+2.2]],'#fff',OUT,.4);
  cline(x,[[hx+16,hy+1],[hx+23,hy+3],[hx+27,hy],[hx+23,hy+3],[hx+27,hy+6]],'#e83a4a',1.2);
  if(o.wings)wingBat(x,cx-2,by-34,42,shade(c2,.04),1);
  x.restore();
}
function hydra(x,o){
  const cx=48,by=88,c=o.c,c2=o.c2,ac=o.ac||'#ffe060',n=o.heads||3,dk=shade(c,-.3);x.save();shadowE(x,cx,by+1,34,7,.45);
  {const t=bez([cx-24,by-20],[cx-44,by-20],[cx-46,by-6],[cx-34,by-3]);solid(x,ribbon(t,8,10,2),c,{d:1.6})}
  pata(x,cx-12,by-16,cx-18,by-9,cx-14,by-2,9,dk,'paw');pata(x,cx+12,by-16,cx+19,by-9,cx+17,by-2,8,dk,'paw');
  const body=pSmooth([[cx-28,by-22],[cx-14,by-36],[cx+8,by-36],[cx+24,by-24],[cx+14,by-10],[cx-8,by-8],[cx-26,by-12]]);solid(x,body,c,{d:2.4});
  x.save();x.clip(body);x.fillStyle=c2;x.beginPath();x.ellipse(cx,by-10,26,7,0,0,6.3);x.fill();ribBands(x,bez([cx-24,by-26],[cx-10,by-30],[cx+10,by-30],[cx+22,by-26]),9,10,10,shade(c,-.4),0,1,.8);x.restore();
  pata(x,cx-20,by-16,cx-26,by-9,cx-22,by-2,10,c,'paw');pata(x,cx+6,by-16,cx+12,by-9,cx+10,by-2,9,shade(c,-.05),'paw');
  const hs=n===5?[[cx-30,by-72],[cx-16,by-84],[cx+2,by-88],[cx+18,by-82],[cx+32,by-68]]:[[cx-22,by-72],[cx,by-86],[cx+22,by-74]];
  hs.forEach(([hx,hy],i)=>{const sx=cx-12+i*(24/(n-1)),f=bez([sx,by-30],[sx+(hx-sx)*.2,by-50],[hx-(hx-sx)*.3,by-54],[hx,hy+6]);
    solid(x,ribbon(f,10,11,7),c,{d:1.8});ribBands(x,f,5,11,7,shade(c2,-.1),.2,.9,1.1);
    const dx=hx>cx?1:-1*0.4;const hh=(x2,y2)=>{};
    solid(x,pSmooth([[hx-8,hy+1],[hx-3,hy-6],[hx+6,hy-6],[hx+15,hy-1],[hx+14,hy+4],[hx+4,hy+6],[hx-6,hy+5]]),i===(n>>1)?shade(c,.08):c,{d:1.4});
    sPoly(x,[[hx-5,hy-5],[hx-9,hy-13],[hx-1,hy-6]],c2,{d:.6});eye(x,hx+3,hy-1.6,1.9,'#fff8a0','#300',1,ac);brow(x,hx+3,hy-4.6,5,1,dk,1);
    cline(x,[[hx+14,hy+1.6],[hx+7,hy+3]],'#2a0a0e',.8);for(let k=0;k<2;k++)poly(x,[[hx+7+k*3.4,hy+3],[hx+8+k*3.4,hy+6],[hx+9.2+k*3.4,hy+3]],'#fff',OUT,.4);
    if(i===(n>>1))cline(x,[[hx+14,hy+1],[hx+20,hy+3],[hx+23,hy+1]],'#e83a4a',1)});
  x.restore();
}
// ---------- sirena (humana + cola de pez) ----------
function mermaid(x,o){
  const cx=48,by=88,c=o.c,c2=o.c2,hairc=o.hair||'#e87aa8';x.save();shadowE(x,cx,by+1,26,5,.3);
  const f=bez([cx+2,by-40],[cx-4,by-14],[cx-30,by-26],[cx-26,by-8]),wf=t=>16-t*13;
  // aleta caudal
  {const p=f(1);const fin=new Path2D();fin.moveTo(p[0],p[1]);fin.quadraticCurveTo(p[0]-12,p[1]-4,p[0]-16,p[1]+8);fin.quadraticCurveTo(p[0]-8,p[1]+3,p[0]-3,p[1]+9);fin.quadraticCurveTo(p[0]+1,p[1]+4,p[0]+10,p[1]+4);fin.quadraticCurveTo(p[0]+6,p[1]-4,p[0],p[1]);solid(x,fin,c2,{d:1.5})}
  solid(x,ribbon(f,14,16,3,wf),c,{d:2.2});x.save();x.clip(ribbon(f,14,16,3,wf));
  for(let i=0;i<9;i++)for(let j=0;j<4;j++){const t=.04+i*.1,p=f(t),off=(j-1.5)*4+(i%2)*2;x.strokeStyle=shade(c,-.38);x.lineWidth=.8;x.beginPath();x.arc(p[0]+off*.8,p[1]+off*.6,2.3,0,3.14);x.stroke()}x.restore();
  sPoly(x,[[cx-6,by-38],[cx-17,by-48],[cx-12,by-32]],c2,{d:.8});
  // torso
  x.save();x.translate(0,-9);humanoid(x,{pal:o.pal,halfBody:1,noShadow:1,sc:.98,skin:o.skin||'#f0d0b8',armor:c2,bare:1,noPauld:1,bareArms:1,sleeve:o.skin||'#f0d0b8',weapon:o.bow?'bow':'staff',orb:o.pal[2],bowCol:c2,hair:hairc,hairLong:1,helm:null,mood:o.mood||3,blush:1,eyeCol:'#18a',up:o.up,staffKind:'crook',lean:1});
  // concha
  const bx=48+1.5,by2=90-53-9;sEll(x,bx-5,by2+9,5.4,4.6,c2,{d:1.2});sEll(x,bx+5,by2+9,5.4,4.6,c2,{d:1.2});cline(x,[[bx-5,by2+5.6],[bx-5,by2+13]],shade(c2,-.4),.7);cline(x,[[bx+5,by2+5.6],[bx+5,by2+13]],shade(c2,-.4),.7);x.restore();
  x.restore();
}
// ---------- kraken ----------
function kraken(x,o){
  const cx=48,by=88,c=o.c,c2=o.c2,ac=o.ac||'#f0d0f0';x.save();shadowE(x,cx,by+1,36,7,.4);
  const tent=[[[cx-14,by-34],[cx-44,by-34],[cx-52,by-14],[cx-40,by-4]],[[cx-8,by-30],[cx-30,by-20],[cx-34,by-2],[cx-20,by-2]],[[cx+8,by-30],[cx+30,by-20],[cx+34,by-2],[cx+20,by-2]],[[cx+14,by-34],[cx+44,by-34],[cx+52,by-14],[cx+40,by-4]],[[cx-18,by-38],[cx-52,by-58],[cx-40,by-76],[cx-30,by-66]],[[cx+18,by-38],[cx+52,by-58],[cx+40,by-76],[cx+30,by-66]],[[cx,by-26],[cx-4,by-10],[cx+8,by-2],[cx+2,by-1]]];
  tent.forEach((q,i)=>{const f=bez(q[0],q[1],q[2],q[3]);solid(x,ribbon(f,12,11,2),i%2?shade(c,-.08):c,{d:1.6});
    x.fillStyle=ac;for(let k=0;k<6;k++){const p=f(.15+k*.14);cdot(x,p[0],p[1]+1,Math.max(.8,1.7-k*.2),'rgba(255,220,240,.85)')}});
  // manto
  const m=pSmooth([[cx-26,by-44],[cx-20,by-72],[cx-4,by-92],[cx+14,by-84],[cx+26,by-60],[cx+26,by-40],[cx,by-30]]);solid(x,m,c,{d:2.8});
  x.save();x.clip(m);x.fillStyle=c2;for(let i=0;i<8;i++){cdot(x,cx-10+(i*7)%22,by-80+((i*13)%30),2.4+(i%3),shade(c2,i%2?.1:-.1))}x.restore();
  sEll(x,cx,by-42,22,12,shade(c,-.05),{d:2});
  // fin
  sPoly(x,[[cx+22,by-70],[cx+34,by-78],[cx+28,by-56]],c2,{d:.8});sPoly(x,[[cx-22,by-70],[cx-34,by-78],[cx-28,by-56]],c2,{d:.8});
  for(const k of[-1,1]){eye(x,cx+k*9,by-48,4.4,'#fff4b0','#201',1,'#e8a010');brow(x,cx+k*9,by-54.6,9,1,shade(c,-.6),k)}
  cline(x,[[cx-8,by-37],[cx,by-34],[cx+8,by-37]],'#2a0a2a',1.4);
  x.restore();
}
function crab(x,o){
  const cx=48,by=88,c=o.c,c2=o.c2,dk=shade(c,-.3);x.save();shadowE(x,cx,by+1,34,6,.4);
  for(const k of[-1,1])for(let i=0;i<3;i++){const sx=cx+k*(14+i*1),sy=by-30+i*4;sCap(x,sx,sy,cx+k*(28+i*3),by-34+i*3,5,4,k>0?dk:shade(dk,-.1));sCap(x,cx+k*(28+i*3),by-34+i*3,cx+k*(34+i*3),by-3,4,2.6,k>0?dk:shade(dk,-.1))}
  for(const k of[-1,1]){sCap(x,cx+k*16,by-40,cx+k*28,by-54,9,7,c);sCap(x,cx+k*28,by-54,cx+k*34,by-66,7,6,shade(c,.04));
    x.save();x.translate(cx+k*37,by-72);x.scale(k,1);x.rotate(-.15);
    const up=new Path2D();up.moveTo(-6,2);up.quadraticCurveTo(-8,-14,4,-20);up.quadraticCurveTo(6,-10,10,-4);up.lineTo(2,2);up.closePath();solid(x,up,c,{d:1.8});
    const dn=new Path2D();dn.moveTo(-5,3);dn.quadraticCurveTo(8,4,14,-2);dn.quadraticCurveTo(16,8,6,12);dn.quadraticCurveTo(-4,10,-5,3);dn.closePath();solid(x,dn,shade(c,-.1),{d:1.5});
    for(let i=0;i<4;i++)poly(x,[[0+i*3,-3+i*-1.4],[1.4+i*3,-6-i*1.4],[2.6+i*3,-3-i*1.4]],'#fff0d0',OUT,.5);x.restore()}
  const sh=pSmooth([[cx-28,by-34],[cx-18,by-52],[cx,by-56],[cx+18,by-52],[cx+28,by-34],[cx+16,by-18],[cx-16,by-18]]);solid(x,sh,c,{d:3});
  x.save();x.clip(sh);x.fillStyle=c2;x.beginPath();x.ellipse(cx,by-28,20,9,0,0,6.3);x.fill();x.strokeStyle=shade(c,-.45);x.lineWidth=1.1;for(let i=0;i<3;i++){x.beginPath();x.arc(cx,by-30+i*3,10+i*8,3.6,5.8);x.stroke()}
  for(let i=0;i<6;i++)cdot(x,cx-14+i*5.6,by-40-Math.abs(i-2.5)*.4,1.3,shade(c,.3));x.restore();
  for(const k of[-1,1]){sCap(x,cx+k*8,by-50,cx+k*10,by-60,3,2.6,c);sEll(x,cx+k*10,by-62,4.2,4.2,'#fff4d0',{d:1});eye(x,cx+k*10.4,by-62,2.6,'#fff','#111',1);}
  x.restore();
}
// ---------- fantasma, genio y elementales ----------
function ghost(x,o){
  const cx=48,by=84,c=o.c,c2=o.c2,ac=o.ac||'#fff';x.save();shadowE(x,cx,by+4,16,3.5,.18);x.globalAlpha=o.fire?1:.9;
  const body=new Path2D();body.moveTo(cx-17,by-52);body.bezierCurveTo(cx-24,by-78,cx+24,by-78,cx+17,by-50);body.bezierCurveTo(cx+24,by-34,cx+22,by-14,cx+26,by-2);
  body.quadraticCurveTo(cx+19,by-9,cx+14,by-1);body.quadraticCurveTo(cx+9,by-10,cx+4,by+1);body.quadraticCurveTo(cx-1,by-12,cx-6,by);body.quadraticCurveTo(cx-12,by-10,cx-17,by-1);body.quadraticCurveTo(cx-21,by-8,cx-26,by-3);body.bezierCurveTo(cx-20,by-20,cx-26,by-36,cx-17,by-52);body.closePath();
  x.fillStyle=rg(x,cx,by-44,3,42,['rgba(255,255,255,.55)',ca(c,.8),ca(c2,.33)]);x.fill(body);x.save();x.clip(body);x.fillStyle=lg(x,0,by-70,0,by,['rgba(255,255,255,.25)','rgba(255,255,255,0)',ca(c2,.53)]);x.fillRect(0,0,96,96);
  x.strokeStyle='rgba(255,255,255,.35)';x.lineWidth=1;for(let i=0;i<4;i++){x.beginPath();x.moveTo(cx-14+i*9,by-30);x.quadraticCurveTo(cx-12+i*9,by-16,cx-16+i*9,by-4);x.stroke()}x.restore();
  x.strokeStyle='rgba(30,30,80,.7)';x.lineWidth=1.3;x.stroke(body);x.globalAlpha=1;
  // capucha / cara
  const cap=pSmooth([[cx-14,by-52],[cx-12,by-70],[cx,by-76],[cx+12,by-70],[cx+14,by-52],[cx,by-42]]);x.save();x.globalAlpha=.55;solid(x,cap,shade(c2,-.15),{d:2,lw:0});x.restore();
  sEll(x,cx,by-58,8,10,'#0c0818',{d:0,lw:.8});
  x.save();x.shadowColor=ac;x.shadowBlur=4;eye(x,cx-3.4,by-60,2.1,ac,'#fff',1);eye(x,cx+3.6,by-60,2.1,ac,'#fff',1);x.restore();
  if(o.howl){sEll(x,cx,by-52,3.4,4.8,'#05020a',{d:0,lw:0})}else cline(x,[[cx-3,by-52],[cx,by-51],[cx+3,by-52]],'rgba(255,255,255,.55)',1);
  // manos esqueléticas
  for(const k of[-1,1]){sCap(x,cx+k*14,by-44,cx+k*22,by-34,4,3,'rgba(220,230,255,.9)',{d:.6});for(let i=0;i<3;i++)cline(x,[[cx+k*22,by-34],[cx+k*(26+i*.8),by-30+i*1.4]],'rgba(230,236,255,.95)',1.1)}
  x.restore();
}
function genie(x,o){
  const cx=48,by=88,c=o.c,c2=o.c2,fc='#ffd060';x.save();shadowE(x,cx,by+1,16,3.5,.25);
  x.save();x.globalCompositeOperation='lighter';x.fillStyle=rg(x,cx,by-18,2,36,['rgba(255,220,120,.55)','rgba(255,110,30,.3)','rgba(255,50,0,0)']);x.fillRect(cx-40,by-56,80,64);x.restore();
  const f=bez([cx,by-38],[cx-8,by-22],[cx+30,by-26],[cx+8,by-2]);
  solid(x,ribbon(f,14,22,3),c,{d:2});x.save();x.clip(ribbon(f,14,22,3));x.strokeStyle=c2;x.lineWidth=2;for(let i=0;i<5;i++){x.beginPath();x.arc(cx+4,by-24+i*4,8-i,.4,2.6);x.stroke()}x.restore();
  x.save();humanoid(x,{pal:o.pal,halfBody:1,noShadow:1,sc:1.05,skin:c,bare:1,bulk:1,bareArms:1,noPauld:1,sleeve:c,weapon:o.up?'sword':'none',bladeCol:'#ffd060',hair:null,helm:'horns',hornCol:fc,helmCol:shade(c,-.3),mood:1,eyeCol:fc,fangs:1,lean:0,up:o.up,noScale:1});
  x.restore();
  for(const k of[-1,1]){sCap(x,48+k*13,90-50,48+k*16.5,90-42,6.4,5,'#ffd060',{d:.8})}
  x.save();x.globalCompositeOperation='lighter';for(let i=0;i<4;i++)cdot(x,cx-22+i*14,by-10-(i%2)*10,1.5,'rgba(255,210,100,.8)');x.restore();
  x.restore();
}
function elemental(x,o){
  const cx=48,by=88,ice=o.ice,c=o.c,c2=o.c2;x.save();shadowE(x,cx,by+1,22,4.5,.3);
  if(ice){const sh=[[cx,by-82],[cx+10,by-62],[cx+24,by-56],[cx+16,by-34],[cx+26,by-14],[cx+8,by-2],[cx-8,by-2],[cx-26,by-14],[cx-16,by-34],[cx-24,by-56],[cx-10,by-62]];
    sPoly(x,sh,c,{d:3.4,hl:'#fff',sh:shade(c2,-.1)});x.save();x.clip(_P(sh));x.strokeStyle='rgba(255,255,255,.65)';x.lineWidth=1;for(const q of[[[cx-10,by-62],[cx-4,by-30]],[[cx+10,by-62],[cx+4,by-24]],[[cx-16,by-34],[cx+2,by-8]]]){x.beginPath();x.moveTo(q[0][0],q[0][1]);x.lineTo(q[1][0],q[1][1]);x.stroke()}x.restore();
    for(const k of[-1,1]){sPoly(x,[[cx+k*22,by-52],[cx+k*34,by-62],[cx+k*30,by-44]],c,{d:1.2,hl:'#fff'});sPoly(x,[[cx+k*20,by-30],[cx+k*32,by-24],[cx+k*24,by-18]],c,{d:1,hl:'#fff'})}
    x.save();x.shadowColor='#bff';x.shadowBlur=5;eye(x,cx-5,by-44,3,'#e8ffff','#06a',1);eye(x,cx+6,by-44,3,'#e8ffff','#06a',1);x.restore();cline(x,[[cx-5,by-33],[cx,by-31],[cx+5,by-33]],'#136aa0',1.4)}
  else{x.save();x.globalCompositeOperation='lighter';x.fillStyle=rg(x,cx,by-44,3,52,['rgba(255,200,80,.6)','rgba(255,90,20,.3)','rgba(255,50,0,0)']);x.fillRect(cx-52,by-96,104,100);x.restore();
    const fl=(sc,col,dy)=>{const p=new Path2D();p.moveTo(cx-20*sc,by-2+dy);p.bezierCurveTo(cx-30*sc,by-30,cx-18*sc,by-44,cx-10*sc,by-62);p.bezierCurveTo(cx-8*sc,by-52,cx-2*sc,by-56,cx,by-82*sc);p.bezierCurveTo(cx+4*sc,by-60,cx+12*sc,by-56,cx+12*sc,by-64);p.bezierCurveTo(cx+30*sc,by-44,cx+28*sc,by-24,cx+20*sc,by-2+dy);p.closePath();x.fillStyle=col;x.fill(p);return p};
    const p1=fl(1,c,0);x.strokeStyle='#5a1a08';x.lineWidth=1.2;x.stroke(p1);fl(.72,c2,-2);fl(.42,'#fff4c0',-3);
    for(const k of[-1,1]){const p=new Path2D();p.moveTo(cx+k*18,by-36);p.quadraticCurveTo(cx+k*34,by-40,cx+k*34,by-58);p.quadraticCurveTo(cx+k*26,by-48,cx+k*16,by-44);p.closePath();x.fillStyle=c;x.fill(p);x.strokeStyle='#5a1a08';x.lineWidth=1;x.stroke(p)}
    eye(x,cx-5,by-42,3,'#fff6c0','#900',1);eye(x,cx+6,by-42,3,'#fff6c0','#900',1);x.fillStyle='#4a0a04';x.beginPath();x.moveTo(cx-6,by-32);x.quadraticCurveTo(cx,by-26,cx+7,by-32);x.quadraticCurveTo(cx,by-35,cx-6,by-32);x.fill()}
  x.restore();
}
// ---------- gólem ----------
function golem(x,o){
  const cx=48,by=90,c=o.c,c2=o.c2,ac=o.ac,big=o.big;x.save();shadowE(x,cx,by+1,32,7,.5);
  const blk=(bx,by2,w,h,col,r=4,n=0)=>{const p=new Path2D();p.moveTo(bx+r,by2);p.lineTo(bx+w-r*1.2,by2);p.lineTo(bx+w,by2+r*1.2);p.lineTo(bx+w-1,by2+h-r);p.lineTo(bx+w-r*1.3,by2+h);p.lineTo(bx+r,by2+h);p.lineTo(bx,by2+h-r*1.2);p.lineTo(bx+1,by2+r);p.closePath();solid(x,p,col,{d:2.2,lw:1.5});
    x.save();x.clip(p);x.strokeStyle='rgba(10,5,15,.4)';x.lineWidth=1;x.beginPath();x.moveTo(bx+w*.3,by2+1);x.lineTo(bx+w*.22,by2+h*.45);x.lineTo(bx+w*.42,by2+h*.6);x.lineTo(bx+w*.34,by2+h);x.stroke();
    if(o.moss){x.fillStyle='rgba(90,150,60,.75)';x.beginPath();x.moveTo(bx,by2);x.lineTo(bx+w,by2);x.lineTo(bx+w,by2+3);for(let i=0;i<5;i++)x.lineTo(bx+w-i*w/5-2,by2+3+((i*7)%4));x.lineTo(bx,by2+4);x.fill()}x.restore();return p};
  blk(cx-19,by-24,16,24,c2,5);blk(cx+3,by-24,16,24,c2,5);
  blk(cx-24,by-58,48,38,c,7);
  blk(cx-40,by-56,16,36,c2,7);blk(cx+24,by-56,16,36,c2,7);blk(cx-43,by-26,20,16,c,6);blk(cx+23,by-26,20,16,c,6);
  if(o.band){x.fillStyle=o.band;for(const q of[[cx-24,by-44,48,5],[cx-40,by-40,16,4],[cx+24,by-40,16,4]]){x.fillRect(q[0],q[1],q[2],q[3]);x.strokeStyle=OUT;x.lineWidth=.8;x.strokeRect(q[0],q[1],q[2],q[3])}}
  // núcleo + runas
  x.save();x.shadowColor=ac;x.shadowBlur=6;sEll(x,cx,by-38,6.4,6.4,ac,{d:0,lw:1,hl:'#fff'});x.restore();cdot(x,cx,by-38,2.4,'#fff');
  x.save();x.shadowColor=ac;x.shadowBlur=3;cline(x,[[cx-14,by-52],[cx-7,by-46],[cx-14,by-36]],ac,1.5);cline(x,[[cx+14,by-52],[cx+7,by-46],[cx+14,by-36]],ac,1.5);cline(x,[[cx-36,by-48],[cx-30,by-42]],ac,1.3);cline(x,[[cx+36,by-48],[cx+30,by-42]],ac,1.3);x.restore();
  blk(cx-14,by-80,28,24,c,7);
  x.save();x.shadowColor=ac;x.shadowBlur=5;x.fillStyle=ac;x.fillRect(cx-10,by-71,7,4.4);x.fillRect(cx+3,by-71,7,4.4);x.restore();x.fillStyle='#fff';x.fillRect(cx-8,by-70,3,1.6);x.fillRect(cx+5,by-70,3,1.6);
  cline(x,[[cx-10,by-73],[cx-3,by-71.6]],OUT,1.4);cline(x,[[cx+10,by-73],[cx+3,by-71.6]],OUT,1.4);
  if(o.crystal){for(const[px,py,s]of[[cx-32,by-62,1],[cx+32,by-64,1.1],[cx,by-84,1.3],[cx-20,by-60,.8],[cx+20,by-60,.8]])sPoly(x,[[px-3*s,py+4],[px-1,py-12*s],[px+1.4,py-10*s],[px+4*s,py+4]],'#d4faff',{d:1.2,hl:'#fff',sh:'#6ac4e0'})}
  if(o.horns){for(const k of[-1,1])sPoly(x,[[cx+k*10,by-78],[cx+k*20,by-92],[cx+k*14,by-76]],'#e0d8c0',{d:.8})}
  x.restore();
}
// ---------- ent ----------
function ent(x,o){
  const cx=48,by=90,c=o.c,c2=o.c2,ac=o.ac,old=o.old;x.save();shadowE(x,cx,by+1,30,6,.42);
  // raíces
  for(const k of[-1,1]){const f=bez([cx+k*8,by-22],[cx+k*14,by-8],[cx+k*26,by-2],[cx+k*32,by-1]);solid(x,ribbon(f,8,12,3),c,{d:1.6});const f2=bez([cx+k*4,by-18],[cx+k*6,by-6],[cx+k*14,by],[cx+k*18,by+1]);solid(x,ribbon(f2,8,9,2),shade(c,-.1),{d:1.2})}
  // tronco
  const tr=pSmooth([[cx-16,by-26],[cx-20,by-52],[cx-12,by-70],[cx+12,by-70],[cx+20,by-52],[cx+16,by-26],[cx+8,by-14],[cx-8,by-14]]);solid(x,tr,c,{d:3});
  x.save();x.clip(tr);x.strokeStyle='rgba(20,10,5,.45)';x.lineWidth=1.3;for(let i=-3;i<=3;i++){x.beginPath();x.moveTo(cx+i*5.4,by-18);x.bezierCurveTo(cx+i*6+3,by-34,cx+i*6-3,by-50,cx+i*5,by-68);x.stroke()}
  x.strokeStyle='rgba(235,200,140,.35)';x.lineWidth=.8;for(let i=-3;i<=3;i++){x.beginPath();x.moveTo(cx+i*5.4-2,by-18);x.bezierCurveTo(cx+i*6+1,by-34,cx+i*6-5,by-50,cx+i*5-2,by-68);x.stroke()}
  if(old){x.fillStyle='rgba(110,170,70,.8)';x.beginPath();x.moveTo(cx-20,by-40);x.bezierCurveTo(cx-10,by-44,cx,by-38,cx+4,by-44);x.lineTo(cx+4,by-30);x.lineTo(cx-20,by-30);x.fill()}x.restore();
  // cara
  sEll(x,cx,by-47,6,4.8,'#1a1008',{d:0,lw:.8});
  x.save();x.shadowColor=ac;x.shadowBlur=old?4:0;eye(x,cx-7,by-58,2.9,old?'#ffffc8':'#fff2a0','#400',1,old?'#e8c820':null);eye(x,cx+7,by-58,2.9,old?'#ffffc8':'#fff2a0','#400',1,old?'#e8c820':null);x.restore();
  sPoly(x,[[cx-11,by-64],[cx-3,by-61],[cx-3,by-59.6],[cx-11,by-62.4]],shade(c,-.45),{d:0,lw:.6});sPoly(x,[[cx+11,by-64],[cx+3,by-61],[cx+3,by-59.6],[cx+11,by-62.4]],shade(c,-.45),{d:0,lw:.6});
  sPoly(x,[[cx-1,by-56],[cx+3,by-51],[cx-2,by-51]],shade(c,.05),{d:.6,lw:.8});
  // brazos
  for(const k of[-1,1]){const f=bez([cx+k*16,by-62],[cx+k*32,by-62],[cx+k*38,by-48],[cx+k*32,by-30]);solid(x,ribbon(f,12,11,7),c,{d:2});
    for(let i=0;i<4;i++){const a=-.8+i*.55;cline(x,[[cx+k*32,by-30],[cx+k*(32+Math.cos(a)*7*k),by-26+i*2.4]],shade(c,-.1),2.2)}
    cline(x,[[cx+k*35,by-52],[cx+k*42,by-58]],c,2.6)}
  // copa
  for(const[bx,bo,r,cc]of[[cx-22,by-74,13,c2],[cx+20,by-76,14,c2],[cx-2,by-86,16,shade(c2,.1)],[cx-6,by-70,12,shade(c2,-.12)],[cx+8,by-72,12,shade(c2,-.08)]]){
    const p=_E(bx,bo,r,r*.9);solid(x,p,cc,{d:3,lw:1.4});x.save();x.clip(p);x.fillStyle='rgba(255,255,255,.14)';for(let i=0;i<4;i++)cdot(x,bx-r*.4+(i*5)%9,bo-r*.3+(i*7)%7,2.6,'rgba(255,255,255,.18)');x.restore()}
  for(let i=0;i<5;i++)cdot(x,cx-20+i*9,by-82-(i%2)*8,1.8,ac);
  if(old)for(const[px,py]of[[cx-28,by-70],[cx+28,by-72],[cx-10,by-92]]){for(let i=0;i<5;i++){const a=i*1.256;cdot(x,px+Math.cos(a)*2.4,py+Math.sin(a)*2.4,1.5,'#fff')}cdot(x,px,py,1.3,'#ffd84a')}
  x.restore();
}
// ---------- duendecillos, hadas, diablillos, arañas ----------
function imp(x,o){
  const cx=48,by=84,c=o.c,c2=o.c2,ac=o.ac,kind=o.kind;x.save();shadowE(x,cx,by+5,14,3.4,.3);
  if(kind==='fairy'){x.save();x.globalCompositeOperation='lighter';x.fillStyle=rg(x,cx,by-34,2,40,[ca(ac,.8),ca(ac,.27),ca(ac,0)]);x.fillRect(cx-42,by-76,84,84);x.restore();
    for(const k of[-1,1]){x.save();x.translate(cx+k*3,by-38);x.scale(k,1);x.rotate(-.2);const w1=new Path2D();w1.moveTo(0,0);w1.bezierCurveTo(10,-28,32,-30,26,-12);w1.bezierCurveTo(22,-4,10,0,0,2);w1.closePath();x.globalAlpha=.8;solid(x,w1,'#dff8ff',{d:1.4,lw:1,hl:'#fff',sh:'#9ad8e8'});const w2=new Path2D();w2.moveTo(0,2);w2.bezierCurveTo(8,4,22,8,18,20);w2.bezierCurveTo(10,22,2,10,0,2);w2.closePath();solid(x,w2,'#c8ecff',{d:1.2,lw:1});x.globalAlpha=1;x.restore()}
    // vestido
    sPoly(x,[[cx-6,by-36],[cx+6,by-36],[cx+11,by-16],[cx,by-20],[cx-11,by-16]],c2,{d:1.4});sCap(x,cx-3,by-20,cx-4,by-6,3.2,2.6,'#f0d0b8',{d:.6});sCap(x,cx+3,by-20,cx+5,by-8,3.2,2.6,'#f0d0b8',{d:.6});
    sCap(x,cx-5,by-34,cx-11,by-26,3.2,2.6,'#f0d0b8',{d:.6});sCap(x,cx+5,by-34,cx+12,by-38,3.2,2.6,'#f0d0b8',{d:.6});
    sEll(x,cx+1,by-44,6.4,6.8,'#f6dcc6',{d:1.2});sPoly(x,[[cx-5,by-49],[cx+1,by-56],[cx+7,by-49],[cx+9,by-42],[cx+6,by-47],[cx-4,by-48],[cx-7,by-42]],c,{d:1,lw:.9});
    eye(x,cx-1.4,by-44,1.5,'#fff','#143',3,'#2a8a5a');eye(x,cx+4,by-44,1.5,'#fff','#143',3,'#2a8a5a');cline(x,[[cx,by-40],[cx+2,by-39.6],[cx+3.4,by-40.4]],'#c0504a',.7);
    for(const k of[-1,1])sPoly(x,[[cx+1+k*6,by-45],[cx+1+k*11,by-48],[cx+1+k*6,by-42]],'#f6dcc6',{d:.4,lw:.7});
    sEll(x,cx,by-30,3,3,ac,{d:0,lw:0});
    x.save();x.globalCompositeOperation='lighter';for(let i=0;i<6;i++)cdot(x,cx-18+i*7.5,by-60+((i*17)%38),1.4,'rgba(255,255,220,.9)');x.restore();x.restore();return}
  if(kind==='sprite'){ // duende del bosque
    sCap(x,cx-3,by-20,cx-6,by-5,5,4,shade(c,-.3),{d:.8});sCap(x,cx+3,by-20,cx+6,by-5,5,4,shade(c,-.3),{d:.8});sPoly(x,[[cx-10,by-6],[cx-2,by-6],[cx-1,by],[cx-10,by]],'#6a4a2a',{d:.8});sPoly(x,[[cx+3,by-6],[cx+11,by-6],[cx+12,by],[cx+3,by]],'#6a4a2a',{d:.8});
    sPoly(x,[[cx-9,by-38],[cx+9,by-38],[cx+8,by-18],[cx-8,by-18]],c2,{d:1.6});cline(x,[[cx-8,by-26],[cx+8,by-26]],'#6a4a2a',1.8);
    sCap(x,cx-8,by-36,cx-14,by-26,4,3.4,c,{d:.7});sCap(x,cx+8,by-36,cx+16,by-30,4,3.4,c,{d:.7});wpn.sword(x,cx+16,by-30,-1.0,'#8a6a3a',13);
    for(const k of[-1,1])sPoly(x,[[cx+1+k*8,by-50],[cx+1+k*19,by-56],[cx+1+k*9,by-44]],c,{d:.8});
    sEll(x,cx+1,by-47,9,8.6,c,{d:1.8});
    sPoly(x,[[cx-10,by-52],[cx-12,by-62],[cx+2,by-76],[cx+14,by-70],[cx+10,by-54]],'#5aa845',{d:2});sPoly(x,[[cx+4,by-76],[cx+12,by-82],[cx+10,by-72]],'#7ac85a',{d:.6});cdot(x,cx+12,by-81,1.6,'#ff9ac0');
    eye(x,cx-2,by-47,2,'#fff6b0','#120',2,'#b8a010');eye(x,cx+5.4,by-47,2,'#fff6b0','#120',2,'#b8a010');cline(x,[[cx-3,by-41],[cx+1,by-39],[cx+5,by-41.4]],'#2a1a10',1);
    poly(x,[[cx+.4,by-45],[cx+2.6,by-43],[cx-.6,by-42.6]],shade(c,-.3));
    x.restore();return}
  // diablillo
  wingBat(x,cx-2,by-34,30,shade(c2,-.1),-1);wingBat(x,cx+2,by-34,32,shade(c2,.0),1);
  {const t=bez([cx-5,by-18],[cx-28,by-16],[cx-22,by+2],[cx-12,by-6]);solid(x,ribbon(t,8,5,2),c,{d:.8});sPoly(x,[[cx-14,by-10],[cx-6,by-3],[cx-9,by-14]],ac,{d:.5})}
  sCap(x,cx-4,by-18,cx-6,by-4,5.4,4.4,shade(c,-.15),{d:.8});sCap(x,cx+4,by-18,cx+6,by-4,5.4,4.4,shade(c,-.15),{d:.8});
  for(const k of[-1,1])sPoly(x,[[cx+k*6-3,by-4],[cx+k*6+4,by-4],[cx+k*6+6,by],[cx+k*6-4,by]],'#2a1a1a',{d:.6,lw:.9});
  sEll(x,cx,by-28,9.4,11.6,c,{d:2});sEll(x,cx,by-24,5.8,7,shade(c2,.1),{d:0,lw:0});
  sCap(x,cx-7,by-34,cx-14,by-24,4.2,3.4,c,{d:.7});sCap(x,cx+7,by-34,cx+15,by-34,4.2,3.4,c,{d:.7});
  cline(x,[[cx+17,by-48],[cx+17,by-22]],'#6a4a2a',1.6);sPoly(x,[[cx+13,by-47],[cx+17,by-56],[cx+21,by-47],[cx+19,by-46],[cx+17,by-50],[cx+15,by-46]],'#cfd6e2',{d:.6,lw:.9});
  sEll(x,cx,by-44,8.8,8.4,c,{d:1.8});for(const k of[-1,1]){const p=new Path2D();p.moveTo(cx+k*4,by-49);p.quadraticCurveTo(cx+k*11,by-54,cx+k*8,by-62);p.quadraticCurveTo(cx+k*5,by-55,cx+k*2,by-50);p.closePath();solid(x,p,'#efe2c8',{d:.8})}
  for(const k of[-1,1])sPoly(x,[[cx+k*8,by-45],[cx+k*14,by-47],[cx+k*8,by-41]],c,{d:.5,lw:.9});
  eye(x,cx-2.8,by-45,2,'#fff4b0','#c00',1,ac);eye(x,cx+3.8,by-45,2,'#fff4b0','#c00',1,ac);brow(x,cx-2.8,by-48.6,4.8,1,'#300',-1);brow(x,cx+3.8,by-48.6,4.8,1,'#300',1);
  x.fillStyle='#2a0a10';x.beginPath();x.moveTo(cx-3.4,by-39.6);x.quadraticCurveTo(cx+.4,by-34.6,cx+4.4,by-39.6);x.closePath();x.fill();poly(x,[[cx-2,by-39.4],[cx-1,by-37],[cx,by-39.4]],'#fff',null);poly(x,[[cx+2,by-39.4],[cx+3,by-37],[cx+3.8,by-39.4]],'#fff',null);
  x.restore();
}
function spider(x,o){
  const cx=48,by=86,c=o.c,c2=o.c2,ac=o.ac;x.save();shadowE(x,cx,by+2,32,6,.4);
  for(const k of[-1,1])for(let i=0;i<4;i++){const y0=by-30+i*2.4,sx=cx+k*(4+i*1.6)-4,j1=[cx+k*(22+i*4)-4,y0-18+i*3],j2=[cx+k*(36+i*3)-4,by-2];
    const sh=k>0?shade(c,-.1):shade(c,-.28);sCap(x,sx,y0,j1[0],j1[1],4.4,3.6,sh,{d:.8});sCap(x,j1[0],j1[1],j2[0],j2[1],3.6,2.2,sh,{d:.7})}
  sEll(x,cx-14,by-34,19,16,c,{d:2.6});x.save();x.beginPath();x.ellipse(cx-14,by-34,19,16,0,0,6.3);x.clip();
  // reloj de arena
  poly(x,[[cx-18,by-44],[cx-10,by-44],[cx-14,by-34]],ac,null);poly(x,[[cx-14,by-34],[cx-18,by-24],[cx-10,by-24]],ac,null);cdot(x,cx-14,by-34,1.4,c);
  for(let i=0;i<6;i++)cdot(x,cx-26+i*5,by-46+(i%2)*2,1.6,shade(c2,.1));x.restore();
  sEll(x,cx+10,by-31,11,9.4,c,{d:2});sEll(x,cx+12,by-33,8.4,6.4,shade(c,.02),{d:0,lw:0});
  for(let i=0;i<5;i++)poly(x,[[cx+4+i*2.4,by-40],[cx+4.6+i*2.4,by-45],[cx+6+i*2.4,by-40]],c2,OUT,.5);
  for(const[px,py,r]of[[7,-34,1.8],[11,-37,1.6],[15,-34,1.5],[10,-31,1.3],[14,-30,1.3],[18,-31,1.1]]){cdot(x,cx+px,by+py,r+.7,'#150810');cdot(x,cx+px,by+py,r,ac);cdot(x,cx+px-.4,by+py-.4,r*.35,'#fff')}
  for(const k of[-1,1]){const p=new Path2D();p.moveTo(cx+14+k*3,by-26);p.quadraticCurveTo(cx+18+k*5,by-20,cx+14+k*5,by-14);p.lineTo(cx+14+k*3-1,by-26);p.closePath();solid(x,p,'#f0e8d8',{d:.5,lw:.9})}
  x.restore();
}
// ---------- selección de dibujo por criatura ----------
function drawCreatureRaw(cr){
  const c=mkc(96,96),x=c.ctx,P=cr.pal,a=cr.arch,nm=cr.name,U=!!cr.up,T=cr.tier,F=cr.f,sc=cr.big?1.04:1,rn=s=>s.test(nm);
  const GL=U?GOLD:null;
  try{switch(a){
    case'hum':
      if(rn(/Alabardero/))humanoid(x,{pal:P,weapon:'halberd',helm:'kettle',plume:U?P[2]:null,tabard:1,tabardCol:P[1],cross:1,chain:1,greaves:1,cape:U?shade(P[1],-.15):null,up:U,bulk:U,helmCol:'#c4ccd8',sc,eyeCol:'#3a6aa0',hair:'#6a4a2a',lean:2});
      else if(rn(/Paladín|Cruzado/))humanoid(x,{pal:P,weapon:'sword',shield:P[1],shieldKind:U?'kite':null,helm:'great',plume:P[2],cape:U?shade(P[1],.0):shade(P[1],-.1),tabard:1,tabardCol:P[0],cross:1,greaves:1,bulk:1,up:U,helmCol:U?'#f4f0e0':'#d8dce8',helm2:U?'halo':null,sc,bladeCol:U?'#fff0a0':null,visor:'rgba(255,240,170,.9)'});
      else if(rn(/Minero/))humanoid(x,{pal:P,dwarf:1,weapon:'pick',helm:'dwarf',helmCol:U?'#8a8a98':'#6a6a74',beard:U?'#c8541e':'#8a4a22',skin:'#e0b090',armor:U?'#8a6a42':P[0],cloth:'#5a4a38',chain:U,shield:U?P[1]:null,shieldKind:'round',shieldR:8,greaves:1,up:U,sc,mood:1,hair:'#6a3a1a',legs:'#4a3a2c',cape:U?'#6a3a22':null});
      else if(rn(/Berserker/))humanoid(x,{pal:P,dwarf:1,weapon:'axe',weapon2:'axe',axeCol:U?'#e8d890':'#b8c0cc',bare:1,bareArms:1,harness:P[0],skin:'#e0a888',beard:U?'#e0541e':'#c8541e',helm:'horns',helmCol:'#6a6a74',hornCol:'#efe6cc',mood:1,grin:1,pauldFur:U?'#8a4a22':null,legs:'#5a3a22',cloth:'#5a3a22',noPauld:0,up:U,sc,tabard:0,beltCol:'#4a2a18',bulk:1,lean:2.5});
      else if(rn(/Pirata|Corsario/))humanoid(x,{pal:P,weapon:'cutlass',helm:U?'tricorn':'bandana',bandCol:P[0],hatCol:'#2a2430',eyepatch:!U,skin:'#d8a880',armor:U?shade(P[0],-.25):P[0],cloth:P[1],sleeve:P[1],legs:'#2a3a52',boot:'#2a1810',grin:1,mood:2,hair:'#3a2418',cape:U?P[0]:null,up:U,sc,noPauld:1,beltCol:'#3a2418',beard:U?'#2a1a10':null,lean:2.5,bracer:'#5a3a22',gaunt:1});
      else if(rn(/Lagarto/))humanoid(x,{pal:P,headKind:'lizard',skin:P[0],frill:P[1],weapon:'spear',pennant:U?P[1]:null,armor:'#7a5a32',bare:0,bareArms:1,sleeve:P[0],tail:P[0],bare2:1,legs:P[0],boot:P[0],noPauld:!U,spikes:U,chain:0,tabard:0,up:U,hunch:3,sc:1,cloth:'#6a4a22',beltCol:'#4a3418',greaves:0,thigh:0,mood:1,boot2:1,bareFeet:1,beltOnly:1});
      else if(rn(/Goblin/))humanoid(x,{pal:P,skin:P[0],ears:'gob',grin:1,weapon:U?'sword':'cutlass',shield:U?'#8a6a42':null,shieldKind:'round',shieldR:7,helm:U?'kettle':'cap',helmCol:'#7a7a82',capCol:'#7a5a3a',armor:'#7a5a3a',cloth:'#5a4a2a',legs:'#4a3a22',hunch:4,sc:U?.88:.8,mood:2,eyeCol:'#e0a010',noPauld:!U,up:U,beltCol:'#3a2a18',cape:null,bladeCol:'#8a6a3a'});
      else if(rn(/Dríade/))humanoid(x,{pal:P,robe:1,skin:P[0],armor:'#8a6a40',cloth:U?'#58b04a':'#4f9a3e',hair:U?'#2f6a3a':'#4a7a3a',hairLong:1,helm:'leaf',weapon:'staff',staffKind:'crook',orb:'#c8ff8a',blush:1,mood:3,up:U,sleeve:P[0],bareArms:1,eyeCol:'#b82',noSash:0,cape:U?'#3a8a3a':null,lean:1,sc,wings:U?'#c8f0a0':null,wingStyle:'bat',noPauld:1});
      else if(rn(/Bandido/))humanoid(x,{pal:P,weapon:'cutlass',helm:'hood',hoodCol:'#4a3a30',cloth:P[0],armor:'#5a3a2a',sleeve:'#4a3a30',grin:1,mood:2,skin:'#d8b090',hair:null,legs:'#3a3028',noPauld:1,bracer:'#3a2a20',sc,lean:2});
      else if(rn(/Mercenario/))humanoid(x,{pal:P,weapon:'sword',shield:P[1],shieldKind:'round',helm:'nasal',tabard:1,tabardCol:P[1],chain:1,greaves:1,sc,hair:'#4a3020',mood:1,helmCol:'#9aa0ac',bulk:1});
      else humanoid(x,{pal:P,weapon:'sword',shield:P[1],helm:'nasal',tabard:1,sc,chain:1});
      break;
    case'arch':
      if(rn(/Ballestero Real|Ballestero de Élite/))humanoid(x,{pal:P,weapon:'xbow',helm:U?'hood':'nasal',hoodCol:P[1],helmCol:'#b4bcc8',armor:P[0],cloth:P[1],tabard:1,tabardCol:P[1],chain:1,cape:U?P[1]:null,up:U,sc,hair:'#6a4a2a',mood:2,bowCol:'#6a4a2a',lean:2.5,sleeve:'#6a5a4a'});
      else if(rn(/Élfico|Silvano/))humanoid(x,{pal:P,weapon:'bow',helm:'hood',hoodCol:U?'#3f8a42':P[0],ears:'elf',hair:'#d8c868',skin:'#f0dcc0',armor:P[0],cloth:P[1],sleeve:'#5a7a3a',legs:'#5a4a2a',cape:U?'#2f6a34':null,mood:2,up:U,sc,eyeCol:'#2a9a4a',bowCol:'#c8a860',noPauld:1,bracer:'#7a5a2a',lean:2,boot:'#4a3820'});
      else if(rn(/Enano|Rúnico/))humanoid(x,{pal:P,dwarf:1,weapon:'xbow',helm:'dwarf',helmCol:'#7a6a60',beard:U?'#d0a050':'#a0522d',skin:'#e0b090',armor:P[0],cloth:'#5a4a38',chain:1,greaves:1,mood:1,up:U,sc,legs:'#4a3a2c',bowCol:P[1],hair:'#6a3a1a'});
      else if(rn(/Arponero/))humanoid(x,{pal:P,weapon:'harpoon',helm:'cap',capCol:P[0],skin:'#d8a880',armor:P[0],cloth:P[1],sleeve:P[1],bareArms:1,mood:2,hair:'#3a2a1a',up:U,sc,legs:'#3a4a62',boot:'#2a1810',noPauld:1,cape:U?P[0]:null,beard:U?'#6a4a2a':null,grin:1,lean:2});
      else humanoid(x,{pal:P,weapon:'bow',helm:'hood',sc});
      break;
    case'mage':
      if(rn(/Sacerdote|Prelado/))humanoid(x,{pal:P,robe:1,weapon:'staff',staffKind:'crook',orb:P[2],helm:'mitre',helm2:U?'halo':null,hair:'#d8d4c0',beard:U?'#e8e4d8':null,cloth:P[0],armor:P[1],noSash:0,cape:U?'#ffd75a':null,sleeve:P[0],mood:3,up:U,sc,eyeCol:'#37b',lean:1});
      else if(rn(/Rúnico/))humanoid(x,{pal:P,dwarf:1,robe:1,weapon:'staff',orb:P[1],helm:'hat',beard:U?'#d0d4e0':'#8a8a98',cloth:P[0],armor:P[1],mood:2,up:U,sc,skin:'#e0b090',cape:U?shade(P[0],-.3):null,lean:1});
      else if(rn(/Marino|de Tormenta/))humanoid(x,{pal:P,robe:1,weapon:'staff',staffKind:'crook',orb:P[1],helm:'hat',cloth:P[0],armor:P[1],skin:'#d8b898',beard:U?'#e8e8f0':null,hair:'#e8e8f0',mood:2,up:U,sc,cape:U?shade(P[0],-.3):null,lean:1,eyeCol:'#18a'});
      else if(rn(/Pantanoso|Venenoso/))humanoid(x,{pal:P,robe:1,headKind:'lizard',skin:P[0],frill:P[1],weapon:'staff',staffKind:'skull',orb:P[1],helm:U?'horns':null,hornCol:'#efe6cc',helmCol:'#5a4a2a',cloth:P[2],armor:P[0],sleeve:P[2],mood:1,up:U,sc,cape:U?shade(P[2],-.2):null,hunch:2,lean:1});
      else if(rn(/Chamán/))humanoid(x,{pal:P,robe:1,headKind:'orc',skin:P[0],weapon:'staff',staffKind:'skull',orb:P[1],helm:'horns',helmCol:'#6a5a4a',hornCol:'#efe6cc',cloth:P[1],armor:'#6a4a32',sleeve:P[1],bareArms:0,hunch:2,mood:1,up:U,sc,cape:U?P[1]:null,lean:1});
      else humanoid(x,{pal:P,robe:1,weapon:'staff',helm:'hat',orb:P[2],sc,hair:'#d8d4c0'});
      break;
    case'cav':
      if(F===4)mounted(x,{h:{c:'#6a4a3a',mane:'#2a1a12',sc:sc*.98,bard:null},r:{pal:P,dwarf:1,weapon:rn(/Colmillo/)?'axe':'spear',pennant:U?P[1]:null,helm:'dwarf',helmCol:'#6a6a74',beard:'#a0522d',skin:'#e0b090',armor:P[0],cloth:'#5a4a38',shield:P[1],shieldKind:'round',shieldR:8,up:U,mood:1,sc:.7,greaves:1}});
      else if(F===2)mounted(x,{h:{c:'#26262e',mane:U?'#ff5a20':'#7a1a2a',eyeGlow:1,sc:sc*.98,bard:U?'#2a1220':'#3a1a24',acc:'#a0182a',up:U},r:{pal:P,weapon:'sword',helm:U?'horns':'great',helmCol:'#3a3a48',hornCol:'#8a8a98',plume:P[1],visor:'rgba(255,60,40,.95)',cape:P[1],shield:null,greaves:1,armor:P[0],cloth:'#2a2a38',bladeCol:'#8a1a2a',up:U,bulk:1,sc:.7}});
      else mounted(x,{h:{c:'#f4f0e8',mane:'#e8d8b0',bard:P[1],acc:GOLD,sc:sc*.98,up:U},r:{pal:P,weapon:'spear',pennant:P[1],helm:'great',plume:P[2],cape:P[1],shield:P[1],greaves:1,armor:P[0],cloth:P[1],helmCol:'#d8dce8',up:U,bulk:1,sc:.7}});
      break;
    case'cent':{
      horse(x,{c:P[0],mane:P[2],noHead:1,sc:sc*.97,bard:null,belly:shade(P[0],.12)});
      x.save();x.translate(14,-27);humanoid(x,{pal:P,halfBody:1,noShadow:1,weapon:'bow',sc:.84,hair:U?'#c8a850':'#6a3a1a',skin:'#e8c4a0',armor:P[1],cloth:P[1],bare:1,bareArms:1,harness:'#6a4a2a',ears:'elf',mood:2,bowCol:P[2],up:U,noPauld:1,lean:2,cape:U?P[1]:null,helm:U?'leaf':null,eyeCol:'#4a8a3a'});x.restore();break}
    case'orc':
      if(rn(/Troll/))humanoid(x,{pal:P,skin:P[0],headKind:'orc',bare:1,bareArms:1,weapon:'club',hunch:5,reach:3,bulk:1,sc:1.1,legs:'#5a6a50',cloth:'#4a3a28',mood:1,noPauld:0,pauldFur:'#5a4a3a',eyeCol:'#e0a010',clubCol:'#6a4a2a',lean:3});
      else if(rn(/Arquero|Cazador/))humanoid(x,{pal:P,skin:P[0],headKind:'orc',bare:1,bareArms:1,weapon:cr.shoot?'bow':'axe',axeCol:'#9a9aa4',helm:'horns',helmCol:'#6a5a4a',harness:'#5a3a22',legs:'#4a3a28',cloth:'#4a3a28',bulk:1,hunch:3,sc:sc*1.04,up:U,pauldFur:U?'#6a4a32':null,mood:1,bowCol:'#6a4a2a',lean:2.5,eyeCol:'#e02010',noPauld:0});
      else humanoid(x,{pal:P,skin:P[0],headKind:'orc',bare:1,bareArms:1,weapon:'club',clubCol:U?'#6a4a2a':null,helm:U?'horns':null,helmCol:'#6a5a4a',harness:'#5a3a22',legs:'#5a4a38',cloth:'#4a3a28',bulk:1,hunch:4,sc:sc*1.12,up:U,pauldFur:'#6a4a32',mood:1,lean:3,eyeCol:'#d02010',cape:null});
      break;
    case'giant':humanoid(x,{pal:P,skin:P[0],headKind:'orc',cyclops:1,bare:1,bareArms:1,weapon:'club',clubCol:U?'#6a4a2a':null,helm:U?'crown':null,harness:'#6a4a32',legs:'#6a5a42',cloth:'#6a4a32',bulk:1,hunch:3,sc:sc*1.2,up:U,pauldFur:'#7a5a3a',mood:1,lean:3,cape:U?'#7a2a2a':null,eyeCol:'#c01010'});break;
    case'angel':
      humanoid(x,{pal:P,robe:1,armor:P[0],cloth:U?'#fffaf0':P[0],skin:'#ffe8d0',wings:'#fffdf4',weapon:'sword',bladeCol:null,helm:'none',helm2:'halo',hair:'#f0d880',sc:sc*1.04,mood:3,eyeCol:'#39f',up:U,noPauld:0,cape:U?'#ffe27a':null,sleeve:P[0],lean:1,blush:1});
      x.save();x.globalCompositeOperation='lighter';x.fillStyle=rg(x,48,44,4,46,['rgba(255,240,180,.35)','rgba(255,240,180,0)']);x.fillRect(0,0,96,96);x.restore();break;
    case'undead':
      if(rn(/Zombi/))humanoid(x,{pal:P,skin:P[0],headKind:'orc',zombie:1,bare:1,bareArms:1,ribs:1,hunch:5,legs:'#5a4a38',cloth:'#5a4a38',mood:3,eyeCol:'#d8e060',pupil:'#400',noPauld:1,sc,reach:6,handDy:-3,lean:3,up:U,hair:null,beltCol:'#4a3a28',harness:U?'#4a4a38':null});
      else humanoid(x,{pal:P,skull:1,weapon:rn(/Guerrero/)?'axe':'sword',axeCol:'#8a7a6a',bladeCol:'#aab0b4',shield:rn(/Guerrero/)?'#5a5a64':'#7a5a38',shieldKind:rn(/Guerrero/)?'tower':'round',shieldR:rn(/Guerrero/)?8:8,helm:rn(/Guerrero/)?'kettle':null,helmCol:'#6a6a70',glow:U?'#4cf':'#fb2',rags:U?'#7a2a2a':'#8a7a5a',up:U,sc,sleeve:'#d9d4be',lean:2,hunch:2,plume:null});
      break;
    case'lich':humanoid(x,{pal:P,skull:1,robe:1,armor:P[0],cloth:P[0],weapon:'staff',staffKind:'skull',orb:P[1],glow:P[1],helm:U?'hood':'crown',hoodCol:shade(P[0],-.2),cape:U?shade(P[0],-.3):null,up:U,sc:sc*1.03,sleeve:P[0],lean:1,noSash:0});break;
    case'vamp':humanoid(x,{pal:P,skin:'#e8e0ea',armor:P[0],cloth:shade(P[0],-.15),accent:P[1],cape:shade(P[1],-.1),wings:U?shade(P[0],-.1):null,wingStyle:'bat',weapon:U?'sword':'none',bladeCol:'#c8d0e0',fangs:1,eyeCol:'#e01818',hair:'#14101c',sleeve:P[0],mood:2,up:U,sc,tabard:1,tabardCol:P[1],noPauld:0,greaves:0,legs:'#1a1620',lean:2.5,reach:U?0:3,handDy:U?0:-2});break;
    case'demon':
      if(rn(/Súcubo/))humanoid(x,{pal:P,skin:shade(P[0],.32),bare:1,bareArms:1,harness:'#2a1018',wings:shade(P[0],-.15),wingStyle:'bat',tail:shade(P[0],-.1),tailTip:P[1],weapon:'whip',helm:'horns',helmCol:'#4a2a38',hornCol:'#3a2030',hair:'#2a1020',hairLong:1,fangs:1,mood:2,eyeCol:P[1],legs:P[0],boot:'#2a1018',sleeve:shade(P[0],.32),noPauld:1,up:U,sc:sc*.98,blush:0,lean:2,cloth:'#2a1018',tabard:1,tabardCol:'#2a1018',cape:null});
      else if(rn(/Archidemonio/))humanoid(x,{pal:P,skin:'#8a2a3a',armor:shade(P[0],-.3),cloth:shade(P[0],-.2),wings:shade(P[0],-.1),wingStyle:'bat',tail:shade(P[0],-.15),tailTip:P[1],weapon:'sword',bladeCol:'#ffb040',helm:'horns',helmCol:'#2a1a28',hornCol:'#d0c0a0',spikes:1,greaves:1,bulk:1,sc:sc*1.16,eyeCol:P[1],fangs:1,mood:1,cape:shade(P[1],-.55),up:U,lean:2.5,legs:shade(P[0],-.3),tabard:1,tabardCol:shade(P[0],-.1),boot:'#1a1018',visor:null,beltCol:'#2a1018'});
      else humanoid(x,{pal:P,skin:P[0],bare:1,bareArms:1,harness:'#3a2018',wings:shade(P[0],-.2),wingStyle:'bat',tail:shade(P[0],-.15),tailTip:P[1],weapon:rn(/Señor/)?'axe':'club',axeCol:'#6a6a76',clubCol:'#3a2a28',helm:'horns',helmCol:'#4a2a28',hornCol:'#e8dcc0',bulk:1,fangs:1,mood:1,eyeCol:P[1],legs:P[0],sleeve:P[0],hunch:3,sc:sc*1.1,up:U,spikes:U,pauldFur:null,lean:3,boot:'#2a1410',cloth:'#3a2018',bare2:1});
      if(T>=5){x.save();x.globalCompositeOperation='lighter';x.fillStyle=rg(x,48,60,4,46,['rgba(255,110,40,.28)','rgba(255,110,40,0)']);x.fillRect(0,0,96,96);x.restore()}
      break;
    case'beast':
      if(rn(/Unicornio/)){horse(x,{c:'#fafafa',mane:U?'#f0c8ff':'#d8c8ff',horn:1,sc:sc*.94,belly:'#f0eef8',acc:P[2]});x.save();x.globalCompositeOperation='lighter';for(let i=0;i<(U?7:4);i++)cdot(x,12+((i*29)%72),14+((i*41)%50),1.2+(i%2),'rgba(255,255,220,.85)');x.restore()}
      else if(rn(/Cancerbero/))cerberus(x,{c:P[0],flame:P[1],up:U,sc});
      else if(rn(/Oso/))bear(x,{c:P[0],sc:sc*1.02});
      else if(rn(/Rata/))rat(x,{c:P[0],sc});
      else wolf(x,{c:P[0],c2:P[1],eyeGlow:U||rn(/Salvaje/)?0:0,spiky:U,sc:sc*(U?1.04:1)});
      break;
    case'bird':
      if(rn(/Gárgola/))gargoyle(x,{c:P[0],lava:U});
      else if(rn(/Mantícora/))manticora(x,{c:P[0],mane:P[1],w:'#7a2a2a'});
      else griffin(x,{c:P[0],c2:P[1],fe:F===7?'#f0f4ff':'#f4ecd8',thunder:F===7,beak:'#f0b838',pal:P});
      break;
    case'dragon':
      if(rn(/Leviatán/))leviathan(x,{c:P[0],c2:P[1],ac:P[2]});
      else if(rn(/Esmeralda|Jade/))dragon(x,{c:P[0],c2:P[1],ac:P[2],elf:1,horn:P[1],open:U});
      else if(rn(/Óseo|Espectral/))dragon(x,{c:P[0],c2:P[1],ac:P[2],bone:1,ghost:rn(/Espectral/),wcol:rn(/Espectral/)?'#7aaa9a':'#6a6a62',horn:'#f4f0dc',open:1});
      else if(rn(/Fétido|Pútrido/))dragon(x,{c:P[0],c2:P[1],ac:P[2],rot:1,spine:shade(P[0],-.2),horn:'#d8d0a8',open:1});
      else dragon(x,{c:P[0],c2:P[1],ac:P[2],fire:cr.breath,horn:'#efe2c0'});
      break;
    case'ghost':
      if(rn(/Ifrit/))genie(x,{c:P[0],c2:P[1],pal:P,up:U});
      else if(rn(/Elemental/))elemental(x,{c:P[0],c2:P[1],ice:rn(/Hielo/)});
      else ghost(x,{c:P[0],c2:P[1],ac:P[2],howl:rn(/Aullante/)});
      break;
    case'golem':golem(x,{c:P[0],c2:P[1],ac:P[2],big:cr.big,moss:rn(/Roca|Titán|Barro/),band:rn(/Hierro/)?'#5a5a66':null,crystal:rn(/Cristal/),horns:rn(/Titán/)});break;
    case'tree':ent(x,{c:P[0],c2:P[1],ac:P[2],old:U});break;
    case'serp':serpent(x,{c:P[0],c2:P[1],ac:P[2],wings:rn(/Alada|Quimera/),crest:rn(/Basilisco/)?1:0,goat:rn(/Quimera/)});break;
    case'naga':mermaid(x,{c:P[0],c2:P[1],pal:P,bow:cr.shoot,hair:U?'#f088d8':'#e87aa8',up:U});break;
    case'kraken':kraken(x,{c:P[0],c2:P[1],ac:P[2]});break;
    case'crab':crab(x,{c:P[0],c2:P[1]});break;
    case'frog':humanoid(x,{pal:P,headKind:'frog',skin:P[0],armor:'#7a5a32',cloth:P[2],weapon:'spear',pennant:U?P[1]:null,bareArms:1,sleeve:P[0],bare:0,legs:P[0],bare2:1,hunch:3,sc:.92,mood:1,noPauld:!U,up:U,beltCol:'#4a3418',lean:2.5,cape:null,helm:U?'crown':null});break;
    case'hydra':hydra(x,{c:P[0],c2:P[1],ac:P[2],heads:rn(/Cinco/)?5:3});break;
    case'imp':imp(x,{c:P[0],c2:P[1],ac:P[2],kind:rn(/Hada/)?'fairy':rn(/Duende/)?'sprite':'imp'});break;
    case'insect':spider(x,{c:P[0],c2:P[1],ac:P[2]});break;
    default:humanoid(x,{pal:P,weapon:'sword',helm:'nasal',sc});
  }}catch(e){console.error('creatura',nm,e)}
  // luz suave general
  x.save();x.globalCompositeOperation='source-atop';x.fillStyle=lg(x,0,0,70,96,['rgba(255,250,230,.14)','rgba(255,255,255,0)','rgba(14,4,40,.2)']);x.fillRect(0,0,96,96);x.restore();
  try{polishSprite(c,{rim:'#fff3c8',bounce:(P&&P[2])||'#6aa0ff',grain:.16,mat:matOf(cr),up:U})}catch(e){console.warn('polish',e)}
  if(U){// aura dorada de criatura mejorada (por detrás) + estrella
    x.save();x.globalCompositeOperation='destination-over';x.fillStyle=rg(x,48,52,6,50,['rgba(255,224,120,.34)','rgba(255,200,80,.12)','rgba(255,200,80,0)']);x.fillRect(0,0,96,96);x.restore();
    x.save();x.shadowColor='rgba(255,220,100,.9)';x.shadowBlur=4;poly(x,[[84,5],[86,11],[92,13],[86,15],[84,21],[82,15],[76,13],[82,11]],'#ffe27a',OUT,.8);x.restore()}
  return c;
}

function creatureSprite(id,flip){const key='c'+id+(flip?'f':'');if(Gfx.cache[key])return Gfx.cache[key];
  const base=Gfx.cache['c'+id]||(Gfx.cache['c'+id]=drawCreatureRaw(CR[id]));if(!flip)return base;
  const c=mkc(96,96),x=c.ctx;x.translate(96,0);x.scale(-1,1);x.drawImage(base,0,0,96,96);return Gfx.cache[key]=c}
// ---------- retratos de héroe ----------
function portrait(fi,idx,cls,sz=64){
  const key='p'+fi+'_'+idx+'_'+cls+'_'+sz;if(Gfx.cache[key])return Gfx.cache[key];
  const c=mkc(64,64),x=c.ctx,r=mulberry(fi*131+idx*17+cls*5+3),F=FDEF[fi],P0=F.col[0],P1=F.col[1],P2=F.col[2];
  const SK={1:['#f6dcc4','#ecc8a8','#dcb894'],2:['#d8d8e4','#c4c4d8','#b0b8cc'],3:['#c8503a','#a8402e','#d8805a','#9a3a2c'],6:['#8ab060','#6a9850','#a0c070'],7:['#f0d8c4','#e8d0b8','#dcc0a4'],5:['#e8c090','#c88a60','#a86a44','#f0d0a8']}[fi]||['#f0c8a0','#e0b088','#c88a60','#a86a44','#f4d4b8','#8a5a3a'];
  const skin=SK[Math.floor(r()*SK.length)],skD=shade(skin,-.28),skL=shade(skin,.22);
  const hairC=fi===7?['#f0f0f4','#d8dce8']:fi===3?['#1c1010','#601818']:fi===2?['#e8e8f0','#1a1620']:['#3a2412','#8a5a2a','#d8b858','#e8e8e8','#222','#a03a1a','#5a3a6a'];
  const hair=hairC[Math.floor(r()*hairC.length)],dwarf=fi===4,elf=fi===1,orc=fi===6,dem=fi===3,pale=fi===2;
  // fondo temático
  x.fillStyle=lg(x,0,0,0,64,[shade(P0,.15),shade(P1,-.2)]);x.fillRect(0,0,64,64);
  x.save();x.beginPath();x.rect(0,0,64,64);x.clip();
  if(fi===0){x.fillStyle='rgba(255,240,190,.2)';for(let i=0;i<9;i++){x.beginPath();x.moveTo(32,18);x.lineTo(32+Math.cos(i*.7)*60,18+Math.sin(i*.7)*60);x.lineTo(32+Math.cos(i*.7+.28)*60,18+Math.sin(i*.7+.28)*60);x.fill()}}
  else if(fi===1){for(let i=0;i<6;i++){ell(x,6+i*11,6+(i%2)*5,9,8,'rgba(30,90,40,.55)')}for(let i=0;i<5;i++){x.fillStyle='rgba(20,60,24,.5)';x.fillRect(4+i*13,0,4,40)}}
  else if(fi===2){ell(x,48,14,8,8,'rgba(230,240,255,.85)');ell(x,51,12,7,7,shade(P1,-.1));x.fillStyle='rgba(150,255,190,.18)';x.fillRect(0,40,64,24)}
  else if(fi===3){x.fillStyle=rg(x,32,64,2,50,['rgba(255,140,40,.7)','rgba(255,60,20,0)']);x.fillRect(0,0,64,64)}
  else if(fi===4){x.strokeStyle='rgba(0,0,0,.18)';x.lineWidth=.8;for(let y=0;y<64;y+=9){x.beginPath();x.moveTo(0,y);x.lineTo(64,y);x.stroke();for(let xx=(y/9%2)*8;xx<64;xx+=16){x.beginPath();x.moveTo(xx,y);x.lineTo(xx,y+9);x.stroke()}}}
  else if(fi===5){x.strokeStyle='rgba(255,255,255,.35)';x.lineWidth=1.2;for(let k=0;k<4;k++){x.beginPath();for(let xx=0;xx<=64;xx+=3)x.lineTo(xx,40+k*7+Math.sin(xx*.25+k)*2);x.stroke()}}
  else if(fi===6){x.fillStyle='rgba(180,220,120,.18)';x.fillRect(0,30,64,34);x.strokeStyle='rgba(40,60,20,.6)';x.lineWidth=1.4;for(let i=0;i<8;i++){x.beginPath();x.moveTo(3+i*8,64);x.lineTo(5+i*8+(i%3),32+(i%2)*8);x.stroke()}}
  else{x.fillStyle='rgba(30,30,70,.35)';ell(x,14,12,18,8,'rgba(60,60,100,.5)');ell(x,50,10,18,8,'rgba(60,60,100,.5)');x.strokeStyle='rgba(255,255,255,.8)';x.lineWidth=1;x.beginPath();x.moveTo(50,14);x.lineTo(46,22);x.lineTo(50,24);x.lineTo(45,34);x.stroke()}
  x.restore();
  // capa / hombros
  const cloak=cls?P1:P0,arm=cls?shade(P1,.05):'#a8b0c4';
  if(cls||pale||elf||orc){poly(x,[[0,64],[4,48],[14,43],[50,43],[60,48],[64,64]],bodyG(x,0,43,0,64,cloak),OUT,1.4)}
  else{poly(x,[[0,64],[3,50],[15,44],[49,44],[61,50],[64,64]],bodyG(x,0,44,0,64,arm),OUT,1.4);ell(x,10,50,9,6.5,lg(x,0,44,0,56,[shade(arm,.35),arm,shade(arm,-.35)]),OUT,1.2);ell(x,54,50,9,6.5,lg(x,0,44,0,56,[shade(arm,.35),arm,shade(arm,-.35)]),OUT,1.2);for(const px of[10,54]){x.fillStyle=P0;ell(x,px,49,2.2,2.2,P0,OUT,.7)}}
  // gorguera / cuello
  x.fillStyle=skD;x.fillRect(27,37,10,10);poly(x,[[19,44],[32,60],[45,44],[39,41],[32,48],[25,41]],cls?shade(P2,-.05):shade(P0,.1),OUT,1.1);
  if(!cls&&!dem){poly(x,[[22,44],[32,54],[42,44],[32,46]],shade(arm,-.25),OUT,.8)}
  if(fi===3&&!cls){for(const s of[-1,1])poly(x,[[32+s*14,44],[32+s*18,36],[32+s*20,46]],'#2a1210',OUT,1)}
  // orejas
  const hr=dwarf?13.2:11.4,hv=dwarf?12:13.6;
  for(const s of[-1,1]){if(elf)poly(x,[[32+s*10,26],[32+s*22,16],[32+s*11,34]],skin,OUT,1.2);else if(orc)poly(x,[[32+s*10,26],[32+s*18,20],[32+s*10,33]],skin,OUT,1.1);else ell(x,32+s*(hr-.5),29,2.4,3.6,skin,OUT,1.1)}
  // pelo trasero largo
  if(!dwarf&&!dem&&(idx%2===1||elf||(cls&&fi===5))){x.beginPath();x.moveTo(17,22);x.quadraticCurveTo(10,40,16,52);x.lineTo(48,52);x.quadraticCurveTo(54,40,47,22);x.closePath();x.fillStyle=bodyG(x,17,10,47,52,hair);x.fill();x.strokeStyle=OUT;x.lineWidth=1.3;x.stroke()}
  // cara
  x.beginPath();x.moveTo(32-hr,26);x.quadraticCurveTo(32-hr,16,32,14);x.quadraticCurveTo(32+hr,16,32+hr,26);x.quadraticCurveTo(32+hr,dwarf?38:41,32,dwarf?40:42);x.quadraticCurveTo(32-hr,dwarf?38:41,32-hr,26);x.closePath();
  x.fillStyle=rg(x,27,22,1,22,[skL,skin,skD]);x.fill();x.strokeStyle=OUT;x.lineWidth=1.4;x.stroke();
  x.fillStyle='rgba(220,90,70,.18)';ell(x,24,32,3.4,2.2,'rgba(220,90,70,.18)');ell(x,40,32,3.4,2.2,'rgba(220,90,70,.18)');
  // ojos
  const eyeC=pale||fi===6||dem?(dem?'#ffd040':'#8affb0'):['#2a5a8a','#3a7a3a','#5a3a1a','#7a2a2a','#6a6a7a'][Math.floor(r()*5)];
  const ey=dwarf?27:28;ell(x,26.5,ey,3.1,2.4,'#f4f0e8',OUT,.9);ell(x,37.5,ey,3.1,2.4,'#f4f0e8',OUT,.9);ell(x,27,ey,1.6,1.7,eyeC);ell(x,37,ey,1.6,1.7,eyeC);ell(x,27,ey,.7,.8,'#0a0610');ell(x,37,ey,.7,.8,'#0a0610');x.fillStyle='#fff';x.fillRect(27.2,ey-1.2,.8,.8);x.fillRect(37.2,ey-1.2,.8,.8);
  if(pale||fi===6||dem){x.fillStyle=eyeC==='#ffd040'?'rgba(255,200,60,.4)':'rgba(140,255,170,.35)';ell(x,26.5,ey,5,3.6,x.fillStyle);ell(x,37.5,ey,5,3.6,x.fillStyle)}
  x.strokeStyle=shade(hair,-.1);x.lineWidth=1.6;x.lineCap='round';x.beginPath();x.moveTo(22.5,ey-4.4);x.lineTo(29,ey-5.2+(idx%2)*.8);x.moveTo(35,ey-5.2+(idx%2)*.8);x.lineTo(41.5,ey-4.4);x.stroke();
  // nariz y boca
  x.strokeStyle=skD;x.lineWidth=1.1;x.beginPath();x.moveTo(32,29.5);x.quadraticCurveTo(30.5,34,32.5,34.5);x.stroke();x.fillStyle=skL;ell(x,31.4,31,.9,2,skL);
  x.strokeStyle='rgba(70,26,20,.9)';x.lineWidth=1.3;x.beginPath();if(idx%3===1){x.moveTo(28.5,37.5);x.quadraticCurveTo(32,40,35.5,37.5)}else{x.moveTo(29,37.6);x.quadraticCurveTo(32,38.6,35,37.6)}x.stroke();
  if(orc){for(const s of[-1,1])poly(x,[[32+s*3.4,38.2],[32+s*4.4,34.4],[32+s*5.4,38.6]],'#f4f0d0',OUT,.7)}
  // cicatriz / marca
  if(idx%4===2&&!cls){x.strokeStyle='rgba(120,40,40,.7)';x.lineWidth=1;x.beginPath();x.moveTo(36,21);x.lineTo(40,31);x.stroke()}
  // barba / bigote
  const beard=dwarf||(idx%3===0&&!elf&&!dem&&fi!==5&&(cls||idx%2===0))||(fi===7&&cls);
  if(beard){const bl=dwarf?22:fi===7?20:9;x.beginPath();x.moveTo(20,32);x.quadraticCurveTo(21,32+bl,32,36+bl);x.quadraticCurveTo(43,32+bl,44,32);x.quadraticCurveTo(38,35,32,34.6);x.quadraticCurveTo(26,35,20,32);x.fillStyle=lg(x,0,32,0,32+bl,[shade(hair,.15),hair,shade(hair,-.3)]);x.fill();x.strokeStyle=OUT;x.lineWidth=1.3;x.stroke();
    if(dwarf){x.strokeStyle='rgba(0,0,0,.35)';x.lineWidth=.8;for(let i=0;i<5;i++){x.beginPath();x.moveTo(24+i*4,38);x.lineTo(25+i*3.4,38+bl*.7);x.stroke()}for(const px of[24,40]){ell(x,px,32+bl*.7,2.2,2.2,P2,OUT,.8)}}
    x.strokeStyle='rgba(70,26,20,.9)';x.lineWidth=1.2;x.beginPath();x.moveTo(29,37.8);x.quadraticCurveTo(32,38.8,35,37.8);x.stroke()}
  // tocados por facción y clase
  const helm=(col)=>{x.beginPath();x.arc(32,24,hr+2.2,Math.PI*1.02,Math.PI*1.98);x.lineTo(32+hr+1,27);x.lineTo(32-hr-1,27);x.closePath();x.fillStyle=lg(x,18,8,46,8,[shade(col,.4),col,shade(col,-.4)]);x.fill();x.strokeStyle=OUT;x.lineWidth=1.4;x.stroke();x.fillStyle=lg(x,0,18,0,24,[shade(col,.2),shade(col,-.25)]);x.fillRect(20,18,24,3);x.strokeStyle=OUT;x.lineWidth=.9;x.strokeRect(20,18,24,3)};
  const brows=()=>{};
  switch(fi){
    case 0:if(cls){x.beginPath();x.moveTo(15,36);x.quadraticCurveTo(12,10,32,5);x.quadraticCurveTo(52,10,49,36);x.lineTo(44,26);x.quadraticCurveTo(32,10,20,26);x.closePath();x.fillStyle=bodyG(x,0,5,0,36,'#f4f0e4');x.fill();x.strokeStyle=OUT;x.lineWidth=1.4;x.stroke();ell(x,32,12,12,3,'rgba(255,230,120,.9)',null);x.strokeStyle='#e8c25a';x.lineWidth=2;x.beginPath();x.ellipse(32,8,11,3,0,0,6.28);x.stroke()}
      else{helm('#b8c0d0');poly(x,[[30,6],[34,6],[34,26],[30,26]],P0,OUT,.9);x.fillStyle=P1;x.beginPath();x.moveTo(32,6);x.quadraticCurveTo(46,-4,48,10);x.quadraticCurveTo(40,2,32,8);x.fill();x.strokeStyle=OUT;x.stroke()}break;
    case 1:{x.beginPath();x.moveTo(14,30);x.quadraticCurveTo(10,6,32,5);x.quadraticCurveTo(54,6,50,30);x.lineTo(46,22);x.quadraticCurveTo(32,10,18,22);x.closePath();x.fillStyle=bodyG(x,0,5,0,30,cls?shade(P1,-.1):hair);x.fill();x.strokeStyle=OUT;x.lineWidth=1.3;x.stroke();
      for(let i=0;i<7;i++){const a=Math.PI*(1.1+i*.13);const lx=32+Math.cos(a)*14,ly=24+Math.sin(a)*14;poly(x,[[lx,ly],[lx+3,ly-5],[lx+6,ly]],i%2?'#8ad060':'#5aa040',OUT,.8)}ell(x,32,12.5,2.2,2.2,'#ffe27a',OUT,.8);break}
    case 2:if(cls){x.beginPath();x.moveTo(13,40);x.quadraticCurveTo(8,6,32,3);x.quadraticCurveTo(56,6,51,40);x.lineTo(45,28);x.quadraticCurveTo(32,10,19,28);x.closePath();x.fillStyle=bodyG(x,0,3,0,40,'#2a2038');x.fill();x.strokeStyle=OUT;x.lineWidth=1.4;x.stroke();ell(x,32,12,3.4,3,'#e8e4d0',OUT,.9);x.fillStyle='#10180f';x.fillRect(30.6,11,1.2,1.4);x.fillRect(32.8,11,1.2,1.4)}
      else{helm('#3c3448');for(const s of[-1,1])poly(x,[[32+s*12,12],[32+s*20,0],[32+s*15,14]],'#e8e4d0',OUT,1);x.fillStyle='rgba(140,255,170,.6)';x.fillRect(28,19,8,1.6)}break;
    case 3:if(cls){poly(x,[[18,18],[32,4],[46,18],[40,16],[32,10],[24,16]],bodyG(x,0,4,0,18,'#3a1a14'),OUT,1.3)}
      else helm('#6a2a22');for(const s of[-1,1]){x.beginPath();x.moveTo(32+s*10,14);x.quadraticCurveTo(32+s*18,12,32+s*19,2);x.quadraticCurveTo(32+s*13,6,32+s*7,11);x.closePath();x.fillStyle=lg(x,0,2,0,14,['#f0e4c0','#a88a60','#4a3220']);x.fill();x.strokeStyle=OUT;x.lineWidth=1.2;x.stroke()}break;
    case 4:if(cls){x.beginPath();x.moveTo(14,38);x.quadraticCurveTo(10,8,32,5);x.quadraticCurveTo(54,8,50,38);x.lineTo(44,24);x.quadraticCurveTo(32,10,20,24);x.closePath();x.fillStyle=bodyG(x,0,5,0,38,'#5a5a64');x.fill();x.strokeStyle=OUT;x.lineWidth=1.3;x.stroke();for(let i=0;i<3;i++){x.strokeStyle='#ffb040';x.lineWidth=1.2;x.beginPath();x.moveTo(26+i*6,9);x.lineTo(28+i*6,15);x.moveTo(27+i*6,12);x.lineTo(30+i*6,12);x.stroke()}}
      else{helm('#9a9aa4');poly(x,[[30,3],[34,3],[34,18],[30,18]],'#e8a040',OUT,.9);for(const s of[-1,1]){x.beginPath();x.moveTo(32+s*11,14);x.quadraticCurveTo(32+s*22,12,32+s*18,2);x.quadraticCurveTo(32+s*14,8,32+s*8,10);x.fillStyle='#e8e0c8';x.fill();x.strokeStyle=OUT;x.lineWidth=1.2;x.stroke()}}break;
    case 5:if(cls){x.fillStyle=lg(x,0,6,0,24,[hair,shade(hair,-.3)]);x.beginPath();x.moveTo(17,24);x.quadraticCurveTo(15,6,32,6);x.quadraticCurveTo(49,6,47,24);x.quadraticCurveTo(32,14,17,24);x.fill();x.strokeStyle=OUT;x.lineWidth=1.3;x.stroke();for(let i=0;i<5;i++){poly(x,[[22+i*5,10-(i%2)*2],[24+i*5,0],[26+i*5,10-(i%2)*2]],i%2?'#ff9a8a':'#ffd0c0',OUT,.9)}ell(x,32,11,2.6,2.6,'#fff',OUT,.8)}
      else{x.fillStyle=lg(x,0,8,0,26,[shade('#2a78b8',.2),'#1a4a7a']);x.beginPath();x.moveTo(12,22);x.quadraticCurveTo(20,6,32,8);x.quadraticCurveTo(44,6,52,22);x.quadraticCurveTo(32,16,12,22);x.fill();x.strokeStyle=OUT;x.lineWidth=1.4;x.stroke();x.strokeStyle='#f0e0a0';x.lineWidth=1.6;x.beginPath();x.moveTo(13,22);x.quadraticCurveTo(32,16,51,22);x.stroke();poly(x,[[44,12],[58,2],[52,16]],'#f4f0e0',OUT,1);x.fillStyle=OUT;x.fillRect(24,26.2,6.6,1.2)}break;
    case 6:if(cls){ell(x,32,17,15,10,'#e8e4cc',OUT,1.3);for(const s of[-1,1])ell(x,32+s*6.5,19,3.4,3.6,'#10180f');for(let i=0;i<6;i++){x.strokeStyle=['#d84a2a','#ffe040','#40b0a0'][i%3];x.lineWidth=2.2;x.beginPath();x.moveTo(20+i*4.8,10);x.lineTo(14+i*7,-3);x.stroke()}}
      else{x.fillStyle='#4a3a22';x.fillRect(18,15,28,4);x.strokeStyle=OUT;x.lineWidth=1.1;x.strokeRect(18,15,28,4);for(let i=0;i<5;i++){poly(x,[[20+i*5.5,15],[22.6+i*5.5,3],[25+i*5.5,15]],i%2?'#e8e4cc':'#7ab038',OUT,.9)}}break;
    case 7:if(cls){x.beginPath();x.moveTo(12,22);x.quadraticCurveTo(32,16,52,22);x.lineTo(46,18);x.quadraticCurveTo(40,2,40,-6);x.quadraticCurveTo(32,-2,24,16);x.closePath();x.fillStyle=bodyG(x,0,-6,0,22,'#4a5ab0');x.fill();x.strokeStyle=OUT;x.lineWidth=1.4;x.stroke();ell(x,32,20,19,4,shade('#4a5ab0',-.12),OUT,1.2);for(const[px,py]of[[33,12],[37,6],[30,7]])poly(x,[[px,py-2],[px+.8,py-.6],[px+2,py],[px+.8,py+.6],[px,py+2],[px-.8,py+.6],[px-2,py],[px-.8,py-.6]],'#ffe27a',null)}
      else{helm('#d8dce8');for(const s of[-1,1]){x.beginPath();x.moveTo(32+s*12,14);x.lineTo(32+s*26,6);x.lineTo(32+s*21,12);x.lineTo(32+s*28,14);x.lineTo(32+s*20,17);x.lineTo(32+s*13,19);x.closePath();x.fillStyle='#f4f6fc';x.fill();x.strokeStyle=OUT;x.lineWidth=1.1;x.stroke()}}break;
  }
  if(!cls&&(fi===0||fi===2||fi===7)){ /* visera abierta */ }
  // luz de recorte y viñeta
  x.fillStyle=lg(x,0,0,64,64,['rgba(255,255,255,.18)','rgba(255,255,255,0)','rgba(0,0,20,.28)']);x.fillRect(0,0,64,64);
  x.strokeStyle='#e8c25a';x.lineWidth=2.4;x.strokeRect(1.2,1.2,61.6,61.6);x.strokeStyle='#7a5a1e';x.lineWidth=.9;x.strokeRect(2.9,2.9,58.2,58.2);x.strokeStyle='rgba(0,0,0,.7)';x.lineWidth=1;x.strokeRect(.5,.5,63,63);
  return Gfx.cache[key]=c;
}
// ---------- edificios de ciudad (iconos) y panorama ----------
function buildingSprite(b,fi){
  const key='b'+b+fi;if(Gfx.cache[key])return Gfx.cache[key];const S=TSTYLE[fi],F=FDEF[fi];const c=mkc(124,112),x=c.ctx,cx=62,by=104;shadowE(x,cx,by+2,48,8,.4);
  const wall=S.wall,roof=S.roof;
  const house=(w,h,rf=roof,wl=wall,tall=0)=>{x.fillStyle=bodyG(x,cx-w/2,by-h,cx+w/2,by,wl);x.fillRect(cx-w/2,by-h,w,h);x.strokeStyle=OUT;x.lineWidth=1.5;x.strokeRect(cx-w/2,by-h,w,h);
    poly(x,[[cx-w/2-6,by-h+2],[cx,by-h-(26+tall)],[cx+w/2+6,by-h+2]],bodyG(x,cx-w/2,by-h-30,cx+w/2,by-h,rf),OUT,1.5);rrect(x,cx-6,by-18,12,18,5,'#1a1018',OUT,1);rrect(x,cx-w/2+6,by-h+10,9,11,3,S.win,OUT,1);rrect(x,cx+w/2-15,by-h+10,9,11,3,S.win,OUT,1)};
  let m;
  if(m=/^dw(\d)$/.exec(b)||/^up(\d)$/.exec(b)){const t=+m[1];const w=44+t*5,h=26+t*5;house(w,h,roof,wall,t*2);
    x.fillStyle=F.col[0];x.fillRect(cx+w/2-2,by-h-30,2.5,22);poly(x,[[cx+w/2+.5,by-h-30],[cx+w/2+13,by-h-26],[cx+w/2+.5,by-h-21]],F.col[1],OUT,.8);
    const cs=creatureSprite(FDEF[fi].units[t-1+(b[0]==='u'?7:0)],false);x.drawImage(cs,cx-w/2-4,by-52,52,52);if(b[0]==='u'){x.fillStyle='#ffe27a';x.font='bold 13px '+FONT;x.fillText('★',cx+w/2-12,by-h-2)}}
  else if(/^hall/.test(b)){const l=+b[4];house(56+l*10,38+l*8,roof,wall,10+l*8);x.fillStyle=S.trim;x.fillRect(cx-34-l*5,by-14,68+l*10,3);for(let i=0;i<l;i++)ell(x,cx-12+i*12,by-60-l*8,3,3,'#ffe27a',OUT,.8);x.fillStyle='#e8c25a';for(let i=0;i<l+1;i++)x.fillRect(cx-28-l*3+i*(56+l*6)/(l||1)*.8,by-6,4,6)}
  else if(/^fort/.test(b)){const l=+b[4];x.fillStyle=bodyG(x,cx-48,by-30,cx+48,by,wall);x.fillRect(cx-48,by-34-l*4,96,34+l*4);x.strokeStyle=OUT;x.lineWidth=1.6;x.strokeRect(cx-48,by-34-l*4,96,34+l*4);for(let i=0;i<8;i++){x.fillStyle=wall;x.fillRect(cx-48+i*12.5,by-42-l*4,8,8);x.strokeRect(cx-48+i*12.5,by-42-l*4,8,8)}
    for(const k of[-1,1]){x.fillStyle=bodyG(x,cx+k*48-10,0,cx+k*48+10,0,wall);x.fillRect(cx+k*48-10,by-56-l*8,20,56+l*8);x.strokeRect(cx+k*48-10,by-56-l*8,20,56+l*8);poly(x,[[cx+k*48-13,by-56-l*8],[cx+k*48,by-76-l*8],[cx+k*48+13,by-56-l*8]],roof,OUT,1.3)}
    x.fillStyle=OUT;x.beginPath();x.moveTo(cx-10,by);x.lineTo(cx-10,by-20);x.quadraticCurveTo(cx,by-32,cx+10,by-20);x.lineTo(cx+10,by);x.fill()}
  else if(/^mage/.test(b)){const l=+b[4];x.fillStyle=bodyG(x,cx-14,0,cx+14,0,wall);x.fillRect(cx-14,by-50-l*12,28,50+l*12);x.strokeStyle=OUT;x.lineWidth=1.5;x.strokeRect(cx-14,by-50-l*12,28,50+l*12);poly(x,[[cx-19,by-50-l*12],[cx,by-84-l*14],[cx+19,by-50-l*12]],'#5a3a9a',OUT,1.5);
    for(let i=0;i<l+1;i++)rrect(x,cx-4,by-44-i*12,8,9,4,'#bfe8ff',OUT,.9);ell(x,cx,by-90-l*14,4,4,rg(x,cx,by-90-l*14,0,4,['#fff','#9ad0ff']),OUT,.8);x.fillStyle=rg(x,cx,by-90-l*14,1,22,['rgba(160,220,255,.7)','rgba(160,220,255,0)']);x.fillRect(cx-22,by-112-l*14,44,44)}
  else if(b==='tavern'){house(60,38,'#9a4a28','#c8a070',6);rrect(x,cx-24,by-24,10,10,2,'#e8c25a',OUT,1);x.fillStyle='#fff';ell(x,cx+22,by-22,6,5,'#e8c25a',OUT,1);x.fillStyle='#6a3a1a';x.fillRect(cx+20,by-30,1.6,8)}
  else if(b==='market'){x.fillStyle=bodyG(x,0,by-38,0,by,'#8a5a2e');x.fillRect(cx-46,by-14,92,14);x.strokeStyle=OUT;x.lineWidth=1.4;x.strokeRect(cx-46,by-14,92,14);for(let i=0;i<4;i++){poly(x,[[cx-46+i*23,by-52],[cx-23+i*23,by-52],[cx-23+i*23,by-34],[cx-46+i*23,by-34]],i%2?'#f4f0e0':F.col[0],OUT,1.2)}
    x.strokeStyle='#5a3a1e';x.lineWidth=3;x.beginPath();x.moveTo(cx-44,by-52);x.lineTo(cx-44,by-14);x.moveTo(cx+44,by-52);x.lineTo(cx+44,by-14);x.stroke();for(let i=0;i<5;i++)ell(x,cx-34+i*17,by-18,5,3,['#e8c25a','#c0402a','#5aa83a','#4a7ad8','#d89aff'][i],OUT,.8)}
  else if(b==='shipyard'){x.fillStyle=lg(x,0,by-14,0,by,['#3a8ad0','#1a5a98']);x.fillRect(cx-56,by-12,112,12);x.fillStyle=bodyG(x,cx-50,by-20,cx+50,by-12,'#8a5a2e');x.fillRect(cx-52,by-18,104,8);x.strokeStyle=OUT;x.lineWidth=1.3;x.strokeRect(cx-52,by-18,104,8);
    for(let i=0;i<6;i++){x.fillStyle='#5a3a1e';x.fillRect(cx-48+i*18,by-34,4,18)}house(40,30,'#9a4a28','#c8a070',4);
    poly(x,[[cx+10,by-12],[cx+52,by-12],[cx+46,by],[cx+14,by]],lg(x,0,by-12,0,by,['#a8743c','#6a4426']),OUT,1.4);x.strokeStyle='#6a4426';x.lineWidth=2;x.beginPath();x.moveTo(cx+31,by-12);x.lineTo(cx+31,by-44);x.stroke();poly(x,[[cx+32,by-42],[cx+46,by-24],[cx+32,by-20]],'#f4f0e0',OUT,1)}
  else house(50,36);
  return Gfx.cache[key]=c;
}
const SKY=[['#ffd8a0','#9ac0f0'],['#c8e8c0','#6aa0a0'],['#2a2048','#6a4a8a'],['#4a1410','#d84a1a'],['#8a9ab0','#4a5a70'],['#ffb870','#4a9ad0'],['#6a7a38','#c0d070'],['#4a5a90','#b8c8e8']];
function townPanorama(fi,W=960,H=430){
  const key='tp'+fi;if(Gfx.cache[key])return Gfx.cache[key];const c=mkc(W,H,1.5),x=c.ctx,r=mulberry(fi*811+5),F=FDEF[fi],S=TSTYLE[fi];
  x.fillStyle=lg(x,0,0,0,H*.7,[SKY[fi][1],SKY[fi][0]]);x.fillRect(0,0,W,H);
  if(fi===2){ell(x,760,80,34,34,'#f0eef8');ell(x,772,74,28,28,'#2a2048');for(let i=0;i<60;i++){x.fillStyle='rgba(255,255,255,.7)';x.fillRect(r()*W,r()*H*.5,1.4,1.4)}}
  else if(fi===3){x.fillStyle=rg(x,W*.5,H*.62,10,W*.6,['rgba(255,150,40,.7)','rgba(255,60,20,0)']);x.fillRect(0,0,W,H)}
  else if(fi===5||fi===0){ell(x,W*.78,H*.22,38,38,rg(x,W*.78,H*.22,2,38,['#fffbe8','#ffe9a0']));x.fillStyle=rg(x,W*.78,H*.22,10,120,['rgba(255,240,180,.4)','rgba(255,240,180,0)']);x.fillRect(0,0,W,H*.6)}
  for(let l=0;l<3;l++){const col=shade(SKY[fi][1],-.1-l*.12);x.fillStyle=col;x.beginPath();x.moveTo(0,H*.62);for(let px=0;px<=W;px+=24)x.lineTo(px,H*(.46+l*.05)-Math.abs(Math.sin(px*.011+l*2+fi))*H*(.18-l*.03)-r()*10);x.lineTo(W,H*.62);x.fill()}
  if(fi===5){x.fillStyle=lg(x,0,H*.6,0,H,['#3a9ad0','#1a5a98']);x.fillRect(0,H*.6,W,H*.4)}
  else{x.fillStyle=lg(x,0,H*.6,0,H,[shade(TBASE[F.terr],.1),shade(TBASE[F.terr],-.25)]);x.fillRect(0,H*.62,W,H*.38)}
  if(fi===1||fi===6)for(let i=0;i<26;i++){const px=r()*W,py=H*.5+r()*H*.1;x.fillStyle=shade(fi===1?'#2f6a30':'#4a5a2a',-.1*r());x.beginPath();x.arc(px,py,14+r()*16,0,6.28);x.fill()}
  if(fi===7||fi===4)for(let i=0;i<14;i++){const px=r()*W,py=H*.58;poly(x,[[px-18,py+16],[px,py-26-r()*20],[px+18,py+16]],lg(x,px,py-40,px,py+16,['#e8eef6','#8a96a8']),null)}
  // castillo central grande
  const cs=townSprite(fi);const s=1.18;x.drawImage(cs.c,W/2-cs.c.lw*s/2,H*.64-cs.c.lh*s+26,cs.c.lw*s,cs.c.lh*s);
  x.fillStyle=lg(x,0,H*.88,0,H,['rgba(0,0,0,0)','rgba(0,0,0,.4)']);x.fillRect(0,H*.88,W,H*.12);
  return Gfx.cache[key]=c;
}
