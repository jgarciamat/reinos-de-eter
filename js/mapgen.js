'use strict';
// =====================================================================
//  Generación procedural de 200 escenarios gigantes de 2 niveles
//  (superficie + subterráneo) y búsqueda de rutas (tierra y mar)
// =====================================================================
const MAP_COUNT=200;
const BIOMES={
  templado:{n:'Templado',pal:[[GRASS,6],[DIRT,2],[ROUGH,1.2],[SWAMP,.5]],wl:.42},
  boreal:{n:'Nevado',pal:[[SNOW,6],[DIRT,1.5],[ROUGH,2],[GRASS,1]],wl:.40},
  desierto:{n:'Desértico',pal:[[SAND,6],[DIRT,2],[ROUGH,2],[ASH,.6]],wl:.36},
  pantano:{n:'Pantanoso',pal:[[SWAMP,5],[GRASS,2.5],[DIRT,1.5],[SAND,.4]],wl:.46},
  volcan:{n:'Volcánico',pal:[[ASH,6],[ROUGH,3],[DIRT,1.2],[SAND,.4]],wl:.36,liquid:LAVA},
  mixto:{n:'Mixto',pal:[[GRASS,3],[DIRT,1.5],[SAND,1.5],[SNOW,1.5],[SWAMP,1],[ROUGH,2],[ASH,1.2]],wl:.42},
  archipielago:{n:'Archipiélago',pal:[[GRASS,4],[SAND,3],[DIRT,1],[SWAMP,.5]],wl:.47,sea:1},
  montana:{n:'Montañoso',pal:[[ROUGH,5],[SNOW,2.5],[DIRT,2],[GRASS,1.5]],wl:.34},
  bosque:{n:'Bosque profundo',pal:[[GRASS,6],[DIRT,1.5],[SWAMP,1]],wl:.40},
  yermo:{n:'Yermo infernal',pal:[[DIRT,4],[ROUGH,3],[ASH,3],[SAND,1]],wl:.34,liquid:LAVA},
  subt:{n:'Subterráneo',pal:[[SUBT,6],[ROUGH,2.4],[DIRT,1.4],[ASH,.8]],wl:.38,under:1}
};
const BIOME_IDS=Object.keys(BIOMES).filter(k=>!BIOMES[k].under);
const NAME_PRE={templado:['El Valle de','La Llanura de','El Reino de','La Marca de'],boreal:['Las Cumbres de','Las Tierras de','El Reino de','La Frontera de'],desierto:['El Desierto de','Las Arenas de','El Reino de','El Yermo de'],
  pantano:['La Ciénaga de','Los Marjales de','El Páramo de','La Marca de'],volcan:['Las Cenizas de','El Volcán de','Los Páramos de','El Reino de'],mixto:['Las Tierras de','El Reino de','La Frontera de','El Valle de'],
  archipielago:['El Archipiélago de','La Isla de','Las Islas de','El Mar de'],montana:['Las Cumbres de','Los Picos de','Las Montañas de','El Paso de'],bosque:['El Bosque de','La Espesura de','El Valle de','La Floresta de'],yermo:['El Yermo de','Los Páramos de','Las Ruinas de','La Marca de']};
const NAME_ROOT=['Aldrenor','Vael Karum','Ithrandel','Morgath','Sol Invicta','Brumahelm','Tarkesh','Eldoria','Zhul Ammar','Kaer Dunmor','Nimbaris','Ossuaria','Valdemar','Pyrrhos','Lunaris','Gorgoth','Aethelmar','Skyrrin','Drakonia','Fenwick','Haldor','Irongate','Jarnvik','Kelmoor','Lothiriel','Mirkwater','Nordheim','Ostrava','Quelthas','Ravenmoor','Stormhold','Thalassa','Umbrion','Varnholt','Wyrmrest','Xanthor','Ysmir','Zephyra','Altaneda','Belmoral'];
const SPEC_BIOME=(()=>{const a=[];const r=mulberry(4242);for(let i=0;i<MAP_COUNT;i++)a.push(BIOME_IDS[Math.floor(r()*BIOME_IDS.length)]);return a})();
const SPEC_NAME=(()=>{const used=new Set(),a=[],r=mulberry(777);const roots=NAME_ROOT.slice();for(let i=roots.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[roots[i],roots[j]]=[roots[j],roots[i]]}
  for(let i=0;i<MAP_COUNT;i++){const pre=NAME_PRE[SPEC_BIOME[i]];let n=pre[Math.floor(r()*pre.length)]+' '+roots[i%roots.length];if(used.has(n))n+=' '+['II','III','IV','V','VI'][Math.floor(i/roots.length)-1]||'';let k=2;while(used.has(n)){n+=' '+k++}used.add(n);a.push(n)}return a})();

// dificultad del mapa: recursos sobre el suelo, minas, fuerza de monstruos/guarniciones, recursos iniciales y economía de la IA
const MAPLV=[null,
  {n:'Muy fácil',rich:1.6,mon:.6,mines:1.4,start:1.6,ai:.85},{n:'Fácil',rich:1.25,mon:.82,mines:1.15,start:1.25,ai:.95},
  {n:'Normal',rich:1,mon:1,mines:1,start:1,ai:1},{n:'Difícil',rich:.68,mon:1.3,mines:.78,start:.7,ai:1.12},{n:'Brutal',rich:.42,mon:1.7,mines:.55,start:.45,ai:1.3}];
