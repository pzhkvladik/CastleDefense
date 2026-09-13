function endGame(){
  game.gameOver=true;
  document.getElementById('resultText').textContent=`Ти дійшов до хвилі ${game.wave}, знищив ${game.kills} ворогів і пройшов ${Math.max(1,Math.floor((game.wave-1)/10)+1)} розділ(и).`;
  document.getElementById('overlay').classList.add('show');
}


function buyBallista(){
  const cost=game.ballista?260+game.ballista*180:330;
  if(!spend(cost))return;
  game.ballista++;
  showMsg(`🏹 Балліста Lv.${game.ballista}`);
  updateShop();
}
function buyCatapult(){
  const cost=game.catapult?310+game.catapult*220:420;
  if(!spend(cost))return;
  game.catapult++;
  showMsg(`🪨 Катапульта Lv.${game.catapult}`);
  updateShop();
}
function buyOil(){
  const cost=game.oil?155+game.oil*110:210;
  if(!spend(cost))return;
  game.oil++;
  showMsg(`🛢️ Кипляча олія Lv.${game.oil}`);
  updateShop();
}
function buyTraps(){
  const cost=150+game.traps*130;
  if(game.traps>=4){showMsg('Пастки MAX');return}
  if(!spend(cost))return;
  game.traps++;
  showMsg(game.traps===1?'🪤 Шипи встановлено':game.traps===2?'💣 Додано міни':game.traps===3?'🔥 Додано вогняні пастки':'🪤 Пастки MAX');
  updateShop();
}
function deployKnights(){
  if(game.knightCooldown>0){
    showMsg(`⚔️ Загін буде готовий через ${Math.ceil(game.knightCooldown)}с`);
    return;
  }

  const cost=90+game.knightLevel*45;
  if(!spend(cost))return;
  if(game.knightLevel===0)game.knightLevel=1;

  const count=2+Math.min(3,game.knightLevel);
  for(let i=0;i<count;i++){
    const hp=135+game.knightLevel*52+game.castleLevel*12;
    knights.push({
      x:gateX()+38-i*15,
      y:groundY()-5,
      hp,maxHp:hp,
      damage:24+game.knightLevel*11,
      attackTimer:.18+i*.12,
      attackAnim:0,
      hurt:0,
      death:0,
      blockAnim:0,
      phase:i*1.4,
      facing:1,
      dead:false
    });
  }

  game.knightCooldown=Math.max(11,21-game.knightLevel*2);
  showMsg('⚔️ Лицарі вийшли з воріт');
  updateShop();
}
function deployCavalry(){
  if(game.cavalryCooldown>0){
    showMsg(`🐎 Вершники повернуться через ${Math.ceil(game.cavalryCooldown)}с`);
    return;
  }
  const targets=enemies.filter(e=>!e.dead&&e.type==='catapult').sort((a,b)=>a.x-b.x);
  if(!targets.length){
    showMsg('🐎 На полі немає ворожої катапульти');
    return;
  }
  if(!spend(BALANCE.cavalry.cost))return;

  for(let i=0;i<BALANCE.cavalry.count;i++){
    cavalry.push({
      type:'cavalry',x:gateX()+18-i*24,y:groundY()-6,
      target:targets[i%targets.length],mode:'charge',slot:i,
      phase:i*Math.PI,attackTimer:.34+i*.16,attackAnim:0,
      facing:1,dead:false
    });
  }
  game.cavalryCooldown=BALANCE.cavalry.cooldown;
  showMsg('🐎 Кінна вилазка! Вершники обходять стрій');
  updateShop();
}
function repairTowers(){
  if(game.towerHp>=game.towerMax){
    showMsg('Башти цілі');
    return;
  }

  if(game.towerHp<=0){
    const rebuildCost=300+game.castleLevel*95;
    if(!spend(rebuildCost))return;

    game.towerHp=Math.round(game.towerMax*.75);
    game.towerDestroyedNotified=false;
    game.ballistaTimer=.5;
    game.catapultTimer=.8;

    showMsg('🏗️ Артилерійські платформи відбудовано — балліста й катапульта знову працюють');
    updateShop();
    return;
  }

  const cost=Math.max(90,Math.round((game.towerMax-game.towerHp)*1.15));
  if(!spend(cost))return;
  game.towerHp=Math.min(game.towerMax,game.towerHp+game.towerMax*.55);
  showMsg('🧱 Башти відремонтовано');
  updateShop();
}
function upgradeCastle(){
  if(game.castleLevel>=7){
    showMsg('🏰 Фортеця вже максимального рівня');
    return;
  }

  const cost=castleCost();
  if(!spend(cost))return;

  game.castleLevel++;
  game.gateMax+=170;
  game.gateHp+=170;
  game.towerMax+=90;
  game.towerHp+=90;
  if(game.towerHp>0)game.towerDestroyedNotified=false;

  const names={
    2:'Кам’яний бастіон',
    3:'Укріплена цитадель',
    4:'Королівська фортеця',
    5:'Високий донжон',
    6:'Великий замковий комплекс',
    7:'Імперська цитадель'
  };
  showMsg(`🏰 ${names[game.castleLevel]}`);
  updateShop();
}
function buyTech(){
  const cost=280+game.techLevel*220;
  if(!spend(cost))return;
  game.techLevel++;
  game.critChance=Math.min(.42,game.critChance+.025);
  showMsg(`📜 Військові технології Lv.${game.techLevel}`);
  updateShop();
}

