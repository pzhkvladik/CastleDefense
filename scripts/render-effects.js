function drawArrow(a){
  if(a.ballista){
    for(const tr of a.trail){
      ctx.globalAlpha=tr.life/.12*.62;
      ctx.strokeStyle='#b9d5dc';ctx.lineWidth=4;
      ctx.beginPath();ctx.moveTo(tr.x-28,tr.y);ctx.lineTo(tr.x,tr.y);ctx.stroke();
    }
    ctx.globalAlpha=1;

    ctx.save();
    ctx.translate(a.x,a.y);
    ctx.rotate(a.rot);

    ctx.strokeStyle='#4f3827';ctx.lineWidth=7;
    ctx.beginPath();ctx.moveTo(-34,0);ctx.lineTo(24,0);ctx.stroke();

    ctx.fillStyle='#c5cfd0';
    ctx.beginPath();
    ctx.moveTo(43,0);ctx.lineTo(21,-10);ctx.lineTo(26,0);ctx.lineTo(21,10);ctx.closePath();ctx.fill();

    ctx.fillStyle='#743d2e';
    ctx.beginPath();
    ctx.moveTo(-25,0);ctx.lineTo(-40,-11);ctx.lineTo(-34,0);ctx.lineTo(-40,11);ctx.closePath();ctx.fill();

    ctx.restore();
    return;
  }

  const lvl=a.level||1;

  const colors={
    1:{shaft:'#7a5632',head:'#bfc4c5',trail:'#d9c8a3',feather:'#765238'},
    2:{shaft:'#6b4f32',head:'#e3e8e8',trail:'#f1efe1',feather:'#d4d7d8'},
    3:{shaft:'#4e5d62',head:'#a9d0df',trail:'#92c8dc',feather:'#5e8fa1'},
    4:{shaft:'#8d3f27',head:'#ff9c3e',trail:'#ff632e',feather:'#d94e27'},
    5:{shaft:'#2c718e',head:'#a9efff',trail:'#4ac6ff',feather:'#68d8ff'}
  };
  const c=colors[Math.min(lvl,5)]||colors[5];

  // Strong, visible colored trail starting at level 2.
  if(lvl>=2){
    for(const tr of a.trail){
      ctx.globalAlpha=tr.life/.12*(lvl>=4?.72:.48);
      ctx.strokeStyle=c.trail;
      ctx.lineWidth=lvl>=4?3:2;
      ctx.beginPath();ctx.moveTo(tr.x-13,tr.y);ctx.lineTo(tr.x,tr.y);ctx.stroke();
    }
  }
  ctx.globalAlpha=1;

  ctx.save();ctx.translate(a.x,a.y);ctx.rotate(a.rot);

  ctx.strokeStyle=c.shaft;
  ctx.lineWidth=lvl>=4?3:2.4;
  ctx.beginPath();ctx.moveTo(-15,0);ctx.lineTo(10,0);ctx.stroke();

  // colored wrapping around shaft makes the upgrade visible even without trail
  if(lvl>=2){
    ctx.fillStyle=c.trail;
    ctx.fillRect(-5,-2,8,4);
  }

  ctx.fillStyle=c.head;
  if(lvl>=4){ctx.shadowBlur=10;ctx.shadowColor=c.trail;}
  ctx.beginPath();
  if(lvl<=2){
    ctx.moveTo(17,0);ctx.lineTo(7,-5);ctx.lineTo(8,0);ctx.lineTo(7,5);
  }else{
    ctx.moveTo(19,0);ctx.lineTo(8,-7);ctx.lineTo(11,-1);ctx.lineTo(7,0);ctx.lineTo(11,1);ctx.lineTo(8,7);
  }
  ctx.closePath();ctx.fill();
  ctx.shadowBlur=0;

  // fire / enchanted cores
  if(lvl===4){
    ctx.fillStyle='#ff642d';ctx.shadowBlur=12;ctx.shadowColor='#ff642d';
    ctx.beginPath();ctx.arc(-10,0,5+Math.sin(time*13)*1.2,0,TAU);ctx.fill();
    ctx.fillStyle='#ffd55c';ctx.beginPath();ctx.arc(-10,0,2.3,0,TAU);ctx.fill();
    ctx.shadowBlur=0;
  }
  if(lvl>=5){
    ctx.fillStyle='#9aeaff';ctx.shadowBlur=12;ctx.shadowColor='#54cfff';
    ctx.beginPath();ctx.arc(-4,0,3.6+Math.sin(time*10)*.7,0,TAU);ctx.fill();
    ctx.shadowBlur=0;
  }

  ctx.fillStyle=c.feather;
  ctx.beginPath();
  ctx.moveTo(-12,0);ctx.lineTo(-19,-5);ctx.lineTo(-16,0);ctx.lineTo(-19,5);ctx.closePath();ctx.fill();

  ctx.restore();
}
function drawEnemyArrow(a){
  for(const tr of a.trail){
    ctx.globalAlpha=tr.life/.11*.24;
    ctx.strokeStyle='#a98760';ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(tr.x+8,tr.y);ctx.lineTo(tr.x,tr.y);ctx.stroke();
  }
  ctx.globalAlpha=1;

  ctx.save();
  ctx.translate(a.x,a.y);
  ctx.rotate(a.rot);

  ctx.strokeStyle='#67472a';ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(-12,0);ctx.lineTo(10,0);ctx.stroke();

  ctx.fillStyle='#929899';
  ctx.beginPath();ctx.moveTo(14,0);ctx.lineTo(7,-4);ctx.lineTo(7,4);ctx.closePath();ctx.fill();

  ctx.fillStyle='#596b3e';
  ctx.beginPath();ctx.moveTo(-11,0);ctx.lineTo(-17,-4);ctx.lineTo(-15,0);ctx.lineTo(-17,4);ctx.closePath();ctx.fill();
  ctx.restore();
}

