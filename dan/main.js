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

// PosenetEngine.addListener(clapToSparkleListener);

// DrawingEngine.addAnimatedObject(new KeypointDebugger());

let leftHandFire = null;
let rightHandFire = null;

const clapToFireHandsListener = new PosenetEngine.EventListener('leftWrist', PosenetEngine.EventType.Collision, (keypoint, data) => {
  if (data.collider.name === 'rightWrist') {
    startSound(); // first time you clap it will start background music
    createjs.Sound.play(nameSoundMap.matchSound, {volume:.8});
    createjs.Sound.play(nameSoundMap.fireSound, {volume:0.5});
    if (leftHandFire) {
      leftHandFire.remove();
      rightHandFire.remove();
      leftHandFire = null;
      rightHandFire = null;
    } else {
      leftHandFire = new FireWithSmoke(keypoint.x, keypoint.y, 60 / DrawingEngine.getDistanceRatio());
      rightHandFire = new FireWithSmoke(data.collider.x, data.collider.y, 60 / DrawingEngine.getDistanceRatio());
      leftHandFire.setTarget(keypoint);
      rightHandFire.setTarget(data.collider);
      DrawingEngine.addAnimatedObject(leftHandFire);
      DrawingEngine.addAnimatedObject(rightHandFire);
    }
  }
});

PosenetEngine.addListener(clapToFireHandsListener);

// const fire = new FireWithSmoke(300, 300, 40);
// DrawingEngine.addAnimatedObject(fire);
// fire.setWind(-40, 10)
