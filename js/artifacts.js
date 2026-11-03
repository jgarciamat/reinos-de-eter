'use strict';
// =====================================================================
//  Artefactos: 14 ranuras de equipo, ~140 objetos y 11 conjuntos
// =====================================================================
const SLOTKEYS={fusion:[],weapon:['weapon'],shield:['shield'],helm:['helm'],armor:['armor'],neck:['neck'],cloak:['cloak'],boots:['boots'],gloves:['gloves'],ring:['ring1','ring2'],misc:['misc1','misc2','misc3','misc4']};
const SLOTN={fusion:'Fusión',weapon:'Arma',shield:'Escudo',helm:'Yelmo',armor:'Armadura',neck:'Amuleto',cloak:'Capa',boots:'Botas',gloves:'Guantes',ring:'Anillo',misc:'Objeto'};
const EQKEYS=['helm','neck','weapon','armor','shield','gloves','cloak','boots','ring1','ring2','misc1','misc2','misc3','misc4'];
const BNAMES={a:'Ataque',d:'Defensa',sp:'Poder',kn:'Conocimiento',mp:'Movimiento',mpw:'Movimiento marítimo',vis:'Visión',gold:'Oro/día',mor:'Moral',luck:'Suerte',mana:'Maná/día',spd:'Velocidad de unidades',hp:'Vida de unidades',necro:'% Nigromancia',res:'% Resistencia mágica',xp:'% Experiencia',eagle:'% Ojo de águila',dip:'% Diplomacia',sf:'% daño de Fuego',sw:'% daño de Agua',se:'% daño de Tierra',sa:'% daño de Aire',pf:'Sin penalización de terreno',wood:'Madera/día',ore:'Mineral/día',gems:'Gemas/día',crystal:'Cristal/día',sulfur:'Azufre/día',mercury:'Mercurio/día'};
const ART={};
const A=(id,n,slot,v,b,set)=>{ART[id]={n,slot,v,b,set:set||null}};
// ---- armas ----
A('daga_herrumbrosa','Daga Herrumbrosa','weapon',1,{a:1});A('espada_recluta','Espada Corta del Recluta','weapon',1,{a:2});A('hacha_enana','Hacha de Guerra Enana','weapon',2,{a:3});
A('espada_acero','Espada de Acero Templado','weapon',2,{a:3,d:1});A('mandoble_runico','Mandoble Rúnico','weapon',3,{a:4,d:1});A('lanza_vientos','Lanza de los Vientos','weapon',3,{a:3,mp:200});
A('espada_llameante','Espada Llameante','weapon',3,{a:5,sf:25});A('hoz_nigromante','Hoz del Nigromante','weapon',3,{a:3,necro:10});A('martillo_titan','Martillo del Titán','weapon',4,{a:8,d:-2});
A('filo_crepusculo','Filo del Crepúsculo','weapon',4,{a:6,mor:1});A('hoja_eter','Hoja del Éter','weapon',4,{a:6,d:3,sp:2});A('espada_juicio','Espada del Juicio Final','weapon',5,{a:5,d:5,sp:5,kn:5},'angel');
A('gladio_titanico','Gladio Titánico','weapon',5,{a:12,d:-3},'titan');A('llama_dragon','Lengua de Fuego del Dragón','weapon',5,{a:2,d:2},'dragon');A('colmillo_negro','Colmillo del Caballero Muerto','weapon',4,{a:3},'damned');A('maza_ogro','Maza del Ogro Devastador','weapon',4,{a:5},'ogre');
// ---- escudos ----
A('escudo_madera','Escudo de Madera','shield',1,{d:1});A('escudo_hierro','Escudo de Hierro','shield',1,{d:2});A('escudo_enano','Escudo de los Señores Enanos','shield',2,{d:2,mor:1});A('rodela_gnoll','Rodela del Rey Gnoll','shield',2,{d:4});
A('escudo_guardian','Escudo del Guardián','shield',2,{d:3,res:5});A('egida_naval','Égida Naval','shield',3,{d:5,mpw:300});A('escudo_maldito','Escudo de los Malditos','shield',3,{d:6,a:-1});
A('escudo_dragon','Escudo de Escamas de Dragón','shield',5,{a:3,d:3},'dragon');A('escudo_centinela','Escudo del Centinela','shield',5,{d:12,a:-3},'titan');A('escudo_leon','Escudo del León Valeroso','shield',5,{a:4,d:4,sp:4,kn:4},'angel');
A('escudo_muertos','Escudo del Muerto Viviente','shield',4,{d:3},'damned');A('adarga_ogro','Adarga del Ogro Enfurecido','shield',4,{d:5},'ogre');
// ---- yelmos ----
A('gorro_aprendiz','Gorro de Aprendiz','helm',1,{kn:1});A('yelmo_hierro','Yelmo de Hierro','helm',1,{d:1,kn:1});A('yelmo_alabastro','Yelmo del Unicornio de Alabastro','helm',2,{kn:2});A('yelmo_caos','Yelmo del Caos','helm',2,{kn:3});
A('yelmo_infernal','Yelmo Tormenta Infernal','helm',3,{kn:5});A('corona_mares','Corona de los Cinco Mares','helm',3,{kn:6,mpw:300});A('sombrero_capitan','Sombrero del Capitán de Mar','helm',4,{mpw:500},'admiral');
A('casco_calavera','Casco de Calavera','helm',4,{kn:2},'damned');A('corona_magos','Corona de los Magos Supremos','helm',4,{kn:4},'ogre');A('corona_dragon','Corona de Diente de Dragón','helm',5,{sp:4,kn:4},'dragon');
A('yelmo_trueno','Yelmo del Trueno','helm',5,{sp:-2,kn:10},'titan');A('yelmo_iluminacion','Yelmo de la Iluminación Celestial','helm',5,{a:6,d:6,sp:6,kn:6},'angel');A('sombrero_hechizos','Sombrero del Hechicero','helm',3,{sp:3,kn:3,vis:1});
// ---- armaduras ----
A('peto_madera','Peto de Madera Petrificada','armor',1,{sp:1});A('cota_malla','Cota de Malla','armor',1,{d:2});A('coraza_reforzada','Coraza Reforzada','armor',2,{d:3});A('escamas_basilisco','Escamas del Gran Basilisco','armor',2,{sp:3});
A('peto_azufre','Peto de Azufre','armor',3,{sp:5});A('armadura_nix','Armadura Real de Nix','armor',3,{sp:6});A('placa_luz','Placa de la Luz Moribunda','armor',3,{d:4,sp:2});
A('armadura_maravilla','Armadura de lo Maravilloso','armor',5,{a:1,d:1,sp:1,kn:1},'angel');A('coraza_dragon','Coraza de Escamas de Dragón','armor',5,{a:4,d:4},'dragon');A('coraza_titan','Coraza del Titán','armor',5,{sp:10,kn:-2},'titan');
A('caja_toracica','Caja Torácica','armor',4,{sp:2},'damned');A('tunica_ciclope','Túnica del Rey Cíclope','armor',4,{sp:4},'ogre');
// ---- amuletos ----
A('amuleto_vigor','Amuleto de Vigor','neck',1,{kn:1,sp:1});A('amuleto_sol','Amuleto Solar','neck',2,{sp:2,kn:2});A('collar_velocidad','Collar de Velocidad','neck',3,{spd:1});A('colgante_valor','Colgante de Valor','neck',4,{luck:3,mor:3});
A('colgante_reflejo','Colgante del Reflejo','neck',4,{res:15},'reflect');A('guarnicion_antimagia','Guarnición Antimagia','neck',3,{res:5},'reflect');A('colgante_estadista','Medalla del Estadista','neck',3,{dip:10},'diplomat');
A('collar_dragon','Collar de Dientes de Dragón','neck',5,{sp:3,kn:3},'dragon');A('collar_celestial','Collar Celestial de la Dicha','neck',5,{a:3,d:3,sp:3,kn:3},'angel');A('amuleto_enterrador','Amuleto del Enterrador','neck',3,{necro:5},'undead');
A('colgante_vida','Colgante de Vida','neck',3,{kn:1},'undead');A('collar_guia','Collar de Guía Oceánica','neck',4,{mpw:1000},'admiral');A('colgante_sabio','Colgante del Sabio','neck',2,{kn:2});
// ---- capas ----
A('capa_viajero','Capa de Viajero','cloak',1,{mp:150});A('capa_elfica','Capa Élfica','cloak',1,{luck:1});A('tabardo_dragon','Tabardo de Ala de Dragón','cloak',5,{sp:2,kn:2},'dragon');A('capa_sombra','Capa de Sombras','cloak',2,{d:2,vis:1});
A('capucha_vampiro','Capucha del Vampiro','cloak',3,{necro:5},'undead');A('sobretodo_equilibrio','Sobretodo del Equilibrio','cloak',3,{res:10},'reflect');A('faja_embajador','Faja del Embajador','cloak',3,{dip:10},'diplomat');
A('capa_cristal','Capa de Cristal Eterno','cloak',3,{crystal:1},'cornu');A('capa_velocidad','Capa de Velocidad','cloak',3,{spd:2});A('alas_angel','Alas de Ángel','cloak',4,{mp:600});A('manto_archimago','Manto del Archimago','cloak',4,{sp:3,mana:2});A('capa_reflectante','Capa Reflectante','cloak',3,{res:20});
// ---- botas ----
A('botas_cuero','Botas de Cuero','boots',1,{mp:100});A('botas_viento','Botas del Viento','boots',2,{mp:300});A('botas_velocidad','Botas de Velocidad','boots',3,{mp:500});A('botas_caminante','Botas del Caminante','boots',3,{pf:1});
A('botas_levitacion','Botas de Levitación','boots',4,{mpw:700});A('botas_muerto','Botas del Hombre Muerto','boots',3,{necro:7},'undead');A('botas_polaridad','Botas de Polaridad','boots',3,{res:15},'reflect');A('grebas_dragon','Grebas de Hueso de Dragón','boots',5,{sp:1,kn:1},'dragon');
A('sandalias_santo','Sandalias del Santo','boots',5,{a:2,d:2,sp:2,kn:2},'angel');A('botas_pesadas','Botas Pesadas de Hierro','boots',2,{d:2,mp:-100});
// ---- guantes ----
A('guantes_cuero','Guantes de Cuero','gloves',1,{a:1});A('guantes_fuerza','Guantes de Fuerza','gloves',2,{a:2});A('guantes_jinete','Guantes del Jinete','gloves',2,{mp:200});A('manoplas_hierro','Manoplas de Hierro','gloves',2,{d:2});
A('guantes_arquero','Guantes del Arquero','gloves',2,{a:1,mp:150});A('guanteletes_poder','Guanteletes de Poder','gloves',3,{a:3,d:1});A('guantes_arcanos','Guantes Arcanos','gloves',3,{sp:2});A('guantes_sabio','Guantes del Sabio','gloves',3,{kn:2,sp:1});A('manopla_titan','Manopla del Titán','gloves',4,{a:4,d:4});
// ---- anillos ----
A('anillo_vitalidad','Anillo de Vitalidad','ring',3,{hp:1});A('anillo_vida','Anillo de Vida','ring',3,{hp:1},'elixir');A('anillo_caminante','Anillo del Caminante','ring',3,{spd:1});A('ojo_quieto','Ojo Quieto del Dragón','ring',5,{a:1,d:1},'dragon');
A('ojo_sereno','Ojo Sereno del Dragón','ring',5,{luck:1,mor:1},'dragon');A('anillo_gemas','Anillo de Gemas Infinitas','ring',3,{gems:1},'cornu');A('anillo_azufre','Anillo de Azufre Eterno','ring',3,{sulfur:1},'cornu');
A('anillo_fuerza','Anillo de Fuerza','ring',1,{a:1,d:1});A('sello_ocaso','Sello del Ocaso','ring',2,{sp:1});A('anillo_diplomatico','Anillo Diplomático','ring',3,{dip:10},'diplomat');A('anillo_mana','Anillo de Maná','ring',2,{mana:1});
A('anillo_estudioso','Anillo del Estudioso','ring',2,{xp:5});A('sello_oro','Sello de Oro','ring',2,{gold:200});A('anillo_magi','Anillo del Mago','ring',3,{sp:1,kn:1});A('anillo_suerte','Anillo de la Suerte','ring',2,{luck:1});A('anillo_mercurio','Anillo de Mercurio','ring',3,{mercury:1});
// ---- objetos ----
A('trebol','Trébol de la Fortuna','misc',2,{luck:1});A('glifo_gallardia','Glifo de Gallardía','misc',2,{mor:1});A('cuerno_abundancia','Cuerno de la Abundancia','misc',3,{gold:300,wood:1,ore:1});A('ojo_dragon','Ojo del Dragón','misc',3,{luck:1,mor:1});
A('estandarte_guerra','Estandarte de Guerra','misc',3,{mor:2});A('herradura_demonio','Herradura del Demonio','misc',2,{luck:1});A('pajaro_percepcion','Pájaro de la Percepción','misc',2,{eagle:5});A('vigia_estoico','Vigía Estoico','misc',3,{eagle:10});
A('speculum','Speculum','misc',2,{vis:1});A('catalejo_vidente','Catalejo del Vidente','misc',3,{vis:2});A('orbe_fuego','Orbe de Fuego Tempestuoso','misc',3,{sf:50});A('orbe_agua','Orbe de Lluvia Torrencial','misc',3,{sw:50});
A('orbe_aire','Orbe del Firmamento','misc',3,{sa:50});A('orbe_tierra','Orbe de Sedimento','misc',3,{se:50});A('encanto_mana','Encanto de Maná','misc',2,{mana:1},'wizard');A('talisman_mana','Talismán de Maná','misc',3,{mana:2},'wizard');
A('orbe_mana','Orbe Místico de Maná','misc',4,{mana:3},'wizard');A('bolsa_oro','Bolsa Sin Fondo','misc',2,{gold:250});A('libro_arcano','Libro Arcano','misc',3,{kn:3});A('cetro_sabio','Cetro del Sabio','misc',3,{sp:3});
A('tomo_conocimientos','Tomo de Conocimientos','misc',3,{xp:10});A('colgante_craneo','Colgante de Cráneo','misc',3,{necro:10});A('baston_nigromante','Bastón del Nigromante','misc',4,{necro:15});A('cuerno_guerra','Cuerno de Guerra','misc',3,{mor:1,a:1});
A('piedra_afilar','Piedra de Afilar','misc',1,{a:2});A('pergamino_proteccion','Pergamino de Protección','misc',2,{res:10});A('catalizador','Catalizador Arcano','misc',3,{sp:1,kn:1,mana:1});A('campana_navegante','Campana del Navegante','misc',3,{mpw:400});
A('cristal_vision','Cristal de Visión','misc',4,{vis:3,kn:1});A('moneda_tesoro','Moneda del Tesoro Real','misc',4,{gold:500});A('piel_dragon','Piel de Dragón Menor','misc',3,{d:2,res:10});A('grimorio_prohibido','Grimorio Prohibido','misc',4,{sp:4,kn:-1});
const ART_IDS=Object.keys(ART);
// ---- conjuntos: bonificación al llevar todas las piezas ----
const ARTSET={
 titan:{n:'Trueno del Titán',b:{a:9,d:9,sp:8,kn:8}},dragon:{n:'Poder del Padre Dragón',b:{a:8,d:8,sp:8,kn:8,luck:1,mor:1}},angel:{n:'Alianza Angélica',b:{a:12,d:12,sp:12,kn:12}},
 damned:{n:'Armadura de los Condenados',b:{a:3,d:3,sp:2,kn:2}},ogre:{n:'Puño de Hierro del Ogro',b:{a:5,d:5,sp:4,kn:4}},admiral:{n:'Sombrero del Almirante',b:{mpw:1500}},
 undead:{n:'Manto del Rey No-muerto',b:{necro:15}},reflect:{n:'Colgante del Reflejo',b:{res:50}},diplomat:{n:'Manto del Diplomático',b:{dip:30}},
 cornu:{n:'Cornucopia',b:{gems:1,crystal:1,sulfur:1,mercury:1}},wizard:{n:'Pozo del Mago',b:{mana:5}},elixir:{n:'Elixir de Vida',b:{hp:2}}};
