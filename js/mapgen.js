'use strict';
// =====================================================================
//  Generación procedural de 200 escenarios gigantes + búsqueda de rutas
// =====================================================================
const MAP_COUNT=200;
const BIOMES={
  templado:{n:'Templado',pal:[[GRASS,6],[DIRT,2],[ROUGH,1],[SWAMP,.5]],wl:.42},
  boreal:{n:'Nevado',pal:[[SNOW,6],[DIRT,1.5],[ROUGH,1.5],[GRASS,1]],wl:.40},
  desierto:{n:'Desértico',pal:[[SAND,6],[DIRT,2],[ROUGH,1.5],[ASH,.5]],wl:.36},
  pantano:{n:'Pantanoso',pal:[[SWAMP,5],[GRASS,2.5],[DIRT,1.5],[SAND,.4]],wl:.46},
  volcan:{n:'Volcánico',pal:[[ASH,6],[ROUGH,2.5],[DIRT,1.5],[SAND,.5]],wl:.38},
  mixto:{n:'Mixto',pal:[[GRASS,3],[DIRT,1.5],[SAND,1.5],[SNOW,1.5],[SWAMP,1],[ROUGH,1.5],[ASH,1]],wl:.42},
  archipielago:{n:'Archipiélago',pal:[[GRASS,4],[SAND,3],[DIRT,1],[SWAMP,.5]],wl:.425},
  montana:{n:'Montañoso',pal:[[ROUGH,5],[SNOW,2.5],[DIRT,2],[GRASS,1.5]],wl:.36},
  bosque:{n:'Bosque profundo',pal:[[GRASS,6],[DIRT,1.5],[SWAMP,1]],wl:.40},
  yermo:{n:'Yermo',pal:[[DIRT,5],[ROUGH,3],[ASH,1.5],[SAND,1.5]],wl:.34}
};
const BIOME_IDS=Object.keys(BIOMES);
const NAME_PRE={templado:['El Valle de','La Llanura de','El Reino de','La Marca de'],boreal:['Las Cumbres de','Las Tierras de','El Reino de','La Frontera de'],desierto:['El Desierto de','Las Arenas de','El Reino de','El Yermo de'],
  pantano:['La Ciénaga de','Los Marjales de','El Páramo de','La Marca de'],volcan:['Las Cenizas de','El Volcán de','Los Páramos de','El Reino de'],mixto:['Las Tierras de','El Reino de','La Frontera de','El Valle de'],
  archipielago:['El Archipiélago de','La Isla de','Las Islas de','El Mar de'],montana:['Las Cumbres de','Los Picos de','Las Montañas de','El Paso de'],bosque:['El Bosque de','La Espesura de','El Valle de','La Floresta de'],yermo:['El Yermo de','Los Páramos de','Las Ruinas de','La Marca de']};
const NAME_ROOT=['Aldrenor','Vael Karum','Ithrandel','Morgath','Sol Invicta','Brumahelm','Tarkesh','Eldoria','Zhul Ammar','Kaer Dunmor','Nimbaris','Ossuaria','Valdemar','Pyrrhos','Lunaris','Gorgoth','Aethelmar','Skyrrin','Drakonia','Fenwick','Haldor','Irongate','Jarnvik','Kelmoor','Lothiriel','Mirkwater','Nordheim','Ostrava','Quelthas','Ravenmoor','Stormhold','Thalassa','Umbrion','Varnholt','Wyrmrest','Xanthor','Ysmir','Zephyra','Altaneda','Belmoral'];
const SPEC_BIOME=(()=>{const a=[];const r=mulberry(4242);for(let i=0;i<MAP_COUNT;i++)a.push(BIOME_IDS[Math.floor(r()*BIOME_IDS.length)]);return a})();
const SPEC_NAME=(()=>{const used=new Set(),a=[],r=mulberry(777);const roots=NAME_ROOT.slice();for(let i=roots.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[roots[i],roots[j]]=[roots[j],roots[i]]}
  for(let i=0;i<MAP_COUNT;i++){const pre=NAME_PRE[SPEC_BIOME[i]];let n=pre[Math.floor(r()*pre.length)]+' '+roots[i%roots.length];if(used.has(n))n+=' '+['II','III','IV','V','VI'][Math.floor(i/roots.length)-1]||'';let k=2;while(used.has(n)){n+=' '+k++}used.add(n);a.push(n)}return a})();

