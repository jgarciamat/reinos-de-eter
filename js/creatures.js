'use strict';
// =====================================================================
//  Sprites de criaturas (arquetipos con sombreado), retratos y ciudades
// =====================================================================
function limb(x,x1,y1,x2,y2,w,col){x.lineCap='round';x.strokeStyle=OUT;x.lineWidth=w+2.4;x.beginPath();x.moveTo(x1,y1);x.lineTo(x2,y2);x.stroke();
  x.strokeStyle=col;x.lineWidth=w;x.beginPath();x.moveTo(x1,y1);x.lineTo(x2,y2);x.stroke();x.strokeStyle='rgba(255,255,255,.22)';x.lineWidth=Math.max(1,w*.3);x.beginPath();x.moveTo(x1-w*.2,y1);x.lineTo(x2-w*.2,y2);x.stroke()}
function eye(x,px,py,r,col='#fff',pupil='#111'){ell(x,px,py,r,r*1.1,col,OUT,.8);ell(x,px+r*.25,py,r*.5,r*.6,pupil);ell(x,px+r*.45,py-r*.3,r*.2,r*.2,'#fff')}
function bodyG(x,x0,y0,x1,y1,col){return lg(x,x0,y0,x1,y1,[shade(col,.38),col,shade(col,-.38)])}
const wpn={
  sword(x,hx,hy,ang,col){x.save();x.translate(hx,hy);x.rotate(ang);poly(x,[[0,-2],[22,-2],[26,0],[22,2],[0,2]],lg(x,0,-2,0,2,['#fff','#c8d0dc','#7a8498']),OUT,1);x.fillStyle='#e8c25a';x.fillRect(-1,-5,3,10);x.strokeStyle=OUT;x.lineWidth=.8;x.strokeRect(-1,-5,3,10);x.fillStyle='#5a3a1e';x.fillRect(-6,-1.5,5,3);x.restore()},
  spear(x,hx,hy,ang){x.save();x.translate(hx,hy);x.rotate(ang);x.fillStyle='#7a5a32';x.fillRect(-16,-1.2,46,2.4);poly(x,[[30,-4],[42,0],[30,4]],lg(x,30,-4,42,4,['#fff','#9aa4b8']),OUT,1);x.restore()},
  axe(x,hx,hy,ang,col){x.save();x.translate(hx,hy);x.rotate(ang);x.fillStyle='#6a4426';x.fillRect(-8,-1.5,30,3);poly(x,[[18,-12],[30,-8],[30,8],[18,12],[22,0]],lg(x,18,-12,30,12,['#e8ecf4',col||'#9aa4b8','#5a6478']),OUT,1.1);x.restore()},
  club(x,hx,hy,ang){x.save();x.translate(hx,hy);x.rotate(ang);poly(x,[[-6,-2],[14,-3],[26,-8],[30,0],[26,8],[14,3],[-6,2]],lg(x,0,-8,0,8,['#9a7040','#6a4a28','#4a3018']),OUT,1.2);x.restore()},
  staff(x,hx,hy,ang,col,orb){x.save();x.translate(hx,hy);x.rotate(ang);x.fillStyle='#6a4a2a';x.fillRect(-18,-1.5,48,3);x.strokeStyle=OUT;x.strokeRect(-18,-1.5,48,3);x.restore();
    const ox=hx+Math.cos(ang)*30,oy=hy+Math.sin(ang)*30;x.fillStyle=rg(x,ox,oy,1,13,[orb||'rgba(160,220,255,1)',(orb||'#a0dcff')+'66','rgba(255,255,255,0)']);x.fillRect(ox-14,oy-14,28,28);ell(x,ox,oy,4.5,4.5,orb||'#bfe8ff',OUT,1);ell(x,ox-1,oy-1.5,1.5,1.5,'#fff')},
  bow(x,hx,hy,col){x.strokeStyle=OUT;x.lineWidth=4.5;x.beginPath();x.arc(hx+6,hy,18,-1.25,1.25);x.stroke();x.strokeStyle=col||'#8a5a2e';x.lineWidth=2.6;x.beginPath();x.arc(hx+6,hy,18,-1.25,1.25);x.stroke();
    x.strokeStyle='#eee';x.lineWidth=.9;x.beginPath();x.moveTo(hx+6+Math.cos(-1.25)*18,hy+Math.sin(-1.25)*18);x.lineTo(hx-2,hy);x.lineTo(hx+6+Math.cos(1.25)*18,hy+Math.sin(1.25)*18);x.stroke();
    x.strokeStyle='#caa';x.lineWidth=1.4;x.beginPath();x.moveTo(hx-2,hy);x.lineTo(hx+22,hy);x.stroke();poly(x,[[hx+22,hy-2.5],[hx+28,hy],[hx+22,hy+2.5]],'#ddd',OUT,.7)}
};
function shield(x,sx,sy,col,acc,r=11){x.save();x.translate(sx,sy);poly(x,[[-r,-r],[r,-r],[r,r*.2],[0,r*1.3],[-r,r*.2]],lg(x,-r,-r,r,r,[shade(col,.35),col,shade(col,-.4)]),OUT,1.6);x.strokeStyle=acc;x.lineWidth=2;x.beginPath();x.moveTo(0,-r);x.lineTo(0,r*1.2);x.moveTo(-r,-r*.2);x.lineTo(r,-r*.2);x.stroke();ell(x,0,-r*.2,3,3,acc,OUT,.8);x.restore()}
// ---------- humanoide general ----------
function humanoid(x,o){
  const P=o.pal,cx=48,by=90,sc=o.sc||1;x.save();x.translate(cx,by);x.scale(sc,sc);x.translate(-cx,-by);
  const skin=o.skin||'#e8c4a0',arm=o.armor||P[0],cl=o.cloth||P[1],ac=o.accent||P[2];
  shadowE(x,cx,by+1,22*sc,6,.42);
  if(o.cape){poly(x,[[cx-9,by-52],[cx+4,by-52],[cx-4,by-12],[cx-22,by-14]],lg(x,cx-22,by-52,cx+4,by-12,[shade(o.cape,.2),o.cape,shade(o.cape,-.4)]),OUT,1.4)}
  if(o.wings){const w=o.wings;for(const k of[1,-1]){x.save();x.translate(cx-3,by-48);x.scale(1,1);x.beginPath();x.moveTo(0,0);
      if(o.wingStyle==='bat'){x.lineTo(-28,-26);x.quadraticCurveTo(-34,-6,-24,-4);x.quadraticCurveTo(-26,6,-14,6);x.quadraticCurveTo(-12,12,-4,12);x.closePath();x.fillStyle=lg(x,-30,-26,0,10,[shade(w,.3),w,shade(w,-.4)]);x.fill();x.strokeStyle=OUT;x.lineWidth=1.4;x.stroke()}
      else{x.quadraticCurveTo(-18,-34,-40,-28);x.quadraticCurveTo(-36,-16,-30,-8);x.quadraticCurveTo(-30,-2,-20,2);x.quadraticCurveTo(-14,6,-2,8);x.closePath();x.fillStyle=lg(x,-40,-30,0,8,['#fff',w,shade(w,-.25)]);x.fill();x.strokeStyle=OUT;x.lineWidth=1.3;x.stroke();x.strokeStyle='rgba(0,0,0,.18)';x.lineWidth=.8;for(let i=0;i<4;i++){x.beginPath();x.moveTo(-3,0);x.lineTo(-36+i*5,-26+i*8);x.stroke()}}
      x.restore();break}}
  // piernas
  const lh=o.skull?'#e8e4d0':null;
  if(o.robe){poly(x,[[cx-12,by-44],[cx+12,by-44],[cx+16,by-2],[cx-16,by-2]],bodyG(x,cx-16,by-44,cx+16,by,cl),OUT,1.5);x.strokeStyle='rgba(255,255,255,.2)';x.lineWidth=1;for(let i=-2;i<=2;i++){x.beginPath();x.moveTo(cx+i*5,by-30);x.lineTo(cx+i*6,by-4);x.stroke()}x.fillStyle=ac;x.fillRect(cx-13,by-30,26,3.5);x.strokeStyle=OUT;x.lineWidth=.8;x.strokeRect(cx-13,by-30,26,3.5)}
  else{limb(x,cx-6,by-26,cx-8,by-4,7,o.legs||shade(cl,-.25));limb(x,cx+6,by-26,cx+8,by-4,7,o.legs||shade(cl,-.25));x.fillStyle='#2a1c14';rrect(x,cx-13,by-6,11,6,2,'#2a1c14',OUT,1);rrect(x,cx+3,by-6,11,6,2,'#2a1c14',OUT,1)}
  // torso
  const tw=o.bulk?15:12;
  if(!o.robe){poly(x,[[cx-tw,by-54],[cx+tw,by-54],[cx+tw-2,by-26],[cx-tw+2,by-26]],bodyG(x,cx-tw,by-54,cx+tw,by-26,arm),OUT,1.6);
    x.fillStyle=ac;x.fillRect(cx-tw+2,by-30,tw*2-4,4);x.strokeStyle=OUT;x.lineWidth=.8;x.strokeRect(cx-tw+2,by-30,tw*2-4,4);ell(x,cx,by-28,3,3,shade(ac,.3),OUT,.8);
    if(o.skull){x.strokeStyle='#bdb8a4';x.lineWidth=1.8;for(let i=0;i<4;i++){x.beginPath();x.moveTo(cx-9,by-48+i*5);x.quadraticCurveTo(cx,by-45+i*5,cx+9,by-48+i*5);x.stroke()}}
    else{poly(x,[[cx-tw,by-54],[cx-tw+6,by-58],[cx+tw-6,by-58],[cx+tw,by-54]],shade(arm,.25),OUT,1.2);ell(x,cx-tw,by-53,6,5,shade(arm,.2),OUT,1.2);ell(x,cx+tw,by-53,6,5,shade(arm,.2),OUT,1.2)}}
  else{poly(x,[[cx-12,by-56],[cx+12,by-56],[cx+13,by-40],[cx-13,by-40]],bodyG(x,cx-12,by-56,cx+12,by-40,arm),OUT,1.4)}
  // brazos y armas
  const hx=cx+17,hy=by-38;
  const aw=o.weapon;
  limb(x,cx-tw,by-52,cx-tw-5,by-34,6,o.skull?'#d8d4c0':(o.sleeve||cl));
  if(o.shield)shield(x,cx-tw-7,by-34,o.shield,ac,10);
  if(aw==='sword')wpn.sword(x,hx,hy,-.9);else if(aw==='spear')wpn.spear(x,hx,hy,-.5);else if(aw==='axe')wpn.axe(x,hx,hy,-.7,ac);else if(aw==='club')wpn.club(x,hx,hy,-.8);else if(aw==='staff')wpn.staff(x,hx,hy+4,-1.35,ac,o.orb);else if(aw==='bow')wpn.bow(x,hx-4,hy,ac);
  limb(x,cx+tw,by-52,hx,hy,6,o.skull?'#d8d4c0':(o.sleeve||cl));ell(x,hx,hy,3.6,3.6,o.skull?'#e8e4d0':skin,OUT,1);
  // cabeza
  const hy2=by-64;
  if(o.skull){ell(x,cx,hy2,9.5,10,bodyG(x,cx-9,hy2-10,cx+9,hy2+10,'#ece8d4'),OUT,1.4);ell(x,cx-3.6,hy2-1,2.6,3.2,'#1a1018');ell(x,cx+3.6,hy2-1,2.6,3.2,'#1a1018');if(o.glow){ell(x,cx-3.6,hy2-1,1.4,1.7,o.glow);ell(x,cx+3.6,hy2-1,1.4,1.7,o.glow)}
    x.fillStyle='#1a1018';x.fillRect(cx-1,hy2+3,2,3);x.strokeStyle='#1a1018';x.lineWidth=1;x.beginPath();x.moveTo(cx-5,hy2+7);x.lineTo(cx+5,hy2+7);x.stroke();for(let i=-4;i<=4;i+=2){x.beginPath();x.moveTo(cx+i,hy2+6);x.lineTo(cx+i,hy2+8.5);x.stroke()}}
  else{
    if(o.hair&&o.hair!=='none'){ell(x,cx-1,hy2-2,10.5,10.5,shade(o.hair,-.1),OUT,1.2)}
    ell(x,cx,hy2,9,9.6,bodyG(x,cx-9,hy2-10,cx+9,hy2+10,skin),OUT,1.4);
    if(o.cyclops){eye(x,cx+1,hy2-1,4.4,'#fff6c0')}else{eye(x,cx-3.4,hy2-1,2.5,'#fff',o.eyeCol||'#2a1a10');eye(x,cx+4,hy2-1,2.5,'#fff',o.eyeCol||'#2a1a10')}
    x.strokeStyle='rgba(60,20,10,.7)';x.lineWidth=1.1;x.beginPath();x.moveTo(cx-3,hy2+5);x.quadraticCurveTo(cx+1,hy2+7,cx+5,hy2+5);x.stroke();
    if(o.tusks){x.fillStyle='#f4f0d8';poly(x,[[cx-5,hy2+5],[cx-4,hy2+1],[cx-2,hy2+5]],'#f4f0d8',OUT,.8);poly(x,[[cx+3,hy2+5],[cx+4,hy2+1],[cx+6,hy2+5]],'#f4f0d8',OUT,.8)}
    if(o.fangs){poly(x,[[cx-2,hy2+5],[cx-1,hy2+9],[cx,hy2+5]],'#fff',OUT,.6);poly(x,[[cx+2,hy2+5],[cx+3,hy2+9],[cx+4,hy2+5]],'#fff',OUT,.6)}
    if(o.ears){poly(x,[[cx-8,hy2-2],[cx-17,hy2-6],[cx-8,hy2+3]],skin,OUT,1);poly(x,[[cx+8,hy2-2],[cx+17,hy2-6],[cx+8,hy2+3]],skin,OUT,1)}
  }
  const hl=o.helm;
  if(hl==='helm'){x.beginPath();x.arc(cx,hy2-1,10.5,Math.PI,0);x.lineTo(cx+10.5,hy2+2);x.lineTo(cx-10.5,hy2+2);x.closePath();x.fillStyle=bodyG(x,cx-10,hy2-12,cx+10,hy2+2,o.helmCol||'#aeb6c8');x.fill();x.strokeStyle=OUT;x.lineWidth=1.4;x.stroke();x.fillStyle=ac;x.fillRect(cx-1.5,hy2-12,3,9);if(o.plume){poly(x,[[cx,hy2-12],[cx-10,hy2-22],[cx-2,hy2-18],[cx+8,hy2-24],[cx+3,hy2-12]],o.plume,OUT,1)}}
  else if(hl==='hood'){x.beginPath();x.arc(cx,hy2-1,11,Math.PI*.95,Math.PI*.05);x.lineTo(cx+6,hy2+9);x.lineTo(cx-6,hy2+9);x.closePath();x.fillStyle=bodyG(x,cx-11,hy2-12,cx+11,hy2+8,cl);x.globalCompositeOperation='destination-over';x.restore&&0;x.globalCompositeOperation='source-over';x.fill();x.strokeStyle=OUT;x.lineWidth=1.4;x.stroke();ell(x,cx+1,hy2+1,6.5,7.5,'#1a1018');if(o.glow){ell(x,cx-1.5,hy2,1.3,1.3,o.glow);ell(x,cx+3.5,hy2,1.3,1.3,o.glow)}}
  else if(hl==='hat'){poly(x,[[cx-14,hy2-5],[cx,hy2-30],[cx+14,hy2-5]],bodyG(x,cx-14,hy2-30,cx+14,hy2-5,cl),OUT,1.4);ell(x,cx,hy2-5,16,4.4,shade(cl,-.15),OUT,1.3);x.fillStyle=ac;x.fillRect(cx-9,hy2-9,18,3)}
  else if(hl==='horns'){for(const k of[-1,1]){x.strokeStyle=OUT;x.lineWidth=5.2;x.beginPath();x.moveTo(cx+k*6,hy2-7);x.quadraticCurveTo(cx+k*13,hy2-12,cx+k*10,hy2-22);x.stroke();x.strokeStyle='#e8dcc0';x.lineWidth=3;x.stroke()}}
  else if(hl==='crown'){poly(x,[[cx-8,hy2-8],[cx-8,hy2-16],[cx-4,hy2-11],[cx,hy2-18],[cx+4,hy2-11],[cx+8,hy2-16],[cx+8,hy2-8]],lg(x,cx-8,hy2-18,cx+8,hy2-8,['#fff2a0','#e8b82a']),OUT,1.1)}
  else if(hl==='halo'){x.strokeStyle='rgba(255,240,150,.95)';x.lineWidth=2.6;x.beginPath();x.ellipse(cx,hy2-15,11,3.6,0,0,6.28);x.stroke();x.strokeStyle='rgba(255,255,255,.7)';x.lineWidth=1;x.stroke()}
  x.restore();
}
function quadruped(x,o){
  const P=o.pal,cx=48,by=88,c=o.body||P[0],ac=P[2],sc=o.sc||1;x.save();x.translate(cx,by);x.scale(sc,sc);x.translate(-cx,-by);shadowE(x,cx,by+1,34,7,.42);
  // cola
  x.strokeStyle=OUT;x.lineWidth=7;x.beginPath();x.moveTo(cx-26,by-36);x.quadraticCurveTo(cx-40,by-48,cx-36,by-26);x.stroke();x.strokeStyle=o.tail||shade(c,-.15);x.lineWidth=4.4;x.stroke();
  const leg=(lx,front)=>{limb(x,lx,by-26,lx+(front?2:-2),by-4,8.5,shade(c,front?-.1:-.28));ell(x,lx+(front?4:0),by-2,6,3,shade(c,-.45),OUT,1)};
  leg(cx-18,false);leg(cx+14,false);
  ell(x,cx,by-34,30,16,bodyG(x,cx-30,by-52,cx+30,by-18,c),OUT,1.7);
  if(o.belly)ell(x,cx,by-26,22,6,shade(o.belly,.1),null);
  if(o.mane){for(let i=0;i<6;i++){poly(x,[[cx+12+i*1.5,by-48+i*3],[cx+8+i*2,by-62+i*2],[cx+18+i*2,by-50+i*3]],o.mane,OUT,1)}}
  if(o.stripes){x.strokeStyle='rgba(0,0,0,.28)';x.lineWidth=2.5;for(let i=-2;i<=2;i++){x.beginPath();x.moveTo(cx+i*9,by-48);x.quadraticCurveTo(cx+i*9+3,by-36,cx+i*9,by-22);x.stroke()}}
  leg(cx-10,true);leg(cx+22,true);
  // cuello y cabeza
  poly(x,[[cx+16,by-48],[cx+30,by-62],[cx+40,by-52],[cx+28,by-34]],bodyG(x,cx+16,by-62,cx+40,by-34,c),OUT,1.5);
  const hx=cx+38,hy=by-62;
  const heads=o.heads||1;
  for(let h=0;h<heads;h++){const oy=(h-(heads-1)/2)*11,ox=(h%2?-4:0);
    poly(x,[[hx-9+ox,hy-8+oy],[hx+7+ox,hy-9+oy],[hx+19+ox,hy-1+oy],[hx+18+ox,hy+7+oy],[hx-7+ox,hy+9+oy]],bodyG(x,hx-9,hy-9+oy,hx+19,hy+9+oy,c),OUT,1.5);
    poly(x,[[hx-6+ox,hy-8+oy],[hx-3+ox,hy-17+oy],[hx+3+ox,hy-8+oy]],c,OUT,1.2);
    eye(x,hx+5+ox,hy-3+oy,2.4,o.eyeCol||'#fff',o.eyeCol?'#300':'#222');ell(x,hx+18+ox,hy+1+oy,2.2,1.6,'#2a1a1a');
    if(o.fangs){poly(x,[[hx+12+ox,hy+6+oy],[hx+13+ox,hy+11+oy],[hx+15+ox,hy+6+oy]],'#fff',OUT,.6)}
    if(o.tusk){poly(x,[[hx+14+ox,hy+5+oy],[hx+20+ox,hy-4+oy],[hx+17+ox,hy+5+oy]],'#f4f0d8',OUT,1)}}
  if(o.horn){x.save();x.translate(hx+3,hy-9);x.rotate(-.5);poly(x,[[-2,0],[0,-24],[2,0]],lg(x,0,-24,0,0,['#fff6c0','#ffd860']),OUT,1.1);x.restore()}
  if(o.fire){x.fillStyle=rg(x,hx+10,hy-8,1,16,['rgba(255,200,80,.9)','rgba(255,80,20,0)']);x.fillRect(hx-6,hy-24,32,32)}
  x.restore();
}
function wingShape(x,ox,oy,col,span,k=1,feather=true){x.save();x.translate(ox,oy);x.scale(k,1);x.beginPath();x.moveTo(0,0);x.quadraticCurveTo(span*.2,-span*.9,span,-span*.7);x.quadraticCurveTo(span*.82,-span*.38,span*.74,-span*.28);x.quadraticCurveTo(span*.66,-span*.12,span*.52,-span*.08);x.quadraticCurveTo(span*.4,.04*span,span*.2,span*.12);x.closePath();
  x.fillStyle=lg(x,0,-span,span,span*.2,[shade(col,.35),col,shade(col,-.4)]);x.fill();x.strokeStyle=OUT;x.lineWidth=1.5;x.stroke();
  if(feather){x.strokeStyle='rgba(0,0,0,.22)';x.lineWidth=1;for(let i=0;i<5;i++){x.beginPath();x.moveTo(span*.08,-span*.02);x.lineTo(span*(.3+i*.15),-span*(.55-i*.07));x.stroke()}}x.restore()}
