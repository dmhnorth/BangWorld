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
  '4' : 52,
  'c' : 99,
  't' : 116
}

var POSITIONING = {
  'ph-x-start' : 0,
  'ph-y-start' : 300,
  //how to extract these automatically?
  'world-width' : 800,
  'world-height' : 600,
  'playhead-start-speed' : 5,
  'playhead-speed' : 5
}
var spawnPoint = 400;

var COLOUR = {
  0 : '#4D4D4D',
  1 : '#FF5900',
  2 : '#FF8000',
  3 : '#FFA100',
  4 : '#FFFFFF'
}



var TIMING = {
  'note-length' : 4,
  'note-size' : 50
}

var SAMPLES = {
  'snare':'/samples/808-Snare.wav',
  'kick':'/samples/808-Kick2.wav',
  'ch':'/samples/808-HatC.wav',
  'oh':'/samples/808-HatOp.wav'
}

//collision categories
var defaultCategory = 0x0001,
liveCategory = 0x0002,
deadCategory = 0x0004;

//Playhead variables
var playing = false;
var counter = 0;

//other bits
var grid = [];
var gridAmountToAdd = 1;
var triggerBodyList = [];
var currentSample = 0;
var currentColour = COLOUR[0];
var keepStatic = true;
//------------------------//

function getCurrentNoteSize() {
  return POSITIONING['world-width']/TIMING['note-length'];
}

function generateGrid(gridSize) {
  grid = [];
  for (var i = 0; i <= gridSize-1; i++) {
    grid.push(i* (800/gridSize));
  }
  console.log('New Grid is', grid);
  return grid;
}

function placeNotes(newTriggerBodies) {
  generateGrid(newTriggerBodies);
  for (var i = 0; i < grid.length; i++) {
    generateTrigger(grid[i], currentSample, currentColour);
  }
}

function resetTriggerBodies(triggerBodies) {
  for (var i = 0; i < triggerBodies.length; i++) {
    triggerBodies[i].collisionFilter.category = defaultCategory | liveCategory;
  }
}

function generateTrigger(xLocation, sampler, colour) {
  var newBox = Bodies.rectangle(xLocation + getCurrentNoteSize()/2, 0, getCurrentNoteSize(), getCurrentNoteSize(), {render : {strokeStyle: colour, fillStyle: colour}});
  newBox.sampler = samplers[sampler];
  addTriggerBody(newBox);
  updateSampleNameBox(sampler);
}

function updateSampleNameBox(sampler) {
  document.getElementById("sample-name").value = 'Sample:' + sampler + ' length:' + TIMING['note-length'];
}

function addTriggerBody(newTriggerBody) {
  newTriggerBody.collisionFilter.category = defaultCategory | liveCategory;
  triggerBodyList.push(newTriggerBody);
  World.add(engine.world, newTriggerBody);
}


// Matter.js module aliases, aka window.Matter.Engine window is the global namespace
var Engine = Matter.Engine,
World = Matter.World,
Bodies = Matter.Bodies,
Events = Matter.Events,
Body = Matter.Body,
Composite = Matter.Composite,
MouseConstraint = Matter.MouseConstraint;

var engine,
mixer,
samplers,
bumpkit;