function drawCloud(c){
  ctx.save();ctx.translate(c.x,c.y);
  ctx.globalAlpha=clamp(c.life/.5,0,1);
  ctx.fillStyle='#4d5669';
  for(const [x,y,r] of [[-29,7,22],[-10,-4,29],[17,2,25],[37,9,18]]){
    ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill();
  }
  ctx.fillStyle='#666f82';ctx.beginPath();ctx.ellipse(3,11,55,19,0,0,TAU);ctx.fill();
  ctx.fillStyle='rgba(236,246,255,.25)';ctx.fillRect(-18,8,44,3);
  const charge=clamp(1-c.strike/.22,0,1);
  if(charge>0){
    const glow=ctx.createRadialGradient(0,18,2,0,18,44);
    glow.addColorStop(0,`rgba(163,221,255,${charge*.6})`);glow.addColorStop(1,'rgba(117,185,255,0)');
    ctx.fillStyle=glow;ctx.fillRect(-44,-26,88,88);
  }
  ctx.restore();
}
function drawLightning(l){
  ctx.save();
  ctx.globalAlpha=clamp(l.life/.13,0,1);
  ctx.strokeStyle='#86c9ff';ctx.lineWidth=7;ctx.shadowBlur=17;ctx.shadowColor='#9ddaff';
  ctx.beginPath();ctx.moveTo(l.x1,l.y1);
  for(let i=1;i<6;i++){
    const t=i/6;
    ctx.lineTo(lerp(l.x1,l.x2,t)+(hash01(i*17+l.x1*.13+l.y2*.19)-.5)*36,lerp(l.y1,l.y2,t));
  }
  ctx.lineTo(l.x2,l.y2);ctx.stroke();
  ctx.strokeStyle='#f1fbff';ctx.lineWidth=2;ctx.shadowBlur=0;ctx.stroke();
  const r=12+(1-clamp(l.life/.13,0,1))*20;
  ctx.strokeStyle='#bce8ff';ctx.lineWidth=1.5;
  ctx.beginPath();ctx.ellipse(l.x2,l.y2,r,r*.35,0,0,TAU);ctx.stroke();
  ctx.restore();
}
function drawParticles(){
  for(const p of particles){
    ctx.globalAlpha=clamp(p.life/.45,0,1);
    ctx.fillStyle=p.color;
    ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rot);
    ctx.fillRect(-p.size/2,-p.size/2,p.size,p.size);
    ctx.restore();
  }
  ctx.globalAlpha=1;
  ctx.textAlign='center';
  for(const tx of texts){
    ctx.globalAlpha=clamp(tx.life*2,0,1);
    ctx.fillStyle=tx.color;
    ctx.font=`900 ${tx.size}px Inter, sans-serif`;
    ctx.fillText(tx.text,tx.x,tx.y);
  }
  ctx.globalAlpha=1;
}

