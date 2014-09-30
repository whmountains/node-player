var io = require("socket.io-client")('http://localhost:3000');

io.on('connect', function() {
  console.log('connected');

  io.emit('play file', 't1.mp3');
});
