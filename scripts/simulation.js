function enemyStats(type){
  const w=game.wave;
  const season=currentSeason();
  const cycle=seasonCycleNumber(w);

  const yearHp=1+cycle*.18;
  const yearDmg=1+cycle*.12;
  const yearSpd=1+cycle*.035;
  const elite=game.event==='elite'?1.42:1;
  const night=game.event==='night'?1.13:1;

  function mk(t,hp,spd,dmg,reward,scale=1){
    return {
      type:t,
      hp:hp*season.hpMul*yearHp*elite*night,
      speed:spd*season.speedMul*yearSpd,
      damage:dmg*season.damageMul*yearDmg*(game.event==='elite'?1.18:1)*(game.event==='night'?1.10:1),
      reward:reward*(game.goldWave?2.5:1),
      scale
    };
  }

  if(type==='builder') return mk('builder',155+w*13.5,69+w*.75,8+w*.38,34,1.03);
  if(type==='archer') return mk('archer',82+w*8.8,42+w*.72,8.5+w*.52,22,.98);
  if(type==='ram') return mk('ram',260+w*22,22+w*.35,34+w*1.65,42,1.35);
  if(type==='catapult') return mk('catapult',210+w*18,20+w*.30,18+w*.95,44,1.25);
  if(type==='flyer') return mk('flyer',72+w*7.5,66+w*1.2,11+w*.55,23,.92);
  if(type==='necromancer') return mk('necromancer',115+w*11,30+w*.5,10+w*.45,38,1.05);
  if(type==='healer') return mk('healer',102+w*10,31+w*.55,8+w*.4,34,1.02);
  if(type==='bomber') return mk('bomber',92+w*8,50+w*.9,58+w*2.1,30,1.02);
  if(type==='armored') return mk('armored',180+w*17,29+w*.5,14+w*.75,31,1.16);
  if(type==='poison') return mk('poison',90+w*9,46+w*.8,9+w*.45,27,.98);
  if(type==='undead') return mk('undead',52+w*5.5,35+w*.55,7+w*.35,4,.92);
  if(type==='miniboss') return mk('miniboss',360+w*34,26+w*.4,24+w*1.15,70,1.42);

  if(type==='dragon'){
    return mk('dragon',1120+w*185,38+w*.35,31+w*1.6,260,2.0);
  }

  if(type==='boss'){
    return mk('boss',760+w*145,19+w*.52,25+w*1.9,155+w*11,1.75);
  }

  const r=Math.random();
  if(w>=18 && r<.08) return enemyStats('necromancer');
  if(w>=16 && r<.16) return enemyStats('catapult');
  if(w>=15 && r<.23) return enemyStats('healer');
  if(w>=14 && r<.31) return enemyStats('flyer');
  if(w>=13 && r<.39) return enemyStats('ram');
  if(w>=12 && r<.47) return enemyStats('bomber');
  if(w>=11 && r<.55) return enemyStats('poison');
  if(w>=9 && r<.64) return enemyStats('armored');
  if(w>=8 && r<.72) return enemyStats('archer');
  if(w>=6 && r<.80) return mk('shaman',88+w*10,32+w*.76,11+w*.62,26,1.02);
  if(w>=5 && r<.88) return mk('runner',50+w*7.5,64+w*1.65,8+w*.52,15,.88);
  if(w>=3 && r<.95) return mk('brute',130+w*15,28+w*.72,15+w*.82,22,1.20);

  return mk('goblin',70+w*8.5,40+w*.90,10+w*.58,13,1);
}
function spawnEnemy(force){
  const requested=(force&&force!=='normal')?force:null;
  const s=enemyStats(requested);
  const e={
    ...s,
    x:spawnX()+rand(0,95),y:groundY()-7,
    hp:s.hp,maxHp:s.hp,
    attackTimer:rand(.3,.9),hurt:0,wet:0,burning:0,dead:false,
    phase:rand(0,TAU),attackAnim:0,death:0,stun:0,
    building:false,builderDone:false,
    ranged:false,rangedTimer:rand(.55,1.15),rangedAnim:0,
    specialTimer:rand(2.2,5.2),healPulse:0,poisoned:false,
    flying:s.type==='flyer'||s.type==='dragon',
    seasonIndex:seasonIndexForWave(game.wave)
  };
  enemies.push(e);
  if(e.type==='boss'||e.type==='dragon'){
    game.boss=e;
    game.shake=6;
    showMsg(`👑 ${CHAPTER_THEMES[e.seasonIndex].bossName}!`);
  }
}

