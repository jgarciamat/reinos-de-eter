'use strict';
// =====================================================================
//  Sitios de mapa al estilo Heroes 3 / 4: edificios de estadísticas,
//  fuentes de suerte/moral, tesoros custodiados, observatorios, etc.
// =====================================================================
const RESKEYS=['wood','ore','mercury','sulfur','crystal','gems'];
const SITE_WEEK=()=>Math.floor((G.day-1)/7);
const lowerOf=(h,a,b)=>h[a]<=h[b]?a:b;
const STATN={a:'Ataque',d:'Defensa',sp:'Poder',kn:'Conocimiento'};
const statUp=(h,k,n)=>{h[k]+=n;return`${h.name} gana +${n} de ${STATN[k]}`};
function rewardArt(h,lo,hi){
  const used=G.map.used||new Set();const pool=ART_WORLD().filter(a=>!used.has(a)&&ART[a].v>=lo&&ART[a].v<=hi&&!ART[a].set);if(!pool.length)return null;
  const id=pool[Math.floor(Math.random()*pool.length)];used.add(id);const r=giveArtifact(h,id);return r?id:null;
}
const randRes=()=>RESKEYS[Math.floor(Math.random()*RESKEYS.length)];
// once: 'hero' (una vez por héroe), 'day' (una vez al día por héroe), 'week' (una vez por semana y jugador), 'player' (una por jugador), 'remove' (desaparece), '' (siempre)
const SITEDEF={
 library:{n:'Biblioteca de la Iluminación',w:2,sh:'hall',c:['#5a3a8a','#cfc4e8'],gl:'book',once:'hero',v:1500,eff(h){const o=skillOffers(h);if(!o.length)return['Ya lo sabes todo'];h.skills[o[0]]=(h.skills[o[0]]||0)+1;return`${h.name} estudia ${SKILLS[o[0]].n}`}},
 tree:{n:'Árbol del Conocimiento',w:2,sh:'tree',c:['#3a8a4a','#6ad07a'],gl:'star',once:'hero',v:2200,eff(h){gainXp(h,xpForLevel(h.lvl+1)-h.xp);return`${h.name} sube de nivel gracias al árbol`}},
 arena:{n:'Arena',w:2,sh:'hall',c:['#a8482a','#e8c890'],gl:'sword',once:'hero',v:1600,eff(h){return statUp(h,lowerOf(h,'a','d'),2)}},
 camp:{n:'Campamento mercenario',w:2,sh:'camp',c:['#9a3a2a','#d8c8a0'],gl:'sword',once:'hero',v:900,eff(h){return statUp(h,'a',1)}},
 bastion:{n:'Torre de Marletto',w:2,sh:'tower',c:['#3a5a9a','#a8b0c8'],gl:'shield',once:'hero',v:900,eff(h){return statUp(h,'d',1)}},
 garden:{n:'Jardín de la Revelación',w:2,sh:'ruin',c:['#3a9a8a','#d8f0e0'],gl:'book',once:'hero',v:900,eff(h){return statUp(h,'kn',1)}},
 star:{n:'Eje de las Estrellas',w:2,sh:'obelisk',c:['#7a4ac8','#b8a0f0'],gl:'star',once:'hero',v:900,eff(h){return statUp(h,'sp',1)}},
 schoolwar:{n:'Escuela de Guerra',w:1.5,sh:'hall',c:['#7a2a2a','#c8b890'],gl:'shield',once:'hero',cost:1000,v:700,eff(h,o,p){if(p.res.gold<1000)return['Necesitas 1000 de oro'];p.res.gold-=1000;return statUp(h,lowerOf(h,'a','d'),1)}},
 schoolmag:{n:'Escuela de Magia',w:1.5,sh:'hall',c:['#2a4a9a','#b8c8f0'],gl:'star',once:'hero',cost:1000,v:700,eff(h,o,p){if(p.res.gold<1000)return['Necesitas 1000 de oro'];p.res.gold-=1000;return statUp(h,lowerOf(h,'sp','kn'),1)}},
 gazebo:{n:'Mirador del Sabio',w:2,sh:'ruin',c:['#c8a24a','#f0e8c8'],gl:'star',once:'hero',v:1100,eff(h){gainXp(h,1000);return`${h.name} gana 1000 de experiencia`}},
 temple:{n:'Templo',w:2.5,sh:'ruin',c:['#e8d8a8','#fff4d0'],gl:'flag',once:'day',v:350,eff(h){h.tmp=h.tmp||{};h.tmp.mor=Math.max(h.tmp.mor||0,1);return'El templo eleva tu moral en el próximo combate'}},
 fountain:{n:'Fuente de la Fortuna',w:2.5,sh:'fount',c:['#4a8ae0','#c8d8e8'],gl:'clover',once:'day',v:350,eff(h){h.tmp=h.tmp||{};const l=1+Math.floor(Math.random()*3);h.tmp.luck=Math.max(h.tmp.luck||0,l);return`La fuente te da +${l} de suerte en el próximo combate`}},
 idol:{n:'Ídolo de la Fortuna',w:2,sh:'statue',c:['#b89a3a','#d8c890'],gl:'clover',once:'day',v:300,eff(h){h.tmp=h.tmp||{};h.tmp.luck=Math.max(h.tmp.luck||0,1);return'El ídolo te concede suerte en el próximo combate'}},
 oasis:{n:'Oasis',w:2,sh:'fount',c:['#3aa86a','#e8d8a0'],gl:'flag',once:'day',v:400,eff(h){h.tmp=h.tmp||{};h.tmp.mor=Math.max(h.tmp.mor||0,1);h.mp+=800;return'El oasis te da moral y 800 de movimiento'}},
 fairy:{n:'Círculo de Hadas',w:1.5,sh:'tree',c:['#a84ac8','#f0b8ff'],gl:'clover',once:'day',v:300,eff(h){h.tmp=h.tmp||{};h.tmp.luck=Math.max(h.tmp.luck||0,2);return'Las hadas te bendicen con +2 de suerte en el próximo combate'}},
 wheel:{n:'Rueda hidráulica',w:2,sh:'wheel',c:['#6a4a2a','#8ab0d0'],gl:'coin',once:'week',v:900,eff(h,o,p){p.res.gold+=1000;return'La rueda produce 1000 de oro'}},
 mystic:{n:'Jardín Místico',w:1.5,sh:'ruin',c:['#c83a6a','#f0c8d8'],gl:'gem',once:'week',v:900,eff(h,o,p){p.res.gems+=5;return'El jardín te regala 5 gemas'}},
 leanto:{n:'Cobertizo abandonado',w:2.5,sh:'camp',c:['#7a5a3a','#b89a6a'],gl:'coin',once:'remove',v:400,eff(h,o,p){const r=randRes(),n=3+Math.floor(Math.random()*4);p.res[r]+=n;return`Encuentras ${n} de ${RESN[r]}`}},
 campfire:{n:'Hoguera con provisiones',w:3,sh:'camp',c:['#c86a2a','#e8c890'],gl:'coin',once:'remove',v:700,eff(h,o,p){const r=randRes(),n=4+Math.floor(Math.random()*3);p.res[r]+=n;p.res.gold+=500;return`Recoges 500 de oro y ${n} de ${RESN[r]}`}},
 wagon:{n:'Carreta abandonada',w:2.5,sh:'wagon',c:['#8a6a3a','#c8b890'],gl:'coin',once:'remove',v:600,eff(h,o,p){if(Math.random()<.4){const a=rewardArt(h,1,2);if(a)return`Entre la carga hay un artefacto: ${ART[a].n}`}p.res.gold+=400;const r=randRes();p.res[r]+=3;return`Salvas 400 de oro y 3 de ${RESN[r]}`}},
 skeleton:{n:'Esqueleto de aventurero',w:2,sh:'bones',c:['#d8d0b8','#8a8470'],gl:'coin',once:'remove',v:800,eff(h,o,p){const a=rewardArt(h,1,3);if(a)return`Su bolsa guardaba: ${ART[a].n}`;p.res.gold+=1000;return'Su bolsa guardaba 1000 de oro'}},
 observatory:{n:'Observatorio',w:2,sh:'dome',c:['#4a5a8a','#a8b8e0'],gl:'star',once:'player',v:500,eff(h,o,p){reveal(p,o.x,o.y,22);return'Desde el observatorio descubres la región'}},
 cartographer:{n:'Cartógrafo',w:1.5,sh:'hall',c:['#8a6a3a','#e8d8a8'],gl:'book',once:'player',v:300,eff(h,o,p){if(p.res.gold<1000)return['Un mapa cuesta 1000 de oro'];p.res.gold-=1000;reveal(p,o.x,o.y,50);return'Compras un mapa de la zona'}},
 lighthouse:{n:'Faro',w:0,sh:'lighthouse',c:['#c84a3a','#f0e8e0'],gl:'flag',once:'',v:800,eff(h,o,p){if(o.owner===p.id)return['El faro ya es tuyo'];o.owner=p.id;return'Capturas el faro: tus barcos navegan más lejos'}},
 university:{n:'Universidad',w:1,sh:'hall',c:['#8a2a5a','#e8d0e0'],gl:'book',once:'hero',v:1000,cost:2000,eff(h,o,p){if(p.res.gold<2000)return['La matrícula cuesta 2000 de oro'];const op=skillOffers(h);if(!op.length)return['No hay nada que enseñarte'];p.res.gold-=2000;h.skills[op[0]]=(h.skills[op[0]]||0)+1;return`${h.name} aprende ${SKILLS[op[0]].n}`}},
 lair:{n:'Guarida del dragón',w:.5,sh:'cave',c:['#7a2a1a','#e8a030'],gl:'skull',once:'remove',guard:1,v:2600,eff(h,o,p){p.res.gold+=6000;gainXp(h,2500);const a=rewardArt(h,3,4);return`¡Tesoro del dragón! 6000 de oro, 2500 de exp.`+(a?` y ${ART[a].n}`:'')}},
 crypt:{n:'Cripta maldita',w:1,sh:'cave',c:['#3a3a4a','#8a8a9a'],gl:'skull',once:'remove',guard:.7,v:1800,eff(h,o,p){p.res.gold+=1500;gainXp(h,2000);const a=rewardArt(h,2,3);return'Saqueas la cripta: 1500 de oro, 2000 de exp.'+(a?` y ${ART[a].n}`:'')}},
 cache:{n:'Almacén del cíclope',w:1,sh:'cache',c:['#6a5a3a','#b8a070'],gl:'coin',once:'remove',guard:.6,v:1700,eff(h,o,p){p.res.gold+=3000;for(let i=0;i<3;i++){const r=randRes();p.res[r]+=6}return'El almacén contiene 3000 de oro y recursos variados'}},
 buoy:{n:'Boya',w:0,sh:'buoy',c:['#e83a2a','#f0f0f0'],gl:'flag',once:'hero',sea:1,v:350,eff(h){if(!h.boat)return['Solo puedes usarla desde un barco'];h.tmp=h.tmp||{};h.tmp.mor=Math.max(h.tmp.mor||0,1);return'La boya eleva tu moral'}},
 mermaids:{n:'Sirenas',w:0,sh:'mermaid',c:['#3aa8c8','#c8f0f0'],gl:'clover',once:'day',sea:1,v:350,eff(h){if(!h.boat)return['Solo puedes usarla desde un barco'];h.tmp=h.tmp||{};h.tmp.luck=Math.max(h.tmp.luck||0,2);return'Las sirenas te dan suerte'}},
 wreck:{n:'Naufragio',w:0,sh:'wreck',c:['#4a3a2a','#8a7a5a'],gl:'coin',once:'remove',sea:1,v:900,eff(h,o,p){p.res.gold+=1500;const a=rewardArt(h,1,2);return'Rescatas 1500 de oro'+(a?` y ${ART[a].n}`:'')}}
};
const SITE_NEW=Object.keys(SITEDEF).filter(k=>!SITEDEF[k].sea&&SITEDEF[k].w>0);
function pickNewSite(r){let tot=0;for(const k of SITE_NEW)tot+=SITEDEF[k].w;let t=r()*tot;for(const k of SITE_NEW){t-=SITEDEF[k].w;if(t<=0)return k}return SITE_NEW[0]}
function visitSite2(h,o,p){
  const d=SITEDEF[o.k];const id=o.id,wk=SITE_WEEK();
  if(d.once==='hero'&&h.visited[id]){notify('Ya has estado aquí','bad');return false}
  if(d.once==='day'&&h.visited['d'+id]===G.day){notify('Hoy ya no puede ayudarte más','bad');return false}
  if(d.once==='week'&&o.used[p.id]===wk){notify('Ya produjo esta semana','bad');return false}
  if(d.once==='player'&&o.used[p.id]){notify('Ya lo has usado','bad');return false}
  const r=d.eff(h,o,p);if(!r)return false;
  if(Array.isArray(r)){notify(r[0],'bad');return false}
  if(d.once==='hero')h.visited[id]=1;else if(d.once==='day')h.visited['d'+id]=G.day;else if(d.once==='week')o.used[p.id]=wk;else if(d.once==='player')o.used[p.id]=1;
  notify(r,'good');if(d.once==='remove')removeObj(o);if(G.hooks.sfx)G.hooks.sfx('level');return true;
}
// valor para la IA
function siteAIValue(h,o,p){
  const d=SITEDEF[o.k];if(!d)return 0;
  if(d.once==='hero'&&h.visited[o.id])return 0;if(d.once==='day'&&h.visited['d'+o.id]===G.day)return 0;
  if(d.once==='week'&&o.used[p.id]===SITE_WEEK())return 0;if(d.once==='player'&&o.used[p.id])return 0;
  if(d.cost&&p.res.gold<d.cost+1500)return 0;if(d.sea&&!h.boat)return 0;
  if(d.once==='day'&&o.k!=='oasis')return d.v*.4;if(o.k==='lighthouse')return o.owner===p.id?0:d.v;
  return d.v;
}
const lighthouses=pid=>G.map.objs.filter(o=>!o.dead&&o.t==='site'&&o.k==='lighthouse'&&o.owner===pid).length;

