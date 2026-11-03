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
// v1 = mapas antiguos (partidas guardadas), v2 = mitad de superficie y menos criaturas/recursos sueltos
// v3: criaturas con el esquema de niveles de Heroes 3 (los mapas v1-v2 se regeneran con los valores anteriores para no mover los objetos)
const MAP_SCALES={1:3.15,2:2.23,3:2.23},MGV_CUR=3;
let GENCR=CR,GENALL=ALL_BY_VAL;
function mapSpec(i,mv){mv=mv||MGV_CUR;
  const r=mulberry(9001+i*7919);
  const size=Math.round([144,144,150,156,162,168,174,180][Math.floor(r()*8)]*MAP_SCALES[mv]/2)*2;
  const biome=SPEC_BIOME[i],name=SPEC_NAME[i],B=BIOMES[biome];
  const wl=B.wl+(r()-.5)*.06;
  const sea=!!B.sea||(!B.liquid&&r()<.3);
  const lr=r(),level=lr<.14?1:lr<.38?2:lr<.68?3:lr<.9?4:5,LV=MAPLV[level];
  const startTowns=r()<.4?2:1;
  const vt=VICT[Math.floor(r()*VICT.length)];const victory={t:vt.t};
  if(vt.t==='gold')victory.n=[70000,100000,150000,220000,320000][level-1];
  if(vt.t==='quests')victory.n=3+level*2;
  if(vt.t==='survive')victory.n=[90,110,140,170,200][level-1];
  const forest=.55+r()*.7,monsters=(.7+r()*.7)*LV.mon,rich=(.8+r()*.5)*LV.rich;
  return{i,mv,seed:1000003*(i+1)+17,name,size,players:8,biome,wl,forest,monsters,rich,sea,diff:1,level,lvn:LV.n,mineK:LV.mines,startK:LV.start,aiK:LV.ai,startTowns,victory,
    desc:`${B.n} · ${size}×${size} · 2 niveles · ${startTowns} castillo${startTowns>1?'s':''} inicial${startTowns>1?'es':''}${sea?' · mar':''}${B.liquid===LAVA?' · lava':''}`};
}
// ---------- ruido ----------
function noise2(seed){
  const h0=(x,y)=>{let n=(x*374761393+y*668265263+seed*982451653)|0;n=Math.imul(n^(n>>>13),1274126177);return((n^(n>>>16))>>>0)/4294967296};
  const D=320,cache=new Float64Array(D*D).fill(-1); // valores de la retícula memoizados (mismo valor exacto que h0)
  const h=(x,y)=>{if(x>=0&&y>=0&&x<D&&y<D){const k=y*D+x;let v=cache[k];if(v<0)v=cache[k]=h0(x,y);return v}return h0(x,y)};
  return(x,y)=>{const xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi,u=xf*xf*(3-2*xf),v=yf*yf*(3-2*yf);
    const a=h(xi,yi),b=h(xi+1,yi),c=h(xi,yi+1),d=h(xi+1,yi+1);return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v};
}
function fbm(n,x,y,oct=4){let s=0,a=.5,f=1,t=0;for(let o=0;o<oct;o++){s+=a*n(x*f,y*f);t+=a;a*=.5;f*=2}return s/t}

// ---------- rutas (A*) ----------
const D8=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];
function tilePass(m,x,y,water){if(x<0||y<0||x>=m.w||y>=m.h)return false;const i=y*m.w+x;const t=m.terr[i];if(water?t!==WATER:IMP(t))return false;if(m.deco[i])return false;if(m.fp[i]&&m.fp[i]!==m.en[i])return false;return true}
function stepCost(m,x,y,px,py,pf,water){
  const i=y*m.w+x,pi=py*m.w+px;let c=100;
  if(!water){c=TERR[m.terr[i]].pf[pf||0];if(m.road[i]&&m.road[pi])c=65}
  return(x!==px&&y!==py)?c*1.414:c;
}
let _A={g:null,from:null,stamp:null,st:0,n:0,hF:new Float64Array(1<<16),hI:new Int32Array(1<<16)};
const _DX=[1,-1,0,0,1,1,-1,-1],_DY=[0,0,1,-1,1,-1,1,-1];
function findPath(m,sx,sy,tx,ty,opt={}){
  const w=m.w,hgt=m.h,n=w*hgt,water=!!opt.boat,pf=opt.pf||0;
  if(_A.n!==n){_A.g=new Float32Array(n);_A.from=new Int32Array(n);_A.stamp=new Uint32Array(n);_A.st=0;_A.n=n}
  const A=_A;A.st++;const st=A.st;const ti=ty*w+tx,si=sy*w+sx;const ok=opt.ok||null;
  const terr=m.terr,deco=m.deco,fp=m.fp,en=m.en,road=m.road,zoc=m.zoc,G_=A.g,FR=A.from,SM=A.stamp;
  // montón binario con arrays tipados (mismo orden de desempate que la versión con arrays de pares)
  let hF=A.hF,hI=A.hI,hn=0;
  const push=(f,i)=>{if(hn===hF.length){const nf=new Float64Array(hn*2),ni=new Int32Array(hn*2);nf.set(hF);ni.set(hI);A.hF=hF=nf;A.hI=hI=ni}
    let k=hn++;while(k>0){const p=(k-1)>>1;if(hF[p]<=f)break;hF[k]=hF[p];hI[k]=hI[p];k=p}hF[k]=f;hI[k]=i};
  let popI=0;
  const pop=()=>{popI=hI[0];const lf=hF[--hn],li=hI[hn];if(hn){let k=0;for(;;){let l=2*k+1,r=l+1,s=-1,sf=lf;if(l<hn&&hF[l]<sf){s=l;sf=hF[l]}if(r<hn&&hF[r]<sf){s=r;sf=hF[r]}if(s<0)break;hF[k]=hF[s];hI[k]=hI[s];k=s}hF[k]=lf;hI[k]=li}};
  {const t=terr[ti],ob=en[ti]?m.objs[en[ti]-1]:null;
    if(deco[ti])return null;if(fp[ti]&&fp[ti]!==en[ti])return null;
    if(water){if(t!==WATER&&IMP(t))return null}else{if(IMP(t)&&!(t===WATER&&ob&&ob.t==='boat'))return null}}
  SM[si]=st;G_[si]=0;FR[si]=-1;push(0,si);
  const mc=opt.minCost||65,tcost=[];for(let t=0;t<TERR.length;t++)tcost[t]=TERR[t].pf[pf];
  const pass=(x,y)=>{if(x<0||y<0||x>=w||y>=hgt)return false;const i=y*w+x;const t=terr[i];if(water?t!==WATER:(t===WATER||t===LAVA))return false;if(deco[i])return false;if(fp[i]&&fp[i]!==en[i])return false;return true};
  let expanded=0;const lim=opt.limit||90000;
  while(hn>0){
    pop();const ci=popI;const cx=ci%w,cy=(ci/w)|0;
    if(ci===ti)break;
    if(++expanded>lim)return null;
    const gc=G_[ci];
    for(let d=0;d<8;d++){
      const dx=_DX[d],dy=_DY[d],nx=cx+dx,ny=cy+dy;if(nx<0||ny<0||nx>=w||ny>=hgt)continue;
      const ni=ny*w+nx;
      if(ni!==ti){if(!pass(nx,ny))continue;if(en[ni])continue;if(ok&&!ok(nx,ny))continue}
      if(dx&&dy&&!pass(cx+dx,cy)&&!pass(cx,cy+dy))continue;
      let c=100;if(!(water&&terr[ni]===WATER)){c=tcost[terr[ni]];if(road[ni]&&road[ci])c=65}
      if(dx&&dy)c*=1.414;
      const g=gc+c+(zoc&&zoc[ni]?250:0);
      if(SM[ni]!==st||g<G_[ni]){SM[ni]=st;G_[ni]=g;FR[ni]=ci;const ddx=nx>tx?nx-tx:tx-nx,ddy=ny>ty?ny-ty:ty-ny;push(g+(ddx>ddy?ddx:ddy)*mc,ni)}
    }
  }
  if(SM[ti]!==st)return null;
  const path=[];let c=ti;while(c!==si){const px=FR[c]%w,py=(FR[c]/w)|0,x=c%w,y=(c/w)|0;path.push({x,y,c:Math.round(stepCost(m,x,y,px,py,pf,water&&m.terr[c]===WATER))});c=FR[c]}
  path.reverse();return path;
}

