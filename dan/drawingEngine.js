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
    // this condition occurs before video permissions are loaded
    if (isNaN(getWebcamRatio())) {
      return {
        width: 0,
        height: 0,
      };
    } else{
      if (window.innerHeight * getWebcamRatio() > window.innerWidth) {
        return {
          width: window.innerWidth*0.65,
          height: window.innerWidth*0.65 / getWebcamRatio(),
        };
      } else {
        return {
          width: window.innerHeight*0.65 * getWebcamRatio(),
          height: window.innerHeight*0.65,
        };
      }
    }
  };

  // multiply by this to get scaled relative coordinates from absolute coordinates
  // divide by this to get absolute coordinates from scaled relative coordinates
  const getDistanceRatio = () => normWidthFactor / webcamSize().width;

  let webcam = null;
  let started = false;

  const p5config = (sketch) => {

    webcam = sketch.createCapture(sketch.VIDEO);
    webcam.hide();

    const resizeWebcam = () => {
      webcam.size(webcamSize().width, webcamSize().height);
    };

    let lastTime = new Date().getTime();

    sketch.setup = () => {
      sketch.colorMode(sketch.HSB, 100);
      var myCanvas = sketch.createCanvas(webcamSize().width, webcamSize().height); 
      myCanvas.parent("p5-canvas-div"); // id of div in HTML
      resizeWebcam();
      lastTime = new Date().getTime();
    };

    const resizeSketch = () => {
      sketch.resizeCanvas(webcamSize().width, webcamSize().height);
    };

    sketch.draw = () => {
      const currentTime = new Date().getTime();
      const deltaT = currentTime - lastTime;
      lastTime = currentTime;
      resizeWebcam();
      resizeSketch(); // force canvas to take on webcam sizing once video is loaded
      sketch.background(0);
      if (started) {
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
          if (doneAnimObj.onRemove) {
            doneAnimObj.onRemove();
          }
        }
      }
    };

    sketch.windowResized = () => {
      sketch.resizeCanvas(webcamSize().width, webcamSize().height);
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
      if (ao.onRemove) {
        ao.onRemove();
      }
    },
    start: () => {
      started = true;
    },
    webcam: webcam
  };
})();
