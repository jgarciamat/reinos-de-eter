'use strict';
// =====================================================================
//  REINOS DE ÉTER — datos: recursos, terrenos, facciones, criaturas,
//  hechizos, artefactos, habilidades y edificios
// =====================================================================
const RES=['gold','wood','ore','mercury','sulfur','crystal','gems'];
const RESN={gold:'Oro',wood:'Madera',ore:'Mineral',mercury:'Mercurio',sulfur:'Azufre',crystal:'Cristal',gems:'Gemas'};
const RESC={gold:'#ffd24a',wood:'#b5834f',ore:'#a9b2c0',mercury:'#d4dff0',sulfur:'#ece64a',crystal:'#6ae6ff',gems:'#ff6aae'};
const WATER=0,GRASS=1,DIRT=2,SAND=3,SNOW=4,SWAMP=5,ROUGH=6,ASH=7,LAVA=8,SUBT=9;
const IMP=t=>t===WATER||t===LAVA;
// coste de movimiento por terreno (100 = 1 casilla) según nivel de Orientación [ninguna, básica, avanzada, experta] — tabla del manual de Heroes 3
const TERR=[{n:'Agua',cost:0,pf:[0,0,0,0]},{n:'Pradera',cost:100,pf:[100,100,100,100]},{n:'Tierra',cost:100,pf:[100,100,100,100]},{n:'Arena',cost:150,pf:[150,125,100,100]},{n:'Nieve',cost:150,pf:[150,125,100,100]},{n:'Pantano',cost:175,pf:[175,150,125,100]},{n:'Roca',cost:125,pf:[125,100,100,100]},{n:'Ceniza',cost:110,pf:[110,100,100,100]},{n:'Lava',cost:0,pf:[0,0,0,0]},{n:'Subterráneo',cost:100,pf:[100,100,100,100]}];
const PCOL=['#3f7fe0','#e0443c','#3fb85a','#e0b83a','#9a4fd0','#2fc0c0','#e07a2a','#d86aa8'];
const PNAME=['Azul','Rojo','Verde','Amarillo','Púrpura','Turquesa','Naranja','Rosa'];

// ---------- criaturas ----------
// Esquema por nivel de criatura (promedios de las tablas de criaturas de Heroes 3: ataque/defensa, daño, vida, velocidad, crecimiento semanal y coste)
const TIER=[null,
 {a:4,d:4,mn:1,mx:3,hp:6,sp:4,gr:14,g:55},
 {a:6,d:5,mn:2,mx:3,hp:13,sp:4,gr:9,g:110},
 {a:8,d:7,mn:3,mx:5,hp:22,sp:6,gr:7,g:200},
 {a:10,d:10,mn:6,mx:9,hp:34,sp:5,gr:4,g:300},
 {a:12,d:11,mn:11,mx:15,hp:48,sp:6,gr:3,g:500},
 {a:15,d:14,mn:15,mx:22,hp:95,sp:7,gr:2,g:950},
 {a:19,d:18,mn:35,mx:50,hp:170,sp:9,gr:1,g:2500}];
// mejora de cada nivel (valores medios de Heroes 3): +ataque, +defensa, ×vida, +velocidad, ×daño, ×coste
const UPG=[null,{a:2,d:1,hp:1.15,sp:1,dm:1,c:1.25},{a:1,d:1,hp:1.1,sp:1,dm:1,c:1.4},{a:1,d:1,hp:1.1,sp:2,dm:1,c:1.25},{a:2,d:1,hp:1.1,sp:1,dm:1.05,c:1.33},
 {a:1,d:1,hp:1.1,sp:1,dm:1.05,c:1.3},{a:1,d:1,hp:1.1,sp:2,dm:1.05,c:1.2},{a:5,d:5,hp:1.4,sp:4,dm:1.1,c:1.5}];