function nextWave(){
  const oldSeason=seasonIndexForWave(game.wave);

  game.wave++;
  game.spawned=0;
  game.builderSpawned=false;
  game.waveTotal=7+Math.ceil(game.wave*2.05);
  game.wavePause=0;
  game.spawnTimer=.55;

  // Slightly less free gold than V3, but still enough to keep upgrades flowing.
  const bonus=28+game.wave*4+game.waveGoldBonus;
  game.gold+=bonus;
  if(game.waveRepair){
    game.gateHp=Math.min(game.gateMax,game.gateHp+game.gateMax*.08);
    game.towerHp=Math.min(game.towerMax,game.towerHp+game.towerMax*.05);
  }

  chooseWaveEvent();

  const newSeason=seasonIndexForWave(game.wave);
  const s=currentSeason();

  if(newSeason!==oldSeason){
    showWave(s.chapter.toUpperCase());
    showMsg(`${s.icon} ${s.chapter}`);
  }else{
    showWave(`ХВИЛЯ ${game.wave}`);
    showMsg(`🪙 Бонус за хвилю +${bonus}`);
  }

  updateShop();
}
function damageEnemy(e,dmg,color='#fff',source='generic'){
  if(e.dead)return;

  if(e.type==='armored'&&source==='arrow')dmg*=.48;
  if(e.type==='ram'&&source==='arrow')dmg*=.72;
  if(game.siegeHunter&&['ballista','catapult'].includes(source)&&['catapult','ram'].includes(e.type))dmg*=1.75;
  if(game.bossExecutioner&&source==='arrow'&&e.type==='boss')dmg*=1.50;
  if(game.lastStand&&game.gateHp/game.gateMax<.35)dmg*=1.35;

  dmg*=1+game.damageBonus;
  e.hp-=dmg;
  e.hurt=.10;
  visualHit(e,source);
  addText(e.x,e.y-72*e.scale,Math.round(dmg),color,12+(e.type==='boss'?3:0));
  if(e.hp<=0){
    if(e.type==='builder'&&e.building&&!game.bridge.active){
      game.bridge.building=false;
      game.bridge.buildProgress=0;
      showMsg('🛠️ Будівельника знищено — міст не добудований');
    }
    e.dead=true;
    e.death=.38;
    game.gold+=Math.round(e.reward*(1+game.goldBonus));
    if(game.siegeHunter&&['catapult','ram'].includes(e.type))game.gold+=18;
    game.kills++;
    if(!['undead','dragon'].includes(e.type))game.corpseSouls++;
    burst(e.x,e.y-28,'#809f43',14,e.type==='boss'?145:85);
    burst(e.x,e.y-24,'#5c3b27',8,70);
    if(e.type==='boss'){
      game.boss=null;
      game.gold+=140;
      game.flash=.18;game.shake=10;game.rewardPending=true;
      showMsg(`👑 ${CHAPTER_THEMES[e.seasonIndex].bossName} переможений!`);
      setTimeout(()=>{ if(game.rewardPending&&!game.gameOver){game.rewardPending=false;showBossReward();} },250);
    }else if(e.type==='dragon'){
      game.boss=null;
    }
    updateShop();
  }
}

function damageBridge(dmg){
  if(!game.bridge.active)return;
  game.bridge.hp-=dmg;
  const p=bridgePoint();
  addText(p.x,p.y-25,Math.round(dmg),'#ffd89a',12);
  burst(p.x,p.y-4,'#9b6b3e',5,42,115);

  if(game.bridge.hp<=0){
    game.bridge.hp=0;
    game.bridge.active=false;
    game.bridge.building=false;
    game.bridge.buildProgress=0;
    game.bridge.collapse=.75;
    game.shake=4;
    burst(p.x,p.y-2,'#755033',24,95,150);
    showMsg('🏹 Міст зруйновано — рів знову працює');
  }
}

function fireArrow(i){
  const slot=archerSlot(i);
  const ax=slot.x+18;
  const ay=slot.feetY-30;
  const commander=game.archerCommander;
  const damageMultiplier=commander?BALANCE.archerCommander.damageMultiplier:1;
  const projectileSpeedMultiplier=commander?BALANCE.archerCommander.projectileSpeedMultiplier:1;

  // Once the bridge is finished, every archer prioritizes destroying it.
  if(game.bridge.active){
    const p=bridgePoint();
    visualShot('archer',i);
    const speed=(470+Math.min(game.archerLevel-1,5)*18)*projectileSpeedMultiplier;
    const dx=p.x-ax,dy=p.y-ay,len=Math.hypot(dx,dy)||1;
    arrows.push({
      x:ax,y:ay,vx:dx/len*speed,vy:dy/len*speed,
      rot:Math.atan2(dy,dx),life:2,
      target:null,targetType:'bridge',
      damage:(17+game.archerLevel*7)*.92*damageMultiplier,
      level:game.archerLevel,
      trail:[]
    });
    return;
  }

  let target=null,best=Infinity;
  for(const e of enemies){
    if(e.dead)continue;

    // Builders are strategically important and get a small targeting priority.
    const d=e.x-ax-(e.type==='builder'?55:0);
    if(d>0&&d<best){best=d;target=e;}
  }
  if(!target)return;

  visualShot('archer',i);
  const tx=target.x,ty=target.y-45*target.scale;
  const speed=(470+Math.min(game.archerLevel-1,5)*18)*projectileSpeedMultiplier;
  const dx=tx-ax,dy=ty-ay,len=Math.hypot(dx,dy)||1;
  arrows.push({
    x:ax,y:ay,vx:dx/len*speed,vy:dy/len*speed,
    rot:Math.atan2(dy,dx),life:2,target,targetType:'enemy',
    damage:(18+game.archerLevel*7)*damageMultiplier,
    level:game.archerLevel,
    crit:Math.random()<Math.min(
      BALANCE.archerCommander.critMax,
      game.critChance+(commander?BALANCE.archerCommander.critBonus:0)
    ),
    trail:[]
  });
}
function spillLava(){
  game.lavaCooldown=Math.max(5.7,9.5-game.lavaLevel*.7);
  game.lavaPour=1.35;
  const lx=gateX()+60;
  for(const e of enemies){
    if(!e.dead&&e.x>lx-5&&e.x<lx+150){
      e.burning=3.8;
      damageEnemy(e,26+game.lavaLevel*10,'#ffbc55');
    }
  }
  for(let i=0;i<60;i++){
    particles.push({
      x:lx+rand(0,145),y:groundY()-rand(0,20),vx:rand(-30,95),vy:rand(-155,-35),
      life:rand(.45,1.2),max:1,size:rand(3,8),
      color:Math.random()<.45?'#ff5a2d':Math.random()<.75?'#ff9a35':'#ffd05b',
      gravity:210,rot:0,vr:0
    });
  }
  game.shake=6;
}
function castMage(){
  const alive=enemies.filter(e=>!e.dead);
  if(!alive.length)return;
  const center=alive[Math.floor(Math.random()*Math.min(alive.length,5))];
  visualShot('mage');
  clouds.push({x:center.x,y:Math.max(80,center.y-165),life:5.0,strike:.15,phase:rand(0,TAU)});
  game.mageCooldown=Math.max(4.8,8.8-game.mageLevel*.65);
  showMsg('⚡ Маг викликає бурю');
}

