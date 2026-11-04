'use strict';
// =====================================================================
//  Audio propio: efectos sintetizados con más cuerpo y música original generativa
//  (todo se genera con WebAudio; no hay ficheros de sonido ni material de terceros)
// =====================================================================
const AU={ready:false,sfx:null,mus:null,rev:null,theme:null,bar:0,next:0,timer:null,scene:'',rnd:Math.random};
function auInit(){
  const a=audio();if(!a)return false;if(AU.ready)return true;
  const master=a.createDynamicsCompressor();master.threshold.value=-14;master.ratio.value=4;master.connect(a.destination);
  AU.sfx=a.createGain();AU.sfx.gain.value=.9;AU.sfx.connect(master);
  AU.mus=a.createGain();AU.mus.gain.value=.0;AU.mus.connect(master);
  // reverberación sencilla a partir de ruido con caída exponencial
  const len=a.sampleRate*2.4,buf=a.createBuffer(2,len,a.sampleRate);
  for(let c=0;c<2;c++){const d=buf.getChannelData(c);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,2.6)}
  const cv=a.createConvolver();cv.buffer=buf;const wet=a.createGain();wet.gain.value=.34;cv.connect(wet);wet.connect(master);
  AU.rev=cv;AU.master=master;AU.ready=true;return true}
const mtof=m=>440*Math.pow(2,(m-69)/12);
// una nota: osciladores (con desafinación opcional) -> filtro -> envolvente -> salida (+ envío a la reverb)
function voice(f,t,dur,o={}){
  const a=AC;if(!a)return;const out=o.out||AU.sfx,g=a.createGain(),fl=a.createBiquadFilter();
  fl.type=o.ft||'lowpass';fl.frequency.setValueAtTime(o.cut||4000,t);if(o.cutEnd)fl.frequency.exponentialRampToValueAtTime(Math.max(40,o.cutEnd),t+dur);fl.Q.value=o.q||.7;
  const v=o.v==null?.05:o.v,att=o.att==null?.01:o.att,rel=o.rel==null?.12:o.rel;
  g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(v,t+att);g.gain.setValueAtTime(v,Math.max(t+att,t+dur-rel));g.gain.exponentialRampToValueAtTime(.0001,t+dur+rel*.2);
  const dets=o.det?[-o.det,o.det]:[0];
  for(const d of dets){const os=a.createOscillator();os.type=o.type||'sine';os.frequency.setValueAtTime(f,t);if(d)os.detune.value=d;if(o.slide)os.frequency.exponentialRampToValueAtTime(Math.max(20,f+o.slide),t+dur);os.connect(fl);os.start(t);os.stop(t+dur+rel)}
  fl.connect(g);g.connect(out);if(o.wet&&AU.rev){const s=a.createGain();s.gain.value=o.wet;g.connect(s);s.connect(AU.rev)}}
function nz(t,dur,o={}){
  const a=AC;if(!a)return;const n=Math.max(1,Math.floor(a.sampleRate*(dur+.05))),b=a.createBuffer(1,n,a.sampleRate),d=b.getChannelData(0);for(let i=0;i<n;i++)d[i]=Math.random()*2-1;
  const s=a.createBufferSource();s.buffer=b;const fl=a.createBiquadFilter();fl.type=o.ft||'bandpass';fl.frequency.setValueAtTime(o.f||1500,t);if(o.fEnd)fl.frequency.exponentialRampToValueAtTime(Math.max(40,o.fEnd),t+dur);fl.Q.value=o.q||1;
  const g=a.createGain(),v=o.v==null?.08:o.v,att=o.att||.004;g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(v,t+att);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  s.connect(fl);fl.connect(g);g.connect(o.out||AU.sfx);if(o.wet&&AU.rev){const w=a.createGain();w.gain.value=o.wet;g.connect(w);w.connect(AU.rev)}s.start(t);s.stop(t+dur+.05)}
