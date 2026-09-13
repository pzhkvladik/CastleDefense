const VISUAL_CHAPTERS=CHAPTER_THEMES.map(t=>({
  id:t.id,title:t.chapter,skin:t.goblinSkin,dark:t.goblinDark,cloth:t.cloth
}));

function chapterIndexForWave(w){return seasonIndexForWave(w);}
function visualChapter(w=game.wave){return VISUAL_CHAPTERS[chapterIndexForWave(w)];}
function chapterEnemyPalette(e,base){
  const chapter=CHAPTER_THEMES[chapterIndexForWave(game.wave)];
  return {...base,goblinSkin:chapter.goblinSkin,goblinDark:chapter.goblinDark,cloth:chapter.cloth,
    bossColor:chapter.bossColor,bossAccent:chapter.bossAccent,bossName:chapter.bossName};
}
function activeBossChapter(){
  if(!game?.boss||game.boss.dead)return null;
  return CHAPTER_THEMES[game.boss.seasonIndex ?? chapterIndexForWave(game.wave)];
}

function chapterRoad(){
  ctx.beginPath();
  ctx.moveTo(W*.16,H);
  ctx.lineTo(W*.86,H);
  ctx.lineTo(W*.72,groundY()-22);
  ctx.lineTo(W*.29,groundY()-22);
  ctx.closePath();
}
function chapterRock(x,y,s,color){
  ctx.fillStyle=color;
  ctx.beginPath();
  ctx.moveTo(x-18*s,y);ctx.lineTo(x-12*s,y-12*s);ctx.lineTo(x-2*s,y-20*s);
  ctx.lineTo(x+12*s,y-15*s);ctx.lineTo(x+20*s,y-4*s);ctx.lineTo(x+14*s,y);ctx.closePath();ctx.fill();
}
function chapterGrass(x,y,s,color='#365a31'){
  ctx.strokeStyle=color;ctx.lineWidth=Math.max(1,1.4*s);ctx.beginPath();
  ctx.moveTo(x,y);ctx.lineTo(x-5*s,y-11*s);
  ctx.moveTo(x,y);ctx.lineTo(x+1*s,y-15*s);
  ctx.moveTo(x,y);ctx.lineTo(x+7*s,y-9*s);
  ctx.stroke();
}
function chapterFlower(x,y,s,p1='#d4f08f',p2='#ffffff'){
  ctx.strokeStyle='#4f753b';ctx.lineWidth=Math.max(.7,1*s);ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x,y-10*s);ctx.stroke();
  ctx.fillStyle=p1;
  for(const [dx,dy] of [[-3,-9],[0,-12],[3,-9],[0,-6]]){ctx.beginPath();ctx.arc(x+dx*s,y+dy*s,2.4*s,0,TAU);ctx.fill();}
  ctx.fillStyle=p2;ctx.beginPath();ctx.arc(x,y-9*s,1.5*s,0,TAU);ctx.fill();
}
function chapterBush(x,y,s,color='#47793f'){
  ctx.fillStyle=color;
  for(const [dx,dy,r] of [[-14,0,12],[0,-6,15],[15,1,11]]){ctx.beginPath();ctx.arc(x+dx*s,y+dy*s,r*s,0,TAU);ctx.fill();}
  ctx.fillStyle='rgba(255,255,255,.05)';ctx.beginPath();ctx.ellipse(x-4*s,y-10*s,11*s,4*s,-.25,0,TAU);ctx.fill();
}
function chapterTree(x,y,s,leaf='#487946',wood='#584330',variant=0,dead=false){
  ctx.save();ctx.translate(x,y);
  const lean=(variant%3-1)*5*s;
  ctx.fillStyle=wood;
  ctx.beginPath();
  ctx.moveTo(-6*s,2);ctx.lineTo(-4*s,-48*s);ctx.lineTo(lean-2*s,-82*s);
  ctx.lineTo(lean+5*s,-82*s);ctx.lineTo(6*s,-47*s);ctx.lineTo(8*s,2);ctx.closePath();ctx.fill();
  ctx.strokeStyle=wood;ctx.lineCap='round';ctx.lineWidth=4*s;
  ctx.beginPath();
  ctx.moveTo(lean*.45,-45*s);ctx.lineTo(-28*s+(variant%2)*9*s,-69*s);
  ctx.moveTo(lean*.65,-57*s);ctx.lineTo(30*s-(variant%2)*6*s,-76*s);
  ctx.stroke();
  if(dead){
    ctx.lineWidth=3*s;ctx.beginPath();
    ctx.moveTo(-25*s,-67*s);ctx.lineTo(-35*s,-84*s);
    ctx.moveTo(27*s,-75*s);ctx.lineTo(38*s,-91*s);
    ctx.moveTo(lean,-80*s);ctx.lineTo(lean-8*s,-97*s);ctx.stroke();
    ctx.restore();return;
  }
  const clusters=variant%3===0
    ?[[-27,-79,34,25],[4,-101,43,31],[37,-81,31,24],[5,-72,39,25]]
    :variant%3===1
      ?[[-31,-88,31,24],[5,-106,40,28],[37,-91,30,23],[-2,-73,42,25]]
      :[[-38,-78,30,23],[-16,-104,37,29],[21,-105,39,29],[45,-80,27,21],[6,-72,40,24]];
  ctx.fillStyle=leaf;
  for(const [cx,cy,rx,ry] of clusters){
    ctx.beginPath();
    ctx.moveTo((cx-rx)*s,cy*s);
    ctx.bezierCurveTo((cx-rx*.72)*s,(cy-ry*.85)*s,(cx-rx*.16)*s,(cy-ry)*s,cx*s,(cy-ry*.82)*s);
    ctx.bezierCurveTo((cx+rx*.62)*s,(cy-ry)*s,(cx+rx)*s,(cy-ry*.38)*s,(cx+rx)*s,cy*s);
    ctx.bezierCurveTo((cx+rx*.9)*s,(cy+ry*.62)*s,(cx+rx*.2)*s,(cy+ry)*s,cx*s,(cy+ry*.72)*s);
    ctx.bezierCurveTo((cx-rx*.55)*s,(cy+ry)*s,(cx-rx)*s,(cy+ry*.44)*s,(cx-rx)*s,cy*s);
    ctx.fill();
  }
  ctx.globalAlpha=.18;ctx.fillStyle='#102d1e';ctx.beginPath();ctx.ellipse(3*s,-72*s,44*s,13*s,0,0,TAU);ctx.fill();
  ctx.globalAlpha=.10;ctx.fillStyle='#ffffff';ctx.beginPath();ctx.ellipse(-12*s,-108*s,27*s,8*s,-.2,0,TAU);ctx.fill();
  ctx.restore();
}
function chapterPine(x,y,s,dark='#38584f',snow=0){
  ctx.fillStyle='#51463d';ctx.fillRect(x-3*s,y-72*s,6*s,72*s);
  for(let i=0;i<4;i++){
    const top=y-(102-i*20)*s,w=(29-i*3)*s;
    ctx.fillStyle=i%2?dark:'#45675d';ctx.beginPath();ctx.moveTo(x,top);ctx.lineTo(x-w,top+39*s);ctx.lineTo(x+w,top+39*s);ctx.closePath();ctx.fill();
    if(snow){ctx.fillStyle=`rgba(238,247,250,${.75*snow})`;ctx.beginPath();ctx.moveTo(x,top+4*s);ctx.lineTo(x-w*.72,top+31*s);ctx.lineTo(x+w*.52,top+31*s);ctx.closePath();ctx.fill();}
  }
}
function chapterCrack(x,y,s,color){
  ctx.strokeStyle=color;ctx.lineWidth=2.3*s;ctx.shadowColor=color;ctx.shadowBlur=8*s;
  ctx.beginPath();ctx.moveTo(x-27*s,y-5*s);ctx.lineTo(x-9*s,y);ctx.lineTo(x-14*s,y+9*s);ctx.lineTo(x+7*s,y+4*s);ctx.lineTo(x+25*s,y+13*s);ctx.stroke();ctx.shadowBlur=0;
}
function chapterLog(x,y,s){
  ctx.fillStyle='#6b4c31';ctx.beginPath();ctx.moveTo(x-28*s,y-8*s);ctx.lineTo(x+22*s,y-12*s);ctx.lineTo(x+30*s,y+2*s);ctx.lineTo(x-23*s,y+6*s);ctx.closePath();ctx.fill();
  ctx.fillStyle='#8d6a46';ctx.beginPath();ctx.arc(x+22*s,y-5*s,7*s,0,TAU);ctx.fill();
  ctx.fillStyle='rgba(255,255,255,.12)';ctx.fillRect(x-14*s,y-6*s,26*s,2*s);
}
function chapterSnowDrift(x,y,s){
  ctx.fillStyle='rgba(246,252,254,.88)';ctx.beginPath();ctx.ellipse(x,y,18*s,5*s,0,0,TAU);ctx.fill();
  ctx.fillStyle='rgba(207,227,234,.45)';ctx.beginPath();ctx.ellipse(x+4*s,y+1*s,11*s,2.4*s,0,0,TAU);ctx.fill();
}
function chapterIceShard(x,y,s){
  ctx.fillStyle='rgba(187,226,238,.78)';ctx.beginPath();ctx.moveTo(x-4*s,y);ctx.lineTo(x+1*s,y-24*s);ctx.lineTo(x+7*s,y-2*s);ctx.closePath();ctx.fill();
  ctx.fillStyle='rgba(239,251,255,.35)';ctx.beginPath();ctx.moveTo(x+1*s,y-20*s);ctx.lineTo(x+3*s,y-3*s);ctx.lineTo(x+5*s,y-4*s);ctx.closePath();ctx.fill();
}
function chapterMushroom(x,y,s,cap='#6a4b6f',stem='#c8bfaa'){
  ctx.fillStyle=stem;ctx.fillRect(x-2*s,y-14*s,4*s,14*s);
  ctx.fillStyle=cap;ctx.beginPath();ctx.arc(x,y-14*s,10*s,Math.PI,TAU);ctx.lineTo(x+10*s,y-12*s);ctx.lineTo(x-10*s,y-12*s);ctx.closePath();ctx.fill();
  ctx.fillStyle='rgba(255,255,255,.22)';ctx.beginPath();ctx.arc(x-3*s,y-18*s,2.1*s,0,TAU);ctx.arc(x+3*s,y-16*s,1.7*s,0,TAU);ctx.fill();
}
function chapterThorn(x,y,s,color='#2b3a2f'){
  ctx.strokeStyle=color;ctx.lineWidth=2.1*s;ctx.lineCap='round';ctx.beginPath();
  ctx.moveTo(x,y);ctx.lineTo(x+6*s,y-14*s);ctx.lineTo(x+10*s,y-24*s);
  ctx.moveTo(x+6*s,y-14*s);ctx.lineTo(x-3*s,y-22*s);
  ctx.moveTo(x+7*s,y-17*s);ctx.lineTo(x+17*s,y-22*s);
  ctx.stroke();
}
function chapterBasaltSpire(x,y,s){
  ctx.fillStyle='#342a2a';ctx.beginPath();ctx.moveTo(x-14*s,y);ctx.lineTo(x-9*s,y-42*s);ctx.lineTo(x+4*s,y-60*s);ctx.lineTo(x+17*s,y-18*s);ctx.lineTo(x+10*s,y);ctx.closePath();ctx.fill();
  ctx.fillStyle='rgba(255,138,50,.18)';ctx.beginPath();ctx.moveTo(x-2*s,y-43*s);ctx.lineTo(x+5*s,y-22*s);ctx.lineTo(x+1*s,y-2*s);ctx.lineTo(x-5*s,y-23*s);ctx.closePath();ctx.fill();
}
function chapterBonePile(x,y,s){
  ctx.strokeStyle='#cdb5a5';ctx.lineWidth=3*s;
  ctx.beginPath();ctx.moveTo(x-10*s,y);ctx.lineTo(x+8*s,y-5*s);ctx.moveTo(x-2*s,y-7*s);ctx.lineTo(x+4*s,y+2*s);ctx.moveTo(x+7*s,y-10*s);ctx.lineTo(x+13*s,y-1*s);ctx.stroke();
}
function chapterObelisk(x,y,s,color='#3b253f',rune='#d94386'){
  ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(x-10*s,y);ctx.lineTo(x-6*s,y-36*s);ctx.lineTo(x,y-58*s);ctx.lineTo(x+8*s,y-18*s);ctx.lineTo(x+6*s,y);ctx.closePath();ctx.fill();
  ctx.strokeStyle=rune;ctx.lineWidth=1.8*s;ctx.beginPath();ctx.moveTo(x-1*s,y-40*s);ctx.lineTo(x+2*s,y-23*s);ctx.moveTo(x-4*s,y-28*s);ctx.lineTo(x+4*s,y-28*s);ctx.stroke();
}
function chapterBanner(x,y,s,cloth='#7f2037'){
  ctx.fillStyle='#5d4a33';ctx.fillRect(x-2*s,y-48*s,4*s,48*s);
  ctx.fillStyle=cloth;ctx.beginPath();ctx.moveTo(x,y-44*s);ctx.lineTo(x+24*s,y-40*s);ctx.lineTo(x+14*s,y-26*s);ctx.lineTo(x+23*s,y-12*s);ctx.lineTo(x,y-14*s);ctx.closePath();ctx.fill();
  ctx.fillStyle='rgba(255,255,255,.14)';ctx.fillRect(x+4*s,y-39*s,10*s,2*s);
}
function drawForegroundScatter(kind,seedBase,count,x0=.20,x1=.77){
  const gy=groundY();
  for(let i=0;i<count;i++){
    const x=W*(x0+hash01(seedBase+i*17)*x1);
    const y=gy+17+hash01(seedBase+i*29)*Math.max(10,H-gy-25);
    const s=.55+hash01(seedBase+i*41)*.65;
    kind(x,y,s,i);
  }
}

