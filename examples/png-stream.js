var arDrone = require('..');
var http    = require('http');

console.log('Connecting png stream ...');

var pngStream = arDrone.createPngStream();

var lastPng;
pngStream
  .on('connect', function() {
    console.log('Connected');
  })
  .on('disconnect', function(err) {
    console.log('Disconnected: ' + err);
  })
  .on('data', function(pngBuffer) {
    lastPng = pngBuffer;
  });

var server = http.createServer(function(req, res) {
  if (!pngStream.connected) {
    res.writeHead(503);
    res.end('PngStream is currently not connected.');
    return;
  }

  res.writeHead(200, {'Content-Type': 'image/png'});
  res.end(lastPng);
});

server.listen(8080, function() {
  console.log('Serving latest png on port 8080 ...');
});

