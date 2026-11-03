'use strict';
// =====================================================================
//  Segunda tanda de artefactos (+100), linajes de 4 piezas y FUSIONES
//  Arma + Escudo + Yelmo + Anillo del mismo linaje se funden en una
//  reliquia que ocupa (bloquea) esas 4 ranuras pero da un poder enorme.
// =====================================================================
(function(){
  let n=0;const add=(slot,list)=>{for(const[name,v,b]of list)A('x'+(n++),name,slot,v,b)};
  add('weapon',[['Estoque del Duelista',2,{a:3,luck:1}],['Alabarda del Centinela',2,{a:2,d:2}],['Cimitarra del Desierto',2,{a:3,mp:150}],['Maza Sagrada',3,{a:3,sp:2}],['Lanza del Jinete Alado',3,{a:4,mp:300}],['Espada del Alba',3,{a:4,mor:1}],['Hacha del Berserker',3,{a:6,d:-2}],['Báculo del Archimago',3,{sp:4,kn:1}],['Hoja del Vacío',4,{a:5,sp:3}],['Martillo del Forjador de Mundos',4,{a:7,d:1}],['Tridente del Rey del Mar',4,{a:4,mpw:600}],['Arco Compuesto del Rey Elfo',3,{a:3,luck:1}]]);
  add('shield',[['Broquel de Cobre',1,{d:1,res:3}],['Escudo Torre',2,{d:4,mp:-100}],['Escudo Espejo',3,{d:3,res:15}],['Pavés del Cruzado',3,{d:4,mor:1}],['Escudo de la Aurora',3,{d:3,sp:2}],['Rodela de Hueso',2,{d:3,necro:3}],['Muro Viviente',4,{d:7}],['Escudo del Vigía Eterno',4,{d:5,vis:2}],['Égida del Mago de Guerra',4,{d:3,sp:3,kn:2}]]);
  add('helm',[['Yelmo del Explorador',2,{vis:2}],['Casco Alado',2,{kn:2,mp:150}],['Capucha del Sabio',2,{kn:2,sp:1}],['Diadema de Plata',3,{kn:4}],['Corona de Espinas',3,{sp:3,d:1}],['Yelmo Cornudo del Guerrero',3,{a:2,d:2}],['Tiara de la Reina Hada',4,{kn:5,mana:1}],['Gorro del Viajero Eterno',3,{mp:400}],['Máscara del Oráculo',4,{sp:4,luck:1}]]);
  add('armor',[['Jubón Acolchado',1,{d:1,sp:1}],['Cota de Escamas',2,{d:3}],['Armadura de Mithril',3,{d:5}],['Coraza de Obsidiana',3,{d:3,res:10}],['Túnica de Seda Arcana',3,{sp:4}],['Brigantina de Cazador',2,{a:1,d:2}],['Peto de Cristal Viviente',4,{d:4,sp:3}],['Armadura de Placas del Campeón',4,{a:2,d:6}],['Hábito del Ermitaño',2,{kn:2,sp:1}]]);
  add('neck',[['Amuleto del Zorro',2,{luck:1,mp:100}],['Medallón del León',3,{a:2,mor:1}],['Gargantilla de Perlas',2,{kn:2}],['Talismán de Hierro Estelar',3,{d:3}],['Colgante del Vidente',3,{vis:2,kn:1}],['Amuleto de la Fortuna',3,{luck:2}],['Cadena del Rey Mercader',3,{gold:300}],['Joya del Corazón Ardiente',4,{sp:3,a:2}]]);
  add('cloak',[['Capa del Explorador',2,{mp:250,vis:1}],['Manto de Pieles',1,{d:1,mp:100}],['Capa Tormentosa',3,{sa:30,sp:2}],['Mantón de Escarcha',3,{sw:30,d:2}],['Capa Carmesí del Campeón',3,{a:2,mor:1}],['Manto de las Mareas',3,{mpw:500}],['Capa del Silencio',4,{res:25,d:2}]]);
  add('boots',[['Sandalias de Mercurio',3,{mp:400}],['Botas de Siete Leguas',4,{mp:700}],['Botines del Ladrón',2,{luck:1,mp:150}],['Botas de Cazador de Dragones',3,{a:2,mp:200}],['Calzado de Agua Caminante',3,{mpw:500,mp:100}],['Zuecos de Piedra',2,{d:3,pf:1}]]);
  add('gloves',[['Manoplas del Herrero',2,{a:1,d:1}],['Guantes de Seda',1,{sp:1}],['Guantes de Hielo',3,{sw:30,sp:2}],['Mitones del Cazador',2,{vis:1,a:1}],['Guanteletes del Verdugo',4,{a:5}],['Guantes del Hechicero Real',4,{sp:3,kn:2}]]);
  add('ring',[['Anillo de Rubí',2,{sf:25}],['Anillo de Zafiro',2,{sw:25}],['Anillo de Esmeralda',2,{se:25}],['Anillo de Topacio',2,{sa:25}],['Anillo del Conquistador',3,{a:2}],['Anillo de la Guardia',3,{d:2}],['Anillo de Sabiduría',3,{kn:2}],['Anillo del Hechicero',3,{sp:2}],['Anillo Resplandeciente',3,{mor:1,luck:1}],['Anillo de Orbes',4,{mana:2,sp:1}],['Anillo del Peregrino',2,{mp:200}],['Sello Real',3,{gold:350}]]);
  add('misc',[['Cuerno de Plata',2,{mor:1}],['Pata de Conejo',2,{luck:1}],['Mapa del Tesoro',2,{vis:1}],['Brújula Mágica',2,{mp:200}],['Reloj de Arena',3,{mp:350}],['Lente del Cartógrafo',3,{vis:2}],['Poción de Vitalidad',2,{hp:1}],['Cáliz Sagrado',3,{mor:1,res:10}],['Campanilla de Cristal',3,{sp:2}],['Libro de Estrategia',3,{a:2,d:1}],['Manual de Defensa',3,{d:3}],['Tratado del Conocimiento',3,{kn:3}],['Rueca de Oro',3,{gold:400}],['Cofre de Gemas Menor',2,{gems:1}],['Brasero de Azufre',2,{sulfur:1}],['Matraz de Mercurio',2,{mercury:1}],['Prisma de Cristal',2,{crystal:1}],['Aserradero Portátil',2,{wood:2}],['Pico Encantado',2,{ore:2}],['Estandarte del Almirante',3,{mpw:600,mor:1}],['Saco del Diplomático',3,{dip:15}],['Reliquia del Mártir',4,{a:2,d:2,sp:2,kn:2}],['Hueso de Dragón Antiguo',4,{necro:12,a:2}],['Cuerno del Cazador Salvaje',3,{a:1,mp:200,mor:1}],['Orbe del Tiempo',4,{mp:600,mana:1}]]);
})();