function drawWavePause(){
  if(game.wavePause>0&&game.spawned>=game.waveTotal&&enemies.length===0){
    const w=280,h=60,x=W/2-w/2,y=H*.23-h/2;
    ctx.fillStyle='rgba(10,18,28,.82)';rr(x,y,w,h,15);ctx.fill();
    ctx.strokeStyle='rgba(255,255,255,.12)';ctx.stroke();
    ctx.fillStyle='#fff';ctx.textAlign='center';ctx.font='900 18px Inter, sans-serif';
    ctx.fillText(`Наступна хвиля через ${Math.ceil(game.wavePause)}`,W/2,y+36);
  }
}

// ---------------- DRAW LOOP ----------------
function draw(){
  prepareNightLights();
  // Everything architectural/environmental remains rock solid.
  drawSky();
  drawRiver();
  drawRoadTraps();
  drawNightRoadLights();
  drawSeasonMotes(false);
  drawCastle();
  drawContactShadows();
  drawVisualParticles(true);
  for(const k of knights)drawKnight(k);

  // Only active combat elements receive impact shake.
  ctx.save();
  if(game.shake>0){
    // Very subtle combat-only shake. Castle/background are outside this transform.
    const sx=Math.sin(time*47)*game.shake*.18;
    const sy=Math.cos(time*39)*game.shake*.07;
    ctx.translate(sx,sy);
  }

  for(const c of clouds)drawCloud(c);

  const sorted=[...enemies].sort((a,b)=>a.y-b.y);
  for(const e of sorted)drawGoblin(e);

  for(const a of arrows)drawArrow(a);
  for(const a of enemyArrows)drawEnemyArrow(a);
  for(const s of stones)drawStone(s);
  for(const l of lightnings)drawLightning(l);
  drawParticles();
  drawVisualParticles(false);
  ctx.restore();

  drawSeasonMotes(true);
  drawWavePause();

  // random event atmosphere
  if(game.event==='fog'){
    const fg=ctx.createLinearGradient(0,H*.28,0,H);
    fg.addColorStop(0,'rgba(220,228,224,0)');
    fg.addColorStop(.6,'rgba(220,228,224,.15)');
    fg.addColorStop(1,'rgba(220,228,224,.25)');
    ctx.fillStyle=fg;ctx.fillRect(0,0,W,H);
  }else if(game.event==='storm'){
    ctx.fillStyle='rgba(31,45,62,.20)';ctx.fillRect(0,0,W,H);
    if(Math.sin(time*7)>.985){
      ctx.fillStyle='rgba(235,246,255,.16)';ctx.fillRect(0,0,W,H);
    }
  }else if(game.event==='blizzard'){
    ctx.fillStyle='rgba(220,235,240,.10)';ctx.fillRect(0,0,W,H);
  }else if(game.event==='elite'){
    ctx.fillStyle='rgba(110,18,20,.07)';ctx.fillRect(0,0,W,H);
  }else if(game.event==='gold'){
    ctx.fillStyle='rgba(255,197,67,.07)';ctx.fillRect(0,0,W,H);
  }

  const vg=ctx.createRadialGradient(W/2,H/2,Math.min(W,H)*.35,W/2,H/2,Math.max(W,H)*.8);
  vg.addColorStop(0,'rgba(0,0,0,0)');
  vg.addColorStop(1,'rgba(0,0,0,.18)');
  ctx.fillStyle=vg;ctx.fillRect(0,0,W,H);

  if(game.flash>0){
    ctx.fillStyle=`rgba(235,245,255,${game.flash*.75})`;
    ctx.fillRect(0,0,W,H);
  }
}
