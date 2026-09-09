function drawArcherUnit(x,feetY,flip=false,level=1,phase=0,pose={pull:0,recoil:0}){
  const bob=Math.sin(visual.clock*3.1+phase)*.55;
  ctx.save();
  ctx.translate(x,feetY-29);
  if(flip)ctx.scale(-1,1);

  // ground contact
  ctx.fillStyle='rgba(0,0,0,.30)';
  ctx.beginPath();ctx.ellipse(0,29,14,3,0,0,TAU);ctx.fill();

  // legs + boots
  ctx.fillStyle=level>=4?'#24292d':'#31302d';
  ctx.fillRect(-8,13,6,13);ctx.fillRect(3,13,6,13);
  ctx.fillStyle='#151515';
  ctx.fillRect(-10,24,10,5);ctx.fillRect(3,24,10,5);
  ctx.translate(-pose.recoil*2,bob);

  // Tunic/armor palette changes strongly by level.
  const palettes=[
    null,
    ['#283a2b','#466044','#253128'],
    ['#203426','#527047','#26362b'],
    ['#27333a','#66757b','#27343a'],
    ['#542b23','#93432d','#382722'],
    ['#203948','#39738d','#18313f']
  ];
  const p=palettes[Math.min(level,5)]||palettes[5];
  const tunic=ctx.createLinearGradient(-14,0,14,0);
  tunic.addColorStop(0,p[0]);tunic.addColorStop(.52,p[1]);tunic.addColorStop(1,p[2]);
  ctx.fillStyle=tunic;
  ctx.beginPath();
  ctx.moveTo(-11,-8);ctx.lineTo(11,-8);ctx.lineTo(14,15);ctx.lineTo(-14,15);ctx.closePath();ctx.fill();

  // cape appears from level 2, dramatically changes silhouette.
  if(level>=2){
    ctx.fillStyle=level>=5?'#214e63':level===4?'#6d2d25':'#31442f';
    ctx.beginPath();
    const sway=Math.sin(visual.clock*2.3+phase)*2.5;
    ctx.moveTo(-10,-5);ctx.quadraticCurveTo(-19+sway,6,-17+sway,18);
    ctx.lineTo(-7+sway*.5,15);ctx.lineTo(-3,-2);ctx.closePath();ctx.fill();
  }

  // leather / metal armor by level
  if(level===1){
    ctx.fillStyle='#69452b';
    ctx.beginPath();ctx.ellipse(-9,-4,7,5,-.3,0,TAU);ctx.fill();
  }
  if(level===2){
    ctx.fillStyle='#6b4a2d';
    ctx.fillRect(-12,-5,24,5);
    ctx.beginPath();ctx.ellipse(-10,-4,7,6,-.25,0,TAU);ctx.fill();
  }
  if(level>=3){
    ctx.fillStyle=level>=5?'#77aabd':'#858d91';
    ctx.beginPath();ctx.ellipse(-10,-4,8,6,-.25,0,TAU);ctx.fill();
    ctx.beginPath();ctx.ellipse(10,-4,8,6,.25,0,TAU);ctx.fill();
    ctx.fillStyle='rgba(255,255,255,.18)';
    ctx.fillRect(-10,-7,20,2);
  }
  if(level>=4){
    ctx.fillStyle=level>=5?'#315f73':'#7e3929';
    ctx.fillRect(-14,3,28,5);
  }

  // belt
  ctx.fillStyle='#51341f';ctx.fillRect(-13,7,26,4);
  ctx.fillStyle=level>=3?'#d0b766':'#aa914f';ctx.fillRect(-2,7,4,4);

  // neck/head
  ctx.fillStyle='#d7aa7e';ctx.fillRect(-3,-11,6,5);
  ctx.beginPath();ctx.arc(0,-18,9,0,TAU);ctx.fill();
  ctx.fillStyle='#b98768';ctx.fillRect(6,-18,3,3);
  ctx.fillStyle='rgba(84,55,41,.22)';ctx.fillRect(-7,-13,14,3);

  // Headgear changes entirely.
  if(level===1){
    ctx.fillStyle='#4b5b3e';
    ctx.beginPath();ctx.arc(0,-20,10,Math.PI,TAU);ctx.lineTo(8,-11);ctx.lineTo(-7,-11);ctx.closePath();ctx.fill();
  }else if(level===2){
    ctx.fillStyle='#28412d';
    ctx.beginPath();ctx.arc(0,-20,10,Math.PI,TAU);ctx.lineTo(8,-11);ctx.lineTo(-7,-11);ctx.closePath();ctx.fill();
    ctx.fillStyle='#3d5839';ctx.fillRect(-11,-22,22,4);
  }else if(level===3){
    ctx.fillStyle='#687174';
    ctx.beginPath();ctx.arc(0,-21,10,Math.PI,TAU);ctx.lineTo(9,-13);ctx.lineTo(-9,-13);ctx.closePath();ctx.fill();
    ctx.fillStyle='#3b4448';ctx.fillRect(-11,-20,22,3);
  }else if(level===4){
    ctx.fillStyle='#772f25';
    ctx.beginPath();ctx.arc(0,-20,10,Math.PI,TAU);ctx.lineTo(8,-11);ctx.lineTo(-8,-11);ctx.closePath();ctx.fill();
    ctx.fillStyle='#d38b3f';
    ctx.beginPath();ctx.moveTo(-3,-29);ctx.lineTo(1,-38);ctx.lineTo(5,-28);ctx.closePath();ctx.fill();
  }else{
    ctx.fillStyle='#225268';ctx.shadowBlur=5;ctx.shadowColor='#6ac8ee';
    ctx.beginPath();ctx.arc(0,-20,10,Math.PI,TAU);ctx.lineTo(8,-11);ctx.lineTo(-8,-11);ctx.closePath();ctx.fill();
    ctx.shadowBlur=0;
    ctx.fillStyle='#79cbe8';ctx.fillRect(-10,-21,20,2);
  }

  // arm
  ctx.strokeStyle='#d7aa7e';ctx.lineWidth=4;ctx.lineCap='round';
  ctx.beginPath();ctx.moveTo(8,-3);ctx.lineTo(17,3);ctx.stroke();
  ctx.beginPath();ctx.moveTo(-5,-3);ctx.lineTo(5-pose.pull*6,5);ctx.lineTo(23-pose.pull*14,1);ctx.stroke();

  // Bow also upgrades visually.
  ctx.strokeStyle=level>=5?'#87d8ee':level===4?'#bf7541':level>=3?'#c4a15d':'#986a39';
  ctx.lineWidth=level>=3?2.7:2.1;
  ctx.beginPath();ctx.arc(19,1,15,-1.32,1.32);ctx.stroke();

  if(level>=3){
    ctx.strokeStyle=level>=5?'#5b9fb5':'#70797b';
    ctx.lineWidth=1.3;
    ctx.beginPath();ctx.arc(19,1,12,-1.28,1.28);ctx.stroke();
  }

  ctx.strokeStyle='#e8dfca';ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(23,-13);ctx.lineTo(23-pose.pull*14+pose.recoil*3,1);ctx.lineTo(23,15);ctx.stroke();
  if(pose.pull>.05){
    ctx.strokeStyle='#dec8a1';ctx.lineWidth=1.5;
    ctx.beginPath();ctx.moveTo(23-pose.pull*14,1);ctx.lineTo(38,1);ctx.stroke();
    ctx.fillStyle='#e0e6e3';ctx.beginPath();ctx.moveTo(42,1);ctx.lineTo(35,-2);ctx.lineTo(35,4);ctx.closePath();ctx.fill();
  }

  // quiver
  ctx.fillStyle=level>=4?'#42261f':'#5e3b24';ctx.fillRect(-15,-5,6,19);
  const shaft=level>=5?'#74c8e8':level===4?'#bd6941':level>=3?'#cbd9dc':'#c2a572';
  ctx.strokeStyle=shaft;ctx.lineWidth=1.4;
  for(let i=0;i<3;i++){
    ctx.beginPath();ctx.moveTo(-14+i*2,-7);ctx.lineTo(-11+i*2,-19);ctx.stroke();
  }

  // upgrade aura only at maximum visual tier
  if(level>=5){
    ctx.strokeStyle='rgba(112,210,244,.42)';
    ctx.lineWidth=1;
    ctx.beginPath();ctx.arc(0,-2,21+Math.sin(time*3+phase)*2,0,TAU);ctx.stroke();
  }

  ctx.restore();
}
function drawArchers(x,gy){
  for(let i=0;i<game.archers;i++){
    const slot=archerSlot(i);
    drawArcherUnit(slot.x,slot.feetY,slot.flip,game.archerLevel,i*1.4,archerPose(i));

    // A small front lip makes it obvious the archer is behind/on the parapet,
    // not floating in front of the castle.
    ctx.fillStyle='rgba(60,63,65,.82)';
    ctx.fillRect(slot.x-16,slot.feetY-2,32,4);
    ctx.fillStyle='rgba(255,255,255,.08)';
    ctx.fillRect(slot.x-14,slot.feetY-2,28,1);
  }
}

function drawArcherCommander(x,gy){
  // The commander stands between the second and third archer in the line.
  const cx=x+24;
  const feetY=gy-248;

  ctx.save();
  const aura=ctx.createRadialGradient(cx,feetY-31,4,cx,feetY-31,35);
  aura.addColorStop(0,'rgba(255,222,105,.30)');
  aura.addColorStop(1,'rgba(255,222,105,0)');
  ctx.fillStyle=aura;
  ctx.beginPath();ctx.arc(cx,feetY-31,35,0,TAU);ctx.fill();

  ctx.strokeStyle='#d9b34f';ctx.lineWidth=3;
  ctx.beginPath();ctx.moveTo(cx+17,feetY-58);ctx.lineTo(cx+17,feetY-7);ctx.stroke();
  ctx.fillStyle='#8f2438';
  const sway=Math.sin(visual.clock*2.4)*3;
  ctx.beginPath();ctx.moveTo(cx+18,feetY-57);ctx.quadraticCurveTo(cx+30,feetY-60+sway,cx+42,feetY-50+sway);
  ctx.quadraticCurveTo(cx+29,feetY-43-sway,cx+18,feetY-41);ctx.closePath();ctx.fill();
  ctx.strokeStyle='#e1bd63';ctx.lineWidth=1;ctx.stroke();
  // Crimson mantle separates the Commander from the blue archer uniforms.
  ctx.fillStyle='#952e43';ctx.beginPath();ctx.moveTo(cx-11,feetY-41);
  ctx.quadraticCurveTo(cx-25+sway,feetY-26,cx-23+sway,feetY-3);
  ctx.lineTo(cx-7,feetY-9);ctx.lineTo(cx+6,feetY-40);ctx.closePath();ctx.fill();
  ctx.strokeStyle='#d8ac54';ctx.stroke();
  ctx.restore();

  drawArcherUnit(cx,feetY,false,Math.max(5,game.archerLevel),2.8);

  ctx.save();ctx.translate(cx,feetY-61+Math.sin(visual.clock*3.1+2.8)*.55);
  ctx.fillStyle='#f7d45c';
  ctx.beginPath();
  ctx.moveTo(-10,7);ctx.lineTo(-10,-1);ctx.lineTo(-5,3);ctx.lineTo(0,-5);
  ctx.lineTo(5,3);ctx.lineTo(10,-1);ctx.lineTo(10,7);ctx.closePath();ctx.fill();
  ctx.strokeStyle='#7a561a';ctx.lineWidth=1.5;ctx.stroke();
  ctx.fillStyle='#fff0a5';ctx.beginPath();ctx.arc(0,-2,2,0,TAU);ctx.fill();
  ctx.restore();
}

