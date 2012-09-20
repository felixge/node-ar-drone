var Stream       = require('stream').Stream;
var util         = require('util');
var dgram        = require('dgram');
var constants    = require('../constants');
var parseNavdata = require('./parseNavdata');

module.exports = UdpNavdataStream;
util.inherits(UdpNavdataStream, Stream);
function UdpNavdataStream(options) {
  Stream.call(this);

  options = options || {};

  this.readable      = true;
  this._socket       = options.socket || dgram.createSocket('udp4');
  this._port         = options.port || constants.ports.NAVDATA;
  this._ip           = options.ip || constants.DEFAULT_DRONE_IP;
  this._initialized  = false;
  this._parseNavdata = options.parser || parseNavdata;
}

UdpNavdataStream.prototype.resume = function() {
  if (this._initialized) {
    return;
  }

  this._init();
  this._initialized = true;
};

UdpNavdataStream.prototype.destroy = function() {
  this._socket.close();
};

UdpNavdataStream.prototype._init = function() {
  var buffer = new Buffer([1]);

  this._socket.bind(this._port);
  this._socket.send(buffer, 0, buffer.length, this._port, this._ip);
  this._socket.on('message', this._handleMessage.bind(this));
};

UdpNavdataStream.prototype._handleMessage = function(buffer) {
  this.emit('data', this._parseNavdata(buffer));
};
