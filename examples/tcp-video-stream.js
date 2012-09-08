var TcpVideoStream = require('../lib/video/TcpVideoStream');

var video = new TcpVideoStream();

console.log('Connecting ...');
video.connect(function(err) {
  if (err) throw err;

  console.log('Connected');
});

video.on('data', function(buffer) {
  console.log(buffer);
});