function drawMage(x,gy){
  // Dedicated left tower position — never overlaps an archer.
  const mx=x-128;
  const feetY=gy-320;
  const my=feetY-33+Math.sin(time*2.1)*1.4;
  drawMageCharge(mx,my);

  ctx.save();ctx.translate(mx,my);

  // contact shadow on tower
  ctx.fillStyle='rgba(0,0,0,.28)';
  ctx.beginPath();ctx.ellipse(0,33,15,3,0,0,TAU);ctx.fill();

  // layered robe for more volume
  const robe=ctx.createLinearGradient(-18,0,18,0);
  robe.addColorStop(0,'#241d49');
  robe.addColorStop(.48,'#4f3d86');
  robe.addColorStop(1,'#241d49');
  ctx.fillStyle=robe;
  ctx.beginPath();
  ctx.moveTo(-17,31);ctx.lineTo(17,31);ctx.lineTo(11,-8);ctx.lineTo(-10,-8);ctx.closePath();ctx.fill();

  // robe folds
  ctx.strokeStyle='rgba(174,145,222,.28)';ctx.lineWidth=1.5;
  ctx.beginPath();ctx.moveTo(-7,4);ctx.lineTo(-10,28);
  ctx.moveTo(1,1);ctx.lineTo(1,30);
  ctx.moveTo(8,5);ctx.lineTo(11,27);ctx.stroke();

  // shoulders
  ctx.fillStyle='#6952a1';
  ctx.beginPath();ctx.ellipse(-10,-6,8,5,-.2,0,TAU);ctx.fill();
  ctx.beginPath();ctx.ellipse(10,-6,8,5,.2,0,TAU);ctx.fill();

  // head
  ctx.fillStyle='#d2a17b';ctx.beginPath();ctx.arc(0,-19,9,0,TAU);ctx.fill();

  // hair
  ctx.fillStyle='#d2d0c8';
  ctx.beginPath();ctx.arc(-3,-23,7,2.7,5.8);ctx.fill();

  // larger beard
  const beard=ctx.createLinearGradient(0,-12,0,5);
  beard.addColorStop(0,'#deddd6');beard.addColorStop(1,'#aaa9a5');
  ctx.fillStyle=beard;
  ctx.beginPath();
  ctx.moveTo(-8,-15);ctx.lineTo(-5,-4);ctx.lineTo(0,5);ctx.lineTo(6,-4);ctx.lineTo(8,-15);
  ctx.quadraticCurveTo(0,-8,-8,-15);ctx.fill();

  // wizard hat with band + moon badge
  const hat=ctx.createLinearGradient(-10,0,12,0);
  hat.addColorStop(0,'#31235f');hat.addColorStop(.55,'#624ca0');hat.addColorStop(1,'#2c2155');
  ctx.fillStyle=hat;
  ctx.beginPath();ctx.moveTo(-14,-25);ctx.lineTo(4,-56);ctx.lineTo(14,-24);ctx.closePath();ctx.fill();
  ctx.fillStyle='#8a72bd';ctx.fillRect(-14,-26,28,5);
  ctx.fillStyle='#d8ca6d';
  ctx.beginPath();ctx.arc(2,-24,3,0,TAU);ctx.fill();

  // left hand
  ctx.strokeStyle='#d2a17b';ctx.lineWidth=4;ctx.lineCap='round';
  ctx.beginPath();ctx.moveTo(-11,-3);ctx.lineTo(-20,8);ctx.stroke();

  // staff with metal collar
  ctx.strokeStyle='#5c3e27';ctx.lineWidth=4;
  ctx.beginPath();ctx.moveTo(18,-5);ctx.lineTo(29,32);ctx.stroke();
  ctx.fillStyle='#8d7448';ctx.fillRect(15,-7,7,6);

  // animated crystal
  const pulse=5.5+Math.sin(time*6)*1.4;
  const crystal=ctx.createRadialGradient(18,-10,1,18,-10,12);
  crystal.addColorStop(0,'#ffffff');
  crystal.addColorStop(.25,'#b8e8ff');
  crystal.addColorStop(1,'rgba(78,151,209,0)');
  ctx.fillStyle=crystal;
  ctx.beginPath();ctx.arc(18,-10,12,0,TAU);ctx.fill();

  ctx.fillStyle='#83d6ff';ctx.shadowBlur=14;ctx.shadowColor='#8edcff';
  ctx.beginPath();
  ctx.moveTo(18,-10-pulse);ctx.lineTo(23,-10);ctx.lineTo(18,-10+pulse);ctx.lineTo(13,-10);ctx.closePath();ctx.fill();
  ctx.shadowBlur=0;

  // orbiting magic glyphs, attached to mage, not random floating balls
  ctx.strokeStyle='rgba(135,213,255,.48)';ctx.lineWidth=1;
  ctx.beginPath();ctx.arc(18,-10,17+Math.sin(time*2)*1.5,0,TAU);ctx.stroke();

  ctx.restore();

  // tower parapet front lip masks feet slightly and makes contact convincing
  ctx.fillStyle='rgba(68,72,75,.92)';
  ctx.fillRect(mx-18,feetY-2,36,5);
  ctx.fillStyle='rgba(255,255,255,.08)';
  ctx.fillRect(mx-16,feetY-2,32,1);
}
function drawLavaTrap(x,gy){
  const bx=gateX()+16,by=gy-178;

  // Support frame
  ctx.strokeStyle='#47301f';ctx.lineWidth=5;
  ctx.beginPath();ctx.moveTo(bx-36,by-46);ctx.lineTo(bx-36,by+18);ctx.stroke();
  ctx.beginPath();ctx.moveTo(bx-36,by-43);ctx.lineTo(bx+20,by-43);ctx.stroke();

  // pulley
  ctx.fillStyle='#3a3e40';
  ctx.beginPath();ctx.arc(bx+9,by-43,6,0,TAU);ctx.fill();
  ctx.strokeStyle='#1f2425';ctx.lineWidth=2;ctx.stroke();

  // Animation progression: 0 rest, then tip, pour, return.
  const active=game.lavaPour>0;
  const total=1.35;
  const elapsed=active?total-game.lavaPour:0;
  let tilt=0;
  let pourStrength=0;

  if(active){
    if(elapsed<.28){
      tilt=(elapsed/.28)*1.0;
      pourStrength=elapsed/.28*.35;
    }else if(elapsed<.92){
      tilt=1.0;
      pourStrength=1;
    }else{
      const r=(elapsed-.92)/(total-.92);
      tilt=1-r;
      pourStrength=1-r;
    }
  }

  // chain responds to bucket movement
  const pivotX=bx+9,pivotY=by-43;
  const bucketCX=bx+13+Math.sin(tilt)*10;
  const bucketCY=by-8+Math.sin(tilt*.8)*4;

  ctx.strokeStyle='#34383a';ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(pivotX,pivotY+5);ctx.lineTo(bucketCX,bucketCY-20);ctx.stroke();

  // bucket rotates around its handle
  ctx.save();
  ctx.translate(bucketCX,bucketCY);
  ctx.rotate(tilt*.92);

  const metal=ctx.createLinearGradient(-22,0,22,0);
  metal.addColorStop(0,'#24292b');
  metal.addColorStop(.5,'#555b5e');
  metal.addColorStop(1,'#262b2d');
  ctx.fillStyle=metal;
  ctx.beginPath();
  ctx.moveTo(-21,-17);ctx.lineTo(21,-17);ctx.lineTo(15,18);ctx.lineTo(-15,18);ctx.closePath();ctx.fill();
  ctx.strokeStyle='#181c1d';ctx.lineWidth=2;ctx.stroke();

  // rim
  ctx.fillStyle='#1e2224';
  ctx.fillRect(-22,-19,44,5);

  // glowing lava inside
  ctx.fillStyle='#ff652a';
  ctx.beginPath();ctx.ellipse(0,-17,18,5,0,0,TAU);ctx.fill();
  ctx.fillStyle='#ffd45c';
  ctx.beginPath();ctx.ellipse(-4,-18,7,2.4,0,0,TAU);ctx.fill();

  // handle
  ctx.strokeStyle='#303538';ctx.lineWidth=3;
  ctx.beginPath();ctx.arc(0,-15,25,Math.PI,TAU);ctx.stroke();

  ctx.restore();

  // Continuous lava stream during middle of animation
  if(active&&pourStrength>.18){
    const mouthX=bucketCX+23*Math.cos(tilt*.92);
    const mouthY=bucketCY-7+23*Math.sin(tilt*.92);
    const targetX=gateX()+86;
    const targetY=groundY()-3;

    ctx.save();
    ctx.globalAlpha=.78+.18*Math.sin(time*15);
    ctx.strokeStyle='#ff632a';
    ctx.lineWidth=7*pourStrength;
    ctx.lineCap='round';
    ctx.beginPath();
    ctx.moveTo(mouthX,mouthY);
    ctx.bezierCurveTo(
      mouthX+12,mouthY+34,
      targetX-20,targetY-38,
      targetX,targetY
    );
    ctx.stroke();

    ctx.strokeStyle='#ffd050';
    ctx.lineWidth=3.1*pourStrength;
    ctx.beginPath();
    ctx.moveTo(mouthX,mouthY);
    ctx.bezierCurveTo(
      mouthX+12,mouthY+34,
      targetX-20,targetY-38,
      targetX,targetY
    );
    ctx.stroke();
    ctx.restore();

    // glowing pool
    ctx.fillStyle=`rgba(255,91,37,${.26*pourStrength})`;
    ctx.beginPath();ctx.ellipse(targetX,targetY+4,50*pourStrength,9,0,0,TAU);ctx.fill();
  }
}


