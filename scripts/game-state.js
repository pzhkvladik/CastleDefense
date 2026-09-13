function newGame(){
  enemies.length=0;arrows.length=0;enemyArrows.length=0;stones.length=0;knights.length=0;cavalry.length=0;particles.length=0;texts.length=0;
  clouds.length=0;lightnings.length=0;alligators.length=0;birds.length=0;
  archerTimers=[0,0,0];

  game={
    gold:190,kills:0,wave:1,
    gateLevel:1,gateMax:300,gateHp:300,
    archers:0,archerLevel:1,archerCommander:false,
    river:false,riverLevel:0,
    bridge:{active:false,building:false,buildProgress:0,hp:0,maxHp:0,collapse:0},
    builderSpawned:false,
    lava:false,lavaLevel:0,lavaCooldown:0,lavaPour:0,
    mage:false,mageLevel:0,mageCooldown:2,
    towerMax:180,towerHp:180,
    ballista:0,ballistaTimer:0,
    catapult:0,catapultTimer:0,
    oil:0,oilCooldown:0,oilPour:0,
    traps:0,trapCooldown:0,
    knightLevel:0,knightCooldown:0,cavalryCooldown:0,
    castleLevel:1,techLevel:0,
    critChance:.08,critDamage:1.75,
    goldBonus:0,damageBonus:0,rangeBonus:0,waveGoldBonus:0,
    explosiveArrows:false,siegeHunter:false,stormChain:false,moatFeast:false,
    waveRepair:false,lastStand:false,bossExecutioner:false,cavalrySaboteur:false,
    perks:{},
    ballistaKick:0,catapultKick:0,
    towerDestroyedNotified:false,
    archerSlow:0,
    corpseSouls:0,
    event:'normal',eliteWave:false,goldWave:false,
    pausedForReward:false,rewardPending:false,
    spawnTimer:1.25,spawned:0,waveTotal:8,wavePause:0,
    boss:null,gameOver:false,shake:0,flash:0,slowmo:0,
    waveBanner:0
  };

  resetVisuals();
  for(let i=0;i<5;i++) birds.push({x:rand(0,W),y:rand(70,H*.34),speed:rand(8,18),phase:rand(0,TAU)});
  updateShop();
  syncHUD();
}
function setShopTab(tab){
  document.querySelectorAll('.shopTab').forEach(btn=>{
    btn.classList.toggle('active',btn.dataset.tab===tab);
  });
  document.querySelectorAll('.shopGroup').forEach(group=>{
    group.classList.toggle('active',group.dataset.shopGroup===tab);
  });
}

function setGameSpeed(speed){
  gameSpeed=speed;
  document.querySelectorAll('.speedBtn').forEach(btn=>{
    btn.classList.toggle('active',Number(btn.dataset.speed)===speed);
  });
  showMsg(`⏩ Швидкість ×${speed}`);
}

function restartGame(){
  document.getElementById('overlay').classList.remove('show');
  newGame();
}
function showMsg(s){
  const el=document.getElementById('message');
  el.textContent=s;el.classList.add('show');
  clearTimeout(showMsg.t);
  showMsg.t=setTimeout(()=>el.classList.remove('show'),1700);
}
function showWave(s){
  const el=document.getElementById('waveBanner');
  el.textContent=s;el.classList.add('show');
  clearTimeout(showWave.t);
  showWave.t=setTimeout(()=>el.classList.remove('show'),1000);
}
function addText(x,y,text,color='#fff',size=13){
  texts.push({x,y,text,color,size,life:1});
}
function burst(x,y,color,n=10,spd=90,gravity=180){
  for(let i=0;i<n;i++){
    particles.push({
      x,y,vx:rand(-spd,spd),vy:rand(-spd,15),
      life:rand(.35,.95),max:1,size:rand(2,5),color,gravity,rot:rand(0,TAU),vr:rand(-5,5)
    });
  }
}


function chooseWaveEvent(){
  game.eliteWave=(game.wave%7===0 && game.wave%10!==0);
  // Chapter-ending waves are reserved for bosses. No old 10-wave gold/bonus event.
  game.goldWave=false;

  if(game.eliteWave){game.event='elite';return;}

  const r=Math.random();
  if(r<.13)game.event='night';
  else if(r<.23)game.event='fog';
  else if(r<.32)game.event='storm';
  else if(r<.39&&currentSeason().id==='winter')game.event='blizzard';
  else game.event='normal';
}

