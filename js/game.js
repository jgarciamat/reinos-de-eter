'use strict';
// =====================================================================
//  Lógica del juego: jugadores, héroes, ciudades, movimiento, IA, guardado
//  (sin DOM — la interfaz se engancha mediante G.hooks)
// =====================================================================
const G={map:null,players:[],heroes:[],day:1,cur:0,over:false,busy:false,opt:{},hmap:null,zoc:null,
  hooks:{notify(){},askChest(h,cb){cb('gold')},battle(b,cb){b.autoPlay();cb()},levelUp(h,opts,cb){cb(opts[0])},dwell(o,h,cb){cb()},town(t,h,cb){cb()},gameOver(){},msg(){}}};
const DIFF=[{n:'Fácil',res:1.6,ai:.7},{n:'Normal',res:1,ai:1},{n:'Difícil',res:.8,ai:1.35},{n:'Extremo',res:.6,ai:1.9}];
const RV={gold:1,wood:250,ore:250,mercury:500,sulfur:500,crystal:500,gems:500};
const SIZE_LAB=[[4,'Unos pocos'],[9,'Varios'],[19,'Un grupo'],[49,'Muchos'],[99,'Una horda'],[249,'Una multitud'],[499,'Una legión'],[1e9,'Innumerables']];
const sizeLabel=n=>{for(const[m,l]of SIZE_LAB)if(n<=m)return l};
const sizeRange=n=>{const R=[[1,4],[5,9],[10,19],[20,49],[50,99],[100,249],[250,499],[500,999]];for(const[a,b]of R)if(n<=b)return`${a}-${b}`;return'500+'};
const notify=(m,k)=>G.hooks.notify(m,k);
const isHuman=pid=>pid>=0&&G.players[pid]&&G.players[pid].human;
const mapIdx=(x,y)=>y*G.map.w+x;
const padArmy=a=>{const r=[];for(let i=0;i<7;i++)r.push(a&&a[i]&&a[i].n>0?{id:a[i].id,n:a[i].n}:null);return r};

// ---------- héroes ----------
function makeHero(fi,cls,nameIdx){
  const names=HERO_NAMES[fi];const ni=nameIdx!=null?nameIdx:cls*6+Math.floor(Math.random()*6);
  const h={id:G.heroes.length,name:names[ni%12],fi,cls,port:ni%12,pid:-1,x:-1,y:-1,lvl:1,xp:0,
    a:cls?1:2+(Math.random()<.5?1:0),d:cls?1:2+(Math.random()<.5?1:0),sp:cls?2:1,kn:cls?2:1,mana:0,mp:0,army:padArmy([]),arts:[],skills:{},spells:cls?['chispa','bendicion']:['prisa'],alive:true,path:null,sleep:false,pend:null,visited:{}};
  const sk=pick(Math.random,SKILL_IDS);h.skills[sk]=1;
  const u=FDEF[fi].units;h.army[0]={id:u[0],n:irnd(Math.random,12,22)};h.army[1]={id:u[1],n:irnd(Math.random,5,10)};if(!cls)h.army[2]={id:u[2],n:irnd(Math.random,3,6)};
  h.mana=maxMana(h);G.heroes.push(h);return h;
}
function hstat(h){
  let a=h.a,d=h.d,sp=h.sp,kn=h.kn,mp=0,vis=0,gold=0;
  for(const id of h.arts){const b=ART[id].b;a+=b.a||0;d+=b.d||0;sp+=b.sp||0;kn+=b.kn||0;mp+=b.mp||0;vis+=b.vis||0;gold+=b.gold||0}
  const s=h.skills;return{a,d,sp,kn,mp,vis,gold,off:s.ataque||0,arch:s.arqueria||0,armor:s.armadura||0,wis:s.sabiduria||0,log:s.logistica||0,mys:s.misticismo||0,exp:s.exploracion||0,fin:s.finanzas||0,lead:(s.liderazgo||0)+(h.arts.includes('talisman_eras')?1:0),luck:(s.suerte||0)};
}
const maxMana=h=>{const s=hstat(h);return Math.round(s.kn*10*[1,1.25,1.5,2][s.wis])};
const MP_BASE=[1300,1360,1430,1500,1560,1630,1700,1760,1830,1900,1960,2000];
function maxMP(h){let sl=99;for(const u of h.army)if(u&&u.n>0)sl=Math.min(sl,CR[u.id].spd);if(sl===99)sl=4;const s=hstat(h);return Math.round(MP_BASE[Math.min(11,sl)]*(1+.1*s.log)+s.mp);}
const heroVis=h=>5+hstat(h).vis+hstat(h).exp;
function gainXp(h,x){
  if(x<=0)return;h.xp+=x;
  while(h.xp>=xpForLevel(h.lvl+1)){h.lvl++;
    const w=h.cls?[15,15,35,35]:[35,35,15,15];let t=Math.random()*100,k=0;for(;k<3;k++){t-=w[k];if(t<=0)break}
    [()=>h.a++,()=>h.d++,()=>h.sp++,()=>h.kn++][k]();
    const cand=SKILL_IDS.filter(s=>(h.skills[s]||0)<3);const opts=[];while(opts.length<2&&cand.length){opts.push(cand.splice(Math.floor(Math.random()*cand.length),1)[0])}
    const applySk=sk=>{if(sk){h.skills[sk]=(h.skills[sk]||0)+1}};
    if(isHuman(h.pid)&&opts.length>1)G.hooks.levelUp(h,opts,applySk);else applySk(aiPickSkill(h,opts));
    notify(`${h.name} sube a nivel ${h.lvl}`,'good');
  }
}
// ---------- ejércitos ----------
function addToArmy(arr,id,n){for(const s of arr)if(s&&s.id===id){s.n+=n;return true}for(let i=0;i<arr.length;i++)if(!arr[i]){arr[i]={id,n};return true}return false}
function mergeArmy(dst,src){for(let i=0;i<src.length;i++){const s=src[i];if(s&&addToArmy(dst,s.id,s.n))src[i]=null}}
const armyEmpty=a=>!a.some(s=>s&&s.n>0);
function sortArmy(a){const l=a.filter(s=>s&&s.n>0).sort((x,y)=>CR[y.id].val*y.n-CR[x.id].val*x.n);for(let i=0;i<7;i++)a[i]=l[i]||null}