// [nombre, arquetipo, paleta[3], mods]  — 7 base + 7 mejoradas por facción
const FDEF=[
 {id:'alba',name:'Ciudadela del Alba',short:'Alba',terr:GRASS,rare:'crystal',col:['#e8c25a','#3b6fd0','#f4f0e0'],
  desc:'Reino humano de caballeros y clérigos. Disciplina, ballestas y criaturas sagradas.',
  cr:[['Alabardero','hum',['#9aa8c0','#3b6fd0','#e8c25a'],{}],['Ballestero Real','arch',['#8a6a4a','#3b6fd0','#d8d0c0'],{sh:12,ab:'S',dm:.9}],
      ['Grifo Solar','bird',['#d8b050','#f4ecd0','#c07020'],{ab:'F',sp:1}],['Caballero Lancero','cav',['#c8d0e0','#3b6fd0','#e8c25a'],{ab:'',sp:1}],
      ['Sacerdote','mage',['#f4f0e0','#e8c25a','#8ac0ff'],{sh:12,ab:'S',dm:.8}],['Paladín','hum',['#e8e0c0','#e8c25a','#3b6fd0'],{ab:'D',big:1}],['Serafín','angel',['#fff4d0','#e8c25a','#8ad0ff'],{ab:'F',big:1}],
      ['Alabardero Veterano','hum',['#b0bcd4','#2f5ac0','#ffd75a'],{}],['Ballestero de Élite','arch',['#9a7a52','#2f5ac0','#f0e8d8'],{ab:'D'}],
      ['Grifo Imperial','bird',['#f0c860','#fff8e0','#d08030'],{}],['Campeón Lancero','cav',['#e0e8f4','#2f5ac0','#ffd75a'],{ab:'D'}],
      ['Prelado Solar','mage',['#fffaf0','#ffd75a','#a0d4ff'],{ab:'N'}],['Cruzado Dorado','hum',['#f4e8b8','#ffd75a','#2f5ac0'],{ab:'N'}],['Arcángel Radiante','angel',['#ffffff','#ffd75a','#a0e0ff'],{ab:'V'}]]},
 {id:'bosque',name:'Bosque Umbrío',short:'Bosque',terr:GRASS,rare:'gems',col:['#4fa850','#a8e060','#2a5a2a'],
  desc:'Hadas, elfos y guardianes del bosque. Arqueros letales y bestias mágicas.',
  cr:[['Duende','imp',['#8ae070','#d8ffb0','#f0f060'],{ab:'F',sp:2,dm:.8}],['Arquero Élfico','arch',['#4f9a4a','#c8a860','#f4f0c0'],{sh:24,ab:'SD'}],
      ['Dríade','hum',['#9ad890','#d8f0c0','#7a5a3a'],{hp:1.1}],['Centauro Cazador','cent',['#8a5a3a','#4f9a4a','#e8d8a8'],{sh:12,ab:'S',sp:1}],
      ['Ent Guardián','tree',['#6a4a2a','#4f9a3a','#a8d870'],{hp:1.2,sp:-1}],['Unicornio','beast',['#fafafa','#d8c8ff','#ffe070'],{ab:'N',big:1,sp:2}],['Dragón Esmeralda','dragon',['#3aaa5a','#a8f0a0','#e8e060'],{ab:'FB',big:1}],
      ['Hada Danzante','imp',['#a0f088','#ffffd0','#ffe060'],{ab:'N'}],['Arquero Silvano','arch',['#3f8a42','#d8b870','#f8f4d0'],{ab:'N'}],
      ['Dríade Ancestral','hum',['#b0e8a8','#f0ffd8','#8a6a40'],{ab:'R'}],['Centauro Salvaje','cent',['#9a6a42','#3f8a42','#f0e0b0'],{ab:'D'}],
      ['Ent Milenario','tree',['#7a5a30','#5aaa3a','#c8f080'],{ab:'R'}],['Unicornio Argénteo','beast',['#ffffff','#e8d8ff','#fff090'],{ab:'N'}],['Dragón de Jade','dragon',['#2a9a5a','#c0f8c0','#f4f070'],{ab:'V'}]]},
 {id:'cripta',name:'Cripta Sepulcral',short:'Cripta',terr:ASH,rare:'mercury',col:['#8a7ab0','#2a2438','#b8e0c0'],
  desc:'No-muertos, nigromantes y señores de la noche. Ejércitos infinitos y regeneración.',
  cr:[['Esqueleto','undead',['#e8e4d0','#8a8a7a','#5a4a3a'],{}],['Zombi','undead',['#8aa070','#5a6a4a','#6a4a3a'],{hp:1.4,sp:-1,dm:.9,gr:1.2}],
      ['Espectro','ghost',['#c8d8f0','#8aa0d0','#ffffff'],{ab:'F',hp:.9}],['Vampiro','vamp',['#4a2a5a','#a02838','#e8e0e0'],{ab:'FV'}],
      ['Liche','lich',['#5a3a7a','#b8f0c0','#e8e4d0'],{sh:12,ab:'S',dm:.8}],['Caballero Negro','cav',['#2a2a38','#7a1a2a','#a0a8b8'],{ab:'N'}],['Dragón Óseo','dragon',['#d8d4c0','#7a8a7a','#a0e0b0'],{ab:'F',big:1}],
      ['Esqueleto Guerrero','undead',['#f0ecd8','#9a9a88','#7a2a2a'],{ab:'D'}],['Zombi Pútrido','undead',['#98b078','#6a7a50','#7a4a3a'],{ab:'R'}],
      ['Fantasma Aullante','ghost',['#d8e4ff','#9ab0e0','#ffffff'],{ab:'N'}],['Vampiro Señor','vamp',['#5a2a6a','#c02a40','#f4eaea'],{ab:'N'}],
      ['Liche Supremo','lich',['#6a3a8a','#d0ffd0','#f0ecd8'],{ab:'B'}],['Caballero de la Muerte','cav',['#1a1a28','#a0182a','#b0b8c8'],{ab:'D'}],['Dragón Espectral','dragon',['#e4e0d0','#8a9a8a','#b0f0c0'],{ab:'V'}]]},
 {id:'brasa',name:'Fortaleza Brasa',short:'Brasa',terr:ASH,rare:'sulfur',col:['#e0502a','#3a1a14','#ffb040'],
  desc:'Demonios, diablos y fuego eterno. Criaturas veloces y devastadoras.',
  cr:[['Diablillo','imp',['#d83a2a','#ffb040','#3a1a14'],{sp:1,ab:'F',dm:.9}],['Gárgola Ígnea','bird',['#8a6a60','#e0502a','#ffb040'],{ab:'F',d:2,hp:1.1}],
      ['Cancerbero','beast',['#5a2a22','#e0502a','#ffd070'],{ab:'D',sp:1}],['Súcubo','demon',['#a02a5a','#ffb0c0','#3a1a14'],{sh:12,ab:'S',dm:.9}],
      ['Ifrit','ghost',['#ff8030','#ffe070','#ffffff'],{ab:'F'}],['Diablo del Foso','demon',['#9a2a1a','#ffb040','#2a1210'],{ab:'N',big:1}],['Archidemonio','demon',['#6a1a2a','#ff5020','#ffd070'],{ab:'F',big:1}],
      ['Diablillo Rabioso','imp',['#f04a30','#ffc860','#4a1a14'],{ab:'D'}],['Gárgola Magmática','bird',['#9a7a70','#ff6a30','#ffd070'],{ab:'R'}],
      ['Cancerbero Infernal','beast',['#6a2a22','#ff6a30','#ffe090'],{ab:'N'}],['Súcubo Maestra','demon',['#b83a6a','#ffc0d0','#4a1a14'],{ab:'D'}],
      ['Ifrit Supremo','ghost',['#ff9a40','#fff090','#ffffff'],{ab:'B'}],['Señor del Foso','demon',['#b0301a','#ffc050','#3a1a14'],{ab:'D'}],['Archidemonio Abisal','demon',['#7a1a3a','#ff6a30','#ffe090'],{ab:'V'}]]},
 {id:'baluarte',name:'Baluarte Pétreo',short:'Baluarte',terr:ROUGH,rare:'gems',col:['#b08a5a','#4a4a54','#e8a040'],
  desc:'Enanos, golems y titanes de piedra. Defensa inquebrantable y magia rúnica.',
  cr:[['Minero','hum',['#8a6a4a','#c0a060','#6a6a74'],{d:1}],['Ballestero Enano','arch',['#7a5a3a','#b04a2a','#c0a060'],{sh:12,ab:'S',dm:.9}],
      ['Golem de Roca','golem',['#8a8a94','#5a5a64','#e8a040'],{hp:1.3,sp:-1}],['Berserker Enano','hum',['#b04a2a','#c0a060','#6a6a74'],{ab:'D',sp:1}],
      ['Mago Rúnico','mage',['#3a5aa0','#e8a040','#d8d8e8'],{sh:12,ab:'S',dm:.9}],['Jinete de Jabalí','cav',['#6a4a3a','#b04a2a','#c0a060'],{ab:'',sp:1}],['Titán de Piedra','golem',['#9a9aa4','#6a6a74','#ffd070'],{big:1,ab:'N'}],
      ['Minero Curtido','hum',['#9a7a52','#d0b070','#7a7a84'],{ab:'N'}],['Ballestero Rúnico','arch',['#8a6a42','#c05a2a','#d0b070'],{ab:'D'}],
      ['Golem de Hierro','golem',['#a0a0b0','#6a6a7a','#ffb050'],{ab:'R'}],['Berserker Sanguinario','hum',['#c05a2a','#d0b070','#7a7a84'],{ab:'N'}],
      ['Archimago Rúnico','mage',['#4a6ab8','#ffb050','#e8e8f4'],{ab:'N'}],['Jinete Colmillo','cav',['#7a5a42','#c05a2a','#d0b070'],{ab:'D'}],['Titán de Montaña','golem',['#aaaab4','#7a7a84','#ffe080'],{ab:'B'}]]},
 {id:'marea',name:'Cala Marea',short:'Marea',terr:SAND,rare:'crystal',col:['#2fa0d0','#f0e0a0','#1a4a7a'],
  desc:'Piratas, sirenas y monstruos marinos. Magia de mareas y bestias abisales.',
  cr:[['Pirata','hum',['#a02a2a','#e8d8b0','#4a3a2a'],{}],['Arponero','arch',['#2a6a9a','#e8d8b0','#c0a060'],{sh:12,ab:'S',dm:1}],
      ['Sirena','naga',['#2fc0b0','#f0a0c0','#a0f0e0'],{sh:12,ab:'S',dm:.8}],['Cangrejo Colosal','crab',['#d85a3a','#f0a070','#ffe0b0'],{ab:'',hp:1.2}],
      ['Hechicero Marino','mage',['#2a5ab8','#60d0e8','#f0e8c0'],{sh:12,ab:'S'}],['Kraken','kraken',['#7a3a8a','#c070d0','#f0d0f0'],{big:1,ab:'A'}],['Leviatán','dragon',['#1a6a9a','#60c0e0','#f0f0c0'],{ab:'F',big:1}],
      ['Corsario','hum',['#b83a3a','#f0e0b8','#3a2a1a'],{ab:'D'}],['Arponero Maestro','arch',['#3a7aaa','#f0e0b8','#d0b070'],{ab:'N'}],
      ['Sirena Encantadora','naga',['#40d0c0','#ffb0d0','#b0fff0'],{ab:'N'}],['Cangrejo Real','crab',['#e86a40','#ffb080','#fff0c0'],{ab:'A'}],
      ['Hechicero de Tormenta','mage',['#3a6ad0','#80e0f8','#fff0c8'],{ab:'B'}],['Kraken Ancestral','kraken',['#8a4a9a','#d080e0','#f8e0f8'],{ab:'N'}],['Leviatán Abisal','dragon',['#1a7aaa','#70d0f0','#fffad0'],{ab:'V'}]]},
 {id:'cienaga',name:'Ciénaga Venenosa',short:'Ciénaga',terr:SWAMP,rare:'sulfur',col:['#8ab040','#3a4a22','#e0e070'],
  desc:'Anfibios, reptiles e hidras de pantano. Veneno, regeneración y emboscadas.',
  cr:[['Rana Guerrera','frog',['#5aa840','#e8e070','#3a5a22'],{sp:1}],['Lagarto Lancero','hum',['#6a9a4a','#c8a050','#3a4a22'],{ab:'N'}],
      ['Basilisco','serp',['#8a8a3a','#e0c040','#4a3a22'],{ab:'',d:2}],['Serpiente Alada','serp',['#4aa07a','#e8e070','#2a5a42'],{ab:'F',sp:1}],
      ['Chamán Pantanoso','mage',['#5a7a30','#e0e070','#8a5a3a'],{sh:12,ab:'S'}],['Hidra','hydra',['#4a8a3a','#c8e060','#3a2a22'],{ab:'A',big:1}],['Dragón Fétido','dragon',['#7a8a2a','#d8e070','#4a3a22'],{ab:'FB',big:1}],
      ['Rana Venenosa','frog',['#6ac84a','#f0ee80','#3a6a22'],{ab:'N'}],['Lagarto Ponzoñoso','hum',['#7aaa52','#d8b060','#3a5a26'],{ab:'D'}],
      ['Basilisco Mayor','serp',['#9a9a42','#f0d048','#5a4a26'],{ab:'N'}],['Serpiente Quimera','serp',['#58b888','#f0ee80','#2a6a4a'],{ab:'D'}],
      ['Hechicero Venenoso','mage',['#6a8a38','#f0ee80','#9a6a42'],{ab:'N'}],['Hidra de Cinco Cabezas','hydra',['#58a048','#d8f070','#3a2a22'],{ab:'R'}],['Dragón Pútrido','dragon',['#8a9a32','#e8f080','#5a4a26'],{ab:'V'}]]},
 {id:'tormenta',name:'Cumbres Tormenta',short:'Tormenta',terr:SNOW,rare:'gems',col:['#8a6ad0','#5a7ab0','#f0f4ff'],
  desc:'Bárbaros, orcos y gigantes de las altas cumbres. Fuerza bruta y relámpagos.',
  cr:[['Goblin','hum',['#7aa048','#8a5a3a','#c0a060'],{sp:1,hp:.9}],['Orco Arquero','orc',['#5a8a4a','#8a5a3a','#d0c090'],{sh:12,ab:'S',dm:.9}],
      ['Lobo Gigante','beast',['#7a7a88','#c8c8d8','#4a4a58'],{ab:'D',sp:2}],['Ogro','orc',['#9a7a52','#6a4a32','#d0b080'],{hp:1.2}],
      ['Chamán Orco','mage',['#5a7a8a','#8a6ad0','#e0d0a0'],{sh:12,ab:'S'}],['Cíclope','giant',['#a08a6a','#6a4a32','#e8d8b0'],{sh:12,ab:'S',big:1}],['Rey Trueno','bird',['#6a8ae0','#f0f4ff','#ffe860'],{ab:'F',big:1}],
      ['Goblin Veterano','hum',['#8ab058','#9a6a42','#d0b070'],{ab:'D'}],['Orco Cazador','orc',['#6a9a58','#9a6a42','#e0d0a0'],{ab:'D'}],
      ['Lobo Huargo','beast',['#8a8a98','#d8d8e8','#5a5a68'],{ab:'N'}],['Ogro Mazador','orc',['#aa8a62','#7a5a3a','#e0c090'],{ab:'N'}],
      ['Chamán de Tormenta','mage',['#6a8a9a','#9a7ae0','#f0e0b0'],{ab:'B'}],['Cíclope Rey','giant',['#b09a7a','#7a5a3a','#f0e8c0'],{ab:'N'}],['Señor del Rayo','bird',['#7a9af0','#ffffff','#fff070'],{ab:'N'}]]}
];
const NEUTRAL=[['Rata Gigante','beast',['#7a6a5a','#4a3a2a','#d8b0a0'],{},1],['Bandido','hum',['#6a5a4a','#a02a2a','#c0a060'],{},1],['Lobo Salvaje','beast',['#8a8a8a','#5a5a5a','#e8e0d0'],{sp:2},2],
 ['Oso Pardo','beast',['#6a4a2a','#4a3220','#d8b890'],{hp:1.2},3],['Mercenario','hum',['#7a8a9a','#9a3a2a','#d8c090'],{ab:'D'},3],['Araña Gigante','insect',['#3a2a3a','#7a3a5a','#e8d0e8'],{ab:'N',sp:1},3],
 ['Troll','orc',['#6a8a6a','#4a5a4a','#c8d0a0'],{hp:1.3,ab:'R'},4],['Golem de Barro','golem',['#9a6a3a','#6a4a22','#d8b080'],{hp:1.3},4],['Elemental de Hielo','ghost',['#a8e0ff','#60b0e8','#ffffff'],{ab:'F'},5],
 ['Elemental de Fuego','ghost',['#ff8a30','#ffd060','#fff0c0'],{ab:'F'},5],['Mantícora','bird',['#b08a4a','#7a2a2a','#e8d0a0'],{ab:'F',big:1},6],['Dragón Rojo','dragon',['#c0301a','#ff8a50','#ffe080'],{ab:'FB',big:1},7],
 ['Dragón Negro','dragon',['#2a2a38','#6a4a7a','#ff6a6a'],{ab:'FB',big:1,hp:1.2},7],['Gólem de Cristal','golem',['#8ae0f0','#4a9ac0','#ffffff'],{ab:'N',big:1},6]];

