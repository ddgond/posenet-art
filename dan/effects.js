class Sparkle extends AnimatedObject {
  static getFallSpeed = () => 10 * getDistanceRatio() / 1000; // per ms
  static getWiggleDistance = () => 10 * getDistanceRatio();
  
  constructor(x, y, duration) {
    super();
    this.elapsedTime = 0;
    this.spawnX = x;
    this.spawnY = y;
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
    sketch.fill(0, 0, 100, opacity);
    const x = this.spawnX + Math.random() * Sparkle.getWiggleDistance();
    const y = this.spawnY + Sparkle.getFallSpeed() * this.elapsedTime;
    sketch.ellipse(x, y, 10 * getDistanceRatio(), 10 * getDistanceRatio());
    return false;
  }
}