function drawDefenderWeapons(){
  const x=castleX(),gy=groundY();
  if(game.catapult){
    const mount=catapultMount();
    stoneRect(mount.x-41,mount.y+38,82,gy-mount.y-38,'#696f72');
    ctx.fillStyle='#444b4e';ctx.fillRect(mount.x-45,mount.y+35,90,6);
  }

  if(game.towerHp<=0){
    // Only the artillery emplacements are ruined.
    // Archers and mage remain on the intact castle.
    if(game.ballista){
      const bx=x+91,by=gy-303;
      ctx.fillStyle='#41352c';
      ctx.fillRect(bx-29,by+14,59,8);
      ctx.strokeStyle='#5f4a39';ctx.lineWidth=5;
      ctx.beginPath();ctx.moveTo(bx-18,by+8);ctx.lineTo(bx+20,by-9);ctx.stroke();
      ctx.fillStyle='#676767';
      ctx.beginPath();ctx.arc(bx+8,by+15,7,0,TAU);ctx.fill();
    }

    if(game.catapult){
      const {x:cx,y:cy}=catapultMount();
      ctx.fillStyle='#403025';
      ctx.fillRect(cx-37,cy+15,72,9);
      ctx.strokeStyle='#624730';ctx.lineWidth=6;
      ctx.beginPath();
      ctx.moveTo(cx-22,cy+13);ctx.lineTo(cx+15,cy-13);
      ctx.moveTo(cx+25,cy+12);ctx.lineTo(cx-8,cy-7);
      ctx.stroke();
      ctx.fillStyle='#555';
      ctx.beginPath();ctx.arc(cx-24,cy+25,8,0,TAU);ctx.fill();
    }
    return;
  }

  if(game.ballista){
    const bx=x+91,by=gy-303;
    const kick=shotRecoil('ballista',.34)*9;
    const loaded=visual.clock-visual.ballista>.22;
    const tension=clamp(1-game.ballistaTimer/Math.max(1.15,2.9-game.ballista*.25),0,1);

    ctx.save();
    ctx.translate(bx-kick,by);

    ctx.fillStyle='#4d3523';
    ctx.fillRect(-29,12,62,10);
    ctx.fillStyle='#262421';
    ctx.beginPath();ctx.arc(-18,24,8,0,TAU);ctx.arc(21,24,8,0,TAU);ctx.fill();

    ctx.strokeStyle='#bd8c50';ctx.lineWidth=5;
    ctx.beginPath();ctx.arc(5,-4,31,-1.24,1.24);ctx.stroke();

    ctx.strokeStyle='#758084';ctx.lineWidth=3;
    ctx.beginPath();ctx.arc(5,-4,25,-1.19,1.19);ctx.stroke();

    ctx.strokeStyle='#eee2c5';ctx.lineWidth=1.5;
    ctx.beginPath();ctx.moveTo(15,-33);ctx.lineTo(15-tension*17,-4);ctx.lineTo(15,25);ctx.stroke();

    // loaded giant bolt
    if(loaded){
    ctx.strokeStyle='#525d61';ctx.lineWidth=5;
    ctx.beginPath();ctx.moveTo(-5,-4);ctx.lineTo(45,-4);ctx.stroke();

    ctx.fillStyle='#cad4d5';
    ctx.beginPath();
    ctx.moveTo(57,-4);ctx.lineTo(42,-13);ctx.lineTo(45,-4);ctx.lineTo(42,5);ctx.closePath();ctx.fill();
    }
    ctx.fillStyle=game.ballista>=3?'#d5b263':'#9ea9a9';
    for(const bx of [-23,22])ctx.fillRect(bx,12,5,10);

    ctx.restore();
  }

  if(game.catapult){
    const {x:cx,y:cy}=catapultMount();
    const recoil=shotRecoil('catapult',.45);
    const reload=clamp(1-game.catapultTimer/catapultShotCooldown(game.catapult),0,1);
    const armAngle=lerp(.30,-.92,reload)+recoil*.18;

    ctx.save();
    ctx.translate(cx,cy);

    ctx.fillStyle='#46301f';
    ctx.fillRect(-38,12,78,12);

    ctx.strokeStyle='#6c4a2d';ctx.lineWidth=7;
    ctx.beginPath();
    ctx.moveTo(-29,13);ctx.lineTo(-8,-31);
    ctx.moveTo(29,13);ctx.lineTo(8,-31);
    ctx.stroke();

    ctx.fillStyle='#272522';
    ctx.beginPath();ctx.arc(-27,29,11,0,TAU);ctx.arc(28,29,11,0,TAU);ctx.fill();
    ctx.strokeStyle=game.catapult>=3?'#cfac60':'#9ba2a0';ctx.lineWidth=2;
    for(const wx of [-27,28]){
      ctx.beginPath();ctx.arc(wx,29,8,0,TAU);ctx.moveTo(wx-7,29);ctx.lineTo(wx+7,29);
      ctx.moveTo(wx,22);ctx.lineTo(wx,36);ctx.stroke();
    }
    ctx.strokeStyle='#b6a07b';ctx.lineWidth=1.3;
    ctx.beginPath();ctx.moveTo(25,12);ctx.lineTo(Math.sin(armAngle)*47,4-Math.cos(armAngle)*47);ctx.stroke();

    ctx.save();
    ctx.translate(0,4);
    ctx.rotate(armAngle);
    ctx.strokeStyle='#76502d';ctx.lineWidth=9;
    ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,-57);ctx.stroke();

    ctx.fillStyle='#5d442f';
    ctx.beginPath();ctx.ellipse(0,-61,17,7,0,0,TAU);ctx.fill();
    if(reload>.38&&visual.clock-visual.catapult>.25){
      const radius=Math.min(13,catapultProjectileStats(game.catapult).size*.7);
      ctx.fillStyle='#626865';ctx.beginPath();ctx.arc(0,-67,radius,0,TAU);ctx.fill();
      ctx.fillStyle='#a4aaa1';ctx.beginPath();ctx.arc(-3,-70,3,0,TAU);ctx.fill();
    }
    ctx.restore();

    ctx.restore();
  }

  if(game.oil){
    const ox=gateX()-12,oy=gy-155;
    ctx.strokeStyle='#4b3726';ctx.lineWidth=4;
    ctx.beginPath();ctx.moveTo(ox,oy-35);ctx.lineTo(ox,oy+15);ctx.stroke();
    ctx.fillStyle='#3b3d3e';
    ctx.beginPath();ctx.ellipse(ox+18,oy-11,15,9,0,0,TAU);ctx.fill();

    if(game.oilPour>0){
      const p=game.oilPour/1.05;
      ctx.strokeStyle='rgba(110,72,35,.88)';ctx.lineWidth=5;
      ctx.beginPath();ctx.moveTo(ox+28,oy-8);ctx.quadraticCurveTo(ox+48,oy+35,gateX()+54,gy-2);ctx.stroke();
      ctx.fillStyle=`rgba(91,58,28,${.35*p})`;
      ctx.beginPath();ctx.ellipse(gateX()+54,gy+1,38,7,0,0,TAU);ctx.fill();
    }
  }
}

function drawRoadTraps(){
  if(!game.traps)return;
  const gy=groundY(),rb=riverBounds();
  const tx=game.river?rb.right+95:gateX()+220;

  if(game.traps>=1){
    ctx.fillStyle='#b5b7b4';
    for(let i=-3;i<=3;i++){
      ctx.beginPath();
      ctx.moveTo(tx+i*10,gy-2);ctx.lineTo(tx+i*10+4,gy-17);ctx.lineTo(tx+i*10+8,gy-2);ctx.fill();
    }
  }
  if(game.traps>=2){
    ctx.fillStyle='#4b4339';ctx.beginPath();ctx.arc(tx+55,gy-5,11,0,TAU);ctx.fill();
    ctx.fillStyle='#b3a77f';ctx.fillRect(tx+51,gy-12,8,4);
  }
  if(game.traps>=3){
    ctx.fillStyle='rgba(109,42,29,.72)';
    ctx.fillRect(tx-75,gy-8,26,7);
    ctx.fillStyle='#ff7531';
    ctx.beginPath();ctx.moveTo(tx-70,gy-9);ctx.lineTo(tx-64,gy-22-Math.sin(time*8)*3);ctx.lineTo(tx-58,gy-9);ctx.fill();
  }
}