// ---- linajes: [id, nombre, stat A, stat B, rasgo, valor, matiz] ----
const LIN={};
const FUSKEYS=['weapon','shield','helm','ring1'];
(function(){
  const L=[['dragon_ig','del Dragón Ígneo','a','sp','sf',40,8],['titan_tor','del Titán de la Tormenta','sp','kn','sa',40,210],['fenix','del Fénix Renacido','sp','d','mana',2,35],
    ['kraken','del Kraken Abisal','d','kn','mpw',600,190],['hidra','de la Hidra Sombría','a','d','hp',1,120],['liche','del Liche Eterno','sp','kn','necro',15,280],
    ['minotauro','del Rey Minotauro','a','d','mor',1,20],['grifo','del Grifo Real','a','kn','mp',400,50],['golem','del Gólem Rúnico','d','sp','res',15,225],
    ['djinn','del Djinn Supremo','kn','sp','luck',1,170],['serafin','del Serafín Alado','a','d','xp',10,58],['behemot','del Behemot Ancestral','a','d','spd',1,355]];
  for(const[id,nm,Ak,Bk,Sk,Sv,hue]of L){
    const w='lw_'+id,s='ls_'+id,hm='lh_'+id,r='lr_'+id,f='fus_'+id;
    const add=(pid,name,slot,b)=>{A(pid,name,slot,4,b);ART[pid].lin=id;ART[pid].hue=hue};
    add(w,'Colmillo '+nm,'weapon',{[Ak]:4});add(s,'Égida '+nm,'shield',{[Bk]:4});add(hm,'Cresta '+nm,'helm',{[Ak]:2,[Bk]:2});add(r,'Sello '+nm,'ring',{[Sk]:Sv});
    const fb={};fb[Ak]=(fb[Ak]||0)+14;fb[Bk]=(fb[Bk]||0)+12;fb[Sk]=(fb[Sk]||0)+(Sv<=2?Sv*2:Math.round(Sv*2.5));fb.mor=(fb.mor||0)+1;fb.luck=(fb.luck||0)+1;
    A(f,'Reliquia '+nm,'fusion',6,fb);ART[f].fusion=id;ART[f].hue=hue;
    LIN[id]={id,name:'Reliquia '+nm,short:nm.replace(/^(del|de la|de) /,''),pieces:[w,r?s:s,hm,r],keys:FUSKEYS,fus:f};
    LIN[id].pieces=[w,s,hm,r];
  }
})();
const ART_IDS2=Object.keys(ART);
for(const k of ART_IDS2)if(ART_IDS.indexOf(k)<0)ART_IDS.push(k);
// el mapa solo reparte tesoros comunes; los linajes se colocan aparte, las fusiones jamás
const ART_WORLD=()=>ART_IDS.filter(a=>!ART[a].lin&&!ART[a].fusion);