function fireBallista(){
  if(!game.ballista||game.towerHp<=0)return;
  game.ballistaKick=.38;
  const targets=enemies.filter(e=>!e.dead).sort((a,b)=>{
    if(game.siegeHunter){
      const ap=['catapult','ram'].includes(a.type)?0:1,bp=['catapult','ram'].includes(b.type)?0:1;
      if(ap!==bp)return ap-bp;
    }
    return a.x-b.x;
  });
  if(!targets.length)return;

  visualShot('ballista');
  const target=targets[0];
  const sx=castleX()+91,sy=groundY()-292;
  const dx=target.x-sx,dy=(target.y-45*target.scale)-sy,len=Math.hypot(dx,dy)||1;
  arrows.push({
    x:sx,y:sy,vx:dx/len*610,vy:dy/len*610,rot:Math.atan2(dy,dx),
    life:2,target,targetType:'enemy',
    damage:72+game.ballista*38,level:5,crit:false,ballista:true,source:'ballista',trail:[]
  });
}
function fireDefenderCatapult(){
  if(!game.catapult||game.towerHp<=0)return;
  game.catapultKick=.62;
  const alive=enemies.filter(e=>!e.dead);
  if(!alive.length)return;
  visualShot('catapult');
  const target=alive[Math.floor(Math.random()*Math.min(5,alive.length))];
  const stats=catapultProjectileStats(game.catapult);

  stones.push({
    side:'player',x:castleX()-115,y:groundY()-330,
    tx:target.x,ty:target.y-12,
    t:0,duration:.88,
    damage:stats.damage,
    radius:stats.radius,
    size:stats.size
  });
}
function fireEnemyCatapult(e){
  const targetTower=Math.random()<.65&&game.towerHp>0;
  stones.push({
    side:'enemy',x:e.x-25,y:e.y-75,
    tx:targetTower?castleX():gateX(),
    ty:targetTower?groundY()-255:groundY()-90,
    t:0,duration:1.05,
    damage:e.damage,
    radius:55,targetTower,
    size:13
  });
}

// ---------------- ECONOMY ----------------
function spend(cost){
  if(game.gold<cost){showMsg('🪙 Не вистачає золота');return false}
  game.gold-=cost;return true
}
function gateCost(){return 90+(game.gateLevel-1)*65}
function archerCost(){return [70,105,145][game.archers]??999}
function archerUpCost(){return 70+game.archerLevel*55}
function riverCost(){return game.river?100+game.riverLevel*75:145}
function lavaCost(){return game.lava?125+game.lavaLevel*85:185}
function mageCost(){return game.mage?160+game.mageLevel*105:240}
function repairCost(){return Math.max(120,Math.round((game.gateMax-game.gateHp)*1.45))}
function castleCost(){return 360+(game.castleLevel-1)*300}

