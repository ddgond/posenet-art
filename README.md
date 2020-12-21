## [PoseNet-Art](https://posenet-art.netlify.app/)
[![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](https://github.com/ddgond/posenet-art/issues)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

![posenet-art-logo](./posenet-art-logo.png)

 PoseNet Art is an interactive app where the user’s motion activates real-time animations and sounds. It is meant to be used for creative and entertainment purposes.

 PoseNet is a machine learning model for real-time pose estimation. We used a PoseNet implementation from ml5.js. We used p5.js to create animations and Tone.js to create sound effects.

 PoseNet Art was created by three MIT students in the fall of 2020 as part of the inaugural cohort of AI@MIT Labs:
 - Daniel Dangond
 - Kathleen Esfahany
 - Sanja Simonovikj

### Link to deployed app

https://posenet-art.netlify.app/

### Currently supported effects

##### Visual:
- clap to make fire and smoke
- clap to make lightning
- raise hands to sparkle

##### Sound:
- choose from 6 different background sounds
- change master volume
- toggle sounds on/off
- enjoy a set of associated sound effects with each visual effect

### Getting started

To test the app locally:
 1. Run a local python server: `python3 -m http.server` 
 2. Navigate to `localhost:8000` in your browser.
 
### Important files
- `index.html` - the homepage / entry point
- `poseEngine.js` - PoseNet model initialization and progression, triggers event listeners for effects
- `main.js` - defines event listeners for effects
- `drawingEngine.js` - functions needed for drawing visual effects
- `effects.js` - implementation of the visual effects



