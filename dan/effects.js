class Sparkle extends DrawingEngine.AnimatedObject {
  static fallSpeed = 300 / 1000; // per ms
  static wiggleDistance = 25;
  
  constructor(x, y, radius, duration) {
    super();
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.elapsedTime = 0;
    this.duration = duration;
    this.done = false;

    this.raiseSound = new Tone.Player({
      url:'music/glitch/sparkle.mp3',
      autostart: true,
      loop : false,
      volume: -15,
    }).toDestination();
    // this.fireSound = new Tone.Player({
    //   url:'music/fire/fire.mp3',
    //   autostart: true,
    //   loop: true,
    //   loopStart: 0.45,
    //   loopEnd: 2.5,
    //   volume: -5
    // }).toDestination();
  }
  
  remove() {
    this.done = true;
  }
  
  draw(sketch, deltaT) {
    this.elapsedTime += deltaT;
    if (this.elapsedTime > this.duration) {
      return true; // Done
    }
    
    const progressRatio = this.elapsedTime / this.duration;
    
    sketch.noStroke();
    const opacity = (1 - (Math.random() * Math.random())) * (1 - progressRatio) * 100
    const hue = 14 + Math.random() * 90;
    const saturation = Math.random() * Math.random() * 100;
    const brightness = 100;
    sketch.fill(hue, saturation, brightness, opacity);
    this.x = this.x + (Math.random()-0.5) * Sparkle.wiggleDistance / DrawingEngine.getDistanceRatio();
    this.y = this.y + (Math.random()-0.2) * 2 * Sparkle.fallSpeed / DrawingEngine.getDistanceRatio() * deltaT;
    sketch.ellipse(this.x, this.y, this.radius / DrawingEngine.getDistanceRatio(), this.radius / DrawingEngine.getDistanceRatio());
    return this.done;
  }

  onRemove() {
    if (this.raiseSound.loaded) {
      this.raiseSound.seek(999);
      this.raiseSound.onstop = () => {
        this.raiseSound.dispose();
      };
      // this.raiseSound.loop = false;
      // this.raiseSound.seek(2.5);
    }
  }
}


class KeypointDebugger extends DrawingEngine.AnimatedObject {
  constructor() {
    super();
  }
  
  draw(sketch, deltaT) {
    const keypoints = Object.values(PoseEngine.keypointState);
    console.log(keypoints);
    keypoints
      .filter(keypoint => keypoint.score > 0.2)
      .forEach((keypoint) => {
        sketch.strokeWeight(5);
        sketch.stroke(100 - keypoint.normSpeed * 20, 100, 100);
        sketch.line(
            keypoint.x,
            keypoint.y,
            keypoint.x - (keypoint.velocity.x * 10),
            keypoint.y - (keypoint.velocity.y * 10)
        );
        if (keypoint.name === 'rightPalm') {
          sketch.circle(keypoint.x, keypoint.y, 20)
        }
    });
    
  }
}

class CloudPoof extends DrawingEngine.AnimatedObject {
  constructor(x, y, r, xVel, yVel) {
    super();
    this.x = x;
    this.y = y;
    this.xVel = xVel;
    this.yVel = yVel;
    this.r = r;
    this.elapsedTime = 0;
    this.duration = 2000;
    this.numSides = Math.floor(Math.random() * 5) + 5 // 5,6,7,8,9-sided poofs
    this.vertices = [];
    this.generateVertices();
  }
  
  generateVertices() {
    const anglePerIter = 2 * Math.PI / this.numSides;
    const randomMult = () => Math.random() * 0.3 + 0.85
    for (let i = 0; i < this.numSides; i++) {
      this.vertices.push({angle: anglePerIter * i, distance: this.r * randomMult()})
    }
  }
  
  draw(sketch, deltaT) {
    this.elapsedTime += deltaT;
    if (this.elapsedTime > this.duration) {
      return true; // Done
    }
    
    const progressRatio = this.elapsedTime / this.duration;
    
    const hue = Math.random() * 5;
    const saturation = Math.random() * 15 + 30;
    const brightness = Math.random() * 15 + 10;
    const opacity = Math.random() * 30 + 70;
    sketch.fill(hue, saturation, brightness, opacity);
    sketch.noStroke()
    sketch.beginShape();
    this.vertices.forEach(vertex => {
      const xyResults = this.vertexToXY(vertex, progressRatio);
      sketch.vertex(xyResults.x, xyResults.y);
    });
    sketch.endShape();
    
    this.x += this.xVel;
    this.y += this.yVel;
  }
  
