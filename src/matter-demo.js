var KEYS = {
  'n': 110
}

// lower case function names
function startBoxDemo() {

  // Matter.js module aliases, aka window.Matter.Engine window is the global namespace
  var Engine = Matter.Engine,
      World = Matter.World,
      Bodies = Matter.Bodies,
      Events = Matter.Events;

    // create a Matter.js engine
    var engine = Engine.create(document.getElementById('the-world-div'));

    // create a bumpkit
    var bumpkit = new Bumpkit();

    // create a bumpkit mixer with two tracks
    var mixer = bumpkit.createMixer().addTrack().addTrack();
    //create a new sampler instrument, connect to track one and load an audio buffer
var sampler = bumpkit.createSampler().connect(mixer.tracks[0]);

bumpkit.loadBuffer('/samples/snare.wav', function(buffer) {
  sampler.buffer(buffer);
});



    // create two boxes and a ground
    var boxA = Bodies.rectangle(400, 200, 80, 80);
    var boxB = Bodies.rectangle(450, 50, 80, 80);
    var ground = Bodies.rectangle(400, 610, 810, 60, { isStatic: true });


    // an example of using collisionStart event on an engine, a custom Matter-js listener, with its own implementation of 'on' and 'trigger' from Matter's library
                Events.on(engine, 'collisionStart', function(event) {
                  console.log('there was a collision');
                  sampler.play();

                    var pairs = event.pairs;

                    // change object colours to show those starting a collision
                    for (var i = 0; i < pairs.length; i++) {
                        var pair = pairs[i];
                        pair.bodyA.render.fillStyle = '#298217';
                        pair.bodyB.render.fillStyle = '#bbbbbb';
                    }
                })




    // add all of the bodies to the world
    World.add(engine.world, [boxA, boxB, ground]);

// http://www.cambiaresearch.com/articles/15/javascript-key-codes
    document.onkeypress = function(keys) {
      console.log(keys.keyCode);
      if (keys.keyCode === KEYS['n']) {
        var newBox = Bodies.rectangle(500, 50, 80, 80);
        World.add(engine.world, [newBox]);
      }
    }

    //
    var renderOptions = engine.render.options;
    renderOptions.wireframes = false;

    // run the engine
    Engine.run(engine);
}

MatterDemo = {start:startBoxDemo}
