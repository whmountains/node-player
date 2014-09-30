//var watch   = require('node-watch');
var walk      = require('walk-fs');
var mongojs   = require('mongojs');
var db        = mongojs("mongodb://127.0.0.1:3001/meteor", ['files']);
var groove    = require('groove');
var minimongo = require("minimongo");
var LocalDb   = minimongo.MemoryDb;

var tdb = new LocalDb();
tdb.addCollection("files");

walk('./music', function(path, stats) {
  //get the length
  var length = getAudioLength(path);

  //add this to the files virtual db
  var pathAsArray = path.split('/');
  var filename = pathAsArray.pop();
  var parentFilename   = new pathAsArray.pop();
  tdb.files.insert({
    "filename": filename,
    "parentFilename": filename,
    "path": path,
    "playTime": length
  });

}, function(err) {
  if ( ! err) {
    updateTree();
  }
  else console.log(err);
});

//iterate over the existing db and remove any deleted files
_.each(db.files.find().fetch(), function(file) {
  //does this file exist in the filesystem
  var parentFilename = getFileNameFromID(file.parent);
  if (tdb.files.find({"filename": file.filename, "parentFilename": parentFilename}).count) {
    //file already exists
  }
  else {
    //the file has been deleted
    db.files.remove({"_id": file._id});
  }
});

//iterate over the temporary db and add any files that don't already exist
_.each(tdb.files.find().fetch(), function(file) {
  //does the file not already exist
  //(we've already deleted the extraneus ones,
  //now we just worry about adding new ones)
  parentID =
  if (db.files.find({"filename": file.filename, }))
});

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

function getFilenameFromID(id) {

}

function getAudioLength(filePath) {
  var file = groove.open(filePath, function(err, file) {
    var duration = file.duration();
    file.close(function() {
      return duration * 1000;
    });
  });
}
