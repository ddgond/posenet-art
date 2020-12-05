const PoseEngine = (() => {
  const EventType = {
    Update: 0, // e.g. any change whatsoever, called when on('pose') happens
    StartMoving: 1, // e.g. hand starts moving
    StopMoving: 2, // e.g. hand stops moving
    ChangeDirection: 3, // e.g. hand moving down then up, deltaVAngle changes
    Collision: 4, // e.g. right hand hits left hand, for claps, data is {collider: otherKeypoint} for object it collided with
    ExitCollision: 5, // e.g. right hand stops hitting left hand, data is {collider: otherKeypoint} for object it collided with
    CrossBody: 6, // e.g. right hand moves to left side of body
    Raise: 7, // e.g. both hands are up in the air
  };
  class EventListener {
    constructor(keypointName, eventType, callback) {
      this.keypointName = keypointName;
      this.eventType = eventType;
      this.callback = callback; // callback(keypoint, data)
    }
  }

  const eventListeners = [];
  const triggerListeners = (keypoint, eventType, data) => {
    eventListeners
      .filter(
        (listener) =>
          listener.keypointName === keypoint.name &&
          listener.eventType === eventType
      )
      .forEach((listener) => listener.callback(keypoint, data));
  };

  class Keypoint {
    static startMovingSpeedCutoff = 2.5;
    static stopMovingSpeedCutoff = 2;
    static timeToDetectStop = 0.15 * 1000; // milliseconds
    static angleToChangeDirection = 60; // degrees
    static crossCenterThreshold = 10; // some arbitrary distance unit, distance between eyes when at laptop is 200
    static collisionRadius = 100; // some arbitrary distance unit
    static unCollisionRadius = 105; // some arbitrary slightly larger distance unit

    constructor(name, bodyCenter) {
      this.name = name;
      this.score = 0;
      this.bodyCenterPosition = bodyCenter;
      this.x = 0;
      this.y = 0;
      this.smoothVelocity = { x: 0, y: 0 }; // Weighted average of velocities
      this.isMoving = false;
      this.stillTime = 0; // Time spent not moving
      this.rightOfCenter = false;
      this.activeCollisions = []; // List of active collisions
    }

    get speed() {
      return Math.sqrt(
        Math.pow(this.smoothVelocity.x, 2) + Math.pow(this.smoothVelocity.y, 2)
      );
    }

    get normSpeed() {
      return this.speed * DrawingEngine.getDistanceRatio();
    }

    get velocity() {
      return this.smoothVelocity;
    }

    get normVelocity() {
      return {
        x: this.velocity.x * DrawingEngine.getDistanceRatio(),
        y: this.velocity.y * DrawingEngine.getDistanceRatio(),
      };
    }

    isCollidingWith(otherKeypoint) {
      return this.activeCollisions.includes(otherKeypoint.name);
    }

    triggerCollision(otherKeypoint) {
      this.activeCollisions.push(otherKeypoint.name);
      triggerListeners(this, EventType.Collision, { collider: otherKeypoint });
    }

    removeCollision(otherKeypoint) {
      this.activeCollisions.splice(
        this.activeCollisions.indexOf(otherKeypoint.name),
        1
      );
      triggerListeners(this, EventType.ExitCollision, {
        collider: otherKeypoint,
      });
    }

    triggerRaise(otherKeypoint) {
      this.activeCollisions.push(otherKeypoint.name);
      triggerListeners(this, EventType.Raise, { raise: otherKeypoint });
    }
    removeRaise(otherKeypoint) {
      this.activeCollisions.splice(
        this.activeCollisions.indexOf(otherKeypoint.name),
        1
      );

    updateScore(score) {
      this.score = score
    }

    updatePosition(position, deltaT) {
      const x = position.x;
      const y = position.y;
      const previousVelocity = {
        x: this.smoothVelocity.x,
        y: this.smoothVelocity.y,
      };

      this.smoothVelocity.x /= 10;
      this.smoothVelocity.x += (x - this.x) / deltaT;
      this.x = x;

      this.smoothVelocity.y /= 10;
      this.smoothVelocity.y += (y - this.y) / deltaT;
      this.y = y;

      if (!this.isMoving && this.normSpeed > Keypoint.startMovingSpeedCutoff) {
        this.isMoving = true;
        triggerListeners(this, EventType.StartMoving, {});
      }

      // By not stopping untill you've been still for a while, we allow users
      // To change directions without the system claiming you stopped moving.
      if (this.normSpeed < Keypoint.stopMovingSpeedCutoff) {
        this.stillTime += deltaT;
        if (this.stillTime > Keypoint.timeToDetectStop && this.isMoving) {
          this.isMoving = false;
          triggerListeners(this, EventType.StopMoving, {});
        }
      } else {
        this.stillTime = 0;
      }

      const dotProduct =
        previousVelocity.x * this.smoothVelocity.x +
        previousVelocity.y * this.smoothVelocity.y;
      const prevMagnitude = Math.sqrt(
        Math.pow(previousVelocity.x, 2) + Math.pow(previousVelocity.y, 2)
      );
      const currentMagnitude = this.speed;
      const angle =
        (Math.acos(dotProduct / (prevMagnitude * currentMagnitude)) / Math.pi) *
        180;

      if (this.isMoving && angle > Keypoint.angleToChangeDirection) {
        triggerListeners(this, EventType.ChangeDirection, {});
      }

      if (
        !this.rightOfCenter &&
        this.x >
          this.bodyCenterPosition.x +
            Keypoint.crossCenterThreshold / DrawingEngine.getDistanceRatio()
      ) {
        this.rightOfCenter = true;
        triggerListeners(this, EventType.CrossBody, {});
      } else if (
        this.rightOfCenter &&
        this.x <
          this.bodyCenterPosition.x -
            Keypoint.crossCenterThreshold / DrawingEngine.getDistanceRatio()
      ) {
        this.rightOfCenter = false;
        triggerListeners(this, EventType.CrossBody, {});
      }

      triggerListeners(this, EventType.Update, {});
    }
  }



  const bodyCenterPosition = { x: 0, y: 0 };
  const keypointState = {
    nose: new Keypoint("nose", bodyCenterPosition),
    leftEye: new Keypoint("leftEye", bodyCenterPosition),
    rightEye: new Keypoint("rightEye", bodyCenterPosition),
    leftEar: new Keypoint("leftEar", bodyCenterPosition),
    rightEar: new Keypoint("rightEar", bodyCenterPosition),
    leftShoulder: new Keypoint("leftShoulder", bodyCenterPosition),
    rightShoulder: new Keypoint("rightShoulder", bodyCenterPosition),
    leftElbow: new Keypoint("leftElbow", bodyCenterPosition),
    rightElbow: new Keypoint("rightElbow", bodyCenterPosition),
    leftWrist: new Keypoint("leftWrist", bodyCenterPosition),
    rightWrist: new Keypoint("rightWrist", bodyCenterPosition),
    leftHip: new Keypoint("leftHip", bodyCenterPosition),
    rightHip: new Keypoint("rightHip", bodyCenterPosition),
    leftKnee: new Keypoint("leftKnee", bodyCenterPosition),
    rightKnee: new Keypoint("rightKnee", bodyCenterPosition),
    leftAnkle: new Keypoint("leftAnkle", bodyCenterPosition),
    rightAnkle: new Keypoint("rightAnkle", bodyCenterPosition),
  };

  const posenet = ml5.poseNet(
    DrawingEngine.webcam,
    () => {
      console.log("Posenet model loaded");
    }
  );

  let lastPoseTime = new Date().getTime();
  posenet.on("pose", (results) => {
    const currentTime = new Date().getTime();
    const deltaT = currentTime - lastPoseTime;
    const poses = results.map((item) => item.pose);
    if (poses[0]) {
      poses[0].keypoints.forEach(keypoint => {
        keypointState[keypoint.part].updateScore(keypoint.score);
      })
      const keypoints = poses[0].keypoints.filter(
        (keypoint) => keypoint.score > 0.2
      );
      bodyCenterPosition.x = 0;
      bodyCenterPosition.y = 0;
      for (let i = 0; i < keypoints.length; i++) {
        const keypoint = keypoints[i];
        // Average keypoint positions to define center
        bodyCenterPosition.x += keypoint.position.x / keypoints.length;
        bodyCenterPosition.y += keypoint.position.y / keypoints.length;
      }
      for (let i = 0; i < keypoints.length; i++) {
        const keypoint = keypoints[i];
        keypointState[keypoint.part].updatePosition(keypoint.position, deltaT);
      }
      for (let i = 0; i < keypoints.length - 1; i++) {
        const keypoint = keypointState[keypoints[i].part];
        for (let j = i + 1; j < keypoints.length; j++) {
          const otherKeypoint = keypointState[keypoints[j].part];
//////////////////////////////////////////////////////
          if (keypoint.y > bodyCenterPosition.y && otherKeypoint.y > bodyCenterPosition.y){
            keypoint.triggerRaise(otherKeypoint);
            otherKeypoint.triggerRaise(keypoint);
          }
          else {
            keypoint.removeRaise(otherKeypoint);
            otherKeypoint.removeRaise(keypoint);
          }
          //////////////////////////////
          const distance =
            Math.sqrt(
              Math.pow(keypoint.x - otherKeypoint.x, 2) +
                Math.pow(keypoint.y - otherKeypoint.y, 2)
            ) * DrawingEngine.getDistanceRatio();
          if (distance < Keypoint.collisionRadius * 2) {
            if (!keypoint.isCollidingWith(otherKeypoint)) {
              keypoint.triggerCollision(otherKeypoint);
              otherKeypoint.triggerCollision(keypoint);
            }
          } else if (distance > Keypoint.unCollisionRadius * 2) {
            if (keypoint.isCollidingWith(otherKeypoint)) {
              keypoint.removeCollision(otherKeypoint);
              otherKeypoint.removeCollision(keypoint);
            }
          }
        }
      }
    }
  });

  return {
    EventType: EventType,
    EventListener: EventListener,
    keypointState: keypointState,
    addListener: (listener) => {
      eventListeners.push(listener);
    },
    removeListener: (listener) => {
      eventListeners.splice(eventListeners.indexOf(listener), 1);
    },
  };
})();
