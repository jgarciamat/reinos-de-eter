'use strict';
// =====================================================================
//  Lógica del juego: jugadores, héroes, ciudades, movimiento, IA, guardado
//  (sin DOM — la interfaz se engancha mediante G.hooks)
// =====================================================================
const G={map:null,players:[],heroes:[],day:1,cur:0,over:false,busy:false,opt:{},hmap:null,zoc:null,
  hooks:{notify(){},askChest(h,cb){cb('gold')},battle(b,cb){b.autoPlay();cb()},levelUp(h,opts,cb){cb(opts[0])},dwell(o,h,cb){cb()},town(t,h,cb){cb()},shop(o,h,cb){cb()},gameOver(){},msg(){}}};
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
const SK_CLASS_ONLY={necromancia:[2]};
function rollSpec(fi){const r=Math.random();
  if(r<.42)return{t:'creature',id:FDEF[fi].units[Math.floor(Math.random()*4)]};
  if(r<.68)return{t:'skill',id:pick(Math.random,SKILL_IDS.filter(s=>s!=='necromancia'))};
  if(r<.84)return{t:'res',id:pick(Math.random,SPEC_RES)};
  return{t:'spell',id:pick(Math.random,SPELL_IDS)}}
function specText(h){const s=h.spec;if(!s)return'—';if(s.t==='creature')return`Especialista en ${CR[s.id].name}: +1 de ataque y defensa cada 6 niveles`;if(s.t==='skill')return`Especialista en ${SKILLS[s.id].n}: cuenta un nivel más desde el nivel 5`;
  if(s.t==='res')return s.id==='gold'?'Especialista en oro: +350 de oro al día':`Produce 1 de ${RESN[s.id]} al día`;return`Especialista en ${SPELLS[s.id].n}: +5% de efecto por nivel`}
// ---- campeones únicos: 20 por castillo, ninguno repetido en toda la partida ----
const HN=20,HIRE_COST=2500;
function heroKey(fi,ni){return fi*100+ni}
function freeName(fi,pref){const used=G.usedH||(G.usedH={});const all=[];for(let i=0;i<HN;i++)if(!used[heroKey(fi,i)])all.push(i);if(!all.length)return Math.floor(Math.random()*HN);
  if(pref!=null&&all.includes(pref%HN))return pref%HN;return all[Math.floor(Math.random()*all.length)]}
function mkChamp(fi){ // campeón de taberna: 2 habilidades (nivel 1-3) y ejército inicial pequeño de nivel 1 y 2
  const ni=freeName(fi),cls=ni%2;(G.usedH=G.usedH||{})[heroKey(fi,ni)]='pool';
  const pool=SK_PREF[cls].filter(s=>!SK_CLASS_ONLY[s]||SK_CLASS_ONLY[s].includes(fi));const sk=[];
  while(sk.length<2){const s=pool[irnd(Math.random,0,Math.min(9,pool.length-1))];if(!sk.some(q=>q[0]===s))sk.push([s,1+Math.floor(Math.random()*3)])}
  return{fi,cls,ni,sk,spec:rollSpec(fi),a:cls?1:2+(Math.random()<.5?1:0),d:cls?1:2+(Math.random()<.5?1:0),sp:cls?2:1,kn:cls?2:1,n1:irnd(Math.random,6,12),n2:irnd(Math.random,2,5)};
}
function makeHero(fi,cls,nameIdx,pre){
  const names=HERO_NAMES[fi];const ni=pre?pre.ni:freeName(fi,nameIdx);(G.usedH=G.usedH||{})[heroKey(fi,ni)]='hero';
  const h={id:G.heroes.length,name:names[ni%HN],fi,cls,port:ni%HN,pid:-1,x:-1,y:-1,lvl:1,xp:0,boat:false,
    a:pre?pre.a:cls?1:2+(Math.random()<.5?1:0),d:pre?pre.d:cls?1:2+(Math.random()<.5?1:0),sp:pre?pre.sp:cls?2:1,kn:pre?pre.kn:cls?2:1,mana:0,mp:0,army:padArmy([]),eq:newEquip(),pack:[],skills:{},spells:cls?['chispa','bendicion']:['prisa'],alive:true,path:null,sleep:false,pend:null,visited:{},spec:pre?pre.spec:rollSpec(fi)};
  const pool=SK_PREF[cls].filter(s=>!SK_CLASS_ONLY[s]||SK_CLASS_ONLY[s].includes(fi));
  if(pre)for(const[k,l]of pre.sk)h.skills[k]=l;else{h.skills[pool[irnd(Math.random,0,3)]]=1;h.skills[pool[irnd(Math.random,4,9)]]=1}
  if(fi===2&&!pre)h.skills.necromancia=1;if(h.spec.t==='skill'&&!h.skills[h.spec.id]&&Object.keys(h.skills).length<3)h.skills[h.spec.id]=1;
  if(h.spec.t==='spell'&&!h.spells.includes(h.spec.id)&&SPELLS[h.spec.id].lv<=2)h.spells.push(h.spec.id);
  const u=FDEF[fi].units;if(pre){h.army[0]={id:u[0],n:pre.n1};h.army[1]={id:u[1],n:pre.n2}}else{h.army[0]={id:u[0],n:irnd(Math.random,12,22)};h.army[1]={id:u[1],n:irnd(Math.random,5,10)};if(!cls)h.army[2]={id:u[2],n:irnd(Math.random,3,6)}}
  h.mana=maxMana(h);G.heroes.push(h);return h;
}
function sk(h,id){let lv=h.skills[id]||0;if(lv&&h.spec&&h.spec.t==='skill'&&h.spec.id===id&&h.lvl>=5)lv=Math.min(3,lv+1);return lv}
function hstat(h){
  const b=artBonus(h);
  const sch={fuego:sk(h,'fuego'),agua:sk(h,'agua'),tierra:sk(h,'tierra'),aire:sk(h,'aire')};
  const resB={};for(const r of SPEC_RES)resB[r]=(b[r]||0)+(h.spec&&h.spec.t==='res'&&h.spec.id===r&&r!=='gold'?1:0);if(h.spec&&h.spec.t==='res'&&h.spec.id==='gold')resB.gold=350;
  return{a:h.a+(b.a||0),d:h.d+(b.d||0),sp:h.sp+(b.sp||0),kn:h.kn+(b.kn||0),mp:b.mp||0,mpw:b.mpw||0,vis:(b.vis||0)+sk(h,'exploracion'),exp:0,
    gold:(b.gold||0)+[0,125,250,500][sk(h,'finanzas')],resB,off:sk(h,'ataque'),arch:sk(h,'arqueria'),armor:sk(h,'armadura'),tact:sk(h,'tacticas'),log:sk(h,'logistica'),pf:b.pf?3:sk(h,'orientacion'),nav:sk(h,'navegacion'),
    lead:sk(h,'liderazgo')+(b.mor||0)+(h.tmp&&h.tmp.mor||0),luck:sk(h,'suerte')+(b.luck||0)+(h.tmp&&h.tmp.luck||0),dipLv:sk(h,'diplomacia'),dipA:(b.dip||0)+sk(h,'diplomacia')*8,lear:sk(h,'aprendizaje'),int:sk(h,'inteligencia'),mys:sk(h,'misticismo'),wis:sk(h,'sabiduria'),
    sorc:sk(h,'hechiceria'),resi:Math.min(90,[0,5,10,20][sk(h,'resistencia')]+(b.res||0)),eagle:[0,20,30,40][sk(h,'ojo_aguila')]+(b.eagle||0),necro:sk(h,'necromancia'),necroB:b.necro||0,med:sk(h,'medicina'),
    sch,schA:{fuego:b.sf||0,agua:b.sw||0,tierra:b.se||0,aire:b.sa||0},manaR:b.mana||0,spdB:b.spd||0,hpB:b.hp||0,xpB:b.xp||0,fin:0};
}
const maxMana=h=>{const s=hstat(h);return Math.round(Math.max(1,s.kn)*10*[1,1.25,1.5,2][s.int])};
const MP_BASE=[1300,1360,1430,1500,1560,1630,1700,1760,1830,1900,1960,2000];
function maxMP(h){const s=hstat(h);if(h.boat)return Math.round(1500*(1+.5*s.nav)+s.mpw+(typeof lighthouses==='function'&&lighthouses(h.pid)?500:0));let sl=99;for(const u of h.army)if(u&&u.n>0)sl=Math.min(sl,CR[u.id].spd+s.spdB);if(sl===99)sl=4;return Math.round(MP_BASE[Math.max(0,Math.min(11,sl))]*(1+.1*s.log)+s.mp);}
const heroVis=h=>5+hstat(h).vis;
function skillOffers(h){
  const pref=SK_PREF[h.cls];const pool=SKILL_IDS.filter(s=>(h.skills[s]||0)<3&&(!SK_CLASS_ONLY[s]||SK_CLASS_ONLY[s].includes(h.fi))&&((h.skills[s]||0)>0||Object.keys(h.skills).length<8));
  const w=s=>{const base=pref.includes(s)?(14-pref.indexOf(s)):3;return base*((h.skills[s]||0)>0?1.7:1)};
  const opts=[];while(opts.length<2&&pool.length){const tot=pool.reduce((a,x)=>a+w(x),0);let t=Math.random()*tot,k=0;for(;k<pool.length-1;k++){t-=w(pool[k]);if(t<=0)break}opts.push(pool.splice(k,1)[0])}
  return opts}
