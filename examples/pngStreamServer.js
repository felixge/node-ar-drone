var arDrone = require('ar-drone');
var drone   = arDrone.createClient();
var http    = require('http');
var opts    = { port: 8000 };
var png     = null;
var server  = http.createServer(function(req, res) {

  var boundary = opts.boundary || '--boundary';

  if (!png) {
    png = client.createPngStream({ log : process.stderr });
    png.on('error', function (err) {
        console.error('png stream ERROR: ' + err);
    });
  }

  res.writeHead(200, {
    'Content-Type': 'multipart/x-mixed-replace; boundary=' + boundary
  });

  png.on('data', sendPng);

  function sendPng(buffer) {
    var chunk = [
      boundary,
      'Content-Type: image/png',
      'Content-length: ' + buffer.length
    ].join('\n') + '\n';

    res.write(chunk);
    res.write(buffer);
  }
});

server.listen(opts.port);