function drawChapterEnvironment(){
  const chapter=visualChapter(),gy=groundY();
  ctx.save();

  if(chapter.id==='greenlands'){
    const haze=ctx.createLinearGradient(0,gy*.28,0,gy+40);
    haze.addColorStop(0,'rgba(206,226,182,.05)');haze.addColorStop(1,'rgba(110,145,74,.18)');
    ctx.fillStyle=haze;ctx.fillRect(0,gy*.22,W,gy*.9);

    ctx.globalAlpha=.26;
    [0.16,0.24,0.33,0.42,0.53,0.66,0.78,0.91].forEach((px,i)=>chapterTree(W*px,gy-12,.56+hash01(70+i)*.16,i%2?'#335a39':'#426a44','#453b31',i));
    ctx.globalAlpha=.84;
    [0.22,0.36,0.50,0.67,0.82,0.95].forEach((px,i)=>chapterTree(W*px,gy+5,.93+hash01(170+i)*.26,i%2?'#4a7c44':'#3c6e40','#5c4430',i));
    ctx.globalAlpha=1;

    chapterBanner(W*.29,gy-4,1.05,'#7b7a2d');
    chapterBanner(W*.88,gy+2,.9,'#67853b');
    chapterRock(W*.19,gy+3,1.2,'#6f7167');
    chapterRock(W*.92,gy+5,.9,'#60695f');
    chapterLog(W*.77,gy+12,.9);
    for(let i=0;i<12;i++){
      const x=W*(.19+hash01(420+i*9)*.79),y=gy+3+hash01(460+i*13)*16;
      chapterBush(x,y,.56+hash01(490+i)*.50,i%2?'#426f3b':'#547f46');
    }
    drawForegroundScatter((x,y,s,i)=>{
      if(i%6===0)chapterRock(x,y,s*.52,'#687064');
      else if(i%5===0)chapterFlower(x,y,s*.85,'#cce983','#fff6d9');
      else chapterGrass(x,y,s*1.2,i%2?'#31552f':'#3c6637');
    },300,28);
  }else if(chapter.id==='winter'){
    ctx.fillStyle=nightColor('rgba(232,242,245,.92)','#4b5c66');ctx.fillRect(0,gy-12,W,H-gy+12);
    ctx.globalAlpha=.55;
    for(let i=0;i<8;i++)chapterPine(W*(.18+i*.10),gy-10,.60+hash01(600+i)*.17,'#435f5d',1);
    ctx.globalAlpha=1;
    for(let i=0;i<7;i++){
      const x=W*(.21+i*.118),s=.86+hash01(660+i)*.22;
      i%3===0?chapterTree(x,gy+2,s,'#61767d','#68757b',i,true):chapterPine(x,gy+2,s,'#3e5b59',1);
    }
    chapterIceShard(W*.32,gy+2,.9);chapterIceShard(W*.73,gy+4,1.05);chapterIceShard(W*.88,gy+1,.7);
    for(let i=0;i<4;i++)chapterSnowDrift(W*(.24+i*.17),gy+11+(i%2)*4,.95+hash01(710+i)*.4);
    drawForegroundScatter((x,y,s,i)=>{
      chapterSnowDrift(x,y,s);
      if(i%3===0)chapterRock(x+9,y,s*.35,'#7a878d');
      if(i%7===0)chapterIceShard(x-8*s,y+1,s*.45);
    },720,22);
  }else if(chapter.id==='darkForest'){
    const haze=ctx.createLinearGradient(0,gy*.35,0,gy+40);
    haze.addColorStop(0,'rgba(33,54,41,.08)');haze.addColorStop(1,'rgba(14,24,20,.42)');
    ctx.fillStyle=haze;ctx.fillRect(0,gy*.30,W,gy*.9);
    ctx.globalAlpha=.38;
    for(let i=0;i<10;i++)chapterTree(W*(.18+i*.085),gy-14,.74+hash01(900+i)*.18,null,'#1f2824',i,true);
    ctx.globalAlpha=1;
    for(let i=0;i<7;i++)chapterTree(W*(.22+i*.12),gy+3,.98+hash01(980+i)*.22,i%3===0?'#294536':'#22372f','#252b28',i,i%3!==0);
    for(let i=0;i<9;i++){ctx.fillStyle='rgba(155,201,172,.08)';ctx.beginPath();ctx.ellipse(hash01(1030+i)*W,gy+10+hash01(1070+i)*42,78,12,0,0,TAU);ctx.fill();}
    for(let i=0;i<12;i++){
      const x=W*(.22+hash01(1110+i*11)*.72),y=gy+12+hash01(1170+i*13)*28,s=.55+hash01(1220+i)*.52;
      if(i%3===0)chapterMushroom(x,y,s*1.2,'#6b4c79','#cabba7');
      else chapterThorn(x,y,s*.9,i%2?'#304433':'#24372b');
    }
    drawForegroundScatter((x,y,s,i)=>i%2?chapterRock(x,y,s*.42,'#37443c'):chapterGrass(x,y,s,'#243f31'),1120,18);
  }else if(chapter.id==='volcanic'){
    ctx.fillStyle='rgba(42,29,28,.66)';ctx.fillRect(0,gy-16,W,H-gy+16);
    ctx.fillStyle='#2b2527';ctx.beginPath();ctx.moveTo(W*.48,gy);ctx.lineTo(W*.61,gy*.50);ctx.lineTo(W*.73,gy);ctx.closePath();ctx.fill();
    ctx.fillStyle='#241d1f';ctx.beginPath();ctx.moveTo(W*.70,gy);ctx.lineTo(W*.84,gy*.57);ctx.lineTo(W*.94,gy);ctx.closePath();ctx.fill();
    ctx.fillStyle='rgba(255,116,46,.18)';ctx.beginPath();ctx.ellipse(W*.61,gy*.56,54,18,0,0,TAU);ctx.fill();
    ctx.fillStyle='rgba(95,72,69,.22)';for(let i=0;i<6;i++){ctx.beginPath();ctx.ellipse(W*(.57+i*.05),gy*(.40-i*.022),40+i*9,14+i*4,-.2,0,TAU);ctx.fill();}
    for(let i=0;i<8;i++)chapterBasaltSpire(W*(.22+i*.095),gy+4,.82+hash01(1330+i)*.28);
    for(let i=0;i<12;i++){
      const x=hash01(1300+i)*W,y=gy+13+hash01(1360+i)*(H-gy-22);
      chapterCrack(x,y,.72+hash01(1400+i)*.52,'#ff7b2d');
      if(i<7)chapterRock(x+20,y+4,.55,'#3b3030');
    }
    for(let i=0;i<5;i++)chapterTree(W*(.28+i*.15),gy+4,.86+hash01(1460+i)*.18,null,'#352725',i,true);
  }else{
    const haze=ctx.createLinearGradient(0,gy*.40,0,gy+50);haze.addColorStop(0,'rgba(85,26,80,.08)');haze.addColorStop(1,'rgba(142,24,67,.28)');ctx.fillStyle=haze;ctx.fillRect(0,gy*.26,W,gy*.8);
    ctx.fillStyle='rgba(38,21,39,.70)';ctx.fillRect(0,gy-13,W,H-gy+13);
    for(let i=0;i<6;i++)chapterTree(W*(.23+i*.13),gy+4,.94+hash01(1510+i)*.20,null,'#2b1c2c',i,true);
    for(let i=0;i<7;i++)chapterObelisk(W*(.25+i*.11),gy+8+(i%2)*8,.78+hash01(1580+i)*.22,'#352037','#d94386');
    chapterBanner(W*.34,gy+3,1.0,'#7f2248');chapterBanner(W*.79,gy+7,.95,'#9b2d61');
    for(let i=0;i<9;i++)chapterBonePile(W*(.24+hash01(1620+i)*.66),gy+13+hash01(1720+i)*40,.8+hash01(1820+i)*.32);
    for(let i=0;i<11;i++)chapterCrack(hash01(1920+i)*W,gy+11+hash01(2020+i)*(H-gy-20),.76,'#d94386');
  }
  ctx.restore();
}