function eventName(){
  return {
    normal:'Звичайна хвиля',
    night:'🌙 Ніч',
    fog:'🌫️ Туман',
    storm:'⛈️ Гроза',
    blizzard:'🌨️ Снігова буря',
    elite:'🔴 Елітна хвиля',
    gold:'🪙 Золота хвиля'
  }[game.event]||'Звичайна хвиля';
}


function addPerk(key,icon,name,desc){
  if(!game.perks[key]){
    game.perks[key]={icon,name,desc,count:0};
  }
  game.perks[key].count++;
  updatePerkHUD();
}

function updatePerkHUD(){
  const root=document.getElementById('perkBar');
  if(!root||!game)return;
  root.innerHTML='';

  for(const p of Object.values(game.perks)){
    const el=document.createElement('div');
    el.className='perkIcon';
    el.dataset.tip=`${p.name}: ${p.desc}${p.count>1?` • x${p.count}`:''}`;
    el.title=`${p.name}: ${p.desc}`;
    el.innerHTML=`<span>${p.icon}</span>${p.count>1?`<span class="perkCount">×${p.count}</span>`:''}`;
    root.appendChild(el);
  }
}

function showBossReward(){
  const pool=[
    {
      key:'explosiveArrows',icon:'🔥',name:'Палаючі стріли',
      desc:'Стріли мають 25% шанс підпалити ворога на кілька секунд.',
      unique:true,apply:()=>game.explosiveArrows=true
    },
    {
      key:'siegeHunter',icon:'🎯',name:'Мисливець на облогу',
      desc:'Балліста й катапульта завдають +75% шкоди ворожим катапультам і таранам.',
      unique:true,apply:()=>game.siegeHunter=true
    },
    {
      key:'stormChain',icon:'⚡',name:'Ланцюгова буря',
      desc:'Кожен удар мага додатково б’є ще одну сусідню ціль.',
      unique:true,apply:()=>game.stormChain=true
    },
    {
      key:'moatFeast',icon:'🐊',name:'Кривавий рів',
      desc:'Алігатори кусають на 45% сильніше й трохи лікують ворота при влучанні.',
      unique:true,apply:()=>game.moatFeast=true
    },
    {
      key:'waveRepair',icon:'🔨',name:'Королівські ремонтники',
      desc:'Після кожної хвилі ворота відновлюють 8% HP, артилерія — 5%.',
      unique:true,apply:()=>game.waveRepair=true
    },
    {
      key:'lastStand',icon:'🛡️',name:'Останній рубіж',
      desc:'Коли ворота нижче 35% HP, усі захисники завдають +35% шкоди.',
      unique:true,apply:()=>game.lastStand=true
    },
    {
      key:'bossExecutioner',icon:'👑',name:'Кат королів',
      desc:'Лучники завдають босам на 50% більше шкоди.',
      unique:true,apply:()=>game.bossExecutioner=true
    },
    {
      key:'cavalrySaboteur',icon:'🐎',name:'Рейдери-саботажники',
      desc:'Кавалерія завдає ворожим катапультам +60% шкоди.',
      unique:true,apply:()=>game.cavalrySaboteur=true
    },
    {
      key:'artilleryCore',icon:'🏹',name:'Серце артилерії',
      desc:'+30% максимуму HP артилерійських платформ і повне відновлення.',
      unique:true,apply:()=>{game.towerMax=Math.round(game.towerMax*1.30);game.towerHp=game.towerMax}
    },
    {
      key:'warChest',icon:'💰',name:'Військова скарбниця',
      desc:'+20% золота з ворогів і +120 золота одразу.',
      unique:true,apply:()=>{game.goldBonus+=.20;game.gold+=120}
    }
  ];

  let available=pool.filter(p=>!p.unique||!game.perks[p.key]);
  if(available.length<3)available=pool;
  const picks=[];
  const copy=[...available];
  while(picks.length<3&&copy.length){
    const idx=Math.floor(Math.random()*copy.length);
    picks.push(copy.splice(idx,1)[0]);
  }

  const root=document.getElementById('rewardChoices');
  root.innerHTML='';
  picks.forEach((p)=>{
    const b=document.createElement('button');
    b.className='rewardChoice';
    b.innerHTML=`<b>${p.icon} ${p.name}</b><span>${p.desc}</span>`;
    b.onclick=()=>{
      p.apply();
      addPerk(p.key,p.icon,p.name,p.desc);
      game.pausedForReward=false;
      document.getElementById('rewardOverlay').classList.remove('show');
      updateShop();syncHUD();showMsg(`🎁 ${p.name}`);
    };
    root.appendChild(b);
  });
  game.pausedForReward=true;
  document.getElementById('rewardOverlay').classList.add('show');
}
