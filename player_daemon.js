var groove = require('groove');
var assert = require('assert');
var Batch  = require('batch'); // npm install batch
var batch = new Batch();
var app    = require('express')();
var http   = require('http').Server(app);
var io     = require('socket.io')(http);
_          = require('underscore');

//if the user didn't at least enter one file, then they need to be informed.
if (process.argv.length !== 3) usage();

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

//do this whenever a user connects
io.on('connection', function(socket){
  //log the new connection
  console.log('a user connected');

  //disconnect event handeler
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });

  socket.on('play file', function(filePath) {
    console.log('play file called with path: "' + filePath + '"');
  });
});

http.listen(process.argv[2], function(){
  console.log('listening on *:' + process.argv[2]);
});
//end main program flow

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

//function to stop playing
function stop() {
  player.detach(function(err){
    console.dir(err);
    cleanup();
  });
}

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
  console.error("Usage: player_daemon.js <port>");
  process.exit(1);
}