function drawChapterEnemyDetails(e,chapter){
  if(chapter.id==='greenlands'){
    ctx.fillStyle='#6f5733';ctx.fillRect(-15,-63,30,4);
    ctx.fillStyle='#7bae4f';ctx.beginPath();ctx.ellipse(12,-66,3.5,7.4,.65,0,TAU);ctx.fill();
    ctx.fillStyle='rgba(255,245,210,.22)';ctx.beginPath();ctx.arc(-9,-61,2.4,0,TAU);ctx.arc(-1,-62,1.7,0,TAU);ctx.fill();
  }else if(chapter.id==='winter'){
    ctx.strokeStyle='#dbe9ec';ctx.lineWidth=5;ctx.beginPath();ctx.arc(0,-48,17,.05,Math.PI-.05);ctx.stroke();
    ctx.fillStyle='#b9dbe6';ctx.fillRect(-15,-64,30,5);
    ctx.fillStyle='rgba(240,248,252,.72)';ctx.beginPath();ctx.moveTo(-6,-67);ctx.lineTo(0,-76);ctx.lineTo(6,-67);ctx.fill();
  }else if(chapter.id==='darkForest'){
    ctx.fillStyle='rgba(22,31,28,.85)';ctx.beginPath();ctx.arc(0,-54,19,Math.PI,TAU);ctx.lineTo(13,-46);ctx.lineTo(-13,-46);ctx.fill();
    ctx.strokeStyle='#4e5d39';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-10,-63);ctx.lineTo(-16,-74);ctx.moveTo(10,-63);ctx.lineTo(17,-75);ctx.stroke();
    ctx.fillStyle='#9bb36c';ctx.fillRect(-9,-54,4,2);ctx.fillRect(5,-54,4,2);
  }else if(chapter.id==='volcanic'){
    ctx.strokeStyle='#ff8a32';ctx.lineWidth=1.8;ctx.shadowColor='#ff6725';ctx.shadowBlur=5;
    ctx.beginPath();ctx.moveTo(-12,-35);ctx.lineTo(-4,-25);ctx.lineTo(-8,-15);
    ctx.moveTo(10,-43);ctx.lineTo(4,-35);
    ctx.moveTo(-7,-61);ctx.lineTo(-15,-72);ctx.moveTo(7,-61);ctx.lineTo(16,-73);
    ctx.stroke();ctx.shadowBlur=0;
    ctx.fillStyle='rgba(255,141,72,.25)';ctx.beginPath();ctx.arc(0,-61,12,0,TAU);ctx.fill();
  }else{
    ctx.fillStyle='#642b56';
    ctx.beginPath();ctx.moveTo(-11,-62);ctx.lineTo(-18,-77);ctx.lineTo(-4,-64);ctx.moveTo(11,-62);ctx.lineTo(18,-77);ctx.lineTo(4,-64);ctx.fill();
    ctx.fillStyle='#ff537d';ctx.fillRect(-8,-54,5,3);ctx.fillRect(4,-54,5,3);
    ctx.strokeStyle='rgba(255,83,125,.55)';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(0,-60,11,0,TAU);ctx.stroke();
  }
}

