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
function portrait(fi,idx,cls,sz=64){
  const key='p'+fi+'_'+idx+'_'+cls+'_'+sz;if(Gfx.cache[key])return Gfx.cache[key];
  const c=mkc(64,64),x=c.ctx,r=mulberry(fi*131+idx*17+cls*5+3),F=FDEF[fi];
  const skins=['#f0c8a0','#e0b088','#c88a60','#a86a44','#f4d4b8','#8a5a3a','#d8e0b0','#b8c8d8'];const skin=(fi===6&&idx%2)?'#9ab868':skins[Math.floor(r()*skins.length)%6];
  x.fillStyle=lg(x,0,0,0,64,[shade(F.col[0],-.1),shade(F.col[1],-.2)]);x.fillRect(0,0,64,64);x.fillStyle=rg(x,32,22,2,40,['rgba(255,255,255,.35)','rgba(255,255,255,0)']);x.fillRect(0,0,64,64);
  poly(x,[[2,64],[8,50],[22,46],[42,46],[56,50],[62,64]],bodyG(x,0,46,0,64,cls?F.col[1]:F.col[0]),OUT,1.4);poly(x,[[22,46],[32,56],[42,46]],shade(F.col[2],0),OUT,1);
  if(cls){x.strokeStyle=F.col[0];x.lineWidth=2;x.beginPath();x.moveTo(8,52);x.lineTo(20,48);x.moveTo(56,52);x.lineTo(44,48);x.stroke()}else{ell(x,12,50,7,5,shade(F.col[0],.2),OUT,1.2);ell(x,52,50,7,5,shade(F.col[0],.2),OUT,1.2)}
  x.fillStyle=skin;x.fillRect(27,38,10,10);
  const hair=['#3a2412','#8a5a2a','#d8b858','#e8e8e8','#222','#a03a1a','#5a3a6a'][Math.floor(r()*7)];
  if(!cls&&idx%2){} ell(x,32,26,14,15,hair,OUT,1.4);ell(x,32,29,11.5,13.5,bodyG(x,20,16,44,44,skin),OUT,1.4);
  eye(x,27,28,2.4,'#fff',['#2a5a8a','#3a7a3a','#5a3a1a','#7a2a2a'][Math.floor(r()*4)]);eye(x,37,28,2.4,'#fff','#2a1a10');x.strokeStyle='rgba(60,30,20,.8)';x.lineWidth=1.3;x.beginPath();x.moveTo(25,24);x.lineTo(30,23);x.moveTo(34,23);x.lineTo(39,24);x.stroke();
  x.beginPath();x.moveTo(29,36);x.quadraticCurveTo(32,38,35,36);x.stroke();
  if(idx%3===0){x.fillStyle=hair;x.beginPath();x.moveTo(24,34);x.quadraticCurveTo(32,48,40,34);x.quadraticCurveTo(32,41,24,34);x.fill();x.stroke()}
  if(cls){poly(x,[[17,22],[32,2],[47,22],[40,19],[24,19]],bodyG(x,17,2,47,22,F.col[1]),OUT,1.4);ell(x,32,20,17,4,shade(F.col[1],-.15),OUT,1.2);ell(x,32,12,2.4,2.4,F.col[2],OUT,.8)}
  else{x.beginPath();x.arc(32,24,15.4,Math.PI*1.02,Math.PI*1.98);x.lineTo(46,26);x.lineTo(18,26);x.closePath();x.fillStyle=bodyG(x,17,8,47,26,'#b8c0d0');x.fill();x.strokeStyle=OUT;x.lineWidth=1.4;x.stroke();poly(x,[[30,8],[34,8],[34,22],[30,22]],F.col[0],OUT,.9);if(idx%2)poly(x,[[32,4],[24,-2],[40,-2]],F.col[0],OUT,1)}
  x.strokeStyle='#e8c25a';x.lineWidth=2.2;x.strokeRect(1,1,62,62);x.strokeStyle='rgba(0,0,0,.6)';x.lineWidth=1;x.strokeRect(.5,.5,63,63);
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
