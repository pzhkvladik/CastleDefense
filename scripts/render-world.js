function drawSky(){
  const gy=groundY();
  const s=visualSeason();

  const sky=ctx.createLinearGradient(0,0,0,gy);
  sky.addColorStop(0,s.skyTop);
  sky.addColorStop(.34,s.skyMid);
  sky.addColorStop(.70,s.skyLow);
  sky.addColorStop(1,s.skyBottom);
  ctx.fillStyle=sky;ctx.fillRect(0,0,W,gy);

  const glow=ctx.createRadialGradient(W*.70,H*.23,10,W*.70,H*.23,H*.48);
  glow.addColorStop(0,`rgba(${Math.round(255-s.winter*31)},${Math.round(229+s.winter*11)},${Math.round(171+s.winter*78)},.28)`);
  glow.addColorStop(1,'rgba(255,225,172,0)');
  ctx.save();ctx.globalAlpha=1-visual.night;ctx.fillStyle=glow;ctx.fillRect(0,0,W,gy);ctx.restore();
  drawNightSky();
  // Broad, quiet light shafts add depth without covering combat information.
  ctx.save();ctx.globalAlpha=1-visual.night;ctx.fillStyle='rgba(255,241,196,.035)';
  for(let i=0;i<3;i++){
    const sx=W*.7+i*45;
    ctx.beginPath();ctx.moveTo(sx,0);ctx.lineTo(sx+24,0);
    ctx.lineTo(sx-80,gy);ctx.lineTo(sx-160,gy);ctx.closePath();ctx.fill();
  }
  ctx.restore();

  // stable cloud banks
  const cloudSets=[
    {x:.18,y:.16,z:1.05,a:.27},
    {x:.52,y:.11,z:.82,a:.17},
    {x:.82,y:.20,z:1.18,a:.24},
    {x:.39,y:.30,z:.67,a:.14}
  ];
  for(const c of cloudSets){
    const cx=W*c.x,cy=H*c.y,z=c.z;
    const cloudCol=`226,234,${Math.round(224+s.winter*15)}`;
    ctx.save();ctx.globalAlpha=c.a*(1-visual.night*.52);
    ctx.fillStyle=nightColor(`rgb(${cloudCol})`,'#637993');
    ctx.beginPath();
    ctx.ellipse(cx,cy,76*z,24*z,0,0,TAU);
    ctx.ellipse(cx-52*z,cy+2*z,48*z,22*z,0,0,TAU);
    ctx.ellipse(cx+46*z,cy-15*z,56*z,32*z,0,0,TAU);
    ctx.ellipse(cx+94*z,cy+2*z,42*z,20*z,0,0,TAU);
    ctx.fill();
    ctx.restore();
  }

  // far mountains
  ctx.fillStyle=s.hill;
  ctx.beginPath();ctx.moveTo(0,gy*.62);
  for(let x=0,idx=0;x<=W+120;x+=105,idx++){
    const peak=38+hash01(idx+11)*74;
    ctx.lineTo(x,gy*.62-peak);
  }
  ctx.lineTo(W,gy);ctx.lineTo(0,gy);ctx.fill();

  // mountain highlights / winter snowcaps
  ctx.fillStyle=`rgba(220,235,234,${(.18+s.winter*.32)*(1-visual.night*.65)})`;
  for(let x=0,idx=0;x<=W+120;x+=210,idx++){
    const peak=55+hash01(idx+77)*55;
    ctx.beginPath();
    ctx.moveTo(x,gy*.62-peak);
    ctx.lineTo(x+34,gy*.62-peak+30);
    ctx.lineTo(x+66,gy*.62-peak+15);
    ctx.closePath();ctx.fill();
  }

  // near hills
  const hillGrad=ctx.createLinearGradient(0,gy*.55,0,gy);
  hillGrad.addColorStop(0,s.hill);
  hillGrad.addColorStop(1,s.hill2);
  ctx.fillStyle=hillGrad;
  ctx.beginPath();ctx.moveTo(0,gy*.72);
  for(let x=0,idx=0;x<=W+160;x+=150,idx++){
    const lift=18+hash01(idx+133)*52;
    ctx.quadraticCurveTo(x+75,gy*.64-lift,x+150,gy*.72);
  }
  ctx.lineTo(W,gy);ctx.lineTo(0,gy);ctx.fill();

  // chapter-themed tree line
  for(let x=-12,idx=0;x<W+30;x+=30,idx++){
    const th=28+hash01(idx+251)*42;
    ctx.fillStyle=idx%2?s.treeA:s.treeB;
    ctx.beginPath();
    ctx.moveTo(x,gy-43);ctx.lineTo(x+15,gy-43-th);ctx.lineTo(x+30,gy-43);ctx.fill();

    if(s.winter>.005){
      ctx.fillStyle=`rgba(235,242,241,${s.winter*.42*(1-visual.night*.55)})`;
      ctx.beginPath();
      ctx.moveTo(x+4,gy-46);ctx.lineTo(x+15,gy-43-th);ctx.lineTo(x+24,gy-46);ctx.fill();
    }
  }

  // ground
  const g=ctx.createLinearGradient(0,gy,0,H);
  g.addColorStop(0,s.ground1);
  g.addColorStop(1,s.ground2);
  ctx.fillStyle=g;ctx.fillRect(0,gy,W,H-gy);

  // winter snow layer
  if(s.winter>.005){
    ctx.fillStyle=`rgba(233,240,239,${s.winter*.55*(1-visual.night*.55)})`;
    ctx.fillRect(0,gy,W,18);
  }

  // road
  const road=ctx.createLinearGradient(gateX()-30,0,W,0);
  road.addColorStop(0,nightColor(seasonColor(['#755e45','#7a756d','#4b453b','#4f3a31','#3b2737']),'#353d45'));
  road.addColorStop(.5,nightColor(seasonColor(['#927b59','#aaa69d','#5f5849','#6b4a38','#54334f']),'#444d55'));
  road.addColorStop(1,nightColor(seasonColor(['#69553f','#77736d','#3d382f','#432f29','#332130']),'#293641'));
  ctx.fillStyle=road;
  ctx.beginPath();
  ctx.moveTo(gateX()-22,gy-8);
  ctx.lineTo(W,gy-19);
  ctx.lineTo(W,H);
  ctx.lineTo(gateX()-52,H);
  ctx.closePath();ctx.fill();

  // fixed road texture
  for(let i=0;i<110;i++){
    const px=hash01(i+400)*W;
    const py=gy+hash01(i+800)*Math.max(1,H-gy);
    const sw=2+hash01(i+1200)*5;
    const sh=1+hash01(i+1600)*2;
    ctx.fillStyle=i%3===0?'rgba(45,34,27,.19)':'rgba(218,195,142,.08)';
    ctx.fillRect(px,py,sw,sh);
  }

  // chapter-themed ground detail
  ctx.save();
  if(s.winter<.995){
    ctx.globalAlpha=1-s.winter;
    ctx.strokeStyle='#2d4029';ctx.lineWidth=1.3;
    for(let i=0;i<82;i++){
      const x=hash01(i+2100)*W;
      const y=gy+8+hash01(i+2600)*Math.max(10,H-gy-8);
      const h=5+hash01(i+3100)*5;
      ctx.beginPath();
      ctx.moveTo(x,y);ctx.lineTo(x-3,y-h);
      ctx.moveTo(x,y);ctx.lineTo(x+4,y-h*.8);ctx.stroke();
    }
  }
  ctx.restore();

  // birds only outside winter
  if(s.winter<.995){
    ctx.save();ctx.globalAlpha=(1-s.winter)*(1-visual.night);
    ctx.strokeStyle='rgba(31,40,44,.50)';ctx.lineWidth=1.2;
    for(const b of birds){
      const flap=Math.sin(time*4+b.phase)*3;
      ctx.beginPath();
      ctx.moveTo(b.x-6,b.y);ctx.quadraticCurveTo(b.x-3,b.y-flap,b.x,b.y);
      ctx.quadraticCurveTo(b.x+3,b.y-flap,b.x+6,b.y);ctx.stroke();
    }
    ctx.restore();
  }
}