  sizeMultiplier(progressRatio) {
    return -4 * (progressRatio) * (progressRatio - 1);
  }
  
  vertexToXY(vertex, progressRatio) {
    const angle = vertex.angle;
    const distance = vertex.distance;
    const xOffset = Math.sin(angle) * distance * this.sizeMultiplier(progressRatio);
    const yOffset = Math.cos(angle) * distance * this.sizeMultiplier(progressRatio);
    return {x: this.x + xOffset / DrawingEngine.getDistanceRatio(), y: this.y + yOffset / DrawingEngine.getDistanceRatio()};
  }
}

class FireWithSmoke extends DrawingEngine.AnimatedObject {
  static itersPerFlame = 16; // how many in-out-edges per side
  static rotationSpeed = Math.PI / 1000; // How far to advance per ms
  static windOscillation = 0.2; // How much to oscillate without wind as a function of radius
  static poofRate = 10; // How many poofs per second on average
  
  static generateFlameEdgeVertices = (x, y) => {
    const vertices = [];
    const anglePerSubIter = 2 * Math.PI / (FireWithSmoke.itersPerFlame * 2);
    const randomPosMult = () => 0.05 + Math.random() * 0.15;
    const randomNegMult = () => -0.05 - Math.random() * 0.35;
    const randomSpeedMult = () => Math.random() * 0.2 + 0.9;
    for (let i = 0; i < FireWithSmoke.itersPerFlame; i++) {
      vertices.push({angle: anglePerSubIter * (2 * i), rMultOffset:randomPosMult(), speedMult: randomSpeedMult()})
      vertices.push({angle: anglePerSubIter * (2 * i + 1), rMultOffset:randomNegMult(), speedMult: randomSpeedMult()})
    }
    return vertices;
  }
  
  constructor(x, y, r) {
    super();
    this.x = x;
    this.y = y;
    this.r = r;
    this.xWind = 0;
    this.yWind = 0;
    this.windFromMovement = {x:0,y:0};
    this.windOscillationFactor = 0;
    // Represented as a spiky circle, will be transformed to be flame-shaped
    this.flameEdgeVertices = FireWithSmoke.generateFlameEdgeVertices(x, y);
    this.target = null;
    this.done = false;
    this.matchSound = new Tone.Player({
      url:'music/fire/matches.mp3',
      autostart: true,
    }).toDestination();
    this.fireSound = new Tone.Player({
      url:'music/fire/fire.mp3',
      autostart: true,
      loop: true,
      loopStart: 0.45,
      loopEnd: 2.5,
      volume: -5
    }).toDestination();
  }
  
  onRemove() {
    if (this.matchSound.loaded) {
      this.matchSound.start();
      this.matchSound.onstop = () => {
        this.matchSound.dispose();
      };
    }
    if (this.fireSound.loaded) {
      this.fireSound.loop = false;
      this.fireSound.seek(2.5);
      this.fireSound.onstop = () => {
        this.fireSound.dispose();
      };
    }
  }
  
  setWind(xSpeed, ySpeed) {
    this.xWind = xSpeed;
    this.yWind = ySpeed;
  }
  
  updateWind() {
    this.windOscillationFactor = Math.sin(new Date().getTime() / 1000 * 2) * 0.5 * FireWithSmoke.windOscillation * this.r;
    if (this.target) {
      this.windFromMovement = {x: this.target.normVelocity.x * 1000 * 5, y: this.target.normVelocity.y * 1000 * 5};
    }
  }
  
  setTarget(keypoint) {
    this.target = keypoint;
  }
  
  shouldGeneratePoof(deltaT) {
    // Poisson distribution
    const lambda = FireWithSmoke.poofRate * deltaT / 1000;
    const probability = lambda / Math.E;
    return Math.random() < probability;
  }
  
  generatePoof() {
    const initialCloudY = -3;
    const randomOffset = () => Math.random() * this.r * 2 - this.r;
    const randomXSpeed = () => Math.random() * this.r / 20 - this.r / 40;
    if (this.target) {
      DrawingEngine.addAnimatedObject(new CloudPoof(this.target.x + randomOffset(), this.target.y - this.r + randomOffset(), this.r * 0.75, randomXSpeed() + this.target.normVelocity.x * 1000 / 10, this.target.normVelocity.y * 1000 / 10 + initialCloudY));
    } else {
      DrawingEngine.addAnimatedObject(new CloudPoof(this.x + randomOffset(), this.y - this.r + randomOffset(), this.r * 0.75, randomXSpeed(), initialCloudY));
    }
  }
  
