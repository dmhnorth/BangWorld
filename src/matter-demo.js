var KEYS = {
  'n': 110
}

var SIZES = {
  'medium-box' : 80,
  'sequencer-length' : 960,
  'world-height' : 600
}

// lower case function names
function startBoxDemo() {

  // Matter.js module aliases, aka window.Matter.Engine window is the global namespace
  var Engine = Matter.Engine,
      World = Matter.World,
      Bodies = Matter.Bodies,
      Events = Matter.Events,
      Bounds = Matter.Bounds,
      MouseConstraint = Matter.MouseConstraint;

    // create a Matter.js engine
    var engine = Engine.create(document.getElementById('the-world-div'));

    // edit the world
    //engine.world.bounds.max.x = SIZES['sequencer-length'];
    //engine.world.bounds.max.y = 800;

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
    var boxA = Bodies.rectangle(400, 200, SIZES['medium-box'], SIZES['medium-box']);
    var boxB = Bodies.rectangle(450, 50, SIZES['medium-box'], SIZES['medium-box']);
    var ground = Bodies.rectangle(400, 605, 810, 10, { isStatic: true });
    var wallLeft = Bodies.rectangle(0, 300, 1, 600, { isStatic: true });
    var wallRight = Bodies.rectangle(800, 300, 1, 600, { isStatic: true });
    var playhead = Bodies.rectangle(10, 0, 1, SIZES['world-height']);


    // an example of using collisionStart event on an engine, a custom Matter-js listener, with its own implementation of 'on' and 'trigger' from Matter's library
                Events.on(engine, 'collisionStart', function(event) {
                  console.log('there was a collision');
                  sampler.play();

                    var pairs = event.pairs;

                    // change object colours to show those starting a collision
                    for (var i = 0; i < pairs.length; i++) {
                        var pair = pairs[i];
                        pair.bodyA.render.fillStyle = '#009900';
                        pair.bodyB.render.fillStyle = '#990000';
                    }
                })


var muteButton = document.getElementById('mute-button');
muteButton.addEventListener('click', function() {
  mixer.tracks.forEach(function(track) {
    track.toggleMute();
  })
})


    // add all of the bodies to the world

    World.add(engine.world, [boxA, boxB, ground, wallLeft, wallRight, playhead]);

// http://www.cambiaresearch.com/articles/15/javascript-key-codes
    document.onkeypress = function(keys) {
      console.log(keys.keyCode);
      if (keys.keyCode === KEYS['n']) {
        var newBox = Bodies.rectangle(0, 50, 80, 80);
        World.add(engine.world, [newBox]);
      }
    }

    //
    var renderOptions = engine.render.options;
    renderOptions.wireframes = false;



    // run the engine
    Engine.run(engine);
    World.add(engine.world, MouseConstraint.create(engine));
}

MatterDemo = {start:startBoxDemo}
