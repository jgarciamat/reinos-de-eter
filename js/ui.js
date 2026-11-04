'use strict';
// =====================================================================
//  Marco de interfaz (modo inmediato sobre canvas), diálogos y efectos
// =====================================================================
let VW=1280,VH=720; // en modo móvil cambian según el modo de dibujo (ver UI.mode)
const UI={hits:[],mx:-1,my:-1,down:false,clicks:[],rclicks:[],wheel:0,nohit:false,tt:null,toasts:[],modals:[],t:0,q:1,avg:16,nAd:0,lastAd:-9,keys:{},cursor:'default',shake:0,fade:{a:0,to:0,col:'#000',cb:null,spd:2}};
let cv,ctx;
function setupCanvas(){
  cv=document.getElementById('c');ctx=cv.getContext('2d');
  // móvil horizontal: lienzo lógico de 520 de alto y ancho según la pantalla; la aventura usa todo el lienzo y el resto de pantallas (diseñadas a 1280×720) se dibujan escaladas y centradas
  const fit=()=>{const ph=(IS_TOUCH||/[?&]phone/.test(location.search))&&innerWidth>innerHeight&&innerHeight<=520;UI.ph=ph;
    let cw=1280,ch=720;if(ph){ch=520;cw=Math.max(960,Math.min(1400,Math.round(520*innerWidth/innerHeight)))}
    UI.cw=cw;UI.ch=ch;UI.ke=Math.min(cw/1280,ch/720);UI.oxe=(cw-1280*UI.ke)/2;UI.oye=(ch-720*UI.ke)/2;UI.k=Math.min(cw/1280,ch/720);UI.ox=(cw-1280*UI.k)/2;UI.oy=(ch-720*UI.k)/2;
    const dpr=Math.min(IS_TOUCH?1.25:1.5,window.devicePixelRatio||1)*UI.q;const s=Math.min(innerWidth/cw,innerHeight/ch);cv.style.width=cw*s+'px';cv.style.height=ch*s+'px';cv.width=Math.round(cw*s*dpr);cv.height=Math.round(ch*s*dpr);UI.scale=s*dpr;
    if(typeof setAdvSize==='function')setAdvSize()};
  // d=true: pantallas de 1280×720 escaladas y centradas; false: lienzo completo
  UI.mode=(d,z=1)=>{if(UI._sv){ctx.restore();UI._sv=false}UI.des=!!(UI.ph&&d);if(!UI.ph){VW=1280;VH=720;ctx.setTransform(UI.scale,0,0,UI.scale,0,0);return}
    if(UI.des){VW=1280;VH=720;const ke=UI.k*z;UI.ke=ke;UI.oxe=UI.cw/2-640*ke;UI.oye=UI.ch/2-360*ke;ctx.save();UI._sv=true;const a=UI.scale*ke;ctx.setTransform(a,0,0,a,UI.scale*UI.oxe,UI.scale*UI.oye);ctx.beginPath();ctx.rect(0,0,1280,720);ctx.clip()}else{VW=UI.cw;VH=UI.ch;ctx.setTransform(UI.scale,0,0,UI.scale,0,0)}};
  UI.fit=fit;addEventListener('resize',fit);fit();
  // resolución dinámica: si los fotogramas tardan, baja la resolución interna del lienzo (nunca la vuelve a subir)
  UI.adapt=ms=>{if(document.hidden||S.loading)return;UI.avg=UI.avg*.93+Math.min(ms,100)*.07;UI.nAd++;
    if(UI.nAd>90&&UI.avg>26&&UI.q>.6&&UI.t-UI.lastAd>2){UI.q=Math.max(.6,UI.q*.82);UI.lastAd=UI.t;UI.avg=16;fit()}};
  const lpos=(cx,cy)=>{const r=cv.getBoundingClientRect();let x=(cx-r.left)/r.width*UI.cw,y=(cy-r.top)/r.height*UI.ch;if(UI.des){x=(x-UI.oxe)/UI.ke;y=(y-UI.oye)/UI.ke}UI.mx=x;UI.my=y};
  const pos=e=>lpos(e.clientX,e.clientY);
  cv.addEventListener('mousemove',e=>{pos(e);if(UI.onDrag)UI.onDrag(e)});
  cv.addEventListener('mousedown',e=>{pos(e);if(e.button===0){UI.down=true;UI.clicks.push({x:UI.mx,y:UI.my,type:'down'})}else if(e.button===2){UI.rclicks.push({x:UI.mx,y:UI.my})}else if(e.button===1){UI.mid=true}});
  addEventListener('mouseup',e=>{if(e.button===0){UI.down=false;UI.clicks.push({x:UI.mx,y:UI.my,type:'up'})}if(e.button===1)UI.mid=false});
  // ---- táctil: toque = clic, pulsación larga = clic derecho, arrastre = mover el mapa ----
  let T=null;const tpos=t=>lpos(t.clientX,t.clientY);
  const onMap=()=>typeof S!=='undefined'&&S.scr==='adv'&&!UI.modals.length&&UI.mx<VPW&&UI.my<VPH&&UI.my>40;
  cv.addEventListener('touchstart',e=>{e.preventDefault();UI.touch=true;if(e.touches.length>1){if(T)clearTimeout(T.lp);T=null;return}
    const t=e.touches[0];tpos(t);T={x:UI.mx,y:UI.my,lx:UI.mx,ly:UI.my,moved:false,long:false,map:onMap()};UI.down=true;UI.clicks.push({x:UI.mx,y:UI.my,type:'down'});
    T.lp=setTimeout(()=>{if(T&&!T.moved){T.long=true;UI.rclicks.push({x:T.x,y:T.y});if(navigator.vibrate)navigator.vibrate(15)}},520)},{passive:false});
  cv.addEventListener('touchmove',e=>{e.preventDefault();if(!T)return;const t=e.touches[0];tpos(t);
    if(!T.moved&&Math.hypot(UI.mx-T.x,UI.my-T.y)>16&&!T.long){T.moved=true;clearTimeout(T.lp)}
    if(T.moved&&T.map&&typeof clampCam==='function'){S.flyTo=null;S.cam.x-=(UI.mx-T.lx)/ZM;S.cam.y-=(UI.my-T.ly)/ZM;clampCam()}
    T.lx=UI.mx;T.ly=UI.my},{passive:false});
  const tend=e=>{e.preventDefault();if(!T)return;clearTimeout(T.lp);UI.down=false;const cancel=T.moved||T.long;UI.clicks.push({x:cancel?-1000:T.x,y:cancel?-1000:T.y,type:'up'});T=null;setTimeout(()=>{if(!T){UI.mx=-999;UI.my=-999}},120)};
  cv.addEventListener('touchend',tend,{passive:false});cv.addEventListener('touchcancel',tend,{passive:false});
  cv.addEventListener('contextmenu',e=>e.preventDefault());
  cv.addEventListener('wheel',e=>{e.preventDefault();UI.wheel+=Math.sign(e.deltaY)},{passive:false});
  addEventListener('keydown',e=>{UI.keys[e.code]=true;UI.keyq=UI.keyq||[];UI.keyq.push(e);if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Tab'].includes(e.code))e.preventDefault()});
  addEventListener('keyup',e=>{UI.keys[e.code]=false});
}
// dibuja una imagen conservando su proporción dentro de la caja
function fitImg(c,img,x,y,w,h){const iw=img.lw||img.width,ih=img.lh||img.height,k=Math.min(w/iw,h/ih);c.drawImage(img,x+(w-iw*k)/2,y+(h-ih*k)/2,iw*k,ih*k)}
const inRect=(px,py,x,y,w,h)=>px>=x&&py>=y&&px<x+w&&py<y+h;
function hit(x,y,w,h,fn,opt={}){if(UI.nohit)return false;UI.hits.push({x,y,w,h,fn,opt});const hov=inRect(UI.mx,UI.my,x,y,w,h);if(hov){UI.hover=UI.hits[UI.hits.length-1];if(opt.tip)UI.tt=opt.tip;if(fn||opt.cursor)UI.cursor=opt.cursor||'pointer'}return hov}
function hovered(x,y,w,h){return !UI.nohit&&inRect(UI.mx,UI.my,x,y,w,h)}
function processClicks(){
  const hits=UI.hitsPrev||[];
  for(const c of UI.clicks){if(c.type==='down'){UI.pressed=null;for(let i=hits.length-1;i>=0;i--){const h=hits[i];if(inRect(c.x,c.y,h.x,h.y,h.w,h.h)&&(h.fn||h.opt.block||h.opt.down)){UI.pressed=h;if(h.opt.down)h.opt.down(c);break}}}
    else{const p=UI.pressed;UI.pressed=null;if(p&&inRect(c.x,c.y,p.x,p.y,p.w,p.h)&&p.fn){try{p.fn(c)}catch(e){console.error(e);UI.err=String(e.stack||e)}}}}
  UI.clicks.length=0;
  for(const c of UI.rclicks){for(let i=hits.length-1;i>=0;i--){const h=hits[i];if(inRect(c.x,c.y,h.x,h.y,h.w,h.h)&&(h.opt.right||h.opt.block)){if(h.opt.right)h.opt.right(c);break}}}
  UI.rclicks.length=0;
}
// ---------- texto ----------
function text(s,x,y,o={}){
  const sz=o.size||16;ctx.font=(o.bold?'bold ':'')+(o.italic?'italic ':'')+sz+'px '+FONT;ctx.textAlign=o.align||'left';ctx.textBaseline=o.base||'alphabetic';
  if(o.shadow!==false){ctx.fillStyle=o.sh||'rgba(0,0,0,.8)';ctx.fillText(s,x+1,y+1.4);if(o.outline){ctx.strokeStyle='rgba(0,0,0,.9)';ctx.lineWidth=3;ctx.strokeText(s,x,y)}}
  ctx.fillStyle=o.color||'#f2e6c8';ctx.fillText(s,x,y);
}
function measure(s,size=16,bold=false){ctx.font=(bold?'bold ':'')+size+'px '+FONT;return ctx.measureText(s).width}
function wrap(s,maxW,size=15,bold=false){ctx.font=(bold?'bold ':'')+size+'px '+FONT;const out=[];for(const para of String(s).split('\n')){let line='';for(const w of para.split(' ')){const t=line?line+' '+w:w;if(ctx.measureText(t).width>maxW&&line){out.push(line);line=w}else line=t}out.push(line)}return out}
function paragraph(s,x,y,maxW,o={}){const lh=(o.size||15)*1.3;const L=wrap(s,maxW,o.size||15,o.bold);L.forEach((l,i)=>text(l,x,y+i*lh,o));return L.length*lh}
// ---------- paneles ----------
function panel(x,y,w,h,o={}){
  const c=ctx;c.save();
  const g=c.createLinearGradient(0,y,0,y+h);g.addColorStop(0,o.c1||'rgba(52,40,36,.96)');g.addColorStop(1,o.c2||'rgba(22,16,24,.97)');
  c.shadowColor='rgba(0,0,0,.55)';c.shadowBlur=o.noshadow?0:18;c.shadowOffsetY=4;
  rrect(c,x,y,w,h,o.r||8,g);c.shadowColor='transparent';
  // textura de pergamino sutil
  c.globalAlpha=.06;for(let i=0;i<14;i++){c.fillStyle=i%2?'#fff':'#000';c.fillRect(x+((i*97)%w),y+((i*53)%h),w*.2,1)}c.globalAlpha=1;
  rrect(c,x,y,w,h,o.r||8,null,o.border||'#c8a24a',2.2);rrect(c,x+4,y+4,w-8,h-8,(o.r||8)-2,null,'rgba(232,194,90,.35)',1);
  if(!o.plain){c.fillStyle='#e8c25a';for(const[px,py]of[[x+7,y+7],[x+w-7,y+7],[x+7,y+h-7],[x+w-7,y+h-7]]){c.beginPath();c.moveTo(px,py-4);c.lineTo(px+4,py);c.lineTo(px,py+4);c.lineTo(px-4,py);c.fill()}}
  if(o.title){const tw=measure(o.title,o.tsize||20,true)+40;const tx=x+w/2;rrect(c,tx-tw/2,y-14,tw,28,6,lg(c,0,y-14,0,y+14,['#6a4a1e','#3a2610']),'#e8c25a',1.6);text(o.title,tx,y+6,{size:o.tsize||20,bold:true,align:'center',color:'#ffe9a0'})}
  c.restore();
}
function button(x,y,w,h,label,fn,o={}){
  const dis=o.disabled,hov=!dis&&hit(x,y,w,h,dis?null:fn,{tip:o.tip,cursor:dis?'not-allowed':'pointer'}),down=hov&&UI.down;
  if(dis&&o.tip&&hovered(x,y,w,h))UI.tt=o.tip;
  const c=ctx;c.save();
  const base=o.col||(o.primary?'#8a3a1a':'#3a2e44');
  const g=lg(c,0,y,0,y+h,[shade(base,dis?-.1:hov?.45:.28),base,shade(base,-.4)]);
  if(hov){c.shadowColor='rgba(255,210,90,.7)';c.shadowBlur=14}
  rrect(c,x,y+(down?1:0),w,h,7,g,dis?'#6a6258':hov?'#ffe9a0':'#c8a24a',2);c.shadowBlur=0;
  c.fillStyle='rgba(255,255,255,.12)';rrect(c,x+3,y+3+(down?1:0),w-6,h*.42,5,'rgba(255,255,255,.1)');
  if(o.icon)o.icon(x+8,y+h/2);
  text(label,x+w/2+(o.icon?10:0),y+h/2+(o.size||15)*.36+(down?1:0),{size:o.size||15,bold:true,align:'center',color:dis?'#8a8478':'#fff2d0'});c.restore();return hov;
}
function iconButton(x,y,s,draw,fn,o={}){const hov=hit(x,y,s,s,fn,{tip:o.tip}),dis=o.disabled;const c=ctx;c.save();rrect(c,x,y,s,s,6,lg(c,0,y,0,y+s,[hov?'#6a5a3a':'#4a3e30','#2a2018']),hov?'#ffe9a0':'#c8a24a',1.8);c.globalAlpha=dis?.4:1;draw(x+s/2,y+s/2,s);c.restore()}
function bar(x,y,w,h,v,c1,c2){rrect(ctx,x,y,w,h,h/2,'rgba(0,0,0,.6)','#c8a24a',1.2);v=clamp(v,0,1);if(v>0){ctx.save();rrect(ctx,x+1,y+1,w-2,h-2,h/2,null);ctx.clip();ctx.fillStyle=lg(ctx,0,y,0,y+h,[c1,c2]);ctx.fillRect(x+1,y+1,(w-2)*v,h-2);ctx.restore()}}
function resChip(res,n,x,y,o={}){const c=ctx;ctx.drawImage(resIcon(res,o.s||26),x,y-(o.s||26)*.8,o.s||26,o.s||26);text(String(n),x+(o.s||26)+3,y,{size:o.size||16,bold:true,color:o.color||'#fff'})}
function slot(x,y,s,o={}){
  const hov=o.fn?hit(x,y,s,s,o.fn,{tip:o.tip,right:o.right}):hovered(x,y,s,s);const c=ctx;
  rrect(c,x,y,s,s,6,lg(c,0,y,0,y+s,['#3a3044','#1a1420']),o.sel?'#ffe27a':hov?'#e8d8a0':'#7a6a48',o.sel?3:1.6);
  if(o.id){const sp=creatureSprite(o.id,false);c.save();c.beginPath();c.rect(x+2,y+2,s-4,s-4);c.clip();const k=s*1.12;c.drawImage(sp,x+(s-k)/2,y+s-k+s*.1,k,k);c.restore();
    if(o.n!=null){const t=String(o.n);const tw=measure(t,13,true)+10;rrect(c,x+s-tw-2,y+s-18,tw,16,5,'rgba(0,0,0,.75)','#c8a24a',1);text(t,x+s-tw/2-2,y+s-5,{size:13,bold:true,align:'center',color:'#ffe9a0',shadow:false})}}
  return hov;
}
// ---------- tooltips, avisos ----------
function drawTooltip(){
  if(!UI.tt)return;const t=UI.tt;const lines=Array.isArray(t)?t:wrap(t,300,14);const w=Math.max(...lines.map(l=>measure(l,14)))+20,h=lines.length*18+14;
  let x=UI.mx+16,y=UI.my+18;if(x+w>VW-6)x=UI.mx-w-10;if(y+h>VH-6)y=UI.my-h-10;
  ctx.save();ctx.shadowColor='rgba(0,0,0,.6)';ctx.shadowBlur=10;rrect(ctx,x,y,w,h,6,'rgba(18,12,24,.96)','#e8c25a',1.6);ctx.restore();
  lines.forEach((l,i)=>text(l,x+10,y+19+i*18,{size:14,color:i===0&&lines.length>1?'#ffe9a0':'#f2e6c8',bold:i===0&&lines.length>1}));
}
function toast(msg,kind){UI.toasts.push({msg,kind,t:0});if(UI.toasts.length>6)UI.toasts.shift()}
function drawToasts(dt){
  let y=VH-70;for(let i=UI.toasts.length-1;i>=0;i--){const t=UI.toasts[i];t.t+=dt;if(t.t>5){UI.toasts.splice(i,1);continue}
    const a=Math.min(1,t.t*5,(5-t.t)*1.5);ctx.globalAlpha=a;const w=measure(t.msg,15,true)+28;rrect(ctx,14,y-22,w,26,7,'rgba(16,12,24,.9)',t.kind==='bad'?'#e0604a':t.kind==='good'?'#7ae070':'#c8a24a',1.5);
    text(t.msg,28,y-4,{size:15,bold:true,color:t.kind==='bad'?'#ffb0a0':t.kind==='good'?'#c8ffc0':'#f2e6c8'});ctx.globalAlpha=1;y-=30}
}
// ---------- diálogos modales ----------
// móvil: los diálogos de texto (pequeños) se amplían para llenar la pantalla
function dlgZoom(){if(!UI.ph||!UI.modals.length)return 1;const m=UI.modals[UI.modals.length-1];if(m.draw)return 1;
  const lines=wrap(m.text||'',m.w-50,16),h=70+lines.length*21+(m.extra?m.extra:0)+60;return Math.max(1,Math.min(2.2,(UI.cw-30)/(UI.k*m.w),(UI.ch-24)/(UI.k*h)))}
const Dlg={
  show(o){UI.modals.push(Object.assign({w:460,t:0,buttons:[{label:'Aceptar'}]},o))},
  close(){UI.modals.pop()},
  draw(dt){
    for(let mi=0;mi<UI.modals.length;mi++){
      const m=UI.modals[mi],last=mi===UI.modals.length-1;m.t+=dt;
      const was=UI.nohit;UI.nohit=!last||was&&false;
      if(!(UI.ph&&S.scr==='adv')){ctx.fillStyle=`rgba(4,2,10,${Math.min(.62,m.t*3)})`;ctx.fillRect(0,0,VW,VH)}if(last)UI.nohit=false;hit(0,0,VW,VH,null,{block:true});
      if(m.draw){m.draw(m);continue}
      const lines=wrap(m.text||'',m.w-50,16);const h=70+lines.length*21+(m.extra?m.extra:0)+60;const x=(VW-m.w)/2,y=(VH-h)/2-10;
      const sc=Math.min(1,.88+m.t*.6);ctx.save();ctx.translate(VW/2,VH/2);ctx.scale(sc,sc);ctx.translate(-VW/2,-VH/2);ctx.globalAlpha=Math.min(1,m.t*5);
      panel(x,y,m.w,h,{title:m.title});
      let ty=y+52;if(m.icon){m.icon(x+m.w/2,ty+4);ty+=0}
      lines.forEach((l,i)=>text(l,x+m.w/2,ty+i*21,{size:16,align:'center'}));
      if(m.body)m.body(x,ty+lines.length*21,m.w);
      const bw=Math.min(160,(m.w-40)/m.buttons.length-10);let bx=x+m.w/2-(m.buttons.length*(bw+10)-10)/2;
      m.buttons.forEach(b=>{button(bx,y+h-52,bw,36,b.label,()=>{UI.modals.splice(UI.modals.indexOf(m),1);b.fn&&b.fn()},{primary:b.primary,disabled:b.disabled});bx+=bw+10});
      ctx.restore();
    }
  }
};
// ---------- partículas ----------
const FX={list:[],add(p){this.list.push(Object.assign({t:0,life:1,vx:0,vy:0,g:0,size:3,col:'#fff',drag:1,add:false},p))},
  update(dt){for(const p of this.list){p.t+=dt;p.vx*=Math.pow(p.drag,dt*60);p.vy=p.vy*Math.pow(p.drag,dt*60)+p.g*dt;p.x+=p.vx*dt;p.y+=p.vy*dt}this.list=this.list.filter(p=>p.t<p.life)},
  draw(c,ox=0,oy=0){for(const p of this.list){const k=1-p.t/p.life;c.globalAlpha=Math.max(0,k)*(p.alpha||1);if(p.add)c.globalCompositeOperation='lighter';
    if(p.text){c.font='bold '+(p.size||18)+'px '+FONT;c.textAlign='center';c.fillStyle='#000';c.fillText(p.text,p.x+ox+1,p.y+oy+1);c.fillStyle=p.col;c.fillText(p.text,p.x+ox,p.y+oy)}
    else{c.fillStyle=p.col;c.beginPath();c.arc(p.x+ox,p.y+oy,p.size*(p.shrink?k:1),0,6.2832);c.fill()}c.globalCompositeOperation='source-over'}c.globalAlpha=1},
  burst(x,y,n,col,o={}){for(let i=0;i<n;i++){const a=Math.random()*6.283,s=(o.spd||90)*(.3+Math.random());this.add({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-(o.up||0),g:o.g||0,col:Array.isArray(col)?col[i%col.length]:col,size:o.size||2.5,life:(o.life||.6)*(.6+Math.random()*.6),add:o.add,shrink:true,drag:.95})}}};
function fadeTo(cb,spd=2.4){UI.fade={a:UI.fade.a,to:1,cb,spd,col:'#000'}}
function fadeIn(spd=2.4){UI.fade.to=0;UI.fade.spd=spd;UI.fade.cb=null}
function updateFade(dt){const f=UI.fade;if(f.a<f.to){f.a=Math.min(f.to,f.a+dt*f.spd);if(f.a>=f.to&&f.cb){const cb=f.cb;f.cb=null;cb()}}else if(f.a>f.to)f.a=Math.max(f.to,f.a-dt*f.spd)}
function drawFade(){if(UI.fade.a>0){ctx.fillStyle=`rgba(0,0,0,${UI.fade.a})`;ctx.fillRect(0,0,VW,VH)}}
