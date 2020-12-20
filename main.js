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

  document.querySelector('#toggleSectionLabel').hidden = false;
  const toggleSection = document.querySelector('#toggleSection');
  const createListenerToggle = (listener, labelText, removeList) => {
    const toggleDiv = document.createElement('div');
    const toggle = document.createElement('input');
    toggle.type = 'checkbox';
    toggle.addEventListener('change', () => {
      if (toggle.checked) {
        PoseEngine.addListener(listener);
      } else {
        PoseEngine.removeListener(listener);
        if (removeList) {
          removeList.forEach(animObj => animObj.remove());
          removeList.splice(0, removeList.length);
        }
      }
    });
    toggle.style.marginRight = "8px";
    const label = document.createElement('label');
    label.innerText = labelText;
    toggleDiv.appendChild(toggle);
    toggleDiv.appendChild(label);
    toggleSection.appendChild(toggleDiv);
  }
  const createComplexToggle = (onCheck, onUncheck, labelText) => {
    const toggleDiv = document.createElement('div');
    const toggle = document.createElement('input');
    toggle.type = 'checkbox';
    toggle.addEventListener('change', () => {
      if (toggle.checked) {
        onCheck();
      } else {
        onUncheck();
      }
    });
    toggle.style.marginRight = "8px";
    const label = document.createElement('label');
    label.innerText = labelText;
    toggleDiv.appendChild(toggle);
    toggleDiv.appendChild(label);
    toggleSection.appendChild(toggleDiv);
  }

  const clapToSparkleListener = new PoseEngine.EventListener('leftPalm', PoseEngine.EventType.Collision, (keypoint, data) => {
    if (data.collider.name === 'rightPalm') {
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
  const handFireList = [];
  const clapToFireHandsListener = new PoseEngine.EventListener('leftPalm', PoseEngine.EventType.Collision, (keypoint, data) => {
    if (data.collider.name === 'rightPalm') {
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
        handFireList.push(leftHandFire);
        handFireList.push(rightHandFire);
      }
    }
  });
  // PoseEngine.addListener(clapToFireHandsListener);
  createListenerToggle(clapToFireHandsListener, "Clap to make fire.", handFireList);
  
  // Lightning Effect
  let handLightning = null;
  const handLightningList = [];
  const clapToLightningHandsListener = new PoseEngine.EventListener('leftPalm', PoseEngine.EventType.Collision, (keypoint, data) => {
    if (data.collider.name === 'rightPalm') {
      if (handLightning) {
        handLightning.remove();
        handLightning = null;
      } else {
        handLightning = new Lightning([keypoint, data.collider]);
        DrawingEngine.addAnimatedObject(handLightning);
        handLightningList.push(handLightning);
      }
    }
  });
  createListenerToggle(clapToLightningHandsListener, "Clap to make lightning.", handLightningList);

  // Sparkle Effect
  const sparkleList = [];
  const raiseHandsToSparkleListener = new PoseEngine.EventListener('leftPalm', PoseEngine.EventType.Raise, (keypoint, data) => {
    if (data.raise.name === 'rightPalm') {

      for (let i = 0; i < 25; i++) {
        // DrawingEngine.addAnimatedObject(new Sparkle(data.raise.x, data.raise.y, 60 / DrawingEngine.getDistanceRatio(), 2000));
        // DrawingEngine.addAnimatedObject(new Sparkle(keypoint.x, keypoint.y, 60 / DrawingEngine.getDistanceRatio(), 2000));

        const randomOffset = () => (Math.random() * 100 - 50) / DrawingEngine.getDistanceRatio();
        const leftSparkle = new Sparkle(keypoint.x + randomOffset(), keypoint.y + randomOffset(), 60 / DrawingEngine.getDistanceRatio(), 2000);
        const rightSparkle = new Sparkle(data.raise.x + randomOffset(), data.raise.y + randomOffset(), 60 / DrawingEngine.getDistanceRatio(), 2000);
        DrawingEngine.addAnimatedObject(leftSparkle);
        DrawingEngine.addAnimatedObject(rightSparkle);
        sparkleList.push(leftSparkle);
        sparkleList.push(rightSparkle);
      }
    }
  });
  // PoseEngine.addListener(raiseHandsToSparkleListener);
  createListenerToggle(raiseHandsToSparkleListener, "Raise your hands to make sparkles.", sparkleList);
  
  // const skeleton = new Skeleton(false);
  // const skeletonListener = new PoseEngine.EventListener('', PoseEngine.EventType.FullUpdate, (keypoints, data) => {
  //   keypoints.forEach(keypoint => {
  //     skeleton.updatePoint(keypoint);
  //   });
  // });
  // DrawingEngine.addAnimatedObject(skeleton);
  // createComplexToggle(() => {
  //   PoseEngine.addListener(skeletonListener);
  //   skeleton.makeVisible();
  // }, () => {
  //   PoseEngine.removeListener(skeletonListener);
  //   skeleton.makeInvisible();
  // }, "Show your skeleton.");
}