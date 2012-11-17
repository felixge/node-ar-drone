// Run this to receive a png image stream from your drone.

var arDrone = require('..');
var http    = require('http');
var server  = http.createServer(function(req, res) {

  var pngStream;
  if (!pngStream) {
    pngStream = arDrone.createPngStream();
    pngStream.on('error', function (err) {
        console.error('pngStream ERROR: ' + err);
    });
  }

  var boundary = 'boundary';
  res.writeHead(200, {
    'Content-Type': 'multipart/x-mixed-replace; boundary=' + boundary
  });

  pngStream.on('data', function writePart(pngBuffer) {
    // part header
    res.write('--' + boundary + '\n');
    res.write('Content-Type: image/png\n');
    res.write('Content-length: ' + pngBuffer.length + '\n');
    res.write('\n');
    // part body
    res.write(pngBuffer);
  });
});

var port = 8080;
server.listen(port, function () {
  console.log('Serving latest png on', port);
});