// ---------- generación ----------
const FOOT={town:{w:4,h:3,ex:1,ey:2},mine:{w:3,h:2,ex:1,ey:1},dwell:{w:3,h:2,ex:1,ey:1},site:{w:1,h:1,ex:0,ey:0},res:{w:1,h:1,ex:0,ey:0},chest:{w:1,h:1,ex:0,ey:0},art:{w:1,h:1,ex:0,ey:0},mon:{w:1,h:1,ex:0,ey:0},
  gate:{w:2,h:2,ex:0,ey:1},mono:{w:1,h:1,ex:0,ey:0},boat:{w:1,h:1,ex:0,ey:0}};
const TOWN_NAMES=['Aldea','Villa','Puerto','Fuerte','Torre','Monte','Valle','Cumbre','Rocas','Alba','Ocaso','Bruma','Sol','Luna','Piedra','Cruce','Río','Lago','Nube','Hierro','Cobre','Trono','Alcázar','Mirador'];
const ART_PRICE=[0,900,2200,5000,10000,18000];
// ---------- utilidades de macro-terreno (regiones coherentes) ----------
// filtro de mayoría 3x3 sobre una máscara de líquido (1=líquido); fuera del mapa cuenta como líquido
function smoothMask(src,W,H,passes){
  let a=src,b=new Uint8Array(src.length);
  for(let p=0;p<passes;p++){
    for(let y=0;y<H;y++)for(let x=0;x<W;x++){let c=0;for(let j=-1;j<=1;j++){const yy=y+j;for(let i=-1;i<=1;i++){const xx=x+i;c+=(xx<0||yy<0||xx>=W||yy>=H)?1:a[yy*W+xx]}}
      b[y*W+x]=c>=5?1:0}
    const t=a;a=b;b=t===src?new Uint8Array(src.length):t}
  return a;
}
// filtro de moda (ventana cuadrada de radio rad) solo sobre terrenos de tierra; los líquidos no se tocan
function modeFilter(terr,W,H,rad,passes){
  const N=W*H,W1=W+1,integ=new Int32Array(W1*(H+1)),bestC=new Int32Array(N),curC=new Int32Array(N),bestT=new Uint8Array(N);
  for(let p=0;p<passes;p++){
    const present=new Uint8Array(16);for(let i=0;i<N;i++)present[terr[i]]=1;
    bestC.fill(-1);
    for(let t=1;t<16;t++){if(!present[t]||IMP(t))continue;
      for(let y=0;y<H;y++){let row=0;for(let x=0;x<W;x++){row+=terr[y*W+x]===t?1:0;integ[(y+1)*W1+x+1]=integ[y*W1+x+1]+row}}
      for(let y=0;y<H;y++){const y0=Math.max(0,y-rad),y1=Math.min(H,y+rad+1);for(let x=0;x<W;x++){const i=y*W+x;if(IMP(terr[i]))continue;
        const x0=Math.max(0,x-rad),x1=Math.min(W,x+rad+1);const c=integ[y1*W1+x1]-integ[y0*W1+x1]-integ[y1*W1+x0]+integ[y0*W1+x0];
        if(terr[i]===t)curC[i]=c;if(c>bestC[i]){bestC[i]=c;bestT[i]=t}}}}
    for(let i=0;i<N;i++)if(!IMP(terr[i])&&bestC[i]>curC[i])terr[i]=bestT[i];
  }
}
// recuento de una máscara en ventana (radio rad), devuelve Uint16Array
function winCount(mask,W,H,rad){
  const W1=W+1,integ=new Int32Array(W1*(H+1)),out=new Uint16Array(W*H);
  for(let y=0;y<H;y++){let row=0;for(let x=0;x<W;x++){row+=mask[y*W+x];integ[(y+1)*W1+x+1]=integ[y*W1+x+1]+row}}
  for(let y=0;y<H;y++){const y0=Math.max(0,y-rad),y1=Math.min(H,y+rad+1);for(let x=0;x<W;x++){const x0=Math.max(0,x-rad),x1=Math.min(W,x+rad+1);
    out[y*W+x]=integ[y1*W1+x1]-integ[y0*W1+x1]-integ[y1*W1+x0]+integ[y0*W1+x0]}}
  return out;
}
// fusiona con el vecino dominante los fragmentos de un terreno menores de minSize casillas
function cleanSmall(terr,W,H,minSize,passes){
  const N=W*H,seen=new Int32Array(N),stack=[];
  for(let p=0;p<passes;p++){seen.fill(0);let changed=0;
    for(let s0=0;s0<N;s0++){const t=terr[s0];if(seen[s0]||IMP(t))continue;const cells=[];stack.push(s0);seen[s0]=1;const nb=new Int32Array(16);
      while(stack.length){const c=stack.pop();cells.push(c);const cx=c%W,cy=(c/W)|0;
        for(let k=0;k<4;k++){const nx=cx+(k===0?1:k===1?-1:0),ny=cy+(k===2?1:k===3?-1:0);if(nx<0||ny<0||nx>=W||ny>=H)continue;const ni=ny*W+nx,tn=terr[ni];
          if(tn===t){if(!seen[ni]){seen[ni]=1;stack.push(ni)}}else if(!IMP(tn))nb[tn]++}}
      if(cells.length<minSize){let bt=-1,bc=0;for(let q=1;q<16;q++)if(nb[q]>bc){bc=nb[q];bt=q}
        if(bt>0){for(const c of cells)terr[c]=bt;changed++}}}
    if(!changed)break}
}
// transiciones graduales: entre terrenos incompatibles se intercala una franja de terreno intermedio
const BRIDGE_T={};
(function(){const add=(a,b,t)=>{BRIDGE_T[a*16+b]=t;BRIDGE_T[b*16+a]=t};
  add(GRASS,SNOW,DIRT);add(SAND,SNOW,DIRT);add(GRASS,ASH,DIRT);add(SAND,ASH,DIRT);add(SNOW,ASH,ROUGH);add(SNOW,SWAMP,DIRT);add(SAND,SWAMP,DIRT);add(SWAMP,ASH,DIRT)})();