function mapSpec(i){
  const r=mulberry(9001+i*7919);
  const size=[144,144,150,156,162,168,174,180][Math.floor(r()*8)];
  const players=8;
  const biome=SPEC_BIOME[i],name=SPEC_NAME[i];
  const wl=BIOMES[biome].wl+(r()-.5)*.07;
  return{i,seed:1000003*(i+1)+17,name,size,players,biome,wl,forest:.55+r()*.7,monsters:.7+r()*.7,
    rich:.8+r()*.5,diff:r()<.25?3:r()<.5?2:1,
    desc:`${BIOMES[biome].n} · ${size}×${size} · ${players} jugadores`};
}

// ---------- ruido ----------
function noise2(seed){
  const h=(x,y)=>{let n=(x*374761393+y*668265263+seed*982451653)|0;n=Math.imul(n^(n>>>13),1274126177);return((n^(n>>>16))>>>0)/4294967296};
  return(x,y)=>{const xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi,u=xf*xf*(3-2*xf),v=yf*yf*(3-2*yf);
    const a=h(xi,yi),b=h(xi+1,yi),c=h(xi,yi+1),d=h(xi+1,yi+1);return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v};
}
function fbm(n,x,y,oct=4){let s=0,a=.5,f=1,t=0;for(let o=0;o<oct;o++){s+=a*n(x*f,y*f);t+=a;a*=.5;f*=2}return s/t}

