'use strict';
// =====================================================================
//  Motor de combate táctico por hexágonos (sin DOM: sirve para IA y UI)
// =====================================================================
const BW=15,BH=11;
function hexNb(x,y){const o=y&1?[[1,0],[-1,0],[1,-1],[0,-1],[1,1],[0,1]]:[[1,0],[-1,0],[0,-1],[-1,-1],[0,1],[-1,1]];const r=[];for(const[dx,dy]of o){const nx=x+dx,ny=y+dy;if(nx>=0&&ny>=0&&nx<BW&&ny<BH)r.push([nx,ny])}return r}
function hexCube(x,y){const q=x-((y-(y&1))>>1);return[q,y]}
function hexDist(ax,ay,bx,by){const[aq,ar]=hexCube(ax,ay),[bq,br]=hexCube(bx,by);const dq=aq-bq,dr=ar-br;return(Math.abs(dq)+Math.abs(dr)+Math.abs(dq+dr))/2}
const hk=(x,y)=>y*BW+x;
const SLOTS=[[5],[3,7],[2,5,8],[1,4,6,9],[0,3,5,7,10],[0,2,4,6,8,10],[0,2,3,5,7,8,10]];

class Battle{
  // sides: [{hero,hs,army:[{id,n}],pid,human,name}, ...]  0 = atacante, 1 = defensor
  constructor(sides,opt={}){
    this.sides=sides;this.st=[];this.ev=[];this.round=0;this.over=false;this.winner=-1;this.grid=new Map();this.obst=new Set();this.cast=[false,false];this.log=[];this.opt=opt;
    // obstáculos
    const nO=opt.noObst?0:4+Math.floor(Math.random()*6);
    for(let i=0;i<nO;i++){const x=3+Math.floor(Math.random()*9),y=Math.floor(Math.random()*BH);this.obst.add(hk(x,y))}
    sides.forEach((sd,si)=>{
      const arr=sd.army.map((a,slot)=>({a,slot})).filter(o=>o.a&&o.a.n>0);const pos=SLOTS[Math.max(0,arr.length-1)];
      arr.forEach((o,k)=>{const hsb=sd.hs||{};const cr0=CR[o.a.id];const cr=(hsb.hpB||hsb.spdB)?Object.assign({},cr0,{hp:cr0.hp+(hsb.hpB||0),spd:cr0.spd+(hsb.spdB||0)}):cr0;const y=pos[k],x=si===0?0:BW-1;this.obst.delete(hk(x,y));this.obst.delete(hk(x+(si?-1:1),y));
        const s={side:si,slot:o.slot,id:o.a.id,cr,n:o.a.n,startN:o.a.n,top:cr.hp,x,y,ret:true,defend:false,waited:false,buff:{},shots:cr.shots,idx:this.st.length,dead:false,killed:0,fresh:true};
        this.st.push(s);this.grid.set(hk(x,y),s)})});
    if(opt.siege)this.initSiege(opt.siege);
    this.startRound();
  }
  // ---- consultas ----
  alive(side,all){return this.st.filter(s=>!s.dead&&(all||!s.siege)&&(side===undefined||s.side===side))}
  at(x,y){return this.grid.get(hk(x,y))||null}
  hs(side){return this.sides[side].hs||{a:0,d:0,sp:0,kn:0,off:0,arch:0,armor:0,mana:0}}
  spd(s){let v=s.cr.spd;if(this.round<=2)v+=this.hs(s.side).tact||0;if(s.buff.haste)v+=3;if(s.buff.slow)v=Math.max(1,v-Math.ceil(v*.4));return v}
  specB(s){const sp=this.hs(s.side).spec;return sp&&sp.id.replace('u','')===s.id.replace('u','')?sp.bonus:0}
  atkVal(s){return s.cr.atk+this.hs(s.side).a+this.specB(s)}
  defVal(s){let d=s.cr.def+this.hs(s.side).d+this.specB(s);if(s.buff.stone)d+=4;if(s.defend)d=Math.ceil(d*1.2);return d}
  total(s){return s.dead?0:(s.n-1)*s.cr.hp+s.top}
  cur(){return this.queue[0]||null}
  // ---- rondas ----
  startRound(){
    this.round++;this.cast=[false,false];
    for(const s of this.st){if(s.dead)continue;s.ret=true;s.waited=false;s.defend=false;for(const k in s.buff){s.buff[k]--;if(s.buff[k]<=0)delete s.buff[k]}}
    this.queue=this.alive(undefined,true).sort((a,b)=>this.spd(b)-this.spd(a)||a.side-b.side||a.idx-b.idx);this.waitQ=[];
    this.ev.push({t:'round',n:this.round});this.beginTurn();if(this.cur()&&this.cur().skip&&!this.over)this.nextTurn();
  }
  morale(s){if(s.cr.arch==='golem'||s.cr.arch==='undead'||s.cr.arch==='ghost'||s.cr.arch==='lich'||s.cr.arch==='skel')return 0;return Math.max(-3,Math.min(3,this.hs(s.side).lead||0))}
  beginTurn(){const s=this.cur();if(!s)return;
    if(s.siege){this.siegeAct(s);s.skip=true;return}
    if(s.cr.regen&&s.top<s.cr.hp){s.top=s.cr.hp;this.ev.push({t:'text',s,txt:'Regenera'})}
    const mo=this.morale(s);if(mo<0&&!s.bonus&&Math.random()<[0,1/12,1/6,1/4][-mo]){this.ev.push({t:'text',s,txt:'¡Moral baja!'});this.ev.push({t:'morale',s,bad:true});s.skip=true}}
  nextTurn(){
    if(this.checkEnd())return;
    const sc=this.queue[0];
    if(sc&&!sc.dead&&!sc.skip&&!sc.bonus&&!sc.defend){const mo=this.morale(sc);if(mo>0&&Math.random()<[0,1/24,1/12,1/8][mo]){sc.bonus=true;this.ev.push({t:'text',s:sc,txt:'¡Moral alta!'});this.ev.push({t:'morale',s:sc,bad:false});return}}
    if(sc){sc.skip=false;sc.bonus=false}
    this.queue.shift();
    while(this.queue.length&&this.queue[0].dead)this.queue.shift();
    if(!this.queue.length){if(this.waitQ.length){this.queue=this.waitQ.filter(s=>!s.dead).sort((a,b)=>this.spd(a)-this.spd(b)||b.side-a.side);this.waitQ=[]}}
    if(!this.queue.length){if(this.round>=60){this.over=true;this.winner=1;return}this.startRound();return}
    this.beginTurn();if(this.cur()&&this.cur().skip&&!this.over)this.nextTurn();
  }
  checkEnd(){const a=this.alive(0).length,d=this.alive(1).length;if(!a||!d){this.over=true;this.winner=a?0:1;this.ev.push({t:'end',w:this.winner});return true}return false}
  // ---- movimiento ----
  reach(s){
    const dist=new Map(),par=new Map(),max=this.spd(s);dist.set(hk(s.x,s.y),0);let q=[[s.x,s.y]];
    for(let d=1;d<=max;d++){const nq=[];for(const[x,y]of q)for(const[nx,ny]of hexNb(x,y)){const k=hk(nx,ny);if(dist.has(k))continue;
      const w=this.wall&&this.wall.get(k),wb=w&&w.hp>0&&!(w.gate&&s.side===1);
      const blocked=this.obst.has(k)||this.grid.has(k)||wb;
      if(blocked&&!(s.cr.fly||s.cr.tele))continue;
      dist.set(k,d);par.set(k,hk(x,y));nq.push([nx,ny])}q=nq}
    // los voladores no pueden terminar sobre obstáculos o unidades
    for(const k of [...dist.keys()])if(k!==hk(s.x,s.y)&&(this.obst.has(k)||this.grid.has(k)||(this.wall&&this.wall.has(k)&&this.wall.get(k).hp>0)))dist.delete(k);
    return{dist,par};
  }
  pathTo(R,s,x,y){const p=[];let k=hk(x,y);const sk=hk(s.x,s.y);while(k!==sk&&R.par.has(k)){p.push([k%BW,(k/BW)|0]);k=R.par.get(k)}p.reverse();return p}
  enemiesAdj(s){const r=[];for(const[x,y]of hexNb(s.x,s.y)){const t=this.at(x,y);if(t&&t.side!==s.side)r.push(t)}return r}
  // posiciones desde las que s puede golpear a t
  attackHexes(s,t,R){const r=[];for(const[x,y]of hexNb(t.x,t.y)){const k=hk(x,y);if(R.dist.has(k)||(x===s.x&&y===s.y))r.push([x,y])}return r}
  moveTo(s,x,y){if(x===s.x&&y===s.y)return;const R=this.reach(s);if(!R.dist.has(hk(x,y)))return false;
    const path=(s.cr.fly||s.cr.tele)?[[x,y]]:this.pathTo(R,s,x,y);this.grid.delete(hk(s.x,s.y));this.ev.push({t:'move',s,from:[s.x,s.y],to:[x,y],path});s.x=x;s.y=y;this.grid.set(hk(x,y),s);return true}
  // ---- daño ----
  rollDmg(a,d,ranged,avg){
    const cr=a.cr,N=a.n;let base=0;
    const one=()=>a.buff.bless?cr.mx:a.buff.curse?cr.mn:cr.mn+Math.floor(Math.random()*(cr.mx-cr.mn+1));
    if(avg)base=N*(cr.mn+cr.mx)/2;
    else if(N<=10){for(let i=0;i<N;i++)base+=one()}else{let t=0;for(let i=0;i<10;i++)t+=one();base=Math.floor(t*N/10)}
    const atk=this.atkVal(a),df=this.defVal(d);let I=0,R=0;
    if(atk>df)I+=Math.min(3,.05*(atk-df));else R=Math.min(.7,.025*(df-atk));
    const h=this.hs(a.side);const lv=ranged?h.arch||0:h.off||0;
    I+=ranged?[0,.1,.25,.5][lv]:[0,.1,.2,.3][lv];
    a.lucky=false;if(!avg&&h.luck>0&&Math.random()<[0,.0417,.0833,.125][Math.min(3,h.luck)]){I+=1;a.lucky=true}
    let m=(1+I)*(1-R);
    const hd=this.hs(d.side);if(hd.armor)m*=1-.05*hd.armor;
    if(!ranged&&d.buff.shield)m*=.75;
    if(ranged&&this.wallBetween(a,d))m*=.5;
    if(ranged&&a.cr.shoot&&(this.enemiesAdj(a).length||hexDist(a.x,a.y,d.x,d.y)>=10))m*=.5;
    return Math.max(1,Math.floor(base*m));
  }
  applyDmg(d,dmg,src){
    const before=d.n,tot=this.total(d)-dmg;let killed;
    if(tot<=0){killed=d.n;d.n=0;d.top=0;d.dead=true;this.grid.delete(hk(d.x,d.y))}
    else{d.n=Math.ceil(tot/d.cr.hp);d.top=tot-(d.n-1)*d.cr.hp;killed=before-d.n}
    d.killed+=0;if(src)src.killed+=killed;return killed;
  }
  strike(a,d,ranged){
    const dmg=this.rollDmg(a,d,ranged);const kills=this.applyDmg(d,dmg,a);
    this.ev.push({t:'hit',a,d,dmg,kills,ranged,dead:d.dead,lucky:a.lucky,na:d.n,ta:d.top});
    if(a.cr.drain&&dmg>0){const heal=Math.floor(dmg*.5);const max=a.startN*a.cr.hp;const tot=Math.min(max,this.total(a)+heal);a.n=Math.ceil(tot/a.cr.hp);a.top=tot-(a.n-1)*a.cr.hp}
    return{dmg,kills};
  }
  melee(a,t){
    this.strike(a,t,false);
    if(a.cr.area)for(const o of this.enemiesAdj(a))if(o!==t&&!o.dead)this.strike(a,o,false);
    if(a.cr.breath&&!t.dead){// la criatura de detrás en línea
      const dx=t.x-a.x,dy=t.y-a.y;const bx=t.x+dx,by=t.y+dy;const o=bx>=0&&by>=0&&bx<BW&&by<BH?this.at(bx,by):null;if(o&&o.side!==a.side)this.strike(a,o,false)}
    if(!t.dead&&t.ret&&!a.cr.noret){t.ret=false;this.strike(t,a,false)}
    if(a.cr.dbl&&!a.dead&&!t.dead)this.strike(a,t,false);
  }
  // ---- acciones del turno ----
  actMoveAttack(s,x,y,t){
    if(this.over||s!==this.cur())return false;
    if(!this.moveTo(s,x,y)&&!(x===s.x&&y===s.y))return false;
    if(t){if(hexDist(s.x,s.y,t.x,t.y)!==1)return false;this.melee(s,t)}
    s.fresh=false;this.nextTurn();return true;
  }
  canShoot(s){return s.cr.shoot&&s.shots>0&&!this.enemiesAdj(s).length}
  actShoot(s,t){
    if(this.over||s!==this.cur()||!s.cr.shoot||s.shots<=0||t.side===s.side)return false;
    s.shots--;this.strike(s,t,true);if(s.cr.dbl&&!t.dead&&s.shots>0){s.shots--;this.strike(s,t,true)}
    this.nextTurn();return true;
  }
  actDefend(s){if(this.over||s!==this.cur())return;s.defend=true;this.ev.push({t:'text',s,txt:'Defiende'});this.nextTurn()}
  actWait(s){if(this.over||s!==this.cur()||s.waited)return false;s.waited=true;this.queue.shift();this.waitQ.push(s);
    if(!this.queue.length){this.queue=this.waitQ.sort((a,b)=>this.spd(a)-this.spd(b)||b.side-a.side);this.waitQ=[]}this.beginTurn();if(this.cur()&&this.cur().skip&&!this.over)this.nextTurn();return true}
  // ---- magia ----
  heroMana(side){const h=this.sides[side].hero;return h?h.mana:0}
  canCast(side,sp){const h=this.sides[side].hero;return !!h&&!this.cast[side]&&h.mana>=SPELLS[sp].cost&&(h.spells||[]).includes(sp)}
  spellPower(side,sp){
    const h=this.hs(side),S=SPELLS[sp];let k=1+.05*(h.sorc||0);const sc=SCHOOL[sp];if(sc){k+=[0,.2,.4,.6][(h.sch&&h.sch[sc])||0]+((h.schA&&h.schA[sc])||0)/100}
    if(h.specSpell&&h.specSpell.id===sp)k+=h.specSpell.pct;
    return(S.base+S.per*(h.sp||0))*k;
  }
  castSpell(side,sp,target,cx,cy){
    if(!this.canCast(side,sp))return false;const S=SPELLS[sp],h=this.sides[side].hero;
    h.mana-=S.cost;this.cast[side]=true;const dmg=this.spellPower(side,sp);
    (this.casts=this.casts||[[],[]])[side].push(sp);
    this.ev.push({t:'spell',sp,side,target,x:target?target.x:cx,y:target?target.y:cy});
    const hurt=(u,amt)=>{if(!u||u.dead)return;const hr=this.hs(u.side).resi||0;if(hr&&Math.random()<hr/100){this.ev.push({t:'text',s:u,txt:'¡Resiste!'});return}amt=Math.floor(amt);const k=this.applyDmg(u,amt,null);this.ev.push({t:'hit',a:null,d:u,dmg:amt,kills:k,spell:true,dead:u.dead,na:u.n,ta:u.top,sp})};
    switch(S.k){
      case'dmg':hurt(target,dmg);break;
      case'dmgslow':hurt(target,dmg);if(target&&!target.dead){target.buff.slow=3;this.ev.push({t:'text',s:target,txt:'Ralentizado'})}break;
      case'area':{const hs=[[target.x,target.y],...hexNb(target.x,target.y)];for(const[x,y]of hs){const u=this.at(x,y);if(u)hurt(u,dmg)}break}
      case'chain':{let cur=target,d=dmg;const hit=new Set();for(let i=0;i<4&&cur;i++){hit.add(cur);hurt(cur,d);d/=2;
        cur=this.alive(1-side).filter(u=>!hit.has(u)).sort((a,b)=>hexDist(cur.x,cur.y,a.x,a.y)-hexDist(cur.x,cur.y,b.x,b.y))[0]}break}
      case'all':for(const u of this.alive())hurt(u,dmg);break;
      case'heal':{const max=target.startN*target.cr.hp,tot=Math.min(max,this.total(target)+dmg);target.n=Math.ceil(tot/target.cr.hp);target.top=tot-(target.n-1)*target.cr.hp;this.ev.push({t:'text',s:target,txt:'+'+Math.floor(dmg)});break}
      case'res':{const unit=target.cr.hp;const add=Math.floor(dmg/unit);const n=Math.min(target.startN-target.n,add);if(n>0)target.n+=n;this.ev.push({t:'text',s:target,txt:'+'+n});break}
      case'buff':case'debuff':target.buff[S.buff]=S.dur;this.ev.push({t:'text',s:target,txt:S.n});break;
    }
    this.ev.push({t:'sync'});this.checkEnd();return true;
  }
  // ---- asedio: murallas, torres y catapulta ----
  wallUp(){if(!this.wall)return false;for(const w of this.wall.values())if(w.hp>0)return true;return false}
  wallBetween(a,d){if(!this.wall||a.side!==0||d.side!==1||a.x>=9||d.x<=9)return false;for(let y=Math.max(0,d.y-1);y<=Math.min(BH-1,d.y+1);y++){const w=this.wall.get(hk(9,y));if(w&&w.hp>0)return true}return false}
  siegeUnit(side,id,x,y,kind,wy){const cr=CR[id];const s={side,slot:-1,id,cr,n:1,startN:1,top:cr.hp,x,y,ret:false,defend:false,waited:false,buff:{},shots:99,idx:this.st.length,dead:false,killed:0,fresh:true,siege:kind,wy};this.st.push(s);this.grid.set(hk(x,y),s);return s}
  initSiege(lvl){
    const hp=[0,2,3,4][lvl];this.siege={lvl,hp};this.wall=new Map();
    for(let x=7;x<=11;x++)for(let y=0;y<BH;y++)this.obst.delete(hk(x,y));
    for(let y=0;y<BH;y++)this.wall.set(hk(9,y),{hp,max:hp,gate:y===5});
    for(const y of[[],[2],[2,8],[1,3,7,9]][lvl])this.siegeUnit(1,'tower',10,y,'tower',y);
    let cy=[4,6,3,7,2,8,1,9,0,10].find(y=>!this.grid.has(hk(1,y)));if(cy==null)cy=5;
    this.siegeUnit(0,'catapult',1,cy,'catapult');
  }
  siegeAct(s){
    if(s.siege==='catapult'){
      const segs=[...this.wall].filter(([k,w])=>w.hp>0);if(!segs.length)return;
      const tw=this.alive(1,true).filter(u=>u.siege==='tower');
      let pick=null;if(tw.length&&Math.random()<.5){const t=tw[Math.floor(Math.random()*tw.length)];pick=segs.find(([k])=>k===hk(9,t.wy))}
      if(!pick&&Math.random()<.45)pick=segs.find(([k,w])=>w.gate);
      if(!pick)pick=segs[Math.floor(Math.random()*segs.length)];
      const[k,w]=pick,hit=Math.random()<.85;if(hit)w.hp--;
      this.ev.push({t:'catapult',s,x:9,y:(k/BW)|0,hit,hp:w.hp,max:w.max});
      if(hit&&w.hp<=0){this.ev.push({t:'text',s,txt:'¡Muro derribado!'});
        for(const u of this.alive(1,true))if(u.siege==='tower'&&u.wy===((k/BW)|0)){this.applyDmg(u,1e9,null);this.ev.push({t:'hit',a:null,d:u,dmg:0,kills:0,spell:true,dead:true,na:0,ta:0})}}
    }else if(s.siege==='tower'){
      const foes=this.alive(0);if(!foes.length)return;
      const t=foes.sort((a,b)=>b.cr.val*b.n-a.cr.val*a.n)[0];const dmg=Math.floor((10+Math.random()*10)*(1+this.siege.lvl*.3)*(1-.03*(this.hs(0).armor||0)));
      const kills=this.applyDmg(t,dmg,null);this.ev.push({t:'hit',a:s,d:t,dmg,kills,ranged:true,dead:t.dead,na:t.n,ta:t.top});this.checkEnd();
    }
  }
  // ---- IA ----
  expected(a,d,ranged){const dmg=this.rollDmg(a,d,ranged,true);const tot=this.total(d);const k=dmg>=tot?d.n:Math.floor(dmg/d.cr.hp);return{dmg,kills:k,val:Math.min(dmg,tot)/d.cr.hp*d.cr.val}}
  aiAct(){
    const s=this.cur();if(!s||this.over)return;const me=s.side;
    this.aiSpell(me);if(this.over||this.cur()!==s)return;
    const foes=this.alive(1-me);if(!foes.length){this.nextTurn();return}
    const adj=this.enemiesAdj(s);
    if(this.canShoot(s)){let bt=null,bv=-1;for(const t of foes){const e=this.expected(s,t,true).val;if(e>bv){bv=e;bt=t}}this.actShoot(s,bt);return}
    const R=this.reach(s);let best=null,bs=-1e9;
    for(const t of foes){
      let hexes=this.attackHexes(s,t,R);if(me===1&&this.wallUp())hexes=hexes.filter(q=>q[0]>=10);if(!hexes.length)continue;
      const e=this.expected(s,t,false),ret=(t.ret&&!s.cr.noret&&e.kills<t.n)?this.expected(t,s,false).val*.7:0;
      let sc=e.val-ret+(e.kills>=t.n?e.val*.3:0)+(t.cr.shoot?t.cr.val*.4:0);
      if(sc>bs){bs=sc;
        // elegir el hex de ataque más seguro (menos vecinos enemigos) y cercano
        hexes.sort((p,q)=>(this.nbEnemies(s,p)-this.nbEnemies(s,q))||(R.dist.get(hk(p[0],p[1]))||0)-(R.dist.get(hk(q[0],q[1]))||0));best={t,h:hexes[0]}}
    }
    if(best){this.actMoveAttack(s,best.h[0],best.h[1],best.t);return}
    // acercarse al enemigo más cercano
    let near=null,nd=1e9;for(const t of foes){const d=hexDist(s.x,s.y,t.x,t.y);if(d<nd){nd=d;near=t}}
    if(s.cr.shoot&&s.shots>0&&!adj.length){this.actShoot(s,near);return}
    let bh=null,bdist=nd;if(me===1&&this.wallUp()){this.actDefend(s);return}for(const[k,d]of R.dist){const x=k%BW,y=(k/BW)|0;const dd=hexDist(x,y,near.x,near.y);if(dd<bdist){bdist=dd;bh=[x,y]}}
    if(bh&&(bh[0]!==s.x||bh[1]!==s.y)){this.moveTo(s,bh[0],bh[1]);s.fresh=false;this.nextTurn();return}
    this.actDefend(s);
  }
  nbEnemies(s,h){let n=0;for(const[x,y]of hexNb(h[0],h[1])){const u=this.at(x,y);if(u&&u.side!==s.side)n++}return n}
  aiSpell(side){
    const h=this.sides[side].hero;if(!h||this.cast[side]||!h.spells)return;
    const foes=this.alive(1-side),fr=this.alive(side);if(!foes.length)return;
    let best=null,bv=0;
    for(const sp of h.spells){const S=SPELLS[sp];if(h.mana<S.cost)continue;const dmg=S.base?this.spellPower(side,sp):0;
      if(S.k==='dmg'||S.k==='dmgslow'){for(const t of foes){const v=Math.min(dmg,this.total(t))/t.cr.hp*t.cr.val-S.cost*2;if(v>bv){bv=v;best={sp,t}}}}
      else if(S.k==='area'){for(const t of foes){let v=-S.cost*2;for(const[x,y]of [[t.x,t.y],...hexNb(t.x,t.y)]){const u=this.at(x,y);if(!u)continue;const w=Math.min(dmg,this.total(u))/u.cr.hp*u.cr.val;v+=u.side!==side?w:-w}if(v>bv){bv=v;best={sp,t}}}}
      else if(S.k==='chain'){for(const t of foes){const v=Math.min(dmg,this.total(t))/t.cr.hp*t.cr.val*1.8-S.cost*2;if(v>bv){bv=v;best={sp,t}}}}
      else if(S.k==='all'){let v=-S.cost*2;for(const u of this.alive()){const w=Math.min(dmg,this.total(u))/u.cr.hp*u.cr.val;v+=u.side!==side?w:-w}if(v>bv){bv=v;best={sp,t:null}}}
      else if(S.k==='buff'&&this.round<=2){const t=fr.sort((a,b)=>b.cr.val*b.n-a.cr.val*a.n)[0];if(t&&!t.buff[S.buff]){const v=t.cr.val*t.n*.4;if(v>bv&&v>S.cost){bv=v;best={sp,t}}}}
      else if(S.k==='debuff'&&this.round<=2){const t=foes.sort((a,b)=>b.cr.val*b.n-a.cr.val*a.n)[0];if(t&&!t.buff[S.buff]){const v=t.cr.val*t.n*.35;if(v>bv&&v>S.cost){bv=v;best={sp,t}}}}
    }
    if(best)this.castSpell(side,best.sp,best.t,0,0);
  }
  // ---- resultado ----
  xpFor(side){let x=0;for(const s of this.st)if(s.side!==side&&!s.siege)x+=(s.startN-(s.dead?0:s.n))*s.cr.hp;return x}
  result(){// devuelve ejércitos resultantes por bando
    return this.sides.map((sd,si)=>sd.army.map((a,slot)=>{if(!a)return null;const s=this.st.find(u=>u.side===si&&u.slot===slot);if(!s)return a;return s.dead||s.n<=0?null:{id:a.id,n:s.n}}));
  }
  retreat(side){if(this.over)return;this.over=true;this.winner=1-side;this.fled=side;this.ev.push({t:'end',w:this.winner})}
  autoPlay(){let g=0;while(!this.over&&g++<4000){this.aiAct();this.ev.length=0}return this.winner}
}
function armyPower(a){let p=0;for(const s of a)if(s&&s.n>0)p+=CR[s.id].val*s.n;return p}
function armyCount(a){return a.filter(s=>s&&s.n>0).length}