// ---------- jugadores ----------
function newPlayer(id,fac,human,diff){
  const r=(human?DIFF[diff].res:DIFF[diff].ai);
  const res={gold:Math.round(10000*r),wood:Math.round(20*r),ore:Math.round(20*r),mercury:Math.round(10*r),sulfur:Math.round(10*r),crystal:Math.round(10*r),gems:Math.round(10*r)};
  return{id,fac,human,res,col:PCOL[id],name:PNAME[id],heroes:[],alive:true,fog:null,pool:[],ai:{}};
}
function newGame(idx,opt){
  const spec=mapSpec(idx);const map=genMap(spec,{fac0:opt.fac});G.map=map;G.opt=opt;G.day=1;G.cur=0;G.over=false;G.busy=false;G.heroes=[];G.players=[];
  G.hmap=new Int16Array(map.w*map.h);
  const hc=opt.color==null?0:opt.color;const cols=[hc];for(let i=0;i<8;i++)if(i!==hc)cols.push(i);
  for(let i=0;i<8;i++){const p=newPlayer(i,map.starts[i].fac,i===0,opt.diff);p.col=PCOL[cols[i]];p.name=PNAME[cols[i]];p.colIdx=cols[i];G.players.push(p)}
  for(const o of map.objs)if(o.t==='town')o.gar=padArmy(o.gar);
  const fog=new Uint8Array(map.w*map.h);G.players[0].fog=fog;
  G.players.forEach((p,i)=>{
    const st=map.starts[i],town=map.objs[st.town];town.owner=i;
    const h=makeHero(p.fac,Math.random()<.5?1:0);placeHero(h,i,town.x+town.ex,town.y+town.ey);refreshPool(p);
    h.mp=maxMP(h);h.mana=maxMana(h);
  });
  recomputeZoc();
  G.players.forEach(p=>refreshFog(p));
  return G;
}
function recomputeZoc(){const m=G.map,z=new Uint8Array(m.w*m.h);for(const o of m.objs){if(o.dead||o.t!=='mon')continue;for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++){const x=o.x+i,y=o.y+j;if(x>=0&&y>=0&&x<m.w&&y<m.h)z[y*m.w+x]++}}m.zoc=z}
function refreshPool(p){p.pool=[];for(let k=0;k<2;k++){const fi=k?Math.floor(Math.random()*8):p.fac;p.pool.push({fi,cls:Math.floor(Math.random()*2),nameIdx:Math.floor(Math.random()*12)})}}
function placeHero(h,pid,x,y){h.pid=pid;h.x=x;h.y=y;h.alive=true;h.path=null;G.hmap[mapIdx(x,y)]=h.id+1;if(!G.players[pid].heroes.includes(h.id))G.players[pid].heroes.push(h.id);if(G.players[pid].fog)reveal(G.players[pid],x,y,heroVis(h))}
function removeHero(h){if(h.x>=0&&G.hmap[mapIdx(h.x,h.y)]===h.id+1)G.hmap[mapIdx(h.x,h.y)]=0;const p=G.players[h.pid];if(p)p.heroes=p.heroes.filter(i=>i!==h.id);h.alive=false;h.x=-1;h.y=-1}
const heroAt=(x,y)=>{const v=G.hmap[mapIdx(x,y)];return v?G.heroes[v-1]:null};
function removeObj(o){o.dead=1;const m=G.map;for(let j=0;j<o.h;j++)for(let i=0;i<o.w;i++){const k=(o.y+j)*m.w+o.x+i;if(m.fp[k]===o.id+1)m.fp[k]=0;if(m.en[k]===o.id+1)m.en[k]=0}if(o.t==='mon')recomputeZoc()}
const objAt=(x,y)=>{const v=G.map.en[mapIdx(x,y)];return v?G.map.objs[v-1]:null};

// ---------- niebla ----------
function reveal(p,x,y,r){const f=p.fog;if(!f)return;const m=G.map,r2=r*r;for(let j=-r;j<=r;j++){const yy=y+j;if(yy<0||yy>=m.h)continue;for(let i=-r;i<=r;i++){if(i*i+j*j>r2)continue;const xx=x+i;if(xx>=0&&xx<m.w)f[yy*m.w+xx]=1}}}
function refreshFog(p){if(!p.fog)return;for(const hid of p.heroes){const h=G.heroes[hid];reveal(p,h.x,h.y,heroVis(h))}
  for(const o of G.map.objs){if(o.dead)continue;if(o.t==='town'&&o.owner===p.id)reveal(p,o.x+2,o.y+1,8);else if((o.t==='mine')&&o.owner===p.id)reveal(p,o.x+1,o.y+1,4)}}
