var groove = require('groove');

var player = groove.createPlayer();

//attach an event that fires when the now playing state changes
player.on('nowplaying', function() {
  //current is an object pointing to the file unless nothing is playing
  var current = player.position();

  //log the just changed now playing state
  var artist = current.item.file.getMetadata('artist');
  var title = current.item.file.getMetadata('title');
  console.log("Now playing:", artist, "-", title);
});

//don't let this process go to sleep
(function wait () {
   setTimeout(wait, 1000);
})();
