const clapToSparkleListener = new EventListener('leftWrist', EventType.Collision, (keypoint, data) => {
  if (data.collider.name === 'rightWrist') {
    Engine.addAnimatedObject(new Sparkle(keypoint.x, keypoint.y, 3000));
    Engine.addAnimatedObject(new Sparkle(data.collider.x, data.collider.y, 3000));
  }
});

Engine.addListener(clapToSparkleListener);
