var Stream = require('stream').Stream;
var util   = require('util');
var net    = require('net');

module.exports = TcpVideoStream;
util.inherits(TcpVideoStream, Stream);
function TcpVideoStream(options) {
  Stream.call(this);

  options = options || {};

  this.readable   = true;
  this._socket    = options.socket || new net.Socket;
  this._port      = options.port;
  this._ip        = options.ip;
  this._expectFIN = false;
}

TcpVideoStream.prototype.connect = function(cb) {
  cb = cb || function() {};

  this._socket.connect(this._port, this._ip);

  var self = this;
  this._socket
    .on('connect', function() {
      cb(null);
    })
    .on('data', function(buffer) {
      self.emit('data', buffer);
    })
    .on('error', function(err) {
      cb(err);
    })
    .on('end', function() {
      if (self._expectFIN) {
        self.emit('close');
        return;
      }

      var err = new Error('TcpVideoStream received FIN unexpectedly.');
      self.emit('error', err);
      self.emit('close', err);
    });
};

TcpVideoStream.prototype.end = function() {
  this._expectFIN = true;
  this._socket.end();
};
