var Agenda = require('agenda');
var agenda = new Agenda({db: { address: 'mongodb://127.0.0.1:3001/meteor'}});
agenda.processEvery('1 seconds');

var groove = require('groove');
var playlist = groove.createPlaylist();
var player = groove.createPlayer();

//attach an event that fires when the now playing state changes
player.on('nowplaying', function() {
  //current is an object pointing to the file unless nothing is playing
  var current = player.position();
  //cleanup if nothing is playing
  if (!current.item) {
    resetGroove();
    return;
  }
  //log the just changed now playing state
  var artist = current.item.file.getMetadata('artist');
  var title = current.item.file.getMetadata('title');
  console.log("Now playing:", artist, "-", title);
});

agenda.define('calendar event', {priority: 'high'}, function(job, done) {
  //pull out the data variable
  //var data = job.attrs.data;

  //output the job var to the console
  console.dir(job);

  console.log('opening file'); //open the song
  var dunno = groove.open('music/t1.mp3', function(err, file) {
    console.log('file was opened'); //do the following once the song was added

    //add the song
    playlist.insert(file);
    console.log('inserted song into playlist');

    //attach the playlist to the player
    player.attach(playlist, function() {
      console.log('attached playlist');
    });
  });

  //tell agenda that we're done so that
  //it can process another job that might be waiting on the queue
  //due to hitting the concurrency limit
  done();
});

agenda.start();
console.log('waiting for new events');

//unload all the files and clear the playlist
function resetGroove(callWhenDone) {
  console.log('resetting groove');

  //get the list of items from the playlist
  var files = playlist.items().map(function(item) { return item.file; });

  //clear the playlist
  playlist.clear();

  //close each file one by one (shouldn't we do that after we're done playing it?)
  files.forEach(function(file) {
    file.close(function() {
      player.detach(function(err) {
        if (err) console.error(err.stack);
        callWhenDone();
      });
    });
  });
}

function gracefulShutdown() {
  //do something to catch ourselves in case we crashed during shutdown
  setTimeout(hardShutdown, 5000);

  resetGroove(function() {
    agenda.stop(function() {
      process.exit();
    });
  });
}

function hardShutdown() {
  console.warn('doing hard shutdown');
  process.exit(1);
}

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT' , gracefulShutdown);