for(const id in ART){const s=ART[id].set;if(s){(ARTSET[s].pieces=ARTSET[s].pieces||[]).push(id)}}
// ---- ayudantes de equipo ----
function newEquip(){const e={};for(const k of EQKEYS)e[k]=null;return e}
function equippedList(h){return EQKEYS.map(k=>h.eq[k]).filter(id=>id&&id.charCodeAt(0)!==35)}
function artBonus(h){
  const out={};const add=b=>{for(const k in b)out[k]=(out[k]||0)+b[k]};
  const eq=equippedList(h);for(const id of eq)add(ART[id].b);
  for(const sid in ARTSET){const S=ARTSET[sid];if(S.pieces.every(p=>eq.includes(p)))add(S.b)}
  return out;
}
function setProgress(h){const eq=equippedList(h),out=[];for(const sid in ARTSET){const S=ARTSET[sid];const n=S.pieces.filter(p=>eq.includes(p)).length;if(n)out.push({id:sid,n,tot:S.pieces.length,name:S.n})}return out}
function freeSlotFor(h,id){const keys=SLOTKEYS[ART[id].slot];return keys.find(k=>!h.eq[k])||null}
function giveArtifact(h,id){const k=freeSlotFor(h,id);if(k){h.eq[k]=id;return 'eq'}if(h.pack.length<14){h.pack.push(id);return 'pack'}return null}
function equipFromPack(h,i,key){const id=h.pack[i];if(!id)return false;const keys=SLOTKEYS[ART[id].slot];if(!keys.includes(key))return false;const old=h.eq[key];h.eq[key]=id;h.pack.splice(i,1);if(old)h.pack.push(old);return true}
function unequip(h,key){const id=h.eq[key];if(!id)return false;if(id.charCodeAt(0)===35||ART[id].fusion)return unfuse(h,id.charCodeAt(0)===35?id.slice(1):id)===null;if(h.pack.length>=14)return false;h.pack.push(id);h.eq[key]=null;return true}
function autoEquipBest(h){for(let i=h.pack.length-1;i>=0;i--){const id=h.pack[i];const keys=SLOTKEYS[ART[id].slot];const free=keys.find(k=>!h.eq[k]);if(free){h.eq[free]=id;h.pack.splice(i,1)}else{
  // reemplazar si el nuevo es de mayor nivel
  const worst=keys.map(k=>[k,h.eq[k].charCodeAt(0)===35||ART[h.eq[k]].fusion?99:ART[h.eq[k]].v]).sort((a,b)=>a[1]-b[1])[0];if(ART[id].v>worst[1]){const old=h.eq[worst[0]];h.eq[worst[0]]=id;h.pack.splice(i,1);h.pack.push(old)}}}}
function artText(id){const a=ART[id];const l=Object.keys(a.b).map(k=>`${BNAMES[k]||k} ${a.b[k]>0&&k!=='pf'?'+':''}${k==='pf'?'':a.b[k]}`);return l.join(' · ')}
