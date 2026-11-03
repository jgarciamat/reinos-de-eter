'use strict';
// =====================================================================
//  Asedios: murallas, puerta, torres de arqueros y catapulta
//  (el motor está en battle.js; aquí datos, sprites y dibujo)
// =====================================================================
(function(){
  const base={f:-1,tier:3,up:0,pal:null,shots:0,fly:false,shoot:false,dbl:false,noret:true,regen:false,drain:false,breath:false,area:false,big:true,grow:0,cost:{gold:0},val:0,mn:0,mx:0};
  CR.catapult=Object.assign({},base,{id:'catapult',name:'Catapulta',arch:'catapult',atk:0,def:6,hp:1000,spd:3});
  CR.tower=Object.assign({},base,{id:'tower',name:'Torre de arqueros',arch:'tower',atk:10,def:12,hp:400,spd:2,shoot:true,shots:99});
  // criaturas que se teletransportan (atraviesan murallas como las voladoras)
  for(const c of CRLIST){if(/mago|hechicer|djinn|genio|espectro|fantasma|liche|arcano|archimago|ángel|serafín|serafin|fénix|fenix/i.test(c.name))c.tele=true}
})();

function siegeSprite(id,flip){
  const key='sg'+id+(flip?'f':'');if(Gfx.cache[key])return Gfx.cache[key];
  const S=100,c=mkc(S,S),x=c.ctx;if(flip){x.translate(S,0);x.scale(-1,1)}
  shadowE(x,50,86,32,8,.5);
  if(id==='tower'){
    rrect(x,28,34,44,52,3,lg(x,28,0,72,0,['#b8b4c4','#8a8698','#4e4a5c']),OUT,1.6);
    for(let i=0;i<4;i++){x.strokeStyle='rgba(30,26,40,.45)';x.lineWidth=1;x.beginPath();x.moveTo(28,44+i*10);x.lineTo(72,44+i*10);x.stroke()}
    for(let i=0;i<4;i++)rrect(x,26+i*12,24,10,14,1,lg(x,0,24,0,38,['#c8c4d4','#7a7688']),OUT,1.3);
    rrect(x,44,50,12,18,5,'#120c18',OUT,1.2);rrect(x,36,40,7,4,1,'#120c18');rrect(x,57,40,7,4,1,'#120c18');
    poly(x,[[50,6],[44,26],[56,26]],'#c43a3a',OUT,1.3);x.strokeStyle=OUT;x.lineWidth=1.6;x.beginPath();x.moveTo(50,6);x.lineTo(50,26);x.stroke();
    ell(x,50,24,5,6,'#d8b078',OUT,1);poly(x,[[46,22],[54,22],[54,19],[46,19]],'#7a7e90',OUT,1);
  }else{
    // catapulta
    x.strokeStyle=OUT;x.lineWidth=1.6;
    poly(x,[[22,76],[78,76],[74,66],[26,66]],lg(x,0,66,0,76,['#9a6a3a','#5a3a1e']),OUT,1.4);
    poly(x,[[34,66],[44,40],[50,40],[46,66]],lg(x,34,0,50,0,['#a8743c','#5a3a1e']),OUT,1.3);poly(x,[[58,66],[54,40],[60,40],[68,66]],lg(x,54,0,68,0,['#a8743c','#5a3a1e']),OUT,1.3);
    x.save();x.translate(52,44);x.rotate(-.7);poly(x,[[-3,6],[3,6],[5,-40],[-5,-40]],lg(x,-5,0,5,0,['#c08848','#7a4e26']),OUT,1.3);ell(x,0,-42,10,6,'#4a3220',OUT,1.3);ell(x,0,-45,5,3,'#8a8a96',OUT,1);x.restore();
    for(const dx of[30,70]){ell(x,dx,78,11,11,lg(x,dx-11,67,dx+11,89,['#9a6a3a','#3a2410']),OUT,1.6);ell(x,dx,78,4,4,'#c8c4d4',OUT,1);for(let i=0;i<4;i++){x.strokeStyle='#2a1a10';x.lineWidth=1.2;x.beginPath();x.moveTo(dx,78);x.lineTo(dx+Math.cos(i*1.57+.4)*10,78+Math.sin(i*1.57+.4)*10);x.stroke()}}
    x.strokeStyle='#e8d8b0';x.lineWidth=1.2;x.beginPath();x.moveTo(40,52);x.lineTo(60,52);x.stroke();
  }
  return Gfx.cache[key]=c;
}
(function(){const _cs=creatureSprite;creatureSprite=function(id,flip){return id==='catapult'||id==='tower'?siegeSprite(id,flip):_cs(id,flip)}})();