function drawBossChapterEffects(backdrop=false){
  const bossTheme=activeBossChapter();
  if(!bossTheme)return;
  const t=time*1.2,gy=groundY();
  const pulse=.55+.45*Math.sin(time*3.4);
  const screenAlpha=backdrop?.11:.16;
  ctx.save();

  if(backdrop){
    if(bossTheme.id==='greenlands'){
      ctx.fillStyle=`rgba(106,152,78,${screenAlpha*.38})`;ctx.fillRect(0,gy*.20,W,gy*.72);
      for(let i=0;i<12;i++){
        const x=(W*.18+(i*73+t*28)%Math.max(120,W*.68));
        const y=gy-135+Math.sin(t+i)*28+i*4;
        ctx.fillStyle=`rgba(176,216,108,${.12+.06*Math.sin(t*1.4+i)})`;
        ctx.beginPath();ctx.ellipse(x,y,12,5,Math.sin(t+i)*.6,0,TAU);ctx.fill();
      }
    }else if(bossTheme.id==='winter'){
      ctx.fillStyle=`rgba(147,205,226,${screenAlpha*.42})`;ctx.fillRect(0,0,W,H);
      for(let i=0;i<80;i++){
        const x=((i*37+t*85)%(W+40))-20,y=((i*19+t*120)%(H+30))-15,r=1+(i%3)*.6;
        ctx.fillStyle=`rgba(237,249,255,${.14+.16*((i%5)/5)})`;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill();
      }
    }else if(bossTheme.id==='darkForest'){
      const fog=ctx.createLinearGradient(0,gy*.28,0,H);fog.addColorStop(0,'rgba(36,57,43,.02)');fog.addColorStop(1,`rgba(19,36,28,${screenAlpha*.7})`);
      ctx.fillStyle=fog;ctx.fillRect(0,0,W,H);
      for(let i=0;i<10;i++){
        ctx.fillStyle=`rgba(138,201,96,${.05+.04*Math.sin(t+i)})`;
        ctx.beginPath();ctx.ellipse(W*(.22+hash01(7000+i)*.60),gy+6+hash01(7100+i)*42,86,13,0,0,TAU);ctx.fill();
      }
    }else if(bossTheme.id==='volcanic'){
      const heat=ctx.createLinearGradient(0,gy*.25,0,H);heat.addColorStop(0,'rgba(92,26,10,.02)');heat.addColorStop(1,`rgba(200,74,25,${screenAlpha*.78})`);
      ctx.fillStyle=heat;ctx.fillRect(0,0,W,H);
      for(let i=0;i<18;i++){
        const x=W*(.22+hash01(7200+i)*.66),y=gy+10+hash01(7300+i)*48;
        ctx.fillStyle=`rgba(255,128,38,${.08+.06*Math.sin(t*2+i)})`;ctx.beginPath();ctx.ellipse(x,y,22,5,0,0,TAU);ctx.fill();
      }
    }else if(bossTheme.id==='demonic'){
      const hell=ctx.createLinearGradient(0,0,0,H);hell.addColorStop(0,'rgba(75,18,64,.03)');hell.addColorStop(1,`rgba(122,20,58,${screenAlpha*.76})`);
      ctx.fillStyle=hell;ctx.fillRect(0,0,W,H);
      for(let i=0;i<9;i++){
        ctx.strokeStyle=`rgba(237,61,124,${.10+.05*Math.sin(t+i)})`;ctx.lineWidth=2;
        ctx.beginPath();ctx.arc(W*(.26+i*.06),gy-35-hash01(7400+i)*38,18+hash01(7450+i)*12,0,TAU);ctx.stroke();
      }
    }
  }else{
    const boss=game.boss;
    const x=boss.x,y=(boss.y??gy)-60*boss.scale;
    if(bossTheme.id==='greenlands'){
      ctx.strokeStyle=`rgba(165,218,102,${.28+.16*pulse})`;ctx.lineWidth=2;
      ctx.beginPath();ctx.ellipse(x,y+45,56+Math.sin(time*4)*5,16,0,0,TAU);ctx.stroke();
      for(let i=0;i<6;i++)chapterFlower(x-44+i*18,y+65+Math.sin(time*4+i)*2,.8,'#d0ef8e','#fff6db');
    }else if(bossTheme.id==='winter'){
      ctx.strokeStyle=`rgba(201,240,255,${.25+.18*pulse})`;ctx.lineWidth=2.2;
      for(let i=0;i<5;i++){ctx.beginPath();ctx.arc(x,y+25,34+i*8+Math.sin(time*4+i)*2,0,TAU);ctx.stroke();}
    }else if(bossTheme.id==='darkForest'){
      ctx.strokeStyle=`rgba(123,196,94,${.18+.15*pulse})`;ctx.lineWidth=2;
      ctx.beginPath();ctx.arc(x,y+30,44+Math.sin(time*4)*3,0,TAU);ctx.stroke();
      for(let i=0;i<7;i++)chapterThorn(x-45+i*14,y+66+(i%2)*2,.7,'rgba(88,129,71,.9)');
    }else if(bossTheme.id==='volcanic'){
      for(let i=0;i<8;i++){
        ctx.fillStyle=`rgba(255,139,45,${.20+.14*Math.sin(time*5+i)})`;
        ctx.beginPath();ctx.arc(x-38+i*11,y+48-Math.abs(Math.sin(time*3+i))*10,2.5+(i%3),0,TAU);ctx.fill();
      }
      ctx.strokeStyle=`rgba(255,108,34,${.20+.12*pulse})`;ctx.lineWidth=2.1;ctx.beginPath();ctx.arc(x,y+33,40+Math.sin(time*6)*2,0,TAU);ctx.stroke();
    }else if(bossTheme.id==='demonic'){
      ctx.strokeStyle=`rgba(255,84,134,${.26+.16*pulse})`;ctx.lineWidth=2.2;
      ctx.beginPath();ctx.arc(x,y+28,46,0,TAU);ctx.stroke();
      for(let i=0;i<6;i++)chapterCrack(x-42+i*15,y+70+(i%2)*3,.34,'#ff4f85');
    }
  }
  ctx.restore();
}
