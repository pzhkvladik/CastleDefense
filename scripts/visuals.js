// Presentation only: no combat-state writes and no consumption of Math.random().
// Effects stay readable at x12; simulation keeps its original clock.
const VISUAL_LIMIT=220;
const visual={clock:0,seed:7291,particles:[],units:new WeakMap(),
  archers:[-99,-99,-99],ballista:-99,catapult:-99,mage:-99,
  weights:[1,0,0,0],palette:null,gateHp:0,towerHp:0,smokeTimer:0,night:0,torchSerial:0};
function resetVisuals(){
  visual.clock=0;visual.seed=7291;visual.particles.length=0;
  visual.units=new WeakMap();visual.archers=[-99,-99,-99];
  visual.ballista=visual.catapult=visual.mage=-99;
  visual.weights=SEASONS.map((_,i)=>i===seasonIndexForWave(game.wave)?1:0);
  visual.palette=null;visual.gateHp=game.gateHp;visual.towerHp=game.towerHp;
  visual.smokeTimer=0;
  visual.night=game.event==='night'?1:0;visual.torchSerial=0;nightLights.length=0;
}
function visualRand(a=0,b=1){
  visual.seed=(Math.imul(visual.seed,1664525)+1013904223)>>>0;
  return a+(b-a)*visual.seed/4294967296;
}
function unitVisual(e){
  let v=visual.units.get(e);
  if(!v){
    const eligible=['goblin','runner','armored','brute','undead'].includes(e.type)&&!e.flying;
    v={x:e.x,moving:0,stride:e.phase||0,step:0,hit:-99,seed:e.phase||0,torch:eligible&&visual.torchSerial++%3===0};
    visual.units.set(e,v);
  }
  return v;
}
function visualShot(kind,index=0){
  if(kind==='archer')visual.archers[index]=visual.clock;
  else visual[kind]=visual.clock;
}
function shotRecoil(kind,duration=.28,index=0){
  const age=visual.clock-(kind==='archer'?visual.archers[index]:visual[kind]);
  return age>=0&&age<duration?Math.pow(1-age/duration,2):0;
}
function archerPose(i){
  const recoil=shotRecoil('archer',.18,i);
  const hasTarget=game.bridge.active||enemies.some(e=>!e.dead&&e.x>archerSlot(i).x+18);
  const pull=hasTarget&&!recoil?clamp(1-archerTimers[i]/.40,0,1):0;
  return {recoil,pull};
}
function catapultMount(){return {x:Math.max(75,castleX()-199),y:groundY()-203};}
function stoneDrawPosition(s){
  if(s.side!=='player')return {x:s.cx,y:s.cy};
  const mount=catapultMount(),q=clamp(s.t,0,1);
  // Start at the visible launch cup. This never changes the hit point or flight timer.
  return {x:lerp(mount.x+Math.sin(.48)*66,s.tx,q),
    y:lerp(mount.y+4-Math.cos(.48)*66,s.ty,q)-Math.sin(q*Math.PI)*130};
}
function emitVisual(kind,x,y,count=5,color='#d0b993'){
  const capacity=VISUAL_LIMIT-visual.particles.length;
  for(let i=0;i<Math.min(count,capacity);i++){
    const soft=kind==='dust'||kind==='smoke';
    const life=kind==='smoke'?visualRand(.9,1.6):soft?visualRand(.30,.65):visualRand(.18,.42);
    visual.particles.push({kind,x,y:y-groundY(),life,max:life,color,
      vx:visualRand(-1,1)*(soft?19:95),vy:soft?visualRand(-24,-7):visualRand(-125,-35),
      size:soft?visualRand(3,7):visualRand(1,3),rot:visualRand(0,TAU)});
  }
}
function visualHit(e,source){
  const v=unitVisual(e);
  // Burning damage can arrive every tick; don't turn it into a particle hose.
  if(visual.clock-v.hit<.075)return;
  v.hit=visual.clock;
  const metal=(source==='arrow'&&['armored','ram'].includes(e.type))||source==='knight';
  const magic=source==='magic';
  emitVisual(magic?'magic':metal?'spark':'chip',e.x-8*e.scale,e.y-35*e.scale,
    magic?7:metal?7:4,magic?'#a7e7ff':metal?'#ffe4a1':'#b9b481');
}
function seasonColor(colors){
  const rgb=[0,0,0];
  colors.forEach((hex,i)=>{const n=parseInt(hex.slice(1),16);
    rgb[0]+=(n>>16)*visual.weights[i];rgb[1]+=((n>>8)&255)*visual.weights[i];rgb[2]+=(n&255)*visual.weights[i];});
  return `rgb(${rgb.map(Math.round).join(',')})`;
}
function visualSeason(){
  if(!visual.palette){
    const p={...currentSeason(),winter:visual.weights[3],autumn:visual.weights[2]};
    for(const key of ['skyTop','skyMid','skyLow','skyBottom','hill','hill2','ground1','ground2','treeA','treeB'])
      p[key]=nightColor(seasonColor(SEASONS.map(s=>s[key])),NIGHT_PALETTE[key]);
    visual.palette=p;
  }
  return visual.palette;
}
function updateVisuals(realDt){
  if(game.gameOver||game.pausedForReward)return;
  const dt=clamp(realDt,0,.05)*Math.min(gameSpeed,2);
  visual.clock+=dt;
  visual.night=lerp(visual.night,game.event==='night'?1:0,1-Math.exp(-dt/1.15));
  const season=seasonIndexForWave(game.wave),blend=1-Math.exp(-dt/1.7);
  visual.weights=visual.weights.map((w,i)=>lerp(w,i===season?1:0,blend));
  visual.palette=null;
  for(let i=visual.particles.length-1;i>=0;i--){
    const p=visual.particles[i];p.life-=dt;
    if(p.life<=0){visual.particles.splice(i,1);continue;}
    p.x+=p.vx*dt;p.y+=p.vy*dt;
    if(!['dust','smoke','magic'].includes(p.kind))p.vy+=260*dt;
  }
  const rb=riverBounds();
  for(const e of [...enemies,...knights]){
    const v=unitVisual(e),distance=Math.abs(e.x-v.x);v.x=e.x;
    v.moving=lerp(v.moving,!e.dead&&!e.flying&&distance>.01?1:0,1-Math.exp(-dt*18));
    // Stride comes from distance travelled, not an idle combat timer.
    if(!e.dead&&!e.flying){
      v.stride+=Math.min(distance,12)*.13;v.step+=Math.min(distance,18);
      if(v.step>19&&distance>.01){
        v.step=0;
        const wet=game.river&&!game.bridge.active&&e.x>rb.left&&e.x<rb.right;
        emitVisual(wet?'water':'dust',e.x,groundY()+3,wet?4:2,wet?'#bbebee':'#b2a28a');
      }
    }
  }
  if(game.gateHp<visual.gateHp)emitVisual('chip',gateX()+5,groundY()-75,7,'#bd8a57');
  if(game.towerHp<visual.towerHp)emitVisual('chip',castleX()+125,groundY()-265,8,'#a6a5a0');
  visual.gateHp=game.gateHp;visual.towerHp=game.towerHp;
  visual.smokeTimer-=dt;
  if(visual.smokeTimer<=0){
    visual.smokeTimer=.18;
    if(game.gateHp/game.gateMax<.35)emitVisual('smoke',gateX()-24,groundY()-86,1,'#514b46');
    if(game.towerHp/game.towerMax<.5)emitVisual('smoke',castleX()+123,groundY()-287,2,'#494e52');
  }
}
function drawVisualParticles(groundLayer=false){
  ctx.save();
  for(const p of visual.particles){
    if((p.kind==='dust'||p.kind==='water')!==groundLayer)continue;
    const t=1-p.life/p.max,soft=p.kind==='dust'||p.kind==='smoke';
    ctx.globalAlpha=(1-t)*(soft?.30:.9);ctx.fillStyle=p.color;ctx.strokeStyle=p.color;
    const y=groundY()+p.y;
    if(soft){
      ctx.beginPath();ctx.ellipse(p.x,y,p.size*(1+t*2),p.size*(.55+t),0,0,TAU);ctx.fill();
    }else if(p.kind==='water'){
      ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(p.x,y);ctx.lineTo(p.x-p.vx*.025,y-p.vy*.025);ctx.stroke();
    }else if(p.kind==='spark'||p.kind==='magic'){
      ctx.lineWidth=p.size*.65;ctx.beginPath();ctx.moveTo(p.x,y);ctx.lineTo(p.x-p.vx*.045,y-p.vy*.035);ctx.stroke();
    }else{
      ctx.save();ctx.translate(p.x,y);ctx.rotate(p.rot+t*3);ctx.fillRect(-p.size,-p.size,p.size*2,p.size);ctx.restore();
    }
  }
  ctx.restore();
}
function drawSeasonMotes(foreground=false){
  const s=visualSeason(),count=foreground?18:32;
  ctx.save();
  for(let i=0;i<count;i++){
    const seed=i+(foreground?710:310),z=foreground?1.4:.7;
    const x=((hash01(seed)*W+visual.clock*(7+hash01(seed+12)*9)*z)%(W+40))-20;
    const y=((hash01(seed+31)*H+visual.clock*(12+hash01(seed+8)*16)*z)%(H+40))-20;
    const r=(1+hash01(seed+19))*z;
    if(s.winter>.005){
      ctx.globalAlpha=s.winter*(foreground?.62:.42);ctx.fillStyle='#f1f8fa';
      ctx.beginPath();ctx.arc(x+Math.sin(visual.clock+i)*7,y,r,0,TAU);ctx.fill();
    }
    if(s.autumn>.005){
      ctx.globalAlpha=s.autumn*(foreground?.65:.36);ctx.fillStyle=i%2?'#da9d45':'#b56d39';
      ctx.save();ctx.translate(x,y);ctx.rotate(visual.clock*.8+i);
      ctx.beginPath();ctx.ellipse(0,0,r*2.2,r*.8,0,0,TAU);ctx.fill();ctx.restore();
    }
  }
  ctx.restore();
}
function drawContactShadows(){
  ctx.save();
  for(const e of enemies){
    ctx.globalAlpha=e.dead?clamp(e.death/.35,0,1):1;
    const size=(e.type==='dragon'?62:e.type==='flyer'?24:21*e.scale);
    ctx.fillStyle=e.flying?'rgba(15,24,29,.16)':'rgba(18,20,17,.32)';
    ctx.beginPath();ctx.ellipse(e.x,groundY()+6,size,e.flying?5:5*e.scale,0,0,TAU);ctx.fill();
  }
  ctx.restore();
}
function drawCastleFinish(x,gy){
  ctx.save();
  const shade=ctx.createLinearGradient(0,gy-32,0,gy+10);
  shade.addColorStop(0,'rgba(16,22,27,0)');shade.addColorStop(.8,'rgba(16,22,27,.25)');shade.addColorStop(1,'rgba(16,22,27,0)');
  ctx.fillStyle=shade;ctx.fillRect(x-166,gy-32,334,42);
  const damage=clamp(1-game.gateHp/game.gateMax,0,1),tower=clamp(1-game.towerHp/game.towerMax,0,1);
  for(const [cx,cy,w,h,d] of [[x-40,gy-160,80,120,damage],[x+120,gy-270,40,145,tower]]){
    for(let i=0;i<6;i++){
      const strength=clamp((d-.12-i*.12)*5,0,1);if(!strength)continue;
      const px=cx+(hash01(i+91)-.5)*w,py=cy+hash01(i+33)*h;
      ctx.globalAlpha=strength;ctx.strokeStyle='#343b3e';ctx.lineWidth=1.5;
      ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(px+6,py+10);ctx.lineTo(px-3,py+23);
      ctx.moveTo(px+6,py+10);ctx.lineTo(px+15,py+12);ctx.stroke();
      ctx.strokeStyle='rgba(220,220,206,.4)';ctx.lineWidth=.7;
      ctx.beginPath();ctx.moveTo(px+1,py);ctx.lineTo(px+7,py+10);ctx.stroke();
    }
  }
  ctx.globalAlpha=1;
  for(let i=0;i<Math.floor(damage*15);i++){
    const px=gateX()-40+hash01(i+90)*93,py=gy+2+hash01(i+61)*12;
    ctx.fillStyle=i%2?'#88847b':'#5d5d58';
    ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(px+3,py-4);ctx.lineTo(px+8,py-2);ctx.lineTo(px+9,py+3);ctx.closePath();ctx.fill();
  }
  // Heraldry and metal trim communicate upgrades; unit sizes stay unchanged.
  if(game.castleLevel>=2){
    for(const bx of [x-71,x+37]){
      ctx.fillStyle='#742c3e';ctx.beginPath();ctx.moveTo(bx-10,gy-209);ctx.lineTo(bx+10,gy-209);
      ctx.lineTo(bx+10,gy-168);ctx.lineTo(bx,gy-157);ctx.lineTo(bx-10,gy-168);ctx.closePath();ctx.fill();
      ctx.strokeStyle='#d8b970';ctx.lineWidth=1;ctx.stroke();
      ctx.fillStyle='#d8b970';ctx.fillRect(bx-2,gy-200,4,22);ctx.fillRect(bx-7,gy-193,14,3);
    }
  }
  if(game.gateLevel>=2){
    ctx.strokeStyle=game.gateLevel>=5?'#c6a764':'#7d8e93';ctx.lineWidth=3;
    ctx.strokeRect(gateX()-36,gy-80,72,72);
  }
  const glow=ctx.createRadialGradient(x-99,gy-154,2,x-99,gy-154,48);
  glow.addColorStop(0,`rgba(255,160,58,${.19+Math.sin(visual.clock*7)*.025})`);
  glow.addColorStop(1,'rgba(255,130,38,0)');ctx.fillStyle=glow;ctx.fillRect(x-147,gy-202,96,96);
  drawNightCastleLights(x,gy);
  ctx.restore();
}
function drawMageCharge(mx,my){
  const charge=enemies.some(e=>!e.dead)?clamp(1-game.mageCooldown/.9,0,1):0;
  const release=shotRecoil('mage',.6);
  if(!charge&&!release)return;
  ctx.save();ctx.translate(mx+18,my-10);
  const r=18+charge*13+release*20;
  const glow=ctx.createRadialGradient(0,0,1,0,0,r*1.8);
  glow.addColorStop(0,`rgba(156,223,255,${.3*(charge+release)})`);glow.addColorStop(1,'rgba(95,162,255,0)');
  ctx.fillStyle=glow;ctx.fillRect(-r*1.8,-r*1.8,r*3.6,r*3.6);
  ctx.globalAlpha=clamp(charge+release,0,1)*.8;ctx.strokeStyle='#b1dfff';ctx.lineWidth=1.3;
  ctx.rotate(visual.clock*.8);ctx.beginPath();ctx.arc(0,0,r,0,TAU);ctx.stroke();
  for(let i=0;i<5;i++){
    ctx.rotate(TAU/5);ctx.beginPath();ctx.moveTo(r-4,-3);ctx.lineTo(r+3,0);ctx.lineTo(r-4,3);ctx.stroke();
  }
  ctx.restore();
}
