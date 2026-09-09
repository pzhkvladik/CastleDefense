// Night is a separately lit scene, not a screen-wide darkening filter.
const NIGHT_PALETTE={skyTop:'#070e20',skyMid:'#14233e',skyLow:'#293d58',skyBottom:'#40516a',
  hill:'#293e55',hill2:'#142637',ground1:'#293e3e',ground2:'#14262e',treeA:'#193234',treeB:'#11292e'};
const NIGHT_LIGHT_LIMIT=12;
const nightLights=[];
function mixLightColor(a,b,t){
  const rgb=c=>c[0]==='#'?[parseInt(c.slice(1,3),16),parseInt(c.slice(3,5),16),parseInt(c.slice(5,7),16)]:c.match(/[\d.]+/g).slice(0,3).map(Number);
  const from=rgb(a),to=rgb(b);
  return `rgb(${from.map((v,i)=>Math.round(lerp(v,to[i],t))).join(',')})`;
}
function nightColor(day,night){return visual.night<.001?day:mixLightColor(day,night,visual.night);}
function isTorchBearer(e){return !e.flying&&unitVisual(e).torch;}
function prepareNightLights(){
  nightLights.length=0;
  if(visual.night<.001)return;
  for(const e of enemies){
    if(e.dead||!isTorchBearer(e)||e.x<-70||e.x>W+70)continue;
    nightLights.push({e,x:e.x+30*e.scale,y:groundY()-7-65*e.scale,
      strength:.92+Math.sin(visual.clock*8+unitVisual(e).seed)*.08});
    if(nightLights.length>=NIGHT_LIGHT_LIMIT)break;
  }
}
function torchWarmthAt(x){
  let strength=0;
  for(const light of nightLights)strength=Math.max(strength,clamp(1-Math.abs(x-light.x)/125,0,1)*light.strength);
  return strength*visual.night;
}
function litEnemySeason(e,season){
  if(visual.night<.001)return season;
  const warmth=torchWarmthAt(e.x),result={...season};
  result.goblinSkin=mixLightColor(nightColor(season.goblinSkin,'#5c7d79'),'#b4a35c',warmth*.75);
  result.goblinDark=mixLightColor(nightColor(season.goblinDark,'#3b5d60'),'#8d793d',warmth*.7);
  result.cloth=mixLightColor(nightColor(season.cloth,'#293342'),'#715035',warmth*.6);
  return result;
}
function lightPool(x,y,rx,ry,strength,color='255,157,57'){
  ctx.save();ctx.translate(x,y);ctx.scale(rx,ry);
  const light=ctx.createRadialGradient(0,0,0,0,0,1);
  light.addColorStop(0,`rgba(${color},${strength})`);
  light.addColorStop(.3,`rgba(${color},${strength*.62})`);
  light.addColorStop(1,`rgba(${color},0)`);
  ctx.globalCompositeOperation='screen';ctx.fillStyle=light;
  ctx.fillRect(-1,-1,2,2);ctx.restore();
}
function drawNightSky(){
  const n=visual.night;if(n<.001)return;
  const gy=groundY(),mx=W*.79,my=Math.max(85,H*.19),radius=clamp(H*.045,19,32);
  ctx.save();
  lightPool(W*.48,gy*.24,W*.4,gy*.25,n*.035,'130,163,226');
  for(let i=0;i<112;i++){
    const x=hash01(i+931)*W,y=18+hash01(i+1327)*gy*.49;
    if(Math.hypot(x-mx,y-my)<radius*1.5)continue;
    const size=.45+hash01(i+431)*1.05;
    const twinkle=.76+Math.sin(visual.clock*(.55+hash01(i+122))+i)*.14;
    ctx.globalAlpha=n*twinkle*(.45+hash01(i+61)*.5);
    ctx.fillStyle=i%5===0?'#bdd7ff':'#e2eaff';
    ctx.beginPath();ctx.arc(x,y,size,0,TAU);ctx.fill();
    if(i%19===0){
      ctx.strokeStyle='#b6d7ff';ctx.lineWidth=.6;
      ctx.beginPath();ctx.moveTo(x-3,y);ctx.lineTo(x+3,y);ctx.moveTo(x,y-3);ctx.lineTo(x,y+3);ctx.stroke();
    }
  }
  ctx.globalAlpha=n;
  lightPool(mx,my,radius*3.6,radius*3.6,n*.14,'162,193,238');
  const moon=ctx.createRadialGradient(mx-radius*.4,my-radius*.4,1,mx,my,radius);
  moon.addColorStop(0,'#f3f1d9');moon.addColorStop(.65,'#d7e1dc');moon.addColorStop(1,'#9db5c8');
  ctx.fillStyle=moon;ctx.beginPath();ctx.arc(mx,my,radius,0,TAU);ctx.fill();
  ctx.save();ctx.beginPath();ctx.arc(mx,my,radius,0,TAU);ctx.clip();
  ctx.fillStyle='rgba(91,125,159,.16)';
  for(let i=0;i<8;i++){
    const angle=hash01(i+773)*TAU,r=hash01(i+423)*radius*.74;
    ctx.beginPath();ctx.ellipse(mx+Math.cos(angle)*r,my+Math.sin(angle)*r,2+hash01(i+855)*4,2+hash01(i+226)*3,.3,0,TAU);ctx.fill();
  }
  const terminator=ctx.createLinearGradient(mx-radius,my,mx+radius,my);
  terminator.addColorStop(0,'rgba(15,35,62,.48)');terminator.addColorStop(.6,'rgba(15,35,62,0)');
  ctx.fillStyle=terminator;ctx.fillRect(mx-radius,my-radius,radius*2,radius*2);ctx.restore();
  ctx.strokeStyle='rgba(213,232,250,.4)';ctx.lineWidth=.8;ctx.beginPath();ctx.arc(mx,my,radius,0,TAU);ctx.stroke();
  ctx.restore();
}
function drawNightRoadLights(){
  const n=visual.night;if(n<.001)return;
  const gy=groundY();
  ctx.save();ctx.beginPath();ctx.rect(0,gy-13,W,H-gy+13);ctx.clip();
  lightPool(gateX()+24,gy+17,155,64,n*.36);
  for(const light of nightLights){
    const scale=clamp(light.e.scale,.7,1.5);
    const overlap=nightLights.filter(other=>Math.abs(other.x-light.x)<110).length;
    lightPool(light.x,gy+14,118*scale,43*scale,n*.37*light.strength/Math.sqrt(overlap));
    const rb=riverBounds();
    if(game.river&&light.x>rb.left-40&&light.x<rb.right+40){
      ctx.save();ctx.beginPath();ctx.rect(rb.left,gy,rb.width,H-gy);ctx.clip();
      ctx.fillStyle=`rgba(255,193,95,${n*.2})`;
      for(let i=0;i<5;i++){
        const width=9+i*5;ctx.fillRect(light.x-width/2+Math.sin(visual.clock*2+i)*7,gy+14+i*9,width,1.2);
      }
      ctx.restore();
    }
  }
  ctx.restore();
}
function drawTorchFlame(x,y,seed=0,power=1){
  const sway=Math.sin(visual.clock*9+seed)*2.2+Math.sin(visual.clock*5+seed)*1.1;
  ctx.save();ctx.translate(x,y);const opacity=ctx.globalAlpha*power;ctx.globalAlpha=opacity;
  lightPool(0,-6,35,43,.23);
  ctx.fillStyle='#ff782e';ctx.beginPath();ctx.moveTo(-5,2);
  ctx.bezierCurveTo(-11,-7,3+sway,-17,sway-2,-26);
  ctx.bezierCurveTo(12+sway,-13,9,-2,5,2);ctx.closePath();ctx.fill();
  ctx.fillStyle='#ffd36a';ctx.beginPath();ctx.moveTo(-3,2);
  ctx.quadraticCurveTo(-7,-6,sway+2,-17);ctx.quadraticCurveTo(7,-7,3,2);ctx.closePath();ctx.fill();
  ctx.fillStyle='#fff1bd';ctx.beginPath();ctx.ellipse(0,-1,2,5,0,0,TAU);ctx.fill();
  // Fixed-count embers: no particle allocations or gameplay RNG.
  for(let i=0;i<3;i++){
    const t=(visual.clock*.65+i/3+hash01(seed))%1;
    ctx.globalAlpha=opacity*(1-t)*.65;ctx.fillStyle='#ffc978';
    ctx.fillRect(Math.sin(t*5+seed+i)*7,-13-t*37,1.3,1.8);
  }
  ctx.restore();
}
function drawGoblinTorch(e){
  const n=visual.night;
  ctx.save();
  // Raised torch takes the axe's visual slot; attacks and stats are untouched.
  ctx.strokeStyle='#69462b';ctx.lineWidth=4;ctx.lineCap='round';
  ctx.beginPath();ctx.moveTo(27,-19);ctx.lineTo(31,-61);ctx.stroke();
  ctx.strokeStyle='#aa8b53';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(26,-51);ctx.lineTo(35,-51);ctx.moveTo(27,-55);ctx.lineTo(35,-55);ctx.stroke();
  ctx.fillStyle='#393132';ctx.fillRect(26,-64,10,8);
  drawTorchFlame(31,-63,unitVisual(e).seed,n);
  ctx.strokeStyle=`rgba(255,201,113,${n*.6})`;ctx.lineWidth=1.5;
  ctx.beginPath();ctx.arc(0,-49,17,-1.15,.48);ctx.moveTo(12,-30);ctx.lineTo(15,-18);ctx.stroke();
  ctx.restore();
}
function drawNightCastleLights(x,gy){
  const n=visual.night;if(n<.001)return;
  ctx.save();
  for(const [wx,wy] of [[x-134,gy-251],[x+125,gy-231]]){
    lightPool(wx,wy,32,42,n*.24);
    ctx.fillStyle=`rgba(255,199,98,${n*.9})`;ctx.fillRect(wx-3,wy-7,6,14);
  }
  for(const sx of [gateX()-48,gateX()+48]){
    lightPool(sx,gy-88,68,93,n*.22);
    ctx.globalAlpha=n;
    ctx.strokeStyle='#252b31';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(sx,gy-62);ctx.lineTo(sx,gy-91);ctx.stroke();
    ctx.fillStyle='#a18456';ctx.fillRect(sx-7,gy-96,14,5);
    drawTorchFlame(sx,gy-97,sx,.95);
  }
  ctx.globalAlpha=n;ctx.strokeStyle='rgba(149,185,218,.35)';ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(x+167,gy-293);ctx.lineTo(x+167,gy-10);ctx.moveTo(x-165,gy-319);ctx.lineTo(x-165,gy-12);ctx.stroke();
  ctx.restore();
}