function visSources(p){const s=[];for(const hid of p.heroes){const h=G.heroes[hid];s.push([h.x,h.y,heroVis(h)])}
  for(const o of G.map.objs){if(o.dead)continue;if(o.t==='town'&&o.owner===p.id)s.push([o.x+2,o.y+1,8]);else if(o.t==='mine'&&o.owner===p.id)s.push([o.x+1,o.y+1,4])}return s}

// ---------- economía ----------
function townUnit(t,tier){const u=FDEF[t.fi].units;return t.b['up'+tier]?u[tier-1+7]:u[tier-1]}
function incomeOf(p){
  const inc={gold:0,wood:0,ore:0,mercury:0,sulfur:0,crystal:0,gems:0};
  for(const o of G.map.objs){if(o.dead||o.owner!==p.id)continue;
    if(o.t==='town')inc.gold+=250+(o.b.hall2?500:0)+(o.b.hall3?1000:0);
    else if(o.t==='mine')inc[o.res]+=o.res==='gold'?1000:o.res==='wood'||o.res==='ore'?2:1}
  for(const hid of p.heroes){const h=G.heroes[hid],s=hstat(h);inc.gold+=s.gold+[0,250,500,1000][s.fin]}
  return inc;
}
function ownedTowns(pid){return G.map.objs.filter(o=>!o.dead&&o.t==='town'&&o.owner===pid)}
function ownedMines(pid){return G.map.objs.filter(o=>!o.dead&&o.t==='mine'&&o.owner===pid)}
function canBuild(t,b,p){
  if(t.b[b])return{ok:false,why:'Ya construido'};if(t.builtToday)return{ok:false,why:'Solo una construcción por día'};
  for(const r of bReq(b,t))if(!t.b[r])return{ok:false,why:'Requiere: '+bTitle(r,t.fi)};
  if(/^up\d$/.test(b)&&!t.b['dw'+b[2]])return{ok:false,why:'Requiere la vivienda'};
  if(!canAfford(p,bCost(b,t.fi)))return{ok:false,why:'Recursos insuficientes'};return{ok:true};
}
function build(t,b,p){const c=canBuild(t,b,p);if(!c.ok)return false;spend(p,bCost(b,t.fi));t.b[b]=1;t.builtToday=true;
  if(/^dw(\d)$/.test(b)){const tier=+b[2];if(!t.avail[tier-1])t.avail[tier-1]=CR[FDEF[t.fi].units[tier-1]].grow}
  return true}
function recruitCost(id,n){const c={};for(const k in CR[id].cost)c[k]=CR[id].cost[k]*n;return c}
function maxRecruit(p,id,avail){let n=avail;for(const k in CR[id].cost){n=Math.min(n,Math.floor(p.res[k]/CR[id].cost[k]))}return Math.max(0,n)}
function recruit(t,tier,n,p,hero){
  const id=townUnit(t,tier);n=Math.min(n,t.avail[tier-1],maxRecruit(p,id,n));if(n<=0)return 0;
  const arrs=hero?[hero.army,t.gar]:[t.gar];let ok=false;for(const a of arrs){if(addToArmy(a,id,n)){ok=true;break}}
  if(!ok)return 0;spend(p,recruitCost(id,n));t.avail[tier-1]-=n;return n;
}
function upgradeCostFor(t,slotArmy,i){const s=slotArmy[i];if(!s)return null;const c=CR[s.id];if(c.up||c.f<0)return null;const tier=c.tier;if(!t.b['up'+tier]||c.f!==t.fi)return null;
  const up=CR[FDEF[t.fi].units[tier-1+7]];const cost={};for(const k in up.cost)cost[k]=Math.max(0,(up.cost[k]-(c.cost[k]||0))*s.n);return{cost,id:up.id}}
function doUpgrade(p,t,arr,i){const u=upgradeCostFor(t,arr,i);if(!u||!canAfford(p,u.cost))return false;spend(p,u.cost);arr[i].id=u.id;return true}
function learnTownSpells(t,h){const gl=t.b.mage4?4:t.b.mage3?3:t.b.mage2?2:t.b.mage1?1:0;if(!gl)return[];const got=[];for(const s of t.spells)if(SPELLS[s].lv<=gl&&!h.spells.includes(s)){h.spells.push(s);got.push(s)}return got}
function hireHero(p,town,idx){
  const o=p.pool[idx];if(!o||p.res.gold<1500||p.heroes.length>=8)return null;
  const ex=town.x+town.ex,ey=town.y+town.ey;if(heroAt(ex,ey))return null;
  p.res.gold-=1500;let h;if(o.hero){h=o.hero;h.army=padArmy([{id:FDEF[h.fi].units[0],n:irnd(Math.random,6,12)}]);placeHero(h,p.id,ex,ey)}else{h=makeHero(o.fi,o.cls,o.nameIdx);placeHero(h,p.id,ex,ey)}
  h.mp=maxMP(h);h.mana=maxMana(h);
  p.pool.splice(idx,1);if(p.pool.length<2)p.pool.push({fi:Math.floor(Math.random()*8),cls:Math.floor(Math.random()*2),nameIdx:Math.floor(Math.random()*12)});return h;
}

