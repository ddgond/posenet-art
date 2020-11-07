const main = () => {
  const clapToSparkleListener = new PoseEngine.EventListener('leftWrist', PoseEngine.EventType.Collision, (keypoint, data) => {
    if (data.collider.name === 'rightWrist') {
      if (allSoundOn){
          startSound(); // first time you clap it will start background music
          createjs.Sound.play(nameSoundMap.clapSound, {volume:.3});
      }
      for (let i = 0; i < 25; i++) {
        const randomOffset = () => (Math.random() * 100 - 50) / DrawingEngine.getDistanceRatio();
        DrawingEngine.addAnimatedObject(new Sparkle(keypoint.x + randomOffset(), keypoint.y + randomOffset(), 20, 3000));
        DrawingEngine.addAnimatedObject(new Sparkle(data.collider.x + randomOffset(), data.collider.y + randomOffset(), 20, 3000));
      }
    }
  });

  // PoseEngine.addListener(clapToSparkleListener);

  // DrawingEngine.addAnimatedObject(new KeypointDebugger());

  // Put all effects that require sound in here
  const enableSound = () => {
    document.querySelector('#enableSound').removeEventListener("click", enableSound);
    
    // Background Music
    // TODO add event listeners to checkboxes
    const backgroundMusicCheckbox = document.getElementById('backSounds');
    const backgroundMusic = new Tone.Player({
      url:'music/long/music1.mp3',
      autostart: backgroundMusicCheckbox.checked,
      loop: true,
    }).toDestination();
    function toggleBackgroundSound() {
      if (backgroundMusicCheckbox.checked) {
        backgroundMusic.start(0,backgroundMusic.immediate());
      } else {
        backgroundMusic.stop();
      }
    }
    backgroundMusicCheckbox.addEventListener('change', toggleBackgroundSound);
    
    // Fire Effect
    let leftHandFire = null;
    let rightHandFire = null;
    const clapToFireHandsListener = new PoseEngine.EventListener('leftWrist', PoseEngine.EventType.Collision, (keypoint, data) => {
      if (data.collider.name === 'rightWrist') {
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
    PoseEngine.addListener(clapToFireHandsListener);
  }

  document.querySelector('#enableSound').addEventListener("click", enableSound);
}