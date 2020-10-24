const clapToSparkleListener = new PosenetEngine.EventListener('leftWrist', PosenetEngine.EventType.Collision, (keypoint, data) => {
  if (data.collider.name === 'rightWrist') {
    startSound(); // first time you clap it will start background music
    createjs.Sound.play(nameSoundMap.clapSound, {volume:.3});
    for (let i = 0; i < 25; i++) {
      const randomOffset = () => (Math.random() * 100 - 50) / DrawingEngine.getDistanceRatio();
      DrawingEngine.addAnimatedObject(new Sparkle(keypoint.x + randomOffset(), keypoint.y + randomOffset(), 20, 3000));
      DrawingEngine.addAnimatedObject(new Sparkle(data.collider.x + randomOffset(), data.collider.y + randomOffset(), 20, 3000));
    }
  }
});

PosenetEngine.addListener(clapToSparkleListener);