const hasPiece=(h,id)=>EQKEYS.some(k=>h.eq[k]===id)||h.pack.includes(id);
const linCount=(h,lid)=>LIN[lid].pieces.filter(p=>hasPiece(h,p)).length;
const canFuse=(h,lid)=>linCount(h,lid)===4;
function fusedOf(h){const out=[];for(const k of EQKEYS){const id=h.eq[k];if(id&&id.charCodeAt(0)!==35&&ART[id].fusion)out.push(ART[id].fusion)}return out}
// devuelve null si va bien o un mensaje de error
function fuseLineage(h,lid){
  const L=LIN[lid];if(!canFuse(h,lid))return'Faltan piezas del linaje';
  if(fusedOf(h).length&&EQKEYS.some(k=>{const id=h.eq[k];return id&&(id.charCodeAt(0)===35||ART[id].fusion)&&L.keys.includes(k)}))return'Ya hay una fusión en esas ranuras';
  const inPack=L.pieces.filter(p=>h.pack.includes(p)).length;let need=0;
  for(const k of L.keys){const id=h.eq[k];if(id&&!L.pieces.includes(id))need++}
  if(h.pack.length-inPack+need>14)return'La mochila está llena';
  for(const p of L.pieces){const k=EQKEYS.find(q=>h.eq[q]===p);if(k)h.eq[k]=null;else h.pack.splice(h.pack.indexOf(p),1)}
  for(const k of L.keys){const id=h.eq[k];if(id){h.pack.push(id);h.eq[k]=null}}
  h.eq[L.keys[0]]=L.fus;for(let i=1;i<L.keys.length;i++)h.eq[L.keys[i]]='#'+L.fus;
  return null;
}
function unfuse(h,fid){
  const L=LIN[ART[fid].fusion];if(h.pack.length+4>14)return'La mochila está llena (necesitas 4 huecos)';
  for(const k of EQKEYS){if(h.eq[k]===fid||h.eq[k]==='#'+fid)h.eq[k]=null}
  for(const p of L.pieces)h.pack.push(p);autoEquipBest(h);return null;
}
const fusionInfo=h=>Object.keys(LIN).map(l=>({id:l,n:linCount(h,l),L:LIN[l]})).filter(q=>q.n>0||fusedOf(h).includes(q.id));
function aiFuse(h){for(const l in LIN)if(canFuse(h,l)&&!fusedOf(h).includes(l)){if(fuseLineage(h,l)===null)return true}return false}
