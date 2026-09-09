import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readProjectFile = (relativePath) =>
  readFile(path.join(projectRoot, relativePath), 'utf8');

const [balanceSource, economySource, simulationSource, renderUnitsSource, coreSource, renderWorldSource] = await Promise.all([
  readProjectFile('scripts/balance.js'),
  readProjectFile('scripts/economy-ui.js'),
  readProjectFile('scripts/simulation.js'),
  readProjectFile('scripts/render-units.js'),
  readProjectFile('scripts/core.js'),
  readProjectFile('scripts/render-world.js'),
]);

const messages = [];
const math = Object.create(Math);
math.random = () => .10;

const context = vm.createContext({
  console,
  Math: math,
  game: {},
  enemies: [],
  arrows: [],
  enemyArrows: [],
  stones: [],
  knights: [],
  particles: [],
  texts: [],
  clouds: [],
  lightnings: [],
  alligators: [],
  birds: [],
  archerTimers: [0, 0, 0],
  showMsg: (message) => messages.push(message),
  addPerk: (...args) => { context.lastPerk = args; },
  updateShop: () => {},
  syncHUD: () => {},
  archerSlot: () => ({ x: 0, feetY: 100, flip: false }),
  bridgePoint: () => ({ x: 50, y: 90 }),
  groundY: () => 576,
  castleX: () => 200,
  gateX: () => 292,
  riverBounds: () => ({ left: 500, right: 650, width: 150, center: 575 }),
  seasonIndexForWave: () => 0,
  currentSeason: () => ({ hpMul: 1, speedMul: 1, damageMul: 1 }),
  seasonCycleNumber: () => 0,
  rand: (a, b) => (a + b) / 2,
  clamp: (value, min, max) => Math.max(min, Math.min(max, value)),
  lerp: (a, b, amount) => a + (b - a) * amount,
  TAU: Math.PI * 2,
  document: {
    getElementById: () => ({
      classList: { add() {}, remove() {}, toggle() {} },
      style: {},
      dataset: {},
      innerHTML: '',
      textContent: '',
      disabled: false,
    }),
    querySelectorAll: () => [],
  },
  setTimeout: () => 0,
  clearTimeout: () => {},
  visualShot: () => {},
  visualHit: () => {},
  emitVisual: () => {},
});

vm.runInContext(balanceSource, context, { filename: 'balance.js' });
vm.runInContext(economySource, context, { filename: 'economy-ui.js' });
vm.runInContext(simulationSource, context, { filename: 'simulation.js' });
vm.runInContext('updateShop=()=>{}; syncHUD=()=>{};', context);

const levelOneCatapult = vm.runInContext('catapultProjectileStats(1)', context);
const extremeCatapult = vm.runInContext('catapultProjectileStats(100)', context);
assert.equal(levelOneCatapult.damage, 60);
assert.equal(levelOneCatapult.radius, 68);
assert.equal(levelOneCatapult.size, 14.5);
assert.equal(extremeCatapult.radius, 105);
assert.equal(extremeCatapult.size, 24);
assert.equal(vm.runInContext('catapultShotCooldown(1)', context), 5.12);
assert.equal(vm.runInContext('catapultShotCooldown(100)', context), 3.2);
assert.match(renderUnitsSource, /projectileSizeMax/);
console.log('PASS  Catapult damage, radius, cadence, and projectile size use the nerfed caps');

context.game = {
  gold: 10000,
  gateLevel: 1,
  gateMax: 810,
  gateHp: 700,
};
context.buyGate();
assert.equal(context.game.gateLevel, 2);
assert.equal(context.game.gateMax, 945);
assert.equal(context.game.gateHp, 835);
console.log('PASS  Gate upgrade preserves all fortress HP and adds 135 more');

context.game = {
  gold: 3000,
  archerCommander: false,
};
context.archerTimers = [4, 5, 6];
context.lastPerk = null;
context.buyArcherCommander();
assert.equal(context.game.gold, 0);
assert.equal(context.game.archerCommander, true);
assert.deepEqual(Array.from(context.archerTimers), [0, 0, 0]);
assert.equal(context.lastPerk?.[0], 'archerCommander');
context.buyArcherCommander();
assert.equal(context.game.gold, 0);
console.log('PASS  Archer Commander costs 3000 gold and can only be purchased once');

context.game = {
  archerCommander: false,
  bridge: { active: false },
  archerLevel: 1,
  critChance: 0,
};
context.enemies = [{ dead: false, x: 100, y: 93, scale: 1 }];
context.arrows = [];
context.fireArrow(0);
const regularArrow = context.arrows[0];
assert.equal(regularArrow.damage, 25);
assert.equal(Math.round(Math.hypot(regularArrow.vx, regularArrow.vy)), 470);
assert.equal(regularArrow.crit, false);

context.game.archerCommander = true;
context.arrows = [];
context.fireArrow(0);
const commanderArrow = context.arrows[0];
assert.equal(commanderArrow.damage, 47.5);
assert.equal(Math.round(Math.hypot(commanderArrow.vx, commanderArrow.vy)), 588);
assert.equal(commanderArrow.crit, true);
console.log('PASS  Archer Commander buffs arrow damage, speed, and critical chance');

assert.match(coreSource, /x:x-72[\s\S]*x:x-24[\s\S]*x:x\+72/);
assert.match(renderUnitsSource, /const cx=x\+24/);
assert.ok(
  renderWorldSource.indexOf('drawDefenderWeapons();') <
    renderWorldSource.indexOf('if(game.archerCommander)drawArcherCommander(x,gy);'),
);
console.log('PASS  Archer Commander stands inside the archer line and renders above the ballista');
