// Run this to receive the raw video stream from your drone as buffers.

var TcpVideoStream = require('../lib/video/TcpVideoStream');

var video = new TcpVideoStream();

console.log('Connecting ...');
video.connect(function(err) {
  if (err) throw err;

  console.log('Connected');
});

video.on('data', console.log);
