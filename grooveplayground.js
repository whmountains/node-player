"use strict";

var groove = require('groove');
var _      = require('lodash');
var async  = require('async');
var util   = require('util');

var playlist = groove.createPlaylist();
var player = groove.createPlayer();

console.log("init'd player and playlist");

player.attach(playlist, function() {

  console.log('attached playlist');

  async.series([
    function(callback) {
      openAndAdd("music/t1.mp3", callback);
    },
    function(callback) {
      openAndAdd("music/test.ogg", callback);
    }
  ]);
});

function openAndAdd(filePath, callWhenDone) {
  //groove.open('music/test.ogg', function(err, file) {
  groove.open(filePath, function(err, file) {
    console.log('opened file: ' + filePath);

    //add the song
    playlist.insert(file);
    console.log('inserted file: ' + filePath);

    callWhenDone(null);
  });
}

//attach an event that fires when the now playing state changes
player.on('nowplaying', function() {
  //current is an object pointing to the file unless nothing is playing
  var current = player.position();
  //cleanup if nothing is playing
  if (!current.item) {
    closePlaylistFiles();
    return;
  }
  //log the just changed now playing state
  var artist = current.item.file.getMetadata('artist');
  var title = current.item.file.getMetadata('title');
  console.log("Now playing:", artist, "-", title);
});

//clear the playlist and close all the files it contains
function closePlaylistFiles(callWhenDone) {

  //get an array of file objects from the playlist
  var files = _.pick(playlist.items(), 'file');

  console.log('clearing the playlist and closing the following files:');
  console.log(
    util.inspect(
      playlist.items(),
      { showHidden: true, depth: null, colors: true}
    )
  );

  //clear the playlist
  playlist.clear();

  //close each file one by one (shouldn't we do that after we're done playing it?)
  async.each(files, function(file, callWhenDone) {
    console.log('running async each');
    console.dir(file);
    file.close(function() {
      console.log('closed a file:');
      console.dir(file);
      callWhenDone();
    });
  }, function(err) {
    if (err) {
      console.log('error unloading files: ' + err);
    }
    if (callWhenDone) { callWhenDone(null); }
  });
}

function cleanupGroove(callWhenDone) {
  player.detach(function(err) {
    if (err) {
      console.error('error detaching player');
      console.error(err.stack);
    } else {
      console.log('Detached player');
    }
    callWhenDone(null);
  });
}

function gracefulShutdown() {

  //start a new line so the ^C charachter doesn't garble the output
  console.log();
  console.log('doing a graceful shutdown');

  //setup a timer so that the program exits even if the graceful shutdown failed
  setTimeout(hardShutdown, 10000);

  //close all the files remaining in the playlist,
  //then detach the player,
  //then exit
  async.series([closePlaylistFiles, cleanupGroove], function() {
    process.exit(0);
  });
}

function hardShutdown() {
  console.warn('Doing hard shutdown because the shutdown process took too long!');
  process.exit(1);
}

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT' , gracefulShutdown);