function gainXp(h,x){
  if(x<=0)return;const st=hstat(h);x=Math.round(x*(1+st.lear*.05+st.xpB/100));h.xp+=x;
  while(h.xp>=xpForLevel(h.lvl+1)){h.lvl++;
    const w=h.cls?[15,15,35,35]:[35,35,15,15];let t=Math.random()*100,k=0;for(;k<3;k++){t-=w[k];if(t<=0)break}
    [()=>h.a++,()=>h.d++,()=>h.sp++,()=>h.kn++][k]();
    const opts=skillOffers(h);
    const applySk=sk2=>{if(sk2&&(h.skills[sk2]||0)<3){h.skills[sk2]=(h.skills[sk2]||0)+1}};
    if(opts.length){if(isHuman(h.pid)&&opts.length>1)G.hooks.levelUp(h,opts,applySk);else applySk(aiPickSkill(h,opts))}
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
  const spec=mapSpec(idx);const map=genMap(spec,{fac0:opt.fac});G.map=map;snapMap(map);G.opt=opt;G.slot=null;G.day=1;G.cur=0;G.over=false;G.busy=false;G.heroes=[];G.players=[];G.usedH={};G.qdone=0;G.vdone=false;G.week={t:'normal',week:1};G.gid='g'+Date.now().toString(36)+Math.random().toString(36).slice(2,6);G.quick=G.quick||false;
  G.hmap=new Int16Array(map.w*map.h);
  const hc=opt.color==null?0:opt.color;const cols=[hc];for(let i=0;i<8;i++)if(i!==hc)cols.push(i);
  for(let i=0;i<8;i++){const p=newPlayer(i,map.starts[i].fac,i===0,opt.diff);p.col=PCOL[cols[i]];p.name=PNAME[cols[i]];p.colIdx=cols[i];G.players.push(p)}
  for(const o of map.objs)if(o.t==='town')o.gar=padArmy(o.gar);
  const fog=new Uint8Array(map.w*map.h);G.players[0].fog=fog;
  G.players.forEach((p,i)=>{
    const st=map.starts[i],town=map.objs[st.town];town.owner=i;if(st.town2!=null)map.objs[st.town2].owner=i;for(const k in p.res)p.res[k]=Math.round(p.res[k]*(spec.startK||1));
    const h=makeHero(p.fac,Math.random()<.5?1:0);placeHero(h,i,town.x+town.ex,town.y+town.ey);refreshPool(p);
    h.mp=maxMP(h);h.mana=maxMana(h);
  });
  recomputeZoc();
  G.players.forEach(p=>refreshFog(p));
  return G;
}
function recomputeZoc(){const m=G.map,z=new Uint8Array(m.w*m.h),dm=new Float32Array(m.w*m.h);for(const o of objsOfType('mon')){if(o.dead)continue;const sv=sizeVal(o);for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++){const x=o.x+i,y=o.y+j;if(x>=0&&y>=0&&x<m.w&&y<m.h){const k=y*m.w+x;z[k]++;if(sv>dm[k])dm[k]=sv}}}m.zoc=z;m.dmax=dm}
// recalcula el valor máximo de manada que cubre cada casilla alrededor de o (tras quitarla o cambiar su tamaño)
function dmaxAround(o){const m=G.map;if(!m.dmax)return;for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++){const x=o.x+i,y=o.y+j;if(x<0||y<0||x>=m.w||y>=m.h)continue;let best=0;
  for(let b=-1;b<=1;b++)for(let a=-1;a<=1;a++){const xx=x+a,yy=y+b;if(xx<0||yy<0||xx>=m.w||yy>=m.h)continue;const v=m.en[yy*m.w+xx];if(!v)continue;const q=m.objs[v-1];if(q.t==='mon'&&!q.dead){const sv=sizeVal(q);if(sv>best)best=sv}}
  m.dmax[y*m.w+x]=best}}
function poolKeep(p){return(p.pool||[]).filter(o=>o.hero)}
function refreshPool(p){ // cada semana cambian los campeones de la taberna
  for(const o of p.pool||[])if(!o.hero&&G.usedH)delete G.usedH[heroKey(o.fi,o.ni)];
  p.pool=poolKeep(p);fillPool(p)}
function fillPool(p){let g=0;while(p.pool.filter(o=>!o.hero).length<3&&g++<9)p.pool.push(mkChamp(Math.random()<.6?p.fac:Math.floor(Math.random()*8)))}
function placeHero(h,pid,x,y){h.pid=pid;h.x=x;h.y=y;h.alive=true;h.path=null;G.hmap[mapIdx(x,y)]=h.id+1;if(!G.players[pid].heroes.includes(h.id))G.players[pid].heroes.push(h.id);if(G.players[pid].fog)reveal(G.players[pid],x,y,heroVis(h))}
function removeHero(h){if(h.x>=0&&G.hmap[mapIdx(h.x,h.y)]===h.id+1)G.hmap[mapIdx(h.x,h.y)]=0;const p=G.players[h.pid];if(p)p.heroes=p.heroes.filter(i=>i!==h.id);h.alive=false;h.x=-1;h.y=-1}
const heroAt=(x,y)=>{const v=G.hmap[mapIdx(x,y)];return v?G.heroes[v-1]:null};
function removeObj(o){const wasDead=o.dead;o.dead=1;const m=G.map;for(let j=0;j<o.h;j++)for(let i=0;i<o.w;i++){const k=(o.y+j)*m.w+o.x+i;if(m.fp[k]===o.id+1)m.fp[k]=0;if(m.en[k]===o.id+1)m.en[k]=0}if(o.t==='mon'&&m.zoc&&!wasDead){for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++){const x=o.x+i,y=o.y+j;if(x>=0&&y>=0&&x<m.w&&y<m.h)m.zoc[y*m.w+x]--}dmaxAround(o)}}
const objAt=(x,y)=>{const v=G.map.en[mapIdx(x,y)];return v?G.map.objs[v-1]:null};

// ---------- niebla ----------
function reveal(p,x,y,r){const f=p.fog;if(!f)return;const m=G.map,r2=r*r;for(let j=-r;j<=r;j++){const yy=y+j;if(yy<0||yy>=m.h)continue;for(let i=-r;i<=r;i++){if(i*i+j*j>r2)continue;const xx=x+i;if(xx>=0&&xx<m.w)f[yy*m.w+xx]=1}}}
function refreshFog(p){if(!p.fog)return;for(const hid of p.heroes){const h=G.heroes[hid];reveal(p,h.x,h.y,heroVis(h))}
  for(const o of G.map.objs){if(o.dead)continue;if(o.t==='town'&&o.owner===p.id)reveal(p,o.x+2,o.y+1,8);else if((o.t==='mine')&&o.owner===p.id)reveal(p,o.x+1,o.y+1,4)}}
function visSources(p){const s=[];for(const hid of p.heroes){const h=G.heroes[hid];s.push([h.x,h.y,heroVis(h)])}
  for(const o of objsWhere('own',o=>o.t==='town'||o.t==='mine')){if(o.dead)continue;if(o.t==='town'&&o.owner===p.id)s.push([o.x+2,o.y+1,8]);else if(o.t==='mine'&&o.owner===p.id)s.push([o.x+1,o.y+1,4])}return s}

