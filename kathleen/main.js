const clapToSparkleListener = new EventListener('leftWrist', EventType.Collision, (keypoint, data) => {
  if (data.collider.name === 'rightWrist') {
    for (let i = 0; i < 25; i++) {
      const randomOffset = () => (Math.random() * 100 - 50) / getDistanceRatio();
      Engine.addAnimatedObject(new Sparkle(keypoint.x + randomOffset(), keypoint.y + randomOffset(), 20, 3000));
      Engine.addAnimatedObject(new Sparkle(data.collider.x + randomOffset(), data.collider.y + randomOffset(), 20, 3000));
      Engine.addAnimatedObject(new Fire(data.collider.x + randomOffset(), data.collider.y + randomOffset(), 20, 3000));
    }
  }
});

Engine.addListener(clapToSparkleListener);
