var PngStream = require('../lib/video/PngStream');

var pngStream = new PngStream();

console.log('Connecting ...');

pngStream.start();

pngStream.on('data', function(pngBuffer) {
  console.log('png', pngBuffer);
});
