/* play several files in a row and then exit */

var groove = require('groove');
var assert = require('assert');
var Batch = require('batch'); // npm install batch

//if the user didn't at least enter one file, then they don't know what they're doing.
if (process.argv.length < 3) usage();

//init the groove playlist and groove player
var playlist = groove.createPlaylist();
var player = groove.createPlayer();

//attach an event that fires when the now playing state changes
player.on('nowplaying', function() {

  //current is an object pointing to the file unless nothing is playing
  var current = player.position();

  //cleanup if nothing is playing
  if (!current.item) {
    cleanup();
    return;
  }

  //log the just changed now playing state
  var artist = current.item.file.getMetadata('artist');
  var title = current.item.file.getMetadata('title');
  console.log("Now playing:", artist, "-", title);
});

//the batch library simply allows for the execusion of multiple tasks in parallel
var batch = new Batch();
//add a new task for each file that was passed
for (var i=2 ; i<process.argv.length ; i+=1) {
  batch.push(openFileFn(process.argv[i]));
}
//this is the function that is the task that get's executed in parallel
//basically we're opening all the files in parallel
function openFileFn(filename) {
  return function(cb) {
    groove.open(filename, cb);
  };
}
//do this when all the tasks are finished
batch.end(function(err, files) {
  files.forEach(function(file) {
    if (file) {
      playlist.insert(file);
    }
  });
  player.attach(playlist, function(err) {
    assert.ifError(err);
  });
});

//we do this when we're ready to exit
function cleanup() {
  var batch = new Batch();
  var files = playlist.items().map(function(item) { return item.file; });
  playlist.clear();
  files.forEach(function(file) {
    batch.push(function(cb) {
      file.close(cb);
    });
  });
  batch.end(function(err) {
    player.detach(function(err) {
      if (err) console.error(err.stack);
    });
  });
}

//echo usage if the user doesn't know what they're doing
function usage() {
  console.error("Usage: playlist file1 file2 ...");
  process.exit(1);
}