function drawKnight(k){
  const attack=k.attackAnim>0?Math.sin((1-k.attackAnim)*Math.PI):0;
  const hurt=k.hurt>0;
  const block=k.blockAnim>0?Math.sin((1-k.blockAnim)*Math.PI):0;
  const motion=unitVisual(k),walk=Math.sin(motion.stride)*motion.moving;
  const bob=Math.sin(visual.clock*2.5+k.phase)*.5+Math.abs(walk)*.7;
  const feetY=groundY()-5;

  ctx.save();
  ctx.translate(k.x,feetY);

  if(k.dead){
    const fall=1-clamp(k.death/.55,0,1);
    ctx.translate(0,fall*8);
    ctx.rotate(-fall*1.2);
    ctx.globalAlpha=clamp(k.death/.42,0,1);
  }

  ctx.scale(k.facing||1,1);

  // ground shadow
  ctx.fillStyle='rgba(0,0,0,.30)';
  ctx.beginPath();ctx.ellipse(0,6,18,5,0,0,TAU);ctx.fill();

  // rear cape
  ctx.fillStyle='#7f2632';
  ctx.beginPath();
  ctx.moveTo(-10,-43);
  ctx.lineTo(-19+Math.sin(visual.clock*2.6+k.phase)*2.5,-7);
  ctx.lineTo(-4,-2);
  ctx.lineTo(3,-38);
  ctx.closePath();ctx.fill();

  // greaves
  const steelDark=hurt?'#71484a':'#4c565b';
  const steelMid=hurt?'#9c6466':'#7c898e';
  const steelLight=hurt?'#c48788':'#aeb8bb';

  ctx.fillStyle=steelDark;
  ctx.fillRect(-10+walk*3,-9,7,15);
  ctx.fillRect(4-walk*3,-9,7,15);

  ctx.fillStyle='#25282a';
  ctx.fillRect(-12+walk*3,2,10,5);
  ctx.fillRect(3-walk*3,2,11,5);
  ctx.translate(0,bob);

  // torso plate, beveled
  const armor=ctx.createLinearGradient(-15,0,15,0);
  armor.addColorStop(0,steelDark);
  armor.addColorStop(.45,steelLight);
  armor.addColorStop(.72,steelMid);
  armor.addColorStop(1,steelDark);
  ctx.fillStyle=armor;
  ctx.beginPath();
  ctx.moveTo(-14,-42);ctx.lineTo(13,-42);
  ctx.lineTo(16,-13);ctx.lineTo(10,-6);
  ctx.lineTo(-10,-6);ctx.lineTo(-16,-13);
  ctx.closePath();ctx.fill();

  // chest ridge / crest
  ctx.strokeStyle='rgba(255,255,255,.22)';ctx.lineWidth=1.5;
  ctx.beginPath();ctx.moveTo(0,-39);ctx.lineTo(0,-10);ctx.stroke();
  ctx.fillStyle='#9a3037';
  ctx.fillRect(-11,-28,22,5);

  // belt
  ctx.fillStyle='#50351f';ctx.fillRect(-13,-10,26,4);
  ctx.fillStyle='#d0ad57';ctx.fillRect(-3,-10,6,5);

  // shoulder pauldrons
  ctx.fillStyle=steelMid;
  ctx.beginPath();ctx.ellipse(-14,-37,8,6,-.25,0,TAU);ctx.fill();
  ctx.beginPath();ctx.ellipse(14,-37,8,6,.25,0,TAU);ctx.fill();
  ctx.fillStyle='rgba(255,255,255,.17)';
  ctx.fillRect(-18,-40,8,2);ctx.fillRect(10,-40,8,2);

  // helmet
  ctx.fillStyle=armor;
  ctx.beginPath();ctx.arc(0,-51,12,Math.PI,TAU);ctx.lineTo(11,-43);ctx.lineTo(-11,-43);ctx.closePath();ctx.fill();
  ctx.fillStyle='#333a3d';ctx.fillRect(-12,-50,24,5);

  // visor eye slit
  ctx.fillStyle='#15191b';ctx.fillRect(-8,-49,16,2);
  ctx.fillStyle='#d8c66f';ctx.fillRect(4,-49,2,2);

  // red plume
  ctx.fillStyle='#a33039';
  ctx.beginPath();
  ctx.moveTo(-3,-62);ctx.quadraticCurveTo(3,-76,12,-66);
  ctx.lineTo(4,-57);ctx.closePath();ctx.fill();

  // shield arm
  ctx.save();
  ctx.translate(-14+block*4,-29);

  ctx.fillStyle='#4f5d63';
  ctx.beginPath();
  ctx.moveTo(-13,-14);ctx.lineTo(10,-14);
  ctx.lineTo(13,4);ctx.quadraticCurveTo(0,18,-13,4);ctx.closePath();ctx.fill();

  ctx.strokeStyle='#aab4b6';ctx.lineWidth=2;ctx.stroke();
  ctx.fillStyle='#8e2c35';
  ctx.beginPath();ctx.moveTo(-3,-10);ctx.lineTo(4,-10);ctx.lineTo(4,9);ctx.lineTo(-3,9);ctx.closePath();ctx.fill();
  ctx.fillStyle='#d2b15c';ctx.beginPath();ctx.arc(0,-1,3,0,TAU);ctx.fill();
  ctx.restore();

  // sword arm with visible swing
  ctx.save();
  ctx.translate(13,-32);
  ctx.rotate(-.38-attack*1.22);

  ctx.strokeStyle='#d1a77a';ctx.lineWidth=5;ctx.lineCap='round';
  ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(10,7);ctx.stroke();

  // hilt
  ctx.strokeStyle='#c8a151';ctx.lineWidth=3;
  ctx.beginPath();ctx.moveTo(7,3);ctx.lineTo(14,11);ctx.stroke();
  ctx.beginPath();ctx.moveTo(8,11);ctx.lineTo(17,3);ctx.stroke();

  // blade
  const blade=ctx.createLinearGradient(8,-4,29,-27);
  blade.addColorStop(0,'#778185');
  blade.addColorStop(.5,'#e1e7e7');
  blade.addColorStop(1,'#8a9598');
  ctx.strokeStyle=blade;ctx.lineWidth=4;
  ctx.beginPath();ctx.moveTo(13,5);ctx.lineTo(32,-17);ctx.stroke();

  ctx.fillStyle='#dce3e3';
  ctx.beginPath();ctx.moveTo(32,-17);ctx.lineTo(31,-8);ctx.lineTo(25,-13);ctx.closePath();ctx.fill();
  ctx.restore();

  ctx.restore();

  // readable HP bar
  if(!k.dead&&k.hp<k.maxHp){
    const bw=44,bx=k.x-bw/2,by=feetY-77;
    ctx.fillStyle='rgba(37,18,18,.90)';rr(bx,by,bw,6,3);ctx.fill();
    ctx.fillStyle=k.hp/k.maxHp>.45?'#79c86c':'#e06759';
    rr(bx,by,bw*clamp(k.hp/k.maxHp,0,1),6,3);ctx.fill();
  }
}

function drawStone(s){
  if(s.cx==null)return;
  const position=stoneDrawPosition(s);
  ctx.save();ctx.translate(position.x-s.cx,position.y-s.cy);

  const size=clamp(
    s.size||(s.side==='player'?16:13),
    8,
    BALANCE.catapult.projectileSizeMax
  );
  const dx=s.tx-s.x,dy=s.ty-s.y,len=Math.hypot(dx,dy)||1;
  const nx=dx/len,ny=dy/len;

  ctx.save();
  ctx.globalAlpha=.30;
  ctx.strokeStyle=s.side==='player'?'#d9c9aa':'#9c9182';
  ctx.lineWidth=Math.max(3,size*.45);
  ctx.lineCap='round';
  ctx.beginPath();
  ctx.moveTo(s.cx-nx*size*3.3,s.cy-ny*size*3.3);
  ctx.lineTo(s.cx-nx*size*.8,s.cy-ny*size*.8);
  ctx.stroke();
  ctx.restore();

  ctx.fillStyle='rgba(0,0,0,.24)';
  ctx.beginPath();ctx.arc(s.cx+3,s.cy+4,size+4,0,TAU);ctx.fill();

  const rock=ctx.createRadialGradient(s.cx-size*.35,s.cy-size*.4,2,s.cx,s.cy,size);
  rock.addColorStop(0,s.side==='player'?'#aaa392':'#817c73');
  rock.addColorStop(.45,s.side==='player'?'#77736b':'#57534e');
  rock.addColorStop(1,'#32312f');
  ctx.fillStyle=rock;
  ctx.beginPath();ctx.arc(s.cx,s.cy,size,0,TAU);ctx.fill();

  ctx.fillStyle='rgba(255,255,255,.15)';
  ctx.beginPath();ctx.arc(s.cx-size*.34,s.cy-size*.35,size*.28,0,TAU);ctx.fill();
  ctx.restore();
}

