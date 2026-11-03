'use strict';
// =====================================================================
//  Interfaz de combate: hexágonos, animaciones, hechizos, efectos
// =====================================================================
const HS=30,HW=Math.sqrt(3)*HS,HOX=(VW-(BW*HW+HW/2))/2,HOY=108;
const hexPx=(x,y)=>[HOX+HW*(x+.5*(y&1))+HW/2,HOY+HS+y*1.5*HS];
const BU={b:null,q:[],ev:null,t:0,fxs:[],log:[],mode:null,spell:null,auto:false,wait:0,hover:null,done:null,intro:0,shake:0,flash:null,resultShown:false,bg:null};
G.hooks.battle=(b,done)=>{later(()=>startBattleUI(b,done))};
function startBattleUI(b,done){
  BU.b=b;BU.q=[];BU.ev=null;BU.fxs=[];BU.log=[];BU.mode=null;BU.spell=null;BU.auto=false;BU.wait=.6;BU.done=done;BU.intro=0;BU.resultShown=false;BU.over=false;BU.shake=0;BU.flash=null;
  for(const s of b.st){const[px,py]=hexPx(s.x,s.y);s.hx=s.x;s.hy=s.y;s.apx=null;s.dn=s.n;s.dead_=false;s.alpha=1;s.fl=0;s.lx=0;s.ly=0;s.ph=Math.random()*6}
  BU.bg=makeBattleBg(b);S.prevScr=S.scr;S.scr='battle';BU.pull();fadeIn(2.5);sfx('battle');
  BU.log.push(`¡Comienza el combate! (${b.sides[0].name} contra ${b.sides[1].name})`);
}
BU.pull=function(){for(const e of this.b.ev)this.q.push(e);this.b.ev.length=0};
function makeBattleBg(b){
  const terr=b.info.terr==null?GRASS:b.info.terr,c=mkc(VW,VH,1),x=c.ctx,r=mulberry(b.info.seed||(Math.random()*1e9|0));
  x.fillStyle=TBASE[terr===WATER?GRASS:terr];x.fillRect(0,0,VW,VH);
  const tiles=Gfx.tiles[terr===WATER?GRASS:terr];for(let j=0;j<Math.ceil(VH/TILE)+1;j++)for(let i=0;i<Math.ceil(VW/TILE)+1;i++)x.drawImage(tiles[Math.floor(r()*tiles.length)],i*TILE,j*TILE,TILE,TILE);
  // cielo/horizonte
  const sky=[['#9ac8ff','#d8ecff'],['#9ac8ff','#d8ecff'],['#b09a80','#e0d0b0'],['#e8d8a0','#f8f0c8'],['#c8d8e8','#f0f6fc'],['#6a8a60','#a0b088'],['#6a5a50','#c88a60'],['#403030','#ff7a30']][terr===SNOW?4:terr===SAND?3:terr===SWAMP?5:terr===ASH?7:terr===DIRT?2:terr===ROUGH?2:0];
  x.fillStyle=lg(x,0,0,0,110,[sky[0],sky[1]]);x.fillRect(0,0,VW,96);
  for(let i=0;i<10;i++){const px=i*150-40+r()*60;poly(x,[[px,96],[px+60,34+r()*30],[px+140,96]],`rgba(${60+terr*8},${70+terr*5},${90},.55)`,null)}
  x.fillStyle=lg(x,0,86,0,112,['rgba(0,0,0,.55)','rgba(0,0,0,0)']);x.fillRect(0,86,VW,28);
  // suelo en perspectiva ligera con viñeta
  x.fillStyle=rg(x,VW/2,VH*.55,200,VW*.7,['rgba(0,0,0,0)','rgba(0,0,0,.55)']);x.fillRect(0,0,VW,VH);
  // decoración perimetral
  for(let i=0;i<20;i++){const px=r()*VW,py=r()<.5?100+r()*20:640+r()*60;if(px>200&&px<1080&&py>100&&py<640)continue;const d=decorSprite(terr===WATER?GRASS:terr,1+Math.floor(r()*3),Math.floor(r()*5));x.drawImage(d,px-32,py-76,64,84)}
  return c;
}
function hexPoly(c,cx,cy,s=HS){c.beginPath();for(let i=0;i<6;i++){const a=Math.PI/180*(60*i-30);const px=cx+s*Math.cos(a),py=cy+s*Math.sin(a);i?c.lineTo(px,py):c.moveTo(px,py)}c.closePath()}
function hexAtMouse(){let best=null,bd=1e9;for(let y=0;y<BH;y++)for(let x=0;x<BW;x++){const[px,py]=hexPx(x,y);const d=(px-UI.mx)**2+(py-UI.my)**2;if(d<bd){bd=d;best=[x,y]}}return bd<HS*HS*.95?best:null}
const humanSide=side=>BU.b.sides[side].human&&!BU.auto;
function bLog(t){BU.log.push(t);if(BU.log.length>7)BU.log.shift()}
// ---------- bucle de combate ----------
function battleUpdate(dt){
  const b=BU.b;BU.t+=dt;BU.intro=Math.min(1,BU.intro+dt*1.6);BU.shake=Math.max(0,BU.shake-dt);
  for(const s of b.st){s.fl=Math.max(0,s.fl-dt*3)}
  BU.fxs=BU.fxs.filter(f=>{f.t+=dt;return f.t<f.life});
  // animación actual
  if(BU.ev){const e=BU.ev;e.t+=dt;if(e.t>=e.dur){e.fin&&e.fin();BU.ev=null}else{e.upd&&e.upd(e.t/e.dur)}}
  if(!BU.ev&&BU.q.length){nextBattleEvent();return}
  if(BU.ev||BU.q.length)return;
  // sin animaciones pendientes
  if(b.over){if(!BU.resultShown)showBattleResult();return}
  BU.wait-=dt;if(BU.wait>0)return;
  const cur=b.cur();if(!cur)return;
  if(!humanSide(cur.side)){BU.wait=BU.auto?.12:.38;b.aiAct();BU.pull()}
}
function nextBattleEvent(){
  const e=BU.q.shift();const b=BU.b;
  switch(e.t){
    case'move':{const s=e.s;const pts=[[e.from[0],e.from[1]],...e.path.map(p=>[p[0],p[1]])];if(e.path.length===0)pts.push(e.to);const n=Math.max(1,pts.length-1);const flyDur=e.path.length<=1?.35:0;
      const dur=Math.max(.15,n*.085)+flyDur*0;const from=hexPx(...e.from),fly=s.cr.fly;if(e.to[0]!==e.from[0])s.face=e.to[0]>e.from[0]?1:-1;
      BU.ev={t:0,dur,upd:k=>{const f=k*n,i=Math.min(n-1,Math.floor(f)),u=f-i;const a=hexPx(...pts[i]),c=hexPx(...pts[i+1]);let px=a[0]+(c[0]-a[0])*u,py=a[1]+(c[1]-a[1])*u;
        if(fly)py-=Math.sin(k*Math.PI)*18;else py-=Math.abs(Math.sin(f*Math.PI))*5;s.apx=px;s.apy=py;if(Math.random()<.4)FX.add({x:px,y:py+14,vx:(Math.random()-.5)*20,vy:-10,col:'rgba(170,150,120,.6)',size:3,life:.4,shrink:true})},
        fin:()=>{s.apx=null;s.hx=e.to[0];s.hy=e.to[1]}};sfx('step');break}
    case'hit':{const d=e.d,a=e.a;
      const apply=()=>{d.dn=e.na;d.fl=1;const[px,py]=hexPx(d.hx,d.hy);BU.shake=Math.min(.25,BU.shake+.06);
        FX.burst(px,py,10,e.spell?['#ffe8a0','#fff']:['#fff','#ffb090','#ff6a4a'],{spd:150,life:.5,g:260,size:2.6});
        if(e.dmg>0)FX.add({x:px,y:py-34,vy:-46,text:'-'+e.dmg,col:e.lucky?'#ffe27a':'#ff8a7a',size:e.lucky?24:19,life:1.1,drag:.97});
        if(e.kills>0)FX.add({x:px,y:py-12,vy:-30,text:`☠ ${e.kills}`,col:'#fff',size:15,life:1.2,drag:.97});
        if(e.dead){d.dying=1}
        bLog(`${a?CR[a.id].name+' → ':''}${CR[d.id].name}: ${e.dmg} de daño${e.kills?`, caen ${e.kills}`:''}${e.lucky?' (¡suerte!)':''}`);sfx(e.kills?'kill':'hit')};
      if(!a||e.spell){BU.ev={t:0,dur:.28,fin:apply};break}
      const[ax,ay]=hexPx(a.hx,a.hy),[dx,dy]=hexPx(d.hx,d.hy);
      if(e.ranged){BU.ev={t:0,dur:.34,upd:k=>{a.lx=0;const px=ax+(dx-ax)*k,py=ay+(dy-ay)*k-Math.sin(k*3.14)*26-14;FX.add({x:px,y:py,col:'#fff2b0',size:2.4,life:.18,add:true,shrink:true});BU.proj={x:px,y:py,ang:Math.atan2(dy-ay,dx-ax)}},fin:()=>{BU.proj=null;apply()}};sfx('shoot')}
      else{const L=Math.hypot(dx-ax,dy-ay)||1;BU.ev={t:0,dur:.3,upd:k=>{const u=k<.4?k/.4:1-(k-.4)/.6;a.lx=(dx-ax)/L*26*u;a.ly=(dy-ay)/L*26*u},fin:()=>{a.lx=0;a.ly=0;apply()}};}
      break}
    case'spell':{const[tx,ty]=e.target?hexPx(e.target.hx,e.target.hy):hexPx(e.x,e.y);const S2=SPELLS[e.sp];sfx('spell');bLog(`${BU.b.sides[e.side].name} lanza ${S2.n}`);
      const dur=spellFx(e.sp,tx,ty,e.side);BU.ev={t:0,dur};break}
    case'text':{const s=e.s;const[px,py]=hexPx(s.hx,s.hy);FX.add({x:px,y:py-48,vy:-22,text:e.txt,col:'#bfe8ff',size:14,life:1.3,drag:.98});break}
    case'morale':{const s=e.s;const[px,py]=hexPx(s.hx,s.hy);FX.burst(px,py-10,14,e.bad?['#8a6aff','#334']:['#ffe27a','#fff'],{spd:80,life:.8,add:1,up:30});break}
    case'round':bLog(`— Ronda ${e.n} —`);break;
    case'sync':for(const s of BU.b.st){s.dn=s.n}break;
    case'end':break;
  }
}
function spellFx(sp,tx,ty,side){
  const fromX=side===0?HOX+30:HOX+BW*HW-30,fromY=HOY+200,add=(col,n,o)=>FX.burst(tx,ty,n,col,Object.assign({add:1},o));
  const S2=SPELLS[sp];
  switch(sp){
    case'chispa':BU.fxs.push({t:0,life:.4,draw:t=>{const k=t/.4;ctx.strokeStyle='#bfe8ff';ctx.lineWidth=4;ctx.shadowColor='#7ac0ff';ctx.shadowBlur=18;ctx.beginPath();ctx.moveTo(fromX,fromY);ctx.lineTo(fromX+(tx-fromX)*k,fromY+(ty-fromY)*k);ctx.stroke();ctx.shadowBlur=0}});add(['#bfe8ff','#fff'],22,{spd:140,life:.6});return .42;
    case'rayo':case'cadena':BU.fxs.push({t:0,life:.5,draw:t=>{ctx.save();ctx.globalAlpha=1-t/.5;ctx.strokeStyle='#fff6a0';ctx.lineWidth=3.5;ctx.shadowColor='#fff27a';ctx.shadowBlur=22;ctx.beginPath();let x=tx+Math.sin(t*40)*6,y=0;ctx.moveTo(x,y);while(y<ty){y+=26;x=tx+(Math.random()-.5)*34;ctx.lineTo(x,y)}ctx.lineTo(tx,ty);ctx.stroke();ctx.restore()}});BU.flash={t:0,col:'255,250,200',a:.4};add(['#fff6a0','#fff'],26,{spd:200,life:.6});BU.shake=.3;return .5;
    case'bola':BU.fxs.push({t:0,life:.6,draw:t=>{if(t<.3){const k=t/.3,px=fromX+(tx-fromX)*k,py=fromY+(ty-fromY)*k-Math.sin(k*3.14)*40;ctx.fillStyle=rg(ctx,px,py,1,20,['#fff','#ffb040','rgba(255,60,0,0)']);ctx.fillRect(px-22,py-22,44,44)}else{const k=(t-.3)/.3;ctx.globalCompositeOperation='lighter';ctx.fillStyle=rg(ctx,tx,ty,2,40+k*70,[`rgba(255,220,120,${1-k})`,`rgba(255,90,20,${.8*(1-k)})`,'rgba(255,40,0,0)']);ctx.fillRect(tx-120,ty-120,240,240);ctx.globalCompositeOperation='source-over'}}});
      setTimeout(()=>{add(['#ffb040','#ff6a20','#ffe090'],40,{spd:220,life:.8,g:120,size:3.4});BU.shake=.35},300);return .65;
    case'implosion':BU.fxs.push({t:0,life:.8,draw:t=>{const k=t/.8;ctx.globalCompositeOperation='lighter';ctx.fillStyle=rg(ctx,tx,ty,2,80*(1-k)+8,[`rgba(200,120,255,${.9*k+.1})`,'rgba(80,20,140,0)']);ctx.fillRect(tx-90,ty-90,180,180);ctx.globalCompositeOperation='source-over'}});for(let i=0;i<30;i++){const a=Math.random()*6.28;FX.add({x:tx+Math.cos(a)*90,y:ty+Math.sin(a)*90,vx:-Math.cos(a)*120,vy:-Math.sin(a)*120,col:'#c880ff',size:3,life:.7,add:true,shrink:true})}BU.shake=.4;return .8;
    case'armagedon':BU.flash={t:0,col:'255,80,20',a:.5};BU.shake=.9;for(let i=0;i<90;i++)FX.add({x:HOX+Math.random()*BW*HW,y:-10-Math.random()*200,vy:300+Math.random()*200,vx:-40,col:['#ff8a30','#ffd060','#ff4010'][i%3],size:3+Math.random()*3,life:1.4,add:true,g:200});return 1.1;
    case'curar':case'resucitar':add(['#9aff9a','#fff','#c8ffd0'],28,{spd:70,life:1,up:60,g:-30});return .55;
    case'bendicion':add(['#ffe27a','#fff'],26,{spd:60,life:1,up:55,g:-20});return .5;
    case'prisa':add(['#9ae0ff','#fff'],26,{spd:90,life:.9,up:30});return .5;
    case'pielpiedra':add(['#b8a080','#e8d8b0'],26,{spd:60,life:1,up:20});return .5;
    case'escudo':add(['#c8d8ff','#fff'],24,{spd:60,life:1,up:20});return .5;
    case'maldicion':add(['#8a4a9a','#d8a0e8'],28,{spd:80,life:1,up:-30,g:40});return .5;
    case'lentitud':add(['#6a8ac8','#c8d8ff'],26,{spd:60,life:1.1,up:-20,g:30});return .5;
  }
  add(['#fff'],20,{});return .4;
}
// ---------- dibujo ----------
function battleDraw(dt){
  const b=BU.b,c=ctx;
  c.save();if(BU.shake>0)c.translate((Math.random()-.5)*BU.shake*14,(Math.random()-.5)*BU.shake*14);
  c.drawImage(BU.bg,0,0,VW,VH);
  // hexágonos
  const cur=b.cur();let R=null;const hum=!b.over&&cur&&humanSide(cur.side)&&!BU.ev&&!BU.q.length;
  if(hum)R=b.reach(cur);
  const hov=!UI.modals.length?hexAtMouse():null;BU.hover=hov;
  for(let y=0;y<BH;y++)for(let x=0;x<BW;x++){const[px,py]=hexPx(x,y);hexPoly(c,px,py,HS-1);
    const k=hk(x,y);const obst=b.obst.has(k);
    c.fillStyle=obst?'rgba(0,0,0,.28)':'rgba(255,255,255,.035)';c.fill();c.strokeStyle='rgba(0,0,0,.22)';c.lineWidth=1;c.stroke();
    if(R&&R.dist.has(k)&&!obst&&(!b.at(x,y)||b.at(x,y)===cur)){hexPoly(c,px,py,HS-3);c.fillStyle='rgba(255,255,255,.14)';c.fill()}}
  // obstáculos
  const terr=b.info.terr==null?GRASS:b.info.terr;
  for(const k of b.obst){const x=k%BW,y=(k/BW)|0;const[px,py]=hexPx(x,y);const d=decorSprite(terr===WATER?GRASS:terr,1+(k%3),k%5);c.drawImage(d,px-34,py-76,68,88)}
  // objetivo bajo el cursor
  let hint=null,tip=null;
  if(hum&&hov){const t=b.at(hov[0],hov[1]);
    if(BU.mode==='spell'){const S2=SPELLS[BU.spell];const okT=t&&((['dmg','area','chain','debuff'].includes(S2.k)&&t.side!==cur.side)||(['buff','heal','res'].includes(S2.k)&&t.side===cur.side)||(S2.k==='area'&&t));hint={x:hov[0],y:hov[1],ok:!!okT,kind:'spell'};tip=okT?`${S2.n} sobre ${CR[t.id].name}`:'Objetivo no válido'}
    else if(t&&t.side!==cur.side){let can=false,how='melee';
      if(b.canShoot(cur)){can=true;how='shoot';const e=b.expected(cur,t,true);tip=[`Disparar a ${CR[t.id].name}`,`≈ ${e.dmg} de daño · caen ≈ ${e.kills}`]}
      else{const hx=b.attackHexes(cur,t,R);if(hx.length){can=true;const e=b.expected(cur,t,false);const ret=t.ret&&!cur.cr.noret&&e.kills<t.n?b.expected(t,cur,false):null;tip=[`Atacar a ${CR[t.id].name}`,`≈ ${e.dmg} de daño · caen ≈ ${e.kills}`,ret?`Represalia ≈ ${ret.kills} bajas`:'Sin represalia'];BU.approach=hx}}
      hint={x:hov[0],y:hov[1],ok:can,kind:can?(how==='shoot'?'shoot':'atk'):'no'};if(!can)tip='No se puede alcanzar'}
    else if(!t&&R&&R.dist.has(hk(hov[0],hov[1]))&&!b.obst.has(hk(hov[0],hov[1]))){hint={x:hov[0],y:hov[1],ok:true,kind:'move'};tip=null}}
  if(hint){const[px,py]=hexPx(hint.x,hint.y);hexPoly(c,px,py,HS-2);c.fillStyle=hint.ok?(hint.kind==='atk'||hint.kind==='shoot'?'rgba(255,80,60,.35)':hint.kind==='spell'?'rgba(120,180,255,.4)':'rgba(120,255,140,.28)'):'rgba(120,120,120,.3)';c.fill();c.strokeStyle=hint.ok?'#fff':'#999';c.lineWidth=2;c.stroke();UI.cursor=hint.ok?(hint.kind==='move'?'pointer':'crosshair'):'not-allowed';if(tip)UI.tt=tip}
  // marca de la unidad activa
  if(cur&&!b.over){const s=cur;const[px,py]=s.apx!=null?[s.apx,s.apy]:hexPx(s.hx,s.hy);c.save();c.translate(px,py+12);c.scale(1,.42);c.strokeStyle=`rgba(255,235,120,${.6+.3*Math.sin(BU.t*7)})`;c.lineWidth=5;c.beginPath();c.arc(0,0,27,0,6.28);c.stroke();c.restore()}
  // unidades ordenadas por y
  const L=b.st.filter(s=>!(s.dead_)).sort((a,b2)=>(a.apy!=null?a.apy:hexPx(a.hx,a.hy)[1])-(b2.apy!=null?b2.apy:hexPx(b2.hx,b2.hy)[1]));
  for(const s of L){
    let[px,py]=s.apx!=null?[s.apx,s.apy]:hexPx(s.hx,s.hy);
    // entrada deslizante
    const sl=(1-easeOut(BU.intro));px+=(s.side===0?-1:1)*sl*220;
    if(s.dying){s.alpha-=dt*1.8;if(s.alpha<=0){s.dead_=true;continue}}
    const cr=s.cr,k=(cr.big?1.22:1)*(cr.tier>=6?1.08:1)*1.0;const sz=92*k*1.22;const face=s.face||(s.side===0?1:-1);const bob=Math.sin(BU.t*2.4+s.ph)*1.3;const act=cur===s&&!b.over;
    shadowE(c,px+s.lx,py+16,22*k,7*k,.5*s.alpha);
    c.save();c.globalAlpha=s.alpha;c.translate(px+s.lx,py+18+s.ly+bob);
    if(s.dying)c.rotate(.5*(1-s.alpha)*face);
    c.drawImage(creatureSprite(s.id,face===-1),-sz/2,-sz+4+sz*.06,sz,sz);
    if(s.fl>0){c.globalCompositeOperation='lighter';c.globalAlpha=s.fl*.7;c.drawImage(creatureSprite(s.id,face===-1),-sz/2,-sz+4,sz,sz);c.globalCompositeOperation='source-over'}
    if(act){c.globalCompositeOperation='lighter';c.globalAlpha=.12+.08*Math.sin(BU.t*7);c.drawImage(creatureSprite(s.id,face===-1),-sz/2,-sz+4,sz,sz);c.globalCompositeOperation='source-over'}
    c.restore();
    // buffs
    let bi=0;for(const bk in s.buff){const col={bless:'#ffe27a',curse:'#a050c0',haste:'#7ad8ff',slow:'#6a80c0',stone:'#b09a78',shield:'#c8d8ff'}[bk]||'#fff';c.fillStyle=col;c.beginPath();c.arc(px-18+bi*9,py+28,3.2,0,6.28);c.fill();c.strokeStyle='#000';c.lineWidth=1;c.stroke();bi++}
    // plaquita de cantidad
    if(!s.dying){const p=G.players[BU.b.sides[s.side].pid];const col=p?p.col:'#a0a0a0';const t=String(s.dn);const tw=measure(t,13,true)+12;const bx=px+(s.side===0?-6:6)-tw/2+s.lx,by2=py+22+s.ly;
      c.save();c.globalAlpha=s.alpha;rrect(c,bx,by2,tw,17,6,lg(c,0,by2,0,by2+17,['rgba(20,14,26,.9)','rgba(8,4,12,.92)']),col,1.8);text(t,bx+tw/2,by2+13,{size:13,bold:true,align:'center',shadow:false,color:'#fff'});c.restore()}
    if(hovered(px-30,py-60,60,90)&&!UI.modals.length&&!UI.nohit){hit(px-30,py-60,60,90,null,{right:()=>creatureInfo(s.id,0),tip:[CR[s.id].name+` ×${s.n}`,`Ataque ${cr.atk+b.hs(s.side).a} · Defensa ${cr.def+b.hs(s.side).d}`,`Daño ${cr.mn}-${cr.mx} · Vida ${cr.hp} (${s.top} en la primera)`,`Velocidad ${b.spd(s)}${cr.shoot?` · Disparos ${s.shots}`:''}`,abilText(cr)]})}
  }
  if(BU.proj){const p=BU.proj;c.save();c.translate(p.x,p.y);c.rotate(p.ang);c.fillStyle='#e8e8f0';c.fillRect(-12,-1,16,2);poly(c,[[4,-3],[10,0],[4,3]],'#fff',OUT,.8);c.restore()}
  for(const f of BU.fxs)f.draw(f.t);
  FX.draw(c,0,0);
  if(BU.flash){BU.flash.t+=dt;const a=BU.flash.a*(1-BU.flash.t/.5);if(a<=0)BU.flash=null;else{c.fillStyle=`rgba(${BU.flash.col},${a})`;c.fillRect(0,0,VW,VH)}}
  c.restore();
  drawBattleHud(dt,cur);
}
function drawBattleHud(dt,cur){
  const b=BU.b,c=ctx;
  // héroes
  [0,1].forEach(si=>{const sd=b.sides[si],x=si===0?14:VW-14-250,y=8;const p=G.players[sd.pid];
    panel(x,y,250,86,{plain:1,r:8,noshadow:1,border:p?p.col:'#c8a24a'});
    if(sd.hero){c.drawImage(portrait(sd.hero.fi,sd.hero.port,sd.hero.cls),x+8,y+8,56,56);text(sd.hero.name,x+72,y+24,{size:15,bold:true,color:'#ffe9a0'});text(`Nv ${sd.hero.lvl} · ${sd.hs.a}/${sd.hs.d}/${sd.hs.sp}/${sd.hs.kn}`,x+72,y+42,{size:12});
      bar(x+72,y+50,164,11,sd.hero.mana/Math.max(1,maxMana(sd.hero)),'#6aa0ff','#2a5ac0');text(`${Math.floor(sd.hero.mana)}`,x+154,y+60,{size:10,bold:true,align:'center',shadow:false});
      text(`Moral ${sd.hs.lead>=0?'+':''}${sd.hs.lead||0}  Suerte +${sd.hs.luck||0}`,x+72,y+77,{size:11,color:'#bfe8ff'})}
    else{text(sd.name,x+125,y+36,{size:16,bold:true,align:'center',color:'#ffe9a0'});text(si===0?'Atacante':'Defensor',x+125,y+58,{size:12,align:'center'})}
    if(b.cast[si])text('✦ hechizo usado',x+240,y+78,{size:10,align:'right',color:'#9a8a70'})});
  text(`Ronda ${b.round}`,VW/2,30,{size:20,bold:true,align:'center',color:'#ffe9a0',outline:1});
  // orden de turno
  const order=[...b.queue.filter(s=>!s.dead),...b.waitQ.filter(s=>!s.dead)].slice(0,12);
  order.forEach((s,i)=>{const x=VW/2-order.length*17+i*34,y=40;const p=G.players[b.sides[s.side].pid];rrect(c,x,y,32,32,5,'rgba(10,6,16,.85)',i===0?'#ffe27a':(p?p.col:'#888'),i===0?2.4:1.5);c.save();c.beginPath();c.rect(x+1,y+1,30,30);c.clip();c.drawImage(creatureSprite(s.id,false),x-4,y-6,40,40);c.restore();hit(x,y,32,32,null,{tip:CR[s.id].name+' ×'+s.n})});
  // registro
  c.save();rrect(c,6,VH-150,236,142,8,'rgba(12,8,18,.72)','rgba(200,162,74,.7)',1.2);c.beginPath();c.rect(10,VH-148,228,138);c.clip();BU.log.slice(-8).forEach((l,i,a)=>{c.globalAlpha=.5+.5*((i+1)/a.length);text(l,14,VH-134+i*16.5,{size:11,color:'#f2e6c8'})});c.restore();c.globalAlpha=1;
  // barra inferior
  const hum=cur&&!b.over&&humanSide(cur.side)&&!BU.ev&&!BU.q.length;
  panel(250,VH-66,780,60,{plain:1,r:8,noshadow:1});
  const side=cur?cur.side:0,hr=b.sides[side].hero;
  const can=hum;let bx=262;
  button(bx,VH-58,108,44,'Hechizo',()=>openSpellMenu(),{size:14,disabled:!can||!hr||b.cast[side]||!hr.spells.length,tip:!hr?'Sin héroe':b.cast[side]?'Ya lanzaste un hechizo esta ronda':'Abrir el libro de hechizos (S)'});bx+=116;
  button(bx,VH-58,108,44,'Esperar',()=>{b.actWait(cur);BU.pull();BU.mode=null},{size:14,disabled:!can||cur.waited,tip:'Actuar al final de la ronda (W)'});bx+=116;
  button(bx,VH-58,108,44,'Defender',()=>{b.actDefend(cur);BU.pull();BU.mode=null},{size:14,disabled:!can,tip:'+20% de defensa hasta tu próximo turno (D)'});bx+=116;
  button(bx,VH-58,108,44,BU.auto?'Manual':'Auto',()=>{BU.auto=!BU.auto;BU.wait=.1},{size:14,tip:'El combate automático lo juega la IA (A)'});bx+=116;
  const myside=b.sides[0].human?0:1,mysd=b.sides[myside];
  button(bx,VH-58,108,44,'Huir',()=>Dlg.show({title:'¿Huir del combate?',text:mysd.hero?'Tu ejército se perderá, pero el héroe sobrevivirá y podrá ser contratado de nuevo.':'No puedes huir.',buttons:[{label:'Huir',primary:1,disabled:!mysd.hero,fn:()=>{b.retreat(myside);BU.pull()}},{label:'Seguir luchando'}]}),{size:14,disabled:!can||!mysd.hero||b.info.type==='mon'&&false});bx+=116;
  const cost=surrenderCost(mysd.army.map((a,i)=>{const s=b.st.find(u=>u.side===myside&&u.slot===i&&!u.dead);return s?{id:s.id,n:s.n}:null}));
  button(bx,VH-58,108,44,'Rendirse',()=>Dlg.show({title:'Rendirse',text:`Pagar ${cost} de oro para retirar a tu héroe del combate.`,buttons:[{label:'Pagar y rendirse',primary:1,disabled:G.players[mysd.pid].res.gold<cost,fn:()=>{G.players[mysd.pid].res.gold-=cost;b.retreat(myside);BU.pull()}},{label:'Cancelar'}]}),{size:14,disabled:!can||!mysd.hero||b.info.type==='mon'&&true,tip:'Solo contra héroes y ciudades'});
  if(BU.mode==='spell')text(`Elige objetivo para ${SPELLS[BU.spell].n} (clic derecho: cancelar)`,VW/2,VH-76,{size:15,bold:true,align:'center',color:'#bfe8ff',outline:1});
  if(cur&&hum){const s=cur;text(`Turno de ${CR[s.id].name} ×${s.n}`,VW/2,96,{size:15,bold:true,align:'center',color:'#ffe9a0',outline:1})}
  // clic en el campo
  if(hum){hit(HOX-20,HOY-30,BW*HW+HW+40,BH*HS*1.5+60,()=>battleClick(),{right:()=>{if(BU.mode==='spell'){BU.mode=null;return}const t=BU.hover&&b.at(BU.hover[0],BU.hover[1]);if(t)creatureInfo(t.id,0)}})}
  else hit(HOX-20,HOY-30,BW*HW+HW+40,BH*HS*1.5+60,null,{right:()=>{const t=BU.hover&&b.at(BU.hover[0],BU.hover[1]);if(t)creatureInfo(t.id,0)}});
  for(const e of UI.keyq||[]){if(UI.modals.length)break;if(!hum)continue;if(e.code==='KeyW'&&!cur.waited){b.actWait(cur);BU.pull()}else if(e.code==='KeyD'){b.actDefend(cur);BU.pull()}else if(e.code==='KeyS'&&hr&&!b.cast[side])openSpellMenu();else if(e.code==='KeyA')BU.auto=!BU.auto;else if(e.code==='Escape')BU.mode=null}
}
function battleClick(){
  const b=BU.b,cur=b.cur(),h=BU.hover;if(!cur||!h)return;const t=b.at(h[0],h[1]);const side=cur.side;
  if(BU.mode==='spell'){const S2=SPELLS[BU.spell];
    const ok=t&&((['dmg','area','chain','debuff'].includes(S2.k)&&t.side!==side)||(['buff','heal','res'].includes(S2.k)&&t.side===side));if(!ok){toast('Objetivo no válido','bad');return}
    b.castSpell(side,BU.spell,t,h[0],h[1]);BU.mode=null;BU.pull();return}
  if(t&&t.side!==side){
    if(b.canShoot(cur)){b.actShoot(cur,t);BU.pull();return}
    const R=b.reach(cur);const hx=b.attackHexes(cur,t,R);if(!hx.length){toast('No se puede alcanzar','bad');return}
    // elegir el hexágono de ataque más cercano al ratón
    hx.sort((p,q)=>{const a=hexPx(p[0],p[1]),c2=hexPx(q[0],q[1]);return(a[0]-UI.mx)**2+(a[1]-UI.my)**2-((c2[0]-UI.mx)**2+(c2[1]-UI.my)**2)});
    b.actMoveAttack(cur,hx[0][0],hx[0][1],t);BU.pull();return}
  if(!t&&!b.obst.has(hk(h[0],h[1]))){const R=b.reach(cur);if(R.dist.has(hk(h[0],h[1]))){b.actMoveAttack(cur,h[0],h[1],null);BU.pull()}}
}
function openSpellMenu(){
  const b=BU.b,cur=b.cur(),side=cur.side,hr=b.sides[side].hero;
  Dlg.show({w:640,title:'Libro de hechizos',draw:m=>{const x=320,y=150,w=640,hh=400;panel(x,y,w,hh,{title:`Libro de hechizos — Maná ${Math.floor(hr.mana)}`});
    const sp=hr.spells.slice().sort((a,c2)=>SPELLS[a].lv-SPELLS[c2].lv);
    sp.forEach((s,i)=>{const S2=SPELLS[s],cx=x+22+(i%2)*302,cy=y+56+Math.floor(i/2)*56;const ok=hr.mana>=S2.cost;
      rrect(ctx,cx,cy,292,50,7,ok?'rgba(60,50,90,.85)':'rgba(30,24,34,.8)',ok?'#8a7ac0':'#3a3040',1.4);text(S2.n,cx+10,cy+20,{size:15,bold:true,color:ok?'#fff':'#7a7080'});text(`Nivel ${S2.lv} · ${S2.cost} maná`,cx+10,cy+38,{size:12,color:ok?'#bfa8ff':'#5a5060'});
      hit(cx,cy,292,50,ok?()=>{Dlg.close();if(S2.k==='all'){b.castSpell(side,s,null,0,0);BU.pull()}else{BU.mode='spell';BU.spell=s}}:null,{tip:[S2.n,S2.d,`Daño/efecto: ${S2.base?S2.base+S2.per*b.hs(side).sp:'—'}`]})});
    button(x+w/2-60,y+hh-48,120,34,'Cerrar',()=>Dlg.close())}});
}
function showBattleResult(){
  BU.resultShown=true;const b=BU.b;const w=b.winner;const hs=b.sides.findIndex(s=>s.human);const me=hs<0?0:hs;const won=w===me;
  const xp=b.xpFor(w);const lines=[];
  for(let i=0;i<2;i++){const sd=b.sides[i];const lost=b.st.filter(s=>s.side===i).reduce((a,s)=>a+(s.startN-(s.dead?0:s.n)),0);lines.push(`${sd.name}: ${lost} bajas`)}
  sfx(won?'win':'lose');
  Dlg.show({title:won?'¡Victoria!':'Derrota',w:520,text:(b.fled!=null?(b.fled===me?'Has abandonado el campo de batalla.':'El enemigo huye del combate.'):won?'Tus fuerzas han vencido.':'Tus fuerzas han sido derrotadas.')+'\n'+lines.join('\n')+(won?`\nExperiencia ganada: ${xp}`:''),
    buttons:[{label:'Continuar',primary:1,fn:()=>endBattleUI()}]});
}
function endBattleUI(){fadeTo(()=>{S.scr=S.prevScr||'adv';const d=BU.done;BU.b=null;fadeIn(2.5);d&&d()},3)}
