// Run this to receive a png image stream from your drone.

var arDrone = require('..');
var http    = require('http');

console.log('Connecting png stream ...');
var pngStream = arDrone.createPngStream();

var lastPng;
pngStream
  .on('error', console.log)
  .on('data', function (pngBuffer) {
    lastPng = pngBuffer;
  });

var server  = http.createServer(function (req, res) {
  if (!lastPng) {
    res.writeHead(503);
    res.end('Did not receive any png data yet.');
    return;
  }

  var boundary = '--boundary';
  var chunk    =  boundary + '\n' +
    'Content-Type: image/png\n' +
    'Content-length: ' + buffer.length + '\n\n';

  res.writeHead(200, {
    'Content-Type': 'multipart/x-mixed-replace; boundary=' + boundary
  });
  res.write(chunk);
  res.write(lastPng);
});

var port = 8080;
server.listen(port, function () {
  console.log('Serving latest png on', port);
});
