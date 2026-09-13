// First-moat construction is a presentation-only vignette. The moat's combat
// effect starts immediately; this sequence never changes timers, damage or targets.
function startMoatConstruction(){
  visual.moatBuild={t:0};
}

function moatConstructionWaterLevel(){
  return visual.moatBuild?clamp((visual.moatBuild.t-6.52)/.68,0,1):1;
}

function moatConstructionShowsAlligators(){
  return !visual.moatBuild||visual.moatBuild.t>=10.85;
}

function smoothStep01(t){
  t=clamp(t,0,1);return t*t*(3-2*t);
}

function drawPeasant(x,feetY,{phase=0,facing=1,tool='',action=0,happy=false,pour=false}={}){
  const walk=tool==='dig'?0:Math.sin(phase)*5;
  const dig=tool==='dig'?Math.sin(action*Math.PI*2):0;
  const hop=happy?Math.abs(Math.sin(phase*1.3))*5:0;
  ctx.save();ctx.translate(x,feetY-hop);ctx.scale(facing,1);

  ctx.fillStyle='rgba(0,0,0,.26)';ctx.beginPath();ctx.ellipse(0,4,15,4,0,0,TAU);ctx.fill();
  ctx.strokeStyle='#493326';ctx.lineWidth=5;ctx.lineCap='round';
  ctx.beginPath();ctx.moveTo(-5,-15);ctx.lineTo(-7+walk,-1);ctx.moveTo(5,-15);ctx.lineTo(7-walk,-1);ctx.stroke();
  ctx.strokeStyle='#211a16';ctx.lineWidth=4;
  ctx.beginPath();ctx.moveTo(-10+walk,-1);ctx.lineTo(-3+walk,-1);ctx.moveTo(4-walk,-1);ctx.lineTo(12-walk,-1);ctx.stroke();

  ctx.fillStyle='#7b5938';
  ctx.beginPath();ctx.moveTo(-11,-39);ctx.lineTo(11,-39);ctx.lineTo(14,-13);ctx.lineTo(-13,-13);ctx.closePath();ctx.fill();
  ctx.fillStyle='#a33e35';ctx.fillRect(-12,-26,25,5);
  ctx.fillStyle='#dac18b';ctx.beginPath();ctx.arc(0,-48,10,0,TAU);ctx.fill();
  ctx.fillStyle='#5b3826';
  ctx.beginPath();ctx.moveTo(-12,-53);ctx.quadraticCurveTo(-3,-67,10,-56);ctx.lineTo(11,-52);ctx.closePath();ctx.fill();
  ctx.fillStyle='#34241d';ctx.fillRect(3,-49,2,2);
  ctx.beginPath();ctx.arc(10,-45,3,0,TAU);ctx.fill();

  if(happy){
    ctx.strokeStyle='#d6bb85';ctx.lineWidth=4;
    ctx.beginPath();ctx.moveTo(-9,-34);ctx.lineTo(-19,-49);ctx.lineTo(-15,-58);
    ctx.moveTo(9,-34);ctx.lineTo(19,-49);ctx.lineTo(16,-59);ctx.stroke();
    ctx.strokeStyle='#4a261d';ctx.lineWidth=1.5;
    ctx.beginPath();ctx.arc(4,-44,5,.15,1.25);ctx.stroke();
  }else if(tool==='carry'){
    ctx.strokeStyle='#d6bb85';ctx.lineWidth=4;
    ctx.beginPath();ctx.moveTo(-8,-34);ctx.lineTo(-14,-54);ctx.lineTo(-4,-64);
    ctx.moveTo(8,-34);ctx.lineTo(14,-54);ctx.lineTo(5,-64);ctx.stroke();
  }else{
    const arm=tool==='dig'?dig*8:walk*.35;
    ctx.strokeStyle='#d6bb85';ctx.lineWidth=4;
    ctx.beginPath();ctx.moveTo(-8,-34);ctx.lineTo(-15,-23-arm*.2);
    ctx.moveTo(8,-34);ctx.lineTo(16,-23+arm*.2);ctx.stroke();
  }

  if(tool==='dig'){
    ctx.save();ctx.translate(13,-29);ctx.rotate(-.48+dig*.55);
    ctx.strokeStyle='#6c4a2c';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(0,-21);ctx.lineTo(0,24);ctx.stroke();
    ctx.fillStyle='#8c9290';ctx.beginPath();ctx.moveTo(-7,21);ctx.lineTo(7,21);ctx.lineTo(10,33);ctx.lineTo(-10,33);ctx.closePath();ctx.fill();
    ctx.restore();
  }else if(tool==='bucket'){
    ctx.save();ctx.translate(15,-18);ctx.rotate(pour?.75:0);
    ctx.fillStyle='#6f5033';ctx.fillRect(-8,-3,17,15);
    ctx.strokeStyle='#c4a66b';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,-2,8,Math.PI,TAU);ctx.stroke();
    ctx.fillStyle='#74bacc';ctx.fillRect(-6,-1,13,3);ctx.restore();
  }
  ctx.restore();
}

