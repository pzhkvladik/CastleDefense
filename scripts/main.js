function loop(ts){
  const realDt=Math.min(.033,(ts-last)/1000||0);
  last=ts;
  const dt=realDt*gameSpeed;
  updateVisuals(realDt);
  update(dt);
  draw();
  requestAnimationFrame(loop);
}

newGame();
setShopTab('army');
chooseWaveEvent();
showWave('🍃 ВЕСНА • ХВИЛЯ 1');
requestAnimationFrame(loop);
