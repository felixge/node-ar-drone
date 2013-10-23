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

  this.readable        = true;
  this._socket         = options.socket || dgram.createSocket('udp4');
  this._port           = options.port || constants.ports.NAVDATA;
  this._ip             = options.ip || constants.DEFAULT_DRONE_IP;
  this._initialized    = false;
  this._parseNavdata   = options.parser || parseNavdata;
  this._timeout        = options.timeout || 100;
  this._timer          = undefined;
  this._sequenceNumber = 0;
}

UdpNavdataStream.prototype.resume = function() {
  if (!this._initialized) {
    this._init();
    this._initialized = true;
  }

  this._requestNavdata();
};

UdpNavdataStream.prototype.destroy = function() {
  this._socket.close();
};

UdpNavdataStream.prototype._init = function() {
  this._socket.bind();
  this._socket.on('message', this._handleMessage.bind(this));
};

UdpNavdataStream.prototype._requestNavdata = function() {
  var buffer = new Buffer([1]);
  this._socket.send(buffer, 0, buffer.length, this._port, this._ip);

  this._setTimeout();

  // @TODO logging
};

UdpNavdataStream.prototype._setTimeout = function() {
  clearTimeout(this._timer);
  this._timer = setTimeout(this._requestNavdata.bind(this), this._timeout);
};

UdpNavdataStream.prototype._handleMessage = function(buffer) {
  var navdata = {};

  try {
    navdata = this._parseNavdata(buffer);
  } catch (err) {
    // avoid 'error' causing an exception when nobody is listening
    if (this.listeners('error').length > 0) {
      this.emit('error', err);
    }
    return;
  }

  // Ignore out of order messages
  if (navdata.sequenceNumber > this._sequenceNumber) {
    this._sequenceNumber = navdata.sequenceNumber;
    this.emit('data', navdata);
  }

  this._setTimeout();
};
