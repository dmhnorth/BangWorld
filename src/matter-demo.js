var KEYS = {
  'n': 110,
  'space' : 32,
  'r' : 114,
  ',' : 44,
  '.' : 46,
  'R' : 82,
  '1' : 49,
  '2' : 50,
  '3' : 51,
  '4' : 52
}

var POSITIONING = {
  'ph-x-start' : 0,
  'ph-y-start' : 300,
  'world-width' : 800,
  'world-height' : 600,
  'playhead-start-speed' : 5,
  'playhead-speed' : 5
}

var SIZES = {
  'medium-box' : 80,
  'medium-circle' : 40,
  'sequencer-length' : 960,
  'world-height' : 600
}

var SAMPLES = {
  'snare':'/samples/808-Snare.wav',
  'kick':'/samples/808-Kick2.wav',
  'ch':'/samples/808-HatC.wav',
  'oh':'/samples/808-HatOp.wav'
}

//collsion categories
var defaultCategory = 0x0001,
    liveCategory = 0x0002,
    deadCategory = 0x0004;

//Playhead variables
var playing = false;
var counter = 0;


// lower case function names
function startBoxDemo() {

  // Matter.js module aliases, aka window.Matter.Engine window is the global namespace
  var Engine = Matter.Engine,
  World = Matter.World,
  Bodies = Matter.Bodies,
  Events = Matter.Events,
  Body = Matter.Body,
  MouseConstraint = Matter.MouseConstraint;

  // create a Matter.js engine
  var engine = Engine.create(document.getElementById('the-world-div'));

  // create a bumpkit
  var bumpkit = new Bumpkit();

  // create a bumpkit mixer with two tracks
  var mixer = bumpkit.createMixer().addTrack().addTrack();
  //create some samplers, connect to track one and load an audio buffer
  var samplers = [bumpkit.createSampler(), bumpkit.createSampler(), bumpkit.createSampler(), bumpkit.createSampler()];
  for (var i = 0; i < samplers.length; i++) {
    //this will probably need to be more intelligent
    samplers[i].connect(mixer.tracks[0]);
  }

  bumpkit.loadBuffer(SAMPLES['kick'], function(buffer) {
    samplers[0].buffer(buffer);
  });

  bumpkit.loadBuffer(SAMPLES['snare'], function(buffer) {
    samplers[1].buffer(buffer);
  });

  bumpkit.loadBuffer(SAMPLES['ch'], function(buffer) {
    samplers[2].buffer(buffer);
  });

  bumpkit.loadBuffer(SAMPLES['oh'], function(buffer) {
    samplers[3].buffer(buffer);
  });

  // Walls and a ground
  var ground = Bodies.rectangle(400, 605, 810, 10, { isStatic: true, collisionFilter: {category: defaultCategory | liveCategory | deadCategory}});
  var wallLeft = Bodies.rectangle(0, 300, 1, SIZES['world-height'], { isStatic: true, collisionFilter: {category: defaultCategory | liveCategory | deadCategory}});
  var wallRight = Bodies.rectangle(800, 300, 1, SIZES['world-height'], { isStatic: true, collisionFilter: {category: defaultCategory | liveCategory | deadCategory}});

  // create the playhead
  var playhead = Bodies.rectangle(POSITIONING['ph-x-start'], POSITIONING['ph-y-start'], 1, SIZES['world-height'], { isStatic: true, collisionFilter: {mask: liveCategory}});

  // an example of using collisionStart event on an engine, a custom Matter-js listener, with its own implementation of 'on' and 'trigger' from Matter's library
  Events.on(engine, 'collisionStart', function(event) {
    var pairs = event.pairs;
    for (var i = 0; i < pairs.length; i++) {
      var pair = pairs[i];

      if(pair.bodyA === playhead) {
        pair.bodyB.sampler.play();
        pair.bodyB.collisionFilter.category = defaultCategory | deadCategory;
      }

      //console.log('there was a collisionStart',pair.bodyA, pair.bodyB);
      // change object colours to show those starting a collision
      //pair.bodyA.render.fillStyle = '#009900';
      pair.bodyB.render.fillStyle = '#990000';
    }
  })


  //mute button
  var muteButton = document.getElementById('mute-button');
  muteButton.addEventListener('click', function() {
    mixer.tracks.forEach(function(track) {
      track.toggleMute();
    })
  })


  // add all of the bodies to the world
  //World.add(engine.world, [boxA, boxB, circleA])
  World.add(engine.world, [ground, wallLeft, wallRight, playhead]);

  // http://www.cambiaresearch.com/articles/15/javascript-key-codes
  document.onkeypress = function(keys) {
    console.log(keys.keyCode);

function addTriggerBody(newTriggerBody) {
  newTriggerBody.collisionFilter.category = defaultCategory | liveCategory;
  World.add(engine.world, newTriggerBody);
}

    //sample creators
    if (keys.keyCode === KEYS['1']) {
      var newBox = Bodies.rectangle(60, 50, 80, 80);
      newBox.sampler = samplers[0];
      addTriggerBody(newBox);
    }
    if (keys.keyCode === KEYS['2']) {
      var newBox = Bodies.rectangle(60, 50, 80, 80);
      newBox.sampler = samplers[1];
      addTriggerBody(newBox);
    }
    if (keys.keyCode === KEYS['3']) {
      var newBox = Bodies.rectangle(60, 50, 80, 80);
      newBox.sampler = samplers[2];
      addTriggerBody(newBox);
    }
    if (keys.keyCode === KEYS['4']) {
      var newBox = Bodies.rectangle(60, 50, 80, 80);
      newBox.sampler = samplers[3];
      addTriggerBody(newBox);
    }

    if (keys.keyCode === KEYS['space']) {
      if(playing) {
        stopPlayhead()
      } else {
        startPlayhead();
      }
    }
    if (keys.keyCode === KEYS['r']) {
      resetPlayhead();
    }
    if (keys.keyCode === KEYS[',']) {
      decreasePlayheadSpeed()
    }
    if (keys.keyCode === KEYS['.']) {
      increasePlayheadSpeed()
    }
    if (keys.keyCode === KEYS['R']) {
      invertPlayheadSpeed()
    }
  }


  //playhead timer
  Events.on(engine, 'beforeUpdate', function(event) {
    if(playing){
      if(counter >= POSITIONING['world-width']){
        counter = 0;
      }
      if(counter < 0){
        counter = POSITIONING['world-width'];
      }
      counter += POSITIONING['playhead-speed'];
      Body.setPosition(playhead, { x: counter, y:POSITIONING['ph-y-start'] });
    }
  })

  //playhead controls
  function startPlayhead() {
    playing = true;
  }
  function stopPlayhead() {
    playing = false;
  }
  function resetPlayhead() {
    Body.setPosition(playhead, { x:  POSITIONING['ph-x-start'], y:POSITIONING['ph-y-start'] });
    Body.setAngle(playhead, 0);
    Body.setVelocity(playhead, { x:  0, y:0 });
    Body.setAngularVelocity(playhead, 0);
    playing = false;
    counter = 0;
    POSITIONING['playhead-speed'] = POSITIONING['playhead-start-speed'];

  }
  function increasePlayheadSpeed() {
    POSITIONING['playhead-speed'] = POSITIONING['playhead-speed'] + 1;
  }
  function decreasePlayheadSpeed() {
    POSITIONING['playhead-speed'] = POSITIONING['playhead-speed'] - 1;
  }
  function invertPlayheadSpeed() {
    POSITIONING['playhead-speed'] = POSITIONING['playhead-speed'] - POSITIONING['playhead-speed'] * 2;
  }



  // set environment variables and run the engine
  var renderOptions = engine.render.options;
  renderOptions.wireframes = false;
  Engine.run(engine);
  World.add(engine.world, MouseConstraint.create(engine));
}

MatterDemo = {start:startBoxDemo}
