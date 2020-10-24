const nameSoundMap = {
  clapSound : "clapSound",
  backSound : "backSound",
}
const pathSoundMap = {
  clapSound : "Music/glitch/Distortion 3.mp3",
  backSound : "Music/long/music1.mp3"
}

Object.keys(nameSoundMap).forEach(function(key) {
  createjs.Sound.registerSound(pathSoundMap[key], nameSoundMap[key]);
});
