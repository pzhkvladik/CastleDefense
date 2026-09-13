// Calm, layered storm presentation. This module never touches combat state or Math.random().
const STORM_CYCLE=9.5;

function stormStrikeTiming(clock=visual.weatherClock){
  const cycle=Math.floor(clock/STORM_CYCLE);
  const strikeAt=3.15;
  return {cycle,phase:clock-cycle*STORM_CYCLE,strikeAt};
}

function stormFlashAmount(clock=visual.weatherClock){
  const {phase,strikeAt}=stormStrikeTiming(clock);
  const delta=phase-strikeAt;
  if(delta>=0&&delta<.09)return .12*(1-delta/.09);
  if(delta>=.18&&delta<.25)return .045*(1-(delta-.18)/.07);
  return 0;
}

function drawStormBackdrop(){
  if(game.event!=='storm')return;
  const gy=groundY(),clock=visual.weatherClock;
  ctx.save();

  // Cool haze lives only over the landscape; units and HUD stay readable.
  const haze=ctx.createLinearGradient(0,0,0,gy);
  haze.addColorStop(0,'rgba(34,43,54,.48)');
  haze.addColorStop(.58,'rgba(58,69,76,.25)');
  haze.addColorStop(1,'rgba(66,76,77,.08)');
  ctx.fillStyle=haze;ctx.fillRect(0,0,W,gy);

  // Slow cloud banks with three depth tones instead of a flat dark overlay.
  const layers=[
    {y:.055,scale:1.25,color:'rgba(42,48,57,.91)',speed:3.0},
    {y:.135,scale:.94,color:'rgba(67,73,80,.84)',speed:5.1},
    {y:.225,scale:.70,color:'rgba(91,97,101,.52)',speed:7.2}
  ];
  for(let layerIndex=0;layerIndex<layers.length;layerIndex++){
    const layer=layers[layerIndex];
    for(let i=-1;i<6;i++){
      const seed=layerIndex*29+i+6100;
      const span=W+320;
      const cx=((i*270+hash01(seed)*115-clock*layer.speed)%span+span)%span-125;
      const cy=H*layer.y+hash01(seed+17)*42;
      const z=layer.scale*(.83+hash01(seed+33)*.28);
      ctx.fillStyle=layer.color;
      ctx.beginPath();
      ctx.ellipse(cx,cy,91*z,27*z,0,0,TAU);
      ctx.ellipse(cx-68*z,cy+7*z,59*z,24*z,0,0,TAU);
      ctx.ellipse(cx+55*z,cy-13*z,65*z,36*z,0,0,TAU);
      ctx.ellipse(cx+111*z,cy+7*z,49*z,23*z,0,0,TAU);
      ctx.fill();
      ctx.fillStyle='rgba(20,28,36,.16)';
      ctx.beginPath();ctx.ellipse(cx+12*z,cy+18*z,118*z,18*z,0,0,TAU);ctx.fill();
    }
  }

  // One distant bolt per ten-second cycle, with a very soft local sky glow.
  const flash=stormFlashAmount(clock);
  if(flash>0){
    const {cycle}=stormStrikeTiming(clock);
    const bx=W*(.48+hash01(cycle+9100)*.40),top=H*(.16+hash01(cycle+9200)*.08);
    const glow=ctx.createRadialGradient(bx,top+90,8,bx,top+90,190);
    glow.addColorStop(0,`rgba(199,220,235,${flash*.9})`);
    glow.addColorStop(1,'rgba(171,200,220,0)');
    ctx.fillStyle=glow;ctx.fillRect(bx-200,top-75,400,340);

    const points=[[bx,top]];
    let px=bx,py=top;
    for(let i=0;i<6;i++){
      px+=(hash01(cycle*17+i+9300)-.5)*34;
      py+=24+hash01(cycle*23+i+9400)*17;
      points.push([px,py]);
    }
    ctx.lineJoin='round';ctx.lineCap='round';
    ctx.strokeStyle=`rgba(154,190,215,${Math.min(.34,flash*2.7)})`;ctx.lineWidth=7;
    ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();
    ctx.strokeStyle=`rgba(232,244,249,${Math.min(.82,flash*6.8)})`;ctx.lineWidth=2;
    ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();

    // A short fork makes the background strike recognizable, never screen-filling.
    const fork=points[3];
    ctx.strokeStyle=`rgba(202,226,239,${Math.min(.55,flash*4.4)})`;ctx.lineWidth=1.5;
    ctx.beginPath();ctx.moveTo(fork[0],fork[1]);
    ctx.lineTo(fork[0]+26,fork[1]+22);ctx.lineTo(fork[0]+19,fork[1]+49);ctx.stroke();
  }
  ctx.restore();
}

function drawStormPuddles(){
  if(game.event!=='storm')return;
  const gy=groundY(),clock=visual.weatherClock;
  ctx.save();
  for(let i=0;i<9;i++){
    const x=gateX()+95+hash01(i+10200)*Math.max(80,W-gateX()-130);
    const y=gy+14+hash01(i+10300)*Math.max(8,H-gy-22);
    const rx=18+hash01(i+10400)*38,ry=3+hash01(i+10500)*4;
    ctx.fillStyle='rgba(52,71,80,.28)';
    ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,TAU);ctx.fill();
    ctx.strokeStyle='rgba(176,195,199,.16)';ctx.lineWidth=1;
    ctx.beginPath();ctx.ellipse(x-rx*.15,y-1,rx*.48,Math.max(1,ry*.35),0,Math.PI,TAU);ctx.stroke();

    const ripple=(clock*1.15+hash01(i+10600)*3)%1;
    if(ripple<.28){
      ctx.globalAlpha=(1-ripple/.28)*.32;
      ctx.beginPath();ctx.ellipse(x+rx*.28,y-1,3+ripple*34,1+ripple*8,0,0,TAU);ctx.stroke();
      ctx.globalAlpha=1;
    }
  }
  ctx.restore();
}

function drawStormRain(foreground=false){
  if(game.event!=='storm')return;
  const clock=visual.weatherClock,count=foreground?62:95;
  ctx.save();ctx.lineCap='round';
  ctx.strokeStyle=foreground?'rgba(205,221,226,.36)':'rgba(181,201,209,.20)';
  ctx.lineWidth=foreground?1.35:.8;
  ctx.beginPath();
  for(let i=0;i<count;i++){
    const seed=i+(foreground?12100:11100);
    const speed=(foreground?690:470)+hash01(seed+7)*170;
    const y=(hash01(seed+19)*(H+90)+clock*speed)%(H+90)-45;
    const drift=clock*(foreground?92:61);
    const x=((hash01(seed)*W-drift+y*.10)%(W+50)+W+50)%(W+50)-25;
    const length=(foreground?14:9)+hash01(seed+31)*(foreground?11:7);
    ctx.moveTo(x,y);ctx.lineTo(x-4-length*.18,y+length);
  }
  ctx.stroke();ctx.restore();
}
