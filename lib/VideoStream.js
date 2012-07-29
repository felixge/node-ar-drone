var net         = require('net');
var Stream      = require('stream').Stream;
var util        = require('util');

module.exports = VideoStream;
util.inherits(VideoStream, Stream);
function VideoStream(options) {
  Stream.call(this);

  this.readable = true;
  this._ip      = options.ip;
  this._port    = options.port;
  this._socket  = null;
}

VideoStream.prototype.start = function() {
  // @TODO handle re-connect on error or inactivity
  this._socket = net.createConnection(this._port, this._ip);
  this._socket.setTimeout(2000);

  var self = this;
  this._socket
    .on('data', function(buffer) {
      self.emit('data', buffer);
    })
  .on('timeout', function() {
    self._socket.destroy();
    self.start();
  });
};