// ---- dibujo de la muralla en la pantalla de combate ----
function drawWalls(c,b){
  if(!b.wall)return;const wh=BU.wh||(BU.wh=new Map([...b.wall].map(([k,w])=>[k,w.max])));
  const lvl=b.siege.lvl;const cols=[['#8a8698','#c4c0d0'],['#9a8e78','#d4c8a8'],['#8e9aa8','#ccd6e0']][lvl-1];
  const ks=[...b.wall.keys()].sort((a,b2)=>((a/BW)|0)-((b2/BW)|0));
  for(const k of ks){const w=b.wall.get(k),y=(k/BW)|0,hp=wh.get(k),[px,py]=hexPx(9,y);const f=hp/w.max;
    c.save();c.translate(px,py);
    if(hp<=0){ // escombros
      for(let i=0;i<7;i++){const rx=-18+((i*37)%36),ry=-4+((i*17)%14);ell(c,rx,ry,5+(i%3)*2,3+(i%2)*2,lg(c,rx-6,ry-4,rx+6,ry+4,[cols[1],cols[0]]),OUT,1)}c.restore();continue}
    const W=HS*1.55;
    if(w.gate){ // puerta
      rrect(c,-W/2-2,-48,W+4,60,3,lg(c,-W/2,0,W/2,0,[cols[1],cols[0]]),OUT,1.8);
      rrect(c,-W/2+6,-36,W-12,48,14,lg(c,0,-36,0,12,['#7a5230','#3e2814']),OUT,1.6);
      c.strokeStyle='#1a1018';c.lineWidth=2;for(let i=-1;i<=1;i++){c.beginPath();c.moveTo(i*9,-34);c.lineTo(i*9,10);c.stroke()}
      c.beginPath();c.moveTo(-W/2+6,-14);c.lineTo(W/2-6,-14);c.stroke();ell(c,6,-8,2.4,2.4,'#c8a24a',OUT,1);
    }else{
      rrect(c,-W/2,-44,W,56,3,lg(c,-W/2,0,W/2,0,[cols[1],cols[0],shade(cols[0],-.35)]),OUT,1.8);
      c.strokeStyle='rgba(20,16,28,.4)';c.lineWidth=1;for(let r=0;r<4;r++){const yy=-34+r*11;c.beginPath();c.moveTo(-W/2,yy);c.lineTo(W/2,yy);c.stroke();for(let q=0;q<3;q++){const xx=-W/2+((q*W/3+(r%2)*W/6)%W);c.beginPath();c.moveTo(xx,yy);c.lineTo(xx,yy+11);c.stroke()}}
      for(let i=0;i<3;i++)rrect(c,-W/2+2+i*(W/3),-52,W/3-4,10,1,cols[1],OUT,1.3);
    }
    if(f<1){c.strokeStyle='rgba(10,6,14,.8)';c.lineWidth=1.8;const n=Math.ceil((1-f)*6);for(let i=0;i<n;i++){const sx=-W/2+6+(i*13)%(W-10);c.beginPath();c.moveTo(sx,-40+(i*9)%20);c.lineTo(sx+5,-26+(i*7)%20);c.lineTo(sx-3,-10+(i*5)%12);c.stroke()}}
    c.restore();
  }
}