function shootEnemyArrow(e){
  const startX=e.x-15;
  const startY=e.y-48*e.scale;
  const tx=gateX()+10;
  const ty=groundY()-105;
  const speed=285+game.wave*2.2;
  const dx=tx-startX,dy=ty-startY,len=Math.hypot(dx,dy)||1;

  enemyArrows.push({
    x:startX,y:startY,
    vx:dx/len*speed,vy:dy/len*speed,
    rot:Math.atan2(dy,dx),
    damage:e.damage,
    life:3.2,
    trail:[]
  });
}

 // ---------------- UPDATE ----------------
function update(dt){
  if(game.gameOver||game.pausedForReward)return;
  time+=dt;

  game.shake=Math.max(0,game.shake-dt*16);
  game.flash=Math.max(0,game.flash-dt*3.5);
  game.bridge.collapse=Math.max(0,game.bridge.collapse-dt);
  game.lavaPour=Math.max(0,game.lavaPour-dt);
  game.oilPour=Math.max(0,(game.oilPour||0)-dt);
  game.archerSlow=Math.max(0,game.archerSlow-dt);
  game.knightCooldown=Math.max(0,game.knightCooldown-dt);
  game.cavalryCooldown=Math.max(0,game.cavalryCooldown-dt);
  game.ballistaKick=Math.max(0,game.ballistaKick-dt*3.6);
  game.catapultKick=Math.max(0,game.catapultKick-dt*2.5);

  if(game.towerHp<=0&&!game.towerDestroyedNotified){
    game.towerHp=0;
    game.towerDestroyedNotified=true;
    showMsg('💥 Артилерійські платформи зруйновано — балліста й катапульта вимкнені');
  }

  // ambient
  for(const b of birds){
    b.x+=b.speed*dt;
    b.y+=Math.sin(time*1.3+b.phase)*1.2*dt;
    if(b.x>W+30){b.x=-30;b.y=rand(65,H*.32)}
  }

  // waves
  const alive=enemies.some(e=>!e.dead);
  if(game.spawned<game.waveTotal){
    game.spawnTimer-=dt;
    if(game.spawnTimer<=0){
      // Exactly one chapter boss, always the final spawn of waves 10/20/30/...
      const chapterBoss=(game.wave%10===0&&game.spawned===game.waveTotal-1);
      let force=chapterBoss?'boss':'normal';
      const builderMoment=Math.max(2,Math.floor(game.waveTotal*.24));
      if(
        !chapterBoss &&
        game.wave>=12 &&
        game.river &&
        !game.bridge.active &&
        !game.bridge.building &&
        !game.builderSpawned &&
        game.spawned>=builderMoment
      ){
        force='builder';
        game.builderSpawned=true;
        showMsg('🛠️ Гоблін-будівельник біжить до рову!');
      }

      spawnEnemy(force);
      game.spawned++;
      game.spawnTimer=Math.max(.34,1.08-game.wave*.024)+rand(0,.30);
    }
  }else if(!alive){
    if(game.wavePause<=0)game.wavePause=3.4;
    game.wavePause-=dt;
    if(game.wavePause<=0)nextWave();
  }

  // archers
  for(let i=0;i<game.archers;i++){
    archerTimers[i]-=dt*(game.archerSlow>0?.62:1);
    if(archerTimers[i]<=0){
      fireArrow(i);
      const baseCooldown=(1.22-game.archerLevel*.09)*(1-Math.min(.32,game.techLevel*.08));
      const commanderMultiplier=game.archerCommander?BALANCE.archerCommander.cooldownMultiplier:1;
      archerTimers[i]=Math.max(game.archerCommander ? .20 : .32,baseCooldown*commanderMultiplier)+i*.03;
    }
  }


  // defender ballista
  if(game.ballista&&game.towerHp>0){
    game.ballistaTimer-=dt;
    if(game.ballistaTimer<=0){
      fireBallista();
      game.ballistaTimer=Math.max(1.15,2.9-game.ballista*.25);
    }
  }

  // defender catapult
  if(game.catapult&&game.towerHp>0){
    game.catapultTimer-=dt;
    if(game.catapultTimer<=0){
      fireDefenderCatapult();
      game.catapultTimer=catapultShotCooldown(game.catapult);
    }
  }

  // boiling oil: cheaper, shorter-range secondary gate trap
  if(game.oil){
    game.oilCooldown-=dt;
    const oilZone=gateX()+95;
    if(game.oilCooldown<=0&&enemies.some(e=>!e.dead&&!e.flying&&e.x<oilZone)){
      game.oilCooldown=Math.max(5.4,8.4-game.oil*.55);
      game.oilPour=1.05;
      for(const e of enemies){
        if(!e.dead&&!e.flying&&e.x<oilZone&&e.x>gateX()-5){
          damageEnemy(e,18+game.oil*8,'#ffc776','oil');
          e.burning=Math.max(e.burning,1.7);
        }
      }
    }
  }

  // road traps
  if(game.traps){
    game.trapCooldown-=dt;
    if(game.trapCooldown<=0){
      const rb=riverBounds();
      const trapX=game.river?rb.right+95:gateX()+220;
      const target=enemies.find(e=>!e.dead&&!e.flying&&Math.abs(e.x-trapX)<45);
      if(target){
        if(game.traps>=1)damageEnemy(target,14+game.traps*5,'#ded7c8','trap');
        if(game.traps>=2){
          damageEnemy(target,24+game.traps*6,'#ffcc77','trap');
          burst(trapX,groundY()-8,'#8e7d67',12,75,150);
        }
        if(game.traps>=3){
          target.burning=Math.max(target.burning,2.2);
        }
        game.trapCooldown=Math.max(1.3,3.4-game.traps*.42);
      }
    }
  }

  // knights — actual melee units with HP, attack animations and deaths
  for(const k of knights){
    if(k.dead){
      k.death-=dt;
      continue;
    }

    k.phase+=dt*4.2;
    k.attackTimer-=dt;
    k.attackAnim=Math.max(0,k.attackAnim-dt*3.8);
    k.hurt=Math.max(0,k.hurt-dt*4.2);
    k.blockAnim=Math.max(0,k.blockAnim-dt*4);

    let target=null,best=Infinity;
    for(const e of enemies){
      if(e.dead||e.flying||e.type==='catapult')continue;
      const d=Math.abs(e.x-k.x);
      if(d<best){best=d;target=e}
    }

    if(target&&best<42){
      k.facing=target.x>=k.x?1:-1;
      if(k.attackTimer<=0){
        k.attackAnim=1;
        damageEnemy(target,k.damage,'#fff0b0','knight');
        burst(target.x,target.y-28,'#dad1c2',3,28,80);
        k.attackTimer=.78;
      }
    }else{
      k.facing=1;
      k.x+=38*dt;
      const maxX=W*.77;
      if(k.x>maxX)k.x=maxX;
    }
  }

  for(let i=knights.length-1;i>=0;i--){
    if(knights[i].dead&&knights[i].death<=0)knights.splice(i,1);
  }

  // Mounted sortie: ignores the front line, circles behind enemy catapults,
  // strikes from their right side, then returns through the castle gate.
  for(const rider of cavalry){
    rider.y=groundY()-6;
    rider.attackTimer-=dt;
    rider.attackAnim=Math.max(0,rider.attackAnim-dt*4.5);
    const target=rider.target;
    if(!target||target.dead||target.type!=='catapult')rider.mode='return';

    if(rider.mode==='charge'){
      const flankX=target.x+BALANCE.cavalry.flankDistance+rider.slot*58;
      rider.facing=1;
      const step=Math.min(BALANCE.cavalry.speed*dt,Math.max(0,flankX-rider.x));
      rider.x+=step;rider.phase+=step*.11;
      if(rider.x>=flankX-1){rider.mode='attack';rider.facing=-1;rider.attackTimer=Math.min(rider.attackTimer,.18);}
    }else if(rider.mode==='attack'){
      const attackX=target.x+38+rider.slot*58;
      const dx=attackX-rider.x;
      rider.facing=dx>=0?1:-1;
      if(Math.abs(dx)>5){
        const step=Math.sign(dx)*Math.min(BALANCE.cavalry.speed*.42*dt,Math.abs(dx));
        rider.x+=step;rider.phase+=Math.abs(step)*.11;
      }else if(rider.attackTimer<=0){
        rider.facing=-1;rider.attackAnim=1;
        damageEnemy(target,BALANCE.cavalry.damage*(game.cavalrySaboteur?1.6:1),'#ffe5a0','cavalry');
        burst(target.x,target.y-28,'#d8c3a0',5,52,105);
        emitVisual('spark',target.x+12,target.y-36,7,'#ffe6a5');
        rider.attackTimer=BALANCE.cavalry.attackCooldown;
        if(target.dead)rider.mode='return';
      }
    }else{
      rider.facing=-1;
      const step=BALANCE.cavalry.returnSpeed*dt;
      rider.x-=step;rider.phase+=step*.11;
      if(rider.x<gateX()+8)rider.done=true;
    }
  }
  for(let i=cavalry.length-1;i>=0;i--)if(cavalry[i].done)cavalry.splice(i,1);

  // river
  if(game.river){
    const maxAlligators=Math.min(4,1+Math.floor(game.riverLevel/2));
    while(alligators.length<maxAlligators){
      alligators.push({x:W*.59+rand(-60,60),y:groundY()+10,phase:rand(0,TAU),bite:rand(.2,1),biteAnim:0,facing:1});
    }
    for(const a of alligators){
      a.phase+=dt*1.8;
      a.bite-=dt;
      a.biteAnim=Math.max(0,a.biteAnim-dt*3.25);
      a.x+=Math.sin(a.phase)*7*dt;
      if(a.bite<=0&&!game.bridge.active){
        let near=null,best=999;
        for(const e of enemies){
          if(e.dead)continue;
          const d=Math.abs(e.x-a.x);
          if(d<55&&d<best){best=d;near=e}
        }
        if(near){
          a.facing=near.x>=a.x?1:-1;
          a.biteAnim=1;
          damageEnemy(near,(14+game.riverLevel*5.5)*(game.moatFeast?1.45:1),'#d3f77f');
          if(game.moatFeast)game.gateHp=Math.min(game.gateMax,game.gateHp+2);
          near.wet=1.0;
          a.bite=Math.max(.82,1.55-game.riverLevel*.08);
          burst(near.x,groundY()+3,'#79d6ed',11,68,120);
        }
      }
    }
  }

  // lava
  if(game.lava){
    game.lavaCooldown-=dt;
    if(game.lavaCooldown<=0&&enemies.some(e=>!e.dead&&e.x<gateX()+150))spillLava();
  }

  // mage
  if(game.mage){
    game.mageCooldown-=dt;
    if(game.mageCooldown<=0)castMage();
  }

  for(const c of clouds){
    c.life-=dt;c.strike-=dt;c.phase+=dt;
    c.x+=Math.sin(c.phase*2)*4*dt;
    if(c.strike<=0){
      const near=enemies.filter(e=>!e.dead&&Math.abs(e.x-c.x)<140);
      if(near.length){
        const e=near[Math.floor(Math.random()*near.length)];
        lightnings.push({x1:c.x,y1:c.y+18,x2:e.x,y2:e.y-40*e.scale,life:.13});
        damageEnemy(e,26+game.mageLevel*11,'#e7f0ff','magic');
        burst(e.x,e.y-35,'#e9f4ff',9,105,80);
        if(game.stormChain){
          const chain=near.filter(n=>n!==e&&!n.dead).sort((a,b)=>Math.abs(a.x-e.x)-Math.abs(b.x-e.x))[0];
          if(chain){
            lightnings.push({x1:e.x,y1:e.y-40*e.scale,x2:chain.x,y2:chain.y-40*chain.scale,life:.11});
            damageEnemy(chain,18+game.mageLevel*8,'#bfe9ff','magic');
          }
        }
      }
      c.strike=rand(.38,.72);
    }
  }
  for(let i=clouds.length-1;i>=0;i--)if(clouds[i].life<=0)clouds.splice(i,1);

  // arrows
  for(const a of arrows){
    a.life-=dt;
    a.trail.push({x:a.x,y:a.y,life:.12});
    if(a.trail.length>5)a.trail.shift();
    a.x+=a.vx*dt;a.y+=a.vy*dt;
    a.rot=Math.atan2(a.vy,a.vx);
    if(a.targetType==='bridge'){
      if(!game.bridge.active){
        a.life=0;
      }else{
        const p=bridgePoint();
        if(Math.hypot(a.x-p.x,a.y-p.y)<28){
          damageBridge(a.damage);
          a.life=0;
        }
      }
    }else{
      const e=a.target;
      if(e&&!e.dead&&Math.hypot(a.x-e.x,a.y-(e.y-42*e.scale))<28*e.scale){
        damageEnemy(e,a.damage*(a.crit?game.critDamage:1),a.crit?'#fff06a':'#ffe6a2',a.source||'arrow');
        if(game.explosiveArrows&&Math.random()<.25)e.burning=Math.max(e.burning,2.4);
        burst(a.x,a.y,'#e6d1a7',5,45,90);
        a.life=0;
      }
    }
  }
  for(let i=arrows.length-1;i>=0;i--)if(arrows[i].life<=0)arrows.splice(i,1);

  // enemy arrows fired from goblin archers
  for(const a of enemyArrows){
    a.life-=dt;
    a.trail.push({x:a.x,y:a.y,life:.11});
    if(a.trail.length>5)a.trail.shift();

    a.x+=a.vx*dt;
    a.y+=a.vy*dt;
    a.rot=Math.atan2(a.vy,a.vx);

    const targetX=gateX()+10;
    const targetY=groundY()-105;
    if(Math.hypot(a.x-targetX,a.y-targetY)<34){
      game.gateHp-=a.damage;
      addText(targetX,targetY-8,`-${Math.round(a.damage)}`,'#ff7777',12);
      burst(targetX,targetY,'#b9ad9c',5,48,120);
      game.shake=Math.max(game.shake,2.3);
      a.life=0;

      if(game.gateHp<=0){
        game.gateHp=0;
        endGame();
      }
    }
  }
  for(let i=enemyArrows.length-1;i>=0;i--)if(enemyArrows[i].life<=0)enemyArrows.splice(i,1);


  // stone projectiles: defender and enemy catapults
  for(const s of stones){
    s.t+=dt/s.duration;
    const q=clamp(s.t,0,1);
    const x=lerp(s.x,s.tx,q);
    const baseY=lerp(s.y,s.ty,q);
    const arc=-Math.sin(q*Math.PI)*130;
    s.cx=x;s.cy=baseY+arc;

    if(s.t>=1&&!s.hit){
      s.hit=true;
      emitVisual('dust',s.tx,s.ty,12,'#c4b395');
      emitVisual('chip',s.tx,s.ty,8,'#9c978c');

      if(s.side==='player'){
        for(const e of enemies){
          if(!e.dead&&Math.hypot(e.x-s.tx,(e.y-15)-s.ty)<s.radius){
            damageEnemy(e,s.damage,'#ffd398','catapult');
          }
        }
        burst(s.tx,s.ty,'#7c705e',18,95,170);
      }else{
        if(s.targetTower){
          game.towerHp-=s.damage;
          addText(s.tx,s.ty-15,`-${Math.round(s.damage)}`,'#ff7777',13);
        }else{
          game.gateHp-=s.damage;
          addText(s.tx,s.ty-15,`-${Math.round(s.damage)}`,'#ff7777',13);
        }
        burst(s.tx,s.ty,'#8f8170',18,100,180);
        game.shake=6;
        if(game.gateHp<=0){game.gateHp=0;endGame();}
        if(game.towerHp<0)game.towerHp=0;
      }
    }
  }
  for(let i=stones.length-1;i>=0;i--)if(stones[i].t>=1.06)stones.splice(i,1);

  // enemies
  const gate=gateX()+42;
  for(const e of enemies){
    // Keep every non-flying enemy on the current ground line after a resize.
    if(!e.flying)e.y=groundY()-7;
    if(e.dead)continue;
    e.phase+=dt*(e.speed*.12);
    e.hurt=Math.max(0,e.hurt-dt);
    e.wet=Math.max(0,e.wet-dt);
    e.attackAnim=Math.max(0,e.attackAnim-dt*3.2);
    e.rangedAnim=Math.max(0,e.rangedAnim-dt*4.5);

    if(e.burning>0){
      e.burning-=dt;
      if(Math.random()<dt*8){
        particles.push({
          x:e.x+rand(-14,14)*e.scale,y:e.y-rand(22,55)*e.scale,
          vx:rand(-12,12),vy:rand(-50,-18),
          life:rand(.3,.65),max:1,size:rand(2,5),
          color:Math.random()<.5?'#ff6a2d':'#ffc24b',gravity:-8,rot:0,vr:0
        });
      }
      damageEnemy(e,dt*(8+game.lavaLevel*3),'#ffac4c');
    }

    // support / special enemy abilities
    e.specialTimer-=dt;

    if(e.type==='healer'&&e.specialTimer<=0){
      for(const ally of enemies){
        if(!ally.dead&&ally!==e&&Math.abs(ally.x-e.x)<115){
          ally.hp=Math.min(ally.maxHp,ally.hp+ally.maxHp*.14);
          addText(ally.x,ally.y-65*ally.scale,'+HP','#8df58d',11);
        }
      }
      e.healPulse=.7;
      e.specialTimer=4.7;
    }
    e.healPulse=Math.max(0,(e.healPulse||0)-dt);

    if(e.type==='necromancer'&&e.specialTimer<=0&&game.corpseSouls>0){
      game.corpseSouls--;
      const u=enemyStats('undead');
      enemies.push({
        ...u,x:e.x+45,y:groundY()-7,hp:u.hp,maxHp:u.hp,
        attackTimer:.8,hurt:0,wet:0,burning:0,dead:false,
        phase:rand(0,TAU),attackAnim:0,death:0,stun:0,
        building:false,builderDone:false,ranged:false,rangedTimer:1,rangedAnim:0,
        specialTimer:4,flying:false,seasonIndex:e.seasonIndex
      });
      addText(e.x,e.y-76,'☠','#caa2ff',17);
      e.specialTimer=6.0;
    }

    // One lightweight signature ability for each chapter boss.
    if(e.type==='boss'){
      const bossTheme=CHAPTER_THEMES[e.seasonIndex];
      if(bossTheme.id==='demonic'&&!e.enraged&&e.hp/e.maxHp<.45){
        e.enraged=true;e.speed*=1.22;e.damage*=1.28;
        addText(e.x,e.y-105,'ENRAGED','#ff5a86',16);burst(e.x,e.y-45,'#d13d6e',18,90,90);
      }
      if(e.specialTimer<=0){
        if(bossTheme.id==='greenlands'){
          const heal=e.maxHp*.045;e.hp=Math.min(e.maxHp,e.hp+heal);
          addText(e.x,e.y-100,`+${Math.round(heal)}`,'#9bd872',13);
          e.specialTimer=5.2;
        }else if(bossTheme.id==='winter'){
          game.archerSlow=Math.max(game.archerSlow,3.6);
          addText(e.x,e.y-102,'FROST','#bcecff',14);burst(e.x,e.y-45,'#a9e5ff',14,70,60);
          e.specialTimer=6.0;
        }else if(bossTheme.id==='darkForest'){
          for(let n=0;n<2;n++){
            const u=enemyStats('runner');
            enemies.push({...u,x:e.x+55+n*34,y:groundY()-7,hp:u.hp,maxHp:u.hp,attackTimer:.7,hurt:0,wet:0,burning:0,dead:false,phase:rand(0,TAU),attackAnim:0,death:0,stun:0,building:false,builderDone:false,ranged:false,rangedTimer:1,rangedAnim:0,specialTimer:4,flying:false,seasonIndex:e.seasonIndex});
          }
          addText(e.x,e.y-102,'SHADOW PACK','#b3c58a',13);e.specialTimer=7.2;
        }else if(bossTheme.id==='volcanic'){
          const hit=Math.max(16,e.damage*.45);
          game.towerHp=Math.max(0,game.towerHp-hit);
          addText(castleX()+125,groundY()-305,`-${Math.round(hit)}`,'#ff9a57',13);game.shake=5;
          e.specialTimer=5.6;
        }else if(bossTheme.id==='demonic'){
          game.gateHp=Math.max(0,game.gateHp-e.damage*.28);
          addText(gateX(),groundY()-112,'CURSE','#ff6b9a',13);e.specialTimer=5.0;
          if(game.gateHp<=0){game.gateHp=0;endGame();}
        }
      }
    }

    if(e.type==='catapult'){
      const stopX=game.river?riverBounds().right+120:gate+330;
      if(e.x>stopX){e.x-=e.speed*dt;continue;}
      if(e.specialTimer<=0){
        fireEnemyCatapult(e);
        e.attackAnim=1;
        e.specialTimer=Math.max(2.8,5.2-game.wave*.018);
      }
      continue;
    }

    if(e.type==='dragon'){
      e.y=groundY()-165+Math.sin(time*2+e.phase)*18;
      const stopX=gate+330;
      if(e.x>stopX){e.x-=e.speed*dt;continue;}
      if(e.specialTimer<=0){
        // dragon breath damages both towers and gate
        const dmg=e.damage;
        e.attackAnim=1;
        game.towerHp-=dmg*.75;
        game.gateHp-=dmg*.55;
        game.flash=.12;
        game.shake=7;
        for(let fi=0;fi<25;fi++){
          particles.push({
            x:e.x-158,y:e.y-44,vx:rand(-220,-95),vy:rand(-55,55),
            life:rand(.35,.8),max:1,size:rand(3,7),
            color:Math.random()<.5?'#ff6b2d':'#ffd24d',gravity:-5,rot:0,vr:0
          });
        }
        e.specialTimer=2.6;
      }
      continue;
    }

    let speed=e.speed;
    if(e.wet>0)speed*=.68;

    const rb=riverBounds();

    if(e.type==='flyer'){
      e.y=groundY()-105+Math.sin(time*4+e.phase)*13;
      const stopX=castleX()+185;
      if(e.x>stopX){e.x-=speed*dt;continue;}
      e.attackTimer-=dt;
      if(e.attackTimer<=0){
        if(game.towerHp>0){
          game.towerHp-=e.damage;
          addText(castleX(),groundY()-300,`-${Math.round(e.damage)}`,'#ff7777',12);
        }else{
          game.gateHp-=e.damage;
        }
        e.attackTimer=1.45;
      }
      continue;
    }

    // Ground goblins engage our knights instead of phasing through them.
    if(!['archer','catapult','flyer','dragon','healer','necromancer'].includes(e.type)){
      let defender=null;
      let defenderDist=Infinity;

      for(const k of knights){
        if(k.dead)continue;
        const d=Math.abs(e.x-k.x);
        if(d<defenderDist){defenderDist=d;defender=k}
      }

      if(defender&&defenderDist<38){
        e.attackTimer-=dt;

        if(e.attackTimer<=0){
          e.attackAnim=1;

          let knightDamage=e.damage;
          if(e.type==='ram')knightDamage*=1.35;
          if(e.type==='brute'||e.type==='miniboss'||e.type==='boss')knightDamage*=1.12;

          // Shield absorbs some of the incoming hit, but knights are fully killable.
          const shieldReduction=.20;
          const dealt=knightDamage*(1-shieldReduction);
          defender.hp-=dealt;
          defender.hurt=1;
          defender.blockAnim=1;
          emitVisual('spark',defender.x-16,groundY()-35,6,'#ffe6b4');

          addText(defender.x,defender.y-62,`-${Math.round(dealt)}`,'#ff8b7d',11);
          burst(defender.x,defender.y-30,'#c8b8a0',4,38,100);

          if(e.type==='bomber'){
            defender.hp-=e.damage*.55;
            e.dead=true;
            e.death=.22;
            burst(e.x,e.y-25,'#ff7038',20,125,175);
          }

          if(defender.hp<=0&&!defender.dead){
            defender.hp=0;
            defender.dead=true;
            defender.death=.55;
            burst(defender.x,defender.y-30,'#9b3940',13,75,150);
            addText(defender.x,defender.y-70,'Лицар загинув','#ffb0a8',11);
          }

          e.attackTimer=e.type==='boss'?1.0:e.type==='brute'?1.25:1.45;
        }

        continue;
      }
    }

    // Special engineer AI: from wave 12 it runs to the moat and builds a bridge.
    if(e.type==='builder'&&game.river&&!game.bridge.active&&!e.builderDone){
      const buildX=rb.right+24;

      if(e.x>buildX){
        e.x-=speed*dt;
        continue;
      }

      e.building=true;
      game.bridge.building=true;
      e.attackAnim=.75+.25*Math.sin(time*11);
      game.bridge.buildProgress=Math.min(1,game.bridge.buildProgress+dt/4.0);

      if(game.bridge.buildProgress>=1){
        const bridgeHp=480+game.wave*34;
        game.bridge.active=true;
        game.bridge.building=false;
        game.bridge.hp=bridgeHp;
        game.bridge.maxHp=bridgeHp;
        game.bridge.buildProgress=1;
        e.building=false;
        e.builderDone=true;
        showMsg('🌉 Міст готовий — рів тимчасово вимкнений!');
      }else{
        continue;
      }
    }

    // A completed bridge bypasses the whole moat for the army.
    if(game.river&&!game.bridge.active&&e.x>rb.left-5&&e.x<rb.right+5){
      speed*=Math.max(.62,.88-game.riverLevel*.04);
    }

    // Goblin archer: once it has crossed the moat, it establishes a firing position
    // and attacks the castle from range instead of walking to the gate.
    if(e.type==='archer'){
      const firingX=game.river ? rb.left-46 : gate+225;

      if(e.x>firingX){
        e.x-=speed*dt;
        continue;
      }

      e.ranged=true;
      e.rangedTimer-=dt;
      if(e.rangedTimer<=0){
        e.rangedAnim=1;
        shootEnemyArrow(e);
        e.rangedTimer=Math.max(.78,1.72-game.wave*.012)+rand(0,.28);
      }
      continue;
    }

    if(e.x>gate+20){
      e.x-=speed*dt;
    }else{
      if(e.type==='bomber'){
        game.gateHp-=e.damage;
        game.shake=11;
        game.flash=.15;
        burst(gate,groundY()-35,'#ff7038',28,145,190);
        e.hp=0;e.dead=true;e.death=.2;
        if(game.gateHp<=0){game.gateHp=0;endGame();}
        continue;
      }

      e.attackTimer-=dt;
      if(e.attackTimer<=0){
        e.attackAnim=1;
        const hitDamage=e.type==='ram'?e.damage*1.8:e.damage;
        game.gateHp-=hitDamage;
        if(e.type==='poison')game.archerSlow=5;
        game.shake=(e.type==='boss'||e.type==='ram')?12:5;
        addText(gate,groundY()-104,`-${Math.round(hitDamage)}`,'#ff6f6f',14);
        burst(gate,groundY()-54,'#b8aa97',e.type==='boss'?16:7,95,160);
        e.attackTimer=e.type==='boss'?1.15:1.6;
        if(game.gateHp<=0){
          game.gateHp=0;
          endGame();
        }
      }
    }
  }

  // corpses / removal
  for(let i=enemies.length-1;i>=0;i--){
    const e=enemies[i];
    if(e.dead){
      e.death-=dt;
      if(e.death<=0)enemies.splice(i,1);
    }
  }

  // particles/text
  for(const p of particles){
    p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=p.gravity*dt;p.rot+=p.vr*dt
  }
  for(let i=particles.length-1;i>=0;i--)if(particles[i].life<=0)particles.splice(i,1);

  for(const tx of texts){tx.life-=dt;tx.y-=32*dt}
  for(let i=texts.length-1;i>=0;i--)if(texts[i].life<=0)texts.splice(i,1);

  for(const l of lightnings)l.life-=dt;
  for(let i=lightnings.length-1;i>=0;i--)if(lightnings[i].life<=0)lightnings.splice(i,1);


  syncHUD();
}