  draw(sketch, deltaT) {
    this.rotateEdgeVertices(deltaT);
    this.updateWind();
    const hue = Math.random() * 5;
    const saturation = Math.random() * 5 + 95;
    const brightness = Math.random() * 5 + 95;
    const opacity = Math.random() * 15 + 85;
    sketch.fill(hue, saturation, brightness, opacity);
    sketch.noStroke()
    sketch.beginShape();
    this.flameEdgeVertices.forEach(vertex => {
      const xyResults = this.vertexToXY(vertex);
      sketch.vertex(xyResults.x, xyResults.y);
    });
    sketch.endShape();
    if (this.shouldGeneratePoof(deltaT)) {
      this.generatePoof()
    }
    // sketch.fill(50,100,100,50);
    // sketch.circle(this.x, this.y, this.r * 2); // Debug circle for sizing
    return this.done;
  }
  
  remove() {
    this.done = true;
  }
  
  rotateEdgeVertices(deltaT) {
    const speed = FireWithSmoke.rotationSpeed * deltaT;
    this.flameEdgeVertices.forEach((vertex, i) => {
      if (vertex.angle < Math.PI) {
        vertex.angle -= speed * vertex.speedMult;
        if (vertex.angle < 0) {
          vertex.angle = vertex.angle + Math.PI
        }
      } else {
        vertex.angle += speed * vertex.speedMult;
        if (vertex.angle > Math.PI * 2) {
          vertex.angle = vertex.angle - Math.PI
        }
      }
    });
    this.flameEdgeVertices.sort((a, b) => a.angle - b.angle)
  }
  
  vertexToXY(vertex) {
    const vertexTransform = this.vertexTransform(vertex);
    const angle = vertexTransform.angle;
    const radialDistance = vertexTransform.radialDistance;
    const xOffset = Math.sin(angle) * radialDistance + (this.xWind + this.windOscillationFactor + this.windFromMovement.x) * vertexTransform.windFactor;
    const yOffset = Math.cos(angle) * radialDistance + (this.yWind + this.windFromMovement.y) * vertexTransform.windFactor;
    if (this.target) {
      return {x: this.target.x + xOffset / DrawingEngine.getDistanceRatio(), y: this.target.y + yOffset / DrawingEngine.getDistanceRatio()};
    }
    return {x: this.x + xOffset / DrawingEngine.getDistanceRatio(), y: this.y + yOffset / DrawingEngine.getDistanceRatio()};
  }
  
  vertexTransform(vertex) {
    let angle = -1 * Math.abs(Math.PI - vertex.angle) + Math.PI; // Normalize for left side of circle
    let rMultOffset = this.scaleRMultOffset(vertex.rMultOffset, angle);
    let radialDistance = this.scaleRadialDistance(this.r, angle) * (1 + rMultOffset);
    return {angle: vertex.angle, radialDistance: radialDistance, windFactor: radialDistance / this.r};
  }
  
  scaleRMultOffset(rMultOffset, angle) {
    const param = 1 - angle / Math.PI;
    // return ((param - 1) * (param + 1) + 1) * 2 * rMultOffset // Quadratic curve from (0,0) at base to (1,rMultOffset * 3)
    return Math.pow(1 + rMultOffset, param) - 1 // Exponential curve from (0,0) at base to (1,rMultOffset * 2)
  }
  
  scaleRadialDistance(radialDistance, angle) {
    const param = angle / Math.PI;
    // return ((param - 1) * (param + 1) + 1) * 3 * rMultOffset // Quadratic curve from (0,0) at base to (1,rMultOffset * 3)
    // return Math.pow(1 + radialDistance * 2, param) - 1 // Exponential curve from (0,0) at base to (1,rMultOffset * 3)
    // return (Math.asin(param - 0.5) + (Math.PI / 2 - Math.asin(-0.5))) / Math.PI * radialDistance * 1.5 // Inverse sin curve
    return (Math.tan((param - (1/(Math.PI/4+0.5))) * (Math.PI/4+0.5)) + Math.tan(-0.5)) * radialDistance; // param = 0,1 mapped to -0.5,Math.PI/4 of tan function
  }
}

class Lightning extends DrawingEngine.AnimatedObject {
  static distancePerZag = 12;
  static zagSize = 24;
  static numBolts = 5;
  
  constructor(targets) {
    super();
    this.targets = targets;
    this.done = false;
  }
  