// ---------------- DRAW: CASTLE ----------------
function stoneRect(x,y,w,h,base='#7d7e7e'){
  // The side-to-side gradient makes walls feel cylindrical / lit instead of flat.
  const grad=ctx.createLinearGradient(x,0,x+w,0);
  grad.addColorStop(0,nightColor('#555a5e','#253340'));
  grad.addColorStop(.12,nightColor(base,'#394b5d'));
  grad.addColorStop(.58,nightColor('#929698','#51677c'));
  grad.addColorStop(.87,nightColor(base,'#384c60'));
  grad.addColorStop(1,nightColor('#50555a','#223445'));
  ctx.fillStyle=grad;ctx.fillRect(x,y,w,h);

  // top bevel
  ctx.fillStyle='rgba(255,255,255,.10)';ctx.fillRect(x+2,y+2,w-4,3);
  ctx.fillStyle='rgba(0,0,0,.16)';ctx.fillRect(x+w-7,y+4,7,h-4);

  // masonry
  ctx.strokeStyle='rgba(35,37,38,.36)';ctx.lineWidth=1;
  for(let yy=y+15;yy<y+h;yy+=18){
    ctx.beginPath();ctx.moveTo(x,yy);ctx.lineTo(x+w,yy);ctx.stroke();
  }
  for(let row=0,yy=y;yy<y+h;row++,yy+=18){
    const offset=(row%2)*17;
    for(let xx=x+offset;xx<x+w;xx+=34){
      ctx.beginPath();ctx.moveTo(xx,yy);ctx.lineTo(xx,Math.min(yy+18,y+h));ctx.stroke();
    }
  }

  // sparse moss/shadow chips, deterministic from coordinates
  const seed=Math.floor(x*3+y*5+w*7+h*11);
  for(let i=0;i<10;i++){
    const px=x+6+hash01(seed+i*13)*(w-12);
    const py=y+10+hash01(seed+i*31)*(h-20);
    ctx.fillStyle=i%3===0?'rgba(222,224,221,.055)':'rgba(28,30,31,.10)';
    ctx.fillRect(px,py,3+hash01(seed+i*47)*7,2);
  }
}
function drawInnerCity(x,gy){
  ctx.save();

  // Everything here is behind the main gatehouse and makes the fortress
  // feel like the entrance to a much larger fortified settlement.
  const season=visualSeason();

  // deep inner wall extending out of frame
  const wallY=gy-178;
  const wallW=Math.max(190,x+54);
  const wallGrad=ctx.createLinearGradient(0,0,wallW,0);
  wallGrad.addColorStop(0,nightColor('#555a5e','#283749'));
  wallGrad.addColorStop(.55,nightColor('#73787b','#3a4b5b'));
  wallGrad.addColorStop(1,nightColor('#51565a','#223342'));
  ctx.fillStyle=wallGrad;
  ctx.fillRect(-25,wallY,wallW,178);

  // distant wall battlements
  ctx.fillStyle='#4b5054';
  for(let bx=-20;bx<wallW;bx+=27){
    ctx.fillRect(bx,wallY-14,16,17);
  }

  // rooftops and homes inside the walls
  const homes=[
    {dx:-245,base:-202,w:52,h:54,roof:'#6c3c31'},
    {dx:-191,base:-205,w:47,h:65,roof:'#704536'},
    {dx:-139,base:-206,w:59,h:48,roof:'#75412f'},
    {dx:-82, base:-201,w:45,h:61,roof:'#5f3d35'},
    {dx:-35, base:-205,w:53,h:50,roof:'#78452f'}
  ];

  for(let i=0;i<homes.length;i++){
    const h=homes[i];
    const hx=x+h.dx;
    const by=gy+h.base;

    // house body
    const body=ctx.createLinearGradient(hx,0,hx+h.w,0);
    body.addColorStop(0,nightColor('#665f55','#293541'));
    body.addColorStop(.55,nightColor('#8b8170','#4c545a'));
    body.addColorStop(1,nightColor('#58534c','#27333c'));
    ctx.fillStyle=body;
    ctx.fillRect(hx,by-h.h,h.w,h.h);

    // timber
    ctx.fillStyle='#493a2e';
    ctx.fillRect(hx+7,by-h.h,4,h.h);
    ctx.fillRect(hx+h.w-11,by-h.h,4,h.h);
    ctx.fillRect(hx,by-24,h.w,4);

    // roof
    ctx.fillStyle=nightColor(seasonColor([h.roof,'#667079','#4e433f','#714434','#5b344f']),'#342f3e');
    ctx.beginPath();
    ctx.moveTo(hx-7,by-h.h);
    ctx.lineTo(hx+h.w*.5,by-h.h-28);
    ctx.lineTo(hx+h.w+7,by-h.h);
    ctx.closePath();ctx.fill();

    if(season.winter>.005){
      ctx.strokeStyle=`rgba(235,242,242,${season.winter*.65})`;
      ctx.lineWidth=3;
      ctx.beginPath();
      ctx.moveTo(hx-4,by-h.h-2);
      ctx.lineTo(hx+h.w*.5,by-h.h-28);
      ctx.lineTo(hx+h.w+4,by-h.h-2);
      ctx.stroke();
    }

    // warm windows
    ctx.fillStyle='rgba(255,193,91,.58)';
    ctx.fillRect(hx+14,by-h.h+18,7,10);
    ctx.fillRect(hx+h.w-22,by-h.h+18,7,10);

    // chimney
    if(i%2===0){
      ctx.fillStyle='#4a4540';
      ctx.fillRect(hx+h.w-16,by-h.h-37,7,23);

      // smooth thin smoke, never random blobs
      const sway=Math.sin(time*.55+i)*5;
      ctx.strokeStyle='rgba(113,120,120,.24)';
      ctx.lineWidth=3;
      ctx.beginPath();
      ctx.moveTo(hx+h.w-12,by-h.h-38);
      ctx.bezierCurveTo(
        hx+h.w-16+sway,by-h.h-55,
        hx+h.w-5-sway,by-h.h-67,
        hx+h.w-10+sway*.5,by-h.h-83
      );
      ctx.stroke();
    }
  }

  // inner watchtower / chapel silhouette
  const tx=x-219;
  const ty=gy-304;
  const tower=ctx.createLinearGradient(tx,0,tx+48,0);
  tower.addColorStop(0,'#555a5e');
  tower.addColorStop(.5,'#7e8385');
  tower.addColorStop(1,'#4c5155');
  ctx.fillStyle=tower;
  ctx.fillRect(tx,ty,48,128);

  ctx.fillStyle='#4f3430';
  ctx.beginPath();
  ctx.moveTo(tx-7,ty);
  ctx.lineTo(tx+24,ty-47);
  ctx.lineTo(tx+55,ty);
  ctx.closePath();ctx.fill();

  // bell/window
  ctx.fillStyle='#1e272d';
  rr(tx+16,ty+26,16,30,7);ctx.fill();
  ctx.fillStyle='rgba(255,191,92,.28)';
  ctx.fillRect(tx+21,ty+37,6,10);

  // inner gate arch in the distant city wall
  ctx.fillStyle='#323638';
  ctx.beginPath();
  ctx.moveTo(4,gy);
  ctx.lineTo(4,gy-70);
  ctx.quadraticCurveTo(29,gy-105,54,gy-70);
  ctx.lineTo(54,gy);
  ctx.closePath();ctx.fill();

  // atmospheric shade separates city from foreground gatehouse
  const haze=ctx.createLinearGradient(0,gy-330,0,gy);
  haze.addColorStop(0,'rgba(101,121,128,.12)');
  haze.addColorStop(1,'rgba(25,28,30,.22)');
  ctx.fillStyle=haze;
  ctx.fillRect(-30,gy-350,wallW+40,350);

  ctx.restore();
}

