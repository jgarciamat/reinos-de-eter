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
  const res=b.result(),won=b.winner===0;const L=[];
  const side=(sd,si,tit)=>{L.push(tit);let any=false;sd.army.forEach((a,i)=>{if(!a||a.n<=0)return;const left=res[si][i]?res[si][i].n:0;L.push(`  ${CR[a.id].name}: ${a.n} → ${left}${left<a.n?`  (−${a.n-left})`:''}`);any=true});if(!any)L.push('  —')};
  side(A,0,'Tus tropas:');side(D,1,'Enemigo:');
  if(b.wall){const broken=[...b.wall.values()].filter(w=>w.hp<=0).length;L.push('',`Muralla de nivel ${b.siege.lvl}: ${broken} de ${b.wall.size} secciones destruidas · ${b.round} rondas`)}
  else L.push('',`${b.round} rondas`);
  Dlg.show({title:won?'¡Victoria! (combate rápido)':'Derrota (combate rápido)',w:560,text:L.join('\n'),buttons:[{label:'Aceptar',primary:1,fn:done}]});
};
