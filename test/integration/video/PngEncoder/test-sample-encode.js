var common     = require('../../../common');
var fs         = require('fs');
var assert     = require('assert');
var PngEncoder = require(common.lib + '/video/PngEncoder');

if (common.isTravisCi()) {
  console.log('Skipping - travis does not have ffmpeg / apt-get ffmpeg seems to fail this test.');
  return;
}

var encoder = new PngEncoder();
var fixture = fs.createReadStream(common.fixtures + '/pave.bin');

fixture.pipe(encoder);

var pngs = [];
encoder.on('data', function(buffer) {
  pngs.push(buffer);
});


process.on('exit', function() {
  assert.equal(pngs.length, 6);

  for (var i = 0; i < pngs.length; i++) {
    var png = pngs[i];

    // Looks like a valid PNG
    assert.equal(png.toString('ascii', 1, 4), 'PNG');

    // Not the same as previous png
    assert.ok(png !== pngs[i - 1]);
  }
});
