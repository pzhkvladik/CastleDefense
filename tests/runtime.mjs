import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';

// Exercise real production scripts, with only the browser surface stubbed.
export async function runtime(root){
  let seed=12345,randomCalls=0,depth=0,drawCalls=0;
  const math=Object.create(Math);
  math.random=()=>{randomCalls++;seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  const gradient={addColorStop(){}};
  const canvasContext=new Proxy({
    globalAlpha:1,
    save(){depth++;},restore(){assert.ok(depth>0,'Unbalanced canvas restore');depth--;},
    createLinearGradient(){return gradient;},createRadialGradient(){return gradient;},
    measureText(text){return {width:String(text).length*7};},
  },{get(target,key){
    if(key in target)return target[key];
    return (...args)=>{drawCalls++;for(const a of args)if(typeof a==='number')assert.ok(Number.isFinite(a),`Non-finite ${key}(${args})`);};
  }});
  const element=()=>({classList:{add(){},remove(){},toggle(){}},style:{},dataset:{},
    innerHTML:'',textContent:'',disabled:false,appendChild(){},setAttribute(){},
    getBoundingClientRect:()=>({width:1280,height:568}),getContext:()=>canvasContext});
  const context=vm.createContext({console,Math:math,document:{getElementById:element,querySelectorAll:()=>[],createElement:element},
    window:{devicePixelRatio:1},addEventListener(){},requestAnimationFrame(){},setTimeout(){},clearTimeout(){}});
  const html=await readFile(path.join(root,'index.html'),'utf8');
  for(const match of html.matchAll(/<script src="([^"]+)"/g))
    vm.runInContext(await readFile(path.join(root,match[1]),'utf8'),context,{filename:match[1]});
  return {context,run:code=>vm.runInContext(code,context),stats:()=>({randomCalls,depth,drawCalls})};
}

export const battleSetup=`
  newGame();game.gold=99999;game.archers=3;game.archerLevel=3;buyArcherCommander();
  game.castleLevel=2;game.gateMax=30000;game.gateHp=30000;game.towerMax=30000;game.towerHp=30000;
  game.ballista=3;game.catapult=2;game.river=true;game.riverLevel=2;
  game.mage=true;game.mageLevel=2;game.mageCooldown=.6;game.lava=true;game.lavaLevel=2;
  game.spawnTimer=999;game.waveTotal=999;game.event='normal';
  game.knightLevel=2;deployKnights();
  for(const [i,type] of ['normal','armored','runner','brute','archer','builder','catapult','flyer','shaman','dragon'].entries()){
    spawnEnemy(type);const e=enemies.at(-1);e.x=gateX()+190+i*80;e.hp=e.maxHp=500;
  }
`;