// ---------- búsqueda de rutas (A*) ----------
const D8=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];
function tilePass(m,x,y){if(x<0||y<0||x>=m.w||y>=m.h)return false;const i=y*m.w+x;if(m.terr[i]===WATER||m.deco[i])return false;if(m.fp[i]&&m.fp[i]!==m.en[i])return false;return true}
function stepCost(m,x,y,px,py){const i=y*m.w+x,pi=py*m.w+px;let c=TERR[m.terr[i]].cost;if(m.road[i]&&m.road[pi])c=65;return(x!==px&&y!==py)?c*1.414:c}
let _A={g:null,from:null,heap:null,w:0,stamp:null,st:1};
function findPath(m,sx,sy,tx,ty,opt={}){
  const w=m.w,n=m.w*m.h;
  if(_A.w!==n){_A.g=new Float32Array(n);_A.from=new Int32Array(n);_A.stamp=new Uint32Array(n);_A.st=0;_A.w=n}
  const A=_A;A.st++;const st=A.st;
  const ti=ty*w+tx,si=sy*w+sx;
  const ok=opt.ok||(()=>true);
  const heap=[];const push=(f,i)=>{heap.push([f,i]);let k=heap.length-1;while(k>0){const p=(k-1)>>1;if(heap[p][0]<=heap[k][0])break;[heap[p],heap[k]]=[heap[k],heap[p]];k=p}};
  const pop=()=>{const top=heap[0],last=heap.pop();if(heap.length){heap[0]=last;let k=0;for(;;){let l=2*k+1,r=l+1,s=k;if(l<heap.length&&heap[l][0]<heap[s][0])s=l;if(r<heap.length&&heap[r][0]<heap[s][0])s=r;if(s===k)break;[heap[s],heap[k]]=[heap[k],heap[s]];k=s}}return top};
  A.stamp[si]=st;A.g[si]=0;A.from[si]=-1;push(0,si);
  const hf=(x,y)=>Math.max(Math.abs(x-tx),Math.abs(y-ty))*(opt.minCost||65);
  let expanded=0,lim=opt.limit||40000;
  while(heap.length){
    const[,ci]=pop();const cx=ci%w,cy=(ci/w)|0;
    if(ci===ti)break;
    if(++expanded>lim)return null;
    for(const[dx,dy]of D8){
      const nx=cx+dx,ny=cy+dy;if(nx<0||ny<0||nx>=w||ny>=m.h)continue;
      const ni=ny*w+nx;const isT=ni===ti;
      if(!isT){if(!tilePass(m,nx,ny))continue;if(m.en[ni])continue;if(!ok(nx,ny))continue}
      else{const i2=ni;if(m.terr[i2]===WATER||m.deco[i2])return null;if(m.fp[i2]&&m.fp[i2]!==m.en[i2])return null}
      if(dx&&dy&&!tilePass(m,cx+dx,cy)&&!tilePass(m,cx,cy+dy))continue;
      const g=A.g[ci]+stepCost(m,nx,ny,cx,cy)+(m.zoc&&m.zoc[ni]?250:0);
      if(A.stamp[ni]!==st||g<A.g[ni]){A.stamp[ni]=st;A.g[ni]=g;A.from[ni]=ci;push(g+hf(nx,ny),ni)}
    }
  }
  if(A.stamp[ti]!==st)return null;
  const path=[];let c=ti;while(c!==si){path.push({x:c%w,y:(c/w)|0,c:Math.round(stepCost(m,c%w,(c/w)|0,A.from[c]%w,(A.from[c]/w)|0))});c=A.from[c]}
  path.reverse();return path;
}
// Dijkstra con límite de coste -> tiles alcanzables (para IA y visualización)
function floodCost(m,sx,sy,maxCost,ok){
  const w=m.w,dist=new Map();const si=sy*w+sx;dist.set(si,0);const q=[[0,si]];
  while(q.length){let bi=0;for(let k=1;k<q.length;k++)if(q[k][0]<q[bi][0])bi=k;const[d,ci]=q.splice(bi,1)[0];if(d>dist.get(ci))continue;
    const cx=ci%w,cy=(ci/w)|0;
    for(const[dx,dy]of D8){const nx=cx+dx,ny=cy+dy;if(!tilePass(m,nx,ny))continue;const ni=ny*w+nx;if(m.en[ni]||(ok&&!ok(nx,ny)))continue;
      const nd=d+stepCost(m,nx,ny,cx,cy);if(nd>maxCost)continue;if(!dist.has(ni)||nd<dist.get(ni)){dist.set(ni,nd);q.push([nd,ni])}}}
  return dist;
}

