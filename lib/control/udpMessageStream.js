var config = require('../config');
var dgram = require('dgram');

// Returns a stream-like object, no attempt at full stream compliance is made
module.exports = function udpMessageStream(options) {
  options = options || {};
  options.config = options.config || config();
  options.socket = options.socket || dgram.createSocket('udp4');

  return new UdpMessageStream(options);
};

module.exports.UdpMessageStream = UdpMessageStream;
function UdpMessageStream(options) {
  this.config = options.config;
  this.socket = options.socket;
}

UdpMessageStream.prototype.write = function(message) {
  var buffer = new Buffer(message.toString());
  this.socket.send(buffer, 0, buffer.length, this.config.atPort, this.config.ip);
};