// ---------- combate ----------
function mkSide(hero,army,pid,name){
  const hs=hero?hstat(hero):{a:0,d:0,sp:0,kn:0,off:0,arch:0,armor:0};
  return{hero,hs,army:padArmy(army),pid,human:isHuman(pid),name:name||(hero?hero.name:'Criaturas')};
}
// defensores de una ciudad: ejército del héroe + guarnición (máx. 7 grupos)
function townDefenders(t,hero){
  const list=[];if(hero)hero.army.forEach((s,i)=>{if(s&&s.n>0)list.push({s:{...s},src:'h',i})});t.gar.forEach((s,i)=>{if(s&&s.n>0)list.push({s:{...s},src:'g',i})});
  list.sort((a,b)=>CR[b.s.id].val*b.s.n-CR[a.s.id].val*a.s.n);return list.slice(0,7);
}
function runBattle(A,D,info,cb){
  // A,D: sides. cb(winnerSideIndex, battle)
  const humanIn=A.human||D.human;
  info=info||{};if(info.terr==null){const hh=A.hero||D.hero;info.terr=hh&&hh.x>=0?G.map.terr[hh.y*G.map.w+hh.x]:GRASS}
  const b=new Battle([A,D]);b.info=info;
  const done=()=>{
    const w=b.winner;const res=b.result();const xA=b.xpFor(0),xD=b.xpFor(1);
    cb(w,b,res,[xA,xD]);
  };
  if(humanIn&&G.hooks.battle!==undefined&&!G.headless)G.hooks.battle(b,done);else{b.autoPlay();done()}
}
function applyArmy(side,res,targetArmy){for(let i=0;i<7;i++)targetArmy[i]=res[i]?{id:res[i].id,n:res[i].n}:null}
// héroe contra monstruo
function fightMonster(h,mo,cb){
  const A=mkSide(h,h.army,h.pid),D=mkSide(null,[{id:mo.cr,n:mo.n}],-1,CR[mo.cr].name);
  runBattle(A,D,{type:'mon',mon:mo},(w,b,res,xp)=>{
    applyArmy(A,res[0],h.army);
    if(w===0){gainXp(h,xp[0]);removeObj(mo);cb(true)}
    else{const left=res[1][0];if(left)mo.n=left.n;if(b.fled===0)retreatHero(h);else heroDefeated(h);cb(false)}
  });
}
function retreatHero(h){const p=G.players[h.pid];removeHero(h);h.army=padArmy([]);p.pool.unshift({hero:h});notify(`${h.name} se retira del combate`,'bad');checkDefeat(h.pid)}
function surrenderCost(army){let g=0;for(const s of army)if(s&&s.n>0)g+=Math.floor(CR[s.id].cost.gold*s.n/2);return g}
function heroDefeated(h){const pid=h.pid;notify(`${h.name} ha sido derrotado`,'bad');removeHero(h);checkDefeat(pid)}
function fightHero(h,e,cb){
  const t=objAtTownTile(e);
  let defArmy=e.army,defSrc=null;
  if(t){defSrc=townDefenders(t,e);defArmy=defSrc.map(o=>o.s)}
  const A=mkSide(h,h.army,h.pid),D=mkSide(e,defArmy,e.pid);
  runBattle(A,D,{type:'hero',town:t},(w,b,res,xp)=>{
    applyArmy(A,res[0],h.army);
    if(defSrc){// repartir supervivientes
      defSrc.forEach((o,k)=>{const r=res[1][k];const arr=o.src==='h'?e.army:t.gar;arr[o.i]=r?{id:r.id,n:r.n}:null})}
    else applyArmy(D,res[1],e.army);
    if(w===0){gainXp(h,xp[0]+500);const pid=e.pid;if(b.fled===1)retreatHero(e);else{removeHero(e);checkDefeat(pid)}cb(true)}
    else{gainXp(e,xp[1]+500);if(b.fled===0)retreatHero(h);else heroDefeated(h);cb(false)}
  });
}
const objAtTownTile=h=>{const o=objAt(h.x,h.y);return o&&o.t==='town'&&o.owner===h.pid?o:null};
function fightTown(h,t,cb){
  const gh=heroAt(t.x+t.ex,t.y+t.ey);
  const defSrc=townDefenders(t,gh&&gh.pid===t.owner?gh:null);
  const A=mkSide(h,h.army,h.pid),D=mkSide(gh&&gh.pid===t.owner?gh:null,defSrc.map(o=>o.s),t.owner,t.name);
  runBattle(A,D,{type:'town',town:t},(w,b,res,xp)=>{
    applyArmy(A,res[0],h.army);
    defSrc.forEach((o,k)=>{const r=res[1][k];const arr=o.src==='h'?gh.army:t.gar;arr[o.i]=r?{id:r.id,n:r.n}:null});
    if(w===0){gainXp(h,xp[0]+500);const old=t.owner;const eh=gh&&gh.pid===old?gh:null;if(eh){removeHero(eh)}
      t.owner=h.pid;t.builtToday=true;t.gar=padArmy([]);notify(`${G.players[h.pid].name} conquista ${t.name}`,'good');checkDefeat(old);cb(true)}
    else{if(gh&&gh.pid===t.owner)gainXp(gh,xp[1]);if(b.fled===0)retreatHero(h);else heroDefeated(h);cb(false)}
  });
}
function checkDefeat(pid){
  if(pid<0)return;const p=G.players[pid];if(!p||!p.alive)return;
  if(ownedTowns(pid).length===0&&p.heroes.length===0){p.alive=false;notify(`${p.name} ha sido eliminado`,'bad');
    for(const o of G.map.objs)if(!o.dead&&o.owner===pid&&o.t==='mine')o.owner=-1;
    const alive=G.players.filter(q=>q.alive);if(!G.players[0].alive){G.over=true;G.hooks.gameOver(false)}else if(alive.length===1){G.over=true;G.hooks.gameOver(true)}}
}