function drawBoundAlligator(x,y,rotation=0,scale=1){
  ctx.save();ctx.translate(x,y);ctx.rotate(rotation);ctx.scale(scale,scale);
  ctx.fillStyle='#476f3e';ctx.beginPath();ctx.ellipse(-5,0,39,13,0,0,TAU);ctx.fill();
  ctx.beginPath();ctx.moveTo(-34,-6);ctx.lineTo(-66,3);ctx.lineTo(-34,7);ctx.closePath();ctx.fill();
  ctx.fillStyle='#75984f';
  for(let i=0;i<5;i++){
    const px=-29+i*13;
    ctx.beginPath();ctx.moveTo(px,-9);ctx.lineTo(px+6,-18-(i%2)*3);ctx.lineTo(px+11,-9);ctx.closePath();ctx.fill();
  }
  ctx.strokeStyle='#35512f';ctx.lineWidth=5;
  ctx.beginPath();ctx.moveTo(-24,8);ctx.lineTo(-29,17);ctx.moveTo(-4,9);ctx.lineTo(-6,18);
  ctx.moveTo(15,7);ctx.lineTo(19,16);ctx.stroke();
  ctx.fillStyle='#5f8b4c';
  ctx.beginPath();ctx.ellipse(34,-1,22,11,0,0,TAU);ctx.fill();
  ctx.fillStyle='#dce39d';
  ctx.beginPath();ctx.arc(26,-10,5,0,TAU);ctx.arc(39,-10,5,0,TAU);ctx.fill();
  ctx.fillStyle='#202418';ctx.beginPath();ctx.arc(27,-10,2,0,TAU);ctx.arc(40,-10,2,0,TAU);ctx.fill();
  // Broad cloth binding makes the gag readable and keeps the comedy gentle.
  ctx.fillStyle='#d2aa69';ctx.fillRect(35,-8,22,15);
  ctx.strokeStyle='#705337';ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(37,-9);ctx.lineTo(51,8);ctx.moveTo(51,-9);ctx.lineTo(38,8);ctx.stroke();
  ctx.fillStyle='#799b55';
  for(let i=0;i<5;i++){
    const px=-27+i*13;
    ctx.beginPath();ctx.moveTo(px,-9);ctx.lineTo(px+6,-18-(i%2)*3);ctx.lineTo(px+11,-8);ctx.closePath();ctx.fill();
  }
  ctx.strokeStyle='#355532';ctx.lineWidth=5;ctx.lineCap='round';
  ctx.beginPath();ctx.moveTo(-22,8);ctx.lineTo(-28,17);ctx.moveTo(9,8);ctx.lineTo(15,17);ctx.stroke();
  ctx.restore();
}