function drawRoyalKeep(x,gy){
  // One supported great hall replaces the two small towers stacked on Lv.5.
  // This is scenery only: defender positions and fortress stats do not change.
  const top=gy-386,bottom=gy-248;
  ctx.save();
  stoneRect(x-82,top,164,bottom-top,'#898c8d');

  // Full-height corner buttresses tie the crown to the existing curtain wall.
  for(const side of [-1,1]){
    const bx=side<0?x-88:x+73;
    stoneRect(bx,top+12,15,bottom-top-12,'#737b80');
    ctx.fillStyle=nightColor('#adb0ac','#6a8093');
    for(let y=top+28;y<bottom-8;y+=32)ctx.fillRect(bx-2,y,19,4);
    ctx.fillStyle=nightColor('#555e64','#263a4c');
    ctx.fillRect(bx-3,bottom-10,21,10);
  }

  // Continuous parapet, inset walkway and projecting stone corbels.
  ctx.fillStyle=nightColor('#333d43','#142735');
  ctx.fillRect(x-79,top-8,158,12);
  for(let i=0;i<7;i++){
    const bx=x-86+i*26;
    ctx.fillStyle=nightColor('#7f898d','#425b70');
    ctx.fillRect(bx,top-19,16,24);
    ctx.fillStyle=nightColor('#b9bab0','#7891a2');
    ctx.fillRect(bx,top-19,16,3);
    ctx.fillStyle='rgba(13,24,32,.24)';
    ctx.fillRect(bx+12,top-16,4,21);
  }
  ctx.fillStyle=nightColor('#a4aaa6','#6b8396');
  ctx.fillRect(x-91,top+3,182,5);
  ctx.fillStyle=nightColor('#555f65','#293f52');
  ctx.fillRect(x-89,top+8,178,8);
  for(let i=0;i<9;i++){
    const bx=x-82+i*19;
    ctx.fillStyle=nightColor('#7d878c','#425a6d');
    ctx.beginPath();ctx.moveTo(bx,top+16);ctx.lineTo(bx+9,top+16);
    ctx.lineTo(bx+6,top+23);ctx.lineTo(bx+2,top+23);ctx.closePath();ctx.fill();
  }
  ctx.fillStyle=nightColor('#b69b62','#9d885c');
  ctx.fillRect(x-72,top+26,144,2);

  // Tall recessed windows; warm glass belongs to the night lighting palette.
  for(const offset of [-48,48]){
    const wx=x+offset,wy=top+37;
    ctx.fillStyle=nightColor('#b0afa1','#718293');
    rr(wx-14,wy-4,28,47,13);ctx.fill();
    ctx.fillStyle=nightColor('#26363e','#122437');
    rr(wx-10,wy,20,40,10);ctx.fill();
    const glass=ctx.createLinearGradient(0,wy,0,wy+40);
    glass.addColorStop(0,nightColor('#687c84','#c88a40'));
    glass.addColorStop(1,nightColor('#bca777','#ffe2a0'));
    ctx.fillStyle=glass;rr(wx-7,wy+4,14,33,7);ctx.fill();
    ctx.fillStyle=nightColor('#49545a','#605443');
    ctx.fillRect(wx-1,wy+4,2,33);ctx.fillRect(wx-8,wy+20,16,3);
    ctx.fillStyle=nightColor('#adb0a6','#71869a');
    ctx.fillRect(wx-16,wy+41,32,4);
    if(visual.night>.001){
      const light=ctx.createRadialGradient(wx,wy+26,2,wx,wy+26,33);
      light.addColorStop(0,`rgba(255,186,88,${visual.night*.16})`);
      light.addColorStop(1,'rgba(255,174,74,0)');
      ctx.fillStyle=light;ctx.fillRect(wx-33,wy-7,66,66);
    }
  }

  // A single royal shield gives the final upgrade its own focal point.
  ctx.fillStyle='rgba(17,25,31,.27)';
  rr(x-23,top+37,49,69,6);ctx.fill();
  ctx.fillStyle=nightColor('#872e3d','#542b3c');
  ctx.strokeStyle=nightColor('#d1b370','#af955f');ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(x-21,top+35);ctx.lineTo(x+21,top+35);
  ctx.lineTo(x+19,top+76);ctx.quadraticCurveTo(x+15,top+91,x,top+101);
  ctx.quadraticCurveTo(x-15,top+91,x-19,top+76);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.fillStyle=nightColor('#e4c778','#cfb475');
  ctx.beginPath();ctx.moveTo(x-12,top+51);ctx.lineTo(x-7,top+58);
  ctx.lineTo(x,top+47);ctx.lineTo(x+7,top+58);ctx.lineTo(x+12,top+51);
  ctx.lineTo(x+9,top+65);ctx.lineTo(x-9,top+65);ctx.closePath();ctx.fill();
  ctx.fillRect(x-2,top+70,4,16);ctx.fillRect(x-8,top+74,16,3);

  // The archers' original standing line remains in front of the new hall.
  ctx.fillStyle=nightColor('#535f66','#2a4052');ctx.fillRect(x-91,bottom-9,182,9);
  ctx.fillStyle=nightColor('#a4aaa5','#6c8394');ctx.fillRect(x-94,bottom-12,188,4);
  ctx.restore();
}

