import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {runtime,battleSetup} from './runtime.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
const r=await runtime(root);
r.run(battleSetup+"game.event='normal';resetVisuals();");
assert.equal(r.run("nightColor('#123456','#abcdef')"),'#123456');
r.run("game.event='night';updateVisuals(.016);");
assert.ok(r.run('visual.night>0&&visual.night<.03'));
r.run('for(let i=0;i<600;i++)updateVisuals(.016);');
assert.ok(r.run('visual.night>.999'));
assert.notEqual(r.run('visualSeason().skyTop'),r.run('seasonColor(SEASONS.map(s=>s.skyTop))'));

// Use actual spawned goblins, not mock types, to catch carrier eligibility regressions.
r.run("newGame();game.event='night';resetVisuals();for(let i=0;i<70;i++){spawnEnemy('normal');enemies.at(-1).x=450+i*6;}prepareNightLights();");
assert.equal(r.run('enemies.filter(isTorchBearer).length'),24);
assert.equal(r.run('nightLights.length'),12);
const assignment=r.run('JSON.stringify(enemies.map(isTorchBearer))');
r.run('for(const e of enemies)e.phase+=123;prepareNightLights();');
assert.equal(r.run('JSON.stringify(enemies.map(isTorchBearer))'),assignment);
r.run('const deadCarrier=nightLights[0].e;deadCarrier.dead=true;prepareNightLights();');
assert.ok(r.run('nightLights.every(light=>light.e!==deadCarrier)'));
assert.ok(r.run("!isTorchBearer({type:'dragon',flying:true,x:600,phase:0})"));
console.log('PASS  Stable torch carriers use real goblin types; dead/flying units emit no road light; lights capped at 12');

const state=r.run('JSON.stringify({game,enemies,arrows,stones,knights,archerTimers})');
const calls=r.stats().randomCalls;
for(const [width,height] of [[900,480],[1440,760],[1280,568]]){
  r.run(`W=${width};H=${height};prepareNightLights();draw();`);
  assert.equal(r.stats().depth,0);
  assert.ok(r.run('nightLights.every(light=>light.y===groundY()-7-65*light.e.scale)'));
}
assert.equal(r.run('JSON.stringify({game,enemies,arrows,stones,knights,archerTimers})'),state);
assert.equal(r.stats().randomCalls,calls);
console.log('PASS  Night rendering and resize preserve gameplay state/RNG and balance canvas transforms');

for(const wave of [1,5,9,13]){
  r.run(battleSetup+`game.wave=${wave};game.event='night';gameSpeed=12;resetVisuals();`);
  for(let i=0;i<120;i++)r.run('updateVisuals(1/60);update(.2);draw();');
  assert.equal(r.stats().depth,0);
  assert.ok(r.run('nightLights.length<=NIGHT_LIGHT_LIMIT&&visual.particles.length<=VISUAL_LIMIT'));
}
r.run("game.event='normal';game.gameOver=false;game.pausedForReward=false;for(let i=0;i<600;i++)updateVisuals(.016);prepareNightLights();");
assert.ok(r.run('visual.night<.001'));
assert.equal(r.run('nightLights.length'),0);
assert.equal(r.run("nightColor('#123456','#abcdef')"),'#123456');
r.run('newGame();');assert.equal(r.run('visual.night'),0);assert.equal(r.run('visual.torchSerial'),0);
assert.ok(!(await readFile(new URL('../scripts/render-effects.js',import.meta.url),'utf8')).includes("rgba(9,18,38,.38)"));
console.log('PASS  Night works across all seasons at x12; dawn/new game clear lights; full-screen night filter removed');
