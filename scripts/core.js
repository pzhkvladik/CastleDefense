
const canvas=document.getElementById('game');
const ctx=canvas.getContext('2d');

let W=1280,H=720,DPR=1,last=0,time=0,gameSpeed=1;
function resize(){
  const r=canvas.getBoundingClientRect();
  DPR=Math.min(window.devicePixelRatio||1,2);
  canvas.width=Math.floor(r.width*DPR);
  canvas.height=Math.floor(r.height*DPR);
  W=r.width;H=r.height;
  ctx.setTransform(DPR,0,0,DPR,0,0);
}
addEventListener('resize',resize);
resize();

const rand=(a,b)=>a+Math.random()*(b-a);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,t)=>a+(b-a)*t;
const TAU=Math.PI*2;

// Stable pseudo-random value for scenery.
// Important: unlike Math.random(), this returns the same value every frame,
// so mountains/trees/textures never jitter.
function hash01(n){
  const x=Math.sin(n*127.1+311.7)*43758.5453123;
  return x-Math.floor(x);
}

function rr(x,y,w,h,r){
  ctx.beginPath();
  ctx.roundRect(x,y,w,h,r);
}

let game;
const enemies=[],arrows=[],enemyArrows=[],stones=[],particles=[],texts=[],clouds=[],lightnings=[],alligators=[],birds=[],knights=[];
let archerTimers=[0,0,0];

function groundY(){return H*.80}
function castleX(){return Math.max(150,W*.16)}
function gateX(){return castleX()+92}
function spawnX(){return W+80}

function riverBounds(){
  const left=W*.52;
  const width=W*.16;
  return {left,right:left+width,width,center:left+width/2};
}
function bridgePoint(){
  const b=riverBounds();
  return {x:b.center,y:groundY()-5};
}

const SEASONS=[
  {
    id:'spring',name:'Весна',icon:'🍃',
    goblinSkin:'#789f49',goblinDark:'#638238',cloth:'#4b3a2e',
    hill:'#668377',hill2:'#405b48',ground1:'#667949',ground2:'#34412e',
    skyTop:'#355f82',skyMid:'#628da8',skyLow:'#9eb7aa',skyBottom:'#c9bc88',
    treeA:'#35553d',treeB:'#2e4a38',
    bossName:'Mossback King',bossColor:'#6f923f',bossAccent:'#6f5131',
    hpMul:1.00,speedMul:1.00,damageMul:1.00
  },
  {
    id:'summer',name:'Літо',icon:'☀️',
    goblinSkin:'#789341',goblinDark:'#5f7432',cloth:'#633e27',
    hill:'#76866b',hill2:'#4d6240',ground1:'#7b8144',ground2:'#44472d',
    skyTop:'#376f9d',skyMid:'#6fa7bf',skyLow:'#b9cab0',skyBottom:'#d6bd72',
    treeA:'#365936',treeB:'#29452f',
    bossName:'Ash Warlord',bossColor:'#71873d',bossAccent:'#9b482d',
    hpMul:1.08,speedMul:1.06,damageMul:1.06
  },
  {
    id:'autumn',name:'Осінь',icon:'🍂',
    goblinSkin:'#7f9144',goblinDark:'#656f35',cloth:'#5b382b',
    hill:'#806f61',hill2:'#54483d',ground1:'#79633e',ground2:'#413528',
    skyTop:'#506b7d',skyMid:'#8b8c8a',skyLow:'#b8a27f',skyBottom:'#c79055',
    treeA:'#704b32',treeB:'#8a5a35',
    bossName:'Rotfang Chieftain',bossColor:'#7b8540',bossAccent:'#6e3445',
    hpMul:1.17,speedMul:1.03,damageMul:1.12
  },
  {
    id:'winter',name:'Зима',icon:'❄️',
    goblinSkin:'#719089',goblinDark:'#5c7470',cloth:'#35404c',
    hill:'#637987',hill2:'#475a67',ground1:'#c6d1cf',ground2:'#8d9c9d',
    skyTop:'#536d88',skyMid:'#7f98aa',skyLow:'#b9c8d1',skyBottom:'#d8dedb',
    treeA:'#41515a',treeB:'#33424a',
    bossName:'Frostfang Tyrant',bossColor:'#6d8f8c',bossAccent:'#3f6282',
    hpMul:1.28,speedMul:.96,damageMul:1.18
  }
];

function seasonIndexForWave(w){
  return Math.floor((w-1)/4)%4;
}
function currentSeason(){
  return SEASONS[seasonIndexForWave(game.wave)];
}
function seasonCycleNumber(w){
  return Math.floor((w-1)/16);
}

function archerSlot(i){
  const x=castleX(),gy=groundY();
  // All archers stand on the main wall. Mage owns the left tower.
  const slots=game&&game.archerCommander
    ?[
      {x:x-72,feetY:gy-248,flip:false},
      {x:x-24,feetY:gy-248,flip:false},
      {x:x+72,feetY:gy-248,flip:false}
    ]
    :[
      {x:x-70,feetY:gy-248,flip:false},
      {x:x-8, feetY:gy-248,flip:false},
      {x:x+53,feetY:gy-248,flip:false}
    ];
  return slots[i]||slots[0];
}

// ---------------- GAME ----------------
