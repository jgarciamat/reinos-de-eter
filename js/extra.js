'use strict';
// =====================================================================
//  Interfaz de las novedades: semana especial, combate rápido, fusiones
// =====================================================================
try{G.quick=localStorage.getItem('reinos_quick')==='1'}catch(e){}
function toggleQuick(){G.quick=!G.quick;try{localStorage.setItem('reinos_quick',G.quick?'1':'0')}catch(e){}}
G.hooks.weekBanner=(ev,info)=>{
  let txt;
  if(ev.t==='creature')txt=`¡${weekLabel(ev)}!\n\nLa producción de ${CR[ev.cr].name} se duplica (+5) en todas las ciudades y moradas.\nHan aparecido ${info.spawned} nuevas manadas por el mapa (marcadas con un aro verde) y las que ya había se han duplicado.`;
  else if(ev.t==='plague')txt='¡Semana de la Plaga!\n\nLa población de criaturas disponible en ciudades y moradas se reduce a la mitad.';
  else txt=`Comienza la semana ${ev.week}.\n\nLas criaturas de ciudades y moradas crecen y las manadas errantes aumentan poco a poco.`;
  Dlg.show({title:weekLabel(ev),w:560,text:txt,buttons:[{label:'Entendido',primary:1}]});
};
G.hooks.quickReport=(b,A,D,done)=>{
  const res=b.result(),won=b.winner===0;
  const losses=(sd,si)=>{const out=[];sd.army.forEach((a,i)=>{if(!a||a.n<=0)return;const left=res[si][i]?res[si][i].n:0;if(left<a.n)out.push({id:a.id,n:a.n-left})});return out};
  const mine=losses(A,0),foe=losses(D,1),rows=Math.max(1,Math.ceil(Math.max(mine.length,foe.length)/4));
  let foot=`${b.round} rondas`;if(b.wall){const broken=[...b.wall.values()].filter(w=>w.hp<=0).length;foot=`Muralla de nivel ${b.siege.lvl}: ${broken} de ${b.wall.size} secciones destruidas · ${foot}`}
  const cs=(b.casts&&b.casts[0])||[];if(cs.length){const cnt={};cs.forEach(k=>cnt[k]=(cnt[k]||0)+1);foot+=' · Hechizos: '+Object.keys(cnt).map(k=>SPELLS[k].n+(cnt[k]>1?' ×'+cnt[k]:'')).join(', ')}
  Dlg.show({title:won?'¡Victoria! (combate rápido)':'Derrota (combate rápido)',w:620,text:'',extra:34+rows*68+26,buttons:[{label:'Aceptar',primary:1,fn:done}],
    body:(x,y,w)=>{
      const col=(x0,tit,col,list)=>{text(tit,x0,y+16,{size:14,bold:true,color:col});
        if(!list.length)text('Sin bajas',x0,y+52,{size:14,italic:true,color:'#9a8a70'});
        list.forEach((u,i)=>slot(x0+(i%4)*66,y+26+Math.floor(i/4)*68,62,{id:u.id,n:'−'+u.n,tip:[CR[u.id].name,`Bajas: ${u.n}`]}))};
      col(x+20,'TUS BAJAS','#e08070',mine);col(x+w/2+10,'BAJAS DEL ENEMIGO','#9ad0ff',foe);
      text(foot,x+w/2,y+34+rows*68+8,{size:12,align:'center',color:'#c8b890'})}});
};

G.hooks.dialog=(title,text)=>Dlg.show({title,w:560,text,buttons:[{label:'Entendido',primary:1}]});
function openObjectives(){
  const m=G.map,v=m.vic||{t:'conquest'};
  Dlg.show({title:'Objetivos',w:760,draw:()=>{const x=260,y=70,w=760,hh=580;panel(x,y,w,hh,{title:'Objetivos y misiones'});
    const sp=m.spec;text(`${sp.lvn} · ${sp.startTowns} castillo${sp.startTowns>1?'s':''} inicial${sp.startTowns>1?'es':''}`,x+24,y+54,{size:14,color:'#c8b890'});
    text('VICTORIA',x+24,y+82,{size:13,bold:true,color:'#c8a24a'});
    let ly=y+102;ly+=paragraph(victoryText(v),x+24,ly,w-48,{size:15,color:'#ffe9a0'});
    let prog='';if(v.t==='gold')prog=`Oro actual: ${G.players[0].res.gold.toLocaleString('es-ES')} / ${v.n.toLocaleString('es-ES')}`;else if(v.t==='quests')prog=`Misiones cumplidas: ${G.qdone||0} / ${v.n}`;else if(v.t==='survive')prog=`Día ${G.day} / ${v.n}`;else if(v.t==='capital'){const t=m.objs[v.town];prog=t?`Ciudadela Real: ${t.name} (${t.x},${t.y%(m.lh+2)})`:''}else if(v.t==='grail')prog='La zona aproximada está marcada en el minimapa (círculo dorado).';
    if(prog)text(prog,x+24,ly+4,{size:13,color:'#9affc8'});
    if(v.t==='capital'){const t=m.objs[v.town];if(t)button(x+w-170,y+90,140,30,'Ir a la capital',()=>{Dlg.close();camTo(t.x+2,t.y+1)},{size:13})}
    text('Derrotar a todos los rivales siempre te da la victoria.',x+24,ly+26,{size:12,italic:true,color:'#9a8a70'});
    text('MISIONES DE LOS VIDENTES',x+24,y+196,{size:13,bold:true,color:'#c8a24a'});
    const qs=allQuests();if(!qs.length)text('Aún no has hablado con ningún vidente. Busca las cabañas moradas con una estrella.',x+24,y+222,{size:13,italic:true,color:'#9a8a70'});
    qs.slice(0,7).forEach((o,i)=>{const q=o.q,yy=y+206+i*48;rrect(ctx,x+20,yy,w-40,42,6,'rgba(40,30,44,.85)',q.done?'#5a9a5a':'#7a6a48',1.2);
      text((q.done?'✔ ':'')+questText(q).slice(0,78),x+30,yy+18,{size:12,bold:true,color:q.done?'#9aff9a':'#f2e6c8'});text(`Recompensa: ${rewardText(q.rw)}`,x+30,yy+34,{size:11,color:'#d8c8a0'});
      if(!q.done)button(x+w-120,yy+8,80,26,'Ir',()=>{Dlg.close();camTo(o.x,o.y)},{size:12})});
    button(x+w/2-60,y+hh-48,120,34,'Cerrar',()=>Dlg.close())}});
}
