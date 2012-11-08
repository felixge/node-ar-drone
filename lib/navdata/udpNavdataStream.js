var dgram = require('dgram');
var util = require('util');
var Stream = require('stream').Stream;
var createConfig = require('../config');
var createLog = require('../log');

var exports = module.exports = function createUdpNavdataStream(options) {
  options = options || {};
  options.socket = options.socket || dgram.createSocket('udp4');
  options.config = options.config || createConfig();
  options.log = options.log || createLog();

  return new UdpNavdataStream(options);
};

exports.UdpNavdataStream = UdpNavdataStream;
util.inherits(UdpNavdataStream, Stream);
function UdpNavdataStream(options) {
  Stream.call(this);

  this.connected = false;
  this.socket = options.socket;
  this.config = options.config;
  this.log = options.log;
  this.readable = true;

  this._timer = null;
  this._firstResume = true;
}

UdpNavdataStream.prototype.resume = function() {
  if (this._firstResume) {
    this._firstResume = false;

    this.socket.on('message', this.handleMessage.bind(this));
    this.socket.bind();

    this.log.write('navdata: trying to establish link');
  }

  this.requestNavdata();
};

UdpNavdataStream.prototype.requestNavdata = function() {
  var buffer = new Buffer([0x01]);
  this.socket.send(
    buffer,
    0,
    buffer.length,
    this.config.navdataPort,
    this.config.ip
  );

  this.setTimeout();
};

UdpNavdataStream.prototype.setTimeout = function() {
  clearTimeout(this._timeout);
  var self = this;

  this._timeout = setTimeout(function() {
    if (self.connected) {
      self.log.write('navdata: timeout, trying to re-establish link');
      self.connected = false;
    }

    self.requestNavdata();
  }, this.config.navdataTimeout);
};

UdpNavdataStream.prototype.handleMessage = function(buffer) {
  if (!this.connected) {
    this.log.write('navdata: established link, receiving messages');
    this.connected = true;
  }

  this.emit('data', buffer);
  this.setTimeout();
};