// ---- esquema anterior (solo se usa para regenerar mapas de partidas guardadas v1-v2 con el mismo reparto de guardianes) ----
const LEG_TIER=[null,
 {a:4,d:4,mn:1,mx:3,hp:5,sp:4,gr:16,g:60},{a:6,d:5,mn:2,mx:4,hp:11,sp:5,gr:10,g:120},{a:8,d:8,mn:3,mx:7,hp:22,sp:6,gr:8,g:250},{a:10,d:9,mn:6,mx:10,hp:36,sp:6,gr:6,g:400},
 {a:12,d:12,mn:9,mx:15,hp:55,sp:7,gr:4,g:700},{a:16,d:15,mn:15,mx:25,hp:110,sp:8,gr:3,g:1500},{a:20,d:20,mn:30,mx:45,hp:200,sp:10,gr:1,g:3500}];
const CR={};       // id -> criatura
const CRLIST=[];
const CRL={};      // id -> criatura según el esquema anterior (mapas v1-v2)
const CRLIST_L=[];
function buildCreature(id,fi,idx,def,tier,neutral,leg){
  const up=!neutral&&idx>=7,b=(leg?LEG_TIER:TIER)[tier],m=Object.assign({},def[3]);
  if(up){const base=FDEF[fi].cr[idx-7][3];for(const k in base)if(!(k in m)||k==='ab')m[k]=k==='ab'?(base.ab||'')+(m.ab||''):base[k]}
  let a=b.a+(m.a||0),d=b.d+(m.d||0),hp=Math.round(b.hp*(m.hp||1)),dm=m.dm||1,mn=Math.max(1,Math.round(b.mn*dm)),mx=Math.max(mn,Math.round(b.mx*dm)),sp=b.sp+(m.sp||0);
  const U=UPG[tier];
  if(up){if(leg){a+=2;d+=2;hp=Math.round(hp*1.25);mn=Math.round(mn*1.12);mx=Math.round(mx*1.12);sp+=1}else{a+=U.a;d+=U.d;hp=Math.round(hp*U.hp);mn=Math.round(mn*U.dm);mx=Math.round(mx*U.dm);sp+=U.sp}}
  const cost={gold:Math.round(b.g*(m.cost||1)*(up?(leg?1.25:U.c):1)/5)*5};
  if(!neutral&&tier>=(leg?6:7))cost[FDEF[fi].rare]=leg?(tier===6?1:3):(up?2:1); // solo el nivel 7 pide recurso raro (1 la base, 2 la mejorada)
  const ab=m.ab||'';
  const c={id,f:neutral?-1:fi,tier,up,name:def[0],arch:def[1],pal:def[2],atk:a,def:d,mn,mx,hp,spd:sp,shots:ab.includes('S')?(!leg&&up&&(m.sh||12)<=12?24:(m.sh||12)):0,
    fly:ab.includes('F'),shoot:ab.includes('S'),dbl:ab.includes('D'),noret:ab.includes('N'),regen:ab.includes('R'),drain:ab.includes('V'),breath:ab.includes('B'),area:ab.includes('A'),
    big:!!m.big,grow:Math.max(1,Math.round(b.gr*(m.gr||1))),cost};
  c.val=Math.max(1,Math.round(Math.pow(c.hp*((mn+mx)/2),.7)*(1+(a+d)/40)*(c.shoot?1.25:1)*(c.fly?1.15:1)*(c.dbl?1.4:1)));
  if(leg){CRL[id]=c;CRLIST_L.push(c)}else{CR[id]=c;CRLIST.push(c)}return c;
}
for(const leg of[false,true]){
  FDEF.forEach((f,fi)=>{f.cr.forEach((d,i)=>buildCreature(`f${fi}t${i%7+1}${i>=7?'u':''}`,fi,i,d,i%7+1,false,leg));
    if(!leg)f.units=f.cr.map((d,i)=>`f${fi}t${i%7+1}${i>=7?'u':''}`);});
  NEUTRAL.forEach((d,i)=>buildCreature('n'+i,-1,i,d,d[4],true,leg));
}
const NEUT_BY_VAL=CRLIST.filter(c=>c.f<0).sort((a,b)=>a.val-b.val).map(c=>c.id);
const ALL_BY_VAL=CRLIST.slice().sort((a,b)=>a.val-b.val).map(c=>c.id);
const ALL_BY_VAL_L=CRLIST_L.slice().sort((a,b)=>a.val-b.val).map(c=>c.id);
function abilText(c){const t=[];if(c.fly)t.push('Vuela');if(c.shoot)t.push(`Dispara (${c.shots})`);if(c.dbl)t.push('Ataca dos veces');if(c.noret)t.push('Sin represalia');
  if(c.regen)t.push('Regenera');if(c.drain)t.push('Drena vida');if(c.breath)t.push('Aliento');if(c.area)t.push('Golpea a todos los adyacentes');return t.join(' · ')||'—'}