// ---------- economía ----------
function townUnit(t,tier){const u=FDEF[t.fi].units;return t.b['up'+tier]?u[tier-1+7]:u[tier-1]}
function incomeOf(p){
  const inc={gold:0,wood:0,ore:0,mercury:0,sulfur:0,crystal:0,gems:0};
  for(const o of objsWhere('own',o=>o.t==='town'||o.t==='mine')){if(o.dead||o.owner!==p.id)continue;
    if(o.t==='town')inc.gold+=250+(o.b.hall2?500:0)+(o.b.hall3?1000:0);
    else if(o.t==='mine')inc[o.res]+=o.res==='gold'?1000:o.res==='wood'||o.res==='ore'?2:1}
  for(const hid of p.heroes){const h=G.heroes[hid],s=hstat(h);inc.gold+=s.gold;for(const r of SPEC_RES)inc[r]+=s.resB[r]||0}
  return inc;
}
// lista filtrada y cacheada de objetos (se invalida si cambia el nº de objetos)
function objsWhere(key,fn){const m=G.map,c=m._ow||(m._ow={}),e=c[key];if(e&&e.n===m.objs.length)return e.l;const l=m.objs.filter(fn);c[key]={n:m.objs.length,l};return l}
function objsOfType(t){const m=G.map,c=m._ot||(m._ot={}),e=c[t];if(e&&e.n===m.objs.length)return e.l;const l=m.objs.filter(o=>o.t===t);c[t]={n:m.objs.length,l};return l}
// cuantos más mercados tenga el jugador, mejor tasa de cambio: 80% con uno, +3% por cada mercado extra, tope 95%
function marketCount(pid){return ownedTowns(pid).filter(t=>t.b.market).length}
function marketEff(pid){const n=marketCount(pid);return n<1?.8:Math.min(.95,.8+.03*(n-1))}
function ownedTowns(pid){return objsOfType('town').filter(o=>!o.dead&&o.owner===pid)}
function ownedMines(pid){return objsOfType('mine').filter(o=>!o.dead&&o.owner===pid)}
function canBuild(t,b,p){
  if(t.b[b])return{ok:false,why:'Ya construido'};if(t.builtToday)return{ok:false,why:'Solo una construcción por día'};
  for(const r of bReq(b,t))if(!t.b[r])return{ok:false,why:'Requiere: '+bTitle(r,t.fi)};
  if(/^up\d$/.test(b)&&!t.b['dw'+b[2]])return{ok:false,why:'Requiere la vivienda'};
  if(b==='shipyard'&&!t.dock)return{ok:false,why:'La ciudad no está junto al agua'};
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
function learnTownSpells(t,h){const gl=t.b.mage4?4:t.b.mage3?3:t.b.mage2?2:t.b.mage1?1:0;if(!gl)return[];const got=[];for(const s of t.spells)if(SPELLS[s].lv<=Math.min(gl,[2,3,4,4][hstat(h).wis])&&!h.spells.includes(s)){h.spells.push(s);got.push(s)}return got}
function hireHero(p,town,idx){
  const o=p.pool[idx];if(!o||p.res.gold<HIRE_COST||p.heroes.length>=8)return null;
  const ex=town.x+town.ex,ey=town.y+town.ey;if(heroAt(ex,ey))return null;
  p.res.gold-=HIRE_COST;let h;
  if(o.hero){h=o.hero;h.army=padArmy([{id:FDEF[h.fi].units[0],n:irnd(Math.random,6,12)}]);placeHero(h,p.id,ex,ey)}
  else{G.usedH[heroKey(o.fi,o.ni)]='hero';h=makeHero(o.fi,o.cls,o.ni,o);placeHero(h,p.id,ex,ey)}
  h.mp=maxMP(h);h.mana=maxMana(h);
  p.pool.splice(idx,1);fillPool(p);return h;
}

// ---------- combate ----------
function battleHs(hero){
  if(!hero)return{a:0,d:0,sp:0,kn:0,off:0,arch:0,armor:0,lead:0,luck:0,tact:0,sorc:0,resi:0,sch:{},schA:{},spdB:0,hpB:0,spec:null,specSpell:null};
  const s=hstat(hero),sp=hero.spec;
  return Object.assign({},s,{spec:sp&&sp.t==='creature'?{id:sp.id,bonus:1+Math.floor(hero.lvl/6)}:null,specSpell:sp&&sp.t==='spell'?{id:sp.id,pct:.05*hero.lvl}:null});
}
function mkSide(hero,army,pid,name){
  return{hero,hs:battleHs(hero),army:padArmy(army),pid,human:isHuman(pid),name:name||(hero?hero.name:'Criaturas')};
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
  const wl=info.town?(info.town.b.fort3?3:info.town.b.fort2?2:info.town.b.fort1?1:0):0;
  const b=new Battle([A,D],{siege:wl||0});b.info=info;
  const done=()=>{
    if(A.hero)A.hero.tmp=null;if(D.hero)D.hero.tmp=null;
    const w=b.winner;const res=b.result();const xA=b.xpFor(0),xD=b.xpFor(1);
    cb(w,b,res,[xA,xD]);
  };
  if(humanIn&&G.hooks.battle!==undefined&&!G.headless){if(G.quick){b.autoPlay();if(G.hooks.quickReport)G.hooks.quickReport(b,A,D,done);else done()}else G.hooks.battle(b,done)}else{b.autoPlay();done()}
}
function applyArmy(side,res,targetArmy){for(let i=0;i<7;i++)targetArmy[i]=res[i]?{id:res[i].id,n:res[i].n}:null}
// experiencia que recibirá el héroe del bando `side` si ha ganado (misma cuenta que gainXp + bonos de combate contra héroes/ciudades)
function xpPreview(b,side){
  const h=b.sides[side].hero;if(!h||b.winner!==side||b.fled===side)return null;
  const ty=b.info&&b.info.type;let x=b.xpFor(side);if(ty==='hero'||(ty==='town'&&side===0))x+=500;
  const st=hstat(h);x=Math.round(x*(1+st.lear*.05+st.xpB/100));
  const lv=h.xp+x>=xpForLevel(h.lvl+1);return{h,x,lv,now:h.xp+x,next:xpForLevel(h.lvl+1)}}
function postBattle(h,b,side){
  const s=hstat(h),enemy=1-side;
  if(b.winner===side){
    let killed=0;for(const u of b.st)if(u.side===enemy&&!u.siege)killed+=u.startN-(u.dead?0:u.n);
    const pct=[0,.10,.20,.30][s.necro]+s.necroB/100;
    if(pct>0&&killed>0){const n=Math.floor(killed*pct);if(n>0&&addToArmy(h.army,'f2t1',n))notify(`${h.name} levanta ${n} esqueletos`,'good')}
    if(s.eagle>0&&b.casts&&b.casts[enemy])for(const sp of b.casts[enemy])if(!h.spells.includes(sp)&&SPELLS[sp].lv<=[2,3,4,4][s.wis]&&Math.random()<s.eagle/100){h.spells.push(sp);notify(`${h.name} aprende ${SPELLS[sp].n} del enemigo`,'good')}
  }
  const pc=[0,.1,.2,.3][s.med];
  if(pc>0)for(let i=0;i<7;i++){const orig=b.sides[side].army[i];if(!orig)continue;const slot=h.army[i];const lost=orig.n-(slot?slot.n:0);if(lost>0){const back=Math.floor(lost*pc);if(back>0){if(slot)slot.n+=back;else h.army[i]={id:orig.id,n:back}}}}
}
function stealArts(h,e){let n=0;for(const k of EQKEYS)if(e.eq[k]){const id=e.eq[k];e.eq[k]=null;if(id[0]==='#')continue;
  if(ART[id].fusion){for(const pc of LIN[ART[id].fusion].pieces)if(giveArtifact(h,pc))n++;continue}
  if(giveArtifact(h,id))n++}for(const id of e.pack.splice(0)){if(giveArtifact(h,id))n++}if(n)notify(`${h.name} se queda con ${n} artefactos`,'good')}
function engage(h,mo,cb){
  const s=hstat(h);const lv=s.dipLv,bonus=s.dipA/100;
  if(lv>0||bonus>0){const hp=armyPower(h.army),mp=sizeVal(mo),ratio=hp/Math.max(1,mp);
    const ch=clamp(.12+(bonus)*.9,0,.85)*Math.min(1.6,ratio/3);
    if(ratio>=1.5&&Math.random()<ch){
      const join=()=>{const ok=addToArmy(h.army,mo.cr,mo.n);removeObj(mo);notify(ok?`${mo.n} ${CR[mo.cr].name} se unen a ${h.name}`:`Las criaturas huyen ante ${h.name}`,'good');cb(true)};
      if(isHuman(h.pid)&&G.hooks.askJoin)G.hooks.askJoin(h,mo,ok=>{if(ok)join();else fightMonster(h,mo,cb)});else join();return}}
  fightMonster(h,mo,cb);
}
// héroe contra monstruo
function fightMonster(h,mo,cb){
  const A=mkSide(h,h.army,h.pid),D=mkSide(null,[{id:mo.cr,n:mo.n}],-1,CR[mo.cr].name);
  runBattle(A,D,{type:'mon',mon:mo},(w,b,res,xp)=>{
    applyArmy(A,res[0],h.army);
    if(w===0){gainXp(h,xp[0]);postBattle(h,b,0);removeObj(mo);cb(true)}
    else{const left=res[1][0];if(left){mo.n=left.n;dmaxAround(mo)}if(b.fled===0)retreatHero(h);else heroDefeated(h);cb(false)}
  });
}
function retreatHero(h){const p=G.players[h.pid];removeHero(h);h.army=padArmy([]);p.pool.unshift({hero:h});notify(`${h.name} se retira del combate`,'bad');checkDefeat(h.pid)}
function surrenderCost(army){let g=0;for(const s of army)if(s&&s.n>0)g+=Math.floor(CR[s.id].cost.gold*s.n/2);return g}
function heroDefeated(h){const pid=h.pid;if(G.usedH)delete G.usedH[heroKey(h.fi,h.port)];notify(`${h.name} ha sido derrotado`,'bad');removeHero(h);checkDefeat(pid)}
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
    if(w===0){gainXp(h,xp[0]+500);postBattle(h,b,0);const pid=e.pid;stealArts(h,e);if(b.fled===1)retreatHero(e);else{removeHero(e);checkDefeat(pid)}cb(true)}
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
    if(w===0){gainXp(h,xp[0]+500);postBattle(h,b,0);const old=t.owner;const eh=gh&&gh.pid===old?gh:null;if(eh){removeHero(eh)}
      t.owner=h.pid;t.builtToday=true;t.gar=padArmy([]);notify(`${G.players[h.pid].name} conquista ${t.name}`,'good');checkDefeat(old);checkVictory();cb(true)}
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
  const p=G.players[h.pid],human=p.human,done=()=>{refreshFog(p);if(human)checkVictory();cb&&cb()};
  switch(o.t){
    case'res':p.res[o.res]+=o.n;notify(`${h.name} recoge ${o.n} ${RESN[o.res]}`,'good');removeObj(o);done();break;
    case'chest':{const lvl=Math.max(1,h.lvl);const gold=1000+lvl*100,xp=500+lvl*150;removeObj(o);
      const take=k=>{if(k==='gold'){p.res.gold+=gold;notify(`Cofre: ${gold} de oro`,'good')}else{gainXp(h,xp);notify(`Cofre: ${xp} de experiencia`,'good')}done()};
      if(human)G.hooks.askChest(h,{gold,xp},take);else take(h.lvl<8?'xp':'gold');break}
    case'art':{const r=giveArtifact(h,o.art);if(!r){notify('Mochila llena','bad');done();break}notify(`${h.name} encuentra: ${ART[o.art].n}`+(r==='pack'?' (a la mochila)':''),'good');removeObj(o);done();break}
    case'boat':{h.boat=true;h.mp=0;h.path=null;removeObj(o);notify(`${h.name} sube al barco: los pasos se agotan hasta mañana`,'good');if(G.hooks.sfx)G.hooks.sfx('boat');done();break}
    case'gate':case'mono':{if(o.dir==='out'){notify('Esta salida es solo de salida','bad');done();break}const dest=o.pair!=null?G.map.objs[o.pair]:null;
      if(!dest||dest.dead||!teleportHero(h,dest)){notify('El portal está bloqueado','bad');done();break}notify(o.t==='gate'?'Cruzas la puerta entre mundos':'El monolito te transporta','good');done();break}
    case'mine':{if(o.owner!==h.pid){o.owner=h.pid;const rate=o.res==='gold'?1000:(o.res==='wood'||o.res==='ore')?2:1,rn=RESN[o.res].toLowerCase();notify(h.pid===0?`Conquistada mina de ${rn}: +${rate} de ${rn} al día`:`${p.name} captura una mina de ${rn}`,'good')}done();break}
    case'dwell':{if(o.owner!==h.pid){o.owner=h.pid;const bn=dwellBonusInfo(o);
        notify(human?`Conquistada morada de ${CR[o.cr].name}: +${CR[o.cr].grow} por semana`+(bn?` · suma +${CR[o.cr].grow} semanales en ${bn} castillo${bn>1?'s':''} con ese edificio`:''):`${p.name} conquista una morada de ${CR[o.cr].name}`,'good')}
      if(human)G.hooks.dwell(o,h,done);else{aiBuyDwell(p,h,o);done()}break}
    case'town':{
      if(o.owner===h.pid){learnTownSpells(o,h);const mg=o.b.mage1;if(mg)h.mana=Math.max(h.mana,maxMana(h));
        if(human)G.hooks.town(o,h,done);else done()}
      else fightTown(h,o,won=>{if(won&&human)G.hooks.town(o,h,done);else done()});
      break}
    case'site':if(o.k==='shop'){if(human)G.hooks.shop(o,h,done);else{aiShop(p,h,o);done()}}else{if(SITEDEF[o.k])visitSite2(h,o,p);else visitSite(h,o,p);done()}break;
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
function addMapObj(o){const m=G.map,f=FOOT[o.t];Object.assign(o,{w:f.w,h:f.h,ex:f.ex,ey:f.ey});o.id=m.objs.length;m.objs.push(o);
  for(let j=0;j<o.h;j++)for(let i=0;i<o.w;i++)m.fp[(o.y+j)*m.w+o.x+i]=o.id+1;m.en[(o.y+o.ey)*m.w+o.x+o.ex]=o.id+1;return o}
function teleportHero(h,dest){
  const m=G.map;const ex=dest.x+dest.ex,ey=dest.y+dest.ey;
  const cands=[[0,1],[1,1],[-1,1],[0,2],[1,0],[-1,0],[0,-1],[1,2],[-1,2],[2,1]];let L=null;
  for(const[dx,dy]of cands){const x=ex+dx,y=ey+dy;if(x<0||y<0||x>=m.w||y>=m.h)continue;if(tilePass(m,x,y,false)&&!m.en[y*m.w+x]&&!G.hmap[y*m.w+x]){L={x,y};break}}
  if(!L)return false;
  const from={x:h.x,y:h.y};if(G.hmap[mapIdx(h.x,h.y)]===h.id+1)G.hmap[mapIdx(h.x,h.y)]=0;h.x=L.x;h.y=L.y;G.hmap[mapIdx(L.x,L.y)]=h.id+1;h.path=null;
  const p=G.players[h.pid];if(p.fog)reveal(p,L.x,L.y,heroVis(h));if(G.hooks.teleport)G.hooks.teleport(h,from,L);return true;
}
function buyBoat(t,p){
  if(!t.b.shipyard||!t.dock)return'No hay astillero';if(!canAfford(p,{gold:1000,wood:10}))return'Recursos insuficientes (1000 de oro y 10 de madera)';
  const m=G.map,k=t.dock.y*m.w+t.dock.x;if(m.fp[k]||G.hmap[k])return'El muelle está ocupado';
  spend(p,{gold:1000,wood:10});addMapObj({t:'boat',x:t.dock.x,y:t.dock.y,isle:1});return null;
}
function buyArt(h,shop,i,p){const id=shop.stock[i];if(!id)return'Agotado';const price=ART_PRICE[ART[id].v]||1000;if(p.res.gold<price)return'Oro insuficiente';if(!giveArtifact(h,id))return'Mochila llena';p.res.gold-=price;shop.stock.splice(i,1);return null}
function aiShop(p,h,o){for(let i=o.stock.length-1;i>=0;i--){const id=o.stock[i],price=ART_PRICE[ART[id].v]||1000;if(p.res.gold>price+3000){if(buyArt(h,o,i,p)===null)autoEquipBest(h)}}}
function aiBuyDwell(p,h,o){const c=CR[o.cr];const n=Math.min(o.n,maxRecruit(p,o.cr,o.n));if(n>0&&addToArmy(h.army,o.cr,n)){spend(p,recruitCost(o.cr,n));o.n-=n}}

// ---------- movimiento ----------
function planPath(h,x,y,extra){
  return findPath(G.map,h.x,h.y,x,y,{ok:(px,py)=>!G.hmap[py*G.map.w+px]&&(!extra||extra(px,py)),limit:90000,boat:!!h.boat,pf:hstat(h).pf});
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
    fightHero(h,eh,won=>{if(won&&h.alive){moveTo(h,nx.x,nx.y);if(obj&&obj.t==='town'&&obj.owner!==h.pid){visit(h,obj,()=>cb(h.alive?'arrived':'dead'));return}}cb(h.alive?'stop':'dead')});return}
  if(obj&&obj.t==='mon'){h.mp-=Math.min(h.mp,cost);h.path=null;engage(h,obj,won=>{cb(won&&h.alive?'stop':'dead')});return}
  const px0=h.x,py0=h.y;moveTo(h,nx.x,nx.y);h.mp=Math.max(0,h.mp-cost);st.shift();
  if(h.boat&&m.terr[nx.y*m.w+nx.x]!==WATER){h.boat=false;addMapObj({t:'boat',x:px0,y:py0,isle:1});h.mp=0;h.path=null;st.length=0;notify(`${h.name} desembarca: los pasos se agotan hasta mañana`)}
  // zona de control
  if(m.zoc[nx.y*m.w+nx.x]){for(const[dx,dy]of D8){const x=nx.x+dx,y=nx.y+dy;if(x<0||y<0||x>=m.w||y>=m.h)continue;const o2=objAt(x,y);if(o2&&o2.t==='mon'&&!o2.dead){h.path=null;engage(h,o2,won=>{
    if(won&&h.alive&&obj&&target){visit(h,obj,()=>cb('arrived'))}else cb(won&&h.alive?'stop':'dead')});return}}}
  if(obj&&target){h.path=null;visit(h,obj,()=>cb('arrived'));return}
  cb(target?'arrived':'moved');
}
function moveTo(h,x,y){const m=G.map;if(G.hooks.heroStep)G.hooks.heroStep(h,h.x,h.y,x,y);if(G.hmap[mapIdx(h.x,h.y)]===h.id+1)G.hmap[mapIdx(h.x,h.y)]=0;h.x=x;h.y=y;G.hmap[mapIdx(x,y)]=h.id+1;const p=G.players[h.pid];if(p.fog)reveal(p,x,y,heroVis(h))}
// ---------- turnos / días ----------
function startDayFor(p){
  for(const hid of p.heroes){const h=G.heroes[hid];h.mp=maxMP(h);h.sleep=false;const s=hstat(h);h.mana=Math.min(maxMana(h),h.mana+1+s.mys*2+s.manaR);
    const t=objAtTownTile(h);if(t&&t.b.mage1)h.mana=Math.max(h.mana,maxMana(h))}
  for(const t of ownedTowns(p.id))t.builtToday=false;
}
function endDayAll(){
  G.day++;
  for(const p of G.players){if(!p.alive)continue;const inc=incomeOf(p);const bonus=p.human?1:[.8,1,1.25,1.6][G.opt.diff==null?1:G.opt.diff]*(G.map.spec.aiK||1);for(const k in inc)p.res[k]+=Math.round(inc[k]*bonus)}
  if((G.day-1)%7===0)newWeek();
  checkVictory();
}
// ---- condiciones de victoria (derrotar a todos los rivales siempre da la victoria) ----
function checkVictory(){
  if(G.over||G.vdone||!G.map.vic)return;const v=G.map.vic,p=G.players[0];if(!p.alive)return;let why=null;
  switch(v.t){
    case'grail':for(const hid of p.heroes){const h=G.heroes[hid];if(hasPiece(h,'grial')&&objAtTownTile(h))why='Has llevado el Cáliz de Éter a tu ciudad. ¡Los reinos te reconocen como soberano!';}break;
    case'capital':{const t=G.map.objs[v.town];if(t&&!t.dead&&t.owner===0)why='La Ciudadela Real es tuya. ¡El reino te reconoce como soberano!';break}
    case'gold':if(p.res.gold>=v.n)why=`Has reunido ${v.n.toLocaleString('es-ES')} de oro. ¡Tu riqueza es legendaria!`;break;
    case'quests':if((G.qdone||0)>=v.n)why=`Has completado ${v.n} misiones de los videntes.`;break;
    case'survive':if(G.day>=v.n)why=`Has resistido hasta el día ${v.n}.`;break;
  }
  if(why){G.over=true;G.vdone=true;G.vreason=why;G.hooks.gameOver(true,why)}
}
// ---- semanas especiales (como en Heroes 3): semana de una criatura o plaga ----
function rollWeek(week){
  if(week<=1)return{t:'normal',week};
  const r=mulberry((G.map.spec.seed|0)*131+week*7919);const x=r();
  if(x<.1)return{t:'plague',week};
  if(x<.72){const ids=ALL_BY_VAL.filter(id=>CR[id].tier<=6||r()<.3);return{t:'creature',cr:ids[Math.floor(r()*ids.length)],week}}
  return{t:'normal',week};
}
function weekLabel(w){return w.t==='creature'?`Semana de ${CR[w.cr].name}`:w.t==='plague'?'Semana de la Plaga':`Semana ${w.week}`}
// castillos del dueño de la morada que crían la misma criatura (o su mejora) con el edificio construido
function dwellTiers(t,cr){const u=FDEF[t.fi].units,out=[];for(let k=1;k<=7;k++)if((u[k-1]===cr||u[k-1+7]===cr)&&t.b['dw'+k])out.push(k);return out}
function dwellBonusInfo(o){let n=0;for(const t of ownedTowns(o.owner))if(dwellTiers(t,o.cr).length)n++;return n}
// crecimiento semanal extra de un castillo por las moradas externas conquistadas de esa criatura
function dwellExtra(t,tier){if(t.owner<0)return 0;const u=FDEF[t.fi].units;let sum=0;
  for(const o of objsOfType('dwell')){if(o.dead||o.owner!==t.owner)continue;if(o.cr===u[tier-1]||o.cr===u[tier-1+7])sum+=CR[o.cr].grow}return sum}
function newWeek(){
  const week=Math.floor((G.day-1)/7)+1;const ev=G.week=rollWeek(week);const m=G.map;let spawned=0,boosted=0;
  const cid=ev.t==='creature'?ev.cr:null;
  for(const o of m.objs){if(o.dead)continue;
    if(o.t==='town'){const mul=1+(o.b.fort2?.5:0)+(o.b.fort3?.5:0);
      for(let t=1;t<=7;t++)if(o.b['dw'+t]){const id=FDEF[o.fi].units[t-1];let add=Math.round(CR[id].grow*mul);
        if(cid&&(id===cid||FDEF[o.fi].units[t-1+7]===cid)){add=add*2+5;boosted++}
        const ex=o.owner>=0?dwellExtra(o,t):0;if(ex){add+=(cid&&(FDEF[o.fi].units[t-1]===cid||FDEF[o.fi].units[t-1+7]===cid))?ex*2:ex}
        o.avail[t-1]+=add;if(ev.t==='plague')o.avail[t-1]=Math.floor(o.avail[t-1]/2)}}
    else if(o.t==='dwell'){let add=CR[o.cr].grow;if(cid&&o.cr===cid){add=add*2+5;boosted++}o.n+=add;if(ev.t==='plague')o.n=Math.floor(o.n/2)}
    else if(o.t==='mon'){ // las manadas crecen cada semana; las de la criatura de la semana se duplican
      if(!o.n0)o.n0=o.n;let add=Math.max(1,Math.round(o.n*.05));if(o.n<o.n0*2.2)o.n+=add;
      if(cid&&o.cr===cid){o.n=Math.round(o.n*2);o.fresh=G.day;boosted++}}}
  recomputeZoc();
  if(cid){ // aparecen nuevas manadas de esa criatura por todo el mapa
    const want=Math.round(6+m.w/30),cr=CR[cid];let tries=0;const r=Math.random;
    while(spawned<want&&tries++<want*60){const lv=Math.random()<.5?0:1;const lh=m.lh||m.h;
      const x=3+Math.floor(r()*(m.w-6)),y=3+Math.floor(r()*(lh-6))+(lv?lh+2:0);
      const k=y*m.w+x;if(!tilePass(m,x,y,false)||m.fp[k]||m.en[k]||m.road[k]||G.hmap[k])continue;
      if(m.terr[k]===WATER)continue;
      let near=false;for(const q of m.objs)if(!q.dead&&q.t==='town'&&Math.abs(q.x-x)<8&&Math.abs(q.y-y)<8){near=true;break}if(near)continue;
      const pw=(180+G.day*40)*(.6+r()*.8);const n=Math.max(2,Math.round(pw/cr.val));
      addMapObj({t:'mon',cr:cid,n,x,y,fresh:G.day,n0:n});spawned++}
    recomputeZoc()}
  for(const p of G.players)refreshPool(p);
  if(G.hooks.weekBanner&&G.players[0].alive)G.hooks.weekBanner(ev,{spawned,boosted});
  else notify(`Comienza la semana ${week}`);
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
function evalFight(h,enemyArmy,enemyHero,n=2,town){
  let wins=0,loss=0;const mine=armyPower(h.army)||1;
  for(let k=0;k<n;k++){
    const hc={...h,mana:h.mana,spells:h.spells.slice()};const ec=enemyHero?{...enemyHero,mana:enemyHero.mana,spells:enemyHero.spells.slice()}:null;
    const A=mkSide(hc,h.army,h.pid),D=mkSide(ec,enemyArmy,enemyHero?enemyHero.pid:-1);A.human=false;D.human=false;
    const b=new Battle([A,D],{siege:town&&town.b?(town.b.fort3?3:town.b.fort2?2:town.b.fort1?1:0):0});b.autoPlay();const res=b.result()[0];if(b.winner===0)wins++;loss+=1-armyPower(res)/mine}
  return{win:wins/n,loss:loss/n};
}
function dangerMask(h,power){
  const m=G.map,d=new Uint8Array(m.w*m.h);
  for(const o of m.objs){if(o.dead||o.t!=='mon')continue;if(sizeVal(o)*1.15<power)continue;for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++){const x=o.x+i,y=o.y+j;if(x>=0&&y>=0&&x<m.w&&y<m.h)d[y*m.w+x]=1}}
  return d;
}
function aiPickSkill(h,opts){const pref=SK_PREF[h.cls];return opts.slice().sort((a,b)=>pref.indexOf(a)-pref.indexOf(b))[0]}
function aiTrade(p){
  const towns=ownedTowns(p.id);if(!towns.some(t=>t.b.market))return;
  for(const r of RES){if(r==='gold')continue;const keep=r==='wood'||r==='ore'?30:15;
    if(p.res[r]>keep+10){const sell=p.res[r]-keep;const gold=Math.floor(sell*RV[r]*marketEff(p.id));p.res[r]-=sell;p.res.gold+=gold}}
  // comprar recursos que bloquean la construcción más importante
  const t=towns[0];if(t&&p.res.gold>4000)for(const b of['dw4','dw5','dw6','dw7','mage1']){if(t.b[b]||!canBuild(t,b,p).ok&&bReq(b,t).some(x=>!t.b[x]))continue;const c=bCost(b,t.fi);
    for(const r in c)if((p.res[r]||0)<c[r]){const need=c[r]-p.res[r],cost=Math.ceil(need*RV[r]/marketEff(p.id));if(p.res.gold>=cost+2000){p.res.gold-=cost;p.res[r]+=need}}break}
}
function aiUpgradeArmy(p,t,arr){for(let i=0;i<7;i++){const u=upgradeCostFor(t,arr,i);if(u&&canAfford(p,u.cost)&&p.res.gold>u.cost.gold+1500)doUpgrade(p,t,arr,i)}}
function aiTowns(p){
  const towns=ownedTowns(p.id);const rich=p.res.gold>12000;
  const order=['tavern','dw1','dw2','dw3','hall2','dw4','mage1','dw5','up1','up2','up3','dw6','hall3','up4','up5','dw7','market','fort1','fort2','up6','up7','fort3','mage2','mage3'];
  towns.sort((a,b)=>Object.keys(b.b).length-Object.keys(a.b).length);
  for(const t of towns){
    const saving=p.heroes.length===0&&t.b.tavern&&!heroAt(t.x+t.ex,t.y+t.ey);
    if(!t.builtToday&&!saving){const ord=G.day>10?['hall2',...order]:order;for(const b of ord){const cb=canBuild(t,b,p);if(cb.ok&&(b!=='hall3'||p.res.gold>12000)){build(t,b,p);break}}}
    const hero=heroAt(t.x+t.ex,t.y+t.ey);const mine=hero&&hero.pid===p.id?hero:null;
    if(!saving)for(let tier=7;tier>=1;tier--){if(!t.b['dw'+tier])continue;const id=townUnit(t,tier);const n=maxRecruit(p,id,t.avail[tier-1]);if(n>0)recruit(t,tier,n,p,mine)}
    if(G.map.spec.sea&&t.dock&&G.day>5){
      if(!t.b.shipyard&&p.res.gold>9000&&canBuild(t,'shipyard',p).ok&&!t.builtToday&&ownedTowns(p.id).filter(q=>q.b.shipyard).length<2)build(t,'shipyard',p);
      if(t.b.shipyard&&p.res.gold>6000&&p.res.wood>=10&&(p.boats||0)<3&&!G.map.objs.some(o=>!o.dead&&o.t==='boat'&&Math.hypot(o.x-t.dock.x,o.y-t.dock.y)<6)){if(buyBoat(t,p)===null)p.boats=(p.boats||0)+1}}
    aiUpgradeArmy(p,t,t.gar);if(mine){aiUpgradeArmy(p,t,mine.army);mergeArmy(mine.army,t.gar);sortArmy(mine.army)}
    if(p.heroes.length<Math.min(2+Math.floor(G.day/7),8)&&t.b.tavern&&!heroAt(t.x+t.ex,t.y+t.ey)&&p.res.gold>=HIRE_COST+(p.heroes.length?700:0)){const h=hireHero(p,t,Math.max(0,p.pool.findIndex(o=>o.fi===p.fac)));if(h){mergeArmy(h.army,t.gar);sortArmy(h.army)}}
  }
}
function threatsTo(p,t){let power=0,who=[];for(const q of G.players){if(q.id===p.id||!q.alive)continue;for(const hid of q.heroes){const e=G.heroes[hid];if(Math.hypot(e.x-(t.x+2),e.y-(t.y+1))<=16){power+=armyPower(e.army);who.push(e)}}}return{power,who}}
// masas de tierra y de agua (para que la IA sepa cuándo necesita barco)
function mapComps(m){
  if(m.comp)return m.comp;const W=m.w,H=m.h,n=W*H,comp=new Int32Array(n);let L=0,Wt=0;const st=[];
  for(let i=0;i<n;i++){if(comp[i])continue;const t=m.terr[i];
    if(t===WATER){Wt--;comp[i]=Wt;st.push(i);while(st.length){const c=st.pop(),cx=c%W,cy=(c/W)|0;for(const[dx,dy]of D8){const x=cx+dx,y=cy+dy;if(x<0||y<0||x>=W||y>=H)continue;const q=y*W+x;if(!comp[q]&&m.terr[q]===WATER){comp[q]=Wt;st.push(q)}}}}
    else if(!IMP(t)&&!m.deco[i]){L++;comp[i]=L;st.push(i);while(st.length){const c=st.pop(),cx=c%W,cy=(c/W)|0;for(const[dx,dy]of D8){const x=cx+dx,y=cy+dy;if(x<0||y<0||x>=W||y>=H)continue;const q=y*W+x;if(!comp[q]&&!IMP(m.terr[q])&&!m.deco[q]){comp[q]=L;st.push(q)}}}}}
  return m.comp=comp;
}
function waterNear(m,comp,x,y,wc){for(const[dx,dy]of D8){const q=(y+dy)*m.w+x+dx;if(x+dx>=0&&x+dx<m.w&&y+dy>=0&&y+dy<m.h&&comp[q]===wc)return true}return false}
function aiFindBoat(p,h,comp,hc){
  const m=G.map;let best=null,bd=1e9;
  for(const o of m.objs){if(o.dead||o.t!=='boat'||levelOf(m,o.y)!==levelOf(m,h.y))continue;const d=Math.hypot(o.x-h.x,o.y-h.y);if(d>=bd)continue;
    let ok=false;for(const[dx,dy]of D8){const x=o.x+dx,y=o.y+dy;if(x>=0&&y>=0&&x<m.w&&y<m.h&&comp[y*m.w+x]===hc){ok=true;break}}if(ok){bd=d;best=o}}
  if(!best)return null;return planPath(h,best.x,best.y);
}
// objetos no-barco por nivel (caché por longitud de m.objs)
function objsByLevel(m){const c=m._ol;if(c&&c.n===m.objs.length)return c.l;const l=[[],[]];for(const o of m.objs)if(o.t!=='boat')l[levelOf(m,o.y)].push(o);m._ol={n:m.objs.length,l};return l}
// los K mejores por v (desc), estable: igual que sort() y tomar los K primeros
function topK(a,K){if(a.length<=K)return a.sort((x,y)=>y.v-x.v);const t=[];
  for(let i=0;i<a.length;i++){const c=a[i];if(t.length===K&&c.v<=t[K-1].v)continue;let j=t.length;while(j>0&&t[j-1].v<c.v)j--;t.splice(j,0,c);if(t.length>K)t.pop()}return t}
const AI_RADIUS=70;
function objGrid(m){const c=m._gr;if(c&&c.n===m.objs.length)return c.l;const cs=16,gw=Math.ceil(m.w/cs),lh=m.lh||m.h;const l=[0,1].map(lv=>{const y0=lv?lh+2:0,gh=Math.ceil(lh/cs);return{cs,gw,gh,y0,towns:[],cells:Array.from({length:gw*gh},()=>[])}});
  for(const o of m.objs){if(o.t==='boat')continue;const lv=levelOf(m,o.y),g=l[lv];if(o.t==='town'){g.towns.push(o);continue}const cx=Math.min(g.gw-1,Math.max(0,(o.x+o.ex)/cs|0)),cy=Math.min(g.gh-1,Math.max(0,(o.y+o.ey-g.y0)/cs|0));g.cells[cy*g.gw+cx].push(o)}
  m._gr={n:m.objs.length,l};return l}
function aiHeroAct(p,h,cb){
  const m=G.map,power=armyPower(h.army),dif=G.opt.diff==null?1:G.opt.diff,aggr=[.9,.8,.7,.6][dif];
  const lowArmy=power<250+G.day*30;const dm=m.dmax,isD=i=>dm[i]>0&&dm[i]*1.15>=power;let cands=[];const hl=levelOf(m,h.y),lvObjs=objsByLevel(m)[hl];
  const myTowns=ownedTowns(p.id);const comp=mapComps(m),hc=comp[h.y*m.w+h.x],sea=!!m.spec.sea;
  // 1. defensa de ciudades amenazadas
  const inTown=objAtTownTile(h);
  for(const t of myTowns){const th=threatsTo(p,t);if(!th.who.length)continue;const gp=armyPower(t.gar)+power*0.5;
    if(th.power>gp*.7){const d=Math.hypot(h.x-t.x,h.y-t.y);const closest=!myTowns.length||p.heroes.every(id=>{const o=G.heroes[id];return o===h||Math.hypot(o.x-t.x,o.y-t.y)>=d});
      if(closest){if(inTown===t){// ya estoy: ataca al enemigo cercano si lo supero, si no me quedo
          const e=th.who.sort((a,b)=>Math.hypot(a.x-h.x,a.y-h.y)-Math.hypot(b.x-h.x,b.y-h.y))[0];
          if(Math.hypot(e.x-h.x,e.y-h.y)<=8&&evalFight(h,e.army,e,2).win>=.7)cands.push({o:{x:e.x,y:e.y,ex:0,ey:0},v:1e6,hero:e});else{h.mp=0;return cb(false)}}
        else cands.push({o:{x:t.x+t.ex,y:t.y+t.ey,ex:0,ey:0},v:5e5/(1+d)})}}}
  const scanObj=o=>{
    if(o.dead)return;const ddx=o.x+o.ex-h.x,ddy=o.y+o.ey-h.y,d2=ddx*ddx+ddy*ddy;if(d2>19600&&h.mp<1400)return;const d=Math.sqrt(d2);let val=0;
    {const ex=o.x+o.ex,ey=o.y+o.ey,ec=comp[ey*m.w+ex];
      if(h.boat){if(ec<0){if(ec!==hc)return}else if(!waterNear(m,comp,ex,ey,hc))return}else if(ec!==hc)return}
    switch(o.t){
      case'res':val=(o.res==='gold'?o.n:o.n*220);break;
      case'chest':val=900;break;
      case'art':val=ART[o.art]&&ART[o.art].lin?4200:1700;break;
      case'mine':if(o.owner!==p.id)val=(o.res==='gold'?3800:2400)*(o.owner>=0?1.4:1);break;
      case'dwell':{const c=CR[o.cr];if(o.n>0&&p.res.gold>=c.cost.gold*2)val=300+o.n*c.val*1.5;break}
      case'mon':{const mp=sizeVal(o);if(power>mp*1.25)val=200+mp*.6+CR[o.cr].hp*o.n*.2;else val=-1;break}
      case'town':if(o.owner===p.id){if(lowArmy&&o.gar.some(s=>s))val=2600;else if(o.b.mage1&&h.mana<maxMana(h)*.4)val=500}
        else{const eh=heroAt(o.x+o.ex,o.y+o.ey);const gp=armyPower(o.gar)+(eh?armyPower(eh.army)*1.2:0);if(o.owner>=0&&G.day<9)val=-1;else if(power>gp*1.3)val=o.owner>=0?9000:6000;else val=-1}break;
      case'gate':case'mono':if(o.dir!=='out'&&o.pair!=null&&G.day>4&&(o.id*7+G.day)%9===0)val=800;break;
      case'site':{if(SITEDEF[o.k]){val=siteAIValue(h,o,p);break}if(o.k==='shop'){if(p.res.gold>8000)val=900;break}if(o.k==='well'){if(h.mana<maxMana(h)*.5&&h.visited.well!==G.day)val=600}else if(!h.visited[o.id])val=o.k==='stone'?1200:o.k==='stable'?200:o.k==='mill'?800:700;break}
    }
    if(val>0)cands.push({o,v:val/(8+d)});};
  // índice espacial: ciudades siempre (son pocas y valen mucho); el resto, solo las celdas cercanas
  const R=h.mp<1400?140:AI_RADIUS;const sp=objGrid(m)[hl];
  for(const o of sp.towns)scanObj(o);
  {const cs=sp.cs,gw=sp.gw,c0=Math.max(0,Math.floor((h.x-R)/cs)),c1=Math.min(gw-1,Math.floor((h.x+R)/cs)),r0=Math.max(0,Math.floor((h.y-R-sp.y0)/cs)),r1=Math.min(sp.gh-1,Math.floor((h.y+R-sp.y0)/cs));
   for(let cy=r0;cy<=r1;cy++)for(let cx=c0;cx<=c1;cx++){const cell=sp.cells[cy*gw+cx];for(let q=0;q<cell.length;q++)scanObj(cell[q])}}
  if(!cands.length)for(const o of lvObjs)if(o.t!=='town')scanObj(o); // nada cerca: búsqueda global
  for(const q of G.players)if(q.id!==p.id&&q.alive)for(const hid of q.heroes){const e=G.heroes[hid];const d=Math.hypot(e.x-h.x,e.y-h.y);if(d<45&&power>armyPower(e.army)*1.2)cands.push({o:{x:e.x,y:e.y,ex:0,ey:0},v:4000/(8+d),hero:e})}
  cands=topK(cands,10);
  if(sea&&!h.boat&&h.mp>=1000){ // ¿hay tesoros en otras tierras? entonces conviene subir a un barco
    let far=false;for(const o of m.objs){if(o.dead||o.t==='boat'||levelOf(m,o.y)!==levelOf(m,h.y))continue;if(!['res','chest','art','mine','dwell','site','town'].includes(o.t))continue;
      const ec=comp[(o.y+o.ey)*m.w+o.x+o.ex];if(ec>0&&ec!==hc&&(o.t!=='town'||o.owner<0)){far=true;break}}
    if(far&&(!cands.length||cands[0].v<70||Math.random()<.1)){let bb=null,bd=1e9;
      for(const o of m.objs){if(o.dead||o.t!=='boat'||levelOf(m,o.y)!==levelOf(m,h.y))continue;const d=Math.hypot(o.x-h.x,o.y-h.y);if(d<bd&&d<110){bd=d;bb=o}}
      if(bb)cands.unshift({o:bb,v:1e5})}}
  const finish=(s)=>{const t=objAtTownTile(h);if(t&&h.alive){mergeArmy(h.army,t.gar);sortArmy(h.army);learnTownSpells(t,h);if(t.b.mage1)h.mana=Math.max(h.mana,maxMana(h))}
    if(h.alive){autoEquipBest(h);aiFuse(h)}cb(h.alive&&s!=='dead')};
  let tries=0;
  for(const c of cands){
    if(tries>=6)break;
    const tx=c.o.x+c.o.ex,ty=c.o.y+c.o.ey;
    const path=planPath(h,tx,ty,(x,y)=>!isD(y*m.w+x)||(Math.abs(x-tx)<=1&&Math.abs(y-ty)<=1));if(!path){tries++;continue}
    // comprobar el combate con una simulación
    const ob=c.o.t==='mon'?c.o:c.o.t==='town'&&c.o.owner!==p.id?c.o:null;
    if(c.hero||ob){tries++;let enemyArmy,enemyHero=null;
      if(c.hero){enemyArmy=c.hero.army;enemyHero=c.hero}else if(ob.t==='mon')enemyArmy=[{id:ob.cr,n:ob.n}];else{const eh=heroAt(ob.x+ob.ex,ob.y+ob.ey);enemyHero=eh&&eh.pid===ob.owner?eh:null;enemyArmy=townDefenders(ob,enemyHero).map(o=>o.s)}
      const r=evalFight(h,padArmy(enemyArmy),enemyHero,2,c.o.t==='town'?c.o:null);const need=c.v>=1e5?.5:aggr;
      if(r.win<need||(r.loss>.55&&c.o.t==='mon'&&r.win<1))continue}
    h.path=path;runPath(h,finish);return;
  }
  // navegación: embarcar para llegar a otras tierras, o desembarcar si no queda nada que hacer en el mar
  if(sea){
    if(h.boat){const coast=[];const R=26;for(let k=0;k<60;k++){const x=h.x+Math.floor((Math.random()*2-1)*R),y=h.y+Math.floor((Math.random()*2-1)*R);
        if(x<2||y<2||x>=m.w-2||y>=m.h-2||levelOf(m,y)!==levelOf(m,h.y))continue;const c=comp[y*m.w+x];if(c>0&&waterNear(m,comp,x,y,hc)&&!m.en[y*m.w+x])coast.push([x,y])}
      coast.sort((a,b2)=>Math.hypot(a[0]-h.x,a[1]-h.y)-Math.hypot(b2[0]-h.x,b2[1]-h.y));
      for(const[x,y]of coast.slice(0,5)){const path=planPath(h,x,y);if(path){h.path=path;runPath(h,finish);return}}}
    else{let far=false;for(const o of m.objs){if(o.dead||o.t==='boat'||levelOf(m,o.y)!==levelOf(m,h.y))continue;if(!['res','chest','art','mine','dwell','site','town'].includes(o.t))continue;
        const ex=o.x+o.ex,ey=o.y+o.ey;if(comp[ey*m.w+ex]!==hc&&comp[ey*m.w+ex]>0&&(o.t!=='town'||o.owner<0)){far=true;break}}
      if(far&&(!cands.length||Math.random()<.5)){const bp=aiFindBoat(p,h,comp,hc);if(bp){h.path=bp;runPath(h,finish);return}}}
  }
  // sin objetivos útiles: explorar hacia un punto lejano seguro, o volver a casa
  if(lowArmy&&myTowns.length&&!inTown){const t=myTowns[0];const path=planPath(h,t.x+t.ex,t.y+t.ey,(x,y)=>!isD(y*m.w+x));if(path){h.path=path;runPath(h,finish);return}}
  const rx=Math.floor(Math.random()*(m.w-8)+4),ry=Math.floor(Math.random()*(m.h-8)+4);
  const path=planPath(h,rx,ry,(x,y)=>!isD(y*m.w+x));
  if(path){h.path=path.slice(0,40);runPath(h,finish);return}
  cb(false);
}
// ---------- guardado ----------
function saveState(){
  const m=G.map;return JSON.stringify({idx:m.spec.i,opt:G.opt,day:G.day,cur:G.cur,
    players:G.players.map(p=>({...p,fog:null})),fog:G.players[0].fog?packFog(G.players[0].fog):null,
    heroes:G.heroes,gid:G.gid,qdone:G.qdone,vdone:G.vdone,usedH:G.usedH,week:G.week,objs:diffObjs(m)});
}
// solo se guardan los objetos que cambiaron respecto al mundo generado por la semilla
function snapMap(m){m.snap=m.objs.map(o=>JSON.stringify(o))}
function diffObjs(m){const out=[];m.objs.forEach((o,i)=>{if(i<(m.snap?m.snap.length:0)){if(o.dead){if(m.snap[i].indexOf('"dead":1')<0)out.push({dead:1,id:o.id})}else if(JSON.stringify(o)!==m.snap[i])out.push(o)}else out.push(o.dead?{dead:1,id:o.id}:o)});return out}
function packFog(f){let s='';const out=[];for(let i=0;i<f.length;i+=8){let b=0;for(let k=0;k<8;k++)if(f[i+k])b|=1<<k;out.push(b)}for(let i=0;i<out.length;i+=4096)s+=String.fromCharCode.apply(null,out.slice(i,i+4096));return btoa(s)}
function unpackFog(s,n){const raw=atob(s),f=new Uint8Array(n);for(let i=0;i<raw.length;i++){const b=raw.charCodeAt(i);for(let k=0;k<8;k++)if(b&(1<<k))f[i*8+k]=1}return f}
function loadState(str){
  const d=JSON.parse(str);const spec=mapSpec(d.idx);const map=genMap(spec,{fac0:d.opt.fac});G.map=map;snapMap(map);G.opt=d.opt;G.day=d.day;G.cur=d.cur;G.over=false;G.busy=false;
  // sustituir objetos dinámicos
  for(const o of d.objs){if(o.id>=map.objs.length){if(o.dead)map.objs.push({t:'void',dead:1,id:o.id,x:0,y:0,w:1,h:1,ex:0,ey:0});else addMapObj(o);continue}
    if(o.dead){const real=map.objs[o.id];if(real&&!real.dead)removeObj(real)}else Object.assign(map.objs[o.id],o)}
  for(const o of map.objs)if(!o.dead&&o.t==='town')o.gar=padArmy(o.gar);
  G.heroes=d.heroes;G.players=d.players;G.usedH=d.usedH||{};G.gid=d.gid||('g'+Date.now().toString(36));G.qdone=d.qdone||0;G.vdone=!!d.vdone;G.week=d.week||{t:'normal',week:Math.floor((d.day-1)/7)+1};G.hmap=new Int16Array(map.w*map.h);
  for(const h of G.heroes)if(h.alive&&h.x>=0)G.hmap[mapIdx(h.x,h.y)]=h.id+1;
  G.players[0].fog=d.fog?unpackFog(d.fog,map.w*map.h):new Uint8Array(map.w*map.h);
  for(let i=1;i<G.players.length;i++)G.players[i].fog=null;
  recomputeZoc();return G;
}