function buyGate(){
  const c=gateCost();if(!spend(c))return;
  game.gateLevel++;
  game.gateMax+=135;
  game.gateHp+=135;
  showMsg(`🏰 Ворота Lv.${game.gateLevel}`);
  updateShop()
}
function buyArcher(){
  if(game.archers>=3)return;
  const c=archerCost();if(!spend(c))return;
  game.archers++;
  showMsg(`🏹 Лучник ${game.archers}/3`);
  updateShop()
}
function upgradeArchers(){
  if(game.archers===0){showMsg('Спочатку найми лучника');return}
  const c=archerUpCost();if(!spend(c))return;
  game.archerLevel++;
  showMsg(`🎯 Лучники Lv.${game.archerLevel}`);
  updateShop()
}
function buyArcherCommander(){
  if(game.archerCommander){showMsg('👑 Суперкомандир уже на мурі');return}
  if(!spend(BALANCE.archerCommander.cost))return;
  game.archerCommander=true;
  archerTimers=archerTimers.map(()=>0);
  addPerk(
    'archerCommander',
    '👑',
    'Суперкомандир лучників',
    '×1.9 шкоди, +67% темпу, +25% швидкості стріл і +15% криту.'
  );
  showMsg('👑 Суперкомандир лучників прибув!');
  updateShop();
}
function buyRiver(){
  const c=riverCost();if(!spend(c))return;
  const first=!game.river;
  game.river=true;game.riverLevel++;
  if(first){
    game.bridge.active=false;
    game.bridge.building=false;
    game.bridge.buildProgress=0;
    startMoatConstruction();
  }
  showMsg(first?'⛏️ Кріпаки будують рів з алігаторами!':`🐊 Рів Lv.${game.riverLevel}`);
  updateShop()
}
function buyLava(){
  const c=lavaCost();if(!spend(c))return;
  game.lava=true;game.lavaLevel++;game.lavaCooldown=.9;
  showMsg(game.lavaLevel===1?'🌋 Лавова пастка встановлена':`🌋 Лава Lv.${game.lavaLevel}`);
  updateShop()
}
function buyMage(){
  const c=mageCost();if(!spend(c))return;
  game.mage=true;game.mageLevel++;game.mageCooldown=1;
  showMsg(game.mageLevel===1?'🧙 Маг прибув':`🧙 Маг Lv.${game.mageLevel}`);
  updateShop()
}
function repairGate(){
  if(game.gateHp>=game.gateMax){showMsg('Ворота цілі');return}
  const c=repairCost();if(!spend(c))return;
  game.gateHp=Math.min(game.gateMax,game.gateHp+game.gateMax*.55);
  showMsg('🔨 Ворота відремонтовано');
  updateShop()
}
function setBtn(id,name,desc,price,disabled=false){
  const b=document.getElementById(id);
  const priceText=String(price??'');
  const priceMatch=priceText.match(/🪙\s*(\d+)/);
  const unaffordable=priceMatch?game.gold<Number(priceMatch[1]):false;
  const finalDisabled=disabled||unaffordable;
  b.disabled=finalDisabled;
  b.classList.toggle('unaffordable',unaffordable&&!disabled);
  b.classList.toggle('locked',!!disabled);
  b.setAttribute('aria-disabled',finalDisabled?'true':'false');
  b.innerHTML=`<span class="name">${name}</span><span class="desc">${desc}</span><span class="price">${price}</span>`;
}
function updateShop(){
  setBtn('gateBtn',`🏰 Ворота Lv.${game.gateLevel}`,'+135 міцності',`🪙 ${gateCost()}`);
  setBtn(
    'archerBtn',
    game.archers<3?`🏹 Лучник ${game.archers}/3`:'🏹 Лучники 3/3',
    'авто-стрільба • працює незалежно від артилерії',
    game.archers<3?`🪙 ${archerCost()}`:'MAX',
    game.archers>=3
  );
  setBtn('archerUpBtn',`🎯 Стріли Lv.${game.archerLevel}`,'шкода + швидкість',`🪙 ${archerUpCost()}`,game.archers===0);
  setBtn(
    'archerCommanderBtn',
    game.archerCommander?'👑 Суперкомандир':'👑 Суперкомандир лучників',
    game.archerCommander?'усі лучники під командуванням':'×1.9 шкода • +67% темп • +15% крит',
    game.archerCommander?'ПРИДБАНО':`🪙 ${BALANCE.archerCommander.cost}`,
    game.archerCommander
  );
  setBtn('riverBtn',game.river?`🐊 Рів Lv.${game.riverLevel}`:'🐊 Рів з алігаторами',game.river?'сильніший укус':'уповільнює ворогів',`🪙 ${riverCost()}`);
  setBtn('lavaBtn',game.lava?`🌋 Лава Lv.${game.lavaLevel}`:'🌋 Лавова пастка',game.lava?'сильніший опік':'заливає підхід',`🪙 ${lavaCost()}`);
  setBtn(
    'mageBtn',
    game.mage?`🧙 Маг Lv.${game.mageLevel}`:'🧙 Маг',
    'грозова хмара • працює незалежно від артилерії',
    `🪙 ${mageCost()}`
  );
  setBtn('repairBtn','🏰 Ремонт замку','відновити 55% міцності',`🪙 ${repairCost()}`);
  setBtn(
    'ballistaBtn',
    game.ballista?`🎯 Балліста Lv.${game.ballista}`:'🎯 Балліста',
    game.towerHp<=0?'ВИМКНЕНА • відбудуй артилерію':'великий пробивний болт',
    `🪙 ${game.ballista?260+game.ballista*180:330}`
  );
  setBtn(
    'catapultBtn',
    game.catapult?`🪨 Катапульта Lv.${game.catapult}`:'🪨 Катапульта',
    game.towerHp<=0?'ВИМКНЕНА • відбудуй артилерію':'повільний удар по площі • ядро MAX 24',
    `🪙 ${game.catapult?310+game.catapult*220:420}`
  );
  setBtn('oilBtn',game.oil?`🛢️ Олія Lv.${game.oil}`:'🛢️ Кипляча олія','дешева пастка воріт',`🪙 ${game.oil?155+game.oil*110:210}`);
  setBtn('trapsBtn',`🪤 Пастки Lv.${game.traps}`,'шипи → міни → вогонь',game.traps>=4?'MAX':`🪙 ${150+game.traps*130}`,game.traps>=4);
  setBtn('knightsBtn',game.knightLevel?`⚔️ Лицарі Lv.${game.knightLevel}`:'⚔️ Лицарі',game.knightCooldown>0?`готові через ${Math.ceil(game.knightCooldown)}с`:'випустити загін',`🪙 ${90+game.knightLevel*45}`);
  const catapultsAlive=enemies.some(e=>!e.dead&&e.type==='catapult');
  setBtn(
    'cavalryBtn','🐎 Кінна вилазка',
    game.cavalryCooldown>0?`повернуться через ${Math.ceil(game.cavalryCooldown)}с`:catapultsAlive?'обхід строю • удар з тилу':'потрібна ворожа катапульта',
    `🪙 ${BALANCE.cavalry.cost}`,
    game.cavalryCooldown>0||!catapultsAlive
  );
  const towersDestroyed=game.towerHp<=0;
  const towerRepairCost=towersDestroyed
    ?300+game.castleLevel*95
    :Math.max(90,Math.round((game.towerMax-game.towerHp)*1.15));
  setBtn(
    'towerRepairBtn',
    towersDestroyed?'🏗️ Відбудувати артилерію':'🧱 Ремонт артилерії',
    towersDestroyed?'повернути баллісту й катапульту':'відновити 55%',
    `🪙 ${towerRepairCost}`
  );
  setBtn(
    'castleBtn',
    `🏰 Фортеця Lv.${game.castleLevel}`,
    game.castleLevel>=7?'імперська цитадель MAX':'нова секція + більше HP',
    game.castleLevel>=7?'MAX':`🪙 ${castleCost()}`,
    game.castleLevel>=7
  );
  setBtn('techBtn',`📜 Технології Lv.${game.techLevel}`,'швидкість + крит',`🪙 ${280+game.techLevel*220}`);
  syncHUD()
}
function syncHUD(){
  document.getElementById('hp').textContent=`${Math.ceil(game.gateHp)}/${game.gateMax}`;
  document.getElementById('wave').textContent=game.wave;
  const chapter=currentSeason();
  const chapterLabel=document.getElementById('chapterLabel');
  if(chapterLabel)chapterLabel.textContent=`${chapter.icon} ${chapter.chapter}`;
  document.getElementById('towerHp').textContent=`${Math.max(0,Math.ceil(game.towerHp))}/${game.towerMax}`;
  document.getElementById('eventLabel').textContent=eventName();
  document.getElementById('gold').textContent=Math.floor(game.gold);
  document.getElementById('kills').textContent=game.kills;
  const repairCritical=game.gateHp/game.gateMax<.15||game.towerHp/game.towerMax<.15;
  const repairTab=document.getElementById('repairTab');
  repairTab.classList.toggle('repairCritical',repairCritical);
  repairTab.title=repairCritical?'Критичні пошкодження — потрібен ремонт!':'Ремонт замку та артилерії';
  updatePerkHUD();
  const bw=document.getElementById('bossWrap'),bf=document.getElementById('bossFill');
  if(game.boss&&!game.boss.dead){
    bw.style.display='block';
    bf.style.width=(100*game.boss.hp/game.boss.maxHp)+'%';
    const bs=CHAPTER_THEMES[game.boss.seasonIndex ?? seasonIndexForWave(game.wave)];
    document.getElementById('bossTitle').textContent=`👑 ${bs.bossName.toUpperCase()}`;
  }else bw.style.display='none'
}

// ---------------- DRAW: BACKGROUND ----------------