// ---------- generación ----------
const FOOT={town:{w:4,h:3,ex:1,ey:2},mine:{w:3,h:2,ex:1,ey:1},dwell:{w:3,h:2,ex:1,ey:1},site:{w:1,h:1,ex:0,ey:0},res:{w:1,h:1,ex:0,ey:0},chest:{w:1,h:1,ex:0,ey:0},art:{w:1,h:1,ex:0,ey:0},mon:{w:1,h:1,ex:0,ey:0}};
function genMap(spec,opt={}){
  const W=spec.size,H=spec.size,N=W*H,r=mulberry(spec.seed);
  const m={spec,w:W,h:H,terr:new Uint8Array(N),road:new Uint8Array(N),deco:new Uint8Array(N),fp:new Int32Array(N),en:new Int32Array(N),objs:[],starts:[],occ:new Uint8Array(N)};
  const nH=noise2(spec.seed+1),nW=noise2(spec.seed+2),nF=noise2(spec.seed+3),nD=noise2(spec.seed+4);
  const biome=BIOMES[spec.biome];
  // 1. tierra / agua (se baja el nivel del mar hasta que la isla principal ocupe al menos el 40%)
  const hm=new Float32Array(N);
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){
    let h=fbm(nH,x/38,y/38,5);
    const ex=Math.min(x,W-1-x,y,H-1-y);h-=Math.max(0,(14-ex)/14)*.35*(spec.biome==='archipielago'?.3:1);hm[y*W+x]=h}
  const comp=new Int32Array(N);let best=-1,bestN=0;
  const labelComps=()=>{comp.fill(-1);best=-1;bestN=0;let cid=0;const stack=[];
    for(let s0=0;s0<N;s0++){if(m.terr[s0]===WATER||comp[s0]>=0)continue;let cnt=0;stack.push(s0);comp[s0]=cid;
      while(stack.length){const c=stack.pop();cnt++;const cx=c%W,cy=(c/W)|0;for(let k=0;k<4;k++){const nx=cx+[1,-1,0,0][k],ny=cy+[0,0,1,-1][k];if(nx<0||ny<0||nx>=W||ny>=H)continue;const ni=ny*W+nx;if(m.terr[ni]!==WATER&&comp[ni]<0){comp[ni]=cid;stack.push(ni)}}}
      if(cnt>bestN){bestN=cnt;best=cid}cid++}};
  for(let wl=spec.wl;;wl-=.015){for(let i=0;i<N;i++)m.terr[i]=hm[i]<wl?WATER:GRASS;labelComps();if(bestN/N>=.42||wl<.2)break}
  // 2. biomas por regiones de Voronoi deformadas
  const seeds=[];const nS=Math.round(W/9);const totalW=biome.pal.reduce((s,p)=>s+p[1],0);
  for(let k=0;k<nS*nS/2;k++){let t=r()*totalW,ty=biome.pal[0][0];for(const[tt,wgt]of biome.pal){t-=wgt;if(t<=0){ty=tt;break}}seeds.push([r()*W,r()*H,ty])}
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const i=y*W+x;if(m.terr[i]===WATER)continue;
    const px=x+(nW(x/14,y/14)-.5)*16,py=y+(nW(x/14+50,y/14+50)-.5)*16;let bd=1e9,bt=GRASS;
    for(const s of seeds){const d=(s[0]-px)**2+(s[1]-py)**2;if(d<bd){bd=d;bt=s[2]}}m.terr[i]=bt}
  // arena junto al agua en biomas con hierba
  for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){const i=y*W+x;if(m.terr[i]===GRASS||m.terr[i]===DIRT){
    if(m.terr[i-1]===WATER||m.terr[i+1]===WATER||m.terr[i-W]===WATER||m.terr[i+W]===WATER)if(nD(x/6,y/6)>.35)m.terr[i]=SAND}}
  // 3. solo la isla principal
  for(let i=0;i<N;i++)if(m.terr[i]!==WATER&&comp[i]!==best)m.terr[i]=WATER;
  m.land=bestN;
  // borde: obstáculo permanente
  const edge=(x,y)=>x<2||y<2||x>=W-2||y>=H-2;
  const free=(x,y)=>x>=3&&y>=3&&x<W-3&&y<H-3&&m.terr[y*W+x]!==WATER&&!m.occ[y*W+x];
  const area=(x,y,w,h)=>{for(let j=0;j<h;j++)for(let i=0;i<w;i++)if(!free(x+i,y+j))return false;return true};
  const mark=(x,y,w,h,mar=1)=>{for(let j=-mar;j<h+mar;j++)for(let i=-mar;i<w+mar;i++){const xx=x+i,yy=y+j;if(xx>=0&&yy>=0&&xx<W&&yy<H)m.occ[yy*W+xx]=1}};
  const addObj=(o)=>{const f=FOOT[o.t];Object.assign(o,{w:f.w,h:f.h,ex:f.ex,ey:f.ey});const idx=m.objs.length;m.objs.push(o);
    for(let j=0;j<o.h;j++)for(let i=0;i<o.w;i++)m.fp[(o.y+j)*W+o.x+i]=idx+1;m.en[(o.y+o.ey)*W+o.x+o.ex]=idx+1;
    mark(o.x,o.y,o.w,o.h,o.t==='town'||o.t==='mine'||o.t==='dwell'?1:0);o.id=idx;return o};
  const mnd=(x,y,L)=>{let d=1e9;for(const s of L)d=Math.min(d,Math.hypot(s.x-x,s.y-y));return d};
  const randPos=(w,h,minFrom,tries=300)=>{for(let k=0;k<tries;k++){const x=3+Math.floor(r()*(W-6-w)),y=3+Math.floor(r()*(H-6-h));if(area(x,y,w,h)&&(!minFrom||mnd(x,y,minFrom.l)>=minFrom.d))return[x,y]}return null};
  // 4. posiciones iniciales (muestreo del punto más lejano)
  const cand=[];for(let k=0;k<1500&&cand.length<500;k++){const x=14+Math.floor(r()*(W-28)),y=14+Math.floor(r()*(H-28));
    let okc=true;for(let j=-6;j<=6&&okc;j+=3)for(let i=-6;i<=6;i+=3)if(m.terr[(y+j)*W+x+i]===WATER)okc=false;if(okc)cand.push({x,y})}
  if(cand.length<spec.players)throw new Error('mapa sin espacio');
  const starts=[cand[Math.floor(r()*cand.length)]];
  while(starts.length<spec.players){let bc=null,bd=-1;for(const c of cand){const d=mnd(c.x,c.y,starts);if(d>bd){bd=d;bc=c}}starts.push(bc)}
  // ciudades iniciales
  const placeTown=(cx,cy,fi,owner,neutralGarrison)=>{
    // suelo nativo alrededor
    const nt=FDEF[fi].terr;for(let j=-5;j<=8;j++)for(let i=-6;i<=9;i++){const x=cx+i,y=cy+j;if(x<3||y<3||x>=W-3||y>=H-3)continue;const d=Math.hypot(i-1.5,j-1);
      if(d<5.5&&m.terr[y*W+x]!==WATER)m.terr[y*W+x]=nt}
    const o=addObj({t:'town',x:cx,y:cy,fi,owner,name:TOWN_NAMES[(r()*TOWN_NAMES.length)|0]+' '+FDEF[fi].short,b:{},avail:[],gar:[],spells:[]});return o};
  const order=[];for(let i=0;i<spec.players;i++)order.push(i);
  // asignación de facciones: distintas mientras sea posible
  const facs=[0,1,2,3,4,5,6,7];for(let i=facs.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[facs[i],facs[j]]=[facs[j],facs[i]]}
  if(opt.fac0!=null){const k=facs.indexOf(opt.fac0);[facs[0],facs[k]]=[facs[k],facs[0]]}
  m.facs=facs;
  starts.forEach((s,pi)=>{
    const tx=clamp(s.x-1,4,W-9),ty=clamp(s.y-1,4,H-8);
    // despejar zona
    for(let j=-1;j<5;j++)for(let i=-1;i<6;i++){m.occ[(ty+j)*W+tx+i]=0}
    const o=placeTown(tx,ty,facs[pi%8],pi,false);o.start=pi;
    m.starts.push({x:tx+1,y:ty+3,town:o.id,fac:facs[pi%8]});
  });
  // 5. minas iniciales y guardianes débiles
  const startList=m.starts.map(s=>({x:s.x,y:s.y}));
  const mineDefs=['wood','ore','gold'];
  m.starts.forEach((s,pi)=>{
    for(const res of ['wood','ore']){for(let k=0;k<200;k++){const x=s.x-12+Math.floor(r()*24),y=s.y-8+Math.floor(r()*18);if(area(x,y,3,2)&&Math.hypot(x-s.x,y-s.y)>5){addObj({t:'mine',res,x,y,owner:-1});break}}}
    for(const res of ['gold']){for(let k=0;k<300;k++){const x=s.x-14+Math.floor(r()*28),y=s.y-10+Math.floor(r()*20);if(area(x,y,3,2)&&Math.hypot(x-s.x,y-s.y)>7){const o=addObj({t:'mine',res,x,y,owner:-1});o.guard=1;break}}}
    // recursos iniciales cerca
    for(let k=0;k<7;k++){const x=s.x-9+Math.floor(r()*18),y=s.y-7+Math.floor(r()*14);if(free(x,y)&&Math.hypot(x-s.x,y-s.y)>3){const rs=k<2?'gold':pick(r,RES.slice(1));addObj({t:'res',res:rs,n:rs==='gold'?500*(1+(r()<.5?1:0)):rs==='wood'||rs==='ore'?irnd(r,4,8):irnd(r,2,4),x,y})}}
  });
  const dstart=(x,y)=>mnd(x,y,startList);
  const maxD=Math.hypot(W,H)*.42;
  const danger=(x,y)=>Math.min(1,dstart(x,y)/maxD);
  // 6. ciudades neutrales
  const nNeutral=Math.round(spec.players*1.4+W/30);
  for(let k=0;k<nNeutral;k++){const p=randPos(4,3,{l:m.objs.filter(o=>o.t==='town'),d:24});if(!p)continue;
    const fi=Math.floor(r()*8);const o=placeTown(p[0],p[1],fi,-1,true);const dg=danger(p[0],p[1]);
    o.gar=garrison(o.fi,40+dg*dg*2200*spec.monsters,r)}
  // 7. minas generales
  const mineTarget={gold:Math.max(4,Math.round(spec.players*2.2)),wood:Math.round(spec.players*1.2),ore:Math.round(spec.players*1.2),mercury:Math.round(spec.players*.9),sulfur:Math.round(spec.players*.9),crystal:Math.round(spec.players*.9),gems:Math.round(spec.players*.9)};
  const guardOf=(o,pw)=>{ // monstruo junto al punto de entrada
    const ex=o.x+o.ex,ey=o.y+o.ey;const cands=[[0,1],[1,1],[-1,1],[1,0],[-1,0],[0,2]];
    for(const[dx,dy]of cands){const x=ex+dx,y=ey+dy;if(x>=2&&y>=2&&x<W-2&&y<H-2&&m.terr[y*W+x]!==WATER&&!m.fp[y*W+x]){const mo=makeMonster(x,y,pw,r);if(mo){addObj(mo);return}}}};
  for(const res in mineTarget)for(let k=0;k<mineTarget[res]*(W/150)**2;k++){
    const p=randPos(3,2,{l:startList,d:13});if(!p)continue;const o=addObj({t:'mine',res,x:p[0],y:p[1],owner:-1});
    guardOf(o,60+danger(p[0],p[1])**2*2500*spec.monsters)}
  // 8. viviendas, sitios, artefactos, cofres, recursos
  const sc=(W*H)/(150*150);
  for(let k=0;k<Math.round(22*sc);k++){const p=randPos(3,2,{l:startList,d:10});if(!p)continue;const dg=danger(p[0],p[1]);
    const maxT=dg<.25?3:dg<.55?5:7,tier=irnd(r,1,maxT),fi=Math.floor(r()*8);const cid=`f${fi}t${tier}`;
    const o=addObj({t:'dwell',cr:cid,n:CR[cid].grow*2,x:p[0],y:p[1],owner:-1});guardOf(o,30+dg*dg*1500*spec.monsters)}
  const sites=['shrine','hut','well','stone','stable','mill','shrine','stone'];
  for(let k=0;k<Math.round(46*sc);k++){const p=randPos(1,1,{l:startList,d:6});if(!p)continue;const kk=pick(r,sites);
    const o=addObj({t:'site',k:kk,x:p[0],y:p[1],used:{},spell:pick(r,SPELL_IDS),skill:pick(r,SKILL_IDS)});if(r()<.5)guardOf(o,40+danger(p[0],p[1])**2*900*spec.monsters)}
  for(let k=0;k<Math.round(34*sc);k++){const p=randPos(1,1,{l:startList,d:12});if(!p)continue;const dg=danger(p[0],p[1]);
    const lvl=dg<.35?1:dg<.65?2:3;const cand=ART_IDS.filter(a=>ART[a].v<=lvl+1&&ART[a].v>=Math.max(1,lvl-1));
    const o=addObj({t:'art',art:pick(r,cand),x:p[0],y:p[1]});guardOf(o,100+dg*dg*3500*spec.monsters)}
  for(let k=0;k<Math.round(120*sc*spec.rich);k++){const p=randPos(1,1,null,60);if(!p)continue;const dg=danger(p[0],p[1]);
    addObj({t:'chest',x:p[0],y:p[1]});if(r()<.6)guardOf(m.objs[m.objs.length-1],20+dg*dg*1200*spec.monsters)}
  for(let k=0;k<Math.round(430*sc*spec.rich);k++){const p=randPos(1,1,null,60);if(!p)continue;
    const rs=r()<.28?'gold':pick(r,RES.slice(1));const g=rs==='gold';addObj({t:'res',res:rs,n:g?irnd(r,3,10)*100:(rs==='wood'||rs==='ore')?irnd(r,4,12):irnd(r,2,6),x:p[0],y:p[1]})}
  // 9. monstruos errantes
  for(let k=0;k<Math.round(520*sc*spec.monsters);k++){const x=3+Math.floor(r()*(W-6)),y=3+Math.floor(r()*(H-6));if(!free(x,y)||dstart(x,y)<10)continue;
    const dg=danger(x,y);const mo=makeMonster(x,y,25+dg*dg*3200*spec.monsters*(0.5+r()),r);if(mo)addObj(mo)}
  // 10. caminos entre ciudades
  const towns=m.objs.filter(o=>o.t==='town');
  const entry=o=>({x:o.x+o.ex,y:o.y+o.ey+1});
  const connect=(a,b)=>{const ea=entry(a),eb=entry(b);const ok=(x,y)=>true;
    const p=findPath(m,ea.x,ea.y,eb.x,eb.y,{limit:60000});if(p){m.road[ea.y*W+ea.x]=1;for(const s of p)if(!m.en[s.y*W+s.x]||(s.x===eb.x&&s.y===eb.y))m.road[s.y*W+s.x]=1}};
  // las rutas se calculan antes de decorar el terreno
  for(const t of towns){const near=towns.filter(o=>o!==t).sort((a,b)=>Math.hypot(a.x-t.x,a.y-t.y)-Math.hypot(b.x-t.x,b.y-t.y)).slice(0,2);for(const n of near)connect(t,n)}
  // 11. decoración / obstáculos
  const density=spec.forest;
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const i=y*W+x;if(m.terr[i]===WATER)continue;
    if(edge(x,y)){m.deco[i]=1+((x*7+y*13)%3);continue}
    if(m.occ[i]||m.fp[i]||m.road[i])continue;
    // márgenes cerca de caminos y objetos
    const a=fbm(nF,x/9,y/9,3),b=nD(x/3,y/3);
    const th=.60-.07*density;
    if(a>th&&b>.28)m.deco[i]=1+Math.floor(r()*3);
    else if(r()<.012*density)m.deco[i]=1+Math.floor(r()*3);
  }
  // despeja alrededor de entradas y garantiza conectividad desde cada inicio
  for(const o of m.objs){const ex=o.x+o.ex,ey=o.y+o.ey;for(let j=-1;j<=2;j++)for(let i=-1;i<=1;i++){const x=ex+i,y=ey+j;if(x>0&&y>0&&x<W-1&&y<H-1&&!(m.fp[y*W+x]&&m.fp[y*W+x]!==m.en[y*W+x]))m.deco[y*W+x]=0}}
  for(let i=0;i<N;i++)if(m.road[i])m.deco[i]=0;
  const seen=new Uint8Array(N);const s0=m.starts[0];const stk=[s0.y*W+s0.x];seen[stk[0]]=1;m.deco[stk[0]]=0;
  while(stk.length){const c=stk.pop();const cx=c%W,cy=(c/W)|0;for(const[dx,dy]of D8){const nx=cx+dx,ny=cy+dy;if(!tilePass(m,nx,ny)&&!(nx>=0&&ny>=0&&nx<W&&ny<H&&m.en[ny*W+nx]))continue;const ni=ny*W+nx;if(seen[ni])continue;seen[ni]=1;if(!m.en[ni])stk.push(ni)}}
  // abre pasillos hacia objetos aislados (talando decoración) o los elimina
  for(const o of m.objs){const ei=(o.y+o.ey)*W+o.x+o.ex;let ok=false;for(const[dx,dy]of D8){const ni=ei+dy*W+dx;if(seen[ni]){ok=true;break}}
    if(!ok&&o.t!=='town'){o.dead=1}}
  // un último paso: desbloquear isleños — conecta cada inicio con el 0
  for(let k=1;k<m.starts.length;k++){const s=m.starts[k];if(!findPath(m,s0.x,s0.y,s.x,s.y,{limit:80000})){
    // abre un corredor recto
    let x=s0.x,y=s0.y;while(x!==s.x||y!==s.y){if(x<s.x)x++;else if(x>s.x)x--;if(y<s.y&&x===s.x)y++;else if(y>s.y&&x===s.x)y--;const i=y*W+x;m.deco[i]=0;if(m.terr[i]===WATER)m.terr[i]=DIRT}}}
  // eliminar los objetos muertos
  for(const o of m.objs){if(o.dead){const f=o;for(let j=0;j<f.h;j++)for(let i=0;i<f.w;i++){const k=(f.y+j)*W+f.x+i;if(m.fp[k]===f.id+1)m.fp[k]=0;if(m.en[k]===f.id+1)m.en[k]=0}}}
  // inicializar ciudades
  for(const o of m.objs)if(o.t==='town')initTown(o,r,o.owner<0);
  m.occ=null;
  return m;
}
const TOWN_NAMES=['Aldea','Villa','Puerto','Fuerte','Torre','Monte','Valle','Cumbre','Rocas','Alba','Ocaso','Bruma','Sol','Luna','Piedra','Cruce','Río','Lago','Nube','Hierro','Cobre','Trono','Alcázar','Mirador'];
function garrison(fi,power,r){
  const g=[];const units=FDEF[fi].units;let left=power;
  for(let k=0;k<5&&left>5;k++){const t=Math.min(6,Math.max(0,Math.floor(Math.log(left/6)/Math.log(2.4)+r()*1.4)-1));const c=CR[units[Math.min(13,t+(r()<.4?7:0))]];
    const n=Math.max(1,Math.round(left/(c.val*(k===0?1.6:3))));left-=n*c.val;g.push({id:c.id,n})}
  return g;
}
function makeMonster(x,y,power,r){
  // elegir criatura cuyo valor encaje con el poder
  const lo=power/70,hi=power/2.2;const cand=ALL_BY_VAL.filter(id=>{const v=CR[id].val;return v>=lo&&v<=hi});
  if(!cand.length)return null;const cid=cand[Math.floor(Math.pow(r(),.7)*cand.length)];
  const n=Math.max(1,Math.round(power*(0.75+r()*.5)/CR[cid].val));
  return{t:'mon',cr:cid,n,x,y};
}
function initTown(o,r,neutral){
  o.b={hall1:1,dw1:1,dw2:1};o.avail=[];for(let t=1;t<=7;t++)o.avail.push(0);
  o.avail[0]=CR[FDEF[o.fi].units[0]].grow;o.avail[1]=CR[FDEF[o.fi].units[1]].grow;
  o.spells=[];for(let lv=1;lv<=4;lv++){const pool=SPELL_IDS.filter(s=>SPELLS[s].lv===lv);const a=[];while(a.length<Math.min(2,pool.length)){const s=pool[Math.floor(r()*pool.length)];if(!a.includes(s))a.push(s)}o.spells.push(...a)}
  o.builtToday=false;
  if(neutral){o.b.dw3=1;if(r()<.6)o.b.tavern=1}
}
