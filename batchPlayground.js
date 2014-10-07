var Batch = require('batch');
var batch = new Batch();

function batchItem(x) {
  //make this take a while
  sleep(2000);
  console.log('executing batch item ' + x);
}

batch.concurrency(4);

batch.on('progress', function(e){
  console.log("progress event");
  console.dir(e);
});

batch.end(function(err){
  console.log("end batch");
  console.dir(err);
});

for(x=0 ; x<100 ; x++) {
  console.log("pushing batch item " + x);
  batch.push(batchItem(x));
}

function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}
