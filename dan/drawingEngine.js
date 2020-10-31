const DrawingEngine = (() => {
  class AnimatedObject {
    constructor(drawFunction) {
      if (drawFunction) {
        this.draw = drawFunction; // (sketch, deltaT, keypointState)
      }
    }
  }

  const normWidthFactor = 1280; // Arbitrary number to allow us to define units of distance consistently independent of window size

  const animatedObjects = [];

  const getWebcamRatio = () =>
    document.querySelector("video").videoWidth /
    document.querySelector("video").videoHeight;
  const webcamSize = () => {
    if (window.innerHeight * getWebcamRatio() > window.innerWidth) {
      return {
        width: window.innerWidth,
        height: window.innerWidth / getWebcamRatio(),
      };
    } else {
      return {
        width: window.innerHeight * getWebcamRatio(),
        height: window.innerHeight,
      };
    }
  };

  // multiply by this to get scaled relative coordinates from absolute coordinates
  // divide by this to get absolute coordinates from scaled relative coordinates
  const getDistanceRatio = () => normWidthFactor / webcamSize().width;

  let webcam = null;

  const p5config = (sketch) => {

    webcam = sketch.createCapture(sketch.VIDEO);
    webcam.hide();

    const resizeWebcam = () => {
      webcam.size(webcamSize().width, webcamSize().height);
    };

    let lastTime = new Date().getTime();

    sketch.setup = () => {
      sketch.colorMode(sketch.HSB, 100);
      sketch.createCanvas(window.innerWidth, window.innerHeight);
      resizeWebcam();
      lastTime = new Date().getTime();
    };

    sketch.draw = () => {

      const currentTime = new Date().getTime();
      const deltaT = currentTime - lastTime;
      lastTime = currentTime;
      resizeWebcam();
      sketch.background(100);
      sketch.image(webcam, 0, 0, webcamSize().width, webcamSize().height);
      const doneAnimObjects = [];
      for (let i = 0; i < animatedObjects.length; i++) {
        const animObj = animatedObjects[i];
        if (animObj.draw(sketch, deltaT)) {
          doneAnimObjects.push(animObj);
        }
      }
      for (let i = 0; i < doneAnimObjects.length; i++) {
        const doneAnimObj = doneAnimObjects[i];
        animatedObjects.splice(animatedObjects.indexOf(doneAnimObj), 1);
      }
    };

    sketch.windowResized = () => {
      sketch.resizeCanvas(window.innerWidth, window.innerHeight);
      resizeWebcam();
    };
  };

  new p5(p5config);

  return {
    AnimatedObject: AnimatedObject,
    getDistanceRatio: getDistanceRatio,
    addAnimatedObject: (ao) => {
      animatedObjects.push(ao);
      if (ao.onAdd) {
        ao.onAdd();
      }
    },
    removeAnimatedObject: (ao) => {
      animatedObjects.splice(animatedObjects.indexOf(ao), 1);
    },
    webcam: webcam
  };
})();