const VICT=[{t:'conquest'},{t:'grail'},{t:'capital'},{t:'gold'},{t:'quests'},{t:'survive'}];
function victoryText(v){
  switch(v.t){case'grail':return'Encuentra el Cáliz de Éter (custodiado en la zona marcada del mapa) y llévalo a una de tus ciudades.';
    case'capital':return'Conquista la Ciudadela Real, la capital fortificada de este mundo.';
    case'gold':return`Reúne ${v.n.toLocaleString('es-ES')} de oro a la vez.`;
    case'quests':return`Completa ${v.n} misiones de los videntes.`;
    case'survive':return`Aguanta hasta el día ${v.n} con alguna ciudad o héroe.`;
    default:return'Derrota a todos tus rivales.'}}
const MAP_SCALE=3.15; // ~10 veces más superficie que antes
function mapSpec(i){
  const r=mulberry(9001+i*7919);
  const size=Math.round([144,144,150,156,162,168,174,180][Math.floor(r()*8)]*MAP_SCALE/2)*2;
  const biome=SPEC_BIOME[i],name=SPEC_NAME[i],B=BIOMES[biome];
  const wl=B.wl+(r()-.5)*.06;
  const sea=!!B.sea||(!B.liquid&&r()<.3);
  const lr=r(),level=lr<.14?1:lr<.38?2:lr<.68?3:lr<.9?4:5,LV=MAPLV[level];
  const startTowns=r()<.4?2:1;
  const vt=VICT[Math.floor(r()*VICT.length)];const victory={t:vt.t};
  if(vt.t==='gold')victory.n=[40000,60000,90000,130000,180000][level-1];
  if(vt.t==='quests')victory.n=3+level*2;
  if(vt.t==='survive')victory.n=[90,110,140,170,200][level-1];
  const forest=.55+r()*.7,monsters=(.7+r()*.7)*LV.mon,rich=(.8+r()*.5)*LV.rich;
  return{i,seed:1000003*(i+1)+17,name,size,players:8,biome,wl,forest,monsters,rich,sea,diff:1,level,lvn:LV.n,mineK:LV.mines,startK:LV.start,aiK:LV.ai,startTowns,victory,
    desc:`${B.n} · ${size}×${size} · 2 niveles · ${startTowns} castillo${startTowns>1?'s':''} inicial${startTowns>1?'es':''}${sea?' · mar':''}${B.liquid===LAVA?' · lava':''}`};
}
// ---------- ruido ----------
function noise2(seed){
  const h=(x,y)=>{let n=(x*374761393+y*668265263+seed*982451653)|0;n=Math.imul(n^(n>>>13),1274126177);return((n^(n>>>16))>>>0)/4294967296};
  return(x,y)=>{const xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi,u=xf*xf*(3-2*xf),v=yf*yf*(3-2*yf);
    const a=h(xi,yi),b=h(xi+1,yi),c=h(xi,yi+1),d=h(xi+1,yi+1);return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v};
}
function fbm(n,x,y,oct=4){let s=0,a=.5,f=1,t=0;for(let o=0;o<oct;o++){s+=a*n(x*f,y*f);t+=a;a*=.5;f*=2}return s/t}

// ---------- rutas (A*) ----------
const D8=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];
const PF_RED=[0,.25,.5,1];
function tilePass(m,x,y,water){if(x<0||y<0||x>=m.w||y>=m.h)return false;const i=y*m.w+x;const t=m.terr[i];if(water?t!==WATER:IMP(t))return false;if(m.deco[i])return false;if(m.fp[i]&&m.fp[i]!==m.en[i])return false;return true}
function stepCost(m,x,y,px,py,pf,water){
  const i=y*m.w+x,pi=py*m.w+px;let c=100;
  if(!water){const tc=TERR[m.terr[i]].cost;c=100+(tc-100)*(1-PF_RED[pf||0]);if(m.road[i]&&m.road[pi])c=65}
  return(x!==px&&y!==py)?c*1.414:c;
}
let _A={g:null,from:null,stamp:null,st:0,n:0};
function findPath(m,sx,sy,tx,ty,opt={}){
  const w=m.w,n=m.w*m.h,water=!!opt.boat,pf=opt.pf||0;
  if(_A.n!==n){_A.g=new Float32Array(n);_A.from=new Int32Array(n);_A.stamp=new Uint32Array(n);_A.st=0;_A.n=n}
  const A=_A;A.st++;const st=A.st;const ti=ty*w+tx,si=sy*w+sx;const ok=opt.ok||null;
  const heap=[];const push=(f,i)=>{heap.push([f,i]);let k=heap.length-1;while(k>0){const p=(k-1)>>1;if(heap[p][0]<=heap[k][0])break;[heap[p],heap[k]]=[heap[k],heap[p]];k=p}};
  const pop=()=>{const top=heap[0],last=heap.pop();if(heap.length){heap[0]=last;let k=0;for(;;){let l=2*k+1,r=l+1,s=k;if(l<heap.length&&heap[l][0]<heap[s][0])s=l;if(r<heap.length&&heap[r][0]<heap[s][0])s=r;if(s===k)break;[heap[s],heap[k]]=[heap[k],heap[s]];k=s}}return top};
  // el destino debe ser válido
  {const t=m.terr[ti],ob=m.en[ti]?m.objs[m.en[ti]-1]:null;
    if(m.deco[ti])return null;if(m.fp[ti]&&m.fp[ti]!==m.en[ti])return null;
    if(water){if(t!==WATER&&IMP(t))return null}else{if(IMP(t)&&!(t===WATER&&ob&&ob.t==='boat'))return null}}
  A.stamp[si]=st;A.g[si]=0;A.from[si]=-1;push(0,si);
  const hf=(x,y)=>Math.max(Math.abs(x-tx),Math.abs(y-ty))*(opt.minCost||65);
  let expanded=0;const lim=opt.limit||90000;
  while(heap.length){
    const[,ci]=pop();const cx=ci%w,cy=(ci/w)|0;
    if(ci===ti)break;
    if(++expanded>lim)return null;
    for(const[dx,dy]of D8){
      const nx=cx+dx,ny=cy+dy;if(nx<0||ny<0||nx>=w||ny>=m.h)continue;
      const ni=ny*w+nx;const isT=ni===ti;
      if(!isT){if(!tilePass(m,nx,ny,water))continue;if(m.en[ni])continue;if(ok&&!ok(nx,ny))continue}
      if(dx&&dy&&!tilePass(m,cx+dx,cy,water)&&!tilePass(m,cx,cy+dy,water))continue;
      const g=A.g[ci]+stepCost(m,nx,ny,cx,cy,pf,water&&m.terr[ni]===WATER)+(m.zoc&&m.zoc[ni]?250:0);
      if(A.stamp[ni]!==st||g<A.g[ni]){A.stamp[ni]=st;A.g[ni]=g;A.from[ni]=ci;push(g+hf(nx,ny),ni)}
    }
  }
  if(A.stamp[ti]!==st)return null;
  const path=[];let c=ti;while(c!==si){const px=A.from[c]%w,py=(A.from[c]/w)|0,x=c%w,y=(c/w)|0;path.push({x,y,c:Math.round(stepCost(m,x,y,px,py,pf,water&&m.terr[c]===WATER))});c=A.from[c]}
  path.reverse();return path;
}

