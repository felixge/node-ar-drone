var TcpVideoStream = require('./TcpVideoStream');
var PngSplitter    = require('../PngSplitter');
var spawn          = require('child_process').spawn;
var Stream         = require('stream').Stream;
var util           = require('util');

module.exports = PngStream;
util.inherits(PngStream, Stream);
function PngStream(options) {
  Stream.call(this);

  options = options || {};

  this.readable = true;
}

PngStream.prototype.start = function() {
};