function griffin(x,o){
  const P=o.pal,cx=48,by=88,c=P[0],c2=P[1];x.save();shadowE(x,cx,by+1,30,6,.35);
  wingShape(x,cx-2,by-50,c2,50,-1);
  x.strokeStyle=OUT;x.lineWidth=7;x.beginPath();x.moveTo(cx-24,by-30);x.quadraticCurveTo(cx-40,by-26,cx-38,by-12);x.stroke();x.strokeStyle=c2;x.lineWidth=4;x.stroke();
  limb(x,cx-14,by-24,cx-14,by-4,8,shade(c,-.25));limb(x,cx+10,by-24,cx+12,by-4,8,shade(c,-.25));
  ell(x,cx-4,by-34,28,15,bodyG(x,cx-30,by-50,cx+24,by-20,c),OUT,1.6);
  limb(x,cx-6,by-24,cx-6,by-3,8.5,shade(c,-.1));limb(x,cx+18,by-24,cx+20,by-3,8.5,shade(c,-.1));
  for(const lx of[cx-6,cx+20])for(let i=0;i<3;i++){poly(x,[[lx-4+i*3,by-3],[lx-3+i*3,by+1],[lx-2+i*3,by-3]],'#f0e0b0',OUT,.7)}
  ell(x,cx+22,by-48,15,12,bodyG(x,cx+8,by-60,cx+36,by-36,c2),OUT,1.4);
  ell(x,cx+26,by-58,10,9,'#f4ecd8',OUT,1.3);poly(x,[[cx+32,by-60],[cx+46,by-55],[cx+33,by-50]],lg(x,cx+32,by-60,cx+46,by-50,['#ffd24a','#c88a1a']),OUT,1.2);eye(x,cx+28,by-61,2.4,'#fff6c0','#222');
  wingShape(x,cx+4,by-52,shade(c2,.08),56,1);
  if(o.thunder){x.strokeStyle='rgba(255,240,120,.95)';x.lineWidth=2;for(let i=0;i<3;i++){x.beginPath();x.moveTo(cx-30+i*18,by-82);x.lineTo(cx-24+i*18,by-70);x.lineTo(cx-30+i*18,by-66);x.lineTo(cx-22+i*18,by-54);x.stroke()}}
  x.restore();
}
function gargoyle(x,o){const P=o.pal,cx=48,by=88;x.save();shadowE(x,cx,by+1,22,5,.35);wingShape(x,cx-4,by-52,P[1],46,-1);limb(x,cx-6,by-26,cx-8,by-6,8,P[0]);limb(x,cx+8,by-26,cx+10,by-6,8,P[0]);
  ell(x,cx,by-40,14,19,bodyG(x,cx-14,by-60,cx+14,by-22,P[0]),OUT,1.6);limb(x,cx-10,by-52,cx-16,by-34,6,P[0]);limb(x,cx+10,by-52,cx+17,by-38,6,P[0]);
  ell(x,cx+2,by-64,10,10,bodyG(x,cx-8,by-74,cx+12,by-54,P[0]),OUT,1.4);for(const k of[-1,1]){poly(x,[[cx+2+k*6,by-70],[cx+2+k*11,by-82],[cx+2+k*3,by-72]],P[1],OUT,1)}eye(x,cx-1,by-65,2.2,P[2]);eye(x,cx+6,by-65,2.2,P[2]);
  wingShape(x,cx+4,by-52,shade(P[1],.1),52,1);x.restore()}
function dragon(x,o,cr){
  const P=o.pal,cx=48,by=90,c=P[0],c2=P[1],bone=cr&&cr.arch==='dragon'&&/Óseo|Espectral/.test(cr.name);x.save();shadowE(x,cx,by+1,36,7,.45);
  wingShape(x,cx-6,by-54,shade(c,-.1),66,-1,!bone);
  // cola
  x.strokeStyle=OUT;x.lineWidth=13;x.lineCap='round';x.beginPath();x.moveTo(cx-18,by-30);x.quadraticCurveTo(cx-48,by-24,cx-44,by-8);x.stroke();x.strokeStyle=c;x.lineWidth=9;x.stroke();poly(x,[[cx-47,by-4],[cx-40,by-12],[cx-38,by-2]],c2,OUT,1.2);
  limb(x,cx-12,by-28,cx-14,by-6,11,shade(c,-.3));limb(x,cx+10,by-28,cx+14,by-6,11,shade(c,-.3));
  ell(x,cx,by-34,28,19,bodyG(x,cx-28,by-52,cx+28,by-16,c),OUT,1.8);ell(x,cx+3,by-28,19,10,bodyG(x,cx-14,by-38,cx+22,by-18,c2),null);
  x.strokeStyle='rgba(0,0,0,.22)';x.lineWidth=1.2;for(let i=-3;i<=3;i++){x.beginPath();x.moveTo(cx+i*5-8,by-36);x.lineTo(cx+i*5-8,by-20);x.stroke()}
  limb(x,cx-4,by-24,cx-6,by-4,11,shade(c,-.05));limb(x,cx+20,by-24,cx+22,by-4,11,shade(c,-.05));
  for(const lx of[cx-6,cx+22])for(let i=0;i<3;i++)poly(x,[[lx-5+i*4,by-3],[lx-4+i*4,by+2],[lx-2+i*4,by-3]],'#f4eedc',OUT,.7);
  // cuello y cabeza
  x.strokeStyle=OUT;x.lineWidth=15;x.beginPath();x.moveTo(cx+14,by-42);x.quadraticCurveTo(cx+30,by-54,cx+26,by-72);x.stroke();x.strokeStyle=c;x.lineWidth=11;x.stroke();
  const hx=cx+28,hy=by-76;
  poly(x,[[hx-10,hy-6],[hx+8,hy-9],[hx+24,hy-1],[hx+22,hy+7],[hx-8,hy+8]],bodyG(x,hx-10,hy-9,hx+24,hy+8,c),OUT,1.6);
  poly(x,[[hx-7,hy-7],[hx-12,hy-20],[hx-2,hy-8]],'#f4ecd0',OUT,1.2);poly(x,[[hx+2,hy-8],[hx,hy-22],[hx+8,hy-9]],'#f4ecd0',OUT,1.2);
  eye(x,hx+7,hy-3,3,P[2]||'#ffe060','#300');for(let i=0;i<4;i++)poly(x,[[hx+8+i*3.5,hy+7],[hx+9.5+i*3.5,hy+11],[hx+11+i*3.5,hy+7]],'#fff',OUT,.6);
  for(let i=0;i<5;i++)poly(x,[[cx-16+i*8,by-52+Math.abs(i-2)*-1+3],[cx-14+i*8,by-60],[cx-11+i*8,by-52]],c2,OUT,1);
  if(o.fire){x.fillStyle=rg(x,hx+26,hy+2,1,18,['rgba(255,220,100,.95)','rgba(255,90,20,.5)','rgba(255,60,0,0)']);x.fillRect(hx+8,hy-18,40,40)}
  wingShape(x,cx+6,by-56,c2,70,1,!bone);
  x.restore();
}
function ghost(x,o){const P=o.pal,cx=48,by=84;x.save();shadowE(x,cx,by+4,20,5,.25);x.globalAlpha=.92;
  x.beginPath();x.moveTo(cx-18,by-64);x.quadraticCurveTo(cx-24,by-20,cx-16,by-2);x.quadraticCurveTo(cx-10,by-12,cx-5,by);x.quadraticCurveTo(cx,by-14,cx+6,by);x.quadraticCurveTo(cx+10,by-10,cx+18,by-4);x.quadraticCurveTo(cx+24,by-30,cx+18,by-64);x.quadraticCurveTo(cx,by-84,cx-18,by-64);
  x.fillStyle=lg(x,cx,by-84,cx,by,[P[2],P[0],P[1]+'88']);x.fill();x.strokeStyle='rgba(20,20,60,.7)';x.lineWidth=1.5;x.stroke();x.globalAlpha=1;
  x.fillStyle=rg(x,cx,by-44,2,30,['rgba(255,255,255,.35)','rgba(255,255,255,0)']);x.fillRect(cx-30,by-80,60,80);
  ell(x,cx-6,by-58,4,6,'#10081c');ell(x,cx+7,by-58,4,6,'#10081c');ell(x,cx-6,by-58,1.6,2.4,P[1]);ell(x,cx+7,by-58,1.6,2.4,P[1]);ell(x,cx,by-47,4,6,'#10081c');
  if(o.fire){x.fillStyle=rg(x,cx,by-50,2,40,['rgba(255,180,60,.6)','rgba(255,80,20,0)']);x.fillRect(cx-44,by-92,88,92)}
  x.restore()}
