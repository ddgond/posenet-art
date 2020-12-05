const startEngine = () => {
  document.querySelector("#startButton").remove();
  document.querySelector("#p5-canvas-div").hidden = false;
  DrawingEngine.start();
  Tone.start();

  function setMasterVolume(e) {
    if (e.target.value <= -38) {
      Tone.Destination.volume.value = -200;
    }
    else {
      Tone.Destination.volume.value = e.target.value;
    }
  }
  document.querySelector('#volumeSlider').addEventListener("input", setMasterVolume);
  Tone.Destination.volume.value = document.querySelector('#volumeSlider').value;

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

  // Background Music
  const musicDropdown = document.getElementById('list');
  const backgroundMusicCheckbox = document.getElementById('backSounds');

  musicDropdown.addEventListener('change', getSelectValue);
  backgroundMusicCheckbox.addEventListener('change', toggleBackgroundSound);

  var selectedBackMusic = musicDropdown.value;
  var backgroundMusic;

  const onBackgroundMusicLoad = () => {
    if (backgroundMusicCheckbox.checked) {
      backgroundMusic.start(0, backgroundMusic.immediate());
    }
  }

  backgroundMusic = new Tone.Player({
    url:`music/long/${selectedBackMusic}.mp3`,
    autostart: false,
    loop: true,
    onload: onBackgroundMusicLoad
  }).toDestination();

  function getSelectValue() {
    selectedBackMusic = document.getElementById("list").value;
    console.log(selectedBackMusic);
    backgroundMusic.stop();
    backgroundMusic = new Tone.Player({
      url:`music/long/${selectedBackMusic}.mp3`,
      autostart: backgroundMusicCheckbox.checked,
      loop: true,
    }).toDestination();
  }

  function toggleBackgroundSound() {
    if (!backgroundMusic.loaded) {
      return;
    }
    if (backgroundMusicCheckbox.checked) {
      backgroundMusic.start(0,backgroundMusic.immediate());
    } else {
      backgroundMusic.stop();
    }
  }

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



  // Sparkle Effect

 const raiseHandsToSparkleListener = new PoseEngine.EventListener('leftWrist', PoseEngine.EventType.Raise, (keypoint, data) => {
    if (data.raise.name === 'rightWrist') {
    
        for (let i = 0; i < 25; i++) {
            // DrawingEngine.addAnimatedObject(new Sparkle(data.raise.x, data.raise.y, 60 / DrawingEngine.getDistanceRatio(), 2000));
            // DrawingEngine.addAnimatedObject(new Sparkle(keypoint.x, keypoint.y, 60 / DrawingEngine.getDistanceRatio(), 2000));

            const randomOffset = () => (Math.random() * 100 - 50) / DrawingEngine.getDistanceRatio();

            DrawingEngine.addAnimatedObject(new Sparkle(keypoint.x + randomOffset(), keypoint.y + randomOffset(), 60 / DrawingEngine.getDistanceRatio(), 2000));
            DrawingEngine.addAnimatedObject(new Sparkle(data.raise.x + randomOffset(), data.raise.y + randomOffset(), 60 / DrawingEngine.getDistanceRatio(), 2000));
        }
    }
});
PoseEngine.addListener(raiseHandsToSparkleListener);

}