// ---------- visitas a objetos ----------
function visit(h,o,cb){
  const p=G.players[h.pid],human=p.human,done=()=>{refreshFog(p);cb&&cb()};
  switch(o.t){
    case'res':p.res[o.res]+=o.n;notify(`${h.name} recoge ${o.n} ${RESN[o.res]}`,'good');removeObj(o);done();break;
    case'chest':{const lvl=Math.max(1,h.lvl);const gold=1000+lvl*100,xp=500+lvl*150;removeObj(o);
      const take=k=>{if(k==='gold'){p.res.gold+=gold;notify(`Cofre: ${gold} de oro`,'good')}else{gainXp(h,xp);notify(`Cofre: ${xp} de experiencia`,'good')}done()};
      if(human)G.hooks.askChest(h,{gold,xp},take);else take(h.lvl<8?'xp':'gold');break}
    case'art':{if(h.arts.length>=14){notify('Mochila llena','bad');done();break}h.arts.push(o.art);notify(`${h.name} encuentra: ${ART[o.art].n}`,'good');removeObj(o);done();break}
    case'mine':{if(o.owner!==h.pid){o.owner=h.pid;notify(`${p.name} captura una mina de ${RESN[o.res]}`,'good')}done();break}
    case'dwell':{if(human)G.hooks.dwell(o,h,done);else{aiBuyDwell(p,h,o);done()}break}
    case'town':{
      if(o.owner===h.pid){learnTownSpells(o,h);const mg=o.b.mage1;if(mg)h.mana=Math.max(h.mana,maxMana(h));
        if(human)G.hooks.town(o,h,done);else done()}
      else fightTown(h,o,won=>{if(won&&human)G.hooks.town(o,h,done);else done()});
      break}
    case'site':visitSite(h,o,p);done();break;
  }
}
function visitSite(h,o,p){
  const key=o.id;
  switch(o.k){
    case'shrine':if(h.visited[key]){notify('Ya has aprendido aquí','bad');return}h.visited[key]=1;if(!h.spells.includes(o.spell)){h.spells.push(o.spell);notify(`${h.name} aprende ${SPELLS[o.spell].n}`,'good')}else notify('Ya conocías el hechizo','bad');break;
    case'hut':if(h.visited[key]){notify('La bruja no tiene más que enseñar','bad');return}h.visited[key]=1;if((h.skills[o.skill]||0)<3){h.skills[o.skill]=(h.skills[o.skill]||0)+1;notify(`${h.name} aprende ${SKILLS[o.skill].n}`,'good')}else notify('Ya dominas esa habilidad','bad');break;
    case'well':if(h.visited.well===G.day){notify('El pozo está seco hoy','bad');return}h.visited.well=G.day;h.mana=Math.max(h.mana,maxMana(h)*2);notify('El pozo restaura tu maná','good');break;
    case'stone':if(h.visited[key]){notify('Ya has estudiado aquí','bad');return}h.visited[key]=1;gainXp(h,1000);notify('La piedra te otorga 1000 de experiencia','good');break;
    case'stable':if(h.visited[key]===G.day-G.day%7){notify('Los establos ya fueron usados esta semana','bad');return}h.visited[key]=G.day-G.day%7;h.mp+=400;notify('Los establos te dan movimiento extra','good');break;
    case'mill':if(o.used[p.id]===Math.floor((G.day-1)/7)){notify('El molino ya produjo esta semana','bad');return}o.used[p.id]=Math.floor((G.day-1)/7);{const r=['wood','ore'][o.id%2];p.res[r]+=5;p.res.gold+=500;notify(`El molino te da 500 de oro y 5 de ${RESN[r]}`,'good')}break;
  }
}
function aiBuyDwell(p,h,o){const c=CR[o.cr];const n=Math.min(o.n,maxRecruit(p,o.cr,o.n));if(n>0&&addToArmy(h.army,o.cr,n)){spend(p,recruitCost(o.cr,n));o.n-=n}}

