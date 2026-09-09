import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {runtime,battleSetup} from './runtime.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
const r=await runtime(root);
r.run(battleSetup+'resetVisuals();');
const before=r.run('JSON.stringify({game,enemies,knights,archerTimers})');
const randomBefore=r.stats().randomCalls;
r.run("emitVisual('spark',600,300,999);updateVisuals(.016);draw();");
assert.equal(r.run('JSON.stringify({game,enemies,knights,archerTimers})'),before);
assert.equal(r.stats().randomCalls,randomBefore);
assert.equal(r.run('visual.particles.length'),220);
assert.equal(r.stats().depth,0);
console.log('PASS  Visual updates/rendering preserve combat state and RNG; particle cap is 220');

r.run('resetVisuals();game.wave=13;updateVisuals(.016);');
assert.ok(r.run('visual.weights[3]>0&&visual.weights[3]<.1'));
assert.equal(r.run('currentSeason().id'),'winter');
r.run('for(let i=0;i<900;i++)updateVisuals(.016);');
assert.ok(r.run('visual.weights[3]>.999'));
assert.ok(Math.abs(r.run('visual.weights.reduce((a,b)=>a+b,0)')-1)<1e-10);
console.log('PASS  Seasonal visuals blend smoothly while combat season changes immediately');

r.run('resetVisuals();enemies.length=0;game.bridge.active=false;fireArrow(0);fireBallista();fireDefenderCatapult();');
assert.equal(r.run('visual.archers[0]'),-99);
assert.equal(r.run('visual.ballista'),-99);
assert.equal(r.run('visual.catapult'),-99);
r.run("spawnEnemy('normal');enemies[0].x=650;fireArrow(0);fireBallista();fireDefenderCatapult();");
assert.equal(r.run('shotRecoil("archer",.18,0)'),1);
assert.equal(r.run('shotRecoil("ballista")'),1);
assert.equal(r.run('shotRecoil("catapult")'),1);
r.run('for(let i=0;i<60;i++)updateVisuals(.016);');
assert.equal(r.run('shotRecoil("archer",.18,0)'),0);
const target=r.run('stoneDrawPosition({...stones[0],t:1})');
assert.equal(target.x,r.run('stones[0].tx'));
assert.equal(target.y,r.run('stones[0].ty'));
console.log('PASS  Recoil only triggers on actual shots; catapult visual lands at real impact point');

r.run(battleSetup+'resetVisuals();');
for(const speed of [1,2,4,12]){
  r.run(`gameSpeed=${speed};`);
  for(let i=0;i<240;i++){
    r.run('updateVisuals(1/60);update(gameSpeed/60);draw();');
    assert.equal(r.stats().depth,0);
    assert.ok(r.run('visual.particles.length<=VISUAL_LIMIT'));
  }
}
console.log('PASS  Mixed battle draws finite coordinates at x1/x2/x4/x12 without canvas stack leaks');

r.run(battleSetup+'resetVisuals();');
for(const [w,h] of [[800,430],[1440,800],[1280,568]]){
  r.run(`W=${w};H=${h};update(.016);updateVisuals(.016);draw();`);
  assert.ok(r.run('enemies.filter(e=>!e.flying).every(e=>e.y===groundY()-7)'));
  assert.equal(r.stats().depth,0);
}
r.run('game.pausedForReward=true;');
const knightFeet=r.run(`(()=>{
  const translate=ctx.translate;let first;
  ctx.translate=(x,y)=>{first??={x,y};};
  drawKnight(knights[0]);ctx.translate=translate;return first.y;
})()`);
assert.equal(knightFeet,r.run('groundY()-5'));
const frozen=r.run('visual.clock');r.run('updateVisuals(.5);');assert.equal(r.run('visual.clock'),frozen);
r.run('newGame();');
assert.equal(r.run('visual.particles.length'),0);
assert.equal(r.run('visual.clock'),0);
assert.equal(r.run('visual.archers[0]'),-99);
console.log('PASS  Resize keeps ground enemies anchored; pause and new game reset visual state');
