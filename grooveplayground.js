var groove = require('groove');
//var _      = require('lodash');
var assert = require('assert');

var playlist = groove.createPlaylist();
var player = groove.createPlayer();

//open the song
console.log('opening file');
var dunno = groove.open('music/t1.mp3', function(err, file) {
  console.log('file was opened');
  insertAndPlay(file);
});

function insertAndPlay(song) {
  //add the song
  playlist.insert(song);
  console.log('inserted song into playlist');

  //attach the playlist to the player
  player.attach(playlist, function() {
    console.log('attached playlist');
  });
}

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

//we do this when we're ready to exit
function cleanup() {
  //get the list of items from the playlist
  var files = playlist.items().map(function(item) { return item.file; });

  //clear the playlist
  playlist.clear();

  //close each file one by one (shouldn't we do that after we're done playing it?)
  files.forEach(function(file) {
    file.close(function() {
      player.detach(function(err) {
        if (err) console.error(err.stack);
      });
    });
  });
}
