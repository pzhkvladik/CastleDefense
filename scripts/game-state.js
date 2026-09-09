function newGame(){
  enemies.length=0;arrows.length=0;enemyArrows.length=0;stones.length=0;knights.length=0;particles.length=0;texts.length=0;
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
    knightLevel:0,knightCooldown:0,
    castleLevel:1,techLevel:0,
    critChance:.08,critDamage:1.75,
    goldBonus:0,damageBonus:0,rangeBonus:0,waveGoldBonus:0,
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
  game.eliteWave=(game.wave%7===0);
  game.goldWave=(game.wave%10===0);

  if(game.goldWave){game.event='gold';return;}
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
      key:'walls',icon:'🧱',name:'Міцні мури',
      desc:'+12% максимального HP воріт.',
      apply:()=>{const gain=Math.round(game.gateMax*.12);game.gateMax+=gain;game.gateHp+=gain}
    },
    {
      key:'damage',icon:'⚔️',name:'Бойова школа',
      desc:'+10% до шкоди всіх захисників.',
      apply:()=>game.damageBonus+=.10
    },
    {
      key:'gold',icon:'💰',name:'Скарбник',
      desc:'+12% золота з кожного вбитого ворога.',
      apply:()=>game.goldBonus+=.12
    },
    {
      key:'crit',icon:'🎯',name:'Орлине око',
      desc:'+5% шанс критичного пострілу лучників.',
      apply:()=>game.critChance=Math.min(.55,game.critChance+.05)
    },
    {
      key:'towers',icon:'🗼',name:'Сталеві вежі',
      desc:'+18% максимального HP башт.',
      apply:()=>{const gain=Math.round(game.towerMax*.18);game.towerMax+=gain;game.towerHp+=gain}
    },
    {
      key:'speed',icon:'⚡',name:'Швидкі руки',
      desc:'Лучники стріляють приблизно на 8% швидше.',
      apply:()=>game.techLevel+=1
    },
    {
      key:'income',icon:'👑',name:'Королівська казна',
      desc:'+8 золота після кожної завершеної хвилі.',
      apply:()=>game.waveGoldBonus+=8
    },
    {
      key:'traps',icon:'🪤',name:'Майстер пасток',
      desc:'+1 рівень дорожніх пасток.',
      apply:()=>game.traps=Math.min(4,game.traps+1)
    }
  ];

  const picks=[];
  const used=new Set();
  while(picks.length<3){
    const idx=Math.floor(Math.random()*pool.length);
    if(!used.has(idx)){used.add(idx);picks.push(pool[idx]);}
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
      updateShop();
      syncHUD();
      showMsg(`🎁 ${p.name}`);
    };
    root.appendChild(b);
  });

  game.pausedForReward=true;
  document.getElementById('rewardOverlay').classList.add('show');
}