const bell=(f,t,v=.05,d=.9)=>{[1,2.76,5.4].forEach((r,i)=>voice(f*r,t,d/(i+1),{type:'sine',v:v/(i+1),att:.002,rel:d/(i+1)*.6,wet:.4}))};
// ---------------------------------------------------------------- efectos
function sfx(n){
  if(S.sound===false||!auInit())return;const a=AC,t=a.currentTime+.005,R=Math.random;
  switch(n){
    case'click':voice(820,t,.05,{type:'triangle',v:.035,att:.001,rel:.03});voice(1230,t,.03,{type:'sine',v:.02,att:.001,rel:.02});break;
    case'step':{const k=R();nz(t,.07,{f:300+k*250,q:.8,v:.05});voice(80+k*30,t,.06,{type:'sine',v:.05,att:.002,rel:.05,slide:-30});break}
    case'hit':nz(t,.14,{f:1800,fEnd:400,q:.7,v:.1});voice(150,t,.16,{type:'sine',v:.12,att:.001,slide:-90,rel:.1});voice(320,t,.05,{type:'square',v:.03,att:.001,rel:.03});break;
    case'kill':nz(t,.3,{f:900,fEnd:150,q:.6,v:.12});voice(110,t,.35,{type:'sawtooth',v:.07,att:.002,slide:-70,cut:900,cutEnd:150,rel:.2});voice(70,t+.02,.4,{type:'sine',v:.14,att:.003,slide:-35,rel:.2});break;
    case'shoot':nz(t,.1,{ft:'highpass',f:2800,v:.05});voice(260,t,.09,{type:'triangle',v:.05,att:.001,slide:-170,rel:.05});nz(t+.05,.22,{f:2400,fEnd:700,q:.8,v:.035});break;
    case'spell':[0,4,7,12,16].forEach((s,i)=>voice(mtof(72+s),t+i*.06,.5,{type:'triangle',v:.035,att:.01,rel:.35,det:7,wet:.6}));nz(t,.6,{ft:'highpass',f:3500,v:.03,att:.15,wet:.5});break;
    case'coin':bell(1568,t,.05,.55);bell(2093,t+.07,.05,.6);break;
    case'recruit':voice(262,t,.18,{type:'sawtooth',v:.04,cut:1200,att:.02,rel:.1,det:6,wet:.2});voice(392,t+.14,.3,{type:'sawtooth',v:.045,cut:1500,att:.02,rel:.2,det:6,wet:.25});nz(t,.05,{f:4000,v:.04});break;
    case'build':for(let i=0;i<3;i++){nz(t+i*.13,.06,{f:1500,q:2,v:.07});voice(180-i*10,t+i*.13,.08,{type:'square',v:.04,att:.001,rel:.05,cut:900})}bell(660,t+.45,.04,.8);break;
    case'level':[0,4,7,12].forEach((s,i)=>{voice(mtof(67+s),t+i*.11,.6,{type:'sawtooth',v:.035,cut:2400,att:.02,rel:.4,det:8,wet:.4});bell(mtof(79+s),t+i*.11,.03,.8)});break;
    case'chest':voice(110,t,.25,{type:'sawtooth',v:.04,cut:700,slide:60,att:.05,rel:.1});nz(t+.2,.15,{f:600,q:3,v:.05});[0,4,7,12].forEach((s,i)=>bell(mtof(76+s),t+.3+i*.07,.035,.6));break;
    case'gate':nz(t,.9,{f:300,fEnd:60,q:.6,v:.12,att:.15,wet:.3});voice(55,t,.9,{type:'sine',v:.12,att:.2,slide:-15,rel:.3});voice(220,t,.9,{type:'sawtooth',v:.03,cut:500,cutEnd:100,att:.3,rel:.3,wet:.4});break;
    case'battle':for(let i=0;i<4;i++){voice(70,t+i*.18,.25,{type:'sine',v:.15,att:.002,slide:-35,rel:.1});nz(t+i*.18,.08,{f:200,q:.6,v:.06})}voice(196,t+.7,.6,{type:'sawtooth',v:.045,cut:1400,att:.04,rel:.3,det:8,wet:.3});voice(294,t+.7,.6,{type:'sawtooth',v:.04,cut:1400,att:.04,rel:.3,det:8,wet:.3});break;
    case'win':[[0,0],[4,.14],[7,.28],[12,.42],[16,.6]].forEach(([s,d])=>{voice(mtof(67+s),t+d,.7,{type:'sawtooth',v:.04,cut:2600,att:.02,rel:.4,det:7,wet:.4});bell(mtof(79+s),t+d,.03,.9)});break;
    case'lose':[[0,0],[-2,.3],[-5,.6],[-9,.95]].forEach(([s,d])=>voice(mtof(62+s),t+d,.55,{type:'sawtooth',v:.04,cut:900,cutEnd:300,att:.04,rel:.3,det:10,wet:.4}));break;
    case'boat':nz(t,1.1,{f:700,fEnd:300,q:.5,v:.06,att:.25,wet:.3});voice(95,t+.1,.5,{type:'triangle',v:.03,att:.1,slide:15,rel:.2});break;
    default:voice(600,t,.05,{type:'triangle',v:.03})}
}
// ---------------------------------------------------------------- música original
const MODES={maj:[0,2,4,5,7,9,11],lyd:[0,2,4,6,7,9,11],dor:[0,2,3,5,7,9,10],min:[0,2,3,5,7,8,10],phr:[0,1,3,5,7,8,10]};
const THEMES={
  menu:{bpm:66,root:57,mode:'dor',prog:[0,5,3,4],perc:0,pad:.05,arp:.45,mel:.8,reg:12},
  adv:{bpm:76,root:55,mode:'lyd',prog:[0,4,5,3,0,2,3,4],perc:0,pad:.04,arp:.35,mel:.6,reg:12},
  town:{bpm:88,root:60,mode:'maj',prog:[0,3,4,0,5,3,1,4],perc:1,pad:.035,arp:.7,mel:.75,reg:12},
  battle:{bpm:132,root:50,mode:'phr',prog:[0,0,5,6,0,0,3,4],perc:2,pad:.04,arp:.2,mel:.45,reg:12}
};
const degMidi=(th,d)=>{const sc=MODES[th.mode],o=Math.floor(d/7),i=((d%7)+7)%7;return th.root+sc[i]+12*o};
function auBar(th,bar,t,bd){
  const deg=th.prog[bar%th.prog.length],b=bd/4,R=AU.rnd,out=AU.mus;
  const chord=[degMidi(th,deg),degMidi(th,deg+2),degMidi(th,deg+4)];
  // colchón de cuerdas
  chord.forEach(m=>voice(mtof(m),t,bd*1.02,{type:'sawtooth',v:th.pad*.5,cut:1100,cutEnd:700,att:bd*.35,rel:bd*.35,det:9,out,wet:.55}));
  // bajo
  voice(mtof(chord[0]-12),t,b*1.9,{type:'triangle',v:.06,att:.02,rel:.2,out});
  if(th.perc||bar%2)voice(mtof(chord[0]-12),t+b*2,b*1.7,{type:'triangle',v:.05,att:.02,rel:.2,out});
  // arpegio de arpa
  const pat=[0,1,2,1,2,1,0,2];
  for(let i=0;i<8;i++)if(R()<th.arp)voice(mtof(chord[pat[i]]+12+(i%4===3?12:0)),t+i*b/2,.5,{type:'triangle',v:.032,att:.004,rel:.4,out,wet:.45});
  // melodía: paseo por la escala con tendencia a notas del acorde y silencios
  if(AU.mdeg==null)AU.mdeg=deg+4;
  let t0=0;const rhy=[[2,2],[1,1,2],[3,1],[2,1,1],[4]][Math.floor(R()*5)];
  for(const len of rhy){if(R()<th.mel){
      const step=[-2,-1,-1,0,1,1,2][Math.floor(R()*7)];let di=AU.mdeg+step;di=Math.max(deg+1,Math.min(deg+9,di));AU.mdeg=di;
      voice(mtof(degMidi(th,di)+12),t+t0*b,len*b*.95,{type:'triangle',v:.05,att:.03,rel:.25,cut:2600,out,wet:.5,det:4})}
    t0+=len}
  // percusión
  if(th.perc===2){for(let i=0;i<8;i++){const tt=t+i*b/2;
      if(i%4===0)voice(60,tt,.2,{type:'sine',v:.2,att:.002,slide:-35,rel:.1,out});
      if(i%4===2){nz(tt,.14,{f:1800,q:.7,v:.07,out});voice(190,tt,.1,{type:'triangle',v:.04,att:.002,slide:-60,out})}
      if(i%2===1)nz(tt,.03,{ft:'highpass',f:6500,v:.025,out})}
    if(bar%2===1)voice(mtof(chord[0]),t+b*3.5,b*.5,{type:'sawtooth',v:.04,cut:1600,att:.01,out,det:6})}
  else if(th.perc===1){[0,2].forEach(i=>voice(75,t+i*b,.25,{type:'sine',v:.07,att:.003,slide:-28,rel:.1,out}));nz(t+b,.05,{f:3000,v:.02,out});nz(t+3*b,.05,{f:3000,v:.02,out})}
}
function auScene(){const s=S.scr;return s==='battle'?'battle':s==='town'?'town':(s==='adv')?'adv':'menu'}
function auTick(){
  if(!AC||!AU.ready)return;const a=AC;
  const want=S.music!==false&&a.state==='running';
  const sc=auScene();
  if(sc!==AU.scene){AU.scene=sc;AU.theme=THEMES[sc];AU.bar=0;AU.mdeg=null;AU.next=a.currentTime+.4}
  AU.mus.gain.cancelScheduledValues(a.currentTime);AU.mus.gain.setTargetAtTime(want?.55:0,a.currentTime,.4);
  if(!want||!AU.theme)return;
  const bd=60/AU.theme.bpm*4;
  if(AU.next<a.currentTime-.2)AU.next=a.currentTime+.05;
  while(AU.next<a.currentTime+.9){auBar(AU.theme,AU.bar,AU.next,bd);AU.bar++;AU.next+=bd}
}
window.addEventListener('pointerdown',()=>{auInit()},{passive:true});
window.addEventListener('keydown',()=>{auInit()},{passive:true});
setInterval(auTick,200);
