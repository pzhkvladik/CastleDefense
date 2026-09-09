import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {runtime,battleSetup} from './runtime.mjs';

const r=await runtime(fileURLToPath(new URL('../',import.meta.url)));
r.run(battleSetup);
r.run(`
  const originalRoyalKeep=drawRoyalKeep;
  let royalKeepCalls=0;
  drawRoyalKeep=(...args)=>{royalKeepCalls++;originalRoyalKeep(...args);};
`);
const snapshot='JSON.stringify({game,enemies,arrows,stones,knights,archerTimers})';
for(const [width,height] of [[900,480],[1280,583],[1440,760]]){
  for(const night of [0,.5,1]){
    for(let level=1;level<=7;level++){
      for(const damaged of [false,true]){
        r.run(`W=${width};H=${height};visual.night=${night};game.castleLevel=${level};
          game.gateHp=game.gateMax*${damaged?.25:1};game.towerHp=${damaged?0:'game.towerMax'};
          royalKeepCalls=0;`);
        const before=r.run(snapshot),randomCalls=r.stats().randomCalls;
        r.run('drawCastle();');
        assert.equal(r.run('royalKeepCalls'),level===7?1:0,'Royal keep is exclusive to Lv.7');
        assert.equal(r.run(snapshot),before,'Castle drawing must not change combat state');
        assert.equal(r.stats().randomCalls,randomCalls,'Castle drawing must not consume combat RNG');
        assert.equal(r.stats().depth,0,'Canvas transforms must be balanced');
      }
    }
  }
}
console.log('PASS  Castle Lv.1–7: day, twilight, night, damage and resize preserve combat state/RNG; new keep only at Lv.7');
