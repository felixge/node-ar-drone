PngStream.TcpVideoStream = require('./TcpVideoStream');
PngStream.PngEncoder = require('./PngEncoder');

var Stream     = require('stream').Stream;
var util       = require('util');

module.exports = PngStream;
util.inherits(PngStream, Stream);
function PngStream(options) {
  console.warn('The PngStream class is deprecated. Use client.getPngStream() instead.');
  Stream.call(this);

  options = options || {};

  this.readable        = true;
  this._options        = options;
  this._tcpVideoStream = null;
  this._pngEncoder     = null;
}

PngStream.prototype.resume = function() {
  this._resume();
};

PngStream.prototype._resume = function() {
  var self = this;

  this._tcpVideoStream = new PngStream.TcpVideoStream(this._options);
  this._pngEncoder     = new PngStream.PngEncoder(this._options);

  this._tcpVideoStream.on('error', function(err) {
    self._pngEncoder.end();
    self._resume();

    if (self.listeners('error').length > 0) {
      self.emit('error', err);
    }
  });

  this._tcpVideoStream.connect();
  this._tcpVideoStream.pipe(this._pngEncoder);
  this._pngEncoder.on('data', this.emit.bind(this, 'data'));
  this._pngEncoder.on('error', this.emit.bind(this, 'error'));
};