function golem(x,o){const P=o.pal,cx=48,by=90,c=P[0],c2=P[1],ac=P[2];x.save();shadowE(x,cx,by+1,30,7,.45);
  const blk=(bx,by2,w,h,col,r=4)=>{rrect(x,bx,by2,w,h,r,bodyG(x,bx,by2,bx+w,by2+h,col),OUT,1.7);x.strokeStyle='rgba(0,0,0,.25)';x.lineWidth=1;x.beginPath();x.moveTo(bx+w*.3,by2+2);x.lineTo(bx+w*.25,by2+h*.5);x.lineTo(bx+w*.45,by2+h-2);x.stroke()};
  blk(cx-18,by-22,15,22,c2);blk(cx+3,by-22,15,22,c2);blk(cx-22,by-54,44,36,c);blk(cx-36,by-52,15,32,c2,6);blk(cx+21,by-52,15,32,c2,6);blk(cx-39,by-24,18,14,c,5);blk(cx+21,by-24,18,14,c,5);
  blk(cx-13,by-74,26,22,c,6);ell(x,cx,by-36,6,6,rg(x,cx,by-36,0,7,['#fff',ac,ac+'00']));x.strokeStyle=ac;x.lineWidth=1.6;x.beginPath();x.moveTo(cx-10,by-46);x.lineTo(cx-3,by-40);x.lineTo(cx-10,by-30);x.moveTo(cx+10,by-46);x.lineTo(cx+3,by-40);x.lineTo(cx+10,by-30);x.stroke();
  x.fillStyle=ac;x.fillRect(cx-9,by-66,6,4);x.fillRect(cx+3,by-66,6,4);x.fillStyle=rg(x,cx,by-64,1,16,[ac+'aa',ac+'00']);x.fillRect(cx-16,by-76,32,24);
  if(/Cristal/.test(o.name||'')){for(const[px,py]of[[cx-30,by-58],[cx+30,by-60],[cx,by-82]])poly(x,[[px-4,py+4],[px,py-12],[px+4,py+4]],'#c8f8ff',OUT,1)}x.restore()}
function ent(x,o){const P=o.pal,cx=48,by=90;x.save();shadowE(x,cx,by+1,28,6,.4);
  x.strokeStyle=OUT;x.lineWidth=14;x.beginPath();x.moveTo(cx-10,by);x.lineTo(cx-8,by-30);x.moveTo(cx+10,by);x.lineTo(cx+8,by-30);x.stroke();x.strokeStyle=P[0];x.lineWidth=10.5;x.stroke();
  poly(x,[[cx-18,by-30],[cx+18,by-30],[cx+14,by-62],[cx-14,by-62]],lg(x,cx-18,0,cx+18,0,[shade(P[0],.2),P[0],shade(P[0],-.4)]),OUT,1.6);
  x.strokeStyle='rgba(0,0,0,.28)';x.lineWidth=1.4;for(let i=-2;i<=2;i++){x.beginPath();x.moveTo(cx+i*6,by-32);x.quadraticCurveTo(cx+i*6+3,by-46,cx+i*5,by-60);x.stroke()}
  for(const k of[-1,1]){x.strokeStyle=OUT;x.lineWidth=11;x.beginPath();x.moveTo(cx+k*14,by-56);x.quadraticCurveTo(cx+k*30,by-52,cx+k*30,by-30);x.stroke();x.strokeStyle=P[0];x.lineWidth=7.5;x.stroke();for(let i=0;i<3;i++){ell(x,cx+k*(30+(i-1)*2),by-26+i*3,5,3,P[1],OUT,1)}}
  ell(x,cx,by-50,5,4.2,'#1a1008');eye(x,cx-6,by-58,2.8,'#fff2a0','#400');eye(x,cx+6,by-58,2.8,'#fff2a0','#400');
  for(const[bx,bo,r]of[[cx-18,by-74,17],[cx+14,by-76,18],[cx-2,by-86,19],[cx,by-70,15]]){x.fillStyle=rg(x,bx-r*.3,bo-r*.4,2,r,[shade(P[1],.35),P[1],shade(P[1],-.4)]);x.beginPath();x.arc(bx,bo,r,0,6.28);x.fill();x.strokeStyle=OUT;x.lineWidth=1.4;x.stroke()}
  x.fillStyle=P[2];for(let i=0;i<5;i++)ell(x,cx-18+i*9,by-80-(i%2)*8,2.2,2.2,P[2]);x.restore()}
function serpent(x,o){const P=o.pal,cx=48,by=88;x.save();shadowE(x,cx,by+1,30,6,.4);
  x.lineCap='round';const body=(w,col)=>{x.strokeStyle=col;x.lineWidth=w;x.beginPath();x.moveTo(cx-36,by-6);x.bezierCurveTo(cx-30,by-26,cx-6,by-10,cx,by-26);x.bezierCurveTo(cx+6,by-42,cx+30,by-34,cx+28,by-56);x.stroke()};
  body(15,OUT);body(11.5,P[0]);body(5,P[1]);x.strokeStyle='rgba(0,0,0,.2)';x.lineWidth=1.3;
  if(o.wings)wingShape(x,cx-2,by-38,P[1],46,-1),wingShape(x,cx+4,by-40,shade(P[1],.1),50,1);
  const hx=cx+30,hy=by-60;poly(x,[[hx-9,hy+3],[hx-4,hy-8],[hx+9,hy-8],[hx+20,hy-1],[hx+8,hy+7]],bodyG(x,hx-9,hy-8,hx+20,hy+7,P[0]),OUT,1.6);
  if(o.crest)for(let i=0;i<5;i++)poly(x,[[hx-6+i*3,hy-8],[hx-5+i*3,hy-17],[hx-2+i*3,hy-8]],P[2],OUT,.9);eye(x,hx+5,hy-3,2.6,P[2],'#200');
  x.strokeStyle='#e83a3a';x.lineWidth=1.4;x.beginPath();x.moveTo(hx+20,hy);x.lineTo(hx+28,hy+2);x.moveTo(hx+28,hy+2);x.lineTo(hx+31,hy-1);x.moveTo(hx+28,hy+2);x.lineTo(hx+31,hy+5);x.stroke();x.restore()}
function naga(x,o){const P=o.pal,cx=48,by=88;x.save();shadowE(x,cx,by+1,30,6,.4);x.lineCap='round';
  const tail=(w,col)=>{x.strokeStyle=col;x.lineWidth=w;x.beginPath();x.moveTo(cx,by-34);x.bezierCurveTo(cx-6,by-14,cx-34,by-26,cx-32,by-8);x.bezierCurveTo(cx-30,by,cx-16,by-2,cx-14,by-8);x.stroke()};
  tail(18,OUT);tail(14,P[0]);tail(5,P[2]);
  poly(x,[[cx-12,by-56],[cx+12,by-56],[cx+10,by-34],[cx-10,by-34]],bodyG(x,cx-12,by-56,cx+12,by-34,P[1]),OUT,1.5);
  limb(x,cx-12,by-54,cx-20,by-40,6,P[1]);limb(x,cx+12,by-54,cx+20,by-46,6,P[1]);ell(x,cx,by-66,9,9.6,bodyG(x,cx-9,by-76,cx+9,by-56,'#e8d0c0'),OUT,1.4);
  for(let i=0;i<7;i++)ell(x,cx-12+i*4,by-72+Math.abs(i-3)*1.5,5,9,i%2?P[2]:P[0],OUT,.9);eye(x,cx-3,by-66,2.2,'#fff','#08a');eye(x,cx+4,by-66,2.2,'#fff','#08a');
  if(o.bow)wpn.bow(x,cx+22,by-48,P[2]);else wpn.staff(x,cx+22,by-44,-1.4,P[2],P[2]);x.restore()}
function kraken(x,o){const P=o.pal,cx=48,by=88;x.save();shadowE(x,cx,by+1,34,7,.4);x.lineCap='round';
  for(let i=0;i<7;i++){const a=-2.8+i*.62,tx=cx+Math.cos(a)*40,ty=by-14+Math.sin(a)*4;const pth=()=>{x.beginPath();x.moveTo(cx+(i-3)*5,by-30);x.bezierCurveTo(cx+(i-3)*9,by-10,tx-10*Math.sign(Math.cos(a)),by+2,tx,ty-(i%2?14:2));x.stroke()};x.strokeStyle=OUT;x.lineWidth=11;pth();x.strokeStyle=P[0];x.lineWidth=8;pth();x.strokeStyle=P[2];x.lineWidth=2;x.setLineDash([2,5]);pth();x.setLineDash([])}
  ell(x,cx,by-52,24,29,rg(x,cx-6,by-62,3,34,[shade(P[1],.4),P[1],shade(P[1],-.4)]),OUT,1.8);ell(x,cx,by-60,18,10,'rgba(255,255,255,.12)');eye(x,cx-9,by-50,5.2,'#fff6c0','#300');eye(x,cx+10,by-50,5.2,'#fff6c0','#300');
  x.strokeStyle='rgba(0,0,0,.35)';x.lineWidth=1.2;x.beginPath();x.moveTo(cx-9,by-62);x.quadraticCurveTo(cx,by-72,cx+9,by-62);x.stroke();x.restore()}
function crab(x,o){const P=o.pal,cx=48,by=88;x.save();shadowE(x,cx,by+1,32,6,.4);
  for(const k of[-1,1])for(let i=0;i<3;i++){x.strokeStyle=OUT;x.lineWidth=5;x.beginPath();x.moveTo(cx+k*14,by-28+i*4);x.lineTo(cx+k*(26+i*3),by-26+i*4);x.lineTo(cx+k*(30+i*3),by-4);x.stroke();x.strokeStyle=P[0];x.lineWidth=3;x.stroke()}
  for(const k of[-1,1]){x.strokeStyle=OUT;x.lineWidth=10;x.beginPath();x.moveTo(cx+k*16,by-40);x.lineTo(cx+k*30,by-52);x.stroke();x.strokeStyle=P[0];x.lineWidth=6.5;x.stroke();
    x.save();x.translate(cx+k*34,by-60);x.scale(k,1);poly(x,[[-8,2],[-4,-14],[10,-10],[12,0],[4,4],[-2,-2]],bodyG(x,-8,-14,12,4,P[0]),OUT,1.6);poly(x,[[2,2],[10,-4],[12,4],[6,8]],shade(P[0],-.15),OUT,1.4);x.restore()}
  ell(x,cx,by-34,26,18,bodyG(x,cx-26,by-52,cx+26,by-16,P[0]),OUT,1.8);ell(x,cx,by-30,18,10,P[1],null);
  for(const k of[-1,1]){x.strokeStyle=OUT;x.lineWidth=4;x.beginPath();x.moveTo(cx+k*8,by-48);x.lineTo(cx+k*9,by-56);x.stroke();ell(x,cx+k*9,by-58,3.8,3.8,'#fff',OUT,1);ell(x,cx+k*9,by-58,1.8,1.8,'#111')}x.restore()}
function frogm(x,o){humanoid(x,{pal:o.pal,skin:o.pal[0],armor:'#6a4a2a',cloth:o.pal[2],accent:o.pal[1],weapon:'spear',helm:'none',sc:.92,eyeCol:'#fa0',legs:shade(o.pal[0],-.2),sleeve:o.pal[0]});
  x.save();ell(x,44,31,10.5,8.5,bodyG(x,34,22,56,38,o.pal[0]),OUT,1.4);ell(x,46,56*0+48-17,0,0,null);x.restore()}
function hydra(x,o){const P=o.pal,cx=48,by=88;x.save();shadowE(x,cx,by+1,34,7,.42);x.lineCap='round';
  ell(x,cx,by-22,28,15,bodyG(x,cx-28,by-37,cx+28,by-7,P[0]),OUT,1.8);limb(x,cx-16,by-14,cx-18,by-2,9,shade(P[0],-.3));limb(x,cx+14,by-14,cx+17,by-2,9,shade(P[0],-.3));
  x.strokeStyle=OUT;x.lineWidth=10;x.beginPath();x.moveTo(cx-26,by-18);x.quadraticCurveTo(cx-42,by-14,cx-38,by-2);x.stroke();x.strokeStyle=P[0];x.lineWidth=6.5;x.stroke();
  const heads=[[cx-18,by-80,-.2],[cx,by-90,0],[cx+20,by-76,.25]];
  heads.forEach(([hx,hy,t],i)=>{const pth=()=>{x.beginPath();x.moveTo(cx-10+i*10,by-30);x.bezierCurveTo(cx-18+i*18,by-48,hx-8*Math.sign(t||1),by-52,hx,hy+6);x.stroke()};x.strokeStyle=OUT;x.lineWidth=11;pth();x.strokeStyle=P[0];x.lineWidth=7.5;pth();
    poly(x,[[hx-9,hy-4],[hx+4,hy-8],[hx+16,hy-2],[hx+14,hy+5],[hx-7,hy+6]],bodyG(x,hx-9,hy-8,hx+16,hy+6,i===1?shade(P[0],.1):P[0]),OUT,1.5);poly(x,[[hx-5,hy-6],[hx-8,hy-15],[hx,hy-7]],P[1],OUT,1);eye(x,hx+5,hy-2,2.4,P[1],'#300');for(let k=0;k<3;k++)poly(x,[[hx+6+k*3,hy+5],[hx+7.5+k*3,hy+9],[hx+9+k*3,hy+5]],'#fff',OUT,.5)});x.restore()}
function imp(x,o){const P=o.pal,cx=48,by=84;x.save();shadowE(x,cx,by+5,14,4,.3);
  wingShape(x,cx-2,by-34,P[1],30,-1,false);wingShape(x,cx+2,by-34,P[1],32,1,false);
  x.strokeStyle=OUT;x.lineWidth=5;x.beginPath();x.moveTo(cx-6,by-18);x.quadraticCurveTo(cx-22,by-12,cx-18,by);x.stroke();x.strokeStyle=P[0];x.lineWidth=2.6;x.stroke();poly(x,[[cx-20,by],[cx-14,by-4],[cx-16,by+4]],P[2],OUT,.8);
  limb(x,cx-4,by-18,cx-5,by-6,5,P[0]);limb(x,cx+4,by-18,cx+5,by-6,5,P[0]);ell(x,cx,by-28,10,12,bodyG(x,cx-10,by-40,cx+10,by-16,P[0]),OUT,1.5);
  limb(x,cx-8,by-34,cx-14,by-26,4,P[0]);limb(x,cx+8,by-34,cx+15,by-30,4,P[0]);ell(x,cx+1,by-44,8.5,8.5,bodyG(x,cx-8,by-52,cx+9,by-36,P[0]),OUT,1.4);
  for(const k of[-1,1])poly(x,[[cx+1+k*4,by-50],[cx+1+k*8,by-60],[cx+1+k*8,by-50]],P[1],OUT,1);eye(x,cx-2,by-45,2.2,P[2]);eye(x,cx+5,by-45,2.2,P[2]);
  x.strokeStyle=OUT;x.lineWidth=1.2;x.beginPath();x.arc(cx+2,by-41,3,.2,2.9);x.stroke();x.restore()}
