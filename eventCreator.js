var Agenda = require('agenda');
var moment = require('moment');

var agenda = new Agenda({db: { address: 'mongodb://127.0.0.1:3001/meteor'}});
var timeInFuture = 1000;

var date = moment();
date.add(timeInFuture, 'ms');

console.log('creating event for ' + date.format("dddd, MMMM Do YYYY, h:mm:ss a"));
agenda.schedule(date.toDate(), 'calendar event', {foovar: "foostring", bazvar: "bazstring"});
console.log('done creating event');

var interval = 50;

setInterval(countdown, interval);

function countdown() {
  timeInFuture = timeInFuture - interval;

  if (timeInFuture > 1) {
    console.log(timeInFuture + 'ms remaining');
  }
  else {
    process.exit(0);
  }
}