// lower case function names
function start() {

  // create a Matter.js engine
  engine = Engine.create(document.getElementById('the-world-div'));

  // Walls and a ground
  var ground = Bodies.rectangle(400, 605, 810, 10, { isStatic: true, collisionFilter: {category: defaultCategory | liveCategory | deadCategory}});
  var wallLeft = Bodies.rectangle(0, 300, 1, POSITIONING['world-height'], { isStatic: true, collisionFilter: {category: defaultCategory | liveCategory | deadCategory}});
  var wallRight = Bodies.rectangle(800, 300, 1, POSITIONING['world-height'], { isStatic: true, collisionFilter: {category: defaultCategory | liveCategory | deadCategory}});
  // create the playhead
  var playhead = Bodies.rectangle(POSITIONING['ph-x-start'], POSITIONING['ph-y-start'], 1, POSITIONING['world-height'], { isStatic: true, collisionFilter: {mask: liveCategory}});

  // create a bumpkit
  bumpkit = new Bumpkit();
  // create a bumpkit mixer with two tracks
  mixer = bumpkit.createMixer().addTrack().addTrack();
  //create some samplers, connect to track one and load an audio buffer
  samplers = [bumpkit.createSampler(), bumpkit.createSampler(), bumpkit.createSampler(), bumpkit.createSampler()];
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

  // an example of using collisionStart event on an engine, a custom Matter-js listener, with its own implementation of 'on' and 'trigger' from Matter's library
  Events.on(engine, 'collisionStart', function(event) {
    var pairs = event.pairs;
    for (var i = 0; i < pairs.length; i++) {
      var pair = pairs[i];

      if(pair.bodyA === playhead) {
        pair.bodyB.sampler.play();
        pair.bodyB.collisionFilter.category = defaultCategory | deadCategory;
      }
    }
  })


  //mute button
  var muteButton = document.getElementById('mute-button');
  muteButton.addEventListener('click', function() {
    mixer.tracks.forEach(function(track) {
      track.toggleMute();
    })
  })

  //note size selector
  var lengthChoice = document.getElementById('length-choice');
  lengthChoice.addEventListener('change', function() {
    console.log('Timing was changed', parseInt(lengthChoice.value));
    TIMING['note-length'] = parseInt(lengthChoice.value);
    updateSampleNameBox(currentSample);
  })

  //sample selector
  var sampleChoice = document.getElementById('sample-choice');
  sampleChoice.addEventListener('change', function() {
    console.log('Sample was changed', sampleChoice.selectedIndex);
    currentSample = sampleChoice.selectedIndex;
    currentColour = COLOUR[parseInt(sampleChoice.selectedIndex)];
    updateSampleNameBox(currentSample);
  })

  var gridAmount = document.getElementById('grid-amount');
  gridAmount.addEventListener('change', function() {
    gridAmountToAdd = parseInt(document.getElementById("grid-amount").value);
  })

  var clearButton = document.getElementById('clear-world');
  clearButton.addEventListener('click', clearWorld);

  var slowerButton = document.getElementById('decrease-playhead-speed');
  slowerButton.addEventListener('click', decreasePlayheadSpeed);

  var invertButton = document.getElementById('invert-playhead-speed');
  invertButton.addEventListener('click', invertPlayheadSpeed);

  var resetButton = document.getElementById('reset-playhead');
  resetButton.addEventListener('click', resetPlayhead);

  var playPauseButton = document.getElementById('play-pause');
  playPauseButton.addEventListener('click', function() {
    playPause(playing);
  });

  var fasterButton = document.getElementById('increase-playhead-speed');
  fasterButton.addEventListener('click', increasePlayheadSpeed);

  var dropGrid = document.getElementById('drop-grid');
  dropGrid.addEventListener('click', function() {
    placeNotes(gridAmountToAdd);
  });


  // Keyboard Controls
  // http://www.cambiaresearch.com/articles/15/javascript-key-codes
  document.onkeypress = function(keys) {
    console.log(keys.keyCode);

    if (keys.keyCode === KEYS['t']) {
      console.log('Testing functionality');
      generateTrigger(spawnPoint, currentSample, currentColour);
    }
    //Keyboard mappings
    if (keys.keyCode === KEYS['1']) {
      currentSample = 0;
      currentColour = COLOUR[0];
      updateSampleNameBox(currentSample);
    }
    if (keys.keyCode === KEYS['2']) {
      currentSample = 1;
      currentColour = COLOUR[1];
      updateSampleNameBox(currentSample);
    }
    if (keys.keyCode === KEYS['3']) {
      currentSample = 2;
      currentColour = COLOUR[2];
      updateSampleNameBox(currentSample);
    }
    if (keys.keyCode === KEYS['4']) {
      currentSample = 3;
      currentColour = COLOUR[3];
      updateSampleNameBox(currentSample);

    }
    if (keys.keyCode === KEYS['space']) {
      playPause(playing);
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
      invertPlayheadSpeed();
      resetTriggerBodies(triggerBodyList);
    }
    if (keys.keyCode === KEYS['c']) {
      clearWorld();
    }
  }

  //trigger management
  function clearWorld() {
    Composite.clear(engine.world, keepStatic, [deep=false]);
    World.add(engine.world, MouseConstraint.create(engine));
  }

  //playhead timer
  Events.on(engine, 'beforeUpdate', function(event) {
    if(playing){
      if(counter >= POSITIONING['world-width']){
        counter = 0;
        resetTriggerBodies(triggerBodyList);
      }
      if(counter < 0){
        counter = POSITIONING['world-width'];
        resetTriggerBodies(triggerBodyList);
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
  function playPause(playing) {
    if(playing) {
      stopPlayhead()
    } else {
      startPlayhead();
    }
  }
  function resetPlayhead() {
    Body.setPosition(playhead, { x:  POSITIONING['ph-x-start'], y:POSITIONING['ph-y-start'] });
    Body.setAngle(playhead, 0);
    Body.setVelocity(playhead, { x:  0, y:0 });
    Body.setAngularVelocity(playhead, 0);
    playing = false;
    counter = 0;
    POSITIONING['playhead-speed'] = POSITIONING['playhead-start-speed'];
    resetTriggerBodies(triggerBodyList);
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


  // add all of the bodies to the world
  //World.add(engine.world, [boxA, boxB, circleA])
  World.add(engine.world, [ground, wallLeft, wallRight, playhead]);

  // set environment variables and run the engine
  var renderOptions = engine.render.options;
  renderOptions.wireframes = false;
  Engine.run(engine);
  World.add(engine.world, MouseConstraint.create(engine));
}

BangWorld = {start:start}
