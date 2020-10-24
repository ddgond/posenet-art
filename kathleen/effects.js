class Sparkle extends AnimatedObject {
  static fallSpeed = 40 / 1000; // per ms
  static wiggleDistance = 60;
  
  constructor(x, y, radius, duration) {
    super();
    this.elapsedTime = 0;
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.duration = duration;
  }
  
  draw(sketch, deltaT, keypointState) {
    this.elapsedTime += deltaT;
    if (this.elapsedTime > this.duration) {
      return true; // Done
    }
    
    const progressRatio = this.elapsedTime / this.duration;
    
    sketch.noStroke();
    const opacity = (1 - (Math.random() * Math.random())) * (1 - progressRatio) * 100
    const hue = 14 + Math.random() * 2;
    const saturation = Math.random() * Math.random() * 100;
    const brightness = 100;
    sketch.fill(hue, saturation, brightness, opacity);
    this.x = this.x + (Math.random()-0.5) * Sparkle.wiggleDistance / getDistanceRatio();
    this.y = this.y + (Math.random()-0.2) * 2 * Sparkle.fallSpeed / getDistanceRatio() * deltaT;
    sketch.ellipse(this.x, this.y, this.radius / getDistanceRatio(), this.radius / getDistanceRatio());
    return false;
  }
}

class Fire extends AnimatedObject {
  
  constructor(x, y, radius, duration) {
    super();
    this.elapsedTime = 0;
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.duration - duration;
  }

  draw(sketch, deltaT, keypointState) {
    this.elapsedTime += deltaT;
    if (this.elapsedTime > this.duration) {
      return true; // will disappear
    }

    sketch.noStroke() // disables outline
    sketch.fill(100, 100, 100, 100);
    this.x = this.x + (Math.random()-0.5) * Sparkle.wiggleDistance / getDistanceRatio();
    this.y = this.y + (Math.random()-0.2) * 2 * Sparkle.fallSpeed / getDistanceRatio() * deltaT;
    sketch.triangle(this.x, this.y, this.x + 30, this.y, this.x+15, this.y+15);
    return false;
  }
}