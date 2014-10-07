//var watch   = require('node-watch');
var walk      = require('walk-fs');
var mongojs   = require('mongojs');
var db        = mongojs("mongodb://127.0.0.1:3001/meteor", ['files']);
var groove    = require('groove');
// var minimongo = require("minimongo");
// var LocalDb   = minimongo.MemoryDb;
var _         = require('underscore');

// var tdb = new LocalDb();
// tdb.addCollection("files");

var scannedArray = [];

walk('./music', function(path, stats) {
  //get the length
  var length = getAudioLength(path);

  //add this to the files virtual db
  var pathAsArray = path.split('/');
  var filename = pathAsArray.pop();
  var parentFilename = pathAsArray.join('/');
  scannedArray.push({
    "filename": filename,
    "parentFilename": parentFilename,
    "filePath": path,
    "playTime": length
  });
  console.log(path);
}, function(err) {
  if (err) {
    console.log("error with walk function: " + err);
  }
  else applyResults();
});

function applyResults() {
  var oldArray = db.files.find().toArray();
  var newArray = _.union(scannedArray, _.intersection(scannedArray, oldArray));

  console.dir(newArray);
  console.dir(scannedArray);

  db.files.remove({});
  db.files.save(newArray);

  process.exit(1);
}

// //iterate over the existing db and remove any deleted files
// _.each(db.files.find().fetch(), function(file) {
//   //does this file exist in the filesystem
//   var parentFilename = getFileNameFromID(file.parent);
//   if (tdb.files.find({"filename": file.filename, "parentFilename": parentFilename}).count()) {
//     //file already exists
//   }
//   else {
//     //the file has been deleted
//     db.files.remove({"_id": file._id});
//   }d

//iterate over the temporary db and add any files that don't already exist
// _.each(tdb.files.find().fetch(), function(file) {
//   //does the file not already exist
//   //(we've already deleted the extraneus ones,
//   //now we just worry about adding new ones)
//   parentID =
//   if (db.files.find({"filename": file.filename, }))
// });

// function updateTree() {
//
//   var newTree = tdb.files.find().fetch();
//   var oldTree   = db.files.find().fetch();
//
//   _.each(oldTree, function(origFile) {
//     var parentFilename = getParentFilename(origFile.parent);
//     var cursor = tdb.files.find({"filename": origFile.filename, });
//   });
// }

function getAudioLength(filePath) {
  var file = groove.open(filePath, function(err, file) {
    var duration;
    if ( ! err) {
      duration = file.duration() * 1000;
    }
    else {
      duration = false;
    }

    try {
      file.close(function() {
        return duration;
      });
    }
    catch (expr) {
      return false;
    }
  });
}