function drawMoatConstruction(){
  const build=visual.moatBuild;if(!build)return;
  const t=build.t,gy=groundY(),b=riverBounds(),gate=gateX()+18;
  ctx.save();

  // Fresh earth remains beside the trench until the water is poured.
  if(t>1.25&&t<7.25){
    const amount=clamp((t-1.25)/2.1,0,1)*(1-clamp((t-6.65)/.6,0,1));
    ctx.globalAlpha=amount;ctx.fillStyle='#5a4029';
    for(const side of [-1,1]){
      const x=side<0?b.left-25:b.right+25;
      ctx.beginPath();ctx.ellipse(x,gy-2,38,9,0,0,TAU);ctx.fill();
      ctx.fillStyle='#80603b';ctx.beginPath();ctx.ellipse(x-8,gy-5,22,7,0,0,TAU);ctx.fill();ctx.fillStyle='#5a4029';
    }
    ctx.globalAlpha=1;
  }

  if(t<1.7){
    const q=smoothStep01(t/1.7);
    for(let i=0;i<4;i++){
      const target=b.left-45+i*(b.width+90)/3;
      drawPeasant(lerp(gate-i*13,target,q),gy,{phase:t*10+i,facing:1,tool:'dig',action:t*1.4+i*.2});
    }
  }else if(t<4.9){
    const q=t-1.7;
    for(let i=0;i<4;i++){
      const x=b.left-45+i*(b.width+90)/3;
      drawPeasant(x,gy,{phase:i,tool:'dig',action:q*1.7+i*.19});
      const puff=(q*2.2+i*.23)%1;
      if(puff<.3){
        ctx.globalAlpha=(1-puff/.3)*.26;ctx.fillStyle='#b69a6a';
        ctx.beginPath();ctx.ellipse(x+18,gy-5-puff*13,5+puff*11,3+puff*5,0,0,TAU);ctx.fill();ctx.globalAlpha=1;
      }
    }
  }else if(t<7.2){
    const q=(t-4.9)/2.3,move=smoothStep01(Math.min(1,q/.72));
    for(let i=0;i<3;i++){
      const target=b.left-42+i*34,x=lerp(gate-i*16,target,move),pour=q>.72;
      drawPeasant(x,gy,{phase:t*9+i,facing:1,tool:'bucket',pour});
      if(pour){
        const streamX=x+19;
        ctx.strokeStyle='rgba(115,194,214,.72)';ctx.lineWidth=4;
        ctx.beginPath();ctx.moveTo(streamX,gy-10);ctx.quadraticCurveTo(streamX+8,gy+2,clamp(streamX+20,b.left,b.right),gy+21);ctx.stroke();
      }
    }
  }else if(t<10.35){
    const q=smoothStep01((t-7.2)/3.15),center=lerp(gate+45,b.left-35,q);
    const bounce=Math.abs(Math.sin(t*8))*3;
    for(let i=0;i<3;i++)drawPeasant(center-34+i*34,gy,{phase:t*9+i,facing:1,tool:'carry'});
    drawBoundAlligator(center,gy-72-bounce,Math.sin(t*5)*.025,1);
  }else if(t<11.1){
    const q=(t-10.35)/.75,ease=smoothStep01(q);
    for(let i=0;i<3;i++)drawPeasant(b.left-76+i*31,gy,{phase:t*10+i,facing:1,happy:true});
    const x=lerp(b.left-38,b.center,ease),y=gy-72-Math.sin(q*Math.PI)*70+q*76;
    drawBoundAlligator(x,y,q*.65,1-q*.08);
    if(q>.78){
      ctx.strokeStyle=`rgba(165,226,231,${(q-.78)*2.2})`;ctx.lineWidth=3;
      for(let i=0;i<5;i++){ctx.beginPath();ctx.moveTo(b.center,gy+3);ctx.lineTo(b.center+(i-2)*15,gy-8-Math.abs(i-2)*3);ctx.stroke();}
    }
  }else{
    const q=smoothStep01((t-11.1)/2.3);
    for(let i=0;i<4;i++){
      const start=b.left-45+i*28,end=gate-i*13;
      drawPeasant(lerp(start,end,q),gy,{phase:t*11+i,facing:-1,happy:true});
    }
  }
  ctx.restore();
}