function insect(x,o){const P=o.pal,cx=48,by=86;x.save();shadowE(x,cx,by+2,30,6,.4);x.lineCap='round';
  for(const k of[-1,1])for(let i=0;i<4;i++){const y0=by-28+i*3;x.strokeStyle=OUT;x.lineWidth=5;x.beginPath();x.moveTo(cx+k*6,y0);x.lineTo(cx+k*(26+i*2),y0-14+i*2);x.lineTo(cx+k*(36+i*3),by-2);x.stroke();x.strokeStyle=P[0];x.lineWidth=2.8;x.stroke()}
  ell(x,cx-12,by-30,17,15,bodyG(x,cx-30,by-46,cx+4,by-14,P[0]),OUT,1.7);ell(x,cx-12,by-32,8,5,P[1],null);ell(x,cx+10,by-32,11,10,bodyG(x,cx,by-42,cx+22,by-22,P[0]),OUT,1.6);
  for(const[px,py]of[[6,-37],[12,-38],[9,-33],[15,-33]])ell(x,cx+px,by+py+2,2,2,'#fff6a0',OUT,.8);for(const k of[0,1])poly(x,[[cx+17,by-30+k*4],[cx+22,by-26+k*4],[cx+16,by-24+k*4]],'#eee',OUT,.7);x.restore()}
function vampire(x,o){humanoid(x,{pal:o.pal,skin:'#e8e0e6',armor:o.pal[0],cloth:o.pal[0],accent:o.pal[1],cape:o.pal[1],wings:shade(o.pal[0],-.1),wingStyle:'bat',weapon:'none',fangs:1,eyeCol:'#f22',hair:'#14101c',sleeve:o.pal[0],robe:0,helm:'none'})}
function drawCreatureRaw(cr){
  const c=mkc(96,96),x=c.ctx,P=cr.pal,a=cr.arch,nm=cr.name;const r=mulberry(cr.id.length*53+cr.tier*7+(cr.f+3)*13);const sc=cr.big?1.08:1;
  const tw=cr.tier>=4&&cr.up;
  switch(a){
    case'hum':humanoid(x,{pal:P,weapon:cr.tier%3===0?'axe':cr.tier%2?'sword':'spear',shield:cr.tier<=4?P[1]:null,helm:cr.f===7||cr.f===4?'horns':'helm',plume:cr.up?P[2]:null,bulk:cr.tier>=4||cr.f===4,sc:sc,skin:/Rana|Lagarto/.test(nm)?P[0]:undefined,tusks:/Goblin|Orco/.test(nm),ears:/Goblin/.test(nm)||cr.f===1,hair:cr.f===1?'#d8c868':cr.f===4?'#c06a2a':'#5a3a22',cape:cr.up?shade(P[1],-.1):null,eyeCol:cr.f===6?'#e80':null,helmCol:cr.f===0?'#c8d0e0':undefined,fangs:cr.f===3});break;
    case'arch':humanoid(x,{pal:P,weapon:'bow',helm:cr.f===1?'hood':'helm',bulk:cr.f===4,hair:'#8a6a3a',ears:cr.f===1,cape:cr.up?P[1]:null,sc});break;
    case'mage':humanoid(x,{pal:P,robe:1,weapon:'staff',helm:cr.f===0?'halo':'hat',orb:P[2],sc,hair:'#d8d4c0',cape:cr.up?shade(P[0],-.2):null,eyeCol:'#37b',skin:cr.f===6?'#8aaa5a':undefined});break;
    case'cav':{ // jinete sobre montura
      quadruped(x,{pal:cr.f===2?['#2a2a34','#1a1a22','#c82a3a']:cr.f===4?['#6a4a3a','#4a3020','#e8d8a8']:[ '#f0ece4','#d8d4c8','#e8c25a'],body:cr.f===2?'#262630':cr.f===4?'#6a4a3a':'#f0ece4',mane:cr.f===0?'#e8c25a':cr.f===2?'#7a1a2a':'#5a3a22',tusk:cr.f===4,sc:sc*.95});
      x.save();x.translate(0,-6);humanoid(x,{pal:P,weapon:'spear',shield:P[1],helm:'helm',plume:P[2],sc:.62,cape:P[1],eyeCol:cr.f===2?'#f22':null});x.restore();break}
    case'cent':quadruped(x,{pal:P,body:P[0],mane:P[2],sc:sc*.95});x.save();x.translate(16,-14);humanoid(x,{pal:P,weapon:'bow',sc:.56,hair:'#6a3a1a',cloth:P[1],armor:P[1],ears:1});x.restore();break;
    case'orc':humanoid(x,{pal:P,skin:P[0],weapon:cr.shoot?'bow':'club',armor:P[1],cloth:P[1],helm:'horns',bulk:1,tusks:1,sc:sc*1.08,eyeCol:'#e22',cape:cr.up?P[2]:null,hair:'none'});break;
    case'giant':humanoid(x,{pal:P,skin:P[0],weapon:'club',armor:P[1],cloth:P[1],helm:'none',bulk:1,cyclops:1,tusks:1,sc:sc*1.18,hair:'#4a3020'});break;
    case'angel':humanoid(x,{pal:P,skin:'#ffe8d0',armor:P[0],cloth:P[0],accent:P[1],wings:'#ffffff',wingStyle:'feather',weapon:'sword',helm:'halo',hair:'#f0d880',sc:sc*1.05,cape:null,eyeCol:'#39f'});
      x.fillStyle=rg(x,48,48,4,46,['rgba(255,240,180,.35)','rgba(255,240,180,0)']);x.fillRect(0,0,96,96);break;
    case'undead':humanoid(x,{pal:P,skull:1,armor:'#bdb8a4',cloth:'#8a8570',accent:P[2],weapon:cr.tier%2?'sword':'axe',shield:cr.tier===1?'#6a5a3a':null,glow:cr.up?'#4cf':'#fb2',legs:'#d8d4c0',helm:'none',sc});
      if(cr.f===2&&/Zombi/.test(nm)){x.save();x.globalCompositeOperation='source-atop';x.fillStyle='rgba(90,130,60,.45)';x.fillRect(0,0,96,96);x.restore()}break;
    case'lich':humanoid(x,{pal:P,skull:1,robe:1,armor:P[0],cloth:P[0],accent:P[1],weapon:'staff',orb:P[1],glow:P[1],helm:'none',sc:sc*1.03});break;
    case'vamp':vampire(x,{pal:P});break;
    case'demon':humanoid(x,{pal:P,skin:P[0],armor:shade(P[0],-.25),cloth:P[0],accent:P[1],wings:shade(P[0],-.15),wingStyle:'bat',weapon:cr.shoot?'staff':'sword',helm:'horns',bulk:cr.tier>=5,sc:sc*1.05,eyeCol:P[2],fangs:1,orb:P[1]});
      if(cr.tier>=5){x.fillStyle=rg(x,48,60,4,46,['rgba(255,110,40,.3)','rgba(255,110,40,0)']);x.fillRect(0,0,96,96)}break;
    case'beast':quadruped(x,{pal:P,body:P[0],mane:/Unicornio/.test(nm)?P[1]:/Oso|Cancerbero/.test(nm)?null:null,horn:/Unicornio/.test(nm),heads:/Cancerbero/.test(nm)?3:1,fangs:!/Unicornio/.test(nm),tusk:/Jabal/.test(nm),belly:P[1],stripes:/Lobo Gigante/.test(nm)?false:false,eyeCol:/Cancerbero/.test(nm)?'#fa4':null,fire:/Cancerbero/.test(nm)&&cr.up,sc:sc*(/Oso|Rata/.test(nm)?(/Oso/.test(nm)?1.05:.7):1)});break;
    case'bird':if(/Gárgola/.test(nm))gargoyle(x,{pal:P});else griffin(x,{pal:P,thunder:/Trueno|Rayo/.test(nm)});break;
    case'dragon':if(/Leviatán/.test(nm))serpent(x,{pal:P,crest:1});else dragon(x,{pal:P,fire:/FB/.test('')||cr.breath},cr);break;
    case'ghost':ghost(x,{pal:P,fire:/Ifrit|Fuego/.test(nm)});break;
    case'golem':golem(x,{pal:P,name:nm});break;
    case'tree':ent(x,{pal:P});break;
    case'serp':serpent(x,{pal:P,wings:/Alada|Quimera/.test(nm),crest:/Basilisco/.test(nm)});break;
    case'naga':naga(x,{pal:P,bow:cr.shoot});break;
    case'kraken':kraken(x,{pal:P});break;
    case'crab':crab(x,{pal:P});break;
    case'frog':humanoid(x,{pal:P,skin:P[0],armor:'#6a4a2a',cloth:P[0],accent:P[1],weapon:'spear',helm:'none',sc:.9,eyeCol:'#fa0',hair:'none',tusks:0,bulk:0});break;
    case'hydra':hydra(x,{pal:P});break;
    case'imp':imp(x,{pal:P});break;
    case'insect':insect(x,{pal:P});break;
    default:humanoid(x,{pal:P,weapon:'sword',helm:'helm',sc});
  }
  // iluminación: luz arriba-izquierda y sombra abajo
  x.save();x.globalCompositeOperation='source-atop';x.fillStyle=lg(x,0,0,70,96,['rgba(255,252,230,.26)','rgba(255,255,255,0)','rgba(14,4,40,.3)']);x.fillRect(0,0,96,96);x.fillStyle=rg(x,30,24,2,48,['rgba(255,255,255,.14)','rgba(255,255,255,0)']);x.fillRect(0,0,96,96);x.restore();
  try{polishSprite(c,{rim:'#fff3c8',bounce:(P&&P[2])||'#6aa0ff',grain:.2,mat:matOf(cr)})}catch(e){console.warn('polish',e)}
  if(cr.up){// destello dorado de criatura mejorada
    x.save();x.globalCompositeOperation='lighter';x.fillStyle=rg(x,48,48,6,52,['rgba(255,230,140,.16)','rgba(255,230,140,0)']);x.fillRect(0,0,96,96);x.restore();
    x.fillStyle='#ffe27a';poly(x,[[82,6],[84,12],[90,14],[84,16],[82,22],[80,16],[74,14],[80,12]],'#ffe27a',OUT,.8)}
  return c;
}
function creatureSprite(id,flip){const key='c'+id+(flip?'f':'');if(Gfx.cache[key])return Gfx.cache[key];
  const base=Gfx.cache['c'+id]||(Gfx.cache['c'+id]=drawCreatureRaw(CR[id]));if(!flip)return base;
  const c=mkc(96,96),x=c.ctx;x.translate(96,0);x.scale(-1,1);x.drawImage(base,0,0,96,96);return Gfx.cache[key]=c}