  remove() {
    this.done = true;
  }
  
  draw(sketch, deltaT) {
    for (let boltIndex = 0; boltIndex < Lightning.numBolts; boltIndex++) {
      const path = this.generatePath();
      
      const hue = Math.random() * 5 + 50;
      const outerSaturation = Math.random() * 5 + 95;
      const outerBrightness = Math.random() * 5 + 85;
      const opacity = Math.random() * 15 + 85;
      sketch.stroke(hue, outerSaturation, outerBrightness, opacity);
      sketch.strokeWeight(7);
      sketch.noFill();
      sketch.beginShape(sketch.LINE_STRIP);
      path.forEach(vertex => {
        sketch.vertex(vertex.x, vertex.y);
      });
      sketch.endShape();
      
      const innerSaturation = Math.random() * 5;
      const innerBrightness = Math.random() * 5 + 95;
      sketch.stroke(hue, innerSaturation, innerBrightness, opacity);
      sketch.strokeWeight(3);
      sketch.noFill();
      sketch.beginShape(sketch.LINE_STRIP);
      path.forEach(vertex => {
        sketch.vertex(vertex.x, vertex.y);
      });
      sketch.endShape();
    }
    return this.done;
  }
  
  generatePath() {
    const vertices = [];
    for (let pathSegmentIndex = 0; pathSegmentIndex < this.targets.length - 1; pathSegmentIndex++) {
      const start = this.targets[pathSegmentIndex];
      const end = this.targets[pathSegmentIndex+1];
      const steps = this.getDistance(start, end) / Lightning.distancePerZag;
      for (let stepIndex = 0; stepIndex < steps; stepIndex++) {
        const x = start.x + (end.x - start.x) * stepIndex / steps + Math.random() * Lightning.zagSize - Lightning.zagSize / 2;
        const y = start.y + (end.y - start.y) * stepIndex / steps + Math.random() * Lightning.zagSize - Lightning.zagSize / 2;
        vertices.push({x:x, y:y});
      }
    }
    const lastTarget = this.targets[this.targets.length - 1];
    vertices.push({x:lastTarget.x, y:lastTarget.y});
    return vertices;
  }
  
  getDistance(a, b) {
    return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
  }
}

class Skeleton extends DrawingEngine.AnimatedObject {
  constructor(visible) {
    super();
    this.visible = visible;
    this.points = {
      "leftShoulder": {x:0,y:0,active:false},
      "rightShoulder": {x:0,y:0,active:false},
      "leftElbow": {x:0,y:0,active:false},
      "rightElbow": {x:0,y:0,active:false},
      "leftWrist": {x:0,y:0,active:false},
      "rightWrist": {x:0,y:0,active:false},
      "leftHip": {x:0,y:0,active:false},
      "rightHip": {x:0,y:0,active:false},
      "leftKnee": {x:0,y:0,active:false},
      "rightKnee": {x:0,y:0,active:false},
      "leftAnkle": {x:0,y:0,active:false},
      "rightAnkle": {x:0,y:0,active:false},
    }
    this.bones = [
      [this.points.leftShoulder, this.points.leftElbow],
      [this.points.leftElbow, this.points.leftWrist],
      [this.points.leftShoulder, this.points.leftHip],
      [this.points.leftHip, this.points.leftKnee],
      [this.points.leftKnee, this.points.leftAnkle],
      [this.points.rightShoulder, this.points.rightElbow],
      [this.points.rightElbow, this.points.rightWrist],
      [this.points.rightShoulder, this.points.rightHip],
      [this.points.rightHip, this.points.rightKnee],
      [this.points.rightKnee, this.points.rightAnkle],
      [this.points.leftShoulder, this.points.rightShoulder],
      [this.points.leftHip, this.points.rightHip],
    ]
  }
  
  makeVisible() {
    this.visible = true;
  }
  
  makeInvisible() {
    this.visible = false;
  }
  
  updatePoint(point) {
    if (!this.points[point.part]) {
      return;
    }
    this.points[point.part].x = point.position.x;
    this.points[point.part].y = point.position.y;
    this.points[point.part].active = point.score > 0.2;
  }
  
  draw(sketch, deltaT) {
    if (this.visible) {
      sketch.stroke(0,0,100);
      sketch.strokeWeight(4);
      this.bones.forEach(bone => {
        if (bone[0].active && bone[1].active) {
          sketch.line(bone[0].x, bone[0].y, bone[1].x, bone[1].y);
        }
      });
    }
    
    return false;
  }
}