// ---------- movimiento ----------
function planPath(h,x,y,extra){
  return findPath(G.map,h.x,h.y,x,y,{ok:(px,py)=>!G.hmap[py*G.map.w+px]&&(!extra||extra(px,py)),limit:60000});
}
function pathCostAdj(m,path){return path}
// ejecuta un paso; devuelve estado
function stepHero(h,cb){
  // cb(status): 'moved' | 'stop' | 'arrived' | 'dead'
  const st=h.path;if(!st||!st.length){cb('stop');return}
  const nx=st[0];const m=G.map;const cost=nx.c;
  if(h.mp<cost&&!(h.mp>=50&&nx.c<=h.mp+20)){cb('stop');return}
  const target=st.length===1;const oi=m.en[nx.y*m.w+nx.x];const obj=oi?m.objs[oi-1]:null;const eh=heroAt(nx.x,nx.y);
  const finish=(ok)=>{if(ok&&h.alive)cb(target?'arrived':'moved');else cb(h.alive?'stop':'dead')};
  // combate contra heroes enemigos
  if(eh&&eh!==h){if(eh.pid===h.pid){h.path=null;cb('stop');return}
    h.mp-=Math.min(h.mp,cost);h.path=null;
    // ¿héroe dentro de ciudad?
    fightHero(h,eh,won=>{if(won&&h.alive){moveTo(h,nx.x,nx.y)}cb(h.alive?'stop':'dead')});return}
  if(obj&&obj.t==='mon'){h.mp-=Math.min(h.mp,cost);h.path=null;fightMonster(h,obj,won=>{cb(won&&h.alive?'stop':'dead')});return}
  moveTo(h,nx.x,nx.y);h.mp=Math.max(0,h.mp-cost);st.shift();
  // zona de control
  if(m.zoc[nx.y*m.w+nx.x]){for(const[dx,dy]of D8){const x=nx.x+dx,y=nx.y+dy;if(x<0||y<0||x>=m.w||y>=m.h)continue;const o2=objAt(x,y);if(o2&&o2.t==='mon'&&!o2.dead){h.path=null;fightMonster(h,o2,won=>{
    if(won&&h.alive&&obj&&target){visit(h,obj,()=>cb('arrived'))}else cb(won&&h.alive?'stop':'dead')});return}}}
  if(obj&&target){h.path=null;visit(h,obj,()=>cb('arrived'));return}
  cb(target?'arrived':'moved');
}
function moveTo(h,x,y){const m=G.map;if(G.hooks.heroStep)G.hooks.heroStep(h,h.x,h.y,x,y);if(G.hmap[mapIdx(h.x,h.y)]===h.id+1)G.hmap[mapIdx(h.x,h.y)]=0;h.x=x;h.y=y;G.hmap[mapIdx(x,y)]=h.id+1;const p=G.players[h.pid];if(p.fog)reveal(p,x,y,heroVis(h))}
// ---------- turnos / días ----------
function startDayFor(p){
  for(const hid of p.heroes){const h=G.heroes[hid];h.mp=maxMP(h);h.sleep=false;const s=hstat(h);h.mana=Math.min(maxMana(h),h.mana+1+s.mys*2);
    const t=objAtTownTile(h);if(t&&t.b.mage1)h.mana=Math.max(h.mana,maxMana(h))}
  for(const t of ownedTowns(p.id))t.builtToday=false;
}
function endDayAll(){
  G.day++;
  for(const p of G.players){if(!p.alive)continue;const inc=incomeOf(p);const bonus=p.human?1:[.8,1,1.25,1.6][G.opt.diff==null?1:G.opt.diff];for(const k in inc)p.res[k]+=Math.round(inc[k]*bonus)}
  if((G.day-1)%7===0){ // semana nueva: crecimiento de criaturas
    for(const o of G.map.objs){if(o.dead)continue;
      if(o.t==='town'){const mul=1+(o.b.fort2?.5:0)+(o.b.fort3?.5:0);for(let t=1;t<=7;t++)if(o.b['dw'+t])o.avail[t-1]+=Math.round(CR[FDEF[o.fi].units[t-1]].grow*mul)}
      else if(o.t==='dwell')o.n+=CR[o.cr].grow}
    for(const p of G.players)refreshPool(p);
    notify(`Comienza la semana ${Math.floor((G.day-1)/7)+1}`);
  }
}
// ---------- IA ----------
const defer=fn=>{if(G.sync)fn();else setTimeout(fn,0)};
function sizeVal(o){return CR[o.cr].val*o.n}
function aiPlayerTurn(p,done){
  startDayFor(p);aiTowns(p);aiTrade(p);
  const hs=p.heroes.map(i=>G.heroes[i]).sort((a,b)=>armyPower(b.army)-armyPower(a.army));let i=0;
  const nextHero=()=>{if(G.over)return;if(i>=hs.length){aiTowns(p);return done()}
    const h=hs[i++];if(!h.alive)return defer(nextHero);heroLoop(p,h,0,()=>defer(nextHero))};
  defer(nextHero);
}
function heroLoop(p,h,guard,cb){
  if(!h.alive||h.mp<150||guard>8||G.over)return cb();
  aiHeroAct(p,h,acted=>{if(!acted)cb();else defer(()=>heroLoop(p,h,guard+1,cb))});
}
function runPath(h,done){
  const next=()=>{let sync=true,got=null;
    const handle=s=>{if(s==='moved')return next();done(s)};
    stepHero(h,s=>{if(sync)got=s;else handle(s)});sync=false;if(got!==null)handle(got)};
  next();
}
// simulación rápida de un combate para decidir si merece la pena
function evalFight(h,enemyArmy,enemyHero,n=2){
  let wins=0,loss=0;const mine=armyPower(h.army)||1;
  for(let k=0;k<n;k++){
    const hc={...h,mana:h.mana,spells:h.spells.slice()};const ec=enemyHero?{...enemyHero,mana:enemyHero.mana,spells:enemyHero.spells.slice()}:null;
    const A=mkSide(hc,h.army,h.pid),D=mkSide(ec,enemyArmy,enemyHero?enemyHero.pid:-1);A.human=false;D.human=false;
    const b=new Battle([A,D]);b.autoPlay();const res=b.result()[0];if(b.winner===0)wins++;loss+=1-armyPower(res)/mine}
  return{win:wins/n,loss:loss/n};
}
function dangerMask(h,power){
  const m=G.map,d=new Uint8Array(m.w*m.h);
  for(const o of m.objs){if(o.dead||o.t!=='mon')continue;if(sizeVal(o)*1.15<power)continue;for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++){const x=o.x+i,y=o.y+j;if(x>=0&&y>=0&&x<m.w&&y<m.h)d[y*m.w+x]=1}}
  return d;
}
const SK_PREF=[['ataque','armadura','logistica','liderazgo','finanzas','arqueria','suerte','exploracion','sabiduria','misticismo'],['sabiduria','misticismo','logistica','liderazgo','armadura','finanzas','exploracion','suerte','ataque','arqueria']];
function aiPickSkill(h,opts){const pref=SK_PREF[h.cls];return opts.slice().sort((a,b)=>pref.indexOf(a)-pref.indexOf(b))[0]}
function aiTrade(p){
  const towns=ownedTowns(p.id);if(!towns.some(t=>t.b.market))return;
  for(const r of RES){if(r==='gold')continue;const keep=r==='wood'||r==='ore'?30:15;
    if(p.res[r]>keep+10){const sell=p.res[r]-keep;const gold=Math.floor(sell*RV[r]*.8);p.res[r]-=sell;p.res.gold+=gold}}
  // comprar recursos que bloquean la construcción más importante
  const t=towns[0];if(t&&p.res.gold>4000)for(const b of['dw4','dw5','dw6','dw7','mage1']){if(t.b[b]||!canBuild(t,b,p).ok&&bReq(b,t).some(x=>!t.b[x]))continue;const c=bCost(b,t.fi);
    for(const r in c)if((p.res[r]||0)<c[r]){const need=c[r]-p.res[r],cost=Math.ceil(need*RV[r]/.8);if(p.res.gold>=cost+2000){p.res.gold-=cost;p.res[r]+=need}}break}
}
function aiUpgradeArmy(p,t,arr){for(let i=0;i<7;i++){const u=upgradeCostFor(t,arr,i);if(u&&canAfford(p,u.cost)&&p.res.gold>u.cost.gold+1500)doUpgrade(p,t,arr,i)}}
function aiTowns(p){
  const towns=ownedTowns(p.id);const rich=p.res.gold>12000;
  const order=['tavern','dw1','dw2','dw3','hall2','dw4','mage1','dw5','up1','up2','up3','dw6','hall3','up4','up5','dw7','market','fort1','fort2','up6','up7','fort3','mage2','mage3'];
  towns.sort((a,b)=>Object.keys(b.b).length-Object.keys(a.b).length);
  for(const t of towns){
    if(!t.builtToday){const ord=G.day>10?['hall2',...order]:order;for(const b of ord){const cb=canBuild(t,b,p);if(cb.ok&&(b!=='hall3'||p.res.gold>12000)){build(t,b,p);break}}}
    const hero=heroAt(t.x+t.ex,t.y+t.ey);const mine=hero&&hero.pid===p.id?hero:null;
    for(let tier=7;tier>=1;tier--){if(!t.b['dw'+tier])continue;const id=townUnit(t,tier);const n=maxRecruit(p,id,t.avail[tier-1]);if(n>0)recruit(t,tier,n,p,mine)}
    aiUpgradeArmy(p,t,t.gar);if(mine){aiUpgradeArmy(p,t,mine.army);mergeArmy(mine.army,t.gar);sortArmy(mine.army)}
    if(p.heroes.length<Math.min(2+Math.floor(G.day/9),6)&&t.b.tavern&&!heroAt(t.x+t.ex,t.y+t.ey)&&p.res.gold>=2200){const h=hireHero(p,t,0);if(h){mergeArmy(h.army,t.gar);sortArmy(h.army)}}
  }
}
function threatsTo(p,t){let power=0,who=[];for(const q of G.players){if(q.id===p.id||!q.alive)continue;for(const hid of q.heroes){const e=G.heroes[hid];if(Math.hypot(e.x-(t.x+2),e.y-(t.y+1))<=16){power+=armyPower(e.army);who.push(e)}}}return{power,who}}
function aiHeroAct(p,h,cb){
  const m=G.map,power=armyPower(h.army),dif=G.opt.diff==null?1:G.opt.diff,aggr=[.9,.8,.7,.6][dif];
  const lowArmy=power<250+G.day*30;const danger=dangerMask(h,power);const cands=[];
  const myTowns=ownedTowns(p.id);
  // 1. defensa de ciudades amenazadas
  const inTown=objAtTownTile(h);
  for(const t of myTowns){const th=threatsTo(p,t);if(!th.who.length)continue;const gp=armyPower(t.gar)+power*0.5;
    if(th.power>gp*.7){const d=Math.hypot(h.x-t.x,h.y-t.y);const closest=!myTowns.length||p.heroes.every(id=>{const o=G.heroes[id];return o===h||Math.hypot(o.x-t.x,o.y-t.y)>=d});
      if(closest){if(inTown===t){// ya estoy: ataca al enemigo cercano si lo supero, si no me quedo
          const e=th.who.sort((a,b)=>Math.hypot(a.x-h.x,a.y-h.y)-Math.hypot(b.x-h.x,b.y-h.y))[0];
          if(Math.hypot(e.x-h.x,e.y-h.y)<=8&&evalFight(h,e.army,e,2).win>=.7)cands.push({o:{x:e.x,y:e.y,ex:0,ey:0},v:1e6,hero:e});else{h.mp=0;return cb(false)}}
        else cands.push({o:{x:t.x+t.ex,y:t.y+t.ey,ex:0,ey:0},v:5e5/(1+d)})}}}
  for(const o of m.objs){
    if(o.dead)continue;const d=Math.hypot(o.x+o.ex-h.x,o.y+o.ey-h.y);if(d>90&&h.mp<1400)continue;let val=0;
    switch(o.t){
      case'res':val=(o.res==='gold'?o.n:o.n*220);break;
      case'chest':val=900;break;
      case'art':val=1700;break;
      case'mine':if(o.owner!==p.id)val=(o.res==='gold'?3800:2400)*(o.owner>=0?1.4:1);break;
      case'dwell':{const c=CR[o.cr];if(o.n>0&&p.res.gold>=c.cost.gold*2)val=300+o.n*c.val*1.5;break}
      case'mon':{const mp=sizeVal(o);if(power>mp*1.25)val=200+mp*.6+CR[o.cr].hp*o.n*.2;else val=-1;break}
      case'town':if(o.owner===p.id){if(lowArmy&&o.gar.some(s=>s))val=2600;else if(o.b.mage1&&h.mana<maxMana(h)*.4)val=500}
        else{const eh=heroAt(o.x+o.ex,o.y+o.ey);const gp=armyPower(o.gar)+(eh?armyPower(eh.army)*1.2:0);if(o.owner>=0&&G.day<9)val=-1;else if(power>gp*1.3)val=o.owner>=0?9000:6000;else val=-1}break;
      case'site':{if(o.k==='well'){if(h.mana<maxMana(h)*.5&&h.visited.well!==G.day)val=600}else if(!h.visited[o.id])val=o.k==='stone'?1200:o.k==='stable'?200:o.k==='mill'?800:700;break}
    }
    if(val>0)cands.push({o,v:val/(8+d)});
  }
  for(const q of G.players)if(q.id!==p.id&&q.alive)for(const hid of q.heroes){const e=G.heroes[hid];const d=Math.hypot(e.x-h.x,e.y-h.y);if(d<45&&power>armyPower(e.army)*1.2)cands.push({o:{x:e.x,y:e.y,ex:0,ey:0},v:4000/(8+d),hero:e})}
  cands.sort((a,b)=>b.v-a.v);
  const finish=(s)=>{const t=objAtTownTile(h);if(t&&h.alive){mergeArmy(h.army,t.gar);sortArmy(h.army);learnTownSpells(t,h);if(t.b.mage1)h.mana=Math.max(h.mana,maxMana(h))}
    cb(h.alive&&s!=='dead')};
  let tries=0;
  for(const c of cands){
    if(tries>=6)break;
    const tx=c.o.x+c.o.ex,ty=c.o.y+c.o.ey;
    const path=planPath(h,tx,ty,(x,y)=>!danger[y*m.w+x]||(Math.abs(x-tx)<=1&&Math.abs(y-ty)<=1));if(!path){tries++;continue}
    // comprobar el combate con una simulación
    const ob=c.o.t==='mon'?c.o:c.o.t==='town'&&c.o.owner!==p.id?c.o:null;
    if(c.hero||ob){tries++;let enemyArmy,enemyHero=null;
      if(c.hero){enemyArmy=c.hero.army;enemyHero=c.hero}else if(ob.t==='mon')enemyArmy=[{id:ob.cr,n:ob.n}];else{const eh=heroAt(ob.x+ob.ex,ob.y+ob.ey);enemyHero=eh&&eh.pid===ob.owner?eh:null;enemyArmy=townDefenders(ob,enemyHero).map(o=>o.s)}
      const r=evalFight(h,padArmy(enemyArmy),enemyHero,2);const need=c.v>=1e5?.5:aggr;
      if(r.win<need||(r.loss>.55&&c.o.t==='mon'&&r.win<1))continue}
    h.path=path;runPath(h,finish);return;
  }
  // sin objetivos útiles: explorar hacia un punto lejano seguro, o volver a casa
  if(lowArmy&&myTowns.length&&!inTown){const t=myTowns[0];const path=planPath(h,t.x+t.ex,t.y+t.ey,(x,y)=>!danger[y*m.w+x]);if(path){h.path=path;runPath(h,finish);return}}
  const rx=Math.floor(Math.random()*(m.w-8)+4),ry=Math.floor(Math.random()*(m.h-8)+4);
  const path=planPath(h,rx,ry,(x,y)=>!danger[y*m.w+x]);
  if(path){h.path=path.slice(0,40);runPath(h,finish);return}
  cb(false);
}
// ---------- guardado ----------
function saveState(){
  const m=G.map;return JSON.stringify({idx:m.spec.i,opt:G.opt,day:G.day,cur:G.cur,
    players:G.players.map(p=>({...p,fog:null})),fog:G.players[0].fog?packFog(G.players[0].fog):null,
    heroes:G.heroes,objs:m.objs.map(o=>o.dead?{dead:1,id:o.id}:o)});
}
function packFog(f){let s='';const out=[];for(let i=0;i<f.length;i+=8){let b=0;for(let k=0;k<8;k++)if(f[i+k])b|=1<<k;out.push(b)}for(let i=0;i<out.length;i+=4096)s+=String.fromCharCode.apply(null,out.slice(i,i+4096));return btoa(s)}
function unpackFog(s,n){const raw=atob(s),f=new Uint8Array(n);for(let i=0;i<raw.length;i++){const b=raw.charCodeAt(i);for(let k=0;k<8;k++)if(b&(1<<k))f[i*8+k]=1}return f}
function loadState(str){
  const d=JSON.parse(str);const spec=mapSpec(d.idx);const map=genMap(spec,{fac0:d.opt.fac});G.map=map;G.opt=d.opt;G.day=d.day;G.cur=d.cur;G.over=false;G.busy=false;
  // sustituir objetos dinámicos
  for(const o of d.objs){if(o.dead){const real=map.objs[o.id];if(real&&!real.dead)removeObj(real)}else Object.assign(map.objs[o.id],o)}
  for(const o of map.objs)if(!o.dead&&o.t==='town')o.gar=padArmy(o.gar);
  G.heroes=d.heroes;G.players=d.players;G.hmap=new Int16Array(map.w*map.h);
  for(const h of G.heroes)if(h.alive&&h.x>=0)G.hmap[mapIdx(h.x,h.y)]=h.id+1;
  G.players[0].fog=d.fog?unpackFog(d.fog,map.w*map.h):new Uint8Array(map.w*map.h);
  for(let i=1;i<G.players.length;i++)G.players[i].fog=null;
  recomputeZoc();return G;
}