// ---------- hechizos de combate (costes y fórmulas del manual de Heroes 3) ----------
// base = efecto con dominio básico; bon = [básico, avanzado, experto]; per = por punto de Poder. Daño = bon[nivel] + per×Poder.
// mag = magnitud de beneficios/penalizaciones según dominio de la escuela [básico, avanzado, experto]
const SPELLS={
 chispa:{n:'Chispa Mágica',lv:1,cost:5,k:'dmg',base:10,bon:[10,20,30],per:10,d:'Daño a una criatura: 10 + 10×Poder (20/30 con dominio avanzado/experto).'},
 bendicion:{n:'Bendición',lv:1,cost:5,k:'buff',buff:'bless',dur:3,d:'Una criatura causa el daño máximo.'},
 maldicion:{n:'Maldición',lv:1,cost:6,k:'debuff',buff:'curse',dur:3,d:'Una criatura enemiga causa el daño mínimo.'},
 prisa:{n:'Prisa',lv:1,cost:6,k:'buff',buff:'haste',dur:3,mag:[3,5,5],d:'+3 de velocidad a una criatura aliada (+5 con dominio avanzado).'},
 pielpiedra:{n:'Piel de Piedra',lv:1,cost:5,k:'buff',buff:'stone',dur:3,mag:[3,6,6],d:'+3 de defensa a una criatura aliada (+6 con dominio avanzado).'},
 lentitud:{n:'Lentitud',lv:1,cost:6,k:'debuff',buff:'slow',dur:3,mag:[25,50,50],d:'Reduce un 25% la velocidad de una criatura enemiga (50% con dominio avanzado).'},
 curar:{n:'Curar',lv:1,cost:6,k:'heal',base:10,bon:[10,20,30],per:5,d:'Cura 10 + 5×Poder puntos de vida.'},
 rayo:{n:'Rayo',lv:2,cost:10,k:'dmg',base:10,bon:[10,20,50],per:25,d:'Daño a una criatura: 10 + 25×Poder.'},
 escudo:{n:'Escudo',lv:1,cost:5,k:'buff',buff:'shield',dur:3,mag:[25,50,50],d:'-25% de daño cuerpo a cuerpo recibido (-50% con dominio avanzado).'},
 bola:{n:'Bola de Fuego',lv:3,cost:15,k:'area',base:15,bon:[15,30,60],per:10,d:'Daño en área (objetivo y adyacentes): 15 + 10×Poder.'},
 cadena:{n:'Cadena de Rayos',lv:4,cost:24,k:'chain',base:25,bon:[25,50,100],per:40,d:'Salta entre hasta 4 criaturas enemigas (mitad de daño en cada salto).'},
 resucitar:{n:'Resurrección',lv:3,cost:20,k:'res',base:40,bon:[40,80,160],per:50,d:'Revive criaturas aliadas caídas: 40 + 50×Poder de vida.'},
 implosion:{n:'Implosión',lv:4,cost:30,k:'dmg',base:100,bon:[100,200,300],per:75,d:'Gran daño a una criatura: 100 + 75×Poder.'},
 armagedon:{n:'Armagedón',lv:4,cost:24,k:'all',base:30,bon:[30,60,120],per:50,d:'Daño a TODAS las criaturas del campo: 30 + 50×Poder.'},
 llamarada:{n:'Llamarada',lv:2,cost:9,k:'dmg',base:20,bon:[20,35,50],per:15,d:'Daño de fuego a una criatura: 20 + 15×Poder.'},
 hielo:{n:'Rayo de Hielo',lv:2,cost:8,k:'dmgslow',base:10,bon:[10,20,50],per:20,d:'Daño de hielo (10 + 20×Poder) y ralentiza a la criatura.'},
 tormenta:{n:'Tormenta de Meteoros',lv:4,cost:16,k:'area',base:25,bon:[25,50,100],per:25,d:'Lluvia de fuego en área (objetivo y adyacentes): 25 + 25×Poder.'}
};
// escuela de magia de cada hechizo (Aire, Agua, Fuego, Tierra)
const SCHOOL={chispa:'aire',bendicion:'agua',maldicion:'fuego',prisa:'aire',pielpiedra:'tierra',lentitud:'tierra',curar:'agua',rayo:'aire',escudo:'tierra',bola:'fuego',cadena:'aire',resucitar:'agua',implosion:'tierra',armagedon:'fuego',llamarada:'fuego',hielo:'agua',tormenta:'tierra'};
// nivel de cofradía en que aparece cada hechizo al generar un mapa (se mantiene el reparto anterior para no alterar los mapas de las partidas guardadas)
const GUILD_LV={chispa:1,bendicion:1,maldicion:1,prisa:1,pielpiedra:2,lentitud:2,curar:2,rayo:2,escudo:2,bola:3,cadena:3,resucitar:3,implosion:4,armagedon:4,llamarada:2,hielo:2,tormenta:3};
const SPELL_IDS=Object.keys(SPELLS);