// ---------------- sprites ----------------
function glyphBadge(x,cx,cy,g,col){
  ell(x,cx,cy,9,9,rg(x,cx-2,cy-2,1,10,['#fff6c0',col,shade(col,-.4)]),OUT,1.4);x.save();x.translate(cx,cy);x.fillStyle='#1a1220';x.strokeStyle='#1a1220';x.lineWidth=1.4;
  switch(g){
    case'sword':x.beginPath();x.moveTo(0,-6);x.lineTo(1.6,3);x.lineTo(-1.6,3);x.fill();x.fillRect(-4,3,8,1.8);break;
    case'shield':x.beginPath();x.moveTo(-5,-5);x.lineTo(5,-5);x.lineTo(5,0);x.lineTo(0,6);x.lineTo(-5,0);x.fill();break;
    case'star':x.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,r=i%2?2.4:6;x.lineTo(Math.cos(a)*r,Math.sin(a)*r)}x.fill();break;
    case'book':x.fillRect(-5,-4,10,8);x.fillStyle=col;x.fillRect(-0.7,-4,1.4,8);break;
    case'coin':x.beginPath();x.arc(0,0,5,0,6.3);x.stroke();x.fillRect(-1,-3,2,6);break;
    case'clover':for(const[a,b]of[[-2.5,0],[2.5,0],[0,-2.5],[0,2.5]]){x.beginPath();x.arc(a,b,2.6,0,6.3);x.fill()}break;
    case'skull':x.beginPath();x.arc(0,-1,5,0,6.3);x.fill();x.fillRect(-3,2,6,4);x.fillStyle=col;x.fillRect(-3,-2,2,2);x.fillRect(1,-2,2,2);break;
    case'gem':x.beginPath();x.moveTo(0,-6);x.lineTo(5,-1);x.lineTo(0,6);x.lineTo(-5,-1);x.fill();break;
    default:x.fillRect(-1,-6,1.6,12);x.beginPath();x.moveTo(0.6,-6);x.lineTo(6,-3);x.lineTo(0.6,0);x.fill();
  }
  x.restore();
}
function siteSprite2(k){
  const key='s2'+k;if(Gfx.cache[key])return Gfx.cache[key];const d=SITEDEF[k],[c1,c2]=d.c;
  const c=mkc(56,84),x=c.ctx,cx=28,by=76;shadowE(x,cx,by+1,22,6,.4);
  const wall=(x0,y0,w,h,col)=>rrect(x,x0,y0,w,h,2,lg(x,x0,y0,x0+w,y0,[shade(col,.3),col,shade(col,-.4)]),OUT,1.3);
  const roof=(x0,x1,y0,ya,col)=>{poly(x,[[x0,y0],[(x0+x1)/2,ya],[x1,y0]],lg(x,x0,ya,x1,y0,[shade(col,.25),col,shade(col,-.4)]),OUT,1.4)};
  switch(d.sh){
    case'tower':wall(cx-11,by-46,22,46,c2);roof(cx-15,cx+15,by-44,by-70,c1);rrect(x,cx-4,by-14,8,14,3,'#1a1018',OUT,1);for(let i=0;i<3;i++)rrect(x,cx-8+i*6,by-38,4,7,1,'#241830');break;
    case'hall':wall(cx-22,by-30,44,30,c2);roof(cx-27,cx+27,by-28,by-56,c1);rrect(x,cx-6,by-18,12,18,4,'#2a1c14',OUT,1);wall(cx-18,by-24,8,9,'#6a8aa8');wall(cx+10,by-24,8,9,'#6a8aa8');break;
    case'ruin':for(let i=0;i<4;i++){const px=cx-21+i*14;wall(px,by-(i%2?34:44),8,(i%2?34:44),c2)}wall(cx-23,by-50,24,7,c2);x.fillStyle=rg(x,cx,by-30,2,22,[c1+'aa',c1+'00']);x.fillRect(0,by-60,56,60);ell(x,cx+4,by-3,24,5,'rgba(60,50,40,.5)');break;
    case'tree':rrect(x,cx-5,by-34,10,34,3,lg(x,cx-5,0,cx+5,0,['#7a5a38','#5a3a20','#3a2410']),OUT,1.2);for(const[a,b,r]of[[-12,-44,13],[12,-46,13],[0,-58,15],[-8,-36,11],[9,-34,11]])ell(x,cx+a,by+b,r,r*.9,rg(x,cx+a-3,by+b-4,1,r,[c2,c1,shade(c1,-.45)]),OUT,1.2);x.fillStyle=rg(x,cx,by-44,2,28,[c2+'88',c2+'00']);x.fillRect(0,0,56,84);break;
    case'fount':ell(x,cx,by-6,22,8,'#8a8a96',OUT,1.4);ell(x,cx,by-8,18,6,c1);ell(x,cx,by-9,12,3.5,'rgba(255,255,255,.35)');wall(cx-3,by-30,6,24,'#a8a8b4');ell(x,cx,by-33,7,3,'#c8d8f0',OUT,1);x.strokeStyle='rgba(200,230,255,.85)';x.lineWidth=1.6;for(const a of[-1,0,1]){x.beginPath();x.moveTo(cx,by-33);x.quadraticCurveTo(cx+a*8,by-48,cx+a*14,by-14);x.stroke()}break;
    case'statue':wall(cx-12,by-12,24,12,'#8a8a96');wall(cx-7,by-30,14,18,c2);ell(x,cx,by-40,7,8,lg(x,cx-7,by-48,cx+7,by-32,[shade(c1,.4),c1,shade(c1,-.4)]),OUT,1.2);poly(x,[[cx-9,by-34],[cx-17,by-26],[cx-8,by-26]],c1,OUT,1);poly(x,[[cx+9,by-34],[cx+17,by-26],[cx+8,by-26]],c1,OUT,1);break;
    case'camp':poly(x,[[cx-24,by],[cx-2,by-40],[cx+16,by]],lg(x,cx-24,by-40,cx+16,by,[shade(c1,.25),c1,shade(c1,-.4)]),OUT,1.4);poly(x,[[cx-8,by],[cx-2,by-22],[cx+4,by]],'#1c1210',OUT,1);ell(x,cx+22,by-4,6,2.5,'#2a1c14');poly(x,[[cx+19,by-5],[cx+22,by-17],[cx+25,by-5]],'#ffb030');poly(x,[[cx+20.5,by-5],[cx+22,by-12],[cx+23.5,by-5]],'#fff0a0');x.fillStyle=rg(x,cx+22,by-8,1,16,['rgba(255,170,60,.5)','rgba(255,170,60,0)']);x.fillRect(cx+4,by-24,36,32);break;
    case'obelisk':poly(x,[[cx-9,by],[cx-6,by-52],[cx,by-64],[cx+6,by-52],[cx+9,by]],lg(x,cx-9,0,cx+9,0,[shade(c2,.2),c1,shade(c1,-.5)]),OUT,1.4);ell(x,cx,by-34,9,16,rg(x,cx,by-34,1,16,[c2+'cc',c1+'55',c1+'00']));break;
    case'wheel':wall(cx-18,by-24,26,24,'#9a8a6a');roof(cx-21,cx+11,by-22,by-40,c1);x.save();x.translate(cx+14,by-20);ell(x,0,0,18,18,null,OUT,2.6);ell(x,0,0,14,14,null,c1,3);for(let i=0;i<6;i++){x.rotate(Math.PI/3);x.fillStyle=c1;x.fillRect(-1.2,-15,2.4,30)}ell(x,0,0,3,3,'#3a2410',OUT,1);x.restore();ell(x,cx+16,by-2,14,4,c2);break;
    case'wagon':rrect(x,cx-20,by-24,40,16,3,lg(x,cx-20,by-24,cx+20,by-8,[shade(c1,.3),c1,shade(c1,-.4)]),OUT,1.4);for(let i=0;i<4;i++)rrect(x,cx-17+i*9,by-28,7,6,2,c2,OUT,1);for(const dx of[-12,12]){ell(x,cx+dx,by-8,8,8,null,OUT,3);ell(x,cx+dx,by-8,8,8,null,'#8a6a3a',1.8);ell(x,cx+dx,by-8,1.8,1.8,'#2a1a10')}break;
    case'bones':ell(x,cx,by-4,18,5,'rgba(60,50,40,.45)');ell(x,cx-6,by-10,7,6,lg(x,cx-6,by-16,cx-6,by-4,[c1,c2]),OUT,1.2);rrect(x,cx-9,by-6,6,4,1,c1,OUT,1);x.strokeStyle=c1;x.lineWidth=3;x.lineCap='round';x.beginPath();x.moveTo(cx+2,by-8);x.lineTo(cx+18,by-12);x.moveTo(cx,by-4);x.lineTo(cx+16,by-3);x.stroke();x.strokeStyle=OUT;x.lineWidth=.8;x.stroke();poly(x,[[cx+10,by],[cx+10,by-14],[cx+14,by-16],[cx+14,by]],'#6a5a3a',OUT,1);break;
    case'dome':wall(cx-14,by-24,28,24,c2);x.beginPath();x.arc(cx,by-24,16,Math.PI,0);x.closePath();x.fillStyle=lg(x,cx-16,by-40,cx+16,by-24,[shade(c1,.4),c1,shade(c1,-.4)]);x.fill();x.strokeStyle=OUT;x.lineWidth=1.4;x.stroke();x.strokeStyle='#c8d8f0';x.lineWidth=2.4;x.beginPath();x.moveTo(cx+4,by-36);x.lineTo(cx+20,by-52);x.stroke();rrect(x,cx-4,by-14,8,14,3,'#1a1018',OUT,1);break;
    case'lighthouse':poly(x,[[cx-11,by],[cx-7,by-52],[cx+7,by-52],[cx+11,by]],lg(x,cx-11,0,cx+11,0,['#f4eee6','#d8d0c4','#9a9488']),OUT,1.4);poly(x,[[cx-9,by-14],[cx-8,by-24],[cx+8,by-24],[cx+9,by-14]],c1);poly(x,[[cx-8,by-34],[cx-7,by-44],[cx+7,by-44],[cx+8,by-34]],c1);rrect(x,cx-8,by-62,16,10,2,'#ffe28a',OUT,1.2);poly(x,[[cx-10,by-62],[cx,by-72],[cx+10,by-62]],c1,OUT,1.3);x.fillStyle=rg(x,cx,by-57,1,30,['rgba(255,230,140,.6)','rgba(255,230,140,0)']);x.fillRect(0,by-90,56,70);break;
    case'cave':poly(x,[[cx-26,by],[cx-22,by-24],[cx-8,by-42],[cx+8,by-44],[cx+22,by-26],[cx+26,by]],lg(x,cx-26,by-44,cx+26,by,['#7a7684','#4a4654','#2a2634']),OUT,1.6);ell(x,cx,by-10,12,16,'#0a0610',OUT,1.4);x.fillStyle=rg(x,cx,by-10,1,14,[c2+'cc',c1+'88',c1+'00']);x.fillRect(cx-14,by-28,28,28);for(const dx of[-14,14]){ell(x,cx+dx,by-4,3,4,'#e8e0d0',OUT,1)}break;
    case'cache':for(const[dx,dy]of[[-12,0],[2,0],[-5,-12],[14,-3]]){rrect(x,cx+dx-7,by+dy-14,14,14,2,lg(x,cx+dx-7,0,cx+dx+7,0,[shade(c1,.3),c1,shade(c1,-.4)]),OUT,1.2);x.strokeStyle=c2;x.lineWidth=1.4;x.strokeRect(cx+dx-7,by+dy-9,14,3)}ell(x,cx,by-30,5,5,'#ffd24a',OUT,1);break;
    case'buoy':ell(x,cx,by-4,16,5,'rgba(255,255,255,.25)');poly(x,[[cx-8,by-8],[cx-5,by-26],[cx+5,by-26],[cx+8,by-8]],lg(x,cx-8,0,cx+8,0,[c1,shade(c1,-.4)]),OUT,1.3);rrect(x,cx-6,by-18,12,5,1,c2);x.strokeStyle=OUT;x.lineWidth=1.6;x.beginPath();x.moveTo(cx,by-26);x.lineTo(cx,by-38);x.stroke();ell(x,cx,by-40,3,3,'#ffd24a',OUT,1);break;
    case'mermaid':poly(x,[[cx-18,by],[cx-12,by-18],[cx+4,by-22],[cx+16,by-10],[cx+20,by]],lg(x,cx-18,by-22,cx+20,by,['#7a8090','#4a5060','#2a3040']),OUT,1.4);ell(x,cx-2,by-30,5,5,'#f0d0b8',OUT,1);poly(x,[[cx-7,by-30],[cx-12,by-18],[cx-3,by-24]],'#c84a8a',OUT,1);poly(x,[[cx-3,by-24],[cx+3,by-22],[cx+1,by-14],[cx-6,by-18]],c1,OUT,1);poly(x,[[cx+1,by-14],[cx+10,by-8],[cx+4,by-6]],c1,OUT,1);break;
    case'wreck':x.save();x.translate(cx,by-6);x.rotate(-.18);poly(x,[[-24,-4],[24,-10],[18,8],[-18,10]],lg(x,-24,-10,24,10,['#6a4a2a','#4a3220','#2a1a10']),OUT,1.5);x.fillStyle='#2a1a10';x.fillRect(-1,-40,3,34);poly(x,[[2,-38],[16,-30],[2,-22]],'#8a8470',OUT,1);x.restore();break;
  }
  if(d.gl)glyphBadge(x,cx+19,by-60<6?12:12,d.gl,c1);
  return Gfx.cache[key]=c;
}