function drawCastle(){
  const x=castleX(),gy=groundY();
  ctx.save();

  drawInnerCity(x,gy);

  // ground shadow
  ctx.fillStyle='rgba(0,0,0,.34)';
  ctx.beginPath();ctx.ellipse(x+40,gy+14,170,24,0,0,TAU);ctx.fill();

  // rear keep
  stoneRect(x-125,gy-248,235,248,'#777a7d');

  // left tower
  stoneRect(x-166,gy-320,78,320,'#85888a');
  // right tower
  stoneRect(x+88,gy-300,80,300,'#828588');

  // battlements
  ctx.fillStyle='#696d70';
  for(let i=0;i<5;i++)ctx.fillRect(x-166+i*17,gy-334,11,22);
  for(let i=0;i<5;i++)ctx.fillRect(x+88+i*18,gy-314,12,22);
  for(let i=0;i<8;i++)ctx.fillRect(x-125+i*31,gy-263,18,22);

  // tower caps/shadows
  ctx.fillStyle='#55595d';
  ctx.fillRect(x-166,gy-322,78,8);
  ctx.fillRect(x+88,gy-302,80,8);

  // flags
  const flap=Math.sin(time*2.3)*3.5;
  ctx.strokeStyle='#4c392a';ctx.lineWidth=3;
  ctx.beginPath();ctx.moveTo(x-137,gy-360);ctx.lineTo(x-137,gy-322);ctx.stroke();
  ctx.fillStyle='#8e2639';ctx.beginPath();
  ctx.moveTo(x-136,gy-357);ctx.lineTo(x-103+flap,gy-350);ctx.lineTo(x-136,gy-341);ctx.closePath();ctx.fill();

  ctx.beginPath();ctx.moveTo(x+130,gy-345);ctx.lineTo(x+130,gy-300);ctx.stroke();
  ctx.fillStyle='#8e2639';ctx.beginPath();
  ctx.moveTo(x+131,gy-342);ctx.lineTo(x+164+flap*.8,gy-334);ctx.lineTo(x+131,gy-324);ctx.closePath();ctx.fill();

  // windows
  function slit(px,py){
    ctx.fillStyle='#1c232a';
    rr(px,py,18,43,8);ctx.fill();
    ctx.fillStyle='rgba(255,192,91,.30)';
    ctx.fillRect(px+5,py+12,8,14);
  }
  slit(x-143,gy-270);
  slit(x+116,gy-250);

  // main arched gate
  const gx=gateX()-42,gw=84,gh=132;
  ctx.fillStyle='#3b2619';
  ctx.beginPath();
  ctx.moveTo(gx,gy);ctx.lineTo(gx,gy-gh+42);
  ctx.quadraticCurveTo(gx+gw/2,gy-gh-7,gx+gw,gy-gh+42);
  ctx.lineTo(gx+gw,gy);ctx.closePath();ctx.fill();

  // wooden planks
  ctx.fillStyle='#4c301c';
  for(let i=0;i<5;i++)ctx.fillRect(gx+i*17,gy-92,13,92);
  ctx.fillStyle='#bd9850';ctx.fillRect(gx,gy-62,gw,8);
  ctx.fillRect(gx,gy-26,gw,6);

  // iron studs
  ctx.fillStyle='#22272c';
  for(let yy=gy-88;yy<gy-12;yy+=28){
    for(let xx=gx+10;xx<gx+gw;xx+=20){
      ctx.beginPath();ctx.arc(xx,yy,2.5,0,TAU);ctx.fill()
    }
  }

  // cracked gate
  const damage=1-game.gateHp/game.gateMax;
  ctx.strokeStyle='#21160f';ctx.lineWidth=3;
  if(damage>.20){
    ctx.beginPath();ctx.moveTo(gx+20,gy-80);ctx.lineTo(gx+33,gy-63);ctx.lineTo(gx+23,gy-42);ctx.stroke()
  }
  if(damage>.45){
    ctx.beginPath();ctx.moveTo(gx+62,gy-105);ctx.lineTo(gx+49,gy-78);ctx.lineTo(gx+64,gy-55);ctx.stroke()
  }
  if(damage>.70){
    ctx.beginPath();ctx.moveTo(gx+38,gy-45);ctx.lineTo(gx+51,gy-31);ctx.lineTo(gx+40,gy-10);ctx.stroke()
  }

  // torch
  ctx.fillStyle='#4b321f';ctx.fillRect(x-102,gy-150,5,24);
  const flame=Math.sin(time*7)*1.2;
  ctx.fillStyle='#ff8a32';
  ctx.beginPath();
  ctx.moveTo(x-105,gy-151);
  ctx.quadraticCurveTo(x-104,gy-162-flame,x-99,gy-166);
  ctx.quadraticCurveTo(x-94,gy-160+flame,x-93,gy-151);
  ctx.closePath();ctx.fill();
  ctx.fillStyle='#ffd05a';
  ctx.beginPath();
  ctx.moveTo(x-102,gy-152);
  ctx.quadraticCurveTo(x-101,gy-159,x-99,gy-161);
  ctx.quadraticCurveTo(x-96,gy-157,x-96,gy-152);
  ctx.closePath();ctx.fill();

  // CASTLE EVOLUTION: every level visibly changes the silhouette.
  if(game.castleLevel>=2){
    ctx.fillStyle='#555b5f';
    ctx.fillRect(x-126,gy-275,235,10);
    for(let i=0;i<8;i++)ctx.fillRect(x-122+i*30,gy-289,15,17);

    // stronger gate frame
    ctx.fillStyle='#383d40';
    ctx.fillRect(gx+7,gy-104,6,104);
    ctx.fillRect(gx+gw-13,gy-104,6,104);
  }

  if(game.castleLevel>=3){
    // outer bastions and curtain walls
    stoneRect(x-211,gy-245,45,245,'#707477');
    stoneRect(x+168,gy-240,46,240,'#707477');

    ctx.fillStyle='#4c5155';
    for(let i=0;i<3;i++){
      ctx.fillRect(x-211+i*16,gy-260,10,19);
      ctx.fillRect(x+168+i*16,gy-255,10,19);
    }

    stoneRect(x-265,gy-162,54,162,'#666b6e');
    stoneRect(x+214,gy-157,58,157,'#666b6e');
  }

  if(game.castleLevel>=4){
    // pointed corner turrets
    const turretY=gy-282;
    stoneRect(x-250,turretY,42,282,'#74797c');
    stoneRect(x+211,turretY+8,42,274,'#74797c');

    ctx.fillStyle='#573834';
    ctx.beginPath();ctx.moveTo(x-258,turretY);ctx.lineTo(x-229,turretY-47);ctx.lineTo(x-200,turretY);ctx.closePath();ctx.fill();
    ctx.beginPath();ctx.moveTo(x+203,turretY+8);ctx.lineTo(x+232,turretY-39);ctx.lineTo(x+261,turretY+8);ctx.closePath();ctx.fill();

    ctx.strokeStyle='#454a4d';ctx.lineWidth=5;
    ctx.beginPath();ctx.moveTo(x-210,gy-245);ctx.lineTo(x-239,gy-326);ctx.stroke();
    ctx.beginPath();ctx.moveTo(x+214,gy-240);ctx.lineTo(x+242,gy-320);ctx.stroke();
  }

  if(game.castleLevel>=5&&game.castleLevel<7){
    // central high keep / donjon
    stoneRect(x-72,gy-378,145,117,'#7d8184');
    ctx.fillStyle='#555a5e';
    for(let i=0;i<5;i++)ctx.fillRect(x-68+i*32,gy-393,17,19);

    ctx.fillStyle='#1b242a';
    rr(x-14,gy-347,28,48,11);ctx.fill();
    ctx.fillStyle='rgba(255,192,91,.27)';
    ctx.fillRect(x-7,gy-329,14,17);

    ctx.strokeStyle='#433124';ctx.lineWidth=3;
    ctx.beginPath();ctx.moveTo(x,gy-430);ctx.lineTo(x,gy-391);ctx.stroke();
    ctx.fillStyle='#922a3e';
    ctx.beginPath();ctx.moveTo(x+1,gy-427);ctx.lineTo(x+38+flap,gy-418);ctx.lineTo(x+1,gy-406);ctx.closePath();ctx.fill();
  }

  if(game.castleLevel>=6){
    // huge rear towers and elevated walls
    stoneRect(x-306,gy-214,58,214,'#62686c');
    stoneRect(x+270,gy-205,62,205,'#62686c');

    ctx.fillStyle='#4a3030';
    ctx.beginPath();ctx.moveTo(x-314,gy-214);ctx.lineTo(x-277,gy-267);ctx.lineTo(x-240,gy-214);ctx.closePath();ctx.fill();
    ctx.beginPath();ctx.moveTo(x+262,gy-205);ctx.lineTo(x+301,gy-261);ctx.lineTo(x+340,gy-205);ctx.closePath();ctx.fill();

    ctx.fillStyle='#555a5d';
    ctx.fillRect(x-300,gy-176,89,12);
    ctx.fillRect(x+214,gy-171,118,12);
  }

  if(game.castleLevel>=7){
    drawRoyalKeep(x,gy);

    ctx.strokeStyle='#b29655';ctx.lineWidth=4;
    ctx.beginPath();
    ctx.moveTo(gx+8,gy-101);ctx.lineTo(gx+gw-8,gy-14);
    ctx.moveTo(gx+gw-8,gy-101);ctx.lineTo(gx+8,gy-14);
    ctx.stroke();

  }

  if(game.towerHp<=0){
    ctx.fillStyle='rgba(24,25,25,.18)';
    ctx.fillRect(x-166,gy-319,78,319);
    ctx.fillRect(x+88,gy-299,80,299);

    ctx.strokeStyle='#392f2c';ctx.lineWidth=4;
    ctx.beginPath();
    ctx.moveTo(x-143,gy-285);ctx.lineTo(x-130,gy-250);ctx.lineTo(x-145,gy-220);
    ctx.moveTo(x+121,gy-267);ctx.lineTo(x+108,gy-229);ctx.lineTo(x+125,gy-194);
    ctx.stroke();

    for(let i=0;i<3;i++){
      const sx=i===0?x-132:x+122+i*6;
      const sy=i===0?gy-318:gy-296;
      const sway=Math.sin(time*.65+i)*8;
      ctx.strokeStyle='rgba(67,70,70,.28)';
      ctx.lineWidth=4-i*.6;
      ctx.beginPath();
      ctx.moveTo(sx,sy);
      ctx.bezierCurveTo(sx+sway,sy-22,sx-sway,sy-43,sx+sway*.45,sy-65);
      ctx.stroke();
    }
  }

  drawCastleFinish(x,gy);
  // defense characters
  drawArchers(x,gy);
  if(game.mage)drawMage(x,gy);
  if(game.lava)drawLavaTrap(x,gy);
  drawDefenderWeapons();
  // Commander stays in the foreground so the ballista cannot hide him.
  if(game.archerCommander)drawArcherCommander(x,gy);


  ctx.restore();
}