// ---------- habilidades secundarias (basadas en la serie Heroes 1-5) ----------
const SKILLS={
 logistica:{n:'Logística',d:['+10% de movimiento por tierra','+20% de movimiento por tierra','+30% de movimiento por tierra'],k:'m'},
 orientacion:{n:'Orientación',d:['Terrenos difíciles cuestan un 25% menos','Terrenos difíciles cuestan un 50% menos','Sin penalización por terreno'],k:'m'},
 exploracion:{n:'Exploración',d:['+1 de visión','+2 de visión','+3 de visión'],k:'m'},
 navegacion:{n:'Navegación',d:['+50% de movimiento marítimo','+100% de movimiento marítimo','+150% de movimiento marítimo'],k:'m'},
 finanzas:{n:'Fincas',d:['+125 oro/día','+250 oro/día','+500 oro/día'],k:'e'},
 diplomacia:{n:'Diplomacia',d:['Los monstruos se unen con más facilidad (+25%)','Más facilidad (+50%) y rendición -40%','Máxima facilidad (+75%) y rendición -60%'],k:'e'},
 liderazgo:{n:'Liderazgo',d:['+1 de moral','+2 de moral','+3 de moral'],k:'c'},
 suerte:{n:'Suerte',d:['+1 de suerte','+2 de suerte','+3 de suerte'],k:'c'},
 aprendizaje:{n:'Aprendizaje',d:['+5% de experiencia','+10% de experiencia','+15% de experiencia'],k:'e'},
 ataque:{n:'Ofensiva',d:['+10% de daño cuerpo a cuerpo','+20% de daño cuerpo a cuerpo','+30% de daño cuerpo a cuerpo'],k:'c'},
 arqueria:{n:'Arquería',d:['+10% de daño a distancia','+25% de daño a distancia','+50% de daño a distancia'],k:'c'},
 armadura:{n:'Armadura',d:['-5% de daño recibido','-10% de daño recibido','-15% de daño recibido'],k:'c'},
 tacticas:{n:'Tácticas',d:['+1 de velocidad en las 2 primeras rondas','+2 de velocidad en las 2 primeras rondas','+3 de velocidad en las 2 primeras rondas'],k:'c'},
 medicina:{n:'Medicina',d:['Recupera el 10% de las bajas tras el combate','Recupera el 20% de las bajas','Recupera el 30% de las bajas'],k:'c'},
 necromancia:{n:'Nigromancia',d:['Levanta un 10% de los caídos como esqueletos','Levanta un 20% de los caídos','Levanta un 30% de los caídos'],k:'c'},
 inteligencia:{n:'Inteligencia',d:['+25% de maná máximo','+50% de maná máximo','+100% de maná máximo'],k:'g'},
 misticismo:{n:'Misticismo',d:['+2 maná por día','+3 maná por día','+4 maná por día'],k:'g'},
 sabiduria:{n:'Sabiduría',d:['Aprende hechizos de nivel 3','Aprende hechizos de nivel 4','Aprende todos los hechizos'],k:'g'},
 hechiceria:{n:'Hechicería',d:['+5% de daño de hechizos','+10% de daño de hechizos','+15% de daño de hechizos'],k:'g'},
 resistencia:{n:'Resistencia',d:['5% de resistir hechizos de daño','10% de resistir hechizos de daño','20% de resistir hechizos de daño'],k:'g'},
 ojo_aguila:{n:'Ojo de Águila',d:['20% de aprender hechizos enemigos','30% de aprender hechizos enemigos','40% de aprender hechizos enemigos'],k:'g'},
 fuego:{n:'Magia de Fuego',d:['Hechizos de fuego a nivel básico y cuestan menos maná','Hechizos de fuego a nivel avanzado y menos maná','Hechizos de fuego a nivel experto y menos maná'],k:'g'},
 agua:{n:'Magia de Agua',d:['Hechizos de agua a nivel básico y cuestan menos maná','Hechizos de agua a nivel avanzado y menos maná','Hechizos de agua a nivel experto y menos maná'],k:'g'},
 tierra:{n:'Magia de Tierra',d:['Hechizos de tierra a nivel básico y cuestan menos maná','Hechizos de tierra a nivel avanzado y menos maná','Hechizos de tierra a nivel experto y menos maná'],k:'g'},
 aire:{n:'Magia de Aire',d:['Hechizos de aire a nivel básico y cuestan menos maná','Hechizos de aire a nivel avanzado y menos maná','Hechizos de aire a nivel experto y menos maná'],k:'g'}
};
const SKILL_IDS=Object.keys(SKILLS);
const SK_PREF=[['ataque','armadura','logistica','liderazgo','orientacion','tacticas','diplomacia','suerte','arqueria','finanzas','medicina','exploracion','aprendizaje'],['inteligencia','sabiduria','misticismo','hechiceria','fuego','aire','agua','tierra','resistencia','aprendizaje','ojo_aguila','logistica','liderazgo']];
const SPEC_RES=['gold','wood','ore','mercury','sulfur','crystal','gems'];