const BR_OFF=[[2,0],[-2,0],[0,2],[0,-2],[1,1],[1,-1],[-1,1],[-1,-1],[1,0],[-1,0],[0,1],[0,-1],[2,1],[-2,1],[1,2],[1,-2]];
function bridgeTerrain(terr,W,H){
  const N=W*H,out=new Uint8Array(terr);
  for(let y=2;y<H-2;y++)for(let x=2;x<W-2;x++){const i=y*W+x,t=terr[i];if(t===DIRT||t===ROUGH||IMP(t)||t===SUBT)continue;
    for(const[dx,dy]of BR_OFF){const tn=terr[i+dy*W+dx];const b=BRIDGE_T[t*16+tn];if(b){out[i]=b;break}}}
  terr.set(out);
}
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
  const liqMask=new Uint8Array(N);
  for(let wl=spec.wl;;wl-=.015){for(let i=0;i<N;i++)liqMask[i]=hm[i]<wl?1:0;const sm=smoothMask(liqMask,W,H,2);
    for(let i=0;i<N;i++)m.terr[i]=sm[i]?LIQ:BASE;label();if(bestN/N>=(under?.4:.45)||wl<.2)break}
  // costa limpia: fuera fragmentos sueltos (salvo islas grandes en mapas de mar) y lagunas diminutas rellenas
  for(let i=0;i<N;i++)if(!IMP(m.terr[i])&&comp[i]!==best&&(!keepIslands||csize[comp[i]]<30))m.terr[i]=LIQ;
  {const seenL=new Uint8Array(N),stk=[];
    for(let s0=0;s0<N;s0++){if(seenL[s0]||!IMP(m.terr[s0]))continue;const cells=[];let border=false;stk.push(s0);seenL[s0]=1;
      while(stk.length){const c=stk.pop();cells.push(c);const cx=c%W,cy=(c/W)|0;if(cx<3||cy<3||cx>=W-3||cy>=H-3)border=true;
        for(let k=0;k<4;k++){const nx=cx+[1,-1,0,0][k],ny=cy+[0,0,1,-1][k];if(nx<0||ny<0||nx>=W||ny>=H)continue;const ni=ny*W+nx;if(!seenL[ni]&&IMP(m.terr[ni])){seenL[ni]=1;stk.push(ni)}}}
      if(!border&&cells.length<160)for(const c of cells)m.terr[c]=BASE}}
  label();
  // puntos de salida de los jugadores (solo superficie): se eligen sobre la máscara de tierra para poder dar a cada uno su terreno natural
  let startPts=null,facsPre=null;
  if(!under){
    const cand=[];for(let k=0;k<1800&&cand.length<500;k++){const x=14+Math.floor(r()*(W-28)),y=14+Math.floor(r()*(H-28));
      let okc=true;for(let j=-6;j<=6&&okc;j+=3)for(let i=-6;i<=6;i+=3)if(IMP(m.terr[(y+j)*W+x+i]))okc=false;if(okc)cand.push({x,y})}
    if(cand.length<spec.players)throw new Error('mapa sin espacio');
    startPts=[cand[Math.floor(r()*cand.length)]];
    while(startPts.length<spec.players){let bc=null,bd=-1;for(const c of cand){let d=1e9;for(const s of startPts)d=Math.min(d,Math.hypot(s.x-c.x,s.y-c.y));if(d>bd){bd=d;bc=c}}startPts.push(bc)}
  }
  const dStart=(x,y)=>{let d=1e9;if(startPts)for(const s of startPts){const q=Math.hypot(s.x-x,s.y-y);if(q<d)d=q}return d};
  // 2. macro-regiones: pocas semillas en rejilla con jitter + deformación suave de baja frecuencia (bordes orgánicos y zonas compactas)
  {const cs=W/Math.round(W/(under?90:100));const ng=Math.round(W/cs);const seeds=[];const totalW=bio.pal.reduce((s,p)=>s+p[1],0);
    for(let gj=0;gj<ng;gj++)for(let gi=0;gi<ng;gi++){let t=r()*totalW,ty=bio.pal[0][0];for(const[tt,wgt]of bio.pal){t-=wgt;if(t<=0){ty=tt;break}}
      seeds.push([(gi+.1+.8*r())*cs,(gj+.1+.8*r())*cs,ty])}
    for(let y=0;y<H;y++)for(let x=0;x<W;x++){const i=y*W+x;if(IMP(m.terr[i]))continue;
      const px=x+(fbm(nW,x/48,y/48,2)-.5)*56+(nW(x/13,y/13)-.5)*7,py=y+(fbm(nW,x/48+50,y/48+50,2)-.5)*56+(nW(x/13+50,y/13+50)-.5)*7;let bd=1e9,bt=BASE;
      for(const s of seeds){const d=(s[0]-px)**2+(s[1]-py)**2;if(d<bd){bd=d;bt=s[2]}}
      m.terr[i]=bt}}
  modeFilter(m.terr,W,H,5,2);cleanSmall(m.terr,W,H,220,2);
  // lava / líquido interior solo en cuencas dentro del núcleo de zonas de ceniza (o roca bajo tierra), lejos de los castillos iniciales
  {const nL=noise2(spec.seed+11+(under?5:0));const volc=!under&&bio.liquid===LAVA;const eligT=t=>under?(t===ROUGH||t===ASH):t===ASH;
    const el=new Uint8Array(N);for(let i=0;i<N;i++)if(eligT(m.terr[i]))el[i]=1;const core=winCount(el,W,H,6);
    const th=under?.58:volc?.55:.6;const prevMain=new Uint8Array(N);for(let i=0;i<N;i++)prevMain[i]=comp[i]===best?1:0;
    const lv=new Uint8Array(N);
    for(let y=0;y<H;y++)for(let x=0;x<W;x++){const i=y*W+x;if(!el[i]||core[i]<150||(!under&&dStart(x,y)<18))continue;if(fbm(nL,x/20,y/20,3)>th)lv[i]=1}
    const lv2=smoothMask(lv,W,H,2);
    // fuera lagos menores de 45 casillas
    {const sn=new Uint8Array(N),st=[];for(let s0=0;s0<N;s0++){if(sn[s0]||!lv2[s0])continue;const cells=[];st.push(s0);sn[s0]=1;
      while(st.length){const c=st.pop();cells.push(c);const cx=c%W,cy=(c/W)|0;for(let k=0;k<4;k++){const nx=cx+[1,-1,0,0][k],ny=cy+[0,0,1,-1][k];if(nx<0||ny<0||nx>=W||ny>=H)continue;const ni=ny*W+nx;if(!sn[ni]&&lv2[ni]){sn[ni]=1;st.push(ni)}}}
      if(cells.length<45)for(const c of cells)lv2[c]=0}}
    for(let i=0;i<N;i++)if(lv2[i]&&!IMP(m.terr[i])&&el[i])m.terr[i]=LIQ;
    // si el lago aísla tierra que antes era continua, se abre un vado a través del líquido
    label();
    for(let cid=0;cid<csize.length;cid++){if(cid===best)continue;let first=-1;for(let i=0;i<N;i++)if(comp[i]===cid){first=i;break}
      if(first<0||!prevMain[first])continue;
      const par=new Int32Array(N).fill(-2);const q=[];for(let i=0;i<N;i++)if(comp[i]===cid){par[i]=-1;q.push(i)}
      let hit=-1;for(let h=0;h<q.length&&hit<0;h++){const c=q[h],cx=c%W,cy=(c/W)|0;for(let k=0;k<4;k++){const nx=cx+[1,-1,0,0][k],ny=cy+[0,0,1,-1][k];if(nx<0||ny<0||nx>=W||ny>=H)continue;const ni=ny*W+nx;if(par[ni]!==-2)continue;
        if(comp[ni]===best){hit=c;par[ni]=c;break}if(m.terr[ni]!==LIQ)continue;par[ni]=c;q.push(ni)}}
      if(hit>=0){let c=hit;while(c>=0&&par[c]!==-1){if(m.terr[c]===LIQ)m.terr[c]=ASH;c=par[c]}}}
    label()}
  // 3. castillos iniciales: facción según el terreno de su zona (mejor emparejamiento) y patria de su terreno nativo con borde irregular
  if(!under){
    const near=(a,b)=>a===b?0:(a===DIRT||b===DIRT)?1:((a===GRASS&&(b===SWAMP||b===SAND))||(b===GRASS&&(a===SWAMP||a===SAND))||(a===ASH&&b===ROUGH)||(a===ROUGH&&b===ASH)||(a===SNOW&&b===ROUGH)||(a===ROUGH&&b===SNOW))?1:3;
    const loc=startPts.map(s=>m.terr[(s.y+1)*W+s.x]);
    let bestP=null,bestS=1e9;for(let it=0;it<400;it++){const f=[0,1,2,3,4,5,6,7];for(let i=7;i>0;i--){const j=Math.floor(r()*(i+1));[f[i],f[j]]=[f[j],f[i]]}
      if(opt.fac0!=null){const k=f.indexOf(opt.fac0);[f[0],f[k]]=[f[k],f[0]]}
      let sc=0;for(let p=0;p<f.length;p++)sc+=near(FDEF[f[p]].terr,loc[p%8]);if(sc<bestS){bestS=sc;bestP=f}}
    facsPre=bestP;
    startPts.forEach((s,pi)=>{const nt=FDEF[facsPre[pi%8]].terr;const cx=s.x+1,cy=s.y+1;if(loc[pi]===nt)return;
      for(let y=cy-16;y<=cy+16;y++)for(let x=cx-16;x<=cx+16;x++){if(x<2||y<2||x>=W-2||y>=H-2)continue;const i=y*W+x;if(IMP(m.terr[i]))continue;
        const rr=13+(nW(x/8+200,y/8+200)-.5)*10;if(Math.hypot(x-cx,y-cy)<rr)m.terr[i]=nt}});
  }
  // cordilleras: crestas largas de ruido dentro de "provincias montañosas"; la garganta se abre después (pasos garantizados)
  const rdg=new Float32Array(N);const MTH=under?.925:.935;
  {const nP=noise2(spec.seed+21+(under?5:0)),nQ=noise2(spec.seed+23);
    const thP=under?.5:spec.biome==='montana'?.44:spec.biome==='boreal'?.49:spec.biome==='volcan'||spec.biome==='yermo'?.51:spec.biome==='archipielago'?.58:.535;
    for(let y=0;y<H;y++)for(let x=0;x<W;x++){const i=y*W+x;if(IMP(m.terr[i]))continue;const t=m.terr[i];
      let pv=fbm(nP,x/75,y/75,3)+((t===ROUGH||t===SNOW)?.06:t===GRASS||t===SWAMP?-.015:0);
      if(pv<thP-.05)continue;
      const wx=x+(nQ(x/30,y/30)-.5)*30,wy=y+(nQ(x/30+70,y/30+70)-.5)*30;
      const rn=fbm(nR,wx/46,wy/46,3);let v=1-Math.abs(2*rn-1)-Math.max(0,thP+.05-pv)*.5;
      if(startPts&&v>MTH-.05&&dStart(x,y)<15)v=0;rdg[i]=v}
    // el terreno bajo la cordillera pasa a roca (nieve se conserva); ladera de tierra en las praderas
    for(let i=0;i<N;i++){const v=rdg[i];if(v<=MTH-.045)continue;const t=m.terr[i];if(IMP(t))continue;
      if(v>MTH-.012){if(!under&&t!==SNOW&&t!==ROUGH)m.terr[i]=ROUGH}else if(!under&&(t===GRASS||t===SWAMP))m.terr[i]=DIRT}}
  // costa: playas continuas (no a trozos) y transiciones graduales entre terrenos incompatibles
  if(LIQ===WATER&&!under){const wm=new Uint8Array(N);for(let i=0;i<N;i++)wm[i]=m.terr[i]===WATER?1:0;const nb=winCount(wm,W,H,2);
    for(let y=2;y<H-2;y++)for(let x=2;x<W-2;x++){const i=y*W+x,t=m.terr[i];if((t===GRASS||t===DIRT)&&nb[i]>0&&fbm(nD,x/24,y/24,2)>.5)m.terr[i]=SAND}}
  if(!under)bridgeTerrain(m.terr,W,H);
  cleanSmall(m.terr,W,H,60,2);
  label();
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
  // facción cuyo terreno nativo encaja con el de la zona (si la hay); si no, la dada
  const fiFor=(x,y,dflt)=>{if(under)return dflt;const t=m.terr[y*W+x];const c=[];for(let f=0;f<8;f++)if(FDEF[f].terr===t)c.push(f);
    if(!c.length||c.includes(dflt))return dflt;return c[(dflt*7+x+y)%c.length]};
  const used=opt.used||new Set();
  let startList=[],seedPt={x:0,y:0};
  if(!under){
    const starts=startPts;
    const facs=facsPre;
    m.facs=facs;
    starts.forEach((s,pi)=>{const tx=clamp(s.x-1,4,W-9),ty=clamp(s.y-1,4,H-8);for(let j=-1;j<5;j++)for(let i=-1;i<6;i++)m.occ[(ty+j)*W+tx+i]=0;
      const o=placeTown(tx,ty,facs[pi%8],pi);o.start=pi;m.starts.push({x:tx+1,y:ty+3,town:o.id,fac:facs[pi%8]})});
    if(spec.startTowns>=2)m.starts.forEach((s,pi)=>{for(let k=0;k<600;k++){const x=s.x-26+Math.floor(r()*52),y=s.y-26+Math.floor(r()*52);const d=Math.hypot(x-s.x,y-s.y);if(d<13||d>26||!area(x,y,4,3))continue;
      const o=placeTown(x,y,fiFor(x+2,y+1,facs[(pi+1+Math.floor(r()*7))%8]),pi);s.town2=o.id;break}});
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
  const V1=spec.mv===1;const nNeutral=Math.round((W*H)/(150*150)*(V1?(under?6:11):(under?5:9))); // muchos castillos abandonados por conquistar
  for(let k=0;k<nNeutral;k++){const p=randPos(4,3,{l:m.objs.filter(o=>o.t==='town'),d:24});if(!p)continue;
    const fi=fiFor(p[0]+2,p[1]+1,Math.floor(r()*8));const o=placeTown(p[0],p[1],fi,-1);const dg=danger(p[0],p[1]);
    o.gar=garrison(o.fi,40+dg*dg*2200*spec.monsters*MM,r)}
  const guardOf=(o,pw)=>{const ex=o.x+o.ex,ey=o.y+o.ey;const cands=[[0,1],[1,1],[-1,1],[1,0],[-1,0],[0,2]];
    for(const[dx,dy]of cands){const x=ex+dx,y=ey+dy;if(x>=2&&y>=2&&x<W-2&&y<H-2&&!IMP(m.terr[y*W+x])&&!m.fp[y*W+x]){const mo=makeMonster(x,y,pw,r);if(mo){addObj(mo);return}}}};
  const mineTarget={gold:Math.max(4,Math.round(spec.players*2.2)),wood:Math.round(spec.players*1.2),ore:Math.round(spec.players*1.2),mercury:Math.round(spec.players*.9),sulfur:Math.round(spec.players*.9),crystal:Math.round(spec.players*.9),gems:Math.round(spec.players*.9)};
  for(const res in mineTarget)for(let k=0;k<mineTarget[res]*(W/150)**2*(under?.8:1)*(spec.mineK||1)*(V1?1:.5);k++){const p=randPos(3,2,{l:startList,d:under?10:13});if(!p)continue;const o=addObj({t:'mine',res,x:p[0],y:p[1],owner:-1});guardOf(o,60+danger(p[0],p[1])**2*2500*spec.monsters*MM)}
  const sc=(W*H)/(150*150);
  for(let k=0;k<Math.round((V1?22:14)*sc);k++){const p=randPos(3,2,{l:startList,d:10});if(!p)continue;const dg=danger(p[0],p[1]);
    const maxT=dg<.25?3:dg<.55?5:7,tier=irnd(r,1,maxT),fi=Math.floor(r()*8);const cid=`f${fi}t${tier}`;
    const o=addObj({t:'dwell',cr:cid,n:GENCR[cid].grow*2,x:p[0],y:p[1],owner:-1});guardOf(o,30+dg*dg*1500*spec.monsters*MM)}
  const sites=['shrine','hut','well','stone','stable','mill','shrine','stone','shop','hut'];
  for(let k=0;k<Math.round((V1?84:60)*sc);k++){const p=randPos(1,1,{l:startList,d:6});if(!p)continue;const kk=r()<.38?pick(r,sites):pickNewSite(r);
    const o=addObj({t:'site',k:kk,x:p[0],y:p[1],used:{},spell:pick(r,SPELL_IDS),skill:pick(r,SKILL_IDS)});
    if(kk==='shop'){const dg=danger(p[0],p[1]);const pool=ART_WORLD().filter(a=>!used.has(a)&&ART[a].v<=2+(dg>.5?1:0)&&!ART[a].set);o.stock=[];for(let q=0;q<4&&pool.length;q++){const a=pool.splice(Math.floor(r()*pool.length),1)[0];o.stock.push(a)}}
    const sd=SITEDEF[kk];if(sd&&sd.guard)guardOf(o,(1800+danger(p[0],p[1])**2*5200)*sd.guard*spec.monsters*MM);else if(r()<.5)guardOf(o,40+danger(p[0],p[1])**2*900*spec.monsters*MM)}
  const takeArt=(lvl)=>{let pool=ART_WORLD().filter(a=>!used.has(a)&&ART[a].v<=lvl+1&&ART[a].v>=Math.max(1,lvl-1)&&(!ART[a].set||lvl>=3));if(!pool.length)pool=ART_WORLD().filter(a=>!used.has(a));if(!pool.length)return null;const a=pool[Math.floor(r()*pool.length)];used.add(a);return a};
  for(let k=0;k<Math.round((V1?34:28)*sc*(under?1.3:1));k++){const p=randPos(1,1,{l:startList,d:12});if(!p)continue;const dg=danger(p[0],p[1]);
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
  for(let k=0;k<Math.round((V1?120:45)*sc*spec.rich);k++){const p=randPos(1,1,null,60);if(!p)continue;const dg=danger(p[0],p[1]);
    addObj({t:'chest',x:p[0],y:p[1]});if(r()<.6)guardOf(m.objs[m.objs.length-1],20+dg*dg*1200*spec.monsters*MM)}
  for(let k=0;k<Math.round((V1?430:110)*sc*spec.rich);k++){const p=randPos(1,1,null,60);if(!p)continue;
    const rs=r()<.28?'gold':pick(r,RES.slice(1));const g=rs==='gold';addObj({t:'res',res:rs,n:g?irnd(r,3,10)*100:(rs==='wood'||rs==='ore')?irnd(r,4,12):irnd(r,2,6),x:p[0],y:p[1]})}
  for(let k=0;k<Math.round((V1?520:60)*sc*spec.monsters*(under?1.15:1));k++){const x=3+Math.floor(r()*(W-6)),y=3+Math.floor(r()*(H-6));if(!free(x,y)||mnd(x,y,startList)<10)continue;
    const dg=danger(x,y);const mo=makeMonster(x,y,25+dg*dg*3200*spec.monsters*MM*(0.5+r()),r);if(mo)addObj(mo)}
  // barcos y tesoros marinos
  if(keepIslands){
    const coast=[];for(let y=3;y<H-3;y++)for(let x=3;x<W-3;x++){const i=y*W+x;if(m.terr[i]!==WATER||m.fp[i])continue;
      let land=0,wat=0;for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const t=m.terr[i+dy*W+dx];if(t===WATER)wat++;else if(!IMP(t))land++}if(land>=1&&wat>=2)coast.push({x,y})}
    for(const s of startList){const c=coast.filter(c=>Math.hypot(c.x-s.x,c.y-s.y)<34&&!m.fp[c.y*W+c.x]).sort((a,b)=>Math.hypot(a.x-s.x,a.y-s.y)-Math.hypot(b.x-s.x,b.y-s.y))[0];if(c)addObj({t:'boat',x:c.x,y:c.y,isle:1})}
    if(coast.length)for(let k=0;k<Math.round(W/12);k++){const c=coast[Math.floor(r()*coast.length)];if(c&&!m.fp[c.y*W+c.x])addObj({t:'boat',x:c.x,y:c.y,isle:1})}
    for(let k=0;k<Math.round((V1?40:30)*sc);k++){const x=4+Math.floor(r()*(W-8)),y=4+Math.floor(r()*(H-8));const i=y*W+x;if(m.terr[i]!==WATER||m.fp[i]||m.en[i])continue;addObj({t:'site',k:pick(r,['buoy','mermaids','wreck']),x,y,isle:1,used:{}})}
    for(let k=0;k<Math.round((V1?70:40)*sc);k++){const x=4+Math.floor(r()*(W-8)),y=4+Math.floor(r()*(H-8));const i=y*W+x;if(m.terr[i]!==WATER||m.fp[i])continue;let ok=true;for(let j=-1;j<=1&&ok;j++)for(let q=-1;q<=1;q++)if(m.terr[i+j*W+q]!==WATER||m.fp[i+j*W+q])ok=false;if(!ok)continue;
      if(r()<.2)addObj({t:'chest',x,y,isle:1});else{const rs=r()<.3?'gold':pick(r,RES.slice(1));addObj({t:'res',res:rs,n:rs==='gold'?irnd(r,4,12)*100:irnd(r,3,8),x,y,isle:1})}}
  }
  // decoración / obstáculos: cordilleras (crestas con gargantas), bosquetes (arboleda agrupada) y árboles sueltos muy escasos
  const density=spec.forest*(under?1.1:1);
  const MOUNT=new Set([ROUGH,ASH,SNOW,DIRT,SUBT,SAND]);
  const nG=noise2(spec.seed+5);
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const i=y*W+x;if(IMP(m.terr[i]))continue;
    if(edge(x,y)){m.deco[i]=1+((x*7+y*13)%3);continue}
    if(m.occ[i]||m.fp[i])continue;const t=m.terr[i];
    if(rdg[i]>MTH&&MOUNT.has(t)&&r()<.97){m.deco[i]=4;continue}
    const a=fbm(nF,x/17,y/17,3),b=nD(x/2.6,y/2.6);
    const th=.585-.05*density+(t===SAND||t===SNOW?.07:t===SWAMP?-.015:0)+(under?-.02:0);
    if(a>th&&b>.2)m.deco[i]=1+Math.floor(r()*3);
    else if(r()<(t===SAND||t===SNOW?.0012:.0035)*density)m.deco[i]=1+Math.floor(r()*3);
  }
  // limpieza de cordilleras: fuera los trozos cortos y aperturas (desfiladeros) regulares para que siempre haya pasos
  {const seenM=new Uint8Array(N),st=[];
    for(let s0=0;s0<N;s0++){if(seenM[s0]||m.deco[s0]!==4)continue;const cells=[];st.push(s0);seenM[s0]=1;
      while(st.length){const c=st.pop();cells.push(c);const cx=c%W,cy=(c/W)|0;for(const[dx,dy]of D8){const nx=cx+dx,ny=cy+dy;if(nx<0||ny<0||nx>=W||ny>=H)continue;const ni=ny*W+nx;if(!seenM[ni]&&m.deco[ni]===4){seenM[ni]=1;st.push(ni)}}}
      if(cells.length<16)for(const c of cells)m.deco[c]=0}
    const GS=under?22:28,gW=Math.ceil(W/GS);const bestC=new Map();
    for(let y=0;y<H;y++)for(let x=0;x<W;x++){if(m.deco[y*W+x]!==4)continue;const gx=Math.floor(x/GS),gy=Math.floor(y/GS);const d=Math.hypot(x-(gx+.5)*GS,y-(gy+.5)*GS);const key=gy*gW+gx;const bc=bestC.get(key);if(!bc||d<bc.d)bestC.set(key,{x,y,d})}
    for(const g of bestC.values()){const rad=2+(r()<.4?1:0);for(let j=-rad;j<=rad;j++)for(let i=-rad;i<=rad;i++){if(i*i+j*j>rad*rad+1)continue;const xx=g.x+i,yy=g.y+j;if(xx>1&&yy>1&&xx<W-2&&yy<H-2&&m.deco[yy*W+xx]===4)m.deco[yy*W+xx]=0}}}
  const towns=m.objs.filter(o=>o.t==='town');const entry=o=>({x:o.x+o.ex,y:o.y+o.ey+1});
  for(const o of m.objs){const ex=o.x+o.ex,ey=o.y+o.ey;for(let j=-1;j<=2;j++)for(let i=-1;i<=1;i++){const x=ex+i,y=ey+j;if(x>0&&y>0&&x<W-1&&y<H-1&&!(m.fp[y*W+x]&&m.fp[y*W+x]!==m.en[y*W+x]))m.deco[y*W+x]=0}}
  for(const t of towns){const near=towns.filter(o=>o!==t).sort((a,b)=>Math.hypot(a.x-t.x,a.y-t.y)-Math.hypot(b.x-t.x,b.y-t.y)).slice(0,2);
    for(const n of near){const ea=entry(t),eb=entry(n);const p=findPath(m,ea.x,ea.y,eb.x,eb.y,{limit:70000});if(p){m.road[ea.y*W+ea.x]=1;for(const s of p)if(!m.en[s.y*W+s.x]||(s.x===eb.x&&s.y===eb.y))m.road[s.y*W+s.x]=1}}}
  for(let i=0;i<N;i++)if(m.road[i])m.deco[i]=0;
  const targets=under?m.gates.map(g=>({x:g.ox,y:g.oy+1})):[...m.starts.map(s=>({x:s.x,y:s.y})),...m.gates.map(g=>({x:g.ox,y:g.oy+1}))];
  for(const t of targets){if(t.x===seedPt.x&&t.y===seedPt.y)continue;m.deco[seedPt.y*W+seedPt.x]=0;if(!findPath(m,seedPt.x,seedPt.y,t.x,t.y,{limit:120000}))carve(seedPt.x,seedPt.y,t.x,t.y)}
  const seen=new Uint8Array(N);const stk=[seedPt.y*W+seedPt.x];seen[stk[0]]=1;m.deco[stk[0]]=0;
  while(stk.length){const c=stk.pop();const cx=c%W,cy=(c/W)|0;for(const[dx,dy]of D8){const nx=cx+dx,ny=cy+dy;if(nx<0||ny<0||nx>=W||ny>=H)continue;const ni=ny*W+nx;if(seen[ni])continue;if(!tilePass(m,nx,ny,false)&&!m.en[ni])continue;seen[ni]=1;if(!m.en[ni])stk.push(ni)}}
  // tierra transitable aislada por montañas/árboles: se abre un paso hasta la red principal (BFS desde lo alcanzable)
  {const par=new Int32Array(N).fill(-2),q=[];for(let i=0;i<N;i++)if(seen[i]){par[i]=-1;q.push(i)}
    for(let h=0;h<q.length;h++){const c=q[h],cx=c%W,cy=(c/W)|0;for(let k=0;k<4;k++){const nx=cx+[1,-1,0,0][k],ny=cy+[0,0,1,-1][k];if(nx<1||ny<1||nx>=W-1||ny>=H-1)continue;const ni=ny*W+nx;if(par[ni]!==-2||IMP(m.terr[ni]))continue;par[ni]=c;q.push(ni)}}
    const vis=new Uint8Array(N),st=[];let opened=0;
    for(let s0=0;s0<N;s0++){if(seen[s0]||vis[s0]||IMP(m.terr[s0])||m.deco[s0]||m.fp[s0])continue;let cnt=0,bc=-1,bd=1e9;st.push(s0);vis[s0]=1;
      while(st.length){const c=st.pop();cnt++;if(par[c]>=-1&&q.indexOf&&false){}const cx=c%W,cy=(c/W)|0;
        for(const[dx,dy]of D8){const nx=cx+dx,ny=cy+dy;if(nx<0||ny<0||nx>=W||ny>=H)continue;const ni=ny*W+nx;if(vis[ni]||seen[ni]||IMP(m.terr[ni])||m.deco[ni]||m.fp[ni])continue;vis[ni]=1;st.push(ni)}
        if(par[c]!==-2&&par[c]!==-1){let dd=0,z=c;while(z>=0&&!seen[z]&&dd<400){z=par[z];dd++}if(dd<bd){bd=dd;bc=c}}}
      if(cnt>=40&&bc>=0){let z=bc;while(z>=0&&!seen[z]){m.deco[z]=0;z=par[z]}opened++}}
    if(opened){seen.fill(0);const stk2=[seedPt.y*W+seedPt.x];seen[stk2[0]]=1;while(stk2.length){const c=stk2.pop();const cx=c%W,cy=(c/W)|0;for(const[dx,dy]of D8){const nx=cx+dx,ny=cy+dy;if(nx<0||ny<0||nx>=W||ny>=H)continue;const ni=ny*W+nx;if(seen[ni])continue;if(!tilePass(m,nx,ny,false)&&!m.en[ni])continue;seen[ni]=1;if(!m.en[ni])stk2.push(ni)}}}}
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
  GENCR=spec.mv>=3?CR:CRL;GENALL=spec.mv>=3?ALL_BY_VAL:ALL_BY_VAL_L;
  const used=new Set();
  const m0=genLevel(spec,Object.assign({},opt,{under:false,used}));
  if(opt.surfaceOnly){for(const o of m0.objs)if(o.t==='town')findDock(m0,o);return m0}
  const spec2=Object.assign({},spec,{seed:spec.seed+31337});
  const m1=genLevel(spec2,{under:true,gates:m0.gates,used,liquid:spec.seed%2?LAVA:WATER});
  const mm=mergeLevels(m0,m1);mm.used=used;return mm;
}
const levelOf=(m,y)=>m.lh&&y>=m.lh+2?1:0;
function garrison(fi,power,r){
  const g=[];const units=FDEF[fi].units;let left=power;
  for(let k=0;k<5&&left>5;k++){const t=Math.min(6,Math.max(0,Math.floor(Math.log(left/6)/Math.log(2.4)+r()*1.4)-1));const c=GENCR[units[Math.min(13,t+(r()<.4?7:0))]];
    const n=Math.max(1,Math.round(left/(c.val*(k===0?1.6:3))));left-=n*c.val;g.push({id:c.id,n})}
  return g;
}
function makeMonster(x,y,power,r){
  const lo=power/70,hi=power/2.2;const cand=GENALL.filter(id=>{const v=GENCR[id].val;return v>=lo&&v<=hi});
  if(!cand.length)return null;const cid=cand[Math.floor(Math.pow(r(),.7)*cand.length)];
  const n=Math.max(1,Math.round(power*(0.75+r()*.5)/GENCR[cid].val));
  return{t:'mon',cr:cid,n,x,y};
}
function initTown(o,r,neutral){
  o.b={hall1:1,dw1:1,dw2:1};o.avail=[];for(let t=1;t<=7;t++)o.avail.push(0);
  o.avail[0]=GENCR[FDEF[o.fi].units[0]].grow;o.avail[1]=GENCR[FDEF[o.fi].units[1]].grow;
  o.spells=[];for(let lv=1;lv<=4;lv++){const pool=SPELL_IDS.filter(s=>GUILD_LV[s]===lv);const a=[];while(a.length<Math.min(2,pool.length)){const s=pool[Math.floor(r()*pool.length)];if(!a.includes(s))a.push(s)}o.spells.push(...a)}
  o.builtToday=false;
  if(neutral){o.b.dw3=1;if(r()<.6)o.b.tavern=1}
}
