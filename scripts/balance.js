const BALANCE=Object.freeze({
  catapult:Object.freeze({
    damageBase:42,
    damagePerLevel:18,
    radiusBase:62,
    radiusPerLevel:6,
    radiusMax:105,
    projectileSizeBase:13,
    projectileSizePerLevel:1.5,
    projectileSizeMax:24,
    cooldownBase:5.4,
    cooldownPerLevel:.28,
    cooldownMin:3.2
  }),
  archerCommander:Object.freeze({
    cost:3000,
    damageMultiplier:1.9,
    cooldownMultiplier:.6,
    projectileSpeedMultiplier:1.25,
    critBonus:.15,
    critMax:.75
  })
});

function catapultProjectileStats(level){
  return {
    damage:BALANCE.catapult.damageBase+level*BALANCE.catapult.damagePerLevel,
    radius:Math.min(
      BALANCE.catapult.radiusMax,
      BALANCE.catapult.radiusBase+level*BALANCE.catapult.radiusPerLevel
    ),
    size:Math.min(
      BALANCE.catapult.projectileSizeMax,
      BALANCE.catapult.projectileSizeBase+level*BALANCE.catapult.projectileSizePerLevel
    )
  };
}

function catapultShotCooldown(level){
  return Math.max(
    BALANCE.catapult.cooldownMin,
    BALANCE.catapult.cooldownBase-level*BALANCE.catapult.cooldownPerLevel
  );
}