// ---------- héroes ----------
const HERO_NAMES=[
 ['Aldric','Corvan','Brenna','Tavish','Rowena','Edmund','Isolde','Lyssa','Orsin','Caldera','Mirabel','Theron','Gwendal','Ulric','Seraphine','Lucan','Maelis','Garrick','Odalys','Percival'],
 ['Silvan','Faelar','Thalia','Eldrin','Naia','Brandir','Sylwen','Ormuz','Liriel','Vesper','Aelith','Gaelen','Haldir','Ithilwen','Camrel','Thandor','Elowen','Myrddin','Fenwick','Aranel'],
 ['Mortis','Vexar','Kalthar','Drusa','Nekron','Sethra','Azhar','Morwen','Calix','Lilith','Xandor','Veyra','Grimwald','Ossian','Belphe','Mordrake','Zerena','Vaclav','Tenebra','Hadriel'],
 ['Baal','Ashkar','Zerith','Moloch','Ember','Vulkar','Sorath','Ignis','Kaeda','Pyra','Azrael','Hexa','Draxus','Infernia','Belial','Cinder','Mephis','Karnak','Surtha','Asmodai'],
 ['Durgan','Thrain','Brokk','Helga','Gimrik','Borin','Runa','Dwalin','Magna','Kord','Ysolt','Nori','Hjalmar','Torvald','Embra','Gorm','Skadi','Rurik','Baldur','Thyra'],
 ['Marek','Selene','Coral','Dagon','Nerea','Barbarroja','Tethys','Morgana','Triton','Nixa','Abel','Caspian','Calypso','Jolly','Vasco','Perla','Nereus','Ondina','Kraken','Blackmoor'],
 ['Szass','Ximbo','Quorra','Gharok','Slithe','Mossa','Dreth','Vorta','Zul','Nagaina','Kaa','Bogg','Hissa','Krok','Mudra','Thessk','Ooze','Vyrma','Gargo','Salamandra'],
 ['Gruk','Thorgal','Hilda','Ragnar','Skarn','Bjorn','Ylva','Volund','Freya','Odrik','Siv','Hrolf','Torgrim','Brunhild','Asgrim','Valka','Ulfric','Dagny','Skoll','Rolf']];
