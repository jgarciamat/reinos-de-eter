'use strict';
// =====================================================================
//  Arranque, sonido, bucle principal y ganchos del juego
// =====================================================================
let AC=null;
function audio(){if(!AC){try{AC=new (window.AudioContext||window.webkitAudioContext)()}catch(e){}}if(AC&&AC.state==='suspended')AC.resume();return AC}
function tone(f,d,type='sine',v=.05,slide=0,delay=0){const a=audio();if(!a||S.sound===false)return;const t=a.currentTime+delay,o=a.createOscillator(),g=a.createGain();o.type=type;o.frequency.setValueAtTime(f,t);if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(20,f+slide),t+d);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g).connect(a.destination);o.start(t);o.stop(t+d+.02)}
function noise(d,v=.05,hp=800,delay=0){const a=audio();if(!a||S.sound===false)return;const n=a.sampleRate*d,b=a.createBuffer(1,n,a.sampleRate),dt=b.getChannelData(0);for(let i=0;i<n;i++)dt[i]=(Math.random()*2-1)*(1-i/n);const s=a.createBufferSource(),f=a.createBiquadFilter(),g=a.createGain();f.type='highpass';f.frequency.value=hp;s.buffer=b;g.gain.value=v;s.connect(f).connect(g).connect(a.destination);s.start(a.currentTime+delay)}
function sfx(n){
  switch(n){
    case'click':tone(660,.05,'square',.03);break;
    case'step':tone(120+Math.random()*30,.05,'triangle',.025);break;
    case'hit':noise(.12,.07,500);tone(140,.12,'sawtooth',.04,-80);break;
    case'kill':noise(.2,.09,300);tone(90,.25,'sawtooth',.06,-50);break;
    case'shoot':noise(.08,.04,2500);tone(900,.12,'triangle',.03,-500);break;
    case'spell':tone(500,.4,'sine',.05,700);tone(750,.4,'triangle',.03,500,.05);break;
    case'coin':tone(1200,.08,'square',.03);tone(1600,.12,'square',.03,0,.07);break;
    case'recruit':tone(440,.1,'triangle',.05);tone(660,.15,'triangle',.05,0,.09);break;
    case'build':noise(.15,.05,200);tone(200,.2,'square',.04,100);tone(400,.2,'triangle',.04,0,.12);break;
    case'level':[523,659,784,1047].forEach((f,i)=>tone(f,.25,'triangle',.05,0,i*.1));break;
    case'chest':tone(330,.1,'square',.04);tone(660,.2,'triangle',.05,0,.1);break;
    case'gate':noise(.6,.06,100);tone(80,.7,'sawtooth',.05,-30);break;
    case'battle':[196,247,294,392].forEach((f,i)=>tone(f,.35,'sawtooth',.045,0,i*.12));break;
    case'win':[523,659,784,1047,1319].forEach((f,i)=>tone(f,.3,'triangle',.06,0,i*.12));break;
    case'lose':[392,330,262,196].forEach((f,i)=>tone(f,.4,'sawtooth',.05,0,i*.18));break;
  }
}
// (sin música de fondo: solo efectos de sonido)
// ---------- ganchos ----------
G.hooks.visibleTo=(x,y)=>!!S.ai&&isVis(x,y);
G.hooks.notify=(m,k,l)=>{if(S.ai&&!(l&&isVis(l.x,l.y))&&!/Pierdes|Tu |tu |tus /.test(m))return;toast(m,k)};
G.hooks.gameOver=(win,why)=>setTimeout(()=>{Dlg.show({title:win?'¡VICTORIA!':'DERROTA',w:560,text:win?(why||'Has eliminado a todos tus rivales. Los Reinos de Éter se inclinan ante ti.'):'Todos tus héroes y ciudades han caído. La sombra cubre el reino.',buttons:[{label:'Volver al menú',primary:1,fn:()=>{S.scr='menu'}},{label:win?'Seguir explorando':'Ver el mapa',fn:()=>{G.over=false}}]});sfx(win?'win':'lose')},800);
// ---------- bucle ----------
let last=performance.now();
function frame(now){
  const raw=now-last,dt=Math.max(0,Math.min(.05,raw/1000));last=now;if(UI.adapt&&raw>0)UI.adapt(raw);UI.t+=dt;
  try{
    UI.mode(false);if(UI.ph&&S.scr!=='adv'){ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='#000';ctx.fillRect(0,0,cv.width,cv.height);ctx.restore()}UI.mode(UI.ph&&S.scr!=='adv');ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality=IS_TOUCH?'low':'high';processClicks();UI.hits=[];UI.tt=null;UI.cursor='default';UI.hover=null;UI.nohit=UI.modals.length>0;
    updateFade(dt);
    switch(S.scr){
      case'menu':drawMenu(dt);break;
      case'select':drawSelect(dt);break;
      case'adv':{if(!UI.modals.length||true)advUpdate(dt);advDraw(dt);hit(0,0,VPW,VPH,c=>S.mapClicks.push(c),{right:c=>{const tx=Math.floor((c.x+S.cam.x)/TILE),ty=Math.floor((c.y+S.cam.y)/TILE);if(tx>=0&&ty>=0&&tx<G.map.w&&ty<G.map.h)inspect(tx,ty)},cursor:S.hov&&S.hov.o&&(S.hov.o.t==='mon')?'crosshair':'default'});
        drawFxOverlay();drawTopBar();if(UI.ph)drawSidePanelPhone(dt);else drawSidePanel(dt);drawStatus();drawBanner(dt);
        FX.update&&0;break}
      case'town':S.clock+=dt;drawTown(dt);FX.update(dt);FX.draw(ctx,0,0);break;
      case'battle':battleUpdate(dt);battleDraw(dt);FX.update(dt);break;
    }
    UI.nohit=false;UI.mode(UI.ph&&(S.scr!=='adv'||UI.modals.length>0||!!S.loading),dlgZoom());
    if(UI.modals.length){if(UI.des&&S.scr==='adv'){ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle=`rgba(4,2,10,${Math.min(.62,UI.modals[UI.modals.length-1].t*3)})`;ctx.fillRect(0,0,cv.width,cv.height);ctx.restore()}Dlg.draw(dt)}UI.nohit=false;
    if(S.loading){ctx.fillStyle='rgba(6,4,12,.85)';ctx.fillRect(0,0,VW,VH);text(S.loading,VW/2,VH/2,{size:28,bold:true,align:'center',color:'#ffe9a0'});ctx.strokeStyle='#ffe27a';ctx.lineWidth=4;ctx.beginPath();ctx.arc(VW/2,VH/2+50,18,UI.t*6,UI.t*6+4.2);ctx.stroke()}
    drawToasts(dt);drawTooltip();drawFade();
    if(UI.err){ctx.fillStyle='rgba(120,0,0,.9)';ctx.fillRect(0,0,VW,80);text('ERROR: '+UI.err.split('\n').slice(0,2).join(' | '),10,24,{size:12});}
  }catch(e){console.error(e);UI.err=String(e.stack||e)}
  cv.style.cursor=UI.cursor;
  UI.hitsPrev=UI.hits;UI.keyq=[];UI.wheel=0;
  requestAnimationFrame(frame);
}
addEventListener('pointerdown',()=>audio(),{once:true});
addEventListener('visibilitychange',()=>{if(document.hidden&&S.scr==='adv'&&G.map&&!G.over)autosave()});
addEventListener('pagehide',()=>{if(S.scr==='adv'&&G.map&&!G.over)autosave()});
addEventListener('error',e=>{UI.err=String(e.message)+' @'+String(e.filename||'').split('/').pop()+':'+e.lineno});
addEventListener('unhandledrejection',e=>{UI.err='Promesa rechazada: '+String(e.reason)});
addEventListener('beforeunload',()=>{if(S.scr==='adv'&&G.map&&!G.over)autosave()});
function boot(){setupCanvas();initGfx();S.mapClicks=[];requestAnimationFrame(frame)}
boot();
