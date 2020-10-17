class AnimatedObject {
  constructor(drawFunction) {
    this.draw = drawFunction; // (sketch, deltaT, keypointState)
  }
}

const EventType = {
  Update: 0, // e.g. any change whatsoever, called when on('pose') happens
  StartMoving: 1, // e.g. hand starts moving
  StopMoving: 2, // e.g. hand stops moving
  ChangeDirection: 3, // e.g. hand moving down then up, deltaVAngle changes
  PairCollision: 4, // e.g. right hand hits left hand, for claps
  CrossBody: 5 // e.g. right hand moves to left side of body
}

class EventListener {
  constructor(keypointName, eventType, callback) {
    this.keypointName = keypointName;
    this.eventType = eventType;
    this.callback = callback; // callback(keypoint)
  }
}

const animatedObjectList = [];
const eventListeners = [];

const triggerListeners = (keypoint, eventType) => {
  eventListeners.filter(listener => listener.keypointName === keypoint.name && listener.eventType === eventType)
                .forEach(listener => listener.callback(keypoint));
}

const p5config = (sketch) => {
  const normWidthFactor = 1280; // Arbitrary number to allow us to define units of speed consistently independent of window size
  
  const webcam = sketch.createCapture(sketch.VIDEO);
  const getWebcamRatio = () => webcam.elt.videoWidth / webcam.elt.videoHeight;
  webcam.hide();
  
  const webcamSize = () => {
    if (window.innerHeight * getWebcamRatio() > window.innerWidth) {
      return { width: window.innerWidth, height: window.innerWidth / getWebcamRatio() };
    } else {
      return { width: window.innerHeight * getWebcamRatio(), height: window.innerHeight };
    }
  }
  
  const resizeWebcam = () => {
    webcam.size(webcamSize().width, webcamSize().height);
  }
  
  class Keypoint {
    static startMovingSpeedCutoff = 2.5;
    static stopMovingSpeedCutoff = 2;
    static timeToDetectStop = 0.15 * 1000; // milliseconds
    static angleToChangeDirection = 60; // degrees
    static crossCenterThreshold = 10; // some arbitrary distance unit
    
    constructor(name, pairName, bodyCenter) {
      this.name = name;
      this.pairName = pairName;
      this.bodyCenterPosition = bodyCenter;
      this.x = 0;
      this.y = 0;
      this.smoothVelocity = {x:0,y:0}; // Weighted average of velocities
      this.isMoving = false;
      this.stillTime = 0; // Time spent not moving
      this.rightOfCenter = false;
    }
    
    get speed() {
      return Math.sqrt(Math.pow(this.smoothVelocity.x,2) + Math.pow(this.smoothVelocity.y,2));
    }
    
    get normSpeed() {
      return this.speed * normWidthFactor / webcamSize().width;
    }
    
    get velocity() {
      return this.smoothVelocity;
    }
    
    get normVelocity() {
      return {
        x: this.velocity.x * normWidthFactor / webcamSize.width,
        y: this.velocity.y * normWidthFactor / webcamSize.width
      }
    }
    
    updatePosition(position, deltaT) {
      const x = position.x;
      const y = position.y;
      const previousVelocity = {x: this.smoothVelocity.x, y: this.smoothVelocity.y}
      
      this.smoothVelocity.x /= 10;
      this.smoothVelocity.x += (x - this.x) / deltaT;
      this.x = x;
      
      this.smoothVelocity.y /= 10;
      this.smoothVelocity.y += (y - this.y) / deltaT;
      this.y = y;
      
      if (!this.isMoving && this.normSpeed > Keypoint.startMovingSpeedCutoff) {
        this.isMoving = true;
        triggerListeners(this, EventType.StartMoving);
      }
      
      // By not stopping untill you've been still for a while, we allow users
      // To change directions without the system claiming you stopped moving.
      if (this.normSpeed < Keypoint.stopMovingSpeedCutoff) {
        this.stillTime += deltaT;
        if (this.stillTime > Keypoint.timeToDetectStop && this.isMoving) {
          this.isMoving = false;
          triggerListeners(this, EventType.StopMoving);
        }
      } else {
        this.stillTime = 0;
      }
      
      const dotProduct = previousVelocity.x * this.smoothVelocity.x + previousVelocity.y * this.smoothVelocity.y;
      const prevMagnitude = Math.sqrt(Math.pow(previousVelocity.x,2) + Math.pow(previousVelocity.y,2));
      const currentMagnitude = this.speed;
      const angle = Math.acos(dotProduct / (prevMagnitude * currentMagnitude)) / Math.pi * 180;
      
      if (this.isMoving && angle > Keypoint.angleToChangeDirection) {
        triggerListeners(this, EventType.ChangeDirection);
      }
      
      if (!this.rightOfCenter && this.x > this.bodyCenterPosition.x + Keypoint.crossCenterThreshold * normWidthFactor / webcamSize().width) {
        this.rightOfCenter = true;
        triggerListeners(this, EventType.CrossBody);
      } else if (this.rightOfCenter && this.x < this.bodyCenterPosition.x - Keypoint.crossCenterThreshold * normWidthFactor / webcamSize().width) {
        this.rightOfCenter = false;
        triggerListeners(this, EventType.CrossBody);
      }
      
      triggerListeners(this, EventType.Update);
    }
  }
  
  let poses = [];
  const bodyCenterPosition = {x:0,y:0};
  const keypointState = {
    'nose': new Keypoint('nose', null, bodyCenterPosition),
    'leftEye': new Keypoint('leftEye', 'rightEye', bodyCenterPosition),
    'rightEye': new Keypoint('rightEye', 'leftEye', bodyCenterPosition),
    'leftEar': new Keypoint('leftEar', 'rightEar', bodyCenterPosition),
    'rightEar': new Keypoint('rightEar', 'leftEar', bodyCenterPosition),
    'leftShoulder': new Keypoint('leftShoulder', 'rightShoulder', bodyCenterPosition),
    'rightShoulder': new Keypoint('rightShoulder', 'leftShoulder', bodyCenterPosition),
    'leftElbow': new Keypoint('leftElbow', 'rightElbow', bodyCenterPosition),
    'rightElbow': new Keypoint('rightElbow', 'leftElbow', bodyCenterPosition),
    'leftWrist': new Keypoint('leftWrist', 'rightWrist', bodyCenterPosition),
    'rightWrist': new Keypoint('rightWrist', 'leftWrist', bodyCenterPosition),
    'leftHip': new Keypoint('leftHip', 'rightHip', bodyCenterPosition),
    'rightHip': new Keypoint('rightHip', 'leftHip', bodyCenterPosition),
    'leftKnee': new Keypoint('leftKnee', 'rightKnee', bodyCenterPosition),
    'rightKnee': new Keypoint('rightKnee', 'leftKnee', bodyCenterPosition),
    'leftAnkle': new Keypoint('leftAnkle', 'rightAnkle', bodyCenterPosition),
    'rightAnkle': new Keypoint('rightAnkle', 'leftAnkle', bodyCenterPosition)
  };
  
  const poseNet = ml5.poseNet(webcam, () => {
    console.log('poseNet loaded successfully');
  });
  
  let lastPoseTime = new Date().getTime();
  
  poseNet.on('pose', (results) => {
    const currentTime = new Date().getTime();
    const deltaT = currentTime - lastTime;
    poses = results.map(item => item.pose);
    if (poses[0]) {
      const keypoints = poses[0].keypoints.filter(keypoint => keypoint.score > 0.2);
      bodyCenterPosition.x = 0;
      bodyCenterPosition.y = 0;
      for (let i = 0; i < keypoints.length; i++) {
        const keypoint = keypoints[i];
        keypointState[keypoint.part].updatePosition(keypoint.position, deltaT);
        // Average keypoint positions to define center
        bodyCenterPosition.x += keypoint.position.x / keypoints.length;
        bodyCenterPosition.y += keypoint.position.y / keypoints.length;
      }
    }
  });
  
  const drawPose = (pose, deltaT) => {
    for (let i = 0; i < pose.keypoints.length; i++) {
      const keypoint = pose.keypoints[i];
      if (keypoint.score > 0.2 && keypointState[keypoint.part].isMoving) {
        sketch.stroke(100 - keypointState[keypoint.part].normSpeed * 20, 100, 100);
        sketch.line(
          keypoint.position.x,
          keypoint.position.y,
          keypoint.position.x - (keypointState[keypoint.part].velocity.x * 10),
          keypoint.position.y - (keypointState[keypoint.part].velocity.y * 10)
        );
      }
    }
  }
  
  let lastTime = new Date().getTime();
  
  sketch.setup = () => {
    sketch.colorMode(sketch.HSB, 100);
    sketch.createCanvas(window.innerWidth, window.innerHeight);
    resizeWebcam();
    lastTime = new Date().getTime();
  }
  
  sketch.draw = () => {
    const currentTime = new Date().getTime();
    const deltaT = currentTime - lastTime;
    lastTime = currentTime;
    resizeWebcam();
    sketch.background(100);
    sketch.image(webcam, 0, 0, webcamSize().width, webcamSize().height);
    sketch.fill(100);
    sketch.stroke(100);
    sketch.strokeWeight(5);
    if (poses[0]) {
      drawPose(poses[0], deltaT);
    }
    const doneAnimObjects = [];
    for (animObj in animatedObjectList) {
      if (animObj.draw(sketch, deltaT, keypointState)) {
        doneAnimObjects.push(animObj);
      }
    }
    for (doneAnimObj in doneAnimObjects) {
      animatedObjectList.splice(animatedObjectList.indexOf(doneAnimObj),1);
    }
  }
  
  sketch.windowResized = () => {
    sketch.resizeCanvas(window.innerWidth, window.innerHeight);
    resizeWebcam();
  }
}

new p5(p5config);