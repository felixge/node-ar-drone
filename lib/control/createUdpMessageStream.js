var createConfig = require('../createConfig');
var dgram        = require('dgram');

// Returns a stream-like object, no attempt at full stream compliance is made
module.exports = function createUdpMessageStream(options) {
  options        = options || {};
  options.config = options.config || createConfig();
  options.socket = options.socket || dgram.createSocket('udp4');

  return new AtMessageUdpStream(options);
};

module.exports.AtMessageUdpStream = AtMessageUdpStream;
function AtMessageUdpStream(options) {
  this.config = options.config;
  this.socket = options.socket;
}

AtMessageUdpStream.prototype.write = function(message) {
  var buffer = new Buffer(message.toString());
  this.socket.send(buffer, 0, buffer.length, this.config.atPort, this.config.ip);
};
