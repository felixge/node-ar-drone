var dgram = require('dgram');
var util = require('util');
var Stream = require('stream').Stream;
var createConfig = require('../config');

var exports = module.exports = function createUdpNavdataStream(options) {
  options = options || {};
  options.socket = options.socket || dgram.createSocket('udp4');
  options.config = options.config || createConfig();
  var stream = new UdpNavdataStream(options);

  if (!options.paused) {
    stream.resume();
  }

  return stream;
};

exports.UdpNavdataStream = UdpNavdataStream;
util.inherits(UdpNavdataStream, Stream);
function UdpNavdataStream(options) {
  Stream.call(this);

  this.socket = options.socket;
  this.config = options.config;
  this.readable = true;
  this._firstResume = true;
}

UdpNavdataStream.prototype.resume = function() {
  if (this._firstResume) {
    this._firstResume = false;

    this.socket.on('message', this.emit.bind(this, 'data'));
    this.socket.bind();
  }

  var buffer = new Buffer([0x01]);
  this.socket.send(
    buffer,
    0,
    buffer.length,
    this.config.ip,
    this.config.navdataPort
  );
};