const HERO_CLASS=[['Caballero del Alba','Clériga Solar'],['Guardabosques','Archidruida'],['Señor Sepulcral','Nigromante'],['Señor Infernal','Hechicero Ígneo'],['Jefe de Clan','Mago Rúnico'],['Capitán Corsario','Hechicero Marino'],['Cazador de Pantano','Chamán Venenoso'],['Jefe Bárbaro','Chamán de Tormenta']];
const XP_LV=[0,1000,2000,3200,4600,6200,8000,10000,12200,14700,17500,20600,24320,28784,34140,40567,48279,57533,68637,81961,97949,117134,140156,167782,200933,240714,288451,345735,414475,496963];
function xpForLevel(l){if(l<=XP_LV.length)return XP_LV[l-1];let v=XP_LV[XP_LV.length-1];for(let i=XP_LV.length;i<l;i++)v=Math.round(v*1.2);return v}

// ---------- edificios de ciudad ----------
const BNAME={hall1:'Cabildo',hall2:'Consistorio',hall3:'Alcaldía',fort1:'Empalizada',fort2:'Ciudadela',fort3:'Castillo',
 mage1:'Gremio de Magos I',mage2:'Gremio de Magos II',mage3:'Gremio de Magos III',mage4:'Gremio de Magos IV',tavern:'Taberna',market:'Mercado',shipyard:'Astillero',
 dw1:'Viviendas',dw2:'Tiro',dw3:'Cobijo',dw4:'Salón',dw5:'Santuario',dw6:'Palacio',dw7:'Trono'};
