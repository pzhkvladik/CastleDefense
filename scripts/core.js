
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
const enemies=[],arrows=[],enemyArrows=[],stones=[],particles=[],texts=[],clouds=[],lightnings=[],alligators=[],birds=[],knights=[],cavalry=[];
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

// Chapter themes replace the old four-season cycle.
// The legacy SEASONS name is kept as an alias so existing rendering/combat
// helpers can use the same palette interface without running a second theme system.
const CHAPTER_THEMES=[
  {
    id:'greenlands',name:'Greenlands',icon:'🌿',chapter:'Chapter I — Greenlands',
    goblinSkin:'#789f49',goblinDark:'#587638',cloth:'#594630',
    hill:'#78958a',hill2:'#55705c',ground1:'#6f864f',ground2:'#3d4f35',
    skyTop:'#7ea3ad',skyMid:'#9bb3af',skyLow:'#bdc7aa',skyBottom:'#c9b886',
    treeA:'#355b3c',treeB:'#294a34',
    bossName:'Mossback Titan',bossColor:'#668c45',bossAccent:'#76532d',
    hpMul:1.00,speedMul:1.00,damageMul:1.00
  },
  {
    id:'winter',name:'Winter',icon:'❄️',chapter:'Chapter II — Winter',
    goblinSkin:'#7c9c98',goblinDark:'#526f75',cloth:'#3f5365',
    hill:'#718591',hill2:'#4e606b',ground1:'#c9d8db',ground2:'#899ba1',
    skyTop:'#687f92',skyMid:'#92a7b3',skyLow:'#c3d0d5',skyBottom:'#dce3e2',
    treeA:'#455862',treeB:'#334650',
    bossName:'Frostfang Tyrant',bossColor:'#729a9b',bossAccent:'#4d718b',
    hpMul:1.10,speedMul:.97,damageMul:1.07
  },
  {
    id:'darkForest',name:'Dark Forest',icon:'🌲',chapter:'Chapter III — Dark Forest',
    goblinSkin:'#597552',goblinDark:'#354b3d',cloth:'#343b35',
    hill:'#40594e',hill2:'#273a31',ground1:'#344b39',ground2:'#1f2e26',
    skyTop:'#334b4a',skyMid:'#4f6460',skyLow:'#68766a',skyBottom:'#6f735e',
    treeA:'#21372c',treeB:'#182b24',
    bossName:'Shadowroot Lord',bossColor:'#506b4b',bossAccent:'#674563',
    hpMul:1.18,speedMul:1.04,damageMul:1.13
  },
  {
    id:'volcanic',name:'Volcanic',icon:'🌋',chapter:'Chapter IV — Volcanic',
    goblinSkin:'#8b6840',goblinDark:'#583f2f',cloth:'#65392f',
    hill:'#58423e',hill2:'#342c2c',ground1:'#423331',ground2:'#251f20',
    skyTop:'#5e4b4a',skyMid:'#866b5f',skyLow:'#aa765d',skyBottom:'#c17a48',
    treeA:'#3a2e2b',treeB:'#2a2323',
    bossName:'Lava Golem',bossColor:'#70513d',bossAccent:'#d86531',
    hpMul:1.28,speedMul:.94,damageMul:1.20
  },
  {
    id:'demonic',name:'Demonic',icon:'😈',chapter:'Chapter V — Demonic',
    goblinSkin:'#7a506f',goblinDark:'#4e304f',cloth:'#4c2949',
    hill:'#4b3048',hill2:'#2b1b2d',ground1:'#352237',ground2:'#1d141f',
    skyTop:'#35243f',skyMid:'#58324f',skyLow:'#7d3b55',skyBottom:'#87363f',
    treeA:'#2c1d2d',treeB:'#201421',
    bossName:'Demon Archfiend',bossColor:'#6b3d62',bossAccent:'#d13d6e',
    hpMul:1.40,speedMul:1.03,damageMul:1.30
  }
];
const SEASONS=CHAPTER_THEMES;

function seasonIndexForWave(w){
  return clamp(Math.floor((Math.max(1,w)-1)/10),0,CHAPTER_THEMES.length-1);
}
function currentSeason(){
  return CHAPTER_THEMES[seasonIndexForWave(game.wave)];
}
function seasonCycleNumber(){
  return 0;
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