// ---------- generación ----------
const FOOT={town:{w:4,h:3,ex:1,ey:2},mine:{w:3,h:2,ex:1,ey:1},dwell:{w:3,h:2,ex:1,ey:1},site:{w:1,h:1,ex:0,ey:0},res:{w:1,h:1,ex:0,ey:0},chest:{w:1,h:1,ex:0,ey:0},art:{w:1,h:1,ex:0,ey:0},mon:{w:1,h:1,ex:0,ey:0},
  gate:{w:2,h:2,ex:0,ey:1},mono:{w:1,h:1,ex:0,ey:0},boat:{w:1,h:1,ex:0,ey:0}};
const TOWN_NAMES=['Aldea','Villa','Puerto','Fuerte','Torre','Monte','Valle','Cumbre','Rocas','Alba','Ocaso','Bruma','Sol','Luna','Piedra','Cruce','Río','Lago','Nube','Hierro','Cobre','Trono','Alcázar','Mirador'];
const ART_PRICE=[0,900,2200,5000,10000,18000];
function genLevel(spec,opt={}){
  const under=!!opt.under,W=spec.size,H=spec.size,N=W*H,r=mulberry(spec.seed+(under?7777:0));
  const m={spec,w:W,h:H,terr:new Uint8Array(N),road:new Uint8Array(N),deco:new Uint8Array(N),fp:new Int32Array(N),en:new Int32Array(N),objs:[],starts:[],occ:new Uint8Array(N),gates:[],lvl:under?1:0};
  const nH=noise2(spec.seed+1+(under?50:0)),nW=noise2(spec.seed+2),nF=noise2(spec.seed+3),nD=noise2(spec.seed+4),nR=noise2(spec.seed+9);
  const bio=BIOMES[under?'subt':spec.biome];const LIQ=under?(opt.liquid||LAVA):(bio.liquid||WATER);const BASE=under?SUBT:GRASS;
  const keepIslands=!under&&spec.sea&&LIQ===WATER;
  // 1. tierra / líquido (se baja el nivel hasta que la masa principal ocupe lo suficiente)
  const hm=new Float32Array(N);
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){let h=fbm(nH,x/38,y/38,5);const ex=Math.min(x,W-1-x,y,H-1-y);h-=Math.max(0,(14-ex)/14)*.35*(spec.biome==='archipielago'&&!under?.3:1);hm[y*W+x]=h}
  const comp=new Int32Array(N);let best=-1,bestN=0;const csize=[];
  const label=()=>{comp.fill(-1);best=-1;bestN=0;csize.length=0;let cid=0;const stack=[];
    for(let s0=0;s0<N;s0++){if(IMP(m.terr[s0])||comp[s0]>=0)continue;let cnt=0;stack.push(s0);comp[s0]=cid;
      while(stack.length){const c=stack.pop();cnt++;const cx=c%W,cy=(c/W)|0;for(let k=0;k<4;k++){const nx=cx+[1,-1,0,0][k],ny=cy+[0,0,1,-1][k];if(nx<0||ny<0||nx>=W||ny>=H)continue;const ni=ny*W+nx;if(!IMP(m.terr[ni])&&comp[ni]<0){comp[ni]=cid;stack.push(ni)}}}
      csize.push(cnt);if(cnt>bestN){bestN=cnt;best=cid}cid++}};
  for(let wl=spec.wl;;wl-=.015){for(let i=0;i<N;i++)m.terr[i]=hm[i]<wl?LIQ:BASE;label();if(bestN/N>=(under?.4:.45)||wl<.2)break}
  // 2. biomas por regiones de Voronoi deformadas
  const seeds=[];const nS=Math.round(W/9);const totalW=bio.pal.reduce((s,p)=>s+p[1],0);
  for(let k=0;k<nS*nS/2;k++){let t=r()*totalW,ty=bio.pal[0][0];for(const[tt,wgt]of bio.pal){t-=wgt;if(t<=0){ty=tt;break}}seeds.push([r()*W,r()*H,ty])}
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const i=y*W+x;if(IMP(m.terr[i]))continue;
    const px=x+(nW(x/14,y/14)-.5)*16,py=y+(nW(x/14+50,y/14+50)-.5)*16;let bd=1e9,bt=BASE;
    for(const s of seeds){const d=(s[0]-px)**2+(s[1]-py)**2;if(d<bd){bd=d;bt=s[2]}}
    if((bt===ASH||under&&bt===ROUGH)&&nW(x/7+100,y/7+100)>.67)bt=LAVA;
    m.terr[i]=bt}
  if(LIQ===WATER&&!under)for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){const i=y*W+x;if(m.terr[i]===GRASS||m.terr[i]===DIRT){
    if(m.terr[i-1]===WATER||m.terr[i+1]===WATER||m.terr[i-W]===WATER||m.terr[i+W]===WATER)if(nD(x/6,y/6)>.35)m.terr[i]=SAND}}
  label();
  // 3. masa principal (y, en mapas de mar, islas grandes)
  for(let i=0;i<N;i++)if(!IMP(m.terr[i])&&comp[i]!==best){if(!keepIslands||csize[comp[i]]<30)m.terr[i]=LIQ}
  m.land=bestN;
  const edge=(x,y)=>x<2||y<2||x>=W-2||y>=H-2;
  const free=(x,y)=>x>=3&&y>=3&&x<W-3&&y<H-3&&!IMP(m.terr[y*W+x])&&!m.occ[y*W+x];
  const area=(x,y,w,h)=>{for(let j=0;j<h;j++)for(let i=0;i<w;i++)if(!free(x+i,y+j))return false;return true};
  const mark=(x,y,w,h,mar=1)=>{for(let j=-mar;j<h+mar;j++)for(let i=-mar;i<w+mar;i++){const xx=x+i,yy=y+j;if(xx>=0&&yy>=0&&xx<W&&yy<H)m.occ[yy*W+xx]=1}};
  const addObj=(o)=>{const f=FOOT[o.t];Object.assign(o,{w:f.w,h:f.h,ex:f.ex,ey:f.ey});const idx=m.objs.length;m.objs.push(o);
    for(let j=0;j<o.h;j++)for(let i=0;i<o.w;i++)m.fp[(o.y+j)*W+o.x+i]=idx+1;m.en[(o.y+o.ey)*W+o.x+o.ex]=idx+1;
    mark(o.x,o.y,o.w,o.h,o.t==='town'||o.t==='mine'||o.t==='dwell'||o.t==='gate'?1:0);o.id=idx;return o};
  const mnd=(x,y,L)=>{let d=1e9;for(const s of L)d=Math.min(d,Math.hypot(s.x-x,s.y-y));return d};
  const randPos=(w,h,minFrom,tries=300)=>{for(let k=0;k<tries;k++){const x=3+Math.floor(r()*(W-6-w)),y=3+Math.floor(r()*(H-6-h));if(area(x,y,w,h)&&(!minFrom||mnd(x,y,minFrom.l)>=minFrom.d))return[x,y]}return null};
  const carve=(sx,sy,tx,ty)=>{let x=sx,y=sy;while(x!==tx||y!==ty){if(x<tx)x++;else if(x>tx)x--;if(y<ty&&x===tx)y++;else if(y>ty&&x===tx)y--;const i=y*W+x;m.deco[i]=0;if(IMP(m.terr[i]))m.terr[i]=BASE}};
  const placeTown=(cx,cy,fi,owner)=>{
    const nt=under?SUBT:FDEF[fi].terr;for(let j=-5;j<=8;j++)for(let i=-6;i<=9;i++){const x=cx+i,y=cy+j;if(x<3||y<3||x>=W-3||y>=H-3)continue;const d=Math.hypot(i-1.5,j-1);
      if(d<5.5&&!IMP(m.terr[y*W+x]))m.terr[y*W+x]=nt}
    return addObj({t:'town',x:cx,y:cy,fi,owner,name:TOWN_NAMES[(r()*TOWN_NAMES.length)|0]+' '+FDEF[fi].short,b:{},avail:[],gar:[],spells:[]})};
  const used=opt.used||new Set();
  let startList=[],seedPt={x:0,y:0};
  if(!under){
    const cand=[];for(let k=0;k<1800&&cand.length<500;k++){const x=14+Math.floor(r()*(W-28)),y=14+Math.floor(r()*(H-28));
      let okc=true;for(let j=-6;j<=6&&okc;j+=3)for(let i=-6;i<=6;i+=3)if(IMP(m.terr[(y+j)*W+x+i]))okc=false;if(okc)cand.push({x,y})}
    if(cand.length<spec.players)throw new Error('mapa sin espacio');
    const starts=[cand[Math.floor(r()*cand.length)]];
    while(starts.length<spec.players){let bc=null,bd=-1;for(const c of cand){const d=mnd(c.x,c.y,starts);if(d>bd){bd=d;bc=c}}starts.push(bc)}
    const facs=[0,1,2,3,4,5,6,7];for(let i=facs.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[facs[i],facs[j]]=[facs[j],facs[i]]}
    if(opt.fac0!=null){const k=facs.indexOf(opt.fac0);[facs[0],facs[k]]=[facs[k],facs[0]]}
    m.facs=facs;
    starts.forEach((s,pi)=>{const tx=clamp(s.x-1,4,W-9),ty=clamp(s.y-1,4,H-8);for(let j=-1;j<5;j++)for(let i=-1;i<6;i++)m.occ[(ty+j)*W+tx+i]=0;
      const o=placeTown(tx,ty,facs[pi%8],pi);o.start=pi;m.starts.push({x:tx+1,y:ty+3,town:o.id,fac:facs[pi%8]})});
    if(spec.startTowns>=2)m.starts.forEach((s,pi)=>{for(let k=0;k<600;k++){const x=s.x-26+Math.floor(r()*52),y=s.y-26+Math.floor(r()*52);const d=Math.hypot(x-s.x,y-s.y);if(d<13||d>26||!area(x,y,4,3))continue;
      const o=placeTown(x,y,Math.random()<0?0:facs[(pi+1+Math.floor(r()*7))%8],pi);s.town2=o.id;break}});
    startList=m.starts.map(s=>({x:s.x,y:s.y}));seedPt={x:m.starts[0].x,y:m.starts[0].y};
    m.starts.forEach(s=>{
      for(const res of ['wood','ore']){for(let k=0;k<200;k++){const x=s.x-12+Math.floor(r()*24),y=s.y-8+Math.floor(r()*18);if(area(x,y,3,2)&&Math.hypot(x-s.x,y-s.y)>5){addObj({t:'mine',res,x,y,owner:-1});break}}}
      for(let k=0;k<300;k++){const x=s.x-14+Math.floor(r()*28),y=s.y-10+Math.floor(r()*20);if(area(x,y,3,2)&&Math.hypot(x-s.x,y-s.y)>7){const o=addObj({t:'mine',res:'gold',x,y,owner:-1});o.guard=1;break}}
      for(let k=0;k<7;k++){const x=s.x-9+Math.floor(r()*18),y=s.y-7+Math.floor(r()*14);if(free(x,y)&&Math.hypot(x-s.x,y-s.y)>3){const rs=k<2?'gold':pick(r,RES.slice(1));addObj({t:'res',res:rs,n:rs==='gold'?500*(1+(r()<.5?1:0)):rs==='wood'||rs==='ore'?irnd(r,4,8):irnd(r,2,4),x,y})}}});
    const nG=Math.max(3,Math.round(W/28));
    for(let k=0;k<nG;k++){const p=randPos(2,2,{l:[...startList,...m.gates.map(g=>({x:g.ox,y:g.oy}))],d:34});if(!p)continue;addObj({t:'gate',gk:k,x:p[0],y:p[1]});m.gates.push({x:p[0],y:p[1]+1,ox:p[0],oy:p[1],gk:k})}
  }else{
    for(const g of opt.gates){for(let j=-5;j<=6;j++)for(let i=-5;i<=6;i++){const x=g.ox+i,y=g.oy+j;if(x<3||y<3||x>=W-3||y>=H-3)continue;if(Math.hypot(i-.5,j-.5)<5)m.terr[y*W+x]=SUBT}}
    for(const g of opt.gates){addObj({t:'gate',gk:g.gk,x:g.ox,y:g.oy});m.gates.push({x:g.ox,y:g.oy+1,ox:g.ox,oy:g.oy,gk:g.gk})}
    startList=opt.gates.map(g=>({x:g.ox,y:g.oy}));seedPt={x:opt.gates[0].ox,y:opt.gates[0].oy+1};
  }
  const maxD=Math.hypot(W,H)*.42;
  const danger=(x,y)=>under?.3+.7*Math.min(1,mnd(x,y,startList)/maxD):Math.min(1,mnd(x,y,startList)/maxD);
  const MM=under?1.7:1;
  // monolitos
  const nPair=Math.max(2,Math.round(W/55));const monoList=[];
  for(let k=0;k<nPair+1;k++){const p1=randPos(1,1,{l:[...startList,...monoList],d:12});if(!p1)continue;const p2=randPos(1,1,{l:[{x:p1[0],y:p1[1]},...monoList],d:W*.38});if(!p2)continue;
    const one=k===nPair;const col=k%8,key=`${under?1:0}.${k}`;
    addObj({t:'mono',col,dir:one?'in':'two',key,x:p1[0],y:p1[1]});addObj({t:'mono',col,dir:one?'out':'two',key,x:p2[0],y:p2[1]});monoList.push({x:p1[0],y:p1[1]},{x:p2[0],y:p2[1]})}
  // ciudades neutrales
  const nNeutral=Math.round((W*H)/(150*150)*(under?6:11)); // muchos castillos abandonados por conquistar
  for(let k=0;k<nNeutral;k++){const p=randPos(4,3,{l:m.objs.filter(o=>o.t==='town'),d:24});if(!p)continue;
    const fi=Math.floor(r()*8);const o=placeTown(p[0],p[1],fi,-1);const dg=danger(p[0],p[1]);
    o.gar=garrison(o.fi,40+dg*dg*2200*spec.monsters*MM,r)}
  const guardOf=(o,pw)=>{const ex=o.x+o.ex,ey=o.y+o.ey;const cands=[[0,1],[1,1],[-1,1],[1,0],[-1,0],[0,2]];
    for(const[dx,dy]of cands){const x=ex+dx,y=ey+dy;if(x>=2&&y>=2&&x<W-2&&y<H-2&&!IMP(m.terr[y*W+x])&&!m.fp[y*W+x]){const mo=makeMonster(x,y,pw,r);if(mo){addObj(mo);return}}}};
  const mineTarget={gold:Math.max(4,Math.round(spec.players*2.2)),wood:Math.round(spec.players*1.2),ore:Math.round(spec.players*1.2),mercury:Math.round(spec.players*.9),sulfur:Math.round(spec.players*.9),crystal:Math.round(spec.players*.9),gems:Math.round(spec.players*.9)};
  for(const res in mineTarget)for(let k=0;k<mineTarget[res]*(W/150)**2*(under?.8:1)*(spec.mineK||1);k++){const p=randPos(3,2,{l:startList,d:under?10:13});if(!p)continue;const o=addObj({t:'mine',res,x:p[0],y:p[1],owner:-1});guardOf(o,60+danger(p[0],p[1])**2*2500*spec.monsters*MM)}
  const sc=(W*H)/(150*150);
  for(let k=0;k<Math.round(22*sc);k++){const p=randPos(3,2,{l:startList,d:10});if(!p)continue;const dg=danger(p[0],p[1]);
    const maxT=dg<.25?3:dg<.55?5:7,tier=irnd(r,1,maxT),fi=Math.floor(r()*8);const cid=`f${fi}t${tier}`;
    const o=addObj({t:'dwell',cr:cid,n:CR[cid].grow*2,x:p[0],y:p[1],owner:-1});guardOf(o,30+dg*dg*1500*spec.monsters*MM)}
  const sites=['shrine','hut','well','stone','stable','mill','shrine','stone','shop','hut'];
  for(let k=0;k<Math.round(84*sc);k++){const p=randPos(1,1,{l:startList,d:6});if(!p)continue;const kk=r()<.38?pick(r,sites):pickNewSite(r);
    const o=addObj({t:'site',k:kk,x:p[0],y:p[1],used:{},spell:pick(r,SPELL_IDS),skill:pick(r,SKILL_IDS)});
    if(kk==='shop'){const dg=danger(p[0],p[1]);const pool=ART_WORLD().filter(a=>!used.has(a)&&ART[a].v<=2+(dg>.5?1:0)&&!ART[a].set);o.stock=[];for(let q=0;q<4&&pool.length;q++){const a=pool.splice(Math.floor(r()*pool.length),1)[0];o.stock.push(a)}}
    const sd=SITEDEF[kk];if(sd&&sd.guard)guardOf(o,(1800+danger(p[0],p[1])**2*5200)*sd.guard*spec.monsters*MM);else if(r()<.5)guardOf(o,40+danger(p[0],p[1])**2*900*spec.monsters*MM)}
  const takeArt=(lvl)=>{let pool=ART_WORLD().filter(a=>!used.has(a)&&ART[a].v<=lvl+1&&ART[a].v>=Math.max(1,lvl-1)&&(!ART[a].set||lvl>=3));if(!pool.length)pool=ART_WORLD().filter(a=>!used.has(a));if(!pool.length)return null;const a=pool[Math.floor(r()*pool.length)];used.add(a);return a};
  for(let k=0;k<Math.round(34*sc*(under?1.3:1));k++){const p=randPos(1,1,{l:startList,d:12});if(!p)continue;const dg=danger(p[0],p[1]);
    const lvl=(dg<.35?1:dg<.65?2:3)+(under?1:0);const a=takeArt(Math.min(4,lvl));if(!a)break;
    const o=addObj({t:'art',art:a,x:p[0],y:p[1]});guardOf(o,100+dg*dg*3500*spec.monsters*MM)}
  // linajes: las 4 piezas (arma, escudo, yelmo, anillo) de varios linajes, muy custodiadas
  {const lids=Object.keys(LIN);const nLin=Math.max(2,Math.round(sc*(under?1.2:2.2)));
    for(let q=0;q<nLin;q++){const lid=lids[Math.floor(r()*lids.length)];if(used.has('L'+lid))continue;used.add('L'+lid);
      for(const pid of LIN[lid].pieces){let best=null,bd=-1;for(let t=0;t<6;t++){const p=randPos(1,1,{l:startList,d:14});if(!p)continue;const dg=danger(p[0],p[1]);if(dg>bd){bd=dg;best=p}}
        if(!best)continue;used.add(pid);const o=addObj({t:'art',art:pid,x:best[0],y:best[1]});guardOf(o,(900+bd*bd*6500)*spec.monsters*MM)}}}
  // objetivo de victoria del mapa (solo en la superficie)
  if(!under){const v=spec.victory;m.vic=Object.assign({},v);
    if(v.t==='capital'){let bt=null,bd=-1;for(const t of m.objs)if(t.t==='town'&&t.owner<0){const d=mnd(t.x,t.y,[startList[0]]);if(d>bd){bd=d;bt=t}}
      if(bt){bt.capital=1;bt.name='Ciudadela Real de '+bt.name.split(' ')[0];bt.gar=garrison(bt.fi,(4500+spec.level*1800)*spec.monsters,r);m.vic.town=bt.id;m.vic.x=bt.x;m.vic.y=bt.y}else m.vic={t:'conquest'}}
    else if(v.t==='grail'){let best=null,bd=-1;for(let t=0;t<12;t++){const p=randPos(1,1,{l:startList,d:20});if(!p)continue;const dg=danger(p[0],p[1]);if(dg>bd){bd=dg;best=p}}
      if(best){const o=addObj({t:'art',art:'grial',x:best[0],y:best[1]});guardOf(o,(2500+bd*bd*9000)*spec.monsters*MM);m.vic.x=best[0];m.vic.y=best[1]}else m.vic={t:'conquest'}}}
  // cabañas de videntes: misiones con recompensa
  {const artObjs=m.objs.filter(o=>o.t==='art'&&!ART[o.art].lin&&o.art!=='grial');
    for(let k=0;k<Math.round(14*sc*(under?.8:1));k++){const p=randPos(1,1,{l:startList,d:10});if(!p)continue;const dg=danger(p[0],p[1]);
      const q=makeQuest(r,dg,artObjs);
      if(q.t==='kill'){const kp=randPos(1,1,{l:startList,d:14});if(!kp)continue;const mo=makeMonster(kp[0],kp[1],(900+dg*dg*4500)*spec.monsters*MM,r);if(!mo)continue;mo.qk=1;q.mon=addObj(mo).id}
      addObj({t:'site',k:'seer',x:p[0],y:p[1],used:{},q})}}
  for(let k=0;k<Math.round(120*sc*spec.rich);k++){const p=randPos(1,1,null,60);if(!p)continue;const dg=danger(p[0],p[1]);
    addObj({t:'chest',x:p[0],y:p[1]});if(r()<.6)guardOf(m.objs[m.objs.length-1],20+dg*dg*1200*spec.monsters*MM)}
  for(let k=0;k<Math.round(430*sc*spec.rich);k++){const p=randPos(1,1,null,60);if(!p)continue;
    const rs=r()<.28?'gold':pick(r,RES.slice(1));const g=rs==='gold';addObj({t:'res',res:rs,n:g?irnd(r,3,10)*100:(rs==='wood'||rs==='ore')?irnd(r,4,12):irnd(r,2,6),x:p[0],y:p[1]})}
  for(let k=0;k<Math.round(520*sc*spec.monsters*(under?1.15:1));k++){const x=3+Math.floor(r()*(W-6)),y=3+Math.floor(r()*(H-6));if(!free(x,y)||mnd(x,y,startList)<10)continue;
    const dg=danger(x,y);const mo=makeMonster(x,y,25+dg*dg*3200*spec.monsters*MM*(0.5+r()),r);if(mo)addObj(mo)}
  // barcos y tesoros marinos
  if(keepIslands){
    const coast=[];for(let y=3;y<H-3;y++)for(let x=3;x<W-3;x++){const i=y*W+x;if(m.terr[i]!==WATER||m.fp[i])continue;
      let land=0,wat=0;for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const t=m.terr[i+dy*W+dx];if(t===WATER)wat++;else if(!IMP(t))land++}if(land>=1&&wat>=2)coast.push({x,y})}
    for(const s of startList){const c=coast.filter(c=>Math.hypot(c.x-s.x,c.y-s.y)<34&&!m.fp[c.y*W+c.x]).sort((a,b)=>Math.hypot(a.x-s.x,a.y-s.y)-Math.hypot(b.x-s.x,b.y-s.y))[0];if(c)addObj({t:'boat',x:c.x,y:c.y,isle:1})}
    if(coast.length)for(let k=0;k<Math.round(W/12);k++){const c=coast[Math.floor(r()*coast.length)];if(c&&!m.fp[c.y*W+c.x])addObj({t:'boat',x:c.x,y:c.y,isle:1})}
    for(let k=0;k<Math.round(40*sc);k++){const x=4+Math.floor(r()*(W-8)),y=4+Math.floor(r()*(H-8));const i=y*W+x;if(m.terr[i]!==WATER||m.fp[i]||m.en[i])continue;addObj({t:'site',k:pick(r,['buoy','mermaids','wreck']),x,y,isle:1,used:{}})}
    for(let k=0;k<Math.round(70*sc);k++){const x=4+Math.floor(r()*(W-8)),y=4+Math.floor(r()*(H-8));const i=y*W+x;if(m.terr[i]!==WATER||m.fp[i])continue;let ok=true;for(let j=-1;j<=1&&ok;j++)for(let q=-1;q<=1;q++)if(m.terr[i+j*W+q]!==WATER||m.fp[i+j*W+q])ok=false;if(!ok)continue;
      if(r()<.2)addObj({t:'chest',x,y,isle:1});else{const rs=r()<.3?'gold':pick(r,RES.slice(1));addObj({t:'res',res:rs,n:rs==='gold'?irnd(r,4,12)*100:irnd(r,3,8),x,y,isle:1})}}
  }
  // decoración / obstáculos (montañas en cordilleras)
  const density=spec.forest*(under?1.1:1);
  const MOUNT=new Set([ROUGH,ASH,SNOW,DIRT,SUBT,SAND]);
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const i=y*W+x;if(IMP(m.terr[i]))continue;
    if(edge(x,y)){m.deco[i]=1+((x*7+y*13)%3);continue}
    if(m.occ[i]||m.fp[i])continue;
    const a=fbm(nF,x/9,y/9,3),b=nD(x/3,y/3);const th=.60-.07*density;
    const rn=fbm(nR,x/15,y/15,3),ridge=1-Math.abs(2*rn-1);
    if(MOUNT.has(m.terr[i])&&ridge>(under?.9:.94)&&r()<.92)m.deco[i]=4;
    else if(a>th&&b>.28)m.deco[i]=1+Math.floor(r()*3);
    else if(r()<(under?.03:.012)*density)m.deco[i]=1+Math.floor(r()*3);
  }
  const towns=m.objs.filter(o=>o.t==='town');const entry=o=>({x:o.x+o.ex,y:o.y+o.ey+1});
  for(const o of m.objs){const ex=o.x+o.ex,ey=o.y+o.ey;for(let j=-1;j<=2;j++)for(let i=-1;i<=1;i++){const x=ex+i,y=ey+j;if(x>0&&y>0&&x<W-1&&y<H-1&&!(m.fp[y*W+x]&&m.fp[y*W+x]!==m.en[y*W+x]))m.deco[y*W+x]=0}}
  for(const t of towns){const near=towns.filter(o=>o!==t).sort((a,b)=>Math.hypot(a.x-t.x,a.y-t.y)-Math.hypot(b.x-t.x,b.y-t.y)).slice(0,2);
    for(const n of near){const ea=entry(t),eb=entry(n);const p=findPath(m,ea.x,ea.y,eb.x,eb.y,{limit:70000});if(p){m.road[ea.y*W+ea.x]=1;for(const s of p)if(!m.en[s.y*W+s.x]||(s.x===eb.x&&s.y===eb.y))m.road[s.y*W+s.x]=1}}}
  for(let i=0;i<N;i++)if(m.road[i])m.deco[i]=0;
  const targets=under?m.gates.map(g=>({x:g.ox,y:g.oy+1})):[...m.starts.map(s=>({x:s.x,y:s.y})),...m.gates.map(g=>({x:g.ox,y:g.oy+1}))];
  for(const t of targets){if(t.x===seedPt.x&&t.y===seedPt.y)continue;m.deco[seedPt.y*W+seedPt.x]=0;if(!findPath(m,seedPt.x,seedPt.y,t.x,t.y,{limit:120000}))carve(seedPt.x,seedPt.y,t.x,t.y)}
  const seen=new Uint8Array(N);const stk=[seedPt.y*W+seedPt.x];seen[stk[0]]=1;m.deco[stk[0]]=0;
  while(stk.length){const c=stk.pop();const cx=c%W,cy=(c/W)|0;for(const[dx,dy]of D8){const nx=cx+dx,ny=cy+dy;if(nx<0||ny<0||nx>=W||ny>=H)continue;const ni=ny*W+nx;if(seen[ni])continue;if(!tilePass(m,nx,ny,false)&&!m.en[ni])continue;seen[ni]=1;if(!m.en[ni])stk.push(ni)}}
  for(const o of m.objs){const ei=(o.y+o.ey)*W+o.x+o.ex;if(keepIslands&&(m.terr[ei]===WATER||comp[ei]!==best))o.isle=1;
    let ok=false;for(const[dx,dy]of D8){if(seen[ei+dy*W+dx]){ok=true;break}}
    if(!ok&&o.t!=='town'&&!o.isle)o.dead=1}
  for(const o of m.objs){if(o.dead){for(let j=0;j<o.h;j++)for(let i=0;i<o.w;i++){const k=(o.y+j)*W+o.x+i;if(m.fp[k]===o.id+1)m.fp[k]=0;if(m.en[k]===o.id+1)m.en[k]=0}}}
  for(const o of m.objs)if(o.t==='town')initTown(o,r,o.owner<0);
  m.occ=null;m.used=used;return m;
}
// ---------- unión de los dos niveles ----------
function mergeLevels(m0,m1){
  const W=m0.w,H=m0.h,TH=2*H+2,off=H+2,N=W*TH,n0=m0.objs.length;
  const m={spec:m0.spec,vic:m0.vic,w:W,h:TH,lh:H,levels:2,terr:new Uint8Array(N),road:new Uint8Array(N),deco:new Uint8Array(N),fp:new Int32Array(N),en:new Int32Array(N),objs:[],starts:m0.starts,facs:m0.facs,land:m0.land};
  m.terr.set(m0.terr,0);m.road.set(m0.road,0);m.deco.set(m0.deco,0);m.fp.set(m0.fp,0);m.en.set(m0.en,0);
  for(let y=H;y<H+2;y++)for(let x=0;x<W;x++){m.terr[y*W+x]=ROUGH;m.deco[y*W+x]=4}
  m.terr.set(m1.terr,off*W);m.road.set(m1.road,off*W);m.deco.set(m1.deco,off*W);
  for(let i=0;i<m1.fp.length;i++){if(m1.fp[i])m.fp[off*W+i]=m1.fp[i]+n0;if(m1.en[i])m.en[off*W+i]=m1.en[i]+n0}
  m.objs=m0.objs.slice();
  for(const o of m1.objs){o.y+=off;o.id+=n0;if(o.q&&o.q.mon!=null)o.q.mon+=n0;if(o.start!==undefined)delete o.start;m.objs.push(o)}
  const gk={},mk={};
  for(const o of m.objs){if(o.dead)continue;if(o.t==='gate')(gk[o.gk]=gk[o.gk]||[]).push(o);else if(o.t==='mono')(mk[o.key]=mk[o.key]||[]).push(o)}
  const kill=o=>{o.dead=1;for(let j=0;j<o.h;j++)for(let i=0;i<o.w;i++){const k=(o.y+j)*W+o.x+i;if(m.fp[k]===o.id+1)m.fp[k]=0;if(m.en[k]===o.id+1)m.en[k]=0}};
  for(const k in gk){const l=gk[k];if(l.length===2){l[0].pair=l[1].id;l[1].pair=l[0].id}else l.forEach(kill)}
  for(const k in mk){const l=mk[k];if(l.length===2){const[a,b]=l;if(a.dir==='in'){a.pair=b.id;b.pair=null}else{a.pair=b.id;b.pair=a.id}}else l.forEach(kill)}
  for(const o of m.objs)if(o.t==='town'&&o.y<H&&!o.dead)findDock(m,o);
  return m;
}
function findDock(m,o){
  const ex=o.x+o.ex,ey=o.y+o.ey,W=m.w,LH=m.lh||m.h;let best=null,bd=1e9;
  for(let j=-7;j<=7;j++)for(let i=-7;i<=7;i++){const x=ex+i,y=ey+j;if(x<2||y<2||x>=W-2||y>=LH-2)continue;const k=y*W+x;if(m.terr[k]!==WATER||m.fp[k]||m.deco[k])continue;
    let land=false;for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const t=m.terr[k+dy*W+dx];if(!IMP(t)&&!m.deco[k+dy*W+dx])land=true}if(!land)continue;
    const d=Math.hypot(i,j);if(d<bd){bd=d;best={x,y}}}
  o.dock=best;
}
function genMap(spec,opt={}){
  const used=new Set();
  const m0=genLevel(spec,Object.assign({},opt,{under:false,used}));
  if(opt.surfaceOnly){for(const o of m0.objs)if(o.t==='town')findDock(m0,o);return m0}
  const spec2=Object.assign({},spec,{seed:spec.seed+31337});
  const m1=genLevel(spec2,{under:true,gates:m0.gates,used,liquid:spec.seed%2?LAVA:WATER});
  return mergeLevels(m0,m1);
}
const levelOf=(m,y)=>m.lh&&y>=m.lh+2?1:0;
function garrison(fi,power,r){
  const g=[];const units=FDEF[fi].units;let left=power;
  for(let k=0;k<5&&left>5;k++){const t=Math.min(6,Math.max(0,Math.floor(Math.log(left/6)/Math.log(2.4)+r()*1.4)-1));const c=CR[units[Math.min(13,t+(r()<.4?7:0))]];
    const n=Math.max(1,Math.round(left/(c.val*(k===0?1.6:3))));left-=n*c.val;g.push({id:c.id,n})}
  return g;
}
function makeMonster(x,y,power,r){
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