// ---------------- DRAW: RIVER ----------------
function drawRiver(){
  if(!game.river)return;
  const gy=groundY();
  const b=riverBounds();
  const rx=b.left,rw=b.width;

  // deeper water gradient makes moat less flat
  const water=ctx.createLinearGradient(rx,0,rx+rw,0);
  water.addColorStop(0,nightColor('#2f7285','#15334b'));
  water.addColorStop(.18,nightColor('#4699ac','#244d64'));
  water.addColorStop(.55,nightColor('#3e91a6','#335d72'));
  water.addColorStop(.86,nightColor('#347d91','#244a60'));
  water.addColorStop(1,nightColor('#285e70','#132d43'));
  ctx.fillStyle=water;
  ctx.fillRect(rx,gy-14,rw,H-gy+14);

  ctx.fillStyle='rgba(175,226,224,.20)';
  for(let i=0;i<11;i++){
    const yy=gy+i*13+Math.sin(time*2+i)*2.5;
    ctx.fillRect(rx+8+((i*33)%Math.max(20,rw-60)),yy,42,2);
  }

  // banks with darker inner cut
  ctx.fillStyle='#5c513d';ctx.fillRect(rx-8,gy-11,8,H-gy+11);
  ctx.fillRect(rx+rw,gy-11,8,H-gy+11);
  ctx.fillStyle='rgba(26,36,34,.26)';
  ctx.fillRect(rx,gy-11,5,H-gy+11);
  ctx.fillRect(rx+rw-5,gy-11,5,H-gy+11);

  // alligators stay beneath the bridge
  ctx.save();ctx.beginPath();ctx.rect(rx,gy-24,rw,H-gy+24);ctx.clip();
  for(const a of alligators)drawAlligator(a);
  ctx.restore();

  drawBridge();
}
function drawBridge(){
  if(!game.river)return;

  const b=riverBounds();
  const gy=groundY();
  const progress=game.bridge.active?1:game.bridge.buildProgress;

  if(progress<=0&&game.bridge.collapse<=0)return;

  // construction grows from the enemy/right bank toward the castle.
  if(progress>0){
    const span=b.width*progress;
    const left=b.right-span;
    const top=gy-13;
    const bridgeH=24;

    // two structural beams
    ctx.fillStyle='#4b3525';
    ctx.fillRect(left,top+3,span,5);
    ctx.fillRect(left,top+bridgeH-7,span,5);

    // planks
    const plankW=16;
    const count=Math.ceil(span/plankW);
    for(let i=0;i<count;i++){
      const px=b.right-(i+1)*plankW;
      if(px<left-plankW)continue;
      const shade=hash01(i+7300)>.5?'#8a603a':'#77502f';
      ctx.fillStyle=shade;
      ctx.fillRect(Math.max(left,px),top,Math.min(plankW-2,b.right-Math.max(left,px)),bridgeH);

      ctx.fillStyle='rgba(255,225,172,.08)';
      ctx.fillRect(Math.max(left,px)+2,top+2,Math.max(1,Math.min(plankW-5,b.right-Math.max(left,px)-3)),2);
    }

    // metal/rope ties
    ctx.strokeStyle='#3b2b20';
    ctx.lineWidth=2;
    ctx.beginPath();
    ctx.moveTo(left,top+4);ctx.lineTo(b.right,top+4);
    ctx.moveTo(left,top+bridgeH-4);ctx.lineTo(b.right,top+bridgeH-4);
    ctx.stroke();

    if(game.bridge.active){
      // bridge HP bar
      const bw=Math.min(150,b.width*.78);
      const bx=b.center-bw/2;
      const by=gy-43;
      ctx.fillStyle='rgba(35,22,17,.88)';
      rr(bx,by,bw,7,4);ctx.fill();
      ctx.fillStyle='#d49b54';
      rr(bx,by,bw*clamp(game.bridge.hp/game.bridge.maxHp,0,1),7,4);ctx.fill();
    }else{
      // build progress
      const bw=Math.min(130,b.width*.72);
      const bx=b.center-bw/2;
      const by=gy-42;
      ctx.fillStyle='rgba(25,28,29,.72)';
      rr(bx,by,bw,6,3);ctx.fill();
      ctx.fillStyle='#d7b16e';
      rr(bx,by,bw*progress,6,3);ctx.fill();
    }
  }

  // short collapse residue after destruction
  if(game.bridge.collapse>0&&!game.bridge.active){
    const fade=clamp(game.bridge.collapse/.75,0,1);
    ctx.globalAlpha=fade;
    for(let i=0;i<6;i++){
      const px=b.left+18+i*(b.width-36)/5;
      const fall=(1-fade)*18;
      ctx.save();
      ctx.translate(px,gy-4+fall);
      ctx.rotate((i%2?1:-1)*(.12+(1-fade)*.45));
      ctx.fillStyle=i%2?'#785231':'#8a6039';
      ctx.fillRect(-12,-4,24,8);
      ctx.restore();
    }
    ctx.globalAlpha=1;
  }
}
function drawAlligator(a){
  const swim=Math.sin(a.phase*1.7);
  const y=groundY()+10+swim*1.8;
  const rb=riverBounds();
  const displayX=clamp(a.x,rb.left+rb.width*.32,rb.right-rb.width*.32);
  const biteProgress=a.biteAnim>0?1-a.biteAnim:0;
  const biteOpen=a.biteAnim>0?Math.sin(biteProgress*Math.PI):0;
  const lunge=biteOpen*7;
  const dir=a.facing||1;

  ctx.save();
  ctx.translate(displayX+dir*lunge,y);
  ctx.scale(dir,1);

  // water ripple / contact shadow
  ctx.strokeStyle='rgba(190,236,238,.42)';
  ctx.lineWidth=1.5;
  ctx.beginPath();ctx.ellipse(-5,5,48+Math.abs(swim)*3,8,0,0,TAU);ctx.stroke();

  // long tapered tail
  const tail=ctx.createLinearGradient(-56,0,-7,0);
  tail.addColorStop(0,'#233b2a');
  tail.addColorStop(1,'#456548');
  ctx.fillStyle=tail;
  ctx.beginPath();
  ctx.moveTo(-12,-7);
  ctx.bezierCurveTo(-35,-10,-52,-9,-65,-2);
  ctx.bezierCurveTo(-49,0,-42,8,-11,7);
  ctx.closePath();ctx.fill();

  // body: low, broad, armored
  const body=ctx.createLinearGradient(0,-12,0,12);
  body.addColorStop(0,'#587756');
  body.addColorStop(.45,'#3f6244');
  body.addColorStop(1,'#294432');
  ctx.fillStyle=body;
  ctx.beginPath();ctx.ellipse(-7,-1,36,13,0,0,TAU);ctx.fill();

  // belly/side highlight
  ctx.fillStyle='rgba(131,157,105,.30)';
  ctx.beginPath();ctx.ellipse(-2,5,28,6,0,0,Math.PI);ctx.fill();

  // four short legs
  ctx.fillStyle='#2d4b35';
  const legSwing=swim*2;
  for(const [lx,ly,flip] of [[-23,6,-1],[-7,7,1],[7,7,-1],[20,5,1]]){
    ctx.save();ctx.translate(lx,ly);ctx.rotate((flip*legSwing)*.04);
    ctx.fillRect(-4,0,8,10);
    ctx.fillRect(flip<0?-10:2,7,10,4);
    ctx.restore();
  }

  // dorsal scutes — characteristic alligator silhouette
  ctx.fillStyle='#63815b';
  for(let i=0;i<7;i++){
    const sx=-30+i*9;
    const h=5+(i%2)*2;
    ctx.beginPath();
    ctx.moveTo(sx-5,-10);ctx.lineTo(sx,-10-h);ctx.lineTo(sx+5,-10);ctx.closePath();ctx.fill();
  }

  // neck
  ctx.fillStyle='#426347';
  ctx.beginPath();ctx.ellipse(25,-2,18,12,0,0,TAU);ctx.fill();

  // lower jaw — rotates down during bite
  ctx.save();
  ctx.translate(34,1);
  ctx.rotate(biteOpen*.26);
  ctx.fillStyle='#304c37';
  ctx.beginPath();
  ctx.moveTo(-4,0);
  ctx.bezierCurveTo(7,4,23,5,38,1);
  ctx.lineTo(35,8);
  ctx.bezierCurveTo(17,12,5,9,-5,5);
  ctx.closePath();ctx.fill();

  // lower teeth
  ctx.fillStyle='#eee6cd';
  for(let i=0;i<5;i++){
    const tx=5+i*6;
    ctx.beginPath();ctx.moveTo(tx,2);ctx.lineTo(tx+2,-3-biteOpen*2);ctx.lineTo(tx+4,2);ctx.fill();
  }
  ctx.restore();

  // upper head + long snout
  ctx.save();
  ctx.translate(33,-3);
  ctx.rotate(-biteOpen*.14);
  const head=ctx.createLinearGradient(0,-10,0,7);
  head.addColorStop(0,'#58795a');
  head.addColorStop(1,'#35543d');
  ctx.fillStyle=head;
  ctx.beginPath();
  ctx.moveTo(-12,-8);
  ctx.bezierCurveTo(1,-13,17,-11,39,-6);
  ctx.lineTo(42,0);
  ctx.bezierCurveTo(22,3,7,2,-12,5);
  ctx.closePath();ctx.fill();

  // raised eye sockets
  ctx.fillStyle='#66855d';
  ctx.beginPath();ctx.ellipse(-1,-10,7,5,0,0,TAU);ctx.fill();
  ctx.beginPath();ctx.ellipse(10,-9,6,4,0,0,TAU);ctx.fill();

  // eyes
  ctx.fillStyle='#d7cf63';ctx.beginPath();ctx.arc(0,-11,2.2,0,TAU);ctx.fill();
  ctx.fillStyle='#152019';ctx.fillRect(-.6,-13,1.2,4);

  // nostrils near tip
  ctx.fillStyle='#1b2b21';
  ctx.beginPath();ctx.arc(34,-5,1.4,0,TAU);ctx.fill();
  ctx.beginPath();ctx.arc(38,-4,1.2,0,TAU);ctx.fill();

  // upper teeth become visible when mouth opens
  ctx.fillStyle='#f1e8cf';
  for(let i=0;i<6;i++){
    const tx=4+i*6;
    const tooth=3+biteOpen*3;
    ctx.beginPath();ctx.moveTo(tx,1);ctx.lineTo(tx+2,1+tooth);ctx.lineTo(tx+4,1);ctx.fill();
  }
  ctx.restore();

  // bite splash accent
  if(biteOpen>.72){
    ctx.strokeStyle='rgba(218,247,247,.72)';
    ctx.lineWidth=1.4;
    ctx.beginPath();ctx.arc(70,2,12,-1.8,-.2);ctx.stroke();
  }

  ctx.restore();
}

// ---------------- DRAW: ENEMIES ----------------

function drawWyvern(e){
  const season=SEASONS[e.seasonIndex ?? seasonIndexForWave(game.wave)];
  const flap=Math.sin(time*8+e.phase);
  const s=e.scale;

  ctx.save();
  ctx.translate(e.x,e.y);
  ctx.scale(s,s);

  if(e.dead){
    ctx.rotate(-.65);
    ctx.globalAlpha=clamp(e.death/.35,0,1);
  }
  if(e.hurt>0)ctx.globalAlpha=.62;

  // Ground shadow is drawn in world space, independently of wing bobbing.

  // tail
  ctx.strokeStyle=season.id==='winter'?'#365b68':'#425f42';
  ctx.lineWidth=10;ctx.lineCap='round';
  ctx.beginPath();
  ctx.moveTo(14,0);
  ctx.bezierCurveTo(40,8,55,22,69+flap*3,12);
  ctx.stroke();

  ctx.fillStyle=season.id==='winter'?'#83c4d7':'#78936b';
  ctx.beginPath();
  ctx.moveTo(67+flap*3,12);ctx.lineTo(82+flap*3,3);ctx.lineTo(77+flap*3,18);ctx.closePath();ctx.fill();

  // back wing
  ctx.fillStyle=season.id==='winter'?'#446f7e':'#4d674c';
  ctx.beginPath();
  ctx.moveTo(4,-10);
  ctx.lineTo(34,-53-flap*16);
  ctx.lineTo(44,-24);
  ctx.lineTo(55,-45-flap*9);
  ctx.lineTo(45,-4);
  ctx.closePath();ctx.fill();

  // body
  const body=ctx.createLinearGradient(0,-28,0,24);
  body.addColorStop(0,season.id==='winter'?'#719aa2':'#71865e');
  body.addColorStop(1,season.id==='winter'?'#345d67':'#3f5c3e');
  ctx.fillStyle=body;
  ctx.beginPath();ctx.ellipse(3,-2,24,20,-.12,0,TAU);ctx.fill();

  // front wing
  ctx.fillStyle=season.id==='winter'?'#56889a':'#5b7654';
  ctx.beginPath();
  ctx.moveTo(-2,-11);
  ctx.lineTo(-27,-58+flap*16);
  ctx.lineTo(-40,-29);
  ctx.lineTo(-53,-47+flap*10);
  ctx.lineTo(-42,-3);
  ctx.closePath();ctx.fill();

  // neck
  ctx.strokeStyle=season.id==='winter'?'#557f88':'#58734f';
  ctx.lineWidth=13;
  ctx.beginPath();ctx.moveTo(-12,-10);ctx.quadraticCurveTo(-28,-21,-37,-15);ctx.stroke();

  // head facing castle (left)
  ctx.fillStyle=season.id==='winter'?'#729ca4':'#748b60';
  ctx.beginPath();
  ctx.moveTo(-52,-28);
  ctx.quadraticCurveTo(-68,-24,-70,-13);
  ctx.quadraticCurveTo(-62,-4,-41,-8);
  ctx.lineTo(-31,-18);
  ctx.closePath();ctx.fill();

  // snout
  ctx.fillStyle=season.id==='winter'?'#5c8792':'#617b53';
  ctx.beginPath();
  ctx.moveTo(-67,-20);ctx.lineTo(-85,-15);ctx.lineTo(-68,-7);ctx.closePath();ctx.fill();

  // horns
  ctx.fillStyle='#d7d0ae';
  ctx.beginPath();ctx.moveTo(-53,-26);ctx.lineTo(-49,-40);ctx.lineTo(-44,-25);ctx.fill();
  ctx.beginPath();ctx.moveTo(-42,-24);ctx.lineTo(-36,-37);ctx.lineTo(-34,-20);ctx.fill();

  // eye
  ctx.fillStyle='#f5df69';ctx.beginPath();ctx.arc(-58,-17,2.7,0,TAU);ctx.fill();
  ctx.fillStyle='#1e2923';ctx.fillRect(-59,-20,1.2,5);

  // legs / claws
  ctx.strokeStyle=season.id==='winter'?'#345865':'#3e583c';ctx.lineWidth=5;
  ctx.beginPath();
  ctx.moveTo(12,11);ctx.lineTo(18,30);ctx.lineTo(10,35);
  ctx.moveTo(-2,13);ctx.lineTo(-6,30);ctx.lineTo(-15,34);
  ctx.stroke();

  // dorsal spikes
  ctx.fillStyle=season.id==='winter'?'#9bcbd9':'#8da078';
  for(let i=0;i<4;i++){
    const px=-6+i*9;
    ctx.beginPath();ctx.moveTo(px,-18);ctx.lineTo(px+4,-30-(i%2)*4);ctx.lineTo(px+8,-17);ctx.fill();
  }

  ctx.restore();

  if(e.hp<e.maxHp){
    const bw=55*e.scale,bx=e.x-bw/2,by=e.y-60*e.scale;
    ctx.fillStyle='rgba(36,20,20,.9)';rr(bx,by,bw,6,3);ctx.fill();
    ctx.fillStyle='#6aa96d';rr(bx,by,bw*clamp(e.hp/e.maxHp,0,1),6,3);ctx.fill();
  }
}

