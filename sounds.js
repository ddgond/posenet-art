const nameSoundMap = {
  clapSound : "clapSound",
  matchSound : "matchSound",
  fireSound : "fireSound",
  backSound : "backSound",
  raiseSound : "raiseSound",
}
const pathSoundMap = {
  clapSound : "Music/glitch/Distortion 3.mp3",
  matchSound : "Music/fire/matches.mp3",
  fireSound : "Music/fire/fire.mp3",
  backSound : "Music/long/music1.mp3",
  raiseSound : "Music/glitch/sparkle.m3"
}

Object.keys(nameSoundMap).forEach(function(key) {
  createjs.Sound.registerSound(pathSoundMap[key], nameSoundMap[key]);
});
