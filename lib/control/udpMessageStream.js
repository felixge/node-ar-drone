var config = require('../config');
var dgram = require('dgram');
var util = require('util');
var EventEmitter = require('events').EventEmitter;

// Returns a stream-like object, no attempt at full stream compliance is made
module.exports = function udpMessageStream(options) {
  options = options || {};
  options.config = options.config || config();
  options.socket = options.socket || dgram.createSocket('udp4');

  return new UdpMessageStream(options);
};

module.exports.UdpMessageStream = UdpMessageStream;
util.inherits(UdpMessageStream, EventEmitter);
function UdpMessageStream(options) {
  EventEmitter.call(this);

  this.config = options.config;
  this.socket = options.socket;
  this.writable = true;
}

UdpMessageStream.prototype.write = function(message) {
  var buffer = new Buffer(message.toString());
  this.socket.send(buffer, 0, buffer.length, this.config.atPort, this.config.ip);
};