function drawDragonBoss(e){
  const flap=Math.sin(time*4.8+e.phase);
  const breath=e.attackAnim>0?Math.sin((1-e.attackAnim)*Math.PI):0;

  ctx.save();
  ctx.translate(e.x,e.y);

  if(e.dead){
    ctx.rotate(-.28);
    ctx.globalAlpha=clamp(e.death/.35,0,1);
  }
  if(e.hurt>0)ctx.globalAlpha=.66;

  // Ground shadow is drawn in world space, independently of flying height.

  // far wing
  ctx.fillStyle='#3e6572';
  ctx.beginPath();
  ctx.moveTo(5,-8);
  ctx.lineTo(35,-105-flap*20);
  ctx.lineTo(58,-62);
  ctx.lineTo(86,-104-flap*11);
  ctx.lineTo(78,-38);
  ctx.lineTo(112,-65);
  ctx.lineTo(64,25);
  ctx.closePath();ctx.fill();

  ctx.strokeStyle='rgba(190,225,231,.20)';ctx.lineWidth=3;
  ctx.beginPath();
  ctx.moveTo(11,-8);ctx.lineTo(35,-105-flap*20);
  ctx.moveTo(12,-8);ctx.lineTo(86,-104-flap*11);
  ctx.moveTo(14,-6);ctx.lineTo(112,-65);ctx.stroke();

  // long tail
  ctx.strokeStyle='#315461';ctx.lineWidth=24;ctx.lineCap='round';
  ctx.beginPath();
  ctx.moveTo(32,36);
  ctx.bezierCurveTo(82,49,115,76,151,55+flap*4);
  ctx.stroke();

  ctx.fillStyle='#6d9aa2';
  ctx.beginPath();
  ctx.moveTo(146,55+flap*4);
  ctx.lineTo(178,38+flap*4);
  ctx.lineTo(168,65+flap*4);
  ctx.closePath();ctx.fill();

  // torso
  const dragonBody=ctx.createLinearGradient(-10,-72,25,85);
  dragonBody.addColorStop(0,'#79a0a4');
  dragonBody.addColorStop(.42,'#527985');
  dragonBody.addColorStop(1,'#294c58');
  ctx.fillStyle=dragonBody;
  ctx.beginPath();ctx.ellipse(18,22,57,72,-.22,0,TAU);ctx.fill();

  // belly scales
  ctx.fillStyle='rgba(174,211,211,.28)';
  for(let i=0;i<5;i++){
    ctx.beginPath();ctx.ellipse(-9,7+i*17,22,7,-.2,0,TAU);ctx.fill();
  }

  // curved neck
  ctx.strokeStyle='#537f88';ctx.lineWidth=35;ctx.lineCap='round';
  ctx.beginPath();
  ctx.moveTo(-21,-24);
  ctx.bezierCurveTo(-48,-58,-70,-65,-88,-47);
  ctx.stroke();

  // front wing
  ctx.fillStyle='#4f7b88';
  ctx.beginPath();
  ctx.moveTo(17,-17);
  ctx.lineTo(-5,-121+flap*24);
  ctx.lineTo(-35,-73);
  ctx.lineTo(-65,-116+flap*14);
  ctx.lineTo(-58,-46);
  ctx.lineTo(-95,-66);
  ctx.lineTo(-43,31);
  ctx.closePath();ctx.fill();

  ctx.strokeStyle='rgba(209,237,240,.22)';ctx.lineWidth=3;
  ctx.beginPath();
  ctx.moveTo(10,-14);ctx.lineTo(-5,-121+flap*24);
  ctx.moveTo(8,-12);ctx.lineTo(-65,-116+flap*14);
  ctx.moveTo(4,-8);ctx.lineTo(-95,-66);ctx.stroke();

  // proper dragon head
  ctx.fillStyle='#719ba0';
  ctx.beginPath();
  ctx.moveTo(-94,-72);
  ctx.quadraticCurveTo(-126,-78,-139,-55);
  ctx.lineTo(-127,-36);
  ctx.quadraticCurveTo(-103,-25,-77,-40);
  ctx.lineTo(-68,-59);
  ctx.closePath();ctx.fill();

  // long snout
  ctx.fillStyle='#5f8991';
  ctx.beginPath();
  ctx.moveTo(-125,-61);
  ctx.lineTo(-166,-52);
  ctx.lineTo(-145,-37);
  ctx.lineTo(-117,-39);
  ctx.closePath();ctx.fill();

  // lower jaw
  ctx.fillStyle='#365c68';
  ctx.beginPath();
  ctx.moveTo(-147,-39);
  ctx.lineTo(-169,-45);
  ctx.lineTo(-147,-28-breath*7);
  ctx.lineTo(-117,-36);
  ctx.closePath();ctx.fill();

  // horns
  ctx.fillStyle='#d8d6c1';
  ctx.beginPath();ctx.moveTo(-111,-69);ctx.lineTo(-103,-104);ctx.lineTo(-93,-67);ctx.fill();
  ctx.beginPath();ctx.moveTo(-91,-68);ctx.lineTo(-76,-96);ctx.lineTo(-75,-61);ctx.fill();

  // spikes
  ctx.fillStyle='#91bdc1';
  for(let i=0;i<4;i++){
    const px=-66+i*13;
    ctx.beginPath();
    ctx.moveTo(px,-54+i*5);
    ctx.lineTo(px+8,-80+i*3);
    ctx.lineTo(px+14,-48+i*5);
    ctx.closePath();ctx.fill();
  }

  // eye
  ctx.fillStyle='#d9f6ff';ctx.shadowBlur=7;ctx.shadowColor='#9ee8ff';
  ctx.beginPath();ctx.arc(-126,-57,5,0,TAU);ctx.fill();
  ctx.shadowBlur=0;
  ctx.fillStyle='#12222a';ctx.fillRect(-127,-62,1.7,10);

  // nostril
  ctx.fillStyle='#243c44';
  ctx.beginPath();ctx.arc(-154,-51,2.2,0,TAU);ctx.fill();

  // teeth
  ctx.fillStyle='#f0ead6';
  for(let i=0;i<5;i++){
    const tx=-151+i*7;
    ctx.beginPath();ctx.moveTo(tx,-40);ctx.lineTo(tx+3,-31-breath*3);ctx.lineTo(tx+6,-39);ctx.fill();
  }

  // legs + claws
  ctx.strokeStyle='#355865';ctx.lineWidth=14;ctx.lineCap='round';
  ctx.beginPath();
  ctx.moveTo(-20,48);ctx.lineTo(-45,92);ctx.lineTo(-65,102);
  ctx.moveTo(30,55);ctx.lineTo(13,101);ctx.lineTo(-5,112);ctx.stroke();

  ctx.strokeStyle='#d5dccf';ctx.lineWidth=3;
  for(const [cx,cy] of [[-65,102],[-5,112]]){
    ctx.beginPath();
    ctx.moveTo(cx,cy);ctx.lineTo(cx-13,cy+8);
    ctx.moveTo(cx,cy);ctx.lineTo(cx-3,cy+12);
    ctx.moveTo(cx,cy);ctx.lineTo(cx+7,cy+9);ctx.stroke();
  }

  // icy breath
  if(breath>.08){
    const alpha=.22+.45*breath;
    const cone=ctx.createLinearGradient(-172,-45,-310,-36);
    cone.addColorStop(0,`rgba(215,249,255,${alpha})`);
    cone.addColorStop(1,'rgba(116,215,242,0)');
    ctx.fillStyle=cone;
    ctx.beginPath();
    ctx.moveTo(-168,-48);
    ctx.lineTo(-315,-86-breath*12);
    ctx.lineTo(-315,5+breath*12);
    ctx.lineTo(-165,-34);
    ctx.closePath();ctx.fill();

    ctx.strokeStyle=`rgba(236,253,255,${.65*breath})`;
    ctx.lineWidth=3;
    for(let i=0;i<5;i++){
      ctx.beginPath();
      ctx.moveTo(-180,-44+i*3);
      ctx.lineTo(-250-i*8,-57+i*18);
      ctx.stroke();
    }
  }

  ctx.restore();

  if(e.hp<e.maxHp){
    const bw=165,bx=e.x-bw/2,by=e.y-142;
    ctx.fillStyle='rgba(36,20,20,.92)';rr(bx,by,bw,9,5);ctx.fill();
    ctx.fillStyle='#69c5d8';rr(bx,by,bw*clamp(e.hp/e.maxHp,0,1),9,5);ctx.fill();
  }
}