const FBNAME=[ // nombres temáticos para viviendas por facción
 ['Cuartel','Campo de Tiro','Aviario Solar','Establos Reales','Capilla','Palacio de Justas','Santuario Celeste'],
 ['Claro de Duendes','Arboleda Élfica','Cueva Dríade','Pradera Centauro','Bosque Ancestral','Prado Argénteo','Nido de Dragón'],
 ['Osario','Cementerio','Mausoleo','Cripta Vampírica','Torre del Liche','Establo Fúnebre','Hueseras'],
 ['Pozo Ardiente','Nido Ígneo','Perrera Infernal','Alcoba Carmesí','Horno de Ifrits','Foso Demoníaco','Portal del Abismo'],
 ['Excavación','Torreta Enana','Forja de Golems','Bóveda Berserker','Torre Rúnica','Corral de Jabalíes','Cima del Titán'],
 ['Muelle Pirata','Puesto de Arpones','Gruta de Sirenas','Cala de Cangrejos','Torre de Mareas','Abismo del Kraken','Trono del Leviatán'],
 ['Charca','Tolderías Lagarto','Nido Basilisco','Torre de Alas','Choza Chamán','Ciénaga Profunda','Sima Pútrida'],
 ['Campamento Goblin','Palizada Orca','Cubil de Lobos','Cueva de Ogros','Tienda Chamán','Torre Ciclópea','Cumbre del Trueno']];
// ingresos de oro por día de la casa consistorial (Heroes 3: 500 / 1000 / 2000)
const HALL_INC=[500,1000,2000];
function townIncome(b){return b.hall3?HALL_INC[2]:b.hall2?HALL_INC[1]:HALL_INC[0]}
// costes de construcción según las tablas del manual de Heroes 3 (viviendas: crecen de 500 a 15000 de oro; el nivel 7 pide 10 de recurso raro)
const DW_COST=[null,{gold:500,ore:10},{gold:1000,wood:5,ore:5},{gold:1000,ore:5},{gold:2000,ore:5},{gold:3000,wood:5,ore:5},{gold:5000,wood:20},{gold:15000}];
const UP_COST=[null,{gold:1000,ore:5},{gold:1000,wood:5,ore:5},{gold:1000},{gold:2000,ore:5},{gold:1000,wood:2,ore:2},{gold:3000,wood:10},{gold:2000}];
function bCost(b,fi){
  const f=FDEF[fi],r=f.rare;let m;
  const dw=/^dw(\d)$/.exec(b),up=/^up(\d)$/.exec(b);
  if(dw){const t=+dw[1],c=Object.assign({},DW_COST[t]);if(t===5)c[r]=3;if(t===7)c[r]=10;return c}
  if(up){const t=+up[1],c=Object.assign({},UP_COST[t]);if(t===5)c[r]=3;if(t===7)c[r]=10;return c}
  m={hall1:{gold:2500},hall2:{gold:2500},hall3:{gold:5000},fort1:{gold:5000,wood:20,ore:20},fort2:{gold:2500,ore:5},fort3:{gold:5000,wood:10,ore:10},
   mage1:{gold:2000,wood:5,ore:5},mage2:{gold:1000,wood:5,ore:5,mercury:4,sulfur:4,crystal:4,gems:4},mage3:{gold:1000,wood:5,ore:5,mercury:6,sulfur:6,crystal:6,gems:6},mage4:{gold:1000,wood:5,ore:5,mercury:8,sulfur:8,crystal:8,gems:8},
   tavern:{gold:500,wood:5},market:{gold:500,wood:5,ore:5},shipyard:{gold:2000,wood:20}}[b];
  return m||{gold:999999};
}
function bReq(b,town){
  const has=x=>town.b[x];let m;
  if(m=/^dw(\d)$/.exec(b)){const t=+m[1];if(t===1)return[];if(t<=3)return['dw1'];return['dw'+(t-2),...(t===5||t>=7?['mage1']:[])]}
  if(m=/^up(\d)$/.exec(b)){return['dw'+m[1],...(+m[1]>=4?['fort1']:[])]}
  if(b==='hall2')return['hall1','tavern'];if(b==='hall3')return['hall2','fort2'];
  if(b==='fort2')return['fort1'];if(b==='fort3')return['fort2'];
  if(b==='mage2')return['mage1'];if(b==='mage3')return['mage2'];if(b==='mage4')return['mage3'];
  return[];
}
const BUILD_ORDER=['hall1','hall2','hall3','fort1','fort2','fort3','tavern','market','shipyard','mage1','mage2','mage3','mage4','dw1','dw2','dw3','dw4','dw5','dw6','dw7','up1','up2','up3','up4','up5','up6','up7'];
function bTitle(b,fi){let m;if(m=/^dw(\d)$/.exec(b))return FBNAME[fi][+m[1]-1];if(m=/^up(\d)$/.exec(b))return 'Mejora: '+FBNAME[fi][+m[1]-1];return BNAME[b]}
function canAfford(p,cost,mul=1){for(const k in cost)if((p.res[k]||0)<cost[k]*mul)return false;return true}
function spend(p,cost,mul=1){for(const k in cost)p.res[k]-=cost[k]*mul}
function costText(cost,mul=1){return Object.keys(cost).filter(k=>cost[k]).map(k=>`${cost[k]*mul} ${RESN[k]}`).join(', ')}

// ---------- utilidades ----------
function mulberry(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const irnd=(r,a,b)=>a+Math.floor(r()*(b-a+1));
const pick=(r,a)=>a[Math.floor(r()*a.length)];