// ---------- retratos de héroe ----------
const FEM_NAMES=new Set(['Brenna','Rowena','Isolde','Lyssa','Caldera','Mirabel','Seraphine','Maelis','Odalys','Thalia','Naia','Sylwen','Liriel','Aelith','Ithilwen','Elowen','Drusa','Sethra','Morwen','Lilith','Veyra','Zerena','Tenebra','Ember','Kaeda','Pyra','Hexa','Infernia','Surtha','Helga','Runa','Magna','Ysolt','Embra','Skadi','Thyra','Selene','Coral','Nerea','Tethys','Morgana','Nixa','Calypso','Perla','Ondina','Quorra','Mossa','Vorta','Nagaina','Hissa','Mudra','Vyrma','Salamandra','Hilda','Ylva','Freya','Siv','Brunhild','Valka','Dagny','Gwendal']);
function portrait(fi,idx,cls,sz=64){
  const key='p'+fi+'_'+idx+'_'+cls+'_'+sz;if(Gfx.cache[key])return Gfx.cache[key];
  const c=mkc(64,64,IS_PHONE?2:3),x=c.ctx,r=mulberry(fi*131+idx*17+cls*5+3);
  const F=FDEF[fi],P0=F.col[0],P1=F.col[1],P2=F.col[2];
  const nm=(HERO_NAMES[fi]||[])[idx]||'',fem=FEM_NAMES.has(nm);
  const hum=fi===0,elf=fi===1,pale=fi===2,dem=fi===3,dwarf=fi===4,pir=fi===5,orc=fi===6,bar=fi===7;
  const pick=a=>a[Math.floor(r()*a.length)];
  // edad: 0 joven, 1 madura, 2 anciana
  let age;if(dwarf)age=fem?1:1+(r()<.55?1:0);else if(pale)age=1+(r()<.5?1:0);else if(elf)age=r()<.75?0:1;else{const q=r();age=q<.3?0:q<.75?1:2}
  if(fem&&age===2&&r()<.6)age=1;
  const skull=pale&&idx%7===4;
  const SKL=[['#f6d8bc','#eec6a2','#e0b088','#c68e64','#a8704a','#7a4a30'],['#f8e4d0','#f0d4b8','#e6c8a8','#d8b896'],['#cfd4dc','#b8c0cc','#a8b4b8','#c8c4b8'],['#c8503a','#a8402e','#b84848','#8a3050','#c86040'],['#eab890','#d8a07a','#c88a60','#f0c8a0'],['#d8a070','#c08858','#a86a44','#e8bc90','#8a5a3a'],['#7aa850','#6a9850','#8ab060','#5a8a60','#98a850'],['#f0d0b4','#e8c0a0','#d8a888','#c89070']];
  const HAIRL=[['#3a2412','#6a4020','#a87a3a','#d8b858','#222','#7a2a1a','#4a3020'],['#e8d890','#f4f0d0','#3a2a1a','#b0d890','#c0c8e0','#6a4a2a','#1a1a24'],['#e8e8f0','#a8a8b8','#1a1620','#6a6a7a'],['#1c1010','#601818','#2a1038','#d86a20'],['#c8601a','#e0902a','#6a3a1a','#d8d8d8','#3a2418','#a02a1a'],['#1a1410','#3a2412','#8a3a1a','#222','#6a4a2a'],['#1a1a14','#3a2a1a','#6a3a1a','#d8d0b0'],['#e0b858','#c8803a','#8a4a1a','#e8e0c8','#a02a1a','#3a2a1a']];
  const skin=skull?'#e4dcc4':pick(SKL[fi]),skD=shade(skin,-.26),skDD=shade(skin,-.46),skL=shade(skin,.2),skLL=shade(skin,.4);
  let hair=pick(HAIRL[fi]);if(age===2&&r()<.65&&!dem)hair=pick(['#d4d4dc','#b4b4c0','#e8e8ee']);
  const hD=shade(hair,-.38),hL=shade(hair,.32);
  const eyeC=pale||skull?'#7affb0':dem?'#ffd030':orc?pick(['#ffd030','#ff7a2a','#e8e040']):elf?pick(['#3aa86a','#4a8ad0','#a07acc','#c8a030']):bar?pick(['#6aa8e0','#8ac0e8','#4a7aa0']):pick(['#2a5a8a','#3a7a3a','#5a3a1a','#7a4a1a','#5a6a7a']);
  const glow=pale||skull||dem||(orc&&idx%2===0);
  // forma de la cabeza
  const jaw=dwarf||bar||(!fem&&r()<.4)?'sq':elf||(fem&&r()<.6)?'pt':r()<.5?'rd':'sq';
  const hr=11.2+(dwarf?2:0)+(orc?1.6:0)+(bar?1:0)-(elf?1.2:0)-(fem?.9:0)+r()*.9;
  const jw=jaw==='sq'?hr-.9:jaw==='rd'?hr-2.6:hr-5.4, cw=jaw==='sq'?5.2:jaw==='rd'?3.6:1.8;
  const chinY=40.5+(elf?1.6:0)+(jaw==='pt'?1.2:0)-(dwarf?.8:0)+(orc?.8:0);
  const ey=27.5-(dwarf?.4:0),ex=hr*.5,ew=orc?2.9:dwarf?3.1:fem||elf?3.6:3.3;
  const face=()=>{x.beginPath();x.moveTo(32-hr,25);x.bezierCurveTo(32-hr,16,32-hr*.55,12,32,12);x.bezierCurveTo(32+hr*.55,12,32+hr,16,32+hr,25);x.bezierCurveTo(32+hr,31,32+jw,36.5,32+cw,chinY);x.quadraticCurveTo(32,chinY+1.4,32-cw,chinY);x.bezierCurveTo(32-jw,36.5,32-hr,31,32-hr,25);x.closePath()};
  const strand=(x0,y0,x1,y1,bx,by,col,w,a=1)=>{x.save();x.globalAlpha=a;x.strokeStyle=col;x.lineWidth=w;x.lineCap='round';x.beginPath();x.moveTo(x0,y0);x.quadraticCurveTo(bx,by,x1,y1);x.stroke();x.restore()};
  // ===== fondo =====
  x.fillStyle=lg(x,0,0,0,64,[shade(P0,.2),shade(P1,-.25),shade(P1,-.5)]);x.fillRect(0,0,64,64);
  x.save();x.beginPath();x.rect(0,0,64,64);x.clip();
  if(hum){x.fillStyle='rgba(255,240,190,.2)';for(let i=0;i<9;i++){x.beginPath();x.moveTo(32,18);x.lineTo(32+Math.cos(i*.7)*60,18+Math.sin(i*.7)*60);x.lineTo(32+Math.cos(i*.7+.28)*60,18+Math.sin(i*.7+.28)*60);x.fill()}
    x.fillStyle='rgba(60,90,170,.5)';x.fillRect(0,0,6,64);x.fillRect(58,0,6,64);x.fillStyle='rgba(232,194,90,.45)';for(let i=0;i<5;i++){x.fillRect(0,6+i*13,6,2);x.fillRect(58,6+i*13,6,2)}}
  else if(elf){for(let i=0;i<5;i++){x.fillStyle='rgba(20,60,24,.5)';x.fillRect(3+i*14+(i%2)*3,0,4+(i%2)*2,44)}for(let i=0;i<8;i++)ell(x,4+i*8,5+(i%3)*5,8,7,'rgba(30,100,44,.6)');for(let i=0;i<14;i++){const px=(i*37)%64,py=(i*23)%50;ell(x,px,py,.9,.9,'rgba(220,255,160,.8)')}}
  else if(pale){ell(x,50,14,8,8,'rgba(230,240,255,.85)');ell(x,53,12,7,7,shade(P1,-.1));x.fillStyle='rgba(150,255,190,.2)';x.fillRect(0,38,64,26);for(let i=0;i<4;i++){x.strokeStyle='rgba(20,20,30,.7)';x.lineWidth=1.4;x.beginPath();x.moveTo(5+i*5,64);x.lineTo(5+i*5,40+i*3);x.lineTo(2+i*5,34+i*3);x.moveTo(5+i*5,46+i*3);x.lineTo(9+i*5,40+i*3);x.stroke()}}
  else if(dem){x.fillStyle=rg(x,32,64,2,50,['rgba(255,140,40,.8)','rgba(255,60,20,0)']);x.fillRect(0,0,64,64);for(let i=0;i<10;i++){ell(x,(i*29)%64,(i*17)%44,.8,.8,'rgba(255,200,80,.8)')}}
  else if(dwarf){x.strokeStyle='rgba(0,0,0,.2)';x.lineWidth=.8;for(let y=0;y<64;y+=9){x.beginPath();x.moveTo(0,y);x.lineTo(64,y);x.stroke();for(let xx=(y/9%2)*8;xx<64;xx+=16){x.beginPath();x.moveTo(xx,y);x.lineTo(xx,y+9);x.stroke()}}ell(x,8,16,3,4,'rgba(255,170,60,.85)');ell(x,56,16,3,4,'rgba(255,170,60,.85)');ell(x,8,16,7,8,'rgba(255,150,40,.25)');ell(x,56,16,7,8,'rgba(255,150,40,.25)')}
  else if(pir){x.strokeStyle='rgba(255,255,255,.3)';x.lineWidth=1.2;for(let k=0;k<4;k++){x.beginPath();for(let xx=0;xx<=64;xx+=3)x.lineTo(xx,38+k*7+Math.sin(xx*.25+k)*2);x.stroke()}x.fillStyle='rgba(255,230,190,.5)';ell(x,50,15,6,6,'rgba(255,230,190,.55)');x.strokeStyle='rgba(60,40,20,.7)';x.lineWidth=1.3;x.beginPath();x.moveTo(8,44);x.lineTo(8,6);x.stroke();poly(x,[[8,8],[20,18],[8,32]],'rgba(240,230,200,.5)',null)}
  else if(orc){x.fillStyle='rgba(180,220,120,.2)';x.fillRect(0,30,64,34);x.strokeStyle='rgba(40,60,20,.65)';x.lineWidth=1.5;for(let i=0;i<8;i++){x.beginPath();x.moveTo(3+i*8,64);x.lineTo(5+i*8+(i%3),30+(i%2)*8);x.stroke()}for(let i=0;i<6;i++)ell(x,(i*23)%64,(i*11)%30,1,1,'rgba(220,255,120,.8)')}
  else{ell(x,14,12,18,8,'rgba(70,70,110,.55)');ell(x,50,10,18,8,'rgba(70,70,110,.55)');x.strokeStyle='rgba(255,255,255,.85)';x.lineWidth=1;x.beginPath();x.moveTo(50,14);x.lineTo(46,22);x.lineTo(50,24);x.lineTo(45,34);x.stroke();for(let i=0;i<14;i++)ell(x,(i*31)%64,(i*13)%40,.6,.6,'rgba(255,255,255,.8)');x.fillStyle='rgba(120,150,200,.3)';x.beginPath();x.moveTo(0,52);x.lineTo(14,34);x.lineTo(26,48);x.lineTo(42,30);x.lineTo(64,50);x.lineTo(64,64);x.lineTo(0,64);x.fill()}
  x.restore();
  x.fillStyle=rg(x,32,26,2,34,['rgba(255,244,210,.5)','rgba(255,244,210,.12)','rgba(255,244,210,0)']);x.fillRect(0,0,64,64);
  x.save();x.translate(32,64);x.scale(1.1,1.1);x.translate(-32,-64);
  if(hum&&cls){ell(x,32,16,24,24,rg(x,32,16,6,24,['rgba(255,240,150,.6)','rgba(255,225,110,.3)','rgba(255,225,110,0)']));x.save();x.globalCompositeOperation='lighter';for(let i=0;i<14;i++){const a=i/14*6.283;poly(x,[[32+Math.cos(a)*18,16+Math.sin(a)*18],[32+Math.cos(a+.1)*30,16+Math.sin(a+.1)*30],[32+Math.cos(a-.1)*30,16+Math.sin(a-.1)*30]],'rgba(255,220,100,.35)',null)}x.restore()}
  // ===== capucha trasera / capa / pelo largo trasero =====
  const hoodCol=cls?(pale?'#241a30':elf?'#2f5a30':dwarf?'#5a5a66':bar?'#3a4a8a':hum?'#f0ecdc':null):null;
  const hooded=!!hoodCol&&!(elf&&cls&&idx%2===0)&&!(bar&&cls&&0)&&!(dwarf&&cls&&idx%2===0);
  const hairStyle=(skull||(dem&&!fem&&r()<.4)||(age===2&&!fem&&!dwarf&&r()<.4))?'bald':fem?pick(['long','long','wavy','bun','pony']):dwarf?'short':bar?pick(['long','braid','short']):orc?pick(['mohawk','short','bald']):elf?pick(['long','long','pony']):dem?pick(['swept','spiky','long']):pick(['short','swept','long','short']);
  const longHair=hairStyle==='long'||hairStyle==='wavy'||hairStyle==='braid';
  const hcg=bodyG(x,17,10,47,56,hair);
  if(longHair&&!hooded){x.beginPath();x.moveTo(32-hr-2,20);x.bezierCurveTo(32-hr-9,34,32-hr-5,48,32-hr-6,56);x.lineTo(32+hr+6,56);x.bezierCurveTo(32+hr+5,48,32+hr+9,34,32+hr+2,20);x.closePath();x.fillStyle=hcg;x.fill();x.strokeStyle=OUT;x.lineWidth=1.3;x.stroke();
    for(let i=0;i<6;i++){strand(32-hr-2+i*1.2,26,32-hr-3+i*2.4,54,32-hr-6+i*2,40,i%2?hD:hL,.7,.55);strand(32+hr+2-i*1.2,26,32+hr+3-i*2.4,54,32+hr+6-i*2,40,i%2?hD:hL,.7,.55)}}
  if(hairStyle==='pony'||hairStyle==='bun'){if(hairStyle==='pony'){x.beginPath();x.moveTo(32+hr-2,16);x.bezierCurveTo(32+hr+12,14,32+hr+14,34,32+hr+7,46);x.bezierCurveTo(32+hr+5,36,32+hr+5,26,32+hr-3,22);x.closePath();x.fillStyle=hcg;x.fill();x.strokeStyle=OUT;x.lineWidth=1.2;x.stroke();strand(32+hr+1,18,32+hr+7,44,32+hr+11,30,hL,.7,.6)}
    else{ell(x,32,8.5,6.4,5.2,bodyG(x,26,4,38,14,hair),OUT,1.2);strand(28,6,36,10,32,4,hL,.8,.7)}}
  if(hooded){x.beginPath();x.moveTo(8,64);x.bezierCurveTo(8,44,12,30,13,22);x.bezierCurveTo(14,6,24,1,32,1);x.bezierCurveTo(40,1,50,6,51,22);x.bezierCurveTo(52,30,56,44,56,64);x.closePath();x.fillStyle=lg(x,10,2,54,60,[shade(hoodCol,.15),hoodCol,shade(hoodCol,-.5)]);x.fill();x.strokeStyle=OUT;x.lineWidth=1.5;x.stroke()}
  else if(cls&&!hum||(hum&&!cls&&r()<.5)){/* capa */}
  // ===== cuerpo =====
  const mainC=cls?(pale?'#2a2036':elf?'#2f6a3a':dem?'#4a1a1a':dwarf?'#6a4a30':pir?'#1a5a8a':orc?'#5a4a2a':bar?'#3a4a9a':hum?'#f4f0e4':P1):P1;
  const trim=cls?P2:P0;
  const armorC=pale?'#3c3448':dem?'#5a2420':dwarf?'#8a8a98':pir?'#4a3a2a':orc?'#6a5a3a':bar?'#8a8ea0':elf?'#6a8a54':'#aab4c8';
  const sh=dwarf||bar||(orc&&!cls)?1.12:1;
  x.beginPath();x.moveTo(32-26*sh,64);x.quadraticCurveTo(32-27*sh,50,32-19*sh,45);x.lineTo(32-8,43);x.lineTo(32+8,43);x.lineTo(32+19*sh,45);x.quadraticCurveTo(32+27*sh,50,32+26*sh,64);x.closePath();
  x.fillStyle=lg(x,6,43,58,64,[shade(cls?mainC:armorC,.3),cls?mainC:armorC,shade(cls?mainC:armorC,-.45)]);x.fill();x.strokeStyle=OUT;x.lineWidth=1.5;x.stroke();
  if(!cls){// hombreras y peto
    for(const s of[-1,1]){x.beginPath();x.ellipse(32+s*21*sh,48.5,8.5,6.2,s*.35,Math.PI,0);x.lineTo(32+s*29.4*sh,52);x.lineTo(32+s*12.6*sh,52);x.closePath();x.fillStyle=lg(x,32+s*14*sh,42,32+s*29*sh,54,[shade(armorC,.45),armorC,shade(armorC,-.4)]);x.fill();x.strokeStyle=OUT;x.lineWidth=1.3;x.stroke();
      strand(32+s*17*sh,46.5,32+s*25*sh,48,32+s*21*sh,45,'rgba(255,255,255,.7)',.9);ell(x,32+s*21*sh,50,1,1,P0,OUT,.5);
      x.strokeStyle=P0;x.lineWidth=.9;x.beginPath();x.moveTo(32+s*13*sh,52);x.lineTo(32+s*29*sh,52);x.stroke()}
    x.fillStyle=lg(x,0,52,0,64,[P1,shade(P1,-.45)]);x.beginPath();x.moveTo(26,52);x.lineTo(38,52);x.lineTo(36,64);x.lineTo(28,64);x.fill();x.strokeStyle=OUT;x.lineWidth=.8;x.stroke();
    if(hum||bar||dwarf){x.fillStyle=P0;poly(x,[[32,54],[34,57],[32,60],[30,57]],P0,OUT,.6)}}
  else{// túnica: cuello adornado y pliegues
    for(let i=0;i<4;i++)strand(12+i*3,64,16+i*3.4,49,12+i*3,56,shade(mainC,-.45),.9,.5);for(let i=0;i<4;i++)strand(52-i*3,64,48-i*3.4,49,52-i*3,56,shade(mainC,.25),.8,.4);
    x.beginPath();x.moveTo(20,45);x.lineTo(32,62);x.lineTo(44,45);x.lineTo(40,43);x.lineTo(32,54);x.lineTo(24,43);x.closePath();x.fillStyle=lg(x,20,43,44,62,[shade(trim,.3),trim,shade(trim,-.4)]);x.fill();x.strokeStyle=OUT;x.lineWidth=1.1;x.stroke();
    if(fem||r()<.5){ell(x,32,53.5,2.3,2.3,rg(x,31.4,52.8,.2,2.6,['#fff',eyeC==='#2a5a8a'?'#e84a4a':eyeC,shade(eyeC,-.5)]),OUT,.7)}}
  // cuello
  x.beginPath();x.rect(32-5.6*sh,34,11.2*sh,13);x.fillStyle=lg(x,32-6,0,32+6,0,[skL,skin,skD]);x.fill();x.strokeStyle=OUT;x.lineWidth=1.1;x.stroke();
  x.fillStyle='rgba(0,0,0,.35)';x.fillRect(32-5.4*sh,chinY-.5,10.8*sh,5);
  if(!cls){poly(x,[[32-9,43],[32,48],[32+9,43],[32+7,46],[32,51],[32-7,46]],shade(armorC,.1),OUT,1)}
  if(dem&&!cls){for(const s of[-1,1])poly(x,[[32+s*13,45],[32+s*16,36],[32+s*20,47]],'#2a1210',OUT,1)}
  // ===== orejas =====
  for(const s of[-1,1]){const ex0=32+s*(hr-.4);
    if(elf){poly(x,[[ex0,25],[ex0+s*15,14+(idx%3)],[ex0+s*2,31+s*0],[ex0,33]],lg(x,ex0,0,ex0+s*15,0,[skin,skL]),OUT,1.1);poly(x,[[ex0+s*2,26],[ex0+s*9,18],[ex0+s*2,29]],skD,null)}
    else if(orc||dem){poly(x,[[ex0,25],[ex0+s*8,17],[ex0+s*4,26],[ex0+s*2,32],[ex0,33]],skin,OUT,1.1);poly(x,[[ex0+s*1,26],[ex0+s*5,21],[ex0+s*2,29]],skD,null)}
    else{ell(x,ex0+s*.8,29,2.6,3.9,lg(x,ex0,25,ex0+s*3,33,[skL,skin,skD]),OUT,1.1);ell(x,ex0+s*1,29,1,2,skD)}
    if(pir&&s<0&&!(cls===0&&idx%3===0)){ell(x,ex0-.8,33.4,1.2,1.4,'#f0c040',OUT,.6)}
    if(dem&&s>0)ell(x,ex0+s*2,33,1,1,'#ffd040',OUT,.5)}
  // ===== cara =====
  face();x.fillStyle=skull?lg(x,20,12,44,44,[skLL,skin,skD]):rg(x,26,22,1,26,[skLL,skL,skin,skD]);x.fill();
  x.save();face();x.clip();
  // sombra lateral derecha, mentón, frente
  x.fillStyle=lg(x,30,0,32+hr+1,0,['rgba(0,0,0,0)',skD+'']);x.globalAlpha=.42;x.fillRect(30,8,hr+4,40);x.globalAlpha=1;
  x.fillStyle=lg(x,0,32,0,chinY+1.5,['rgba(0,0,0,0)','rgba(60,20,10,.4)']);x.fillRect(0,32,64,12);
  x.fillStyle=lg(x,0,12,0,22,['rgba(0,0,0,.2)','rgba(0,0,0,0)']);x.fillRect(0,10,64,12);
  if(!skull){ell(x,32-hr*.5,32.5,3.3,2.2,'rgba(240,110,90,.22)');ell(x,32+hr*.5,32.5,3.3,2.2,'rgba(240,110,90,.16)');
    ell(x,32-hr*.45,31,2.2,1.5,'rgba(255,255,240,.22)');ell(x,30.5,17.5,5.5,2.2,'rgba(255,255,240,.22)');
    if(hr>12||dwarf||bar){x.fillStyle='rgba(0,0,0,.14)';ell(x,32-hr+1.4,34,1.4,3.8,'rgba(0,0,0,.14)');ell(x,32+hr-1.4,34,1.4,3.8,'rgba(0,0,0,.2)')}}
  if(skull){// calavera: cuencas, hendiduras
    x.fillStyle='rgba(60,50,30,.35)';for(const s of[-1,1]){ell(x,32+s*(hr-.5),30,2.4,5,'rgba(60,50,30,.35)')}
    strand(36,12,38,21,39,15,'rgba(60,40,20,.7)',.7);strand(38,21,36,24,41,23,'rgba(60,40,20,.7)',.6)}
  x.restore();
  face();x.strokeStyle=OUT;x.lineWidth=1.4;x.stroke();
  // luz de recorte lateral izquierda
  x.save();face();x.clip();x.strokeStyle=lg(x,32-hr,0,32+3,0,['rgba(255,236,190,.85)','rgba(255,236,190,0)']);x.lineWidth=2;face();x.stroke();x.restore();
  // ===== ojos =====
  const drawEye=(s)=>{const cx=32+s*ex;const lookX=s*.25;
    if(skull){ell(x,cx,ey,ew*.9,ew*.95,'#0c0a10',OUT,1);ell(x,cx+lookX,ey+.2,1.3,1.3,eyeC);ell(x,cx,ey,3.8,3.4,'rgba(120,255,176,.22)');return}
    const tl=pale||dem?(s*-.1):0;
    x.beginPath();x.moveTo(cx-ew,ey+.5+(dem?-s*.2*0:0));x.quadraticCurveTo(cx-ew*.1,ey-ew*.95-(fem?.3:0),cx+ew,ey+.2);x.quadraticCurveTo(cx+ew*.1,ey+ew*.62,cx-ew,ey+.5);x.closePath();
    x.save();x.clip();x.fillStyle=glow&&!(orc)?'#10100e':lg(x,0,ey-ew,0,ey+ew,['#cfc8c0','#f6f2ea','#e8e0d4']);x.fillRect(cx-ew-1,ey-ew-1,ew*2+2,ew*2+2);
    const ir=ew*.62;x.fillStyle=rg(x,cx+lookX,ey+.1,.2,ir,[shade(eyeC,.55),eyeC,shade(eyeC,-.5)]);x.beginPath();x.arc(cx+lookX,ey+.1,ir,0,6.3);x.fill();
    x.strokeStyle=shade(eyeC,-.6);x.lineWidth=.35;x.beginPath();x.arc(cx+lookX,ey+.1,ir,0,6.3);x.stroke();
    ell(x,cx+lookX,ey+.1,ir*.46,ir*.46,'#07050a');if(glow){ell(x,cx+lookX,ey+.1,ir*1.3,ir*1.3,'rgba(255,255,255,.2)')}
    x.fillStyle='rgba(0,0,0,.28)';x.fillRect(cx-ew-1,ey-ew-1,ew*2+2,ew*.62);// sombra del párpado
    ell(x,cx+lookX-ir*.35,ey-ir*.3,.62,.62,'#fff');ell(x,cx+lookX+ir*.4,ey+ir*.35,.28,.28,'rgba(255,255,255,.7)');
    x.restore();
    x.strokeStyle=OUT;x.lineWidth=1.05;x.lineCap='round';x.beginPath();x.moveTo(cx-ew-.3,ey+.5);x.quadraticCurveTo(cx-ew*.1,ey-ew*.95-(fem?.3:0),cx+ew+.4,ey+.2);x.stroke();
    x.strokeStyle='rgba(60,20,10,.45)';x.lineWidth=.5;x.beginPath();x.moveTo(cx-ew+.5,ey+.6);x.quadraticCurveTo(cx+ew*.1,ey+ew*.62,cx+ew-.4,ey+.3);x.stroke();
    if(fem&&!orc){x.strokeStyle=OUT;x.lineWidth=.8;x.beginPath();x.moveTo(cx+s*ew,ey+.2);x.lineTo(cx+s*(ew+1.4),ey-.8);x.stroke()}
    if(glow){ell(x,cx,ey,ew*1.8,ew*1.3,(dem||orc?'rgba(255,190,50,.2)':'rgba(120,255,170,.2)'))}
    // párpado/arruga bajo el ojo
    if(age>=1){x.strokeStyle='rgba(80,40,30,.35)';x.lineWidth=.45;x.beginPath();x.moveTo(cx-ew*.7,ey+ew*.9);x.quadraticCurveTo(cx,ey+ew*1.15,cx+ew*.8,ey+ew*.9);x.stroke()}
    if(age===2){for(let k=0;k<3;k++)strand(cx+s*(ew+.6),ey-.3+k*1.3,cx+s*(ew+2.8),ey-1.6+k*2.4,cx+s*(ew+1.8),ey-.6+k*1.6,'rgba(80,40,30,.45)',.45)}};
  drawEye(-1);drawEye(1);
  // ===== cejas =====
  const mood=pick(['calm','stern','stern','wry']);
  for(const s of[-1,1]){const bx=32+s*ex,inX=bx-s*(ew+.4),outX=bx+s*(ew+1.6);const thick=(dwarf?2.3:orc?2:bar||(!fem&&!elf)?1.7:fem?.95:1.2);
    const inY=ey-4.6-(mood==='stern'?-.7:0)-(elf?.3:0),outY=ey-5.2+(mood==='stern'?.3:0)+(mood==='wry'&&s>0?-1.2:0)+(elf||pale?-.9:0)+(fem?-.5:0);
    const bc=pale?shade(hair,-.1):dem?'#1a0a0a':hair;
    x.beginPath();x.moveTo(inX,inY+thick*.4);x.quadraticCurveTo((inX+outX)/2,Math.min(inY,outY)-1.4,outX,outY+.2);x.quadraticCurveTo((inX+outX)/2,Math.min(inY,outY)-1.4+thick,inX,inY+thick);x.closePath();x.fillStyle=shade(bc,-.1);x.fill();
    strand(inX+s*.4,inY+thick*.5,outX-s*.8,outY+.3,(inX+outX)/2,Math.min(inY,outY)-.9,shade(bc,.35),.3,.7)}
  // ===== nariz =====
  const nw=dwarf?2.7:orc?2.6:elf?1.1:fem?1.3:1.8,nb=dwarf?35.3:orc?34.6:33.6;
  x.fillStyle='rgba(255,255,240,.28)';x.beginPath();x.moveTo(31.4,ey);x.lineTo(32.3,ey);x.lineTo(32.3,nb-1.4);x.lineTo(31.2,nb-1);x.fill();
  x.strokeStyle=skD;x.lineWidth=.8;x.lineCap='round';x.beginPath();x.moveTo(32+(elf?1:1.3),ey+1);x.quadraticCurveTo(32+nw*.8,nb-2.4,32+nw*.95,nb-.8);x.stroke();
  if(skull){x.fillStyle='#0c0a10';poly(x,[[32,31],[34.4,35.6],[29.6,35.6]],'#0c0a10',null)}
  else{
    ell(x,32,nb-.3,nw*.75,1.25,lg(x,0,nb-2,0,nb+1,[skL,skin]),skD,.5);
    ell(x,32-nw,nb-.1,.95,.9,skin,skD,.45);ell(x,32+nw,nb-.1,.95,.9,skD,skDD,.35);
    x.fillStyle='rgba(30,10,8,.8)';x.beginPath();x.ellipse(32-nw*.5,nb+.5,.55,.35,0,0,6.3);x.ellipse(32+nw*.5,nb+.5,.55,.35,0,0,6.3);x.fill();
    x.strokeStyle='rgba(80,30,20,.4)';x.lineWidth=.5;x.beginPath();x.moveTo(32-nw*.7,nb+1.3);x.quadraticCurveTo(32,nb+2,32+nw*.7,nb+1.3);x.stroke();
    if(dwarf)ell(x,32,nb-1,2.2,1.5,'rgba(255,120,100,.28)')}
  // ===== boca =====
  const my=dwarf?38.3:37.5+(jaw==='pt'?.4:0),mw=orc?4.4:fem?2.8:3.5;
  const expr=pick(['neutral','smirk','stern','grin','neutral']);
  const lipC=fem?(dem?'#8a1a3a':pale?'#5a2a4a':'#b8404a'):shade(skin,-.38),lipH=fem?'#d8606a':shade(skin,-.15);
  if(skull){x.fillStyle='#0c0a10';x.fillRect(32-mw,my-.5,mw*2,3);x.strokeStyle='#e4dcc4';x.lineWidth=.6;for(let i=-3;i<=3;i++){x.beginPath();x.moveTo(32+i*1.1,my-.5);x.lineTo(32+i*1.1,my+2.5);x.stroke()}x.beginPath();x.moveTo(32-mw,my+1);x.lineTo(32+mw,my+1);x.stroke()}
  else if(expr==='grin'&&!dwarf&&!(bar&&age===2)||dem&&expr!=='stern'){// sonrisa con dientes
    x.beginPath();x.moveTo(32-mw,my-.4);x.quadraticCurveTo(32,my+2.8,32+mw,my-.4);x.quadraticCurveTo(32,my+.2,32-mw,my-.4);x.fillStyle='#f6f0e0';x.fill();x.strokeStyle='rgba(50,15,12,.95)';x.lineWidth=.8;x.stroke();
    if(dem){for(const s of[-1,1])poly(x,[[32+s*1.8,my],[32+s*2.4,my+2.3],[32+s*2.9,my+.1]],'#fff8e0',OUT,.3)}}
  else{const dy=expr==='stern'?.7:expr==='smirk'?-.5:0;x.beginPath();x.moveTo(32-mw,my+(expr==='smirk'?.3:dy*.3));x.quadraticCurveTo(32-1,my-.6+dy,32,my-.1+(expr==='stern'?.2:0));x.quadraticCurveTo(32+1,my-.6+dy,32+mw,my+(expr==='smirk'?-.9:dy*.3));x.quadraticCurveTo(32,my+1.3+(expr==='stern'?-.4:.3),32-mw,my+(expr==='smirk'?.3:dy*.3));x.closePath();x.fillStyle=lipC;x.fill();
    x.strokeStyle='rgba(40,10,10,.9)';x.lineWidth=.75;x.beginPath();x.moveTo(32-mw,my+(expr==='smirk'?.3:dy*.3));x.quadraticCurveTo(32,my+.15+dy*.4,32+mw,my+(expr==='smirk'?-.9:dy*.3));x.stroke();
    ell(x,32,my+1.4,mw*.45,.5,lipH+'aa');ell(x,32,my+2.9+(jaw==='pt'?0:.3),1.4,.6,'rgba(0,0,0,.18)')}
  if(orc||(dem&&expr==='stern')){for(const s of[-1,1])poly(x,[[32+s*2.6,my+.6],[32+s*3.4,my-3.6],[32+s*4.6,my+.4]],'#f4f0d0',OUT,.7)}
  // nasolabiales y arrugas
  if(age>=1&&!skull){x.strokeStyle='rgba(80,35,25,.38)';x.lineWidth=.55;for(const s of[-1,1]){x.beginPath();x.moveTo(32+s*(nw+1.4),nb);x.quadraticCurveTo(32+s*(mw+2.3),my-2,32+s*(mw+1.4),my+1);x.stroke()}
    strand(26,19.8,38,19.6,32,19,'rgba(80,35,25,.3)',.5)}
  if(age===2&&!skull){strand(25,21.4,37.6,21.6,31,20.9,'rgba(80,35,25,.3)',.5);strand(27.5,17.8,36,17.8,32,17.3,'rgba(80,35,25,.25)',.45);for(const s of[-1,1])strand(32+s*(hr-2.3),36,32+s*(hr-4),40,32+s*(hr-3.4),38.2,'rgba(80,35,25,.3)',.5)}
  if(dem&&!skull){strand(32-ex-ew,ey-6,32-ex+ew,ey-4.5,32-ex,ey-8,'rgba(255,170,40,.45)',.6);ell(x,32,16.5,.9,.9,'rgba(255,160,40,.7)')}
  // cicatriz o marca
  const scar=(!cls&&r()<.3)||idx%7===2;if(scar&&!skull){const sx=r()<.5?-1:1;x.strokeStyle='rgba(150,50,50,.7)';x.lineWidth=.8;x.beginPath();x.moveTo(32+sx*(ex+2.4),ey+2.6);x.lineTo(32+sx*(ex+4.2),ey+9);x.stroke();x.strokeStyle='rgba(255,220,200,.35)';x.lineWidth=.35;x.stroke();x.strokeStyle='rgba(60,10,10,.8)';x.lineWidth=.4;}
  if(pale&&!skull){x.strokeStyle='rgba(60,70,90,.5)';x.lineWidth=.5;for(let k=0;k<3;k++){strand(32-hr+3+k,33,32-hr+5+k*1.3,40,32-hr+4,36,'rgba(60,70,90,.4)',.45)}ell(x,32-ex,ey+3.5,2.6,1.4,'rgba(70,60,110,.3)');ell(x,32+ex,ey+3.5,2.6,1.4,'rgba(70,60,110,.3)')}
  if(bar&&cls){x.strokeStyle='rgba(90,170,255,.85)';x.lineWidth=.9;for(const s of[-1,1]){x.beginPath();x.moveTo(32+s*(ex+1),ey+2.6);x.lineTo(32+s*(ex+2.8),ey+6.5);x.moveTo(32+s*(ex-.6),ey+3.2);x.lineTo(32+s*(ex+.6),ey+7.8);x.stroke()}}
  if(orc){x.strokeStyle=cls?'rgba(240,240,210,.85)':'rgba(190,40,20,.8)';x.lineWidth=1.3;for(const s of[-1,1]){x.beginPath();x.moveTo(32+s*(hr-1),ey+1.5);x.lineTo(32+s*(hr-5),ey+4.5);x.stroke()}x.beginPath();x.moveTo(32-1,16);x.lineTo(32-1,23);x.stroke()}
  if(pir&&!cls&&idx%3===0){// parche
    const s=idx%2?1:-1;x.strokeStyle='#14100c';x.lineWidth=.9;x.beginPath();x.moveTo(32-s*(hr),18);x.lineTo(32+s*ex,ey-1);x.lineTo(32+s*hr,34);x.stroke();
    ell(x,32+s*ex,ey,ew+1,ew,rg(x,32+s*ex-1,ey-1,.3,ew+1,['#4a4038','#141010']),OUT,.9)}
  // gafas rúnicas/enanos: nada. Bigotes/barbas
  const bType=skull?'none':dwarf?(fem?'none':'long'):elf||dem&&r()<.5?'none':(fem||pir&&cls)?'none':bar?pick(['full','full','long','short']):orc?pick(['none','short','tusk']):age===0?pick(['none','stubble','none','short']):pick(['short','full','stache','stubble','short','none']);
  const beardLen=bType==='long'?(dwarf?22:15):bType==='full'?8:bType==='short'?2.5:0;
  const bC=dem?'#1a0a0a':hair;
  if(bType==='stubble'||bType==='tusk'&&0){x.save();face();x.clip();x.fillStyle='rgba(30,20,10,.18)';x.fillRect(0,31,64,14);x.restore()}
  const bg=lg(x,0,30,0,chinY+beardLen,[shade(bC,.3),bC,shade(bC,-.35)]);
  if(bType==='long'||bType==='full'||bType==='short'){
    const L=beardLen,gap=bType==='short';
    x.beginPath();x.moveTo(32-hr+.3,27.5);x.bezierCurveTo(32-hr-.8,34+L*.2,32-cw-1.4,chinY+L*.7+.5,32-(bType==='long'&&dwarf?1.5:0),chinY+L+1.5);
    if(bType==='long'){x.lineTo(32,chinY+L+4)}x.bezierCurveTo(32+cw+1.4,chinY+L*.7+.5,32+hr+.8,34+L*.2,32+hr-.3,27.5);
    if(gap){x.bezierCurveTo(32+hr-1.6,33,32+6.4,35,32+4.4,37.2);x.bezierCurveTo(32+4,40.4,32+2,41.2,32,41.4);x.bezierCurveTo(32-2,41.2,32-4,40.4,32-4.4,37.2);x.bezierCurveTo(32-6.4,35,32-hr+1.6,33,32-hr+.3,27.5)}
    else{x.bezierCurveTo(32+hr-1.8,33,32+6.5,33.2,32+3.2,34);x.quadraticCurveTo(32,33,32-3.2,34);x.bezierCurveTo(32-6.5,33.2,32-hr+1.8,33,32-hr+.3,27.5)}
    x.closePath();x.fillStyle=bg;x.fill();x.strokeStyle=OUT;x.lineWidth=1.3;x.stroke();
    x.save();x.clip();for(let i=0;i<11;i++){const px=32-hr+1+i*(2*hr-2)/10;strand(px,31+Math.abs(i-5)*.3,32+(px-32)*.35,chinY+L+1+(i%2)*1.5,px+(px-32)*.2,36+L*.5,i%3===0?hL:hD,.6,.55)}
    x.fillStyle=lg(x,0,30,0,50,['rgba(255,255,255,.2)','rgba(0,0,0,0)']);x.fillRect(0,30,64,20);x.restore();
    if(dwarf){for(const px of[26,32,38]){if(px===32)continue;ell(x,px,chinY+L*.8,1.6,1.6,lg(x,px-1,0,px+1,0,['#ffe27a','#a07a20']),OUT,.7)}ell(x,32,chinY+L+1,1.7,1.7,lg(x,31,0,33,0,['#ffe27a','#a07a20']),OUT,.7)}}
  if(bType==='full'||bType==='long'||bType==='stache'||bType==='short'||bType==='tusk'&&0){// bigote
    for(const s of[-1,1]){x.beginPath();x.moveTo(32,nb+1.2);x.bezierCurveTo(32+s*3,nb+.4,32+s*6.4,nb+1.4,32+s*(bType==='long'?7.4:6.2),my+(bType==='long'?3:1.4));x.bezierCurveTo(32+s*4.6,my+.6,32+s*2.6,my-1.5,32,my-1.6);x.closePath();x.fillStyle=lg(x,0,nb,0,my+2,[shade(bC,.25),bC,shade(bC,-.2)]);x.fill();x.strokeStyle=OUT;x.lineWidth=.9;x.stroke();strand(32+s*1.2,nb+1.6,32+s*5,my+.4,32+s*3.4,nb+1,hL,.4,.8)}}
  if(!cls||pir||hum&&fem===false&&0){/* nada */}
  // ===== capucha delantera =====
  if(hooded){x.beginPath();x.moveTo(8,64);x.bezierCurveTo(8,44,12,30,13,22);x.bezierCurveTo(14,6,24,1,32,1);x.bezierCurveTo(40,1,50,6,51,22);x.bezierCurveTo(52,30,56,44,56,64);x.lineTo(46,64);
    x.bezierCurveTo(46,52,46,44,42,40);x.lineTo(46,34);// borde interior (lado derecho)
    x.bezierCurveTo(46,30,46,28,45,24);
    x.bezierCurveTo(44,15,38,11.4,32,11.4);x.bezierCurveTo(26,11.4,20,15,19,24);x.bezierCurveTo(18,28,18,30,18,34);x.lineTo(22,40);x.bezierCurveTo(18,44,18,52,18,64);x.closePath();
    x.fillStyle=lg(x,10,2,54,60,[shade(hoodCol,.28),shade(hoodCol,.02),shade(hoodCol,-.5)]);x.fill();x.strokeStyle=OUT;x.lineWidth=1.3;x.stroke();
    x.save();x.clip();for(let i=0;i<5;i++){strand(14+i*2,10+i*3,15+i*1.6,64,12+i*2,36,shade(hoodCol,-.5),.8,.5);strand(50-i*2,10+i*3,49-i*1.6,64,52-i*2,36,shade(hoodCol,.3),.7,.35)}x.restore();
    x.save();face();x.clip();x.fillStyle=lg(x,0,12,0,24,['rgba(0,0,0,.22)','rgba(0,0,0,0)']);x.fillRect(0,10,64,16);x.fillStyle=lg(x,32-hr,0,32-hr+5,0,['rgba(0,0,0,.35)','rgba(0,0,0,0)']);x.fillRect(32-hr,12,5,30);x.restore();
    x.strokeStyle=trim;x.lineWidth=1;x.beginPath();x.moveTo(19,25);x.bezierCurveTo(20,15,26,11.9,32,11.9);x.bezierCurveTo(38,11.9,44,15,45,25);x.stroke()}
  // ===== pelo delantero =====
  const top=hooded?13:8.5;
  const covered=!!(!cls&&(hum||pale||dem||dwarf||bar))||(!cls&&orc&&0);
  const hasHat=!hooded&&(!cls?(hum||pale||dem||dwarf||bar||pir||orc):(elf||pir||orc||bar||dem||pale||dwarf));
  const capPath=(tp,hl,sy)=>{x.beginPath();x.moveTo(32-hr-1.3,sy);x.bezierCurveTo(32-hr-3.4,tp+6,32-hr*.6,tp-.5,32,tp-.5);x.bezierCurveTo(32+hr*.6,tp-.5,32+hr+3.4,tp+6,32+hr+1.3,sy);x.lineTo(32+hr-.2,sy-4);x.quadraticCurveTo(32+hr-.4,hl+1.5,32+3.4,hl);x.quadraticCurveTo(32-3,hl-3.6,32-hr+.9,hl+2.6);x.lineTo(32-hr+.2,sy-4);x.closePath()};
  const drawHair=()=>{
    if(hairStyle==='bald'||hooded)return;
    if(hairStyle==='mohawk'){x.beginPath();x.moveTo(26,16);x.bezierCurveTo(26,4,30,-1,34,-1);x.bezierCurveTo(38,-1,38,4,38,16);x.lineTo(35,12);x.lineTo(32,14);x.lineTo(29,12);x.closePath();x.fillStyle=bodyG(x,26,0,38,0,hair);x.fill();x.strokeStyle=OUT;x.lineWidth=1.2;x.stroke();for(let i=0;i<5;i++)strand(28+i*2,14,28.5+i*2,2,28+i*2,8,i%2?hL:hD,.5,.7);return}
    const hl=hairStyle==='swept'||hairStyle==='spiky'?17:age===2?15.5:18.4,tp=top+(hairStyle==='spiky'?-1:0)+(age===2?1.5:0),sy=hairStyle==='long'||hairStyle==='wavy'||hairStyle==='braid'?33:24.5;
    capPath(tp,hl,sy);x.fillStyle=lg(x,22,tp,42,hl+4,[hL,hair,hD]);x.fill();x.strokeStyle=OUT;x.lineWidth=1.3;x.stroke();
    x.save();capPath(tp,hl,sy);x.clip();
    for(let i=0;i<9;i++){const t=i/8,sx=32-hr+t*2*hr;strand(sx*.5+16+ (t-.5)*3,hl+1+Math.abs(t-.5)*2,sx+(t-.5)*6,tp+2,sx*.6+13+t*10,tp+3+t*2,i%2?hD:hL,.55,.65)}
    x.fillStyle=lg(x,0,tp,0,hl,['rgba(255,255,255,.28)','rgba(255,255,255,0)']);x.fillRect(16,tp-1,32,6);x.restore();
    if(hairStyle==='spiky'){for(let i=0;i<5;i++)poly(x,[[22+i*5,tp+3],[24+i*5,tp-4-(i%2)*2],[27+i*5,tp+3]],bodyG(x,0,tp-6,0,tp+3,hair),OUT,.9)}
    if(hairStyle==='braid'){for(const s of[-1,1]){for(let k=0;k<6;k++)ell(x,32+s*(hr+3.6+(k%2)*.8),32+k*3.6,2,2.2,k%2?hair:hL,OUT,.8);ell(x,32+s*(hr+4),53.5,1.4,1.4,P0,OUT,.6)}}
  };
  if(!covered)drawHair();
  // ===== tocados =====
  const metal=(col)=>lg(x,20,6,46,22,[shade(col,.55),shade(col,.15),col,shade(col,-.45)]);
  const dome=(col,tp,rim,w=hr+2.2)=>{x.beginPath();x.moveTo(32-w,rim);x.bezierCurveTo(32-w-.8,tp+6,32-w*.55,tp-1,32,tp-1);x.bezierCurveTo(32+w*.55,tp-1,32+w+.8,tp+6,32+w,rim);x.closePath();x.fillStyle=metal(col);x.fill();x.strokeStyle=OUT;x.lineWidth=1.4;x.stroke();
    strand(32-w+2.4,rim-3,32-3,tp+0.4,32-w+2.4,tp+3,'rgba(255,255,255,.75)',1.1);strand(32+w-2,rim-3,32+w-5,tp+3.4,32+w-1.6,tp+6,'rgba(0,0,0,.28)',1.4);
    // banda
    x.fillStyle=lg(x,0,rim-3,0,rim+1,[shade(col,.4),shade(col,-.3)]);x.fillRect(32-w-.4,rim-3,2*w+.8,4);x.strokeStyle=OUT;x.lineWidth=1;x.strokeRect(32-w-.4,rim-3,2*w+.8,4);
    for(const s of[-1,0,1])ell(x,32+s*(w-2.4),rim-1,.7,.7,'#f6e6a0',OUT,.3)};
  const cheeks=(col)=>{for(const s of[-1,1]){x.beginPath();x.moveTo(32+s*(hr+1.4),rim0-1);x.lineTo(32+s*(hr+1.6),33);x.quadraticCurveTo(32+s*(hr+.4),37,32+s*(hr-3),38.5);x.lineTo(32+s*(hr-3.6),32);x.lineTo(32+s*(hr-.8),rim0-1);x.closePath();x.fillStyle=lg(x,32+s*hr,0,32+s*(hr-3),0,[shade(col,.25),shade(col,-.4)]);x.fill();x.strokeStyle=OUT;x.lineWidth=1.1;x.stroke()}};
  const rim0=21.5;
  const horn=(s,col,len,curl,y0=17)=>{x.beginPath();x.moveTo(32+s*(hr-.5),y0+3);x.bezierCurveTo(32+s*(hr+len*.5),y0+2,32+s*(hr+len),y0-4,32+s*(hr+len*.8+curl),y0-len*.9);x.bezierCurveTo(32+s*(hr+len*.5),y0-len*.35,32+s*(hr+2),y0-3,32+s*(hr-3),y0-4.5);x.closePath();x.fillStyle=lg(x,32+s*hr,y0-len,32+s*(hr+len),y0+3,[shade(col,.6),col,shade(col,-.5)]);x.fill();x.strokeStyle=OUT;x.lineWidth=1.2;x.stroke();for(let k=1;k<4;k++)strand(32+s*(hr+k*len*.18),y0-k*len*.12+1.5,32+s*(hr+k*len*.18+.8),y0-k*len*.12-2.5,32+s*(hr+k*len*.18),y0-k*len*.12,'rgba(0,0,0,.25)',.45)};
  const feather=(px,py,len,ang,col)=>{x.save();x.translate(px,py);x.rotate(ang);x.beginPath();x.moveTo(0,0);x.bezierCurveTo(len*.2,-3.4,len*.8,-3,len,0);x.bezierCurveTo(len*.8,2.6,len*.2,3,0,0);x.fillStyle=lg(x,0,-3,0,3,[shade(col,.4),col,shade(col,-.3)]);x.fill();x.strokeStyle=OUT;x.lineWidth=.9;x.stroke();x.strokeStyle='rgba(255,255,255,.55)';x.lineWidth=.4;x.beginPath();x.moveTo(0,0);x.lineTo(len*.94,0);x.stroke();x.restore()};
  if(hum){
    if(!cls){dome('#b8c2d4',9.5,rim0);cheeks('#a8b2c6');poly(x,[[30.8,rim0-2],[33.2,rim0-2],[33,31],[31,31]],lg(x,30,0,34,0,['#e8ecf4','#8a94a8']),OUT,.9);
      x.beginPath();x.moveTo(32-1,9);x.bezierCurveTo(32+10,-4,32+20,0,32+19,12);x.bezierCurveTo(32+14,5,32+7,6,32+2,10);x.closePath();x.fillStyle=lg(x,32,-4,52,12,[shade(P1,.4),P1,shade(P1,-.4)]);x.fill();x.strokeStyle=OUT;x.lineWidth=1.1;x.stroke();for(let k=0;k<4;k++)strand(35+k*3.5,8-k*.4,38+k*3.5,4.2+k*2,37+k*3.5,4,shade(P1,.4),.4,.8);
      ell(x,32,12.4,1.6,1.6,P0,OUT,.6)}
    else{// aureola solar y diadema
      x.strokeStyle=OUT;x.lineWidth=3;x.beginPath();x.ellipse(32,15.4,hr+.8,3.2,0,Math.PI*1.05,Math.PI*1.95);x.stroke();x.strokeStyle=lg(x,18,0,46,0,['#fff3b0','#e8c25a','#a07a20']);x.lineWidth=1.8;x.beginPath();x.ellipse(32,15.4,hr+.8,3.2,0,Math.PI*1.05,Math.PI*1.95);x.stroke();
      poly(x,[[32,10.8],[34,13.2],[32,15.6],[30,13.2]],rg(x,31.5,12.4,.2,3,['#fff','#ff6a5a','#8a1a1a']),OUT,.8)}}
  else if(elf){
    if(!cls){x.strokeStyle=OUT;x.lineWidth=2.6;x.beginPath();x.moveTo(32-hr-.6,18.6);x.quadraticCurveTo(32,13.8,32+hr+.6,18.6);x.stroke();x.strokeStyle=lg(x,0,0,64,0,['#c8e890','#6ab048','#c8e890']);x.lineWidth=1.3;x.stroke();
      for(let i=0;i<5;i++){const t=(i+.5)/5,px=32-hr+t*2*hr,py=18.4-Math.sin(t*Math.PI)*4.2;x.save();x.translate(px,py);x.rotate((t-.5)*1.4-.4);poly(x,[[0,0],[2,-4.4],[4,0],[2,1.4]],i%2?'#8ad060':'#5aa040',OUT,.7);x.restore()}
      ell(x,32,14.4,1.9,2.2,rg(x,31.5,13.6,.2,2.4,['#fff','#a0f0c0','#2a8a5a']),OUT,.7);
      if(idx%2===1){feather(32+hr-1,16,16,-.9,'#e8f0d0')}}
    else{ // diadema con gema y flores / cuernos de druida
      if(idx%2===0){for(const s of[-1,1]){x.strokeStyle=OUT;x.lineWidth=3;x.beginPath();x.moveTo(32+s*5,13);x.quadraticCurveTo(32+s*10,6,32+s*9,-1);x.moveTo(32+s*8,8.4);x.lineTo(32+s*14,4.6);x.moveTo(32+s*9.4,3.6);x.lineTo(32+s*5.4,-.2);x.stroke();x.strokeStyle='#d8c090';x.lineWidth=1.6;x.stroke();x.strokeStyle='rgba(255,255,255,.5)';x.lineWidth=.5;x.stroke()}}
      x.strokeStyle=OUT;x.lineWidth=2.6;x.beginPath();x.moveTo(32-hr-.6,17.6);x.quadraticCurveTo(32,13,32+hr+.6,17.6);x.stroke();x.strokeStyle=lg(x,0,0,64,0,['#e8f4ff','#a8c0d8','#e8f4ff']);x.lineWidth=1.3;x.stroke();
      poly(x,[[32,6.4],[35,12],[32,15.6],[29,12]],rg(x,31.4,10,.3,5,['#fff','#7ae0c0','#1a7a6a']),OUT,.8);
      for(const[fx,fy]of[[22,15],[42,15],[26,12.6],[38,12.6]]){for(let k=0;k<5;k++){const a=k*1.257;ell(x,fx+Math.cos(a)*1.3,fy+Math.sin(a)*1.3,1,1,k%2?'#fff':'#ffd8f0')}ell(x,fx,fy,.8,.8,'#ffe27a')}}}
  else if(pale){
    if(!cls){dome('#3c3448',9,rim0);cheeks('#342c42');for(const s of[-1,1]){x.beginPath();x.moveTo(32+s*(hr-1),13);x.bezierCurveTo(32+s*(hr+5),12,32+s*(hr+10),6,32+s*(hr+7),-4);x.bezierCurveTo(32+s*(hr+6),4,32+s*(hr+1),7,32+s*(hr-4),9);x.closePath();x.fillStyle=lg(x,32+s*hr,-4,32+s*(hr+8),12,['#f4f0dc','#c8c0a0','#6a5a3a']);x.fill();x.strokeStyle=OUT;x.lineWidth=1.1;x.stroke()}
      x.fillStyle='rgba(120,255,170,.85)';x.fillRect(28,rim0-1.6,3,1.3);x.fillRect(33,rim0-1.6,3,1.3);poly(x,[[31,10],[33,10],[32.6,15],[31.4,15]],'#8affb0',OUT,.5);ell(x,32,9.2,1.4,1.4,'#8affb0',OUT,.5)}
    else{x.strokeStyle=OUT;x.lineWidth=2.4;x.beginPath();x.moveTo(32-hr-.2,16.6);x.quadraticCurveTo(32,11,32+hr+.2,16.6);x.stroke();x.strokeStyle='#d8d4bc';x.lineWidth=1.2;x.stroke();ell(x,32,12.3,3.2,3,'#ece8d4',OUT,.9);x.fillStyle='#10180f';x.fillRect(30.5,11,1.2,1.5);x.fillRect(32.4,11,1.2,1.5);x.fillRect(31.7,13.2,.7,1.4);
      for(const s of[-1,1])poly(x,[[32+s*7,15],[32+s*10,10],[32+s*8.6,16]],'#ece8d4',OUT,.7)}}
  else if(dem){
    if(!cls){dome('#6a2a22',10,rim0);cheeks('#5a2420');for(const s of[-1,1])horn(s,'#e8dcb8',9,3,15)}
    else{for(const s of[-1,1])horn(s,'#2a1a1a',9.5,4,18);ell(x,32,15.4,1.8,1.8,rg(x,31.5,14.8,.2,2,['#fff','#ff7a2a','#8a1a1a']),OUT,.6)}}
  else if(dwarf){
    if(!cls){dome('#9a9aa8',9.5,rim0,hr+2.6);cheeks('#8a8a98');poly(x,[[30.4,rim0-2],[33.6,rim0-2],[33.2,30.5],[30.8,30.5]],lg(x,30,0,34,0,['#c8ccd8','#6a6a78']),OUT,.9);
      x.fillStyle=lg(x,0,0,0,10,['#ffd890','#c07a20']);for(const s of[-1,1]){poly(x,[[32+s*7,rim0-3.2],[32+s*13,rim0-8],[32+s*12,rim0-2]],'#e8a040',OUT,.9)}
      poly(x,[[30,3],[34,3],[34,9],[30,9]],'#e8a040',OUT,.8)}
    else{// capucha-casco rúnico con runas luminosas
      dome('#5a5a66',9,rim0,hr+2.6);x.strokeStyle='#ffa030';x.lineWidth=.9;x.lineCap='round';for(let i=0;i<4;i++){const px=22+i*6.7;x.beginPath();x.moveTo(px,12.5+(i%2));x.lineTo(px+1.4,15.5);x.moveTo(px+.4,14);x.lineTo(px+2.6,13.2);x.stroke()}
      x.save();x.globalCompositeOperation='lighter';ell(x,32,14,16,4,'rgba(255,150,40,.14)');x.restore();}}
  else if(pir){
    if(!cls){// tricornio con pluma
      x.beginPath();x.moveTo(32-hr-9,18);x.quadraticCurveTo(32-hr-3,9,32-4,6);x.lineTo(32,4);x.lineTo(32+4,6);x.quadraticCurveTo(32+hr+3,9,32+hr+9,18);x.quadraticCurveTo(32+hr+3,16.4,32,17.8);x.quadraticCurveTo(32-hr-3,16.4,32-hr-9,18);x.closePath();x.fillStyle=lg(x,10,4,54,19,[shade('#2a2018',.5),'#2a2018',shade('#2a2018',-.4)]);x.fill();x.strokeStyle=OUT;x.lineWidth=1.4;x.stroke();
      x.beginPath();x.moveTo(32-hr+.6,17.6);x.bezierCurveTo(32-hr+.4,8,32-5,4,32,4.6);x.bezierCurveTo(32+5,4,32+hr-.4,8,32+hr-.6,17.6);x.quadraticCurveTo(32,15.4,32-hr+.6,17.6);x.fillStyle=lg(x,22,4,42,18,['#4a3a2a','#2a2018','#14100a']);x.fill();x.strokeStyle=OUT;x.lineWidth=1.2;x.stroke();strand(27,15,30,7,26.4,10,'rgba(255,255,255,.35)',.8);
      x.strokeStyle=P0;x.lineWidth=1.1;x.beginPath();x.moveTo(32-hr-8,17.6);x.quadraticCurveTo(32,16.6,32+hr+8,17.6);x.stroke();
      ell(x,32,12.4,2,2,P0,OUT,.6);feather(32+4,7,16,-.7,'#f4f0e0');feather(32+3,8,13,-.2,P1)}
    else{// corona de coral y perlas
      x.strokeStyle=OUT;x.lineWidth=2.6;x.beginPath();x.moveTo(32-hr-.2,17.4);x.quadraticCurveTo(32,13.6,32+hr+.2,17.4);x.stroke();x.strokeStyle='#e8c25a';x.lineWidth=1.2;x.stroke();
      for(let i=0;i<5;i++){const t=(i+.5)/5,px=32-hr+t*2*hr,py=17.2-Math.sin(t*Math.PI)*3.4,hh=3+Math.sin(t*Math.PI)*4;poly(x,[[px-1.4,py],[px-.5,py-hh],[px+.3,py-hh*.55],[px+1,py-hh*.95],[px+1.6,py]],lg(x,0,py-hh,0,py,['#ffb0a0','#e8503a','#9a2a20']),OUT,.7);ell(x,px+.2,py-hh-.6,.9,.9,rg(x,px,py-hh-1,.1,1,['#fff','#e8f0ff','#9ab0d0']),OUT,.3)}}}
  else if(orc){
    if(!cls){x.fillStyle='#4a3a22';x.beginPath();x.moveTo(32-hr-1,19);x.quadraticCurveTo(32,15.4,32+hr+1,19);x.lineTo(32+hr+1,22.4);x.quadraticCurveTo(32,19,32-hr-1,22.4);x.closePath();x.fillStyle=lg(x,0,16,0,22,['#7a5a32','#3a2a14']);x.fill();x.strokeStyle=OUT;x.lineWidth=1.2;x.stroke();
      for(let i=0;i<5;i++)poly(x,[[22+i*5,17.6],[23.8+i*5,7+(i%2)*3],[26.5+i*5,17.8]],i%2?'#f0ecd0':'#7ab038',OUT,.9);x.fillStyle='#d84a2a';x.fillRect(31,16,2,5);feather(40,16,14,-1.1,'#d84a2a')}
    else{ell(x,32,14.4,14,10,lg(x,18,4,46,24,['#f4f0dc','#d8d0b0','#8a8060']),OUT,1.3);for(const s of[-1,1]){ell(x,32+s*6.2,16.5,3.3,3.8,'#10180f');ell(x,32+s*6.2,16.5,1.4,1.4,'rgba(130,255,150,.7)')}poly(x,[[32,19.5],[30.6,23],[33.4,23]],'#10180f',null);for(let k=-2;k<=2;k++){x.strokeStyle='#10180f';x.lineWidth=.7;x.beginPath();x.moveTo(32+k*1.6,22.6);x.lineTo(32+k*1.6,24.4);x.stroke()}
      for(let i=0;i<6;i++)feather(24+i*3.2,6.6,15,-1.7+i*.26-(i>2?.1:0),['#d84a2a','#ffe040','#40b0a0'][i%3])}}
  else{ // bárbaro
    if(!cls){dome('#b8bcc8',9.5,rim0);cheeks('#a0a4b4');x.fillStyle=lg(x,0,0,0,10,['#8a5a2a','#4a2a10']);poly(x,[[32-hr-2.2,rim0-3],[32+hr+2.2,rim0-3],[32+hr+2.2,rim0],[32-hr-2.2,rim0]],'#6a4a2a',OUT,.8);
      for(const s of[-1,1]){x.beginPath();x.moveTo(32+s*(hr+1),rim0-2);x.bezierCurveTo(32+s*(hr+8),rim0-2,32+s*(hr+12),12,32+s*(hr+9),2);x.bezierCurveTo(32+s*(hr+7),10,32+s*(hr+4),12,32+s*(hr-2),11);x.closePath();x.fillStyle=lg(x,32+s*hr,0,32+s*(hr+10),20,['#fffdf0','#e8e0c0','#8a7a50']);x.fill();x.strokeStyle=OUT;x.lineWidth=1.2;x.stroke();for(let k=0;k<3;k++)strand(32+s*(hr+2+k*1.6),rim0-4,32+s*(hr+5+k*1.4),9+k*2,32+s*(hr+6+k*.8),14,'rgba(0,0,0,.22)',.4)}}
    else{// capucha de piel con diadema de estrella
      x.beginPath();x.moveTo(32-hr-3,24);x.bezierCurveTo(32-hr-5,8,32-8,2,32,2.4);x.bezierCurveTo(32+8,2,32+hr+5,8,32+hr+3,24);x.lineTo(32+hr+.5,18);x.bezierCurveTo(32+6,11,32-6,11,32-hr-.5,18);x.closePath();x.fillStyle=lg(x,0,2,0,22,['#f4f4fc','#c8ccdc','#7a8098']);x.fill();x.strokeStyle=OUT;x.lineWidth=1.3;x.stroke();for(let i=0;i<14;i++){const a=Math.PI*(1.04+i*.067);strand(32+Math.cos(a)*(hr+2.6),20+Math.sin(a)*14,32+Math.cos(a)*(hr+4.4),20+Math.sin(a)*15.4,32+Math.cos(a)*(hr+3),20+Math.sin(a)*16,i%2?'#fff':'#8a90a8',.5,.8)}
      const stp=[];for(let k=0;k<10;k++){const rr=k%2?1.5:3.6,a=-1.571+k*.628;stp.push([32+Math.cos(a)*rr,11.6+Math.sin(a)*rr])}poly(x,stp,rg(x,32,11.6,.2,4,['#fff','#ffe27a','#c89a20']),OUT,.7)}}
  x.restore();
  // ===== luz de recorte final y viñeta =====
  x.fillStyle=lg(x,0,0,64,64,['rgba(255,255,255,.14)','rgba(255,255,255,0)','rgba(0,0,24,.34)']);x.fillRect(0,0,64,64);
  x.fillStyle=rg(x,32,30,22,48,['rgba(0,0,0,0)','rgba(0,0,12,.42)']);x.fillRect(0,0,64,64);
  // marco
  x.strokeStyle=lg(x,0,0,64,64,['#fff0a8','#e8c25a','#8a6418','#e8c25a']);x.lineWidth=2.4;x.strokeRect(1.2,1.2,61.6,61.6);x.strokeStyle='#5a3e10';x.lineWidth=.8;x.strokeRect(3,3,58,58);x.strokeStyle='rgba(255,236,170,.45)';x.lineWidth=.5;x.strokeRect(2.2,2.2,59.6,59.6);x.strokeStyle='rgba(0,0,0,.75)';x.lineWidth=1;x.strokeRect(.5,.5,63,63);
  for(const[cx0,cy0]of[[4.2,4.2],[59.8,4.2],[4.2,59.8],[59.8,59.8]]){ell(x,cx0,cy0,1.5,1.5,rg(x,cx0-.4,cy0-.4,.1,1.6,['#fff6c0','#e8c25a','#7a5414']),'#2a1a06',.4)}
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