function drawGoblin(e){
  const s=e.scale;
  const season=litEnemySeason(e,SEASONS[e.seasonIndex ?? seasonIndexForWave(game.wave)]);
  const carriesTorch=visual.night>.04&&!e.dead&&isTorchBearer(e);

  if(e.type==='flyer'){
    drawWyvern(e);
    return;
  }
  if(e.type==='dragon'){
    drawDragonBoss(e);
    return;
  }

  // legacy branch below is intentionally unreachable for dragons.
  if(e.type==='dragon'){
    ctx.save();
    ctx.translate(e.x,e.y);
    const flap=Math.sin(time*6+e.phase)*18;

    ctx.fillStyle='rgba(0,0,0,.22)';
    ctx.beginPath();ctx.ellipse(0,90,55,11,0,0,TAU);ctx.fill();

    const wing='#496d78';
    ctx.fillStyle=wing;
    ctx.beginPath();ctx.moveTo(-25,-5);ctx.lineTo(-115,-48-flap);ctx.lineTo(-75,18);ctx.closePath();ctx.fill();
    ctx.beginPath();ctx.moveTo(25,-5);ctx.lineTo(115,-48-flap);ctx.lineTo(75,18);ctx.closePath();ctx.fill();

    const body=ctx.createLinearGradient(0,-65,0,70);
    body.addColorStop(0,'#6e9194');body.addColorStop(1,'#31515c');
    ctx.fillStyle=body;ctx.beginPath();ctx.ellipse(0,5,42,72,0,0,TAU);ctx.fill();

    ctx.fillStyle='#7ba6a8';ctx.beginPath();ctx.ellipse(0,-62,33,28,0,0,TAU);ctx.fill();
    ctx.beginPath();ctx.moveTo(-21,-77);ctx.lineTo(-35,-105);ctx.lineTo(-10,-82);ctx.fill();
    ctx.beginPath();ctx.moveTo(21,-77);ctx.lineTo(35,-105);ctx.lineTo(10,-82);ctx.fill();

    ctx.fillStyle='#b9ebf3';ctx.fillRect(-14,-69,7,4);ctx.fillRect(7,-69,7,4);
    ctx.fillStyle='#26393e';ctx.fillRect(-11,-69,2,4);ctx.fillRect(10,-69,2,4);

    ctx.fillStyle='#537783';
    ctx.beginPath();ctx.moveTo(0,66);ctx.lineTo(-18,120);ctx.lineTo(18,120);ctx.closePath();ctx.fill();

    ctx.restore();

    if(e.hp<e.maxHp){
      const bw=120,bx=e.x-bw/2,by=e.y-118;
      ctx.fillStyle='rgba(36,20,20,.9)';rr(bx,by,bw,8,4);ctx.fill();
      ctx.fillStyle='#57b8d2';rr(bx,by,bw*clamp(e.hp/e.maxHp,0,1),8,4);ctx.fill();
    }
    return;
  }

  const motion=unitVisual(e);
  const walk=Math.sin(motion.stride)*motion.moving;
  const bob=Math.abs(walk)*1.5+Math.sin(visual.clock*2.7+e.phase)*.45;
  const flinch=clamp(1-(visual.clock-motion.hit)/.22,0,1);
  const attack=e.attackAnim>0?Math.sin((1-e.attackAnim)*Math.PI)*7*s:0;

  ctx.save();
  ctx.translate(e.x-attack+flinch*3,groundY()-7);
  ctx.scale(s,s);

  if(e.dead){
    ctx.rotate(-.75);
    ctx.globalAlpha=clamp(e.death/.35,0,1);
  }
  if(e.hurt>0&&!e.dead)ctx.globalAlpha=.88;

  // legs
  ctx.strokeStyle='#3c3327';ctx.lineWidth=7;ctx.lineCap='round';
  ctx.beginPath();
  ctx.moveTo(-7,-3);ctx.lineTo(-10+walk*4,14);
  ctx.moveTo(7,-3);ctx.lineTo(10-walk*4,14);
  ctx.stroke();

  // boots
  ctx.strokeStyle='#241d18';ctx.lineWidth=8;
  ctx.beginPath();
  ctx.moveTo(-10+walk*4,14);ctx.lineTo(-15+walk*4,16);
  ctx.moveTo(10-walk*4,14);ctx.lineTo(15-walk*4,16);
  ctx.stroke();
  // Feet and shadow stay grounded; only the torso breathes and recoils.
  ctx.translate(flinch*2,-bob);
  ctx.rotate(flinch*.055);

  // engineer backpack and lumber carried behind the body
  if(e.type==='builder'){
    ctx.fillStyle='#65472f';
    rr(-19,-37,13,30,3);ctx.fill();
    ctx.strokeStyle='#35261b';ctx.lineWidth=2;ctx.stroke();

    ctx.save();
    ctx.rotate(-.16);
    ctx.fillStyle='#91633a';
    ctx.fillRect(-28,-42,5,39);
    ctx.fillRect(-20,-44,5,39);
    ctx.restore();

    ctx.strokeStyle='#b49762';ctx.lineWidth=2;
    ctx.beginPath();ctx.moveTo(-16,-34);ctx.lineTo(-7,-5);ctx.stroke();
  }

  // torso armor/clothes
  if(e.type==='brute'){
    ctx.fillStyle=season.id==='winter'?'#465766':season.id==='autumn'?'#65493a':'#5b4535';
    ctx.beginPath();ctx.ellipse(0,-19,20,25,0,0,TAU);ctx.fill();
    ctx.fillStyle=season.id==='winter'?'#8999a4':'#757b70';ctx.fillRect(-17,-31,34,8);
  }else if(e.type==='shaman'){
    ctx.fillStyle=season.id==='summer'?'#68432c':season.id==='winter'?'#384f64':'#45375f';
    ctx.beginPath();ctx.ellipse(0,-19,17,24,0,0,TAU);ctx.fill();
  }else if(e.type==='builder'){
    const worker=ctx.createLinearGradient(-17,0,17,0);
    worker.addColorStop(0,'#5c3827');
    worker.addColorStop(.5,'#9b6535');
    worker.addColorStop(1,'#4d3024');
    ctx.fillStyle=worker;
    ctx.beginPath();ctx.ellipse(0,-19,18,24,0,0,TAU);ctx.fill();

    // work apron
    ctx.fillStyle='#6b5034';
    ctx.fillRect(-11,-24,22,25);
  }else if(e.type==='archer'){
    const archerCloth=ctx.createLinearGradient(-17,0,17,0);
    archerCloth.addColorStop(0,season.id==='winter'?'#263d4d':'#323c29');
    archerCloth.addColorStop(.5,season.id==='autumn'?'#78523b':season.id==='summer'?'#6c5531':'#506044');
    archerCloth.addColorStop(1,season.id==='winter'?'#1f3340':'#293225');
    ctx.fillStyle=archerCloth;
    ctx.beginPath();ctx.ellipse(0,-19,17,24,0,0,TAU);ctx.fill();

    // leather chest strap
    ctx.strokeStyle='#65412a';ctx.lineWidth=4;
    ctx.beginPath();ctx.moveTo(-10,-34);ctx.lineTo(10,-5);ctx.stroke();
  }else{
    ctx.fillStyle=season.cloth;
    ctx.beginPath();ctx.ellipse(0,-19,17,24,0,0,TAU);ctx.fill();
  }

  // belt
  ctx.fillStyle='#24201c';ctx.fillRect(-15,-7,30,5);
  ctx.fillStyle='#a18a4a';ctx.fillRect(-2,-7,5,5);

  // head
  ctx.fillStyle=e.type==='boss'?season.bossColor:season.goblinSkin;
  ctx.beginPath();ctx.arc(0,-49,17,0,TAU);ctx.fill();

  // ears
  ctx.beginPath();ctx.moveTo(-13,-52);ctx.lineTo(-31,-58);ctx.lineTo(-16,-40);ctx.fill();
  ctx.beginPath();ctx.moveTo(13,-52);ctx.lineTo(31,-58);ctx.lineTo(16,-40);ctx.fill();

  // nose
  ctx.fillStyle=season.goblinDark;
  ctx.beginPath();ctx.moveTo(-3,-48);ctx.lineTo(2,-41);ctx.lineTo(6,-49);ctx.fill();

  // eyes
  ctx.fillStyle='#e8df79';
  ctx.fillRect(-8,-54,5,3);ctx.fillRect(4,-54,5,3);
  ctx.fillStyle='#261f1a';
  ctx.fillRect(-6,-54,2,3);ctx.fillRect(5,-54,2,3);

  // mouth + tusks
  ctx.strokeStyle='#2d251f';ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(-7,-39);ctx.quadraticCurveTo(0,-34,8,-40);ctx.stroke();
  ctx.fillStyle='#eee4cc';
  ctx.beginPath();ctx.moveTo(-6,-38);ctx.lineTo(-3,-31);ctx.lineTo(0,-38);ctx.fill();
  ctx.beginPath();ctx.moveTo(4,-38);ctx.lineTo(7,-31);ctx.lineTo(9,-39);ctx.fill();

  // helmet variations
  if(e.type==='brute'||e.type==='boss'){
    ctx.fillStyle=e.type==='boss'
      ?(season.id==='winter'?'#607484':season.id==='summer'?'#614437':'#514c46')
      :(season.id==='winter'?'#71808a':'#595d59');
    ctx.beginPath();ctx.arc(0,-54,18,Math.PI,TAU);ctx.lineTo(16,-47);ctx.lineTo(-16,-47);ctx.closePath();ctx.fill();
    ctx.fillStyle='#343634';ctx.fillRect(-18,-50,36,4);
  }

  if(e.type==='builder'){
    // rough leather work cap
    ctx.fillStyle='#6c4a2d';
    ctx.beginPath();ctx.arc(0,-54,17,Math.PI,TAU);ctx.lineTo(15,-49);ctx.lineTo(-15,-49);ctx.closePath();ctx.fill();
    ctx.fillStyle='#9f6b37';ctx.fillRect(-18,-51,36,4);
  }

  if(e.type==='archer'){
    ctx.fillStyle=season.id==='winter'?'#294b5c':'#344832';
    ctx.beginPath();ctx.arc(0,-54,18,Math.PI,TAU);ctx.lineTo(15,-45);ctx.lineTo(-15,-45);ctx.closePath();ctx.fill();
    ctx.beginPath();ctx.moveTo(-14,-47);ctx.lineTo(-23,-31);ctx.lineTo(-5,-39);ctx.closePath();ctx.fill();
  }

  // shield
  if(e.type!=='runner'&&e.type!=='shaman'&&e.type!=='builder'&&e.type!=='archer'){
    ctx.save();
    ctx.translate(-20,-17);
    ctx.rotate(-flinch*.32);ctx.scale(1-flinch*.14,1);
    ctx.fillStyle=e.type==='boss'
      ?season.bossAccent
      :(season.id==='winter'?'#3e5969':season.id==='autumn'?'#6a4130':'#5a3527');
    ctx.beginPath();ctx.arc(0,0,16,0,TAU);ctx.fill();
    ctx.strokeStyle='#949b98';ctx.lineWidth=3;ctx.stroke();
    ctx.strokeStyle='#8f9692';ctx.lineWidth=3;
    ctx.beginPath();ctx.moveTo(-11,0);ctx.lineTo(11,0);ctx.moveTo(0,-11);ctx.lineTo(0,11);ctx.stroke();
    ctx.restore();
  }

  // weapon arm
  ctx.strokeStyle=visual.night>.001?season.goblinDark:'#5d7839';ctx.lineWidth=6;
  ctx.beginPath();ctx.moveTo(12,-21);ctx.lineTo(carriesTorch?28:22+attack*.5,carriesTorch?-30:-8);ctx.stroke();

  if(e.type==='shaman'){
    ctx.strokeStyle='#6a4d2d';ctx.lineWidth=4;
    ctx.beginPath();ctx.moveTo(21,-10);ctx.lineTo(31,13);ctx.stroke();
    const orbCol=season.id==='winter'?'#84d8ff':season.id==='summer'?'#ff9d4e':season.id==='autumn'?'#c7749f':'#9f79d7';
    ctx.fillStyle=orbCol;ctx.shadowBlur=8;ctx.shadowColor=orbCol;
    ctx.beginPath();ctx.arc(21,-11,5,0,TAU);ctx.fill();ctx.shadowBlur=0;
  }else if(e.type==='builder'){
    const hammerSwing=e.building?Math.sin(time*11)*.72:-.18;
    ctx.save();
    ctx.translate(20,-10);
    ctx.rotate(hammerSwing);
    ctx.strokeStyle='#563923';ctx.lineWidth=4;
    ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(19,-18);ctx.stroke();

    ctx.fillStyle='#747879';
    ctx.fillRect(14,-24,15,8);
    ctx.fillStyle='#4c5051';
    ctx.fillRect(17,-26,9,3);
    ctx.restore();

    // tool belt
    ctx.fillStyle='#8b633b';
    ctx.fillRect(8,-7,8,8);
    ctx.fillStyle='#c2a36d';
    ctx.fillRect(10,-5,2,5);
  }else if(e.type==='archer'){
    const pull=e.rangedAnim>0?Math.sin((1-e.rangedAnim)*Math.PI)*5:0;

    // front arm
    ctx.strokeStyle='#6e8c45';ctx.lineWidth=5;
    ctx.beginPath();ctx.moveTo(11,-20);ctx.lineTo(23,-14);ctx.stroke();

    // bow
    ctx.strokeStyle='#895f32';ctx.lineWidth=2.4;
    ctx.beginPath();ctx.arc(29,-14,17,-1.35,1.35);ctx.stroke();

    // bowstring
    ctx.strokeStyle='#d7cfb7';ctx.lineWidth=1;
    ctx.beginPath();
    ctx.moveTo(33,-30);
    ctx.lineTo(22-pull,-14);
    ctx.lineTo(33,2);
    ctx.stroke();

    // nocked arrow
    if(e.ranged){
      ctx.strokeStyle='#6f4d2c';ctx.lineWidth=1.7;
      ctx.beginPath();ctx.moveTo(20-pull,-14);ctx.lineTo(41,-14);ctx.stroke();
      ctx.fillStyle='#bcc2c2';
      ctx.beginPath();ctx.moveTo(45,-14);ctx.lineTo(39,-18);ctx.lineTo(39,-10);ctx.closePath();ctx.fill();
    }

    // quiver
    ctx.fillStyle='#5b3825';
    ctx.fillRect(-15,-31,7,28);
    ctx.strokeStyle='#c5a36c';ctx.lineWidth=1.2;
    for(let qi=0;qi<3;qi++){
      ctx.beginPath();ctx.moveTo(-13+qi*2,-31);ctx.lineTo(-10+qi*2,-44);ctx.stroke();
    }
  }else if(carriesTorch){
    drawGoblinTorch(e);
  }else{
    ctx.strokeStyle='#4f3624';ctx.lineWidth=4;
    ctx.beginPath();ctx.moveTo(21,-10);ctx.lineTo(33+attack*.6,5);ctx.stroke();
    ctx.fillStyle='#9da3a4';
    ctx.beginPath();
    ctx.moveTo(28+attack*.6,-2);ctx.lineTo(40+attack*.6,5);ctx.lineTo(31+attack*.6,12);ctx.closePath();ctx.fill();
  }

  // special enemy silhouettes
  if(e.type==='ram'){
    ctx.fillStyle='#5c422b';
    ctx.fillRect(-40,-4,70,10);
    ctx.strokeStyle='#2f251d';ctx.lineWidth=5;
    ctx.beginPath();ctx.moveTo(24,-4);ctx.lineTo(45,-16);ctx.stroke();
    ctx.fillStyle='#777b79';ctx.beginPath();ctx.moveTo(45,-20);ctx.lineTo(57,-16);ctx.lineTo(45,-12);ctx.fill();
  }
  if(e.type==='catapult'){
    ctx.fillStyle='#513720';
    ctx.fillRect(-36,-1,65,9);
    ctx.beginPath();ctx.arc(-25,9,8,0,TAU);ctx.arc(18,9,8,0,TAU);ctx.fill();
    ctx.strokeStyle='#6d4a2a';ctx.lineWidth=5;
    ctx.beginPath();ctx.moveTo(-2,-4);ctx.lineTo(24,-36);ctx.stroke();
    ctx.fillStyle='#44494a';ctx.beginPath();ctx.arc(27,-40,7,0,TAU);ctx.fill();
  }
  if(e.type==='bomber'){
    ctx.fillStyle='#282828';ctx.beginPath();ctx.arc(20,-18,13,0,TAU);ctx.fill();
    ctx.strokeStyle='#8c6b3d';ctx.lineWidth=2;
    ctx.beginPath();ctx.moveTo(25,-29);ctx.quadraticCurveTo(34,-40,39,-32);ctx.stroke();
    ctx.fillStyle='#ffb441';ctx.beginPath();ctx.arc(39,-32,3+Math.sin(time*10),0,TAU);ctx.fill();
  }
  if(e.type==='armored'){
    ctx.fillStyle='rgba(145,153,156,.75)';
    ctx.fillRect(-16,-33,32,21);
    ctx.strokeStyle='#5d6568';ctx.lineWidth=2;ctx.strokeRect(-16,-33,32,21);
  }
  if(e.type==='poison'){
    ctx.fillStyle='#6da44e';
    ctx.beginPath();ctx.arc(22,-10,7,0,TAU);ctx.fill();
    ctx.fillStyle='#a8e776';ctx.beginPath();ctx.arc(24,-13,3,0,TAU);ctx.fill();
  }
  if(e.type==='healer'){
    ctx.strokeStyle='#9fe891';ctx.lineWidth=2;
    ctx.beginPath();ctx.arc(0,-22,22+(e.healPulse||0)*5,0,TAU);ctx.stroke();
    ctx.fillStyle='#b9f2a6';ctx.fillRect(-3,-7,6,15);ctx.fillRect(-8,-2,16,6);
  }
  if(e.type==='necromancer'){
    ctx.fillStyle='#4a315f';ctx.fillRect(-18,-33,36,6);
    ctx.fillStyle='#cab0e6';ctx.beginPath();ctx.arc(22,-13,5,0,TAU);ctx.fill();
  }
  if(e.type==='undead'){
    ctx.globalAlpha*=.72;
    ctx.fillStyle='rgba(198,202,188,.35)';ctx.fillRect(-18,-65,36,62);
  }
  if(e.type==='miniboss'){
    ctx.strokeStyle='#e25c52';ctx.lineWidth=3;
    ctx.beginPath();ctx.arc(0,-30,34,0,TAU);ctx.stroke();
  }

  // boss decorations
  if(e.type==='boss'){
    ctx.fillStyle='#d4b14d';
    ctx.beginPath();
    ctx.moveTo(-15,-67);ctx.lineTo(-8,-80);ctx.lineTo(0,-68);
    ctx.lineTo(8,-81);ctx.lineTo(15,-66);ctx.closePath();ctx.fill();

    ctx.fillStyle=season.bossAccent;ctx.fillRect(-18,-28,36,7);

    // unique seasonal boss silhouette accents
    if(season.id==='summer'){
      ctx.fillStyle='#dc7b35';
      ctx.beginPath();ctx.moveTo(-22,-58);ctx.lineTo(-31,-70);ctx.lineTo(-18,-66);ctx.fill();
    }else if(season.id==='autumn'){
      ctx.fillStyle='#6e3445';
      ctx.fillRect(-23,-31,5,18);
      ctx.fillRect(18,-31,5,18);
    }else if(season.id==='winter'){
      ctx.fillStyle='#9bd6ea';
      ctx.beginPath();ctx.moveTo(-12,-72);ctx.lineTo(-7,-88);ctx.lineTo(-2,-72);ctx.fill();
      ctx.beginPath();ctx.moveTo(4,-72);ctx.lineTo(10,-90);ctx.lineTo(14,-72);ctx.fill();
    }
  }

  // burning
  if(e.burning>0){
    ctx.globalAlpha=.86;
    ctx.fillStyle='#ff6c2d';
    ctx.beginPath();
    ctx.moveTo(-10,2);ctx.quadraticCurveTo(-19,-18,-6,-28);
    ctx.quadraticCurveTo(-5,-9,3,-5);
    ctx.quadraticCurveTo(7,-25,14,-8);ctx.lineTo(10,5);ctx.closePath();ctx.fill();
  }

  ctx.restore();

  // HP
  if(e.hp<e.maxHp||e.type==='boss'){
    const bw=44*e.scale,bx=e.x-bw/2,by=groundY()-7-82*e.scale;
    ctx.fillStyle='rgba(36,20,20,.9)';rr(bx,by,bw,6,3);ctx.fill();
    ctx.fillStyle=e.type==='boss'?'#e34e48':'#83bf4b';rr(bx,by,bw*clamp(e.hp/e.maxHp,0,1),6,3);ctx.fill();
  }
}

// ---------------- DRAW EFFECTS ----